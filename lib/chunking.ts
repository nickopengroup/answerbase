/**
 * Split document text into overlapping chunks for embedding.
 * Strategy: keep markdown headings attached to the text that follows them,
 * pack paragraphs up to a target size, and carry a small overlap between
 * chunks so a fact split across a boundary is still retrievable.
 *
 * Sizes are in characters using a ~4 chars/token estimate:
 * target ~500 tokens (2000 chars), overlap ~80 tokens (320 chars).
 */

const TARGET_CHARS = 2000;
const OVERLAP_CHARS = 320;

export interface TextChunk {
  content: string;
  tokenCount: number;
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function tail(text: string, chars: number): string {
  if (text.length <= chars) return text;
  // Start the overlap at a word boundary for readability.
  const slice = text.slice(text.length - chars);
  const space = slice.indexOf(" ");
  return space > 0 ? slice.slice(space + 1) : slice;
}

function hardSplit(text: string): string[] {
  const pieces: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + TARGET_CHARS, text.length);
    pieces.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - OVERLAP_CHARS;
  }
  return pieces.filter(Boolean);
}

export function chunkText(text: string): TextChunk[] {
  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!clean) return [];

  const paragraphs = clean
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: TextChunk[] = [];
  let buffer = "";

  const flush = () => {
    const content = buffer.trim();
    if (content) chunks.push({ content, tokenCount: estimateTokens(content) });
  };

  for (const para of paragraphs) {
    // A single oversized paragraph is split on its own.
    if (para.length > TARGET_CHARS) {
      if (buffer.trim()) {
        flush();
        buffer = "";
      }
      for (const piece of hardSplit(para)) {
        chunks.push({ content: piece, tokenCount: estimateTokens(piece) });
      }
      continue;
    }

    if (buffer && buffer.length + para.length + 2 > TARGET_CHARS) {
      flush();
      buffer = tail(buffer, OVERLAP_CHARS) + "\n\n";
    }
    buffer += (buffer ? "\n\n" : "") + para;
  }
  flush();

  return chunks;
}
