/**
 * Phase 4 verification (widget backend). Proves:
 *  - a public token resolves to its bot + plan; junk tokens resolve to null
 *  - the widget chat engine answers in-scope and refuses out-of-scope,
 *    persisting widget-channel conversations
 *  - the Postgres-based rate limit trips after the threshold (serverless-safe)
 *
 * Run: node --env-file=.env.local --import tsx scripts/verify-phase4.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processDocument } from "../lib/documents.ts";
import { FALLBACK_MESSAGE } from "../lib/rag.ts";
import { handleChat } from "../lib/chat.ts";
import {
  isValidToken,
  resolveWidgetBot,
  widgetRateLimited,
} from "../lib/widget.ts";

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

The Essential plan costs $399 per month and includes monthly bookkeeping and a
profit and loss statement. Reports are delivered by the 20th of each month.`;

async function main() {
  const user = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: su, error } = await user.auth.signUp({
    email: `phase4-${Date.now()}@answerbase.test`,
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
  const token = randomBytes(16).toString("base64url");
  const { data: bot } = await user
    .from("bots")
    .insert({
      workspace_id: ws!.id,
      name: "Ledgerly Assistant",
      welcome_message: "Hi! Ask me about our services.",
      accent_color: "#047857",
      public_token: token,
    })
    .select("id, name")
    .single();
  const botRow = bot as { id: string; name: string };

  // Ingest a small KB.
  const { data: doc } = await user
    .from("documents")
    .insert({ bot_id: botRow.id, filename: "pricing.md", kind: "md", status: "parsing" })
    .select("id")
    .single();
  const path = `${botRow.id}/${doc!.id}/pricing.md`;
  await admin.storage.from("documents").upload(path, Buffer.from(KB, "utf8"), { upsert: true });
  await user.from("documents").update({ storage_path: path }).eq("id", doc!.id);
  await processDocument(user, admin, doc!.id);

  // Token resolution.
  check("valid token format accepted", isValidToken(token));
  check("junk token format rejected", !isValidToken("short!!"));
  const resolved = await resolveWidgetBot(admin, token);
  check("token resolves to the bot", resolved?.id === botRow.id, resolved?.name ?? "null");
  check("resolved plan is free", resolved?.plan === "free");
  const bad = await resolveWidgetBot(admin, randomBytes(16).toString("base64url"));
  check("unknown token resolves to null (graceful)", bad === null);

  // Rate limit starts clear.
  check("rate limit clear initially", (await widgetRateLimited(admin, botRow.id)) === false);

  // Widget chat: in-scope answer over the widget channel.
  const inRes = await handleChat({
    db: admin,
    bot: botRow,
    question: "How much is the Essential plan?",
    conversationId: null,
    channel: "widget",
  });
  const inText = await inRes.text();
  check("widget in-scope answer contains $399", inText.includes("399"), JSON.stringify(inText.slice(0, 100)));

  const { data: convos } = await admin
    .from("conversations")
    .select("id, channel")
    .eq("bot_id", botRow.id);
  check("widget-channel conversation persisted", (convos ?? []).some((c) => c.channel === "widget"));

  // Widget chat: out-of-scope refuses honestly.
  const offRes = await handleChat({
    db: admin,
    bot: botRow,
    question: "What's the capital of France?",
    conversationId: null,
    channel: "widget",
  });
  const offText = await offRes.text();
  check("widget out-of-scope returns fallback", offText.trim() === FALLBACK_MESSAGE);

  // Rate limit trips after threshold (insert 20 widget user messages).
  const { data: conv } = await admin
    .from("conversations")
    .insert({ bot_id: botRow.id, channel: "widget" })
    .select("id")
    .single();
  const rows = Array.from({ length: 20 }, () => ({
    conversation_id: conv!.id,
    role: "user",
    content: "ping",
  }));
  await admin.from("messages").insert(rows);
  check("rate limit trips past the threshold", (await widgetRateLimited(admin, botRow.id)) === true);

  await admin.auth.admin.deleteUser(userId);
  console.log("\nCleaned up test user.");
  console.log(
    failures === 0
      ? "\nAll Phase 4 checks passed."
      : `\n${failures} check(s) failed.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nVerification crashed:");
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
