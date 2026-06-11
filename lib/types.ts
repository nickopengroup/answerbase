/** Shared domain types. Mirrors the schema in supabase/migrations. */

export type Plan = "free" | "pro";

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  plan: Plan;
  created_at: string;
}

export interface Bot {
  id: string;
  workspace_id: string;
  name: string;
  welcome_message: string;
  accent_color: string;
  public_token: string;
  created_at: string;
}
