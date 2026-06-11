-- Answerbase — migration 0002: auto-create a workspace on user signup.
-- One workspace per owner (MVP); a trigger creates it atomically so the app
-- never has to special-case "first login".

-- Exactly one workspace per user.
alter table workspaces
  add constraint workspaces_owner_id_unique unique (owner_id);

-- Create the workspace as the auth user is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspaces (owner_id, name, plan)
  values (new.id, 'My workspace', 'free')
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
