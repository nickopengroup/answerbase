import { streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  buildSystemPrompt,
  chatModel,
  FALLBACK_MESSAGE,
  isRefusal,
  retrieve,
  shouldRefuse,
} from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  botId: z.string().uuid(),
  conversationId: z.string().uuid().nullable().optional(),
  question: z.string().trim().min(1).max(2000),
});

function metaHeaders(meta: unknown): Record<string, string> {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "x-chat-meta": encodeURIComponent(JSON.stringify(meta)),
  };
}

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
  const { botId, question } = parsed.data;

  const { data: bot } = await supabase
    .from("bots")
    .select("id, name")
    .eq("id", botId)
    .single();
  if (!bot) {
    return NextResponse.json({ error: "Bot not found." }, { status: 404 });
  }

  // Get or create the conversation for this chat session.
  let conversationId = parsed.data.conversationId ?? null;
  if (!conversationId) {
    const { data: conv } = await supabase
      .from("conversations")
      .insert({ bot_id: botId, channel: "app" })
      .select("id")
      .single();
    conversationId = conv?.id ?? null;
  }
  if (!conversationId) {
    return NextResponse.json(
      { error: "We couldn't start the chat. Please try again." },
      { status: 500 },
    );
  }
  const convoId: string = conversationId;

  await supabase
    .from("messages")
    .insert({ conversation_id: convoId, role: "user", content: question });

  const retrieval = await retrieve(supabase, botId, question);
  const refuse = shouldRefuse(retrieval);

  const meta = {
    conversationId: convoId,
    topSimilarity: retrieval.topSimilarity,
    refused: refuse,
    sources: refuse ? [] : retrieval.sources.map((s) => s.name),
  };

  // Refusal gate: do NOT call the LLM. Honest fallback + log a knowledge gap.
  if (refuse) {
    await supabase.from("messages").insert({
      conversation_id: convoId,
      role: "assistant",
      content: FALLBACK_MESSAGE,
      sources: [],
      top_similarity: retrieval.topSimilarity,
    });
    await supabase.from("gap_questions").insert({
      bot_id: botId,
      conversation_id: convoId,
      question,
      status: "open",
    });
    return new Response(FALLBACK_MESSAGE, { headers: metaHeaders(meta) });
  }

  const result = streamText({
    model: chatModel(),
    system: buildSystemPrompt(bot.name, retrieval.chunks),
    prompt: question,
    onFinish: async ({ text }) => {
      const refusedAnyway = isRefusal(text);
      await supabase.from("messages").insert({
        conversation_id: convoId,
        role: "assistant",
        content: text,
        sources: refusedAnyway
          ? []
          : retrieval.sources.map((s) => ({
              name: s.name,
              documentId: s.documentId,
            })),
        top_similarity: retrieval.topSimilarity,
      });
      if (refusedAnyway) {
        await supabase.from("gap_questions").insert({
          bot_id: botId,
          conversation_id: convoId,
          question,
          status: "open",
        });
      }
    },
  });

  return result.toTextStreamResponse({ headers: metaHeaders(meta) });
}
