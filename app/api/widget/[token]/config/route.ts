import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveWidgetBot } from "@/lib/widget";

export const runtime = "nodejs";

// Public config for the launcher. Fetched by embed.js from the customer's
// site, so it must allow cross-origin reads.
const CORS = { "Access-Control-Allow-Origin": "*" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const bot = await resolveWidgetBot(createAdminClient(), token);
  if (!bot) {
    return NextResponse.json(
      { error: "Unknown widget." },
      { status: 404, headers: CORS },
    );
  }
  return NextResponse.json(
    {
      name: bot.name,
      welcomeMessage: bot.welcomeMessage,
      accentColor: bot.accentColor,
      plan: bot.plan,
      suggestedQuestions: bot.suggestedQuestions,
    },
    { headers: CORS },
  );
}
