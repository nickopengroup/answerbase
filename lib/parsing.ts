import { extractText, getDocumentProxy } from "unpdf";

export type ParseKind = "pdf" | "md" | "txt";

export interface ParsedDocument {
  text: string;
  pageCount: number;
}

/** Map a filename to a supported kind, or null if unsupported. */
export function kindFromFilename(filename: string): ParseKind | null {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "txt") return "txt";
  return null;
}

/**
 * Extract plain text and a page count from an uploaded document.
 * - PDF: real text + page count via unpdf (serverless-safe pdf.js build).
 * - MD/TXT: the raw text; pages estimated as ceil(words / 500).
 * Throws a human-readable error if no text can be extracted.
 */
export async function parseDocument(
  kind: ParseKind,
  bytes: Uint8Array,
): Promise<ParsedDocument> {
  if (kind === "pdf") {
    let totalPages: number;
    let text: string;
    try {
      const pdf = await getDocumentProxy(bytes);
      ({ totalPages, text } = await extractText(pdf, { mergePages: true }));
    } catch {
      throw new Error(
        "We couldn't read this file. It may be corrupted or password-protected.",
      );
    }
    const clean = text.trim();
    if (!clean) {
      throw new Error(
        "We couldn't read any text from this PDF. If it's a scanned image, it won't work yet.",
      );
    }
    return { text: clean, pageCount: totalPages };
  }

  const clean = new TextDecoder().decode(bytes).trim();
  if (!clean) {
    throw new Error("This file looks empty. Please upload a file with text.");
  }
  const words = clean.split(/\s+/).filter(Boolean).length;
  return { text: clean, pageCount: Math.max(1, Math.ceil(words / 500)) };
}
