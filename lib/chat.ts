import { streamText } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildSystemPrompt,
  chatModel,
  FALLBACK_MESSAGE,
  isRefusal,
  retrieve,
  shouldRefuse,
} from "./rag";

/**
 * The shared answering engine used by both the in-app chat and the public
 * widget. The caller supplies the Supabase client (RLS-scoped for the app,
 * service-role for the widget after resolving the token) and the bot.
 *
 * Sources and the refused flag are returned in an `x-chat-meta` header (known
 * before streaming); the answer is the streamed body.
 */
function metaHeaders(meta: unknown): Record<string, string> {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "x-chat-meta": encodeURIComponent(JSON.stringify(meta)),
  };
}

export async function handleChat(opts: {
  db: SupabaseClient;
  bot: { id: string; name: string };
  question: string;
  conversationId: string | null;
  channel: "app" | "widget";
}): Promise<Response> {
  const { db, bot, question, channel } = opts;

  let conversationId = opts.conversationId;
  if (!conversationId) {
    const { data: conv } = await db
      .from("conversations")
      .insert({ bot_id: bot.id, channel })
      .select("id")
      .single();
    conversationId = conv?.id ?? null;
  }
  if (!conversationId) {
    return new Response("We couldn't start the chat. Please try again.", {
      status: 500,
    });
  }
  const convoId: string = conversationId;

  await db
    .from("messages")
    .insert({ conversation_id: convoId, role: "user", content: question });

  const retrieval = await retrieve(db, bot.id, question);
  const refuse = shouldRefuse(retrieval);

  const meta = {
    conversationId: convoId,
    topSimilarity: retrieval.topSimilarity,
    refused: refuse,
    sources: refuse ? [] : retrieval.sources.map((s) => s.name),
  };

  // Refusal gate: skip the LLM, answer honestly, log the gap.
  if (refuse) {
    await db.from("messages").insert({
      conversation_id: convoId,
      role: "assistant",
      content: FALLBACK_MESSAGE,
      sources: [],
      top_similarity: retrieval.topSimilarity,
    });
    await db.from("gap_questions").insert({
      bot_id: bot.id,
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
      await db.from("messages").insert({
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
        await db.from("gap_questions").insert({
          bot_id: bot.id,
          conversation_id: convoId,
          question,
          status: "open",
        });
      }
    },
  });

  return result.toTextStreamResponse({ headers: metaHeaders(meta) });
}
