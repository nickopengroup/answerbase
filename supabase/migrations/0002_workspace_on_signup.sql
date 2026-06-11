-- Answerbase — migration 0002: one workspace per owner.
-- Workspace creation itself is handled in the app (get-or-create on first
-- authed request) rather than a trigger on auth.users: creating triggers on
-- auth.users is restricted on Supabase and not worth the fragility. This
-- constraint keeps the "one workspace per user" invariant and makes the
-- app's get-or-create race-safe via ON CONFLICT. Safe to re-run.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'workspaces_owner_id_unique'
  ) then
    alter table workspaces
      add constraint workspaces_owner_id_unique unique (owner_id);
  end if;
end $$;
