-- Answerbase — migration 0001: initial schema, pgvector, match_chunks RPC, RLS.
-- See docs/ARCHITECTURE.md (data model + RAG pipeline). EMBEDDING_DIM = 1536.

-- ---------------------------------------------------------------------------
-- Extensions
-- On Supabase the vector extension lives in the `extensions` schema; install
-- it there and put that schema on the search path so vector(N), the cosine
-- operator (<=>), and vector_cosine_ops all resolve below.
-- ---------------------------------------------------------------------------
create extension if not exists vector with schema extensions;
set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table workspaces (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'My workspace',
  plan       text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table bots (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces (id) on delete cascade,
  name            text not null,
  welcome_message text not null default 'Hi! Ask me anything about our services.',
  accent_color    text not null default '#047857',
  public_token    text not null unique,
  created_at      timestamptz not null default now()
);

create table documents (
  id            uuid primary key default gen_random_uuid(),
  bot_id        uuid not null references bots (id) on delete cascade,
  filename      text not null,
  kind          text not null check (kind in ('pdf', 'md', 'txt', 'gap_answer')),
  status        text not null default 'parsing'
                  check (status in ('parsing', 'indexing', 'ready', 'error')),
  error_message text,
  page_count    integer not null default 0,
  storage_path  text,
  created_at    timestamptz not null default now()
);

create table chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  bot_id      uuid not null references bots (id) on delete cascade,
  content     text not null,
  token_count integer,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);

create table conversations (
  id         uuid primary key default gen_random_uuid(),
  bot_id     uuid not null references bots (id) on delete cascade,
  channel    text not null check (channel in ('app', 'widget')),
  created_at timestamptz not null default now()
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  sources         jsonb,
  top_similarity  double precision,
  created_at      timestamptz not null default now()
);

create table gap_questions (
  id              uuid primary key default gen_random_uuid(),
  bot_id          uuid not null references bots (id) on delete cascade,
  conversation_id uuid references conversations (id) on delete set null,
  question        text not null,
  status          text not null default 'open'
                    check (status in ('open', 'answered', 'dismissed')),
  answer_text     text,
  answered_at     timestamptz,
  created_at      timestamptz not null default now()
);

create table usage (
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  month         text not null, -- 'YYYY-MM'
  messages_used integer not null default 0,
  primary key (workspace_id, month)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index bots_workspace_id_idx on bots (workspace_id);
create index documents_bot_id_idx on documents (bot_id);
create index chunks_bot_id_idx on chunks (bot_id);
create index chunks_document_id_idx on chunks (document_id);
create index conversations_bot_id_idx on conversations (bot_id);
create index messages_conversation_id_idx on messages (conversation_id);
create index gap_questions_bot_id_idx on gap_questions (bot_id);

-- Approximate nearest-neighbour index for cosine similarity search.
create index chunks_embedding_idx
  on chunks using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- Ownership helpers (SECURITY DEFINER so RLS policies stay simple and
-- avoid recursive policy evaluation).
-- ---------------------------------------------------------------------------
create or replace function public.user_owns_workspace(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from workspaces w
    where w.id = ws and w.owner_id = auth.uid()
  );
$$;

create or replace function public.user_owns_bot(b uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from bots bt
    join workspaces w on w.id = bt.workspace_id
    where bt.id = b and w.owner_id = auth.uid()
  );
$$;

create or replace function public.user_owns_conversation(c uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from conversations cv
    join bots bt on bt.id = cv.bot_id
    join workspaces w on w.id = bt.workspace_id
    where cv.id = c and w.owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Similarity search RPC (cosine). Caller is responsible for authorizing
-- match_bot_id (app routes check ownership; widget routes resolve the token
-- server-side). SECURITY DEFINER keeps search behind a single entry point.
-- ---------------------------------------------------------------------------
create or replace function public.match_chunks(
  query_embedding vector(1536),
  match_bot_id uuid,
  match_count int default 5
)
returns table (
  id          uuid,
  document_id uuid,
  content     text,
  similarity  double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  where c.bot_id = match_bot_id
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security — owner-scoped via workspace. Public/widget access goes
-- through the service-role client server-side, which bypasses RLS by design.
-- ---------------------------------------------------------------------------
alter table workspaces   enable row level security;
alter table bots         enable row level security;
alter table documents    enable row level security;
alter table chunks        enable row level security;
alter table conversations enable row level security;
alter table messages      enable row level security;
alter table gap_questions enable row level security;
alter table usage         enable row level security;

-- workspaces: owner only
create policy workspaces_owner_all on workspaces
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- bots: via owned workspace
create policy bots_owner_all on bots
  for all to authenticated
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

-- documents: via owned bot
create policy documents_owner_all on documents
  for all to authenticated
  using (public.user_owns_bot(bot_id))
  with check (public.user_owns_bot(bot_id));

-- chunks: via owned bot
create policy chunks_owner_all on chunks
  for all to authenticated
  using (public.user_owns_bot(bot_id))
  with check (public.user_owns_bot(bot_id));

-- conversations: via owned bot
create policy conversations_owner_all on conversations
  for all to authenticated
  using (public.user_owns_bot(bot_id))
  with check (public.user_owns_bot(bot_id));

-- messages: via owned conversation
create policy messages_owner_all on messages
  for all to authenticated
  using (public.user_owns_conversation(conversation_id))
  with check (public.user_owns_conversation(conversation_id));

-- gap_questions: via owned bot
create policy gap_questions_owner_all on gap_questions
  for all to authenticated
  using (public.user_owns_bot(bot_id))
  with check (public.user_owns_bot(bot_id));

-- usage: via owned workspace
create policy usage_owner_all on usage
  for all to authenticated
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded documents (private; accessed via service role).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
