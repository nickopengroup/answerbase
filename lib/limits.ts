import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "./types";

/** Plan limits (from docs/PRODUCT_SPEC.md). */
export const PLANS = {
  free: { bots: 1, pages: 20, messages: 100 },
  pro: { bots: 3, pages: 500, messages: 2000 },
} as const;

export const PRO_PRICE = "$29/mo";

export type LimitKey = "bots" | "pages" | "messages";

export function planLimit(plan: Plan, key: LimitKey): number {
  return PLANS[plan][key];
}

/** Current month as 'YYYY-MM' (UTC). */
export function currentMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStartIso(now: Date = new Date()): string {
  return `${currentMonth(now)}-01T00:00:00.000Z`;
}

export interface Usage {
  bots: number;
  pages: number;
  messages: number;
}

/**
 * Compute usage by querying directly (no counter table, so no increment
 * races): bots counted, pages summed from documents, messages counted from
 * this month's user messages across the workspace's bots.
 */
export async function getUsage(
  db: SupabaseClient,
  workspaceId: string,
): Promise<Usage> {
  const { count: bots } = await db
    .from("bots")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const { data: docs } = await db
    .from("documents")
    .select("page_count, bots!inner(workspace_id)")
    .eq("bots.workspace_id", workspaceId);
  const pages = (docs ?? []).reduce(
    (sum, d) => sum + ((d.page_count as number) ?? 0),
    0,
  );

  const { count: messages } = await db
    .from("messages")
    .select("id, conversations!inner(bots!inner(workspace_id))", {
      count: "exact",
      head: true,
    })
    .eq("conversations.bots.workspace_id", workspaceId)
    .eq("role", "user")
    .gte("created_at", monthStartIso());

  return { bots: bots ?? 0, pages, messages: messages ?? 0 };
}

export interface LimitCheck {
  allowed: boolean;
  used: number;
  limit: number;
}

export function checkLimit(
  usage: Usage,
  plan: Plan,
  key: LimitKey,
): LimitCheck {
  const limit = planLimit(plan, key);
  return { allowed: usage[key] < limit, used: usage[key], limit };
}

/**
 * A chat response for a hit message limit — same wire format as a normal
 * answer (plain text + x-chat-meta), so the client renders it as a calm bot
 * message rather than an error.
 */
export function limitedChatResponse(
  message: string,
  conversationId: string | null,
): Response {
  const meta = { conversationId, refused: true, limited: true, sources: [] };
  return new Response(message, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-chat-meta": encodeURIComponent(JSON.stringify(meta)),
    },
  });
}
