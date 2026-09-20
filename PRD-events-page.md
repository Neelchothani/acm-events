# Product Requirements Document
## ACM Digital City — Events Page ("Event Protocol")

**Version:** 1.0
**Status:** Draft for prototype build
**Owner:** ACM Student Chapter — Web Team
**Related docs:** TRD-events-page.md, UIUX-events-page.md, MASTER-PROMPT-antigravity.md

---

## 1. Background

The ACM chapter site currently has a home page ("ACM Digital World / Boulevard") built as a scroll-driven journey: a globe zooms into a neon, low-poly "digital city," and scrolling forward drives the camera down a boulevard past buildings that represent site sections (Team, Research, About Us). The Events section is currently just one of those buildings/signposts, with no dedicated experience.

This PRD covers a **standalone Events page** that continues the same visual language and interaction model, but replaces the boulevard drive with a **3D Rubik's Cube** as the central metaphor: each face of the cube represents one event. As the user scrolls, the cube solves itself face by face, revealing events in sequence. Clicking a revealed event opens a detail popup.

## 2. Problem statement

- The current site has no dedicated space to showcase individual events with real information (date, time, venue, description).
- The chapter wants every new page to feel like part of the same "digital city," not a generic sub-page — visually and mechanically consistent with the home page's scroll-driven, HUD-styled, neon aesthetic.
- Static event listings (a plain list or grid) would look out of place next to the home page's highly animated, game-like presentation.

## 3. Goals

1. Give each event a memorable, on-brand reveal moment tied to scrolling, not a static list.
2. Make the "solve the cube" mechanic legible in under 5 seconds without instructions (scroll hint text is the only onboarding).
3. Let a visitor get full event details (what/when/where) in at most one click from the moment a face is solved.
4. Keep the page visually and tonally identical to the home page: same palette, type system, HUD conventions, and motion character.
5. Ship as a working, deployable prototype (not just a design comp) that the chapter can iterate on.

### Non-goals (out of scope for this build)
- Backend/CMS for managing events (content is static/hard-coded for the prototype).
- Ticketing, RSVP, or registration processing (a "Register" action can be a stub / external link).
- User accounts, login, or personalization.
- Supporting more than 6 events (a cube has 6 faces — see §6.4 for the fallback plan if the chapter needs more).
- Full accessibility parity for the 3D cube interaction itself (see UIUX doc for the accessible fallback list view, which *is* in scope).

## 4. Target users

- **Prospective attendees** (primary): students browsing the ACM site to find out what's happening and when. Mobile and desktop, mixed technical literacy, low patience for confusing navigation.
- **Chapter members / organizers** (secondary): people who will copy-paste this page's structure to update events each semester. They are not necessarily developers, so the event data should be easy to find and edit (see TRD §4, data schema).
- **Recruiters / visiting judges / sponsors** (tertiary): people forming a first impression of the chapter's technical polish. The "wow" factor of the cube matters for this group specifically.

## 5. User stories

| # | Story | Priority |
|---|-------|----------|
| 1 | As a visitor, I can tell within a few seconds that scrolling advances/solves something, without reading instructions. | P0 |
| 2 | As a visitor, as I scroll, I see the cube visibly un-scramble one face at a time. | P0 |
| 3 | As a visitor, once a face is solved, I can see that event's name at a glance (in a side list and/or on the cube face itself). | P0 |
| 4 | As a visitor, I can click a solved event (on the cube or in the side list) and see its full details in a popup: name, date, time, venue, short description. | P0 |
| 5 | As a visitor, I can close the popup and resume scrolling/exploring without losing my place. | P0 |
| 6 | As a visitor, I cannot open details for an event whose face hasn't been solved yet (locked state is visually obvious). | P1 |
| 7 | As a visitor on mobile, I get the same information and interactions, adapted to touch and a narrower viewport. | P0 |
| 8 | As a visitor who scrolls past all 6 faces, I land on a summary section listing all events as a normal grid, so I can revisit any of them without re-scrolling the whole sequence. | P1 |
| 9 | As a visitor using a screen reader or with reduced-motion settings, I can still get to every event's information via a non-animated, linear fallback. | P1 |
| 10 | As an organizer, I can find and edit event content (title, date, description, etc.) in one obvious place without touching animation code. | P1 |
| 11 | As a visitor, I can navigate back to the home page / boulevard from this page via the same top HUD nav used site-wide. | P2 |

## 6. Functional requirements

