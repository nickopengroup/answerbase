# Answerbase — Build Plan

> Execution order for the agent. One phase per session. A phase is done when every acceptance criterion (AC) passes a manual check by the human.
> Items marked **HUMAN** are done by the human; the agent prints exact instructions and waits.

## Phase 0 — Scaffold

Project skeleton, tooling, deploy pipeline working end-to-end before any features.

- `create-next-app` (TypeScript, App Router, Tailwind 4) + shadcn/ui init restyled to DESIGN.md tokens
- Deps: `@openrouter/ai-sdk-provider`, `ai`, `zod`, `@supabase/ssr`, `@supabase/supabase-js`, `unpdf` (billing is mocked, so no `stripe`)
- Folder structure from ARCHITECTURE.md; `docs/` committed; `.env.example` with all variables
- Supabase migration #1: full schema from ARCHITECTURE.md incl. pgvector extension, `match_chunks` RPC, RLS policies
- **HUMAN:** create Supabase project, run migration, fill `.env.local` (Supabase keys, OpenRouter key)
- **HUMAN:** create GitHub repo (public), connect Vercel, add env vars there

**AC:** dev server runs; `next build` passes; deployed URL serves a placeholder page; migration applied without errors; `lib/embeddings.ts` smoke-test script embeds "hello world" via OpenRouter and prints vector length 1536.

## Phase 1 — Auth, workspace, app shell

- Supabase Auth (email+password): sign up / sign in / sign out, protected `(app)` routes
- On first login: auto-create workspace (plan=free)
- App shell: sidebar (Bots, Billing, Settings) per DESIGN.md; bot CRUD (name, welcome message, accent color); empty state for zero bots

**AC:** new user signs up and lands in an empty dashboard with a designed empty state; creates a bot; second user cannot see the first user's bot (RLS verified); UI uses tokens, not stock shadcn.

## Phase 2 — Documents pipeline

- Upload PDF/MD/TXT → Supabase Storage → `documents` row → parse → chunk → embed (batched) → `chunks` rows → status `ready`
- Per-row visible status (parsing → indexing → ready), polling; error rows show human-readable message + retry button
- Page counting (PDF real pages; MD/TXT `ceil(words/500)`); reject unsupported types with a friendly message

**AC:** a 5-page PDF and an MD file go from upload to `ready` with visible status transitions; chunks exist in DB with embeddings; a corrupted file shows a readable error and retries; a `.docx` upload is rejected politely.

## Phase 3 — RAG chat (in-app)

- Chat UI on the bot page; streaming via Vercel AI SDK
- Pipeline per ARCHITECTURE.md: embed question → `match_chunks` top 5 → refusal gate below `SIMILARITY_THRESHOLD` (skip LLM, fallback message, log `gap_questions`) → else stream answer with citations; `onFinish` refusal detector also logs a gap
- Sources rendered as muted chips under bot messages; messages + `top_similarity` persisted

**AC:** question answered by the docs streams an answer with correct source chips; out-of-scope question returns the honest fallback WITHOUT an LLM call (verify in logs) and creates an open gap question; answers never invent content beyond the docs (spot-check 5 questions).

## Phase 4 — Embeddable widget

- `public/embed.js` (vanilla, no deps): launcher bubble → iframe `/w/[token]`, postMessage open/close, accent color applied
- `/w/[token]` minimal chat per DESIGN.md widget spec; "Powered by Answerbase" on Free plan
- Public API `/api/widget/[token]/chat`: token-scoped, message limits enforced, basic per-token rate limit
- "Embed" tab on bot page: copy-snippet block (dark code block per DESIGN.md) + color picker
- Static `demo-ledgerly.html` test page with the widget embedded

**AC:** pasting the snippet into the plain HTML page shows a working widget; full ask-answer-sources flow works inside it; invalid token fails gracefully; widget matches DESIGN.md (sizes, animation, fallback style).

## Phase 5 — Billing (mocked) & limits

- `lib/limits.ts` enforced server-side on upload + both chat routes; `PLANS` constant with Free/Pro limits from PRODUCT_SPEC; friendly 402-style JSON the UI renders as an upgrade prompt
- Billing page shows current plan + usage meters (bots, pages, messages) with 80% warning and 100% block states; upgrade prompts per PRODUCT_SPEC
- Mock upgrade: "Upgrade to Pro" → confirmation step → server action sets `workspaces.plan = 'pro'` (no Stripe). "Downgrade to Free" reverses it for the demo
- No payment processor, no webhook, no HUMAN step

**AC:** Free workspace hitting the message limit gets blocked with an upgrade prompt (not an error); clicking Upgrade flips the plan to Pro and limits expand without re-login; "Powered by" disappears from the widget on Pro; Downgrade returns the workspace to Free limits.

## Phase 6 — Gap detection loop

- "Unanswered questions" page: open gaps list (question, time, channel), answer inline or dismiss
- Submitted answer → appended as a chunk to the bot's `gap_answer` document (created on first use), embedded; gap → `answered`
- Empty state for zero gaps ("Your bot is keeping up")

**AC:** asking the widget something not in the docs creates a gap; owner answers it; asking the SAME question again now returns the owner's answer with "Owner answers" as the source; dismissed gaps leave the list.

## Phase 7 — Landing

- `(marketing)` routes per DESIGN.md landing rules: hero with real product screenshot, how-it-works (3 steps, real UI crops), gap detection section, pricing, final CTA
- Copy voice per DESIGN.md; pricing mirrors PRODUCT_SPEC; CTAs lead to sign-up

**AC:** landing reads in under 60 seconds and a stranger can say what the product does and what it costs; screenshots are the real current build; no anti-slop violations; Lighthouse perf ≥ 90 on the landing.

## Phase 8 — Seed, golden set, polish, README

- Seed script: demo account with the Ledgerly bot, documents from `docs/CONTENT.md` ingested
- Run the 20-question golden set (15 in-scope, 5 out-of-scope) from CONTENT.md; record results in `docs/GOLDEN_SET_RESULTS.md`; fix failures (threshold calibration, chunking, prompt) and re-run
- Full pass over the app with the anti-slop checklist; fix copy
- README: what/why, stack, screenshots, "How this was built with Claude Code" (link CLAUDE.md, docs/, real workflow notes), local setup, env reference
- **HUMAN:** record the demo video; final Vercel deploy check

**AC:** golden set: 15/15 in-scope answered correctly with right sources, 5/5 out-of-scope refused honestly; seeded demo account works on production URL; README lets a stranger run the project locally without asking questions.
