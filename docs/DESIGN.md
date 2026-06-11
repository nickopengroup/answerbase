# Answerbase — Design System

> Direction: clean product. White surfaces, ink typography, one confident accent, high copy quality. Reference feel: Linear / Stripe docs — calm, dense where it matters, zero decoration for decoration's sake.
> This doc exists because "default AI output" look is an explicit rejection criterion. When in doubt, remove rather than add.

## Tokens

Define as Tailwind 4 `@theme` variables. shadcn components are restyled to these tokens, never used with stock colors.

### Color

```
--background        #FFFFFF
--surface           #FAFAF9   (cards, sidebar — warm gray, not blue-gray)
--ink               #18181B   (primary text)
--muted             #71717A   (secondary text)
--border            #E7E5E4
--accent            #047857   (emerald 700 — actions, links, focus)
--accent-hover      #065F46
--accent-soft       #ECFDF5   (selected states, badges)
--danger            #B91C1C
--warning           #B45309   (usage meters near limit)
```

Rules:
- Accent is for interactive elements and key numbers only. If a screen is >10% green, it's wrong.
- No gradients anywhere. No purple. No glassmorphism, no glow, no floating 3D shapes.
- Dark UI only in one place: code/snippet blocks (embed code) on `--ink` background — this contrast is intentional and makes the embed step feel "developer-real".

### Typography

- One family: **Inter** (or Geist if already installed), all weights from 400/500/600. No serif, no display font.
- Scale: 15px base in the app (denser, product feel), 17–18px base on the landing.
- Headings: 600 weight, tight tracking (`-0.02em`), never uppercase.
- Numbers in usage meters and pricing: `tabular-nums`.

### Shape & depth

- Radius: 8px controls, 12px cards, 999px launcher bubble. One system, no mixing.
- Shadows: almost none. Cards separate by `--border` 1px lines, not shadows. Exceptions: widget panel and dropdowns get one soft shadow (`0 8px 30px rgb(0 0 0 / 0.08)`).
- Spacing: 4px grid. Landing sections breathe (96–128px vertical), app stays compact (16–24px gaps).

## Components

- **Buttons:** primary = accent bg / white text; secondary = white bg / border / ink text. No ghost-with-icon-only buttons in primary flows. Height 36px app, 44px landing.
- **Inputs:** 1px border, focus = accent ring. Labels always visible, no placeholder-as-label.
- **Cards:** surface bg, border, 12px radius, 20–24px padding.
- **Tables/lists:** row hover = surface tint; status as small text badges (accent-soft / warning / danger backgrounds), not colored dots alone.
- **Icons:** Lucide only, 16–18px, stroke 1.5, `--muted` by default. Never emoji as UI icons.

## Per-surface rules

### Landing
- Hero: one headline (max 8 words), one subline (max 2 sentences), one CTA, and a real product screenshot — not an illustration. No "trusted by" fake logos.
- Sections in order: hero → how it works (3 steps with real UI crops) → gap detection feature (the differentiator gets its own section) → pricing → final CTA. Nothing else; no testimonial fabrication, no FAQ unless time remains.
- Copy voice: written to a firm owner, plain words. Say "Your clients ask the same questions every tax season" — not "Revolutionize your client communication with AI".
- Pricing table mirrors PRODUCT_SPEC exactly. Free plan listed first, honestly.

### App
- Layout: left sidebar (bots, billing, settings) + content. No top-nav-plus-sidebar double chrome.
- Empty states are designed, not apologized: short line of copy + the one action that fixes it (e.g. empty bot → "Upload your first document" + upload button). No sad-folder illustrations.
- Document processing status is visible per row: parsing → indexing → ready, with error rows showing the human-readable message and a retry.
- Usage meters: thin bars + `73/100` tabular numbers; warning color from 80%.

### Widget (most-judged artifact)
- Launcher: 56px circle, accent color (owner-configurable), chat icon, subtle scale on hover.
- Panel: 380×560, 12px radius, soft shadow, opens with 150ms ease-out scale+fade from the launcher corner.
- Header: bot name + one-line description on accent background, white text.
- Messages: user = accent-soft bubble right; bot = white bubble with border, left. 15px text, relaxed line-height.
- Sources: under a bot message as small muted chips ("Client FAQ", "Tax calendar"). Click does nothing in MVP — they exist for trust, keep them non-interactive and honest.
- Honest fallback message style: same bubble, no error styling — "I don't have this in the knowledge base yet. The team has been notified." (ties J2 to J4).
- "Powered by Answerbase" (Free plan): 11px muted, footer, links to landing.
- Streaming: text streams token-by-token; typing indicator (three dots) before first token.

## Anti-slop checklist (run before any UI is called done)

1. Zero gradients, zero purple, zero emoji-as-icons.
2. Every string of microcopy reads like a human PM wrote it for a non-technical owner; no "Oops! Something went wrong :(", no exclamation marks in errors.
3. Buttons say what they do: "Copy embed code", not "Get started" everywhere.
4. All four states exist for every async surface: empty / loading / error / success.
5. Spacing is consistent on the 4px grid; nothing centered just because.
6. Landing screenshot is the real product, current build — re-shoot it after UI changes.
