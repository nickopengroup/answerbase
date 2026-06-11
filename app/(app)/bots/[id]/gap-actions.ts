"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/embeddings";

const answerSchema = z.object({
  gapId: z.string().uuid(),
  answer: z.string().trim().min(1, "Write an answer.").max(2000),
});

export type GapActionState = { error?: string };

/**
 * Answer a knowledge gap: append the Q/A as an embedded chunk to the bot's
 * "Owner answers" document (created on first use), then mark the gap answered.
 * The bot can answer this question from now on. J4 in PRODUCT_SPEC.
 */
export async function answerGap(
  gapId: string,
  answer: string,
): Promise<GapActionState> {
  const parsed = answerSchema.safeParse({ gapId, answer });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data: gap } = await supabase
    .from("gap_questions")
    .select("id, bot_id, question, status")
    .eq("id", gapId)
    .single();
  if (!gap) {
    return { error: "This question no longer exists." };
  }

  // Get or create the bot's "Owner answers" document (counts as 1 page total).
  let { data: gapDoc } = await supabase
    .from("documents")
    .select("id")
    .eq("bot_id", gap.bot_id)
    .eq("kind", "gap_answer")
    .maybeSingle();
  if (!gapDoc) {
    const { data: created, error: docError } = await supabase
      .from("documents")
      .insert({
        bot_id: gap.bot_id,
        filename: "Owner answers",
        kind: "gap_answer",
        status: "ready",
        page_count: 1,
      })
      .select("id")
      .single();
    if (docError || !created) {
      return { error: "We couldn't save your answer. Please try again." };
    }
    gapDoc = created;
  }

  const content = `Q: ${gap.question}\nA: ${parsed.data.answer}`;
  let embedding: number[];
  try {
    [embedding] = await embed([content]);
  } catch {
    return { error: "We couldn't index your answer. Please try again." };
  }

  const { error: chunkError } = await supabase.from("chunks").insert({
    document_id: gapDoc.id,
    bot_id: gap.bot_id,
    content,
    token_count: Math.ceil(content.length / 4),
    embedding: JSON.stringify(embedding),
  });
  if (chunkError) {
    return { error: "We couldn't save your answer. Please try again." };
  }

  await supabase
    .from("gap_questions")
    .update({
      status: "answered",
      answer_text: parsed.data.answer,
      answered_at: new Date().toISOString(),
    })
    .eq("id", gapId);

  revalidatePath(`/bots/${gap.bot_id}`);
  return {};
}

export async function dismissGap(gapId: string): Promise<GapActionState> {
  if (!z.string().uuid().safeParse(gapId).success) {
    return { error: "This question no longer exists." };
  }
  const supabase = await createClient();
  const { data: gap } = await supabase
    .from("gap_questions")
    .select("bot_id")
    .eq("id", gapId)
    .single();

  await supabase
    .from("gap_questions")
    .update({ status: "dismissed" })
    .eq("id", gapId);

  if (gap) revalidatePath(`/bots/${gap.bot_id}`);
  return {};
}
