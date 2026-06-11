/**
 * Phase 3 verification. Ingests a small Ledgerly knowledge base, then proves:
 *  - an in-scope question is answered from the docs (contains the real fact),
 *    the LLM is called, and the right source is attributed
 *  - an out-of-scope question hits the refusal gate WITHOUT calling the LLM,
 *    returns the honest fallback, and logs an open gap_questions row
 *  - no invented answers for several off-topic questions
 *
 * Mirrors the /api/chat route logic against the same lib functions.
 * Run: node --env-file=.env.local --import tsx scripts/verify-phase3.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { processDocument } from "../lib/documents.ts";
import {
  buildSystemPrompt,
  chatModel,
  FALLBACK_MESSAGE,
  isRefusal,
  retrieve,
  shouldRefuse,
  SIMILARITY_THRESHOLD,
} from "../lib/rag.ts";

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

const KB = `# Ledgerly Services and Pricing

The Essential plan costs $399 per month and includes monthly bookkeeping,
bank reconciliation, and a monthly profit and loss statement.

The Growth plan costs $749 per month and adds accounts payable, invoicing
support, and a quarterly review call.

# Working Process

Clients submit documents by the 5th business day of each month. Books for the
previous month are closed by the 15th. Financial reports are delivered by email
by the 20th. We reply to client questions within one business day.

# Billing

Invoices are issued on the 1st and auto-charged via ACH on the 5th. To cancel,
give 30 days written notice.`;

// Mirrors the /api/chat route: refuse without an LLM call, else answer.
async function answer(
  db: ReturnType<typeof createClient>,
  bot: { id: string; name: string },
  question: string,
) {
  const r = await retrieve(db, bot.id, question);
  if (shouldRefuse(r)) {
    await db
      .from("gap_questions")
      .insert({ bot_id: bot.id, question, status: "open" });
    return {
      refused: true,
      llmCalled: false,
      text: FALLBACK_MESSAGE,
      sources: [] as string[],
      top: r.topSimilarity,
    };
  }
  const { text } = await generateText({
    model: chatModel(),
    system: buildSystemPrompt(bot.name, r.chunks),
    prompt: question,
  });
  if (isRefusal(text)) {
    await db
      .from("gap_questions")
      .insert({ bot_id: bot.id, question, status: "open" });
  }
  return {
    refused: isRefusal(text),
    llmCalled: true,
    text,
    sources: r.sources.map((s) => s.name),
    top: r.topSimilarity,
  };
}

async function main() {
  const user = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: su, error } = await user.auth.signUp({
    email: `phase3-${Date.now()}@answerbase.test`,
    password: "supersecret123",
  });
  if (error || !su.session) {
    throw new Error("signUp failed (email confirmation off?): " + (error?.message ?? ""));
  }
  const userId = su.user!.id;
  await user.from("workspaces").insert({ owner_id: userId, name: "W", plan: "free" });
  const { data: ws } = await user
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .single();
  const { data: bot } = await user
    .from("bots")
    .insert({
      workspace_id: ws!.id,
      name: "Ledgerly Assistant",
      welcome_message: "Hi",
      accent_color: "#047857",
      public_token: randomBytes(16).toString("base64url"),
    })
    .select("id, name")
    .single();
  const botRow = bot as { id: string; name: string };

  // Ingest the knowledge base.
  const { data: doc } = await user
    .from("documents")
    .insert({ bot_id: botRow.id, filename: "ledgerly.md", kind: "md", status: "parsing" })
    .select("id")
    .single();
  const path = `${botRow.id}/${doc!.id}/ledgerly.md`;
  await admin.storage.from("documents").upload(path, Buffer.from(KB, "utf8"), { upsert: true });
  await user.from("documents").update({ storage_path: path }).eq("id", doc!.id);
  const ing = await processDocument(user, admin, doc!.id);
  check("knowledge base ingested", ing.status === "ready", ing.error ?? "");

  // In-scope question 1: pricing.
  const a1 = await answer(user, botRow, "How much does the Essential plan cost per month?");
  check("in-scope similarity above threshold", a1.top >= SIMILARITY_THRESHOLD, `top ${a1.top.toFixed(3)}`);
  check("in-scope calls the LLM", a1.llmCalled);
  check("in-scope answer contains the real price ($399)", a1.text.includes("399"), JSON.stringify(a1.text.slice(0, 120)));
  check("in-scope not refused", !a1.refused);
  check("in-scope attributes the source", a1.sources.includes("ledgerly.md"), a1.sources.join(", "));

  // In-scope question 2: reports.
  const a2 = await answer(user, botRow, "When are my monthly financial reports delivered?");
  check("second in-scope answer contains '20th'", /20th|20\b/.test(a2.text), JSON.stringify(a2.text.slice(0, 120)));

  // Out-of-scope: must refuse WITHOUT an LLM call and log a gap.
  const off = [
    "What is the capital of France?",
    "What's the weather in Austin today?",
    "Can you recommend a good restaurant nearby?",
  ];
  for (const q of off) {
    const a = await answer(user, botRow, q);
    check(`out-of-scope refused without LLM: "${q.slice(0, 28)}…"`, a.refused && !a.llmCalled, `top ${a.top.toFixed(3)}`);
    check(`  → returns honest fallback`, a.text === FALLBACK_MESSAGE);
  }

  // Gaps logged for each out-of-scope question.
  const { data: gaps } = await user
    .from("gap_questions")
    .select("id, question, status")
    .eq("bot_id", botRow.id);
  check("an open gap was logged per out-of-scope question", (gaps?.length ?? 0) === off.length, `${gaps?.length} gaps`);
  check("gaps are open", (gaps ?? []).every((g) => g.status === "open"));

  await admin.auth.admin.deleteUser(userId);
  console.log("\nCleaned up test user.");
  console.log(
    failures === 0
      ? "\nAll Phase 3 checks passed."
      : `\n${failures} check(s) failed.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nVerification crashed:");
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
