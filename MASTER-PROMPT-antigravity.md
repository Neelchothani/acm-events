# Master build prompt — paste into Antigravity

> Attach `events-page-concept.png` (the reference mockup) to this prompt if Antigravity accepts image input — it is the single clearest reference for the color, type, and layout system described below. Everything in this prompt is also self-contained in text in case it doesn't.

---

You are building a standalone, production-quality **prototype** of an "Events" page for a college ACM student chapter's website, called internally **"Event Protocol."** It is a companion page to an existing home page ("ACM Digital World / Boulevard") that is a scroll-driven 3D "digital city" experience in a dark, neon cyberpunk style. This new page does not need to reuse the home page's code, but it must look and feel like it belongs to the exact same product.

**The central idea:** a 3D Rubik's Cube where each of the 6 faces represents one event. As the visitor scrolls, the cube visually solves itself one face at a time — each face starts scrambled (mixed colors, tiles offset/rotated) and resolves into a single uniform neon color as that event "unlocks." Clicking an unlocked face (or its entry in a side list) opens a detail popup with the event's information.

## 1. Tech stack (use exactly this — do not substitute Next.js or a different 3D approach)

- **React 18 + Vite** (plain SPA, not Next.js — no SSR/file-based routing needed)
- **Three.js via React Three Fiber (`@react-three/fiber`)** for the actual 3D cube — build it as real geometry with real lighting, not a CSS/2D illusion
- **`@react-three/drei`** for `ScrollControls`/`useScroll` and HTML-in-3D overlay helpers
- **GSAP + ScrollTrigger** for scrubbing animation values precisely against scroll position (or drei's `useScroll().offset` if you find that sufficient — GSAP is preferred for the smoothing/easing control)
- **`@react-three/postprocessing`** for a Bloom pass to get real neon glow on the cube tiles
- **Tailwind CSS** for all HUD/panel/badge/typography styling outside the canvas
- **Radix UI Dialog** (`@radix-ui/react-dialog`) + **Framer Motion** for the accessible, animated event-detail popup
- **Zustand** for global state (current stage, per-face solve progress, unlocked faces, active popup)
- **Fonts:** Space Grotesk (headings, weight 700) + JetBrains Mono (HUD labels/body, weights 400–700) — load via Google Fonts or `@fontsource`
- **Vitest + React Testing Library** for basic component tests

Build this as a clean, well-organized codebase a human developer can pick up afterward — proper component decomposition, no giant single-file dump.

## 2. Visual design system (must match — do not default to a generic template look)

**Background:** near-black `#04060B`, with a very faint cyan grid overlay (`rgba(120,220,240,0.05)` lines) and soft radial glow washes in cyan and magenta at opposite corners, low opacity — this is a "digital city at night" feeling, not a flat dark mode.

**Color palette:**
- Cyan `#38E8F5` (bright tile `#26E3EF`) — primary accent, event 1
- Magenta `#D84FE0` (bright tile `#E14BEC`) — secondary accent, event 2
- Yellow `#FFCE54` — tertiary accent, event 3
- Choose 3 more distinct neon-appropriate accents for events 4–6 within the same cyan/magenta/yellow/neon-on-black family (e.g., deep teal, violet, amber) — never introduce beige/cream/generic SaaS blue.
- Text: near-white `#F3FCFD` for headlines, `#EAF6F8` for body, `#8FB9C2` for muted HUD copy, `#546069` for disabled/locked labels.
- Panels/popups: `rgba(8,13,22,0.92)` background, 1px cyan-tinted hairline border (`rgba(56,232,245,0.5)`), no drop shadows — use glow (box-shadow/bloom), not shadow-on-white-card conventions.

**Typography:** Space Grotesk 700 for display headlines (tight tracking, large sizes, e.g. "EVENT PROTOCOL"); JetBrains Mono for every HUD label, breadcrumb, eyebrow, tag, and body copy inside popups — uppercase, letter-spaced 1–3px for labels, small sizes (10.5–12px).

**Chrome conventions (reuse this vocabulary exactly):**
- Top HUD bar: brand monogram in a bordered box + wordmark on the left; monospace breadcrumb in the center (e.g. `BOULEVARD / EVENTS / SOLVE TO UNLOCK`, active segment in cyan); nav "pills" on the right (bordered capsules, active one filled/glowing).
- A vertical progress rail on the far left: 6 dots (hollow → filled+glowing per solved face) plus a vertical label like `CUBE TRAVERSAL — 42%`.
- A scroll hint pill at the bottom, e.g. `[SCROLL] forward to continue solving`, that fades out after first scroll input.
- Small bordered "tag" pills (monospace, colored border) for things like `EVT.01 — SOLVED`.

Corner radius: small everywhere (4–6px tiles/badges, 8–10px cards) — this is a technical/HUD aesthetic, not a soft rounded SaaS look.

## 3. Page structure & behavior

**Layout (desktop ≥1024px):** left ~40% column = headline block ("EVENT PROTOCOL.") + subcopy + a persistent event legend/side-list + scroll hint. Right ~55–60% column = the 3D cube, vertically centered. Progress rail at the far left edge.

**Layout (mobile <768px):** stack vertically; HUD bar condenses (brand + menu icon, breadcrumb hidden); cube centered ~80vw; event list becomes a horizontal scroll row or bottom sheet; progress rail collapses to a slim horizontal bar or "2/6" counter; popup becomes a full-width bottom sheet instead of an anchored card.

**Core scroll mechanic:**
1. The page has a pinned scroll region covering 6 stages (one per event/face). Use `ScrollControls`/`useScroll` to get a 0–1 offset across the whole region.
2. `stageIndex = floor(offset * 6)`, `stageProgress = fract(offset * 6)`.
3. The cube's overall rotation interpolates through these cumulative target angles as stages advance (smoothly, never snapping):

   | Stage | Face revealed | rotateY | rotateX |
   |---|---|---|---|
   | 0 | Front | 0° | 0° |
   | 1 | Right | -90° | 0° |
   | 2 | Back | -180° | 0° |
   | 3 | Left | -270° | 0° |
   | 4 | Top | -270° | -90° |
   | 5 | Bottom | -270° | -180° |

4. Each face is a 3×3 grid of 9 tiles. At `stageProgress = 0` for that face, each tile has a randomized position offset, rotation, and a random "scramble" color from the palette. As `stageProgress → 1`, each tile's offset/rotation lerps to zero (aligned) and its color lerps to that event's single accent color, ending in a uniform glowing face.
5. Once a face's progress reaches ~0.98+, mark it permanently unlocked in state — it does not re-scramble if the user scrolls back up (scrolling back just reverses the visual transition state, but never re-locks an already-unlocked event).
6. The side list (and, on mobile, the chip row/bottom sheet) shows all 6 events at all times: unlocked ones show their accent color and are clickable; locked ones are dimmed with a dashed outline and are not interactive (no pointer cursor, no hover state).
7. Clicking an unlocked cube face or its side-list entry opens a Radix Dialog with: event code (e.g. `EVT.02`), category tag, title, date/time/venue, a 1–3 sentence description, and a primary action button ("Register", can link to `#` for now). Closeable via close button, Escape, or backdrop click, with proper focus trap/return.
8. After the 6th face is solved, continued scroll releases the pin into a normal static section: a responsive grid of all 6 events as cards (same accent-color theming), each still clickable to reopen its dialog, ending with a "Back to Boulevard" link (can point to `/` or `#`).

## 4. Content (seed data — put this in one clearly-named data file, e.g. `src/data/events.js`, so non-developers can edit it later)

1. **EVT.01 — Hack the Grid** — 24-hour hackathon — Apr 11, 18:00–18:00 (+1d) — ACM Arena — "Overnight build sprint across the digital city. Teams ship a working prototype by sunrise." — accent cyan
2. **EVT.02 — Signal Boost** — AI/ML summit — accent magenta
3. **EVT.03 — Design Sprint** — UI/UX workshop — accent yellow
4. **EVT.04 — CTF Night** — cybersecurity capture-the-flag — accent (your choice, e.g. deep teal)
5. **EVT.05 — Founder's Protocol** — startup/founder talks — accent (your choice, e.g. violet)
6. **EVT.06 — Demo Day** — project showcase & awards — accent (your choice, e.g. amber)

Invent plausible dates/times/venues/1–3 sentence descriptions/tags for events 2–6 consistent with the tone of event 1 — these are prototype placeholders, clearly labeled as such is not required in the UI, just keep them realistic.

## 5. Non-functional requirements

- Respect `prefers-reduced-motion`: render a static, linear fallback list of all 6 events (no cube, no scroll-jacking) with the same detail dialog, if the user has that preference set or WebGL isn't available.
- Keyboard accessible: every interactive element (side list, dialog controls, CTA) reachable and operable via keyboard with a visible cyan focus ring; locked vs. unlocked is never communicated by color alone (also differ in border style and interactivity).
- Meet WCAG AA text contrast, especially for muted/disabled text on the near-black background.
- Target 60fps on desktop, degrade gracefully (disable Bloom, simplify to flat colors) on low-end devices — add a lightweight FPS check or a manual "low graphics" toggle if time allows.
- Fully responsive from 360px phones to widescreen desktop.
- No console errors on load or through a full scroll-through.

## 6. Deliverables

1. A working Vite + React app implementing everything above.
2. Clean component structure roughly like:
   ```
   src/
     App.jsx
     data/events.js
     store/useEventsStore.js
     components/
       hud/ (TopHudBar, ProgressRail, ScrollHint)
       cube/ (EventsExperience, CubeRig, Face, Tile)
       events/ (EventSideList, EventDetailDialog, SummaryGrid, AccessibleFallbackList)
     styles/ (tokens.css, index.css)
     utils/ (color.js, scramble.js)
   ```
3. A short README covering: how to run it locally, where to edit event content, and any known limitations (e.g., fixed 6-event/cube-face limit).

Build it end-to-end, then do a self-review pass against this checklist before calling it done:
- [ ] All 6 faces solve correctly in scroll order and stay solved on scroll-back
- [ ] Locked events are visibly non-interactive; unlocked events open the correct dialog
- [ ] Dialog is keyboard-operable and closes via Escape/backdrop/close button
- [ ] Post-sequence summary grid appears after the 6th face and links back "home"
- [ ] Reduced-motion fallback works and shows the same content without animation
- [ ] Layout holds together at 360px, 768px, 1024px, and 1440px+ widths
- [ ] No console errors
