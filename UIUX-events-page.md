# UI/UX Requirements Document
## ACM Digital City — Events Page ("Event Protocol")

**Version:** 1.0
**Companion docs:** PRD-events-page.md, TRD-events-page.md, MASTER-PROMPT-antigravity.md
**Visual reference:** concept mockup `events-page-concept.png` (produced in this design pass), derived from the existing "ACM Digital World / Boulevard" home page.

---

## 1. Design tokens

### 1.1 Color

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#04060B` | Page background |
| `--bg-panel` | `rgba(8,13,22,0.92)` | Popups, cards, HUD bar backgrounds |
| `--grid-line` | `rgba(120,220,240,0.05)` | Faint background grid |
| `--cyan` | `#38E8F5` (bright tile variant `#26E3EF`) | Primary accent; event 1, active/solved states, links |
| `--magenta` | `#D84FE0` (bright tile variant `#E14BEC`) | Secondary accent; event 2, alternating theme color |
| `--yellow` | `#FFCE54` | Tertiary accent; event 3 / billboard-style highlights |
| `--text-primary` | `#F3FCFD` | Headlines, high-emphasis text |
| `--text-body` | `#EAF6F8` | Standard body/label text on dark bg |
| `--text-muted` | `#8FB9C2` | Secondary/HUD copy |
| `--text-disabled` | `#546069` | Locked-state labels |
| `--border-cyan` | `rgba(56,232,245,0.5)` | Popup borders, active pill borders |
| `--border-hairline` | `rgba(120,220,240,0.18–0.25)` | Panel/face borders |

Additional per-event accent colors (events 4–6) should be selected as further saturated hues consistent with this palette (e.g., a deep teal, a violet, a warm amber) — never introduce a hue family outside this cyan/magenta/yellow/neon-on-near-black system (no warm creams, no default SaaS blues/greys).

### 1.2 Typography

| Role | Family | Weight | Notes |
|---|---|---|---|
| Display/headline | Space Grotesk | 700 | Tight letter-spacing (~-1px at large sizes), sentence set in caps for headline treatment only (e.g., "EVENT PROTOCOL") |
| HUD labels, eyebrows, meta, breadcrumbs | JetBrains Mono | 400–700 | Letter-spacing 1–3px, uppercase, small sizes (10.5–12px) |
| Body copy inside popups/descriptions | JetBrains Mono | 400 | 10.5–12px, line-height ~1.6–1.7 for legibility at small mono sizes |

Two-family system only (matches home page); do not introduce a third typeface.

### 1.3 Spacing, radius, elevation

- Corner radius: 4–6px on tiles/badges, 8–10px on cards/popups (small, "technical panel" radius — not the large rounded-card look of generic SaaS UI).
- Panels use 1px hairline borders in cyan/magenta at low opacity, not drop shadows, for separation — glow (`box-shadow`/bloom) is the elevation cue, not shadow-on-white-card conventions.
- Base spacing unit: 8px grid.

## 2. Layout — desktop (≥1024px)

```
┌───────────────────────────────────────────────────────────────┐
│ [AC] ACM DIGITAL CITY      BOULEVARD/EVENTS/…      [GLOBE][EVT]│  ← top HUD bar, fixed
├───────────────────────────────────────────────────────────────┤
│ ●                                                               │
│ ●   EVENT              [ cube, ~40% viewport width, right-  ]  │
│ ○   PROTOCOL.           [ aligned, rotates + solves in place ] │
│ ○   <sub copy>          [                                    ] │
│ ○                       [        popup anchors near cube     ] │
│ ○   [event legend list] [                                    ] │
│  ↑ progress rail                                               │
│ SCROLL forward to continue solving                              │
└───────────────────────────────────────────────────────────────┘
```

- Left column (~40% width): headline block, subcopy, event legend/side-list, scroll hint. Fixed/sticky while the cube stage is pinned.
- Right column (~55–60% width): the 3D cube, vertically and optically centered in the viewport.
- Progress rail sits at the far left edge, full-height between header and hint text.
- The detail popup, when open, anchors near the cube (bottom-right quadrant in the reference mockup) rather than full-screen-centered, to keep the cube visible as context.

