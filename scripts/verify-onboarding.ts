/**
 * Phase 9 verification (Playwright). Exercises the onboarding wizard end to end
 * on a fresh signup and confirms suggested chips on all three surfaces.
 * Prereqs: npm run dev (and the demo is seeded).
 * Run: node --env-file=.env.local --import tsx scripts/verify-onboarding.ts
 */
import { mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { chromium } from "playwright";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const OUT = "C:/Users/1/Documents/Projects/testovoeragChatbot/.scratch";
const APP = "http://localhost:3000";
const EMAIL = `onb-${Date.now()}@answerbase.test`;

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function pricingPdf(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const lines = [
    "Acme Bookkeeping — Pricing",
    "",
    "The Essential plan costs $399 per month and includes monthly bookkeeping",
    "and a profit and loss statement.",
    "The Growth plan is $749 per month and adds accounts payable and invoicing.",
    "We reply to client questions within one business day.",
    "To cancel, give 30 days written notice.",
  ];
  const page = pdf.addPage([612, 792]);
  let y = 740;
  for (const l of lines) {
    page.drawText(l, { x: 60, y, size: 12, font });
    y -= 22;
  }
  return Buffer.from(await pdf.save());
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });

  try {
    // --- Wizard on a fresh signup ---
    await page.goto(`${APP}/signup`);
    await page.fill("#email", EMAIL);
    await page.fill("#password", "supersecret123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    await page.click('a:has-text("Create your first bot"), a:has-text("New bot")');
    await page.waitForURL("**/bots/new", { timeout: 20000 });

    // Step 1: upload.
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "Acme Pricing.pdf", mimeType: "application/pdf", buffer: await pricingPdf() });
    await page.getByText("Ready").first().waitFor({ timeout: 45000 });
    check("wizard step 1: document reaches Ready", true);
    await page.click('button:has-text("Continue")');

    // Step 2: prefilled name + welcome.
    await page.waitForSelector("#wiz-name", { timeout: 10000 });
    const name = await page.inputValue("#wiz-name");
    check("step 2: name prefilled (not 'Untitled bot')", name !== "Untitled bot" && name.length > 0, name);
    // give generation a moment to fill the welcome
    await page.waitForTimeout(8000);
    const welcome = await page.inputValue("#wiz-welcome");
    check("step 2: welcome prefilled", welcome.length > 0, welcome.slice(0, 60));
    await page.screenshot({ path: `${OUT}/wizard-step2.png` });
    await page.click('button:has-text("Continue")');

    // Step 3: chips + click one -> cited answer.
    await page.waitForSelector("text=Try your bot", { timeout: 25000 });
    const chip = page.locator('button.rounded-full').first();
    await chip.waitFor({ timeout: 30000 });
    const chipText = (await chip.textContent()) ?? "";
    check("step 3: suggested chips present", chipText.trim().length > 0, chipText.trim());
    await chip.click();
    // wait for a streamed answer that is not the refusal fallback
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${OUT}/wizard-step3.png` });
    const body = (await page.locator("body").innerText()).toLowerCase();
    check("step 3: chip produced a real answer (not refusal)", !body.includes("knowledge base yet"));

    // --- In-app test chat chips (seeded demo bot) ---
    const ctx2 = await browser.newPage({ viewport: { width: 1280, height: 920 } });
    await ctx2.goto(`${APP}/login`);
    await ctx2.fill("#email", "demo@answerbase.app");
    await ctx2.fill("#password", "Demo-Answerbase-2026");
    await ctx2.click('button[type="submit"]');
    await ctx2.waitForURL("**/dashboard", { timeout: 20000 });
    await ctx2.getByText("Ledgerly Assistant").first().click();
    await ctx2.waitForURL("**/bots/**", { timeout: 20000 });
    const inAppChip = ctx2.locator('button.rounded-full', { hasText: "?" }).first();
    await inAppChip.waitFor({ timeout: 10000 });
    check("in-app test chat shows chips", await inAppChip.isVisible());
    await ctx2.locator('[data-slot="card"]').filter({ has: ctx2.locator('[data-slot="card-title"]', { hasText: "Test chat" }) }).screenshot({ path: `${OUT}/inapp-chips.png` });

    // --- Widget chips (preview page) ---
    const { data: list } = await admin.auth.admin.listUsers();
    const demo = list.users.find((u) => u.email === "demo@answerbase.app");
    const { data: ws } = await admin.from("workspaces").select("id").eq("owner_id", demo!.id).single();
    const { data: bot } = await admin.from("bots").select("public_token").eq("workspace_id", ws!.id).single();
    const wp = await browser.newPage({ viewport: { width: 1180, height: 900 } });
    await wp.goto(`${APP}/preview/${bot!.public_token}`, { waitUntil: "networkidle" });
    await wp.waitForSelector("button[aria-label='Open chat']", { timeout: 15000 });
    await wp.click("button[aria-label='Open chat']");
    await wp.waitForTimeout(1200);
    const widgetChip = wp.frameLocator("iframe[title='Chat']").locator("button.rounded-full").first();
    await widgetChip.waitFor({ timeout: 10000 });
    check("widget shows chips under welcome", await widgetChip.isVisible());
    await wp.screenshot({ path: `${OUT}/widget-chips.png` });

    console.log(`\n${failures === 0 ? "All onboarding checks passed." : failures + " failed."}`);
  } finally {
    await browser.close();
    const { data: list } = await admin.auth.admin.listUsers();
    const u = list.users.find((x) => x.email === EMAIL);
    if (u) await admin.auth.admin.deleteUser(u.id);
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
