# Answerbase — Architecture

> Companion to PRODUCT_SPEC.md. This document makes the technical decisions so the agent doesn't have to. If reality contradicts this doc, stop and flag it instead of improvising around it.

## Stack

- **App:** Next.js (App Router) + TypeScript strict + Tailwind 4 + shadcn/ui. Single project, single Vercel deployment.
- **DB / Auth / Storage / Vectors:** Supabase (Postgres + pgvector + Auth + Storage).
- **LLM:** DeepSeek V4 Flash via **OpenRouter**, using Vercel AI SDK (`@openrouter/ai-sdk-provider`) for streaming chat. The model is configurable via `OPENROUTER_CHAT_MODEL`; the refusal behavior was re-validated against the golden set after switching from Claude Sonnet.
- **Embeddings:** via **OpenRouter's embeddings endpoint** (OpenAI-compatible `/api/v1/embeddings`), model `google/gemini-embedding-2` with `dimensions: 1536` requested explicitly — pgvector indexes cap at 2000 dims, so never use the model's native 3072. Isolated in `lib/embeddings.ts` behind a single `embed(texts: string[]): number[][]` function; `EMBEDDING_DIM = 1536` constant drives the migration. Fallback if the dimensions param doesn't pass through OpenRouter: `baai/bge-m3` (1024 dims, update the constant + re-run migration). Nothing else in the codebase may call an embeddings API directly. One OpenRouter key covers both chat and embeddings.
- **Billing:** mocked, no payment processor. The assignment permits mock billing, so there is no Stripe account, Checkout, webhook, or Customer Portal. An in-app action flips `workspaces.plan` between `free` and `pro`. The valuable, graded part — plan limits and gating — is enforced for real server-side (`lib/limits.ts`).
- **No queue infrastructure.** Document processing runs inside route handlers (`maxDuration = 60`), with status persisted in the DB and the client polling. Demo-scale documents make BullMQ-style workers unjustified complexity.

## Project structure

```
app/
  (marketing)/            # landing: /, /pricing
  (app)/                  # authed app: /dashboard, /bots/[id]/...
  w/[token]/              # widget chat page (rendered inside iframe)
  api/
    bots/ documents/ chat/        # authed API
    widget/[token]/chat/          # public widget API (token-scoped)
public/embed.js           # the one-line embed script
lib/
  embeddings.ts  rag.ts  chunking.ts  parsing.ts
  limits.ts  supabase/ (server & browser clients)
docs/                     # PRODUCT_SPEC, ARCHITECTURE, DESIGN, PLAN, CONTENT
supabase/migrations/
```

## Data model (Postgres)

```
workspaces      id, owner_id (auth.users), name, plan ('free'|'pro'),
                created_at

bots            id, workspace_id, name, welcome_message, accent_color,
                public_token (unique, url-safe), suggested_questions (jsonb),
                created_at

documents       id, bot_id, filename, kind ('pdf'|'md'|'txt'|'gap_answer'),
                status ('parsing'|'indexing'|'ready'|'error'),
                error_message, page_count, storage_path, created_at

chunks          id, document_id, bot_id, content, token_count,
                embedding vector(EMBEDDING_DIM), created_at
                + ivfflat/hnsw index on embedding

conversations   id, bot_id, channel ('app'|'widget'), created_at

messages        id, conversation_id, role ('user'|'assistant'), content,
                sources jsonb, top_similarity float, created_at

gap_questions   id, bot_id, conversation_id, question,
                status ('open'|'answered'|'dismissed'),
                answer_text, answered_at, created_at

usage           workspace_id, month ('YYYY-MM'), messages_used
                (pages are derived: sum of documents.page_count per workspace)
```

**RLS:** enabled on every table; owner-scoped via workspace. Widget/public API routes run server-side with the service-role client after resolving `public_token → bot`, never expose service keys to the client.

**Page counting:** PDF = real page count; MD/TXT = `ceil(words / 500)`.

## RAG pipeline

### Ingestion (per document)
1. Upload to Supabase Storage → create `documents` row (`parsing`).
2. Parse: PDF via `unpdf` (serverless-safe); MD/TXT as-is.
3. Chunk (`lib/chunking.ts`): split on headings first, then by size — target ~500 tokens, overlap ~80. Keep heading in chunk for context.
4. Embed in batches → insert `chunks` → status `ready`. Any failure → status `error` with a human-readable `error_message` (J1 requires visible status).

