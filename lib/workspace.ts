import type { SupabaseClient } from "@supabase/supabase-js";
import type { Workspace } from "@/lib/types";

/**
 * Returns the signed-in user's workspace, creating it on first use.
 * Workspaces are created here (not via a DB trigger) so the flow doesn't
 * depend on triggers against auth.users. Idempotent and race-safe thanks to
 * the unique(owner_id) constraint (migration 0002).
 */
export async function getOrCreateWorkspace(
  supabase: SupabaseClient,
  userId: string,
): Promise<Workspace> {
  const existing = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle<Workspace>();
  if (existing.data) return existing.data;

  const created = await supabase
    .from("workspaces")
    .insert({ owner_id: userId, name: "My workspace", plan: "free" })
    .select("*")
    .maybeSingle<Workspace>();
  if (created.data) return created.data;

  // Lost a race with a concurrent request — the row now exists.
  const again = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", userId)
    .single<Workspace>();
  if (again.error) {
    throw new Error(`Could not load workspace: ${again.error.message}`);
  }
  return again.data;
}
