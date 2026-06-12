import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDocument, type ParseKind } from "./parsing";
import { chunkText } from "./chunking";
import { embedBatched } from "./embeddings";
import { getUsage, planLimit } from "./limits";
import type { DocumentRow, Plan } from "./types";

interface ProcessResult {
  status: "ready" | "error";
  chunks?: number;
  error?: string;
}

/**
 * Parse → chunk → embed → store a document, updating its status as it goes
 * (parsing → indexing → ready) so the client can show real progress. Any
 * failure lands the row in `error` with a human-readable message. Idempotent:
 * re-running clears the document's previous chunks first (used by retry).
 *
 * `db` is the RLS-scoped client (writes documents/chunks as the owner);
 * `storage` is the service-role client (reads the file from Storage).
 */
export async function processDocument(
  db: SupabaseClient,
  storage: SupabaseClient,
  documentId: string,
): Promise<ProcessResult> {
  const { data: doc } = await db
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single<DocumentRow>();
  if (!doc || !doc.storage_path) {
    return { status: "error", error: "Document not found." };
  }

  try {
    await db
      .from("documents")
      .update({ status: "parsing", error_message: null })
      .eq("id", documentId);

    const { data: blob, error: downloadError } = await storage.storage
      .from("documents")
      .download(doc.storage_path);
    if (downloadError || !blob) {
      throw new Error("We couldn't read the uploaded file. Please try again.");
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const { text, pageCount } = await parseDocument(
      doc.kind as ParseKind,
      bytes,
    );

    // Enforce the page limit against the document's real (post-parse) size,
    // so a single large file can't sail past the upload-time check.
    const { data: botRow } = await db
      .from("bots")
      .select("workspace_id, workspaces!inner(plan)")
      .eq("id", doc.bot_id)
      .single();
    if (botRow) {
      const plan = (botRow.workspaces as unknown as { plan: Plan }).plan;
      const usage = await getUsage(db, botRow.workspace_id as string);
      const otherPages = usage.pages - (doc.page_count ?? 0);
      const limit = planLimit(plan, "pages");
      if (otherPages + pageCount > limit) {
        throw new Error(
          `This document is ${pageCount} pages, which is over your plan's ${limit}-page limit. Upgrade to Pro or upload a smaller file.`,
        );
      }
    }

    await db
      .from("documents")
      .update({ page_count: pageCount, status: "indexing" })
      .eq("id", documentId);

    // Clear any previous chunks so a retry doesn't duplicate content.
    await db.from("chunks").delete().eq("document_id", documentId);

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      throw new Error("We couldn't find any text to index in this file.");
    }

    const vectors = await embedBatched(chunks.map((c) => c.content));
    const rows = chunks.map((c, i) => ({
      document_id: documentId,
      bot_id: doc.bot_id,
      content: c.content,
      token_count: c.tokenCount,
      embedding: JSON.stringify(vectors[i]),
    }));

    for (let i = 0; i < rows.length; i += 100) {
      const { error: insertError } = await db
        .from("chunks")
        .insert(rows.slice(i, i + 100));
      if (insertError) {
        console.error("chunk insert failed:", insertError);
        throw new Error("We couldn't save the indexed content. Please retry.");
      }
    }

    await db
      .from("documents")
      .update({ status: "ready", error_message: null })
      .eq("id", documentId);

    return { status: "ready", chunks: chunks.length };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Something went wrong while processing this file.";
    // An errored document consumes no pages — reset the count so a failed
    // upload doesn't inflate usage.
    await db
      .from("documents")
      .update({ status: "error", error_message: message, page_count: 0 })
      .eq("id", documentId);
    return { status: "error", error: message };
  }
}
