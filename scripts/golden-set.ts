/**
 * Golden set runner. Asks the seeded Ledgerly bot the 20 questions from
 * docs/CONTENT.md and records the results to docs/GOLDEN_SET_RESULTS.md.
 * Read-only: it does not persist messages or gaps (gap logging is verified
 * separately), so the demo account stays clean.
 *
 * Run: npm run golden   (after npm run seed)
 */
import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import {
  buildSystemPrompt,
  chatModel,
  FALLBACK_MESSAGE,
  isRefusal,
  retrieve,
  shouldRefuse,
} from "../lib/rag.ts";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

interface InScope {
  q: string;
  must: RegExp;
  source: RegExp;
}
interface OffScope {
  q: string;
  why: string;
}

const IN_SCOPE: InScope[] = [
  { q: "How much does your basic plan cost?", must: /399/, source: /pricing/i },
  { q: "What's included in the Growth plan?", must: /quarterly|accounts payable|invoicing/i, source: /pricing/i },
  { q: "Do you do tax returns?", must: /cpa|don'?t|do not|no,? we/i, source: /faq|pricing/i },
  { q: "When do I need to send you my documents each month?", must: /5th business day|fifth business day/i, source: /submission|faq/i },
  { q: "When will I get my monthly reports?", must: /20th/i, source: /faq/i },
  { q: "How fast do you reply to questions?", must: /one business day|1 business day/i, source: /faq/i },
  { q: "What do you need from me to get started?", must: /quickbooks|statements|tax return/i, source: /onboarding/i },
  { q: "How long does onboarding take?", must: /three weeks|3 weeks/i, source: /onboarding/i },
  { q: "When is the S-corp filing deadline?", must: /march 15/i, source: /tax/i },
  { q: "When are quarterly estimated taxes due?", must: /april 15|june 15|september 15|january 15/i, source: /tax/i },
  { q: "Does an extension delay my tax payment?", must: /filing|not.*payment|no/i, source: /tax/i },
  { q: "How does billing work?", must: /ach|5th|1st/i, source: /billing/i },
  { q: "What happens if I'm late on payment?", must: /15 days|\$25|reactivation/i, source: /billing/i },
  { q: "How do I cancel?", must: /30 days/i, source: /billing|faq/i },
  { q: "I'm 6 months behind on my books — can you help?", must: /299|catch-up|catch up/i, source: /pricing/i },
];

const OFF_SCOPE: OffScope[] = [
  { q: "Can you recommend a business bank account?", why: "adjacent topic, not in docs" },
  { q: "What's your office address?", why: "plausible-sounding, never stated" },
  { q: "Do you support Xero?", why: "only QuickBooks is mentioned" },
  { q: "How much do you charge for CFO advisory services?", why: "service that doesn't exist" },
  { q: "What are the tax deadlines in Canada?", why: "wrong jurisdiction" },
];

async function answer(botId: string, botName: string, q: string) {
  const r = await retrieve(admin, botId, q);
  if (shouldRefuse(r)) {
    return { refused: true, text: FALLBACK_MESSAGE, top: r.topSimilarity, sources: [] as string[] };
  }
  const { text } = await generateText({
    model: chatModel(),
    system: buildSystemPrompt(botName, r.chunks),
    prompt: q,
  });
  return {
    refused: isRefusal(text),
    text,
    top: r.topSimilarity,
    sources: r.sources.map((s) => s.name),
  };
}

async function main() {
  const { data: list } = await admin.auth.admin.listUsers();
  const demo = list.users.find((u) => u.email === "demo@answerbase.app");
  if (!demo) throw new Error("Demo user not found — run `npm run seed` first.");
  const { data: ws } = await admin.from("workspaces").select("id").eq("owner_id", demo.id).single();
  const { data: bot } = await admin.from("bots").select("id, name").eq("workspace_id", ws!.id).single();
  const botId = bot!.id as string;
  const botName = bot!.name as string;

  let inPass = 0;
  let offPass = 0;
  const rows: string[] = [];

  console.log("In-scope (must answer with the right source):");
  for (let i = 0; i < IN_SCOPE.length; i++) {
    const t = IN_SCOPE[i];
    const a = await answer(botId, botName, t.q);
    const factOk = !a.refused && t.must.test(a.text);
    const srcOk = a.sources.some((s) => t.source.test(s));
    const ok = factOk && srcOk;
    if (ok) inPass++;
    console.log(`  ${ok ? "PASS" : "FAIL"} #${i + 1} ${t.q} [${a.top.toFixed(2)}]${ok ? "" : ` fact=${factOk} src=${srcOk} (${a.sources.join(", ")})`}`);
    rows.push(`| ${i + 1} | ${t.q} | ${a.refused ? "refused" : "answered"} | ${a.top.toFixed(2)} | ${a.sources.join(", ") || "—"} | ${ok ? "✅" : "❌"} |`);
  }

  console.log("\nOut-of-scope (must refuse honestly):");
  for (let i = 0; i < OFF_SCOPE.length; i++) {
    const t = OFF_SCOPE[i];
    const a = await answer(botId, botName, t.q);
    const ok = a.refused;
    if (ok) offPass++;
    console.log(`  ${ok ? "PASS" : "FAIL"} #${i + 16} ${t.q} [${a.top.toFixed(2)}]${ok ? "" : ` answered: ${a.text.slice(0, 80)}`}`);
    rows.push(`| ${i + 16} | ${t.q} | ${a.refused ? "refused ✓" : "answered"} | ${a.top.toFixed(2)} | — | ${ok ? "✅" : "❌"} |`);
  }

  const md = `# Golden Set Results

Run against the seeded Ledgerly Assistant bot. In-scope questions must be
answered with the correct fact and source; out-of-scope questions must be
refused honestly (which also logs a gap in the live app).

**In-scope: ${inPass}/15 · Out-of-scope: ${offPass}/5**

| # | Question | Result | Top similarity | Sources | Pass |
|---|---|---|---|---|---|
${rows.join("\n")}

_Threshold: see SIMILARITY_THRESHOLD in lib/rag.ts. top_similarity is persisted
on every message, so this can be recalibrated from real traffic._
`;
  await writeFile("docs/GOLDEN_SET_RESULTS.md", md, "utf8");

  console.log(`\nIn-scope ${inPass}/15 · Out-of-scope ${offPass}/5`);
  console.log("Wrote docs/GOLDEN_SET_RESULTS.md");
  process.exit(inPass === 15 && offPass === 5 ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
