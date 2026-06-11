# CLAUDE.md — Answerbase

You are building Answerbase, an embeddable AI chatbot builder. This is a real product MVP, not a prototype. A reviewer will judge the repo, the commits, and every pixel.

## Source of truth

Read before any work, in this order:
1. `docs/PRODUCT_SPEC.md` — what we build and why. Scope is locked there.
2. `docs/ARCHITECTURE.md` — technical decisions. Already made; don't re-decide.
3. `docs/DESIGN.md` — tokens and UI rules. Includes the anti-slop checklist.
4. `docs/PLAN.md` — phases and acceptance criteria. Work strictly phase by phase.

If these docs conflict with reality (a library API changed, a constraint is wrong), STOP and report the conflict with a proposed fix. Do not silently improvise around the docs.

## Working protocol

- One phase at a time. Never start the next phase without explicit approval.
- Begin each phase by restating its acceptance criteria, then plan, then implement.
- End each phase with: what was built, how to verify each acceptance criterion manually, anything cut or deferred (with reason).
- HUMAN steps in the plan (accounts, API keys, dashboard clicks) are not yours. Reach the step, print exact instructions for the human, and wait.
- When blocked or uncertain between two reasonable options: pick the simpler one, note the trade-off in one line, continue. Ask the human only when the options diverge in product behavior.

## Code conventions

- TypeScript strict. No `any`, no `@ts-ignore` in committed code.
- Zod-validate every API route input. Return typed, friendly JSON errors the UI can render.
- All model/embedding calls go through `lib/` modules only (`lib/rag.ts`, `lib/embeddings.ts`). Routes orchestrate; they don't talk to APIs directly.
- Schema changes only through `supabase/migrations/`. Never mutate the schema ad-hoc.
- Every async UI surface ships with empty / loading / error / success states in the same commit as the feature. A feature without its states is not done.
- User-facing copy: English, written for a non-technical firm owner. No jargon, no exclamation marks in errors. Copy quality is a graded criterion — write it like a PM, not like a scaffold.

## UI discipline

- Use tokens from `docs/DESIGN.md`. Stock shadcn colors are forbidden.
- Before declaring any UI done, run the anti-slop checklist at the bottom of DESIGN.md and fix violations.
- No gradients, no purple, no emoji as icons, no decorative illustrations.

## Commits

- Commit at every working increment, minimum one per phase task. Messages: imperative, specific ("Add refusal gate and gap question logging"), no "WIP", no "fix stuff".
- Never commit secrets. `.env.local` is gitignored; keep `.env.example` current whenever a new variable appears.

## Verification

- After each feature: run the build (`next build` must pass), exercise the happy path and one failure path manually via the dev server or a script, and say what you checked.
- Phase 8 includes a 20-question golden set run; treat its results as bugs to fix, not as a report to file.
