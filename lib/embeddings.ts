/**
 * Embeddings — the single entry point for turning text into vectors.
 * Nothing else in the codebase may call an embeddings API directly
 * (see docs/ARCHITECTURE.md). Swapping models happens here and in the
 * migration's vector dimension, nowhere else.
 */

/** Vector dimension. Must match `vector(N)` in the Supabase migration. */
export const EMBEDDING_DIM = 1536;

/** OpenRouter, OpenAI-compatible embeddings endpoint. */
const EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";
const EMBEDDING_MODEL = "google/gemini-embedding-2";

interface OpenAIEmbeddingResponse {
  data: { embedding: number[]; index: number }[];
  error?: { message: string };
}

/**
 * Embed a batch of texts into vectors of length {@link EMBEDDING_DIM}.
 * Returns vectors in the same order as the input.
 */
export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }

  const res = await fetch(EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIM,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Embeddings request failed (${res.status} ${res.statusText}): ${body}`,
    );
  }

  const json = (await res.json()) as OpenAIEmbeddingResponse;
  if (json.error) {
    throw new Error(`Embeddings API error: ${json.error.message}`);
  }
  if (!json.data || json.data.length !== texts.length) {
    throw new Error(
      `Embeddings API returned ${json.data?.length ?? 0} vectors for ${texts.length} inputs.`,
    );
  }

  // Preserve input order regardless of how the API orders its response.
  const ordered = [...json.data].sort((a, b) => a.index - b.index);
  for (const item of ordered) {
    if (item.embedding.length !== EMBEDDING_DIM) {
      throw new Error(
        `Embedding dimension mismatch: expected ${EMBEDDING_DIM}, got ${item.embedding.length}.`,
      );
    }
  }
  return ordered.map((item) => item.embedding);
}

/** Embed many texts in batches, preserving order. */
export async function embedBatched(
  texts: string[],
  batchSize = 64,
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    out.push(...(await embed(batch)));
  }
  return out;
}
