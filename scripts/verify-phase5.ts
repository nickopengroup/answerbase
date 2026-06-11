/**
 * Phase 5 verification (mocked billing & limits). Proves:
 *  - getUsage counts bots, sums document pages, and counts this month's
 *    messages correctly (the nested-join query is the risky part)
 *  - checkLimit blocks at the limit and allows below it
 *  - flipping the plan to Pro expands the limits and removes "Powered by"
 *    (resolveWidgetBot plan), and downgrading restores Free
 *  - the limited chat response carries the limited flag
 *
 * Run: node --env-file=.env.local --import tsx scripts/verify-phase5.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processDocument } from "../lib/documents.ts";
import {
  checkLimit,
  getUsage,
  limitedChatResponse,
  PLANS,
} from "../lib/limits.ts";
import { resolveWidgetBot } from "../lib/widget.ts";

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

async function main() {
  const user = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: su, error } = await user.auth.signUp({
    email: `phase5-${Date.now()}@answerbase.test`,
    password: "supersecret123",
  });
  if (error || !su.session) throw new Error("signUp failed: " + (error?.message ?? ""));
  const userId = su.user!.id;
  await user.from("workspaces").insert({ owner_id: userId, name: "W", plan: "free" });
  const { data: ws } = await user.from("workspaces").select("id").eq("owner_id", userId).single();
  const wsId = ws!.id as string;
  const token = randomBytes(16).toString("base64url");
  const { data: bot } = await user
    .from("bots")
    .insert({
      workspace_id: wsId,
      name: "Bot",
      welcome_message: "Hi",
      accent_color: "#047857",
      public_token: token,
    })
    .select("id")
    .single();
  const botId = bot!.id as string;

  // Ingest a 1-page doc.
  const { data: doc } = await user
    .from("documents")
    .insert({ bot_id: botId, filename: "p.md", kind: "md", status: "parsing" })
    .select("id")
    .single();
  const path = `${botId}/${doc!.id}/p.md`;
  await admin.storage.from("documents").upload(path, Buffer.from("Essential plan is $399.", "utf8"), { upsert: true });
  await user.from("documents").update({ storage_path: path }).eq("id", doc!.id);
  await processDocument(user, admin, doc!.id);

  // Insert 3 user messages in a widget conversation.
  const { data: conv } = await admin
    .from("conversations")
    .insert({ bot_id: botId, channel: "widget" })
    .select("id")
    .single();
  await admin.from("messages").insert(
    [1, 2, 3].map(() => ({ conversation_id: conv!.id, role: "user", content: "hi" })),
  );

  // getUsage accuracy.
  const usage = await getUsage(admin, wsId);
  check("usage counts 1 bot", usage.bots === 1, `${usage.bots}`);
  check("usage sums 1 page", usage.pages === 1, `${usage.pages}`);
  check("usage counts 3 messages this month", usage.messages === 3, `${usage.messages}`);

  // checkLimit at boundaries (free: 1 bot, 20 pages, 100 messages).
  check("free bot limit reached at 1 bot", checkLimit(usage, "free", "bots").allowed === false);
  check("free pages allowed at 1/20", checkLimit(usage, "free", "pages").allowed === true);
  check("free messages allowed at 3/100", checkLimit(usage, "free", "messages").allowed === true);
  check(
    "free messages blocked at 100",
    checkLimit({ bots: 0, pages: 0, messages: 100 }, "free", "messages").allowed === false,
  );

  // Flip to Pro: limits expand, Powered-by removed.
  await admin.from("workspaces").update({ plan: "pro" }).eq("id", wsId);
  check("pro expands bot limit (1 < 3)", checkLimit(usage, "pro", "bots").allowed === true);
  check("pro bots limit value is 3", PLANS.pro.bots === 3);
  const proBot = await resolveWidgetBot(admin, token);
  check("widget reflects Pro (no Powered-by)", proBot?.plan === "pro");

  // Downgrade restores Free.
  await admin.from("workspaces").update({ plan: "free" }).eq("id", wsId);
  const freeBot = await resolveWidgetBot(admin, token);
  check("downgrade restores Free (Powered-by shows)", freeBot?.plan === "free");

  // Limited chat response carries the flag.
  const res = limitedChatResponse("limit reached", null);
  const metaRaw = res.headers.get("x-chat-meta");
  const meta = metaRaw ? JSON.parse(decodeURIComponent(metaRaw)) : null;
  check("limited response flags limited:true", meta?.limited === true);
  check("limited response body is the message", (await res.text()) === "limit reached");

  await admin.auth.admin.deleteUser(userId);
  console.log("\nCleaned up test user.");
  console.log(
    failures === 0 ? "\nAll Phase 5 checks passed." : `\n${failures} check(s) failed.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
