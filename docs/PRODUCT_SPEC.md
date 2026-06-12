# Answerbase — Product Spec

> Status: locked for MVP. Any scope change must be reflected here first.
> This is a test assignment built as a real product MVP. Quality bar: ready to be shown to a paying customer.

## One-liner

Answerbase lets a bookkeeping firm turn its internal documents into a client-facing AI assistant: a chat inside the app and an embeddable widget for the firm's website.

## Problem & ICP

**ICP:** small US bookkeeping / CPA firms (2–20 people).

**Problem:** clients ask the same questions over and over (deadlines, "what documents do I send you", billing, onboarding steps). Answering them eats junior staff hours, and the load spikes every tax season. The answers already exist in the firm's documents; nobody wants to dig for them.

**Positioning note:** the niche lives in the landing page copy and demo content only. The product itself is a generic doc-to-chatbot builder; nothing niche-specific in the code.

## Users

1. **Firm owner / ops manager (our customer).** Signs up, uploads documents, configures the bot, embeds the widget, reviews unanswered questions, upgrades the plan.
2. **Firm's client (end user).** Asks questions through the widget on the firm's website or through a shared chat link. Never registers in Answerbase.

## Core user journeys

### J1 — Create a bot (owner)
Sign up → "Create bot" launches a 3-step wizard: **upload documents** (processing runs in the background with visible status) → **make it yours** (name, welcome message, and accent color arrive prefilled — the name from the content/filename, the welcome auto-generated from the document topics) → **try it** (an embedded test chat with one-click suggested-question chips that stream a cited answer). Goal: from "Create bot" to a streamed, cited answer in under 2 minutes with zero guesswork. The wizard is dismissible at any point; whatever was created persists.

### J2 — Ask a question (end user)
Open the firm's website → widget bubble in the corner → ask a question → get an answer with sources within a few seconds → if the answer is not in the knowledge base, the bot says so honestly instead of guessing.

### J3 — Embed (owner)
Bot page → "Embed" tab → copy one `<script>` snippet → paste into any website → widget works. A color picker for the widget accent color, nothing more.

### J4 — Close knowledge gaps (owner)
Dashboard → "Unanswered questions" → list of real end-user questions the bot could not answer → owner writes an answer inline → it is added to the knowledge base → bot can answer it from now on.

### J5 — Upgrade (owner)
Hit a Free plan limit (clear in-app message, no dead ends) → pricing page → confirm the (mocked) upgrade → back in the app with Pro limits active. Billing is mocked per the assignment; no real payment is taken.

## Feature scope

### In scope (MVP)

| Feature | Notes |
|---|---|
| Auth + workspace | Supabase Auth, email + password is enough |
| Bot CRUD | Name, accent color, welcome message |
| Onboarding wizard | 3-step bot creation (upload → personalize → try); name + welcome auto-prefilled from the documents |
| Suggested questions | Generated from the docs and **owner-editable** (edit / remove / add / regenerate on the bot page); shown in the wizard, the in-app test chat, and the widget; one click sends a cited answer |
| Document upload & processing | PDF / MD / TXT, processing status visible per document |
| RAG chat (in-app) | Answers with source citations, honest "I don't know" fallback |
| Embeddable widget | One script tag, iframe-based, token-scoped to one bot |
| Gap detection | Low-confidence / refused answers logged; owner can answer inline → answer joins the knowledge base |
| Plans & gating | Free / Pro limits enforced in-app with friendly upgrade prompts |
| Billing (mocked) | In-app upgrade/downgrade flips the plan; limits enforced for real; no payment processor (allowed by the assignment) |
| Landing page | Niche-flavored copy, pricing section, demo CTA |

### Explicitly out of scope

No multi-language, no team members / roles, no analytics dashboards, no integrations (Slack, email), no conversation history for end users, no fine-tuning, no file types beyond PDF/MD/TXT, no chat streaming if it costs more than an hour, no dark mode.

If a feature is not in the table above, it is out of scope. Cut quality never, scope always.

## Pricing & gating

| | Free | Pro — $29/mo |
|---|---|---|
| Bots | 1 | 3 |
| Document pages | 20 | 500 |
| End-user messages / month | 100 | 2,000 |
| "Powered by Answerbase" in widget | yes | removed |
| Widget accent color | yes | yes |

Gating behavior: limits are enforced server-side; the UI shows current usage (e.g. "73/100 messages this month") and a non-blocking upgrade prompt at 80%, a blocking one at 100%.

## Quality bar (applies to every feature)

- Every state is designed: empty, loading, error, success. No dead ends.
- All user-facing copy in English, written for a non-technical firm owner. No developer jargon in the app UI.
- The bot must never invent an answer. Refusing with "I don't have this in the knowledge base yet" is correct behavior and feeds J4.
- The widget is the most visible artifact of the product. It must look better than a default Intercom clone.

## Demo content

A fictional client, **Ledgerly Bookkeeping**, with 5–7 realistic documents (client FAQ, services & pricing, onboarding guide, tax deadlines calendar, document submission policy). Used for the demo video, the golden-set testing, and the seeded demo account. Spec lives in CONTENT.md.

## Deliverables (per the assignment)

1. Landing page (features + pricing)
2. Working web app (everything in scope above)
3. Video demo
4. Public repo with README, including a "How this was built with Claude Code" section
