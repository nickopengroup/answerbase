/**
 * Phase 2 verification. Runs the real ingestion pipeline (parse → chunk →
 * embed → store) against Supabase and proves:
 *  - a Markdown file reaches `ready` with chunks that carry 1536-dim embeddings
 *  - a 5-page PDF reaches `ready` with page_count === 5
 *  - an unsupported type (.docx) is rejected by validation
 *  - a corrupted file lands in `error` with a readable message
 *
 * Requires email confirmation OFF. Makes real embedding calls (cheap).
 * Run: node --env-file=.env.local scripts/verify-phase2.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processDocument } from "../lib/documents.ts";
import { kindFromFilename } from "../lib/parsing.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

// Minimal valid multi-page PDF with one line of text per page.
function makePdf(pages: string[]): Buffer {
  const n = pages.length;
  const objects: string[] = [];
  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const pageIds = pages.map((_, i) => 4 + i * 2);
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${n} >>\nendobj\n`;
  objects[3] =
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  pages.forEach((t, i) => {
    const pid = 4 + i * 2;
    const cid = 5 + i * 2;
    objects[pid] = `${pid} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${cid} 0 R >>\nendobj\n`;
    const stream = `BT /F1 24 Tf 72 700 Td (${t.replace(
      /([()\\])/g,
      "\\$1",
    )}) Tj ET`;
    objects[cid] = `${cid} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  const maxId = 3 + n * 2;
  for (let id = 1; id <= maxId; id++) {
    offsets[id] = Buffer.byteLength(pdf, "latin1");
    pdf += objects[id];
  }
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  const count = maxId + 1;
  pdf += `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id++) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

async function ingest(
  db: ReturnType<typeof createClient>,
  botId: string,
  filename: string,
  kind: "pdf" | "md" | "txt",
  bytes: Buffer,
) {
  const { data: doc } = await db
    .from("documents")
    .insert({ bot_id: botId, filename, kind, status: "parsing" })
    .select("id")
    .single();
  const id = doc!.id as string;
  const path = `${botId}/${id}/${filename}`;
  await admin.storage.from("documents").upload(path, bytes, { upsert: true });
  await db.from("documents").update({ storage_path: path }).eq("id", id);
  const result = await processDocument(db, admin, id);
  return { id, result };
}

async function main() {
  // Validation unit: unsupported types are rejected before any work.
  check("'.docx' is rejected by validation", kindFromFilename("notes.docx") === null);
  check("'.pdf' maps to pdf", kindFromFilename("a.PDF") === "pdf");

  // A signed-in user + workspace + bot.
  const user = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `phase2-${Date.now()}@answerbase.test`;
  const { data: signUp, error: suErr } = await user.auth.signUp({
    email,
    password: "supersecret123",
  });
  if (suErr || !signUp.session) {
    throw new Error(
      "signUp failed (is email confirmation off?): " + (suErr?.message ?? ""),
    );
  }
  const userId = signUp.user!.id;
  await user
    .from("workspaces")
    .insert({ owner_id: userId, name: "W", plan: "free" });
  const { data: ws } = await user
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .single();
  const { data: bot } = await user
    .from("bots")
    .insert({
      workspace_id: ws!.id,
      name: "Test bot",
      welcome_message: "Hi",
      accent_color: "#047857",
      public_token: randomBytes(16).toString("base64url"),
    })
    .select("id")
    .single();
  const botId = bot!.id as string;

  // Markdown → ready with embedded chunks.
  const md = `# Pricing

Our Essential plan is $399 per month and includes monthly bookkeeping.

## Deadlines

Documents are due by the 5th business day. Reports arrive by the 20th.

## Support

We reply to questions within one business day.`;
  const mdOut = await ingest(
    user,
    botId,
    "pricing.md",
    "md",
    Buffer.from(md, "utf8"),
  );
  check(
    "markdown reaches ready",
    mdOut.result.status === "ready",
    mdOut.result.error ?? "",
  );
  const { data: mdChunks } = await user
    .from("chunks")
    .select("id, embedding")
    .eq("document_id", mdOut.id);
  check("markdown produced chunks", (mdChunks?.length ?? 0) > 0, `${mdChunks?.length} chunks`);
  let dim = 0;
  if (mdChunks?.[0]?.embedding) {
    const e = mdChunks[0].embedding;
    dim = Array.isArray(e) ? e.length : JSON.parse(e as string).length;
  }
  check("chunk embedding has 1536 dims", dim === 1536, `dim ${dim}`);

  // 5-page PDF → ready with page_count 5.
  const pdf = makePdf([
    "Ledgerly page one services overview",
    "Page two pricing details and plans",
    "Page three onboarding steps",
    "Page four tax deadlines calendar",
    "Page five billing and payment terms",
  ]);
  const pdfOut = await ingest(user, botId, "guide.pdf", "pdf", pdf);
  check(
    "pdf reaches ready",
    pdfOut.result.status === "ready",
    pdfOut.result.error ?? "",
  );
  const { data: pdfDoc } = await user
    .from("documents")
    .select("page_count")
    .eq("id", pdfOut.id)
    .single();
  check("pdf page_count is 5", pdfDoc?.page_count === 5, `got ${pdfDoc?.page_count}`);

  // Corrupted PDF → error with a message.
  const badOut = await ingest(
    user,
    botId,
    "broken.pdf",
    "pdf",
    Buffer.from("%PDF-1.4 this is not a real pdf", "utf8"),
  );
  check(
    "corrupted file lands in error",
    badOut.result.status === "error",
    badOut.result.error ?? "",
  );

  // Cleanup.
  await admin.auth.admin.deleteUser(userId);
  console.log("\nCleaned up test user.");
  console.log(
    failures === 0
      ? "\nAll Phase 2 checks passed."
      : `\n${failures} check(s) failed.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nVerification crashed:");
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
