/**
 * Visual cross-domain test for the widget. Creates a demo bot with a tiny KB,
 * opens public/demo-ledgerly.html from a DIFFERENT origin (:8080) than the app
 * (:3000), and screenshots the launcher, the open panel, an answer, and the
 * fallback. Cleans up the bot afterwards.
 *
 * Prereqs (start first, in the background):
 *   npm run dev                         # app on :3000
 *   node scripts/serve-public.mjs       # demo host on :8080
 * Run: node --env-file=.env.local --import tsx scripts/widget-shots.ts
 */
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { processDocument } from "../lib/documents.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const KB = `# Ledgerly Pricing and Process

The Essential plan costs $399 per month and includes monthly bookkeeping, bank
reconciliation, and a monthly profit and loss statement. The Growth plan is
$749 per month and adds accounts payable and a quarterly review call.

Clients submit documents by the 5th business day. Reports are delivered by the
20th. We reply to questions within one business day.`;

const OUT = "C:/Users/1/Documents/Projects/testovoeragChatbot/.scratch";

async function main() {
  await mkdir(OUT, { recursive: true });

  // Create a demo bot with an ingested KB.
  const user = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: su, error } = await user.auth.signUp({
    email: `widgetshot-${Date.now()}@answerbase.test`,
    password: "supersecret123",
  });
  if (error || !su.session) throw new Error("signUp failed: " + (error?.message ?? ""));
  const userId = su.user!.id;
  await user.from("workspaces").insert({ owner_id: userId, name: "W", plan: "free" });
  const { data: ws } = await user.from("workspaces").select("id").eq("owner_id", userId).single();
  const token = randomBytes(16).toString("base64url");
  const { data: bot } = await user
    .from("bots")
    .insert({
      workspace_id: ws!.id,
      name: "Ledgerly Assistant",
      welcome_message: "Hi! I'm Ledgerly's assistant. Ask me about our services, pricing, or deadlines.",
      accent_color: "#047857",
      public_token: token,
    })
    .select("id")
    .single();
  const { data: doc } = await user
    .from("documents")
    .insert({ bot_id: bot!.id, filename: "ledgerly.md", kind: "md", status: "parsing" })
    .select("id")
    .single();
  const path = `${bot!.id}/${doc!.id}/ledgerly.md`;
  await admin.storage.from("documents").upload(path, Buffer.from(KB, "utf8"), { upsert: true });
  await user.from("documents").update({ storage_path: path }).eq("id", doc!.id);
  await processDocument(user, admin, doc!.id);
  console.log("demo bot token:", token);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const demo = `http://localhost:8080/demo-ledgerly.html?bot=${token}&app=http://localhost:3000`;

  try {
    await page.goto(demo, { waitUntil: "networkidle" });
    await page.waitForSelector("button[aria-label='Open chat']", { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/1-launcher.png` });

    // Open the panel.
    await page.click("button[aria-label='Open chat']");
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/2-open.png` });

    const frame = page.frameLocator("iframe[title='Chat']");

    // In-scope question.
    await frame.locator("textarea").fill("How much does the Essential plan cost?");
    await frame.locator("button[aria-label='Send']").click();
    await frame.getByText(/399/).waitFor({ timeout: 30000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/3-answer.png` });

    // Out-of-scope question -> fallback.
    await frame.locator("textarea").fill("What's the weather in Paris today?");
    await frame.locator("button[aria-label='Send']").click();
    await frame.getByText(/knowledge base yet/).waitFor({ timeout: 30000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/4-fallback.png` });

    console.log("screenshots written to .scratch/");
  } finally {
    await browser.close();
    await admin.auth.admin.deleteUser(userId);
    console.log("cleaned up demo bot");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
