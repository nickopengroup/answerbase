# Answerbase — Design System

> Direction: **warm editorial**. Paper neutrals, a single forest-green accent, serif display headings over a clean sans for body and UI. Calm and confident, with character — not the flat "default AI output" look (an explicit rejection criterion). When in doubt, remove rather than add.
> The marketing landing carries the fullest expression of this (paper background, serif headlines with italic green emphasis, hand-set mini-UI mockups); the app applies it more lightly (white/paper surfaces, serif page titles, forest accent) so it stays dense and readable.

## Tokens

Define as Tailwind 4 `@theme` variables (see `app/globals.css`). shadcn components are restyled to these tokens, never used with stock colors. The landing has its own scoped palette in `app/(marketing)/landing.css`.

### Color

App tokens:
```
--background        #FFFFFF
--surface           #FAF8F1   (cards, sidebar — warm paper)
--ink               #1C1A14   (primary text, warm near-black)
--muted-foreground  #5A574C   (secondary text)
--border            #E6E1D4
--brand / accent    #2E5A45   (forest green — actions, links, focus)
--brand-hover       #234936
--brand-soft        #E1E8E0   (selected states, badges, chips)
--danger            #B3402E
--warning           #9A6A16   (usage meters near limit)
```

Landing palette (scoped `.lp`): `--paper #F4F1E8`, `--paper2 #ECE7DA`, `--card #FBFAF5`, `--ink #1C1A14`, `--mid #5A574C`, `--acc #2E5A45`, with the dark "honest" section on `--ink`.

Rules:
- Accent is for interactive elements and key numbers only. If a screen is >10% green, it's wrong.
- No gradients anywhere. **No purple.** No glassmorphism, no glow, no floating 3D shapes.
- Dark UI in two intentional places: code/snippet blocks on `--ink`, and the landing's "honest" section (ink background, mint-green accents).

### Typography

- Two families: **Archivo** (sans — body, UI, buttons) and **Newsreader** (serif — display headings, with italic for emphasis). Geist Mono only inside code/snippet blocks.
- Serif is for page titles (`h1`/`h2`) and landing display; card titles, labels, and dense UI stay in Archivo. Don't set forms or controls in serif.
- Scale: 15px base in the app (denser, product feel), 17–18px base on the landing.
- Serif headings: 400–500 weight, tight tracking (`-0.02em`), italic green for the one emphasized phrase. Sans headings (h3/h4): 600 weight. Never uppercase except eyebrow labels (uppercase, letter-spaced, green).
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

### Landing (editorial)
- Paper background, serif (Newsreader) display headlines with one italic green-emphasized phrase; Archivo for body and buttons. Pill buttons (forest fill or ink outline). Eyebrow labels with a leading dash.
- Hero: serif headline + one subline + two CTAs (Start free / See pricing) + a hand-set "chat card" mock showing a question, a cited answer, and a source chip — illustrative UI, not a raw screenshot. No "trusted by" fake logos.
- Sections in order: hero → how it works (3 steps, roman numerals, each with a small UI mock: documents list, playground, embed snippet+widget) → "honest" differentiator (dark ink section: refusal + gap rows) → pricing → final CTA → footer.
- Copy voice: written to a firm owner, plain words. Say "Your customers ask the same questions" — not "Revolutionize your client communication with AI".
- Pricing mirrors PRODUCT_SPEC exactly. Free plan listed first, honestly; Pro card is the dark one.
- Implementation: scoped styles in `app/(marketing)/landing.css` under `.lp`; the page is self-contained (no dependency on captured screenshots).

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
6. Serif is reserved for display/page titles; forms, controls, and dense UI stay in Archivo (sans).
7. README product screenshots are the real, current build — re-capture after a visual change (`demo@answerbase.app`, then shoot the Test chat card and the widget preview).
