import type { SupabaseClient } from "@supabase/supabase-js";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { embed } from "./embeddings";

/**
 * Retrieval-augmented answering. The bot answers ONLY from a bot's own
 * document chunks. When nothing retrieved is similar enough, it refuses
 * honestly (no LLM call) and the question is logged as a knowledge gap.
 */

// Cosine similarity below this skips the LLM and refuses outright.
// Golden-set calibration (Phase 8) showed in-scope (0.63–0.84) and off-topic
// (0.60–0.71) similarities OVERLAP, so no single threshold separates them.
// The robust refusal layer is the system prompt: the model is given the
// context and instructed to return the fallback when the answer isn't there
// (caught by isRefusal and logged as a gap). So the gate is deliberately LOW
// (0.45) — it only hard-refuses clearly-unrelated questions, which keeps the
// real risk for a demo (wrongly refusing a legitimately phrased question) low.
// Env-overridable. Golden set stays 15/15 in-scope, 5/5 out-of-scope.
export const SIMILARITY_THRESHOLD = Number(
  process.env.SIMILARITY_THRESHOLD ?? 0.45,
);

export const FALLBACK_MESSAGE =
  "I don't have this in the knowledge base yet. The team has been notified.";

const CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL ?? "deepseek/deepseek-v4-flash";

export interface RetrievedChunk {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

export interface Source {
  documentId: string;
  name: string;
}

export interface Retrieval {
  chunks: RetrievedChunk[];
  topSimilarity: number;
  sources: Source[];
}

/** Embed the question and fetch the top matching chunks for this bot. */
export async function retrieve(
  db: SupabaseClient,
  botId: string,
  question: string,
): Promise<Retrieval> {
  const [embedding] = await embed([question]);
  const { data, error } = await db.rpc("match_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_bot_id: botId,
    match_count: 5,
  });
  if (error) {
    throw new Error(`Retrieval failed: ${error.message}`);
  }

  const chunks = (data ?? []) as RetrievedChunk[];
  const topSimilarity = chunks[0]?.similarity ?? 0;

  // Resolve document names (for source chips), in order of first appearance.
  const docIds = [...new Set(chunks.map((c) => c.document_id))];
  let sources: Source[] = [];
  if (docIds.length > 0) {
    const { data: docs } = await db
      .from("documents")
      .select("id, filename")
      .in("id", docIds);
    const nameById = new Map(
      (docs ?? []).map((d) => [d.id as string, d.filename as string]),
    );
    sources = docIds.map((id) => ({
      documentId: id,
      name: nameById.get(id) ?? "Document",
    }));
  }

  return { chunks, topSimilarity, sources };
}

/** True when retrieval is too weak to answer — refuse instead of guessing. */
export function shouldRefuse(retrieval: Retrieval): boolean {
  return (
    retrieval.chunks.length === 0 ||
    retrieval.topSimilarity < SIMILARITY_THRESHOLD
  );
}

export function buildSystemPrompt(
  botName: string,
  chunks: RetrievedChunk[],
): string {
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join("\n\n");

  return [
    `You are ${botName}, a helpful assistant answering questions for a company's clients.`,
    `Answer using ONLY the context below. Never use outside knowledge or guess.`,
    `If the context does not contain the answer, reply with exactly this and nothing else: "${FALLBACK_MESSAGE}"`,
    `Be concise and friendly, written for a non-technical reader. Do not mention "context", "sources", documents, or that you are an AI.`,
    `Write in plain sentences. Do not use markdown formatting, bold, bullet symbols, or emoji.`,
    ``,
    `Context:`,
    context,
  ].join("\n");
}

/** Detect the honest fallback in a model reply (for gap logging). */
export function isRefusal(text: string): boolean {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .includes("dont have this in the knowledge base");
}

/** The OpenRouter chat model used for answering. */
export function chatModel() {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
  return openrouter.chat(CHAT_MODEL);
}
