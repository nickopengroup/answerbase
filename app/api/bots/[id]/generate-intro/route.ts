import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_WELCOME, generateBotIntro } from "@/lib/intro";

export const runtime = "nodejs";
export const maxDuration = 60;

// Generate the welcome message + suggested questions from the bot's documents.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid bot." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  // RLS makes the bot visible only to its owner.
  const { data: bot } = await supabase
    .from("bots")
    .select("id, welcome_message")
    .eq("id", id)
    .single();
  if (!bot) {
    return NextResponse.json({ error: "Bot not found." }, { status: 404 });
  }

  const intro = await generateBotIntro(supabase, id);

  // Auto-fill the welcome only if the owner hasn't set their own.
  const overwriteWelcome =
    intro.welcome !== null && bot.welcome_message === DEFAULT_WELCOME;
  const update: Record<string, unknown> = {
    suggested_questions: intro.questions,
  };
  if (overwriteWelcome) update.welcome_message = intro.welcome;

  await supabase.from("bots").update(update).eq("id", id);

  return NextResponse.json({
    questions: intro.questions,
    welcome: overwriteWelcome ? intro.welcome : bot.welcome_message,
  });
}
