import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "./types";

export interface WidgetBot {
  id: string;
  name: string;
  welcomeMessage: string;
  accentColor: string;
  workspaceId: string;
  plan: Plan;
  suggestedQuestions: string[];
}

// Public tokens are base64url from 16 random bytes (~22 chars).
const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;

export function isValidToken(token: string): boolean {
  return TOKEN_RE.test(token);
}

/** Resolve a public token to its bot + the workspace's plan (service role). */
export async function resolveWidgetBot(
  admin: SupabaseClient,
  token: string,
): Promise<WidgetBot | null> {
  if (!isValidToken(token)) return null;

  const { data: bot } = await admin
    .from("bots")
    .select(
      "id, name, welcome_message, accent_color, workspace_id, suggested_questions",
    )
    .eq("public_token", token)
    .single();
  if (!bot) return null;

  const { data: ws } = await admin
    .from("workspaces")
    .select("plan")
    .eq("id", bot.workspace_id)
    .single();

  return {
    id: bot.id,
    name: bot.name,
    welcomeMessage: bot.welcome_message,
    accentColor: bot.accent_color,
    workspaceId: bot.workspace_id,
    plan: (ws?.plan ?? "free") as Plan,
    suggestedQuestions: (bot.suggested_questions as string[]) ?? [],
  };
}

const RATE_LIMIT_PER_MINUTE = 20;

/**
 * Per-bot widget rate limit, counted in Postgres (no in-memory state — Vercel
 * instances are ephemeral). Counts user widget messages in the last minute.
 */
export async function widgetRateLimited(
  admin: SupabaseClient,
  botId: string,
): Promise<boolean> {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await admin
    .from("messages")
    .select("id, conversations!inner(bot_id, channel)", {
      count: "exact",
      head: true,
    })
    .eq("conversations.bot_id", botId)
    .eq("conversations.channel", "widget")
    .eq("role", "user")
    .gte("created_at", since);
  return (count ?? 0) >= RATE_LIMIT_PER_MINUTE;
}
