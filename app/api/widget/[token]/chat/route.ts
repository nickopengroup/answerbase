import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveWidgetBot, widgetRateLimited } from "@/lib/widget";
import { handleChat } from "@/lib/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  question: z.string().trim().min(1).max(2000),
});

// Public, token-scoped widget chat. Unauthenticated by design; the token
// resolves to a bot and the workspace's limits/rate limit apply.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const admin = createAdminClient();

  const bot = await resolveWidgetBot(admin, token);
  if (!bot) {
    return NextResponse.json(
      { error: "This chat isn't available." },
      { status: 404 },
    );
  }

  if (await widgetRateLimited(admin, bot.id)) {
    return NextResponse.json(
      { error: "You're sending messages too quickly. Please wait a moment." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  return handleChat({
    db: admin,
    bot: { id: bot.id, name: bot.name },
    question: parsed.data.question,
    conversationId: parsed.data.conversationId ?? null,
    channel: "widget",
  });
}
