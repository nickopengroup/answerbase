import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { handleChat } from "@/lib/chat";
import { checkLimit, getUsage, limitedChatResponse } from "@/lib/limits";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  botId: z.string().uuid(),
  conversationId: z.string().uuid().nullable().optional(),
  question: z.string().trim().min(1).max(2000),
});

// In-app chat: authed, RLS-scoped.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { botId, conversationId, question } = parsed.data;

  const { data: bot } = await supabase
    .from("bots")
    .select("id, name, workspace_id, workspaces!inner(plan)")
    .eq("id", botId)
    .single();
  if (!bot) {
    return NextResponse.json({ error: "Bot not found." }, { status: 404 });
  }

  // Enforce the monthly message limit (server-side). Friendly, not an error.
  const plan = (bot.workspaces as unknown as { plan: Plan }).plan;
  const usage = await getUsage(supabase, bot.workspace_id as string);
  if (!checkLimit(usage, plan, "messages").allowed) {
    return limitedChatResponse(
      `You've used all ${usage.messages} messages this month. Upgrade to Pro on the Billing page to keep chatting.`,
      conversationId ?? null,
    );
  }

  return handleChat({
    db: supabase,
    bot: { id: bot.id as string, name: bot.name as string },
    question,
    conversationId: conversationId ?? null,
    channel: "app",
  });
}