### 6.1 Cube & scroll mechanic
- The page has one continuous scroll-driven sequence covering 6 stages, one per event/face.
- Scroll progress within a stage animates that face's 9 tiles from a "scrambled" state (mixed colors, randomized offset/rotation per tile) to a "solved" state (uniform event-color tiles, aligned).
- Once a face reaches 100% solved, it stays solved for the rest of the session (no re-scrambling on scroll-back, to avoid confusing/frustrating back-scrolling — scrolling back simply re-shows the solving animation in reverse, but does not lock the user out of already-unlocked events).
- The cube itself rotates between stages so the next scrambled face comes into view; already-solved faces remain visibly solved as the cube turns.
- A progress indicator (rail of dots / percentage) reflects overall progress through the 6 faces at all times.

### 6.2 Event reveal & selection
- A persistent list/rail of all 6 events is visible throughout (desktop: side rail; mobile: collapsible or bottom sheet). Locked events are dimmed with a "locked" affordance; unlocked events are shown in their theme color and are clickable.
- Clicking a solved face on the cube, or its entry in the list, opens the same detail popup.
- The popup is dismissible via a close control, clicking outside it (backdrop), or Escape key.

### 6.3 Event detail popup contents
Each event's popup must show, at minimum:
- Event code/index (e.g., "EVT.02")
- Title
- Date and time
- Venue/location
- Short description (1–3 sentences)
- Tags/category (e.g., "Hackathon," "Talk," "Workshop")
- A primary action button ("Register" / "Learn more") — may be a stub or external link for the prototype

### 6.4 Content plan (prototype seed data)
Six placeholder events, one per face, each with a distinct accent color drawn from the site's existing palette (cyan, magenta, yellow, plus 1–2 secondary tones as needed):

1. Hack the Grid — 24-hour hackathon
2. Signal Boost — AI/ML summit
3. Design Sprint — UI/UX workshop
4. CTF Night — cybersecurity capture-the-flag
5. Founder's Protocol — startup/founder talks
6. Demo Day — project showcase & awards

If the chapter later needs more than 6 events, the recommended path is a second "cube" (season 2 / next semester) rather than adding faces to one cube, to preserve the metaphor. This is documented for future scope, not built now.

### 6.5 Post-sequence summary
- After the 6th face is solved and the user continues scrolling, the pinned cube sequence releases into normal scroll, ending on a static section: a grid of all 6 events (card per event, themed by accent color), each clickable to reopen its detail popup. Include a closing CTA (e.g., "Back to Boulevard" linking home).

### 6.6 Navigation
- Persistent top HUD bar consistent with the home page (brand mark, breadcrumb, nav pills) allows returning to the home/boulevard experience at any time.

## 7. Non-functional requirements

- **Performance:** first meaningful paint of the cube stage under 2.5s on a mid-range mobile device over a typical campus network; steady 60fps target for cube animation on desktop, 30fps minimum acceptable on low-end mobile (see TRD for degrade strategy).
- **Responsiveness:** fully usable from 360px-wide phones to widescreen desktop monitors.
- **Accessibility:** all event content must be reachable and readable without relying on the 3D animation (see UIUX doc, "reduced motion / fallback list" requirement). Color is never the only signal distinguishing locked vs. unlocked.
- **Browser support:** latest two versions of Chrome, Safari, Firefox, Edge; graceful degradation (static fallback, §UIUX) on unsupported browsers/WebGL-disabled contexts.
- **Maintainability:** event content lives in a single, clearly-named data source editable without touching animation/rendering code.

## 8. Success metrics (prototype-appropriate, directional)

- Qualitative: chapter stakeholders confirm the page "feels like the same site" as the home page when shown side by side.
- Usability: in an informal test with 3–5 people unfamiliar with the site, all can find and open at least 3 events' details without help within 60 seconds.
- Technical: page loads and the cube renders without console errors on the target browser list; Lighthouse performance score ≥ 70 on mobile for the prototype build.

## 9. Assumptions & dependencies

- The home page's exact color tokens, fonts, and HUD component conventions are available for reuse (either from existing home-page code, or re-derived from the reference screenshots/video as done in this project's design pass).
- This is a **prototype**, not production: no CMS, no backend, no analytics integration are required, but the architecture should not actively block adding them later (see TRD §7).
- Real event data (final dates/venues/descriptions) will replace the placeholder seed data before any real launch.

## 10. Risks

| Risk | Mitigation |
|---|---|
| 3D scroll-driven cube may be disorienting or slow on low-end devices | Ship a reduced-motion / low-power fallback (static list) per UIUX doc; performance budget in TRD |
| Scroll-jacking style pages can frustrate users trying to skip ahead | Provide the side event list as a direct-jump control at all times, and the post-sequence summary grid as an escape hatch |
| Six-event limit doesn't match real chapter event calendar | Documented in §6.4 as a known constraint with a suggested future pattern (multiple cubes / seasons) |
