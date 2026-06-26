# CHANGELOG.md

All notable changes to `buffalo-counter-v2`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased] v2.1 — Critical Bugfix Sprint

Phase-tracked release addressing findings from `docs/audit-v2.md` (June 2026 audit). Bug IDs match that doc.

- [x] **docs**: add `docs/audit-v2.md` summary; refresh AGENTS.md to match shipped 11-event state; close stale Issue #1/#2 references
- [x] **fix (B1)**: snap counter year to nearest event in `app.js` (audit B1)
  - `65baf28`: `updateFromScroll` snaps `targetYear` to nearest event before calling `animateCounter`
  - Followed up: `animateCounter` writes `targetYear` directly to `#counterYear` on every frame; population animates smoothly, year does not. Browser-verified via Playwright: 0 invalid years during 50-step scroll sweep across 3 sample frames per step.
- [x] **fix (B2)**: remove duplicate `.card` rule in `styles.css` (audit B2)
- [x] **content (B4,N1)**: annotate 1880 methodological rebound + tighten 1874 card body in `data/timeline.json` (audit B4 + N1)
- [x] **verify (B3)**: re-verified mobile card-opacity behaviour against current source — closed as no-action (Issue #1 fix was removed in db0a0ed, replaced by fixed overlay dimming; mobile inactive dim is by design).
- [x] **chore (deploy)**: bump `<script src="app.js?v=1">` cache-buster in `index.html` — fixes CDN-stale-app.js issue flagged in AGENTS.md line 90. First `app.js` cache-keyed reference; bumps should continue with each code deploy.

---

## [Unreleased] v2.2 — Sprint 2: content consistency + UX polish

- [x] **content (N2)**: normalise voice to third-person reportage across all 11 cards (audit N2; user picked Option A)
- [x] **content (N4)**: anchor all 12 sources (no prunes needed — anchor strategy fits cleanly: Taylor→1850, Doback→1900, Geist→1825, Smits→1865, Phillips→1880, Congressional Globe→1870) (audit N4)
- [x] **fix (U1)**: drop redundant splash double-handler (audit U1)
- [x] **fix (U3)**: keyboard nav gates on "any modal open" via generic `isAnyModalOpen()` helper — covers sources panel + splash + future modals (audit U3)
- [x] **feat (U2)**: floating "↺ Restart" pill in bottom-right corner — appears once user scrolls past 60% of the first card, smooth-scrolls cardsSection back to 0 on click, hidden when back at top; respects `prefers-reduced-motion` via the project's existing global rule (audit U2)
- [x] **chore (deploy)**: bump `<script src="app.js?v=2">` cache-buster in `index.html` — match v2.2 release.

**Sprint 1 (v2.1) — DONE.**

Sprint 2 in progress (v2.2 block above). The previous "Deferred to Sprint 2" copy has been superseded by the v2.2 block.

**Closed in P0 (no fix needed):**
- U4 — `styles.css?v=30` cache-buster: was incorrectly flagged in audit; AGENTS.md line 90 documents this is intentional GitHub Pages CDN cache control, not decorative.

---

## [Unreleased]

### Fixed
- Atmospheric backgrounds now visible (Issue #1) — `.card.active` background made semi-transparent
- Desktop scroll snap reliable (Issue #2) — changed to `mandatory` snap-type
- 1870 card image replaced with era-appropriate hide yard photo (Issue #3)
- 1874 card image replaced with industrial slaughter scene (Issue #4)
- 1874 card copy rewritten for visceral narrative impact (Issue #5)
- All images now display credit, license, and source link (Issue #6)

---

## [2026-06-15] — Initial Deploy

### Fixed (2026-06-15)
- **Issue #1**: Atmospheric backgrounds now visible — `.card.active` background changed to `rgba(26,26,26,0.85)` so fixed atmospheric layer shows through
- **Issue #2**: Desktop scroll snap reliable — changed `.cards-section` to `scroll-snap-type: y mandatory` (removed mobile-only override)
- **Issue #3**: 1870 card image replaced — now shows Rath & Wright's Dodge City hide yard (1878, 40,000 hides) instead of vast herd drawing, matching the 5.5M population narrative
- **Issue #4**: 1874 card image replaced — now shows 1874 Taylor County buffalo hunt (peak slaughter year) instead of ledger, matching industrial-scale narrative
- **Issue #5**: 1874 card copy rewritten — visceral narrative: 3M killed in 4 years, carcasses along railroads, buffalo died for machine belts, Sheridan's extermination policy, Métis world vanishing in one winter
- **Issue #6**: All images now display credit, license, and "View source" link — loads `data/images.json` manifest, injects into card figcaptions and splash image

### Fixed (2026-06-15 — CSS Architecture Fix)
- **Desktop card styles missing** — Entire `.card` component (snap alignment, dimensions, inner layout, images, text) was trapped inside `@media (max-width: 767px)`. Moved all base styles to global scope; mobile-specific overrides (opacity/fade/scale) remain in media query.
- **Active card background missing on desktop** — `.card.active { background: rgba(26,26,26,0.85) }` was only in mobile media query. Now declared globally so atmospheric backgrounds show through on all viewports.
- **Card inner container unconstrained** — `.card-inner { max-width: 600px; margin: 0 auto }` was mobile-only. Now global: cards centered at 600px, images `object-fit: contain`, text legible.

---

## [2026-06-26] v2.3 — Polish & Professional Finish

### Fixed
- **Atmospheric overlay**: flat 85% black → radial gradient (center transparent, edges dark). Historical images now visible through the vignette
- **Overlay dimming**: increased center vignette opacity from 0.2 → 0.45 so card text is readable against bright historical photos
- **1870 card temporal fiction**: removed "In 1874, the U.S. Army..." from 1870 card; 1874 events stay on the 1874 card where they belong
- **Splash double-remove**: removed redundant `setTimeout(600)` fallback — only `transitionend` handler remains (audit U1)

### Added
- **Share button**: in footer — uses Web Share API on mobile, clipboard copy fallback on desktop
- **Restart button (bottom)**: "↺ Start over" in the footer — hard page reload that resets scroll, counter, and splash state
- **Scroll-position side dots**: gold dot rail on right side showing active card; hidden on mobile
- **Favicon**: SVG bison silhouette on dark background, referenced from all pages
- **Open Graph + Twitter Card meta tags**: rich link previews when shared to Telegram, Discord, Twitter, etc.
- **404 page**: themed "Nothing but bones here" with dark aesthetic and link back to the counter
- **GitHub Pages deploy workflow**: auto-deploys from master branch on every push (`.github/workflows/deploy.yml`)

### Changed
- **Cache-busters**: `styles.css` bumped to `v=31`, `app.js` bumped to `v=3`
- **AGENTS.md**: reflects current 11-event state, clean bugs table, updated issue references

### Added
- Scroll-driven narrative with 14 events (1800–1900)
- Animated population counter with smooth interpolation
- Growing timeline bar (tragedy accumulates left→right)
- Atmospheric background crossfade per card
- Citation toast system (click `[n]` for source)
- Collapsible categorized sources panel (12 sources)
- Keyboard navigation (Arrow Up/Down)
- Reduced motion support
- Splash screen with historical context
- Full image metadata in `data/images.json`
- All population data cited to primary sources

### Data Sources
- Flores (2016) *American Serengeti*
- Isenberg (2000) *The Destruction of the Bison*
- MacEwan (1995) *Buffalo: Sacred and Sacrificed*
- Hornaday (1889) *The Extermination of the American Bison*
- Calloway (1996) *Our Hearts Fell to the Ground*
- Phillips (2024) "Skin and Bones"
- Taylor (2011) "Buffalo Hunt"
- Congressional Globe (1874) Sheridan testimony

### Images
- 19 content images + 6 atmospheric backgrounds
- All from curated Bison archive
- Metadata: alt, caption, credit, license, source_url

### Deployed
- GitHub Pages: `https://bayarddevries.github.io/buffalo-counter-v2/`
- Zero build step — pure static files