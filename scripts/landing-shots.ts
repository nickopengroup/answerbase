/**
 * Capture real product screenshots for the landing page by driving the live
 * app with Playwright: sign up, create a bot, upload a doc, ask a question
 * (answer + source), create a gap, and shoot the widget on a third-party page.
 *
 * Prereqs (start first, in the background):
 *   npm run dev                     # app on :3000
 *   node scripts/serve-public.mjs   # demo host on :8080
 * Run: node --env-file=.env.local --import tsx scripts/landing-shots.ts
 */
import { mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const OUT = "C:/Users/1/Documents/Projects/testovoeragChatbot/public/screenshots";
const APP = "http://localhost:3000";
const EMAIL = `landing-${Date.now()}@answerbase.test`;
const PASSWORD = "supersecret123";

const KB = `# Ledgerly Client FAQ

## Pricing
The Essential plan costs $399 per month and includes monthly bookkeeping, bank
reconciliation, and a monthly profit and loss statement. The Growth plan is
$749 per month and adds accounts payable and a quarterly review call.

## Documents and timing
Please submit your documents by the 5th business day of each month. We close
the prior month's books by the 15th and deliver reports by the 20th.

## Support
We reply to client questions within one business day.`;

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });

  try {
    // Sign up.
    await page.goto(`${APP}/signup`);
    await page.fill("#email", EMAIL);
    await page.fill("#password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // Create a bot.
    await page.click('button:has-text("New bot")');
    await page.fill("#name", "Ledgerly Assistant");
    await page.click('button:has-text("Create bot")');
    await page.getByText("Ledgerly Assistant").first().waitFor();
    await page.click("text=Ledgerly Assistant");
    await page.waitForURL("**/bots/**", { timeout: 20000 });

    // Upload a document and wait for it to be ready.
    await page
      .locator('input[type="file"]')
      .setInputFiles({
        name: "Client FAQ.md",
        mimeType: "text/markdown",
        buffer: Buffer.from(KB, "utf8"),
      });
    await page.getByText("Ready").first().waitFor({ timeout: 45000 });

    const chatBox = 'textarea[placeholder="Ask your bot a question…"]';

    // In-scope question -> answer with source chip.
    await page.fill(chatBox, "How much does the Essential plan cost?");
    await page.click('button[aria-label="Send"]');
    await page.getByText(/399/).first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(600);

    const cardByTitle = (title: string) =>
      page.locator('[data-slot="card"]').filter({
        has: page.locator('[data-slot="card-title"]', { hasText: title }),
      });

    await cardByTitle("Test chat").screenshot({ path: `${OUT}/chat.png` });
    await cardByTitle("Documents").screenshot({ path: `${OUT}/documents.png` });

    // Out-of-scope question -> creates a gap.
    await page.fill(chatBox, "Do you offer weekend support hours?");
    await page.click('button[aria-label="Send"]');
    await page.getByText(/knowledge base yet/).first().waitFor({ timeout: 30000 });
    await page.reload();
    await page.getByText("Unanswered questions").first().waitFor();
    await page.waitForTimeout(400);
    await cardByTitle("Unanswered questions").screenshot({
      path: `${OUT}/gaps.png`,
    });

    // Dashboard with the bot.
    await page.goto(`${APP}/dashboard`);
    await page.getByText("Ledgerly Assistant").first().waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/dashboard.png` });

    // Widget on a third-party page.
    const { data: bot } = await admin
      .from("bots")
      .select("public_token")
      .eq("name", "Ledgerly Assistant")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    const token = bot!.public_token as string;

    const wp = await browser.newPage({ viewport: { width: 1180, height: 820 } });
    await wp.goto(
      `http://localhost:8080/demo-ledgerly.html?bot=${token}&app=${APP}`,
      { waitUntil: "networkidle" },
    );
    await wp.waitForSelector("button[aria-label='Open chat']", { timeout: 15000 });
    await wp.click("button[aria-label='Open chat']");
    await wp.waitForTimeout(900);
    const frame = wp.frameLocator("iframe[title='Chat']");
    await frame.locator("textarea").fill("How much does the Essential plan cost?");
    await frame.locator("button[aria-label='Send']").click();
    await frame.getByText(/399/).waitFor({ timeout: 30000 });
    await wp.waitForTimeout(600);
    await wp.screenshot({ path: `${OUT}/widget.png` });

    console.log("screenshots written to public/screenshots/");
  } finally {
    await browser.close();
    const { data: list } = await admin.auth.admin.listUsers();
    const u = list.users.find((x) => x.email === EMAIL);
    if (u) await admin.auth.admin.deleteUser(u.id);
    console.log("cleaned up demo user");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
