import { generateText } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chatModel, retrieve, shouldRefuse } from "./rag";

/** The product-default welcome (schema default). Only this is auto-overwritten. */
export const DEFAULT_WELCOME = "Hi! Ask me anything about our services.";

const introSchema = z.object({
  welcome: z.string().trim().min(1).max(220),
  questions: z.array(z.string().trim().min(1).max(140)).min(1).max(8),
});

export interface BotIntro {
  welcome: string | null;
  questions: string[];
}

function introPrompt(context: string): string {
  return [
    "You are setting up a help assistant for a business, based on its own documents.",
    "From the content below, produce two things:",
    '1. "welcome": ONE friendly sentence (max 20 words) that names the 2-3 main topics the assistant can help with. Tone like: "Hi! Ask me about our services, pricing, or deadlines." Plain text, no emoji, no markdown.',
    '2. "questions": exactly 5 short questions a real customer would ask, each answerable from the content, phrased the way a customer asks (not like a document heading), max ~10 words each.',
    "Write both in the SAME LANGUAGE as the content.",
    'Return ONLY valid JSON, no code fences: {"welcome": "...", "questions": ["...", "...", "...", "...", "..."]}',
    "",
    "Content:",
    context,
  ].join("\n");
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object found");
  return JSON.parse(cleaned.slice(start, end + 1));
}

/**
 * Generate a welcome message and suggested questions from a bot's documents.
 * Each question is validated against retrieval so a shipped chip never lands
 * on the refusal fallback. Degrades gracefully (returns empties) when there's
 * no content or the model output can't be parsed.
 */
export async function generateBotIntro(
  db: SupabaseClient,
  botId: string,
): Promise<BotIntro> {
  const { data: chunks } = await db
    .from("chunks")
    .select("content")
    .eq("bot_id", botId)
    .limit(40);
  const texts = (chunks ?? []).map((c) => c.content as string);
  if (texts.length === 0) {
    return { welcome: null, questions: [] };
  }

  const context = texts.join("\n\n").slice(0, 8000);

  let parsed: z.infer<typeof introSchema>;
  try {
    const { text } = await generateText({
      model: chatModel(),
      prompt: introPrompt(context),
    });
    parsed = introSchema.parse(extractJson(text));
  } catch {
    return { welcome: null, questions: [] };
  }

  // Keep only questions that actually retrieve an answer (no refusal).
  const valid: string[] = [];
  for (const q of parsed.questions) {
    if (valid.length >= 5) break;
    try {
      const r = await retrieve(db, botId, q);
      if (!shouldRefuse(r)) valid.push(q);
    } catch {
      // ignore a single bad question
    }
  }

  return { welcome: parsed.welcome, questions: valid };
}