## 3. Layout — mobile (<768px)

- Stack vertically: HUD bar (condensed — brand mark + hamburger/menu icon, breadcrumb hidden) → headline (smaller scale) → cube (centered, ~80vw, reduced perspective depth) → event list becomes a horizontally scrollable chip row or a collapsible bottom sheet, not a fixed side rail (no room).
- Progress rail collapses to a slim horizontal bar at the very top (under the HUD) or a compact "2 / 6" counter — a vertical dot rail is not usable at this width.
- Detail popup becomes a bottom sheet (slides up from bottom, full-width, rounded top corners only) rather than an anchored card, per standard mobile modal conventions.
- Touch scroll must drive the same stage progression as desktop wheel/trackpad scroll — no separate swipe gesture required, but swipe-to-scroll should not feel hijacked/janky (test on real devices, not just devtools emulation).

## 4. Component specifications

### 4.1 Top HUD bar
- Left: brand badge (monogram in bordered box) + wordmark, matching home page exactly (reuse asset/markup if available).
- Center: breadcrumb in monospace, slash-separated, current segment in cyan (e.g., `BOULEVARD / EVENTS / SOLVE TO UNLOCK`).
- Right: nav pills (`GLOBE VIEW`, `EVENTS`); the active page's pill has a filled/glowing state (cyan border + inset glow), matching the home page's active-state convention.

### 4.2 Progress rail
- Vertical row of 6 dots (one per event/face), hollow by default, filled + glowing in that event's accent color once its face is solved.
- Accompanying vertical (desktop) label: `CUBE TRAVERSAL — {n}%` in monospace, updates live with scroll.

### 4.3 Cube
- Rendered as a real 3D object (see TRD), not a flat illustration — must respond to scroll with continuous, smooth rotation (no snapping/jump-cuts between stages).
- Choreography (target orientation per stage, degrees, cumulative — see TRD §5 for interpolation logic):

  | Stage | Face revealed | rotateY | rotateX |
  |---|---|---|---|
  | 0 | Front | 0 | 0 |
  | 1 | Right | -90 | 0 |
  | 2 | Back | -180 | 0 |
  | 3 | Left | -270 | 0 |
  | 4 | Top | -270 | -90 |
  | 5 | Bottom | -270 | -180 |

- Each face: 3×3 grid of tiles, 8px gaps, dark tile background (`--bg-panel`-adjacent) when unrendered/scrambled-dark, moving through mixed scramble colors to a uniform accent color + neon glow (`box-shadow`/bloom) once solved.
- A small tag label (monospace, bordered pill) appears near a face once solved, e.g. `EVT.01 — SOLVED`, in that event's accent color.
- Tiles must never appear "half-glitched" at rest — only mid-scroll transitions show partial/interpolated states; a face at scroll-rest (user stopped scrolling) should read as clearly either scrambled or solved, not ambiguous.

### 4.4 Event side list / legend
- One row per event, in face order.
- Unlocked: colored swatch (filled, glowing) + title in `--text-body`. Clickable — opens detail popup. Hover/focus state: subtle brightening or border glow, not a background-color swap (keep dark theme consistent).
- Locked: dashed/outline swatch (no fill) + title in `--text-disabled`. Not clickable; do not show a pointer cursor; no hover state (communicates unavailability without needing a tooltip).

### 4.5 Scroll hint
- Small pill + label, e.g. `[SCROLL] forward to continue solving`, matching the home page's `SCROLL DOWN` convention.
- Must fade out (not disappear abruptly) after the user's first scroll input, and should not reappear once dismissed for the session.

