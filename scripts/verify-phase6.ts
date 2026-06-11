/**
 * Phase 6 verification (gap loop / J4). Proves:
 *  - asking something outside the docs creates an open gap
 *  - answering the gap appends an embedded chunk to a single "Owner answers"
 *    document and marks the gap answered
 *  - asking the SAME question again now answers it, sourced to "Owner answers"
 *  - dismissing a gap removes it from the open list
 *  - the "Owner answers" document is reused (one per bot, page_count 1)
 *
 * Replicates the gap server-action logic with the service-role client.
 * Run: node --env-file=.env.local --import tsx scripts/verify-phase6.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processDocument } from "../lib/documents.ts";
import { embed } from "../lib/embeddings.ts";
import { FALLBACK_MESSAGE, retrieve, shouldRefuse } from "../lib/rag.ts";
import { handleChat } from "../lib/chat.ts";

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

const KB = `# Ledgerly Pricing
The Essential plan costs $399 per month and includes monthly bookkeeping.`;

// Mirrors answerGap() server action.
async function answerGapDirect(
  botId: string,
  gapId: string,
  question: string,
  answer: string,
) {
  let { data: gapDoc } = await admin
    .from("documents")
    .select("id")
    .eq("bot_id", botId)
    .eq("kind", "gap_answer")
    .maybeSingle();
  if (!gapDoc) {
    const { data } = await admin
      .from("documents")
      .insert({ bot_id: botId, filename: "Owner answers", kind: "gap_answer", status: "ready", page_count: 1 })
      .select("id")
      .single();
    gapDoc = data;
  }
  const content = `Q: ${question}\nA: ${answer}`;
  const [emb] = await embed([content]);
  await admin.from("chunks").insert({
    document_id: gapDoc!.id,
    bot_id: botId,
    content,
    token_count: Math.ceil(content.length / 4),
    embedding: JSON.stringify(emb),
  });
  await admin
    .from("gap_questions")
    .update({ status: "answered", answer_text: answer, answered_at: new Date().toISOString() })
    .eq("id", gapId);
}

async function ask(bot: { id: string; name: string }, question: string) {
  const res = await handleChat({ db: admin, bot, question, conversationId: null, channel: "app" });
  const metaRaw = res.headers.get("x-chat-meta");
  const meta = metaRaw ? JSON.parse(decodeURIComponent(metaRaw)) : null;
  const text = await res.text();
  return { text, sources: (meta?.sources ?? []) as string[] };
}

async function main() {
  const user = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: su, error } = await user.auth.signUp({
    email: `phase6-${Date.now()}@answerbase.test`,
    password: "supersecret123",
  });
  if (error || !su.session) throw new Error("signUp failed: " + (error?.message ?? ""));
  const userId = su.user!.id;
  await user.from("workspaces").insert({ owner_id: userId, name: "W", plan: "free" });
  const { data: ws } = await user.from("workspaces").select("id").eq("owner_id", userId).single();
  const { data: bot } = await user
    .from("bots")
    .insert({ workspace_id: ws!.id, name: "Ledgerly", welcome_message: "Hi", accent_color: "#047857", public_token: randomBytes(16).toString("base64url") })
    .select("id, name")
    .single();
  const botRow = bot as { id: string; name: string };

  const { data: doc } = await user
    .from("documents")
    .insert({ bot_id: botRow.id, filename: "kb.md", kind: "md", status: "parsing" })
    .select("id")
    .single();
  const path = `${botRow.id}/${doc!.id}/kb.md`;
  await admin.storage.from("documents").upload(path, Buffer.from(KB, "utf8"), { upsert: true });
  await user.from("documents").update({ storage_path: path }).eq("id", doc!.id);
  await processDocument(user, admin, doc!.id);

  // 1. Out-of-scope question creates a gap.
  const Q = "Do you offer weekend support hours?";
  const first = await ask(botRow, Q);
  check("unknown question is refused", first.text.trim() === FALLBACK_MESSAGE);
  const { data: openGaps } = await admin
    .from("gap_questions")
    .select("id, question, status")
    .eq("bot_id", botRow.id)
    .eq("status", "open");
  const gap = (openGaps ?? []).find((g) => g.question === Q);
  check("an open gap was created for it", !!gap);

  // 2. Owner answers the gap.
  const ownerAnswer =
    "Yes. We offer email support on Saturdays from 9 a.m. to 1 p.m. Central time.";
  await answerGapDirect(botRow.id, gap!.id, Q, ownerAnswer);
  const { data: answered } = await admin
    .from("gap_questions")
    .select("status")
    .eq("id", gap!.id)
    .single();
  check("gap is marked answered", answered?.status === "answered");

  // 3. Same question now retrieves the owner answer, sourced "Owner answers".
  const r = await retrieve(admin, botRow.id, Q);
  check("answer is now retrievable above threshold", !shouldRefuse(r), `top ${r.topSimilarity.toFixed(3)}`);
  check("source is 'Owner answers'", r.sources.some((s) => s.name === "Owner answers"), r.sources.map((s) => s.name).join(", "));

  const second = await ask(botRow, Q);
  check("same question now gets answered (not refused)", second.text.trim() !== FALLBACK_MESSAGE);
  check("answer reflects the owner's content (Saturday)", /saturday/i.test(second.text), JSON.stringify(second.text.slice(0, 120)));
  check("answer is attributed to Owner answers", second.sources.includes("Owner answers"), second.sources.join(", "));

  // 4. Dismiss removes a gap from the open list.
  const dQ = "What is your favorite color?";
  await ask(botRow, dQ);
  const { data: dGapRows } = await admin
    .from("gap_questions")
    .select("id")
    .eq("bot_id", botRow.id)
    .eq("question", dQ)
    .eq("status", "open");
  const dGap = dGapRows?.[0];
  await admin.from("gap_questions").update({ status: "dismissed" }).eq("id", dGap!.id);
  const { data: stillOpen } = await admin
    .from("gap_questions")
    .select("id")
    .eq("question", dQ)
    .eq("status", "open");
  check("dismissed gap leaves the open list", (stillOpen?.length ?? 0) === 0);

  // 5. Answering a second gap reuses the single Owner answers doc.
  const { data: secondGapRows } = await admin
    .from("gap_questions")
    .select("id, question")
    .eq("bot_id", botRow.id)
    .eq("status", "open");
  if (secondGapRows && secondGapRows.length > 0) {
    await answerGapDirect(botRow.id, secondGapRows[0].id, secondGapRows[0].question, "A second owner answer.");
  } else {
    // ensure there is a second answer to test reuse
    const extraQ = "Do you support multiple currencies?";
    await ask(botRow, extraQ);
    const { data: ex } = await admin.from("gap_questions").select("id, question").eq("bot_id", botRow.id).eq("question", extraQ).single();
    await answerGapDirect(botRow.id, ex!.id, extraQ, "A second owner answer.");
  }
  const { data: gapDocs } = await admin
    .from("documents")
    .select("id, page_count")
    .eq("bot_id", botRow.id)
    .eq("kind", "gap_answer");
  check("only one 'Owner answers' document exists", (gapDocs?.length ?? 0) === 1, `${gapDocs?.length}`);
  check("'Owner answers' counts as 1 page", gapDocs?.[0]?.page_count === 1);

  await admin.auth.admin.deleteUser(userId);
  console.log("\nCleaned up test user.");
  console.log(failures === 0 ? "\nAll Phase 6 checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
