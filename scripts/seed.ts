/**
 * Seed the demo account: a Ledgerly Bookkeeping bot with all six documents
 * ingested, two answered knowledge gaps, and one open gap to answer live in
 * the demo. Idempotent — re-running resets the demo account from scratch.
 *
 * Run: npm run seed   (node --env-file=.env.local --import tsx scripts/seed.ts)
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { processDocument } from "../lib/documents.ts";
import { embed } from "../lib/embeddings.ts";
import { LEDGERLY_DOCS, ANSWERED_GAPS, OPEN_GAP } from "./ledgerly-content.ts";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const DEMO_EMAIL = "demo@answerbase.app";
const DEMO_PASSWORD = "Demo-Answerbase-2026";

const EMERALD = rgb(0.016, 0.47, 0.34);
const INK = rgb(0.094, 0.094, 0.106);

async function renderPdf(title: string, body: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 612;
  const H = 792;
  const margin = 64;
  const maxW = W - margin * 2;

  let page = pdf.addPage([W, H]);
  let y = H - margin;

  page.drawText(title, { x: margin, y: y - 16, size: 16, font: bold, color: EMERALD });
  y -= 48;

  const drawLine = (text: string, useBold: boolean) => {
    if (y < margin + 24) {
      page = pdf.addPage([W, H]);
      y = H - margin;
    }
    page.drawText(text, {
      x: margin,
      y,
      size: 11,
      font: useBold ? bold : font,
      color: INK,
    });
    y -= 16;
  };

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trimEnd();
    if (line === "") {
      y -= 8;
      continue;
    }
    const isHeading =
      (!/[.:?]$/.test(line) && line.length < 50) || line.endsWith("?");
    const f = isHeading ? bold : font;

    // Word-wrap to the page width.
    const words = line.split(" ");
    let current = "";
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (f.widthOfTextAtSize(trial, 11) > maxW && current) {
        drawLine(current, isHeading);
        current = word;
      } else {
        current = trial;
      }
    }
    if (current) drawLine(current, isHeading);
    if (isHeading) y -= 4;
  }

  return pdf.save();
}

async function ingest(
  botId: string,
  filename: string,
  kind: "pdf" | "md",
  bytes: Uint8Array,
) {
  const { data: doc } = await admin
    .from("documents")
    .insert({ bot_id: botId, filename, kind, status: "parsing" })
    .select("id")
    .single();
  const path = `${botId}/${doc!.id}/${filename}`;
  await admin.storage.from("documents").upload(path, bytes, { upsert: true });
  await admin.from("documents").update({ storage_path: path }).eq("id", doc!.id);
  const result = await processDocument(admin, admin, doc!.id);
  console.log(`  ${filename}: ${result.status}${result.chunks ? ` (${result.chunks} chunks)` : ""}${result.error ? ` — ${result.error}` : ""}`);
}

async function ensureGapDoc(botId: string): Promise<string> {
  const { data: existing } = await admin
    .from("documents")
    .select("id")
    .eq("bot_id", botId)
    .eq("kind", "gap_answer")
    .maybeSingle();
  if (existing) return existing.id;
  const { data } = await admin
    .from("documents")
    .insert({ bot_id: botId, filename: "Owner answers", kind: "gap_answer", status: "ready", page_count: 1 })
    .select("id")
    .single();
  return data!.id;
}

async function main() {
  // Reset: remove any existing demo user (cascades to its data).
  const { data: list } = await admin.auth.admin.listUsers();
  for (const u of list.users) {
    if (u.email === DEMO_EMAIL) await admin.auth.admin.deleteUser(u.id);
  }

  // Create the demo user (pre-confirmed).
  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (userError || !created.user) throw new Error("createUser failed: " + (userError?.message ?? ""));
  const userId = created.user.id;

  await admin.from("workspaces").insert({ owner_id: userId, name: "Ledgerly Bookkeeping", plan: "free" });
  const { data: ws } = await admin.from("workspaces").select("id").eq("owner_id", userId).single();

  const { data: bot } = await admin
    .from("bots")
    .insert({
      workspace_id: ws!.id,
      name: "Ledgerly Assistant",
      welcome_message:
        "Hi! I'm Ledgerly's assistant. Ask me about our services, pricing, or deadlines.",
      accent_color: "#047857",
      public_token: randomBytes(16).toString("base64url"),
    })
    .select("id, public_token")
    .single();
  const botId = bot!.id as string;

  console.log("Ingesting documents…");
  for (const doc of LEDGERLY_DOCS) {
    const bytes =
      doc.format === "pdf"
        ? await renderPdf(doc.title, doc.body)
        : new TextEncoder().encode(`# ${doc.title}\n\n${doc.body}`);
    await ingest(botId, doc.filename, doc.format, bytes);
  }

  // Two already-answered gaps (Owner answers chunks + answered rows).
  console.log("Seeding answered gaps…");
  const gapDocId = await ensureGapDoc(botId);
  for (const g of ANSWERED_GAPS) {
    const content = `Q: ${g.question}\nA: ${g.answer}`;
    const [emb] = await embed([content]);
    await admin.from("chunks").insert({
      document_id: gapDocId,
      bot_id: botId,
      content,
      token_count: Math.ceil(content.length / 4),
      embedding: JSON.stringify(emb),
    });
    await admin.from("gap_questions").insert({
      bot_id: botId,
      question: g.question,
      status: "answered",
      answer_text: g.answer,
      answered_at: new Date().toISOString(),
    });
  }

  // One open gap (from the widget) to answer live in the demo.
  const { data: conv } = await admin
    .from("conversations")
    .insert({ bot_id: botId, channel: "widget" })
    .select("id")
    .single();
  await admin.from("gap_questions").insert({
    bot_id: botId,
    conversation_id: conv!.id,
    question: OPEN_GAP,
    status: "open",
  });

  console.log("\nSeed complete.");
  console.log(`  Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Bot public token: ${bot!.public_token}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