### 4.6 Event detail popup
- Desktop: anchored card near the cube, ~300–340px wide, cyan-bordered, dark panel background, subtle outer glow.
- Mobile: bottom sheet, full width.
- Contents, top to bottom: close control (top-right, circular, bordered) · event code + category tag (monospace, cyan) · title (display font, larger) · date/time/venue meta row (monospace, muted, with the venue/date in higher-emphasis text) · description (monospace, muted, 1–3 sentences) · primary action button (e.g., "Register").
- Motion: pop/scale-and-fade in (~150–200ms, ease-out), not a hard cut; reverse on close. Respect reduced-motion (see §6): if reduced motion is set, cross-fade only, no scale/slide.
- Must trap focus while open and return focus to the triggering element on close (keyboard accessibility).

### 4.7 Post-sequence summary grid
- Standard responsive card grid (2–3 columns desktop, 1 column mobile), one card per event, each styled in its accent color (border + small glow), same click-to-open-popup behavior as the side list.
- Includes a closing CTA back to the home/boulevard page.

## 5. Interaction & motion principles

- **One orchestrated motion system, not scattered effects:** the cube solve/rotate is the single big motion moment of this page. Everything else (hover states, popup open/close, hint fade) should be quiet and quick (150–250ms), never competing with the cube for attention.
- **Scroll should feel driven, not fought:** avoid over-tight scroll-jacking that traps the user; always provide the side list / summary grid as an escape hatch to reach content without scrolling through the whole sequence (ties to PRD risk mitigation).
- **No ambiguous states at rest** (§4.3) — a user who stops scrolling mid-transition should still be able to tell, within one glance, roughly how "solved" the current face is (partial color/position interpolation is fine mid-motion, but avoid designs where a paused state looks broken rather than "in progress").
- **Consistent locked/unlocked language** across the cube, side list, and summary grid: same color (`--text-disabled` / dashed outline) and same interaction affordance (or lack thereof) everywhere a "locked" event appears.

## 6. Accessibility requirements

- Respect `prefers-reduced-motion`: render the `AccessibleFallbackList` (TRD §6) — a static, linear list of all 6 events (already "solved"/visible, no scramble animation, no scroll-jacking), using the same `EventDetailDialog` for details.
- The event detail dialog uses proper dialog semantics (`role="dialog"`, `aria-modal`, labelled by the event title), traps focus, and is closable via Escape.
- Color is never the sole differentiator: locked vs. unlocked also differs in border style (dashed vs. solid) and interactivity (cursor, focusability), not just color/opacity.
- All interactive elements (side list items, cube face click targets, popup close button, CTA) must be reachable and operable via keyboard, with a visible focus ring (cyan, consistent with the HUD accent) — this includes an alternate keyboard path to "activate" a solved cube face's popup even though the cube itself is a canvas element (e.g., the side list doubles as the keyboard-operable trigger; the canvas need not itself be focusable).
- Text contrast: body/label text on the dark backgrounds must meet WCAG AA (verify `--text-muted` and `--text-disabled` specifically, as low-opacity/desaturated text on near-black backgrounds is the most likely contrast failure point).
- Provide meaningful alt/labelling for the cube experience for screen reader users who do not trigger the reduced-motion fallback automatically (e.g., an `aria-live` region or visually-hidden summary announcing progress, or simply ensure the fallback list is what's exposed to assistive tech regardless of motion preference — recommended: always render `AccessibleFallbackList`'s content in the DOM for AT, visually hidden, when the 3D experience is active).

## 7. States checklist

- [ ] Initial load (all faces scrambled, 0% progress)
- [ ] Mid-scroll, face partially solved
- [ ] Face just-solved (tag/label reveal moment)
- [ ] All 6 faces solved, cube at rest
- [ ] Popup open (per event) — desktop anchored card
- [ ] Popup open — mobile bottom sheet
- [ ] Locked event hover/focus attempt (no-op, but should feel intentional, not broken)
- [ ] Post-sequence summary grid
- [ ] Reduced-motion / no-WebGL fallback list
- [ ] Narrow-viewport (mobile) layout at each of the above states

## 8. Out of scope for this doc

- Visual design of the home page itself (referenced, not redesigned).
- Copy/content beyond placeholder seed data (final event copy is a content task, not a design task).
