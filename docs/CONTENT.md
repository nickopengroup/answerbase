# Answerbase — Demo Content & Golden Set

> Fictional demo client: **Ledgerly Bookkeeping** — a 9-person bookkeeping firm in Austin, TX.
> The canonical facts below are the single source of truth. Every generated document must agree with them; every golden-set answer is checked against them. No document may contradict another.

## Canonical facts

**Services & pricing**
- Essential plan: $399/mo — monthly bookkeeping, bank reconciliation, monthly P&L and balance sheet
- Growth plan: $749/mo — Essential + accounts payable, invoicing support, quarterly review call
- Payroll add-on: $99/mo base + $6 per employee per month
- Catch-up bookkeeping (for new clients behind on books): $299 per month of backlog
- Tax return preparation is NOT offered in-house; Ledgerly partners with a CPA and hands off clean books

**Working process**
- Clients submit documents through the client portal by the **5th business day** of each month
- Books for the previous month are closed by the **15th**
- Financial reports delivered by email by the **20th**
- Response time to client questions: within **1 business day** (same day during Mar–Apr tax season is NOT promised)
- Office hours: Mon–Fri, 9:00–17:00 Central Time

**Onboarding (new client)**
1. Kickoff call (30 min) → 2. Access setup: QuickBooks Online, bank read-only feeds, prior statements → 3. Historical review → 4. First monthly close within **3 weeks** of kickoff
- Required at start: last 3 months of bank and credit card statements, prior year tax return, QuickBooks access (or Ledgerly sets up a new account)

**Billing**
- Invoices issued on the **1st** of the month, auto-charged via ACH on the **5th**
- Late payment: services pause after **15 days** past due; $25 reactivation fee
- Cancel anytime with **30 days written notice**; no long-term contracts

**Key deadlines Ledgerly reminds clients about (standard IRS)**
- Jan 31: W-2s and 1099-NEC sent to recipients
- Mar 15: S-corp (1120-S) and partnership (1065) returns
- Apr 15: individual (1040) and C-corp (1120) returns; Q1 estimated tax
- Jun 15 / Sep 15 / Jan 15: Q2–Q4 estimated taxes
- Extensions move filing, NOT payment

## Documents to generate (6)

Generate with an LLM using the facts above. Tone: a competent, friendly ops manager wrote these for clients. US English. Realistic length, no filler. Documents 1–4 as styled PDFs (letterhead with the Ledgerly name, headings, tables where natural), 5–6 as Markdown.

1. **Client FAQ** (PDF, ~3 pages, 25–30 Q&A) — covers pricing, document submission, deadlines, response times, billing, cancellation. The densest source; most golden-set answers live here.
2. **Services & Pricing Guide** (PDF, ~2 pages) — plans compared in a table, add-ons, catch-up service, what's NOT included (tax prep handoff explained).
3. **New Client Onboarding Guide** (PDF, ~2 pages) — the 4 steps, what to prepare, timeline to first close.
4. **Tax Season Calendar** (PDF, 1–2 pages) — the deadlines table + what Ledgerly does vs what the client's CPA does.
5. **Document Submission Policy** (MD, ~1 page) — portal usage, monthly cutoff (5th business day), accepted formats, what happens if documents are late (close slips to next cycle).
6. **Billing & Payment Terms** (MD, ~1 page) — invoicing dates, ACH, pause/reactivation, cancellation notice.

Mix of PDF and MD is intentional — it exercises both parsers (Phase 2).

## Golden set

Run in Phase 8 against the seeded Ledgerly bot. Record per question: answer correct? sources correct? in `docs/GOLDEN_SET_RESULTS.md`.

### In-scope (15) — must be answered correctly with the right source

| # | Question | Must contain | Expected source |
|---|---|---|---|
| 1 | How much does your basic plan cost? | $399/mo, Essential | Services & Pricing |
| 2 | What's included in the Growth plan? | AP, invoicing, quarterly call | Services & Pricing |
| 3 | Do you do tax returns? | No; CPA partner handoff | FAQ or Services |
| 4 | When do I need to send you my documents each month? | 5th business day | Submission Policy / FAQ |
| 5 | When will I get my monthly reports? | by the 20th | FAQ |
| 6 | How fast do you reply to questions? | 1 business day | FAQ |
| 7 | What do you need from me to get started? | 3 mo statements, prior return, QBO access | Onboarding |
| 8 | How long does onboarding take? | first close within 3 weeks | Onboarding |
| 9 | When is the S-corp filing deadline? | March 15 | Tax Calendar |
| 10 | When are quarterly estimated taxes due? | Apr/Jun/Sep 15 + Jan 15 | Tax Calendar |
| 11 | Does an extension delay my tax payment? | No — filing only | Tax Calendar |
| 12 | How does billing work? | invoice 1st, ACH on 5th | Billing Terms |
| 13 | What happens if I'm late on payment? | pause after 15 days, $25 fee | Billing Terms |
| 14 | How do I cancel? | 30 days written notice | Billing Terms / FAQ |
| 15 | I'm 6 months behind on my books — can you help? | catch-up, $299/mo of backlog | Services & Pricing |

### Out-of-scope (5) — must produce the honest fallback + a gap question, no invented answer

| # | Question | Why it's a trap |
|---|---|---|
| 16 | Can you recommend a business bank account? | adjacent topic, not in docs |
| 17 | What's your office address? | plausible-sounding, never stated |
| 18 | Do you support Xero? | only QuickBooks is mentioned; must not guess |
| 19 | How much do you charge for CFO advisory services? | service that doesn't exist; must not invent a price |
| 20 | What are the tax deadlines in Canada? | wrong jurisdiction |

**Pass bar:** 15/15 correct with correct sources; 5/5 honest refusals each creating a `gap_questions` row. Failures are bugs: calibrate `SIMILARITY_THRESHOLD`, chunking, or the system prompt, then re-run and update the results file.

## Seed requirements (Phase 8)

Demo account credentials in README (test data only). The Ledgerly bot: accent color #047857, welcome message "Hi! I'm Ledgerly's assistant. Ask me about our services, pricing, or deadlines." All 6 documents ingested and `ready`. At least 2 answered gap questions present, so the J4 loop is visible in the demo video without live setup.