### Answering (per question)
1. Enforce limits (`lib/limits.ts`) before any model call.
2. Embed the question → similarity search top 5 chunks for this bot (RPC `match_chunks`, cosine).
3. **Refusal gate:** if top similarity < `SIMILARITY_THRESHOLD` (start at 0.35, calibrate with the golden set), skip the LLM, return the honest fallback message, log a `gap_questions` row.
4. Otherwise: stream the answer (Vercel AI SDK). System prompt rules: answer ONLY from provided context; cite which documents were used; if the context doesn't actually contain the answer, reply with the fallback phrasing. In `onFinish`, if the reply matches the refusal pattern, also log a gap question.
5. Persist message with `sources` (document names + chunk ids) and `top_similarity`.

### Gap answers → knowledge base (J4)
When the owner answers a gap question: create (or reuse) a per-bot document `kind='gap_answer'`, filename "Owner answers"; append one chunk containing `Q: ... / A: ...`, embed it, mark the gap `answered`. The bot can answer this question from now on. Gap answers count as 1 page total, not per answer.

## Onboarding & suggested questions

- `lib/intro.ts` (`generateBotIntro`) samples the bot's chunks and asks the chat model for a one-sentence welcome plus 3–5 customer-style questions; each question is validated against retrieval (dropped if it would refuse), so a shipped chip never lands on the fallback. `POST /api/bots/[id]/generate-intro` persists `bots.suggested_questions` and overwrites `welcome_message` only when it still equals the product default. Triggered when documents settle (wizard + documents panel) and on delete.
- The creation flow is a 3-step wizard at `/bots/new` (upload → personalize → try) using a lazy draft bot; it replaces the old create dialog. Suggested chips render in the wizard, the in-app test chat (empty state), and the widget (under the welcome). Chips send a normal message and disappear after the first message; owners can edit/remove/add/regenerate them on the bot page.

## Widget

- `public/embed.js` — vanilla JS, no dependencies. Renders a launcher bubble; on click injects an `iframe` pointing to `{APP_URL}/w/{token}`, plus open/close animation. Customer snippet:
  `<script src="https://.../embed.js" data-bot="PUBLIC_TOKEN" async></script>`
- The iframe page (`/w/[token]`) is a minimal chat UI: bot name, welcome message, accent color from bot config, "Powered by Answerbase" footer on the Free plan.
- iframe approach = zero CORS issues for the chat itself; `embed.js` is a static file. Parent↔iframe communication (open/close/unread) via `postMessage`.
- The widget API (`/api/widget/[token]/chat`) is unauthenticated by design, scoped by token, and protected by the workspace's message limits + basic per-token rate limiting.

## Billing (mocked)

The assignment explicitly allows mock billing, so there is no payment processor. The point we keep is real: limits and gating are enforced server-side; only the money movement is faked.

1. One plan to upgrade to: Pro, displayed at $29/mo (copy only, never charged).
2. Upgrade → a server action sets `workspaces.plan = 'pro'` directly (a mock "checkout confirmed" step), then redirects back with limits already expanded.
3. Downgrade → a server action sets `workspaces.plan = 'free'` (keeps the demo reversible).
4. The plan is read straight from `workspaces.plan`; no external source of truth, no webhook.

## Limits enforcement (`lib/limits.ts`)

One module, used by upload and chat routes:
- `PLANS` constant: bots / pages / messages per plan (from PRODUCT_SPEC).
- Server-side checks before the action; friendly 402-style JSON the UI turns into an upgrade prompt.
- UI shows usage meters; soft prompt at 80%, hard block at 100%.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY        # chat + embeddings
NEXT_PUBLIC_APP_URL
# Billing is mocked — no Stripe keys.
```

## Non-negotiables for the agent

- TypeScript strict, no `any` escapes in committed code.
- Zod validation on every API route input.
- Every async UI flow has loading / error / empty states (see PRODUCT_SPEC quality bar).
- No direct model/API calls outside `lib/` modules.
- Migrations are the only way the schema changes.
