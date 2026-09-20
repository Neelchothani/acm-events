# Technical Requirements Document
## ACM Digital City — Events Page ("Event Protocol")

**Version:** 1.0
**Companion docs:** PRD-events-page.md, UIUX-events-page.md, MASTER-PROMPT-antigravity.md

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| UI framework | **React 18** (via Vite, not Next.js) | SPA is sufficient — no SSR/routing needs beyond one page; Vite gives a much faster dev loop than CRA/Next for a visual/animation-heavy build |
| Build tool | **Vite** | Fast HMR, native ESM, trivial config for React + Three.js |
| 3D rendering | **Three.js** via **React Three Fiber (`@react-three/fiber`)** | Declarative scene graph that fits React's component model; the cube is real geometry (not CSS), enabling proper lighting/bloom |
| 3D helpers | **`@react-three/drei`** | `ScrollControls`, `Scroll` (HTML-in-3D-space overlay), `Html`, camera helpers |
| Scroll-driven animation | **GSAP + ScrollTrigger** | Precise scrubbing of numeric values (rotation angle, per-tile solve progress, color lerp) against scroll position; industry standard for this exact pattern |
| Postprocessing | **`@react-three/postprocessing`** (Bloom, optionally Vignette) | Achieves the neon-glow look on tiles/edges without faking it via layered box-shadows |
| Styling | **Tailwind CSS** | Fast, consistent implementation of the HUD/panel/badge system defined in the UIUX doc |
| Overlay UI (popup) | **Radix UI Dialog primitive** (`@radix-ui/react-dialog`) + **Framer Motion** for enter/exit transitions | Accessible modal semantics (focus trap, Escape-to-close, ARIA) out of the box; Framer Motion for the pop-in animation |
| State management | **Zustand** | Minimal global store for: current stage index, per-face solve progress, which events are unlocked, which event's popup is open |
| Fonts | **Space Grotesk** (headings) + **JetBrains Mono** (HUD/labels), loaded via `@fontsource` packages or Google Fonts `<link>` | Matches home page type system |
| Linting/formatting | ESLint + Prettier | Standard hygiene |
| Testing | **Vitest** + **React Testing Library** for component/unit tests; manual QA checklist (from UIUX doc) for the animation/interaction layer, since scroll-scrubbed 3D animation is impractical to unit test meaningfully | |
| Deployment | Static build (`vite build`) to any static host (Vercel, Netlify, GitHub Pages, or the chapter's existing host) | No server-side requirements |

**Explicitly not used:** Next.js (per requirement — plain React/Vite SPA instead), Redux (Zustand is sufficient at this scale), a CMS/backend (out of scope per PRD).

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────┐
│                        App.jsx                           │
│  ┌───────────────┐   ┌────────────────────────────────┐ │
│  │  TopHudBar     │   │        EventsExperience         │ │
│  │  (nav, brand)  │   │  (owns ScrollControls region)   │ │
│  └───────────────┘   │  ┌────────────────────────────┐  │ │
│                       │  │  <Canvas> (R3F)             │  │ │
│                       │  │   ├─ CubeRig                │  │ │
│                       │  │   │   ├─ Face x6            │  │ │
│                       │  │   │   │   └─ Tile x9        │  │ │
│                       │  │   ├─ Lighting                │  │ │
│                       │  │   └─ Bloom (postprocessing)  │  │ │
│                       │  └────────────────────────────┘  │ │
│                       │  ┌────────────────────────────┐  │ │
│                       │  │  HTML overlay (Scroll html) │  │ │
│                       │  │   ├─ ProgressRail            │  │ │
│                       │  │   ├─ EventSideList           │  │ │
│                       │  │   ├─ ScrollHint              │  │ │
│                       │  │   └─ EventDetailDialog       │  │ │
│                       │  └────────────────────────────┘  │ │
│                       └────────────────────────────────┘ │
│  ┌───────────────┐                                        │
│  │ SummaryGrid    │  (post-sequence, normal DOM flow)      │
│  └───────────────┘                                        │
└─────────────────────────────────────────────────────────┘

State (Zustand store: useEventsStore)
  - stageProgress: number[6]      // 0..1 solve progress per face
  - unlockedFaces: boolean[6]
  - activeEventId: string | null  // drives the popup
  - reducedMotion: boolean
```

GSAP ScrollTrigger owns the authoritative scroll→progress mapping (one ScrollTrigger per stage, `scrub: true`), and on each update writes into the Zustand store. React Three Fiber components subscribe to the store and re-render/interpolate accordingly (via `useFrame` for smoothing, not directly re-rendering React on every scroll tick, to avoid perf issues — see §5).

## 3. Component breakdown

| Component | Responsibility |
|---|---|
| `App` | Top-level layout: HUD bar, `EventsExperience`, `SummaryGrid`, dialog portal root |
| `TopHudBar` | Brand mark, breadcrumb, nav pills (shared visually with home page; can be extracted into a shared package/component if home page code is accessible) |
| `EventsExperience` | Wraps `ScrollControls` (drei) around the `<Canvas>` + HTML overlay; defines total scroll "pages" (6 pages, one per event, `pages={6}` or similar) |
| `CubeRig` | The `<group>` holding the cube; owns overall rotation (rotateY/rotateX) driven by current stage; renders 6 `Face` children |
| `Face` | One face of the cube: a 3×3 grid of `Tile` meshes positioned in local space; receives `solveProgress` (0–1) and `themeColor` as props |
| `Tile` | A single cubie face: interpolates position offset, rotation, and color between a randomized "scrambled" state and its solved target based on `solveProgress` |
| `ProgressRail` | Vertical dot rail + percentage label (HTML overlay, fixed position) |
| `EventSideList` | List of all 6 events with locked/unlocked visual state; click handler sets `activeEventId` |
| `ScrollHint` | Small "scroll to solve" prompt, fades out after first scroll input |
| `EventDetailDialog` | Radix Dialog + Framer Motion wrapper rendering event details from `eventsData` by `activeEventId` |
| `SummaryGrid` | Post-sequence static grid of all events (plain DOM, no 3D), reachable by continued scroll and directly linkable (e.g., `#all-events` anchor) |
| `AccessibleFallbackList` | Rendered instead of the 3D experience when `prefers-reduced-motion` is set or WebGL is unavailable — a linear, static list of all 6 events with the same detail dialog interaction (see UIUX doc §6) |

## 4. Data schema

Single source of truth for event content, e.g. `src/data/events.js`:

```js
export const events = [
  {
    id: "evt-01",
    code: "EVT.01",
    title: "Hack the Grid",
    tagline: "24-hour build sprint",
    date: "2026-04-11",
    time: "18:00 – 18:00 (+1d)",
    venue: "ACM Arena",
    description: "Overnight build sprint across the digital city. Teams ship a working prototype by sunrise.",
    tags: ["Hackathon"],
    accentColor: "#26E3EF",
    ctaLabel: "Register",
    ctaHref: "#"
  }
  // ... 5 more, one per cube face, in face order:
  // front, right, back, left, top, bottom
];
```

This is the one file organizers edit each semester (per PRD §6/§10 maintainability requirement). No animation or layout code should read event content from anywhere else.

## 5. Scroll-sync & animation logic

1. `ScrollControls` (drei) creates a scrollable region of virtual "pages" (one per stage) and exposes scroll offset (0–1 across the whole region).
2. A GSAP ScrollTrigger (or a `useFrame` + drei `useScroll` hook, since drei's `useScroll().offset` already gives a smoothed 0–1 value) computes:
   - `stageIndex = floor(offset * 6)`
   - `stageProgress = fract(offset * 6)`
3. `CubeRig` interpolates its rotation across two keyframe orientations (per-stage target Euler angles, predefined — see UIUX doc's cube choreography table) using `stageIndex` + `stageProgress`, applied via `useFrame` with a `lerp`/`damp` for smoothing (avoid snapping).
4. Each `Tile` in the currently-active face computes:
   - `position = lerp(scrambledOffset, [0,0,0], stageProgress)`
   - `rotation = lerp(scrambledRotation, 0, stageProgress)`
   - `color = lerpColor(scrambledColor, accentColor, stageProgress)`
   - Scrambled offsets/rotations/colors are generated once per tile at mount (seeded random is fine; determinism not required) and memoized.
5. When `stageProgress` for a given face first reaches ≥ 0.98, dispatch `unlockFace(index)` to the Zustand store (one-way; does not re-lock on scroll-back, per PRD §6.1).
6. Zustand store updates are read by `EventSideList`/`ProgressRail` via React state (cheap, low-frequency UI), while the high-frequency per-frame interpolation (tile transforms) stays inside `useFrame` callbacks and refs, **not** React state, to avoid re-render thrashing at 60fps.

### Performance guardrails
- Cap total draw calls: 6 faces × 9 tiles = 54 meshes; use `InstancedMesh` if profiling shows this is a bottleneck on low-end devices (unlikely at this count, but noted).
- Bloom postprocessing pass is the most expensive part visually; expose a "low graphics" toggle (or auto-detect via a simple FPS probe on load) that disables Bloom and falls back to CSS `box-shadow`-style glow approximations — or simply flat colors — on low-end devices.
- Lazy-load the `<Canvas>`/Three.js bundle (dynamic `import()`) so the HUD/nav shell paints immediately while the 3D scene initializes.

## 6. Reduced motion & non-WebGL fallback

- On mount, check `window.matchMedia('(prefers-reduced-motion: reduce)')` and WebGL availability (basic feature detect).
- If either fails/opts out: render `AccessibleFallbackList` instead of `EventsExperience`. This is a normal scrolling page: each event as a static card in solved-color state, same `EventDetailDialog` on click. No cube, no scroll-jacking.
- This fallback path shares the same `eventsData` and `EventDetailDialog` component, so there is exactly one place event content and detail-view markup are defined.

## 7. Extensibility notes (not built now, but don't block)

- Data schema (`events.js`) is shaped so it could be swapped for a fetch from a headless CMS or JSON endpoint later without touching component code (components should accept `events` as data, not import the static file directly at the leaf level — inject at the `EventsExperience`/`App` level).
- `ctaHref` already supports an external registration link; wiring a real form/ticketing flow later only touches that one field's target, not the animation system.

## 8. File/folder structure

```
src/
  main.jsx
  App.jsx
  data/
    events.js
  store/
    useEventsStore.js
  components/
    hud/
      TopHudBar.jsx
      ProgressRail.jsx
      ScrollHint.jsx
    cube/
      EventsExperience.jsx
      CubeRig.jsx
      Face.jsx
      Tile.jsx
    events/
      EventSideList.jsx
      EventDetailDialog.jsx
      SummaryGrid.jsx
      AccessibleFallbackList.jsx
  styles/
    tokens.css        (color/type variables, see UIUX doc)
    index.css          (Tailwind entry)
  utils/
    color.js           (lerpColor helper)
    scramble.js         (per-tile randomized state generator)
public/
  fonts/ (if self-hosting instead of Google Fonts CDN)
```

## 9. Acceptance criteria (engineering-facing, maps to PRD §6)

- [ ] Scrolling from top to bottom of the events sequence visibly solves all 6 faces in order, each ending in a uniform accent color.
- [ ] Scrolling back up does not re-scramble an already-solved face.
- [ ] Clicking any unlocked face or its side-list entry opens `EventDetailDialog` with correct data for that event.
- [ ] Locked events are visually distinct (dimmed/dashed) and are not clickable (no dialog opens; verified via disabled state, not just CSS).
- [ ] Escape key, backdrop click, and an explicit close button all close the dialog.
- [ ] After the 6th face solves, continued scroll reaches `SummaryGrid` with all 6 events visible and clickable.
- [ ] With `prefers-reduced-motion: reduce` set, the page renders `AccessibleFallbackList` with no 3D canvas and no scroll-jacking.
- [ ] Lighthouse mobile performance score ≥ 70 on the production build.
- [ ] No console errors/warnings on load or through a full scroll-through in Chrome, Safari, Firefox.
