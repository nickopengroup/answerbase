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
  suggested_questions: string[];
  created_at: string;
}

export type DocKind = "pdf" | "md" | "txt" | "gap_answer";
export type DocStatus = "parsing" | "indexing" | "ready" | "error";

export interface DocumentRow {
  id: string;
  bot_id: string;
  filename: string;
  kind: DocKind;
  status: DocStatus;
  error_message: string | null;
  page_count: number;
  storage_path: string | null;
  created_at: string;
}
