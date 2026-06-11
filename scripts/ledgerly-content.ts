/**
 * Ledgerly Bookkeeping demo documents. Every fact here must agree with
 * docs/CONTENT.md (the canonical source). Docs 1–4 are rendered to PDF,
 * 5–6 are Markdown — the mix exercises both parsers.
 */

export interface SeedDoc {
  filename: string;
  format: "pdf" | "md";
  title: string;
  body: string;
}

const FAQ = `Pricing

What does the Essential plan cost?
The Essential plan is $399 per month. It includes monthly bookkeeping, bank reconciliation, and a monthly profit and loss statement and balance sheet.

What does the Growth plan include?
The Growth plan is $749 per month. It includes everything in Essential, plus accounts payable, invoicing support, and a quarterly review call.

Do you offer payroll?
Yes, as an add-on. Payroll is $99 per month base, plus $6 per employee per month.

I am several months behind on my books. Can you help?
Yes. Our catch-up bookkeeping service is $299 for each month of backlog. We bring your books current before starting your regular monthly service.

Do you prepare tax returns?
No. We do not prepare tax returns in-house. We partner with a CPA and hand off clean, closed books so your return is straightforward. We are glad to coordinate directly with your CPA.

Documents and timing

When do I need to send you my documents each month?
Please submit your documents through the client portal by the 5th business day of each month.

When will my books be closed?
We close the previous month's books by the 15th.

When will I get my monthly reports?
We deliver your financial reports by email by the 20th of each month.

How fast do you reply to questions?
We reply to client questions within one business day. During tax season in March and April, same-day replies are not guaranteed.

What are your office hours?
Our office hours are Monday through Friday, 9:00 a.m. to 5:00 p.m. Central Time.

Billing

How does billing work?
We issue invoices on the 1st of the month and automatically charge them via ACH on the 5th.

What happens if I am late on a payment?
If a payment is more than 15 days past due, we pause service until it is resolved. Restarting service includes a $25 reactivation fee.

How do I cancel?
You can cancel anytime with 30 days written notice. We do not require long-term contracts.`;

const SERVICES = `Services and Pricing Guide

Plans

Essential — $399 per month
Monthly bookkeeping, bank reconciliation, and a monthly profit and loss statement and balance sheet. Best for businesses that want clean books and clear monthly reporting.

Growth — $749 per month
Everything in Essential, plus accounts payable, invoicing support, and a quarterly review call. Best for growing businesses that need help managing bills and invoices.

Add-ons

Payroll — $99 per month base, plus $6 per employee per month.

Catch-up bookkeeping — $299 for each month of backlog. For new clients who are behind on their books, we bring everything current before regular service begins.

What is not included

We do not prepare tax returns in-house. Ledgerly partners with a CPA and hands off clean, closed books, which keeps your tax preparation simple and lower-cost. We coordinate with your CPA directly so nothing falls through the cracks.`;

const ONBOARDING = `New Client Onboarding Guide

Getting started with Ledgerly takes about three weeks from your kickoff call to your first completed monthly close.

The four steps

1. Kickoff call (30 minutes). We learn about your business, your current setup, and your goals.

2. Access setup. We set up QuickBooks Online, connect read-only bank feeds, and collect your prior statements.

3. Historical review. We review your recent history so your books start on a solid footing.

4. First monthly close. We complete your first monthly close within three weeks of the kickoff call.

What to prepare

To get started, please have ready:
- Your last 3 months of bank and credit card statements
- Your prior year tax return
- QuickBooks Online access (or we will set up a new account for you)`;

const TAX_CALENDAR = `Tax Season Calendar

Key deadlines we remind clients about

January 31 — W-2s and 1099-NEC forms sent to recipients.
March 15 — S-corporation (Form 1120-S) and partnership (Form 1065) returns due.
April 15 — Individual (Form 1040) and C-corporation (Form 1120) returns due. First-quarter estimated tax payment also due.
June 15 — Second-quarter estimated tax payment due.
September 15 — Third-quarter estimated tax payment due.
January 15 — Fourth-quarter estimated tax payment due.

About extensions

An extension moves your filing deadline, not your payment deadline. If you expect to owe, you still need to pay by the original due date to avoid penalties and interest.

What Ledgerly does vs. your CPA

Ledgerly keeps your books clean and closed each month and hands them to your CPA. Your CPA prepares and files your actual tax returns. We coordinate directly with your CPA so the handoff is smooth.`;

const SUBMISSION = `# Document Submission Policy

## The client portal
All documents are submitted through the Ledgerly client portal. The portal keeps everything in one place and secure.

## Monthly cutoff
Please submit your documents by the **5th business day** of each month. This gives us time to close the previous month's books by the 15th and deliver your reports by the 20th.

## Accepted formats
We accept PDF, image (JPG or PNG), and CSV files. Bank and credit card statements as PDFs are ideal.

## If documents are late
If your documents arrive after the 5th business day, your close may slip to the next cycle. We will always tell you if a late submission affects your timeline.`;

const BILLING = `# Billing & Payment Terms

## Invoicing
We issue invoices on the **1st** of each month. Invoices are automatically charged via ACH on the **5th**.

## Late payments
If a payment is more than **15 days** past due, we pause service until the balance is resolved. Restarting service includes a **$25 reactivation fee**.

## Cancellation
You can cancel anytime with **30 days written notice**. There are no long-term contracts.

## Questions about your bill
Reach out through the client portal and we will reply within one business day.`;

export const LEDGERLY_DOCS: SeedDoc[] = [
  { filename: "Client FAQ.pdf", format: "pdf", title: "Ledgerly Bookkeeping — Client FAQ", body: FAQ },
  { filename: "Services and Pricing.pdf", format: "pdf", title: "Ledgerly Bookkeeping — Services & Pricing", body: SERVICES },
  { filename: "Onboarding Guide.pdf", format: "pdf", title: "Ledgerly Bookkeeping — New Client Onboarding", body: ONBOARDING },
  { filename: "Tax Season Calendar.pdf", format: "pdf", title: "Ledgerly Bookkeeping — Tax Season Calendar", body: TAX_CALENDAR },
  { filename: "Document Submission Policy.md", format: "md", title: "Document Submission Policy", body: SUBMISSION },
  { filename: "Billing and Payment Terms.md", format: "md", title: "Billing & Payment Terms", body: BILLING },
];

/** Two questions an owner has already answered (seed shows the J4 loop). */
export const ANSWERED_GAPS = [
  {
    question: "Can I pay my invoice by credit card instead of ACH?",
    answer:
      "Our standard method is ACH on the 5th. If you need to pay by credit card, let us know through the portal and we'll set that up; a small processing fee applies.",
  },
  {
    question: "Do you offer a discount if I prepay for the year?",
    answer:
      "Yes. If you prepay 12 months up front, we include one month free.",
  },
];

/** One open gap left for the demo to answer live. */
export const OPEN_GAP = "Do you work with clients outside of Texas?";
