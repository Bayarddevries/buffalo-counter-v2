# CHANGELOG.md

All notable changes to `buffalo-counter-v2`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased] v2.1 — Critical Bugfix Sprint

Phase-tracked release addressing findings from `docs/audit-v2.md` (June 2026 audit). Bug IDs match that doc.

- [x] **docs**: add `docs/audit-v2.md` summary; refresh AGENTS.md to match shipped 11-event state; close stale Issue #1/#2 references
- [x] **fix (B1)**: snap counter year to nearest event in `app.js` (audit B1)
- [x] **fix (B2)**: remove duplicate `.card` rule in `styles.css` (audit B2)
- [x] **content (B4,N1)**: annotate 1880 methodological rebound + tighten 1874 card body in `data/timeline.json` (audit B4 + N1)
- [ ] **verify (B3)**: re-verify mobile card-opacity behaviour against `app.js` post-Issue #1 fix (commit 280dc27). Decision tree: fix or close as no-action.

**Deferred to Sprint 2 (gated on user choice):**
- N2 — voice consistency (A: third-person reportage vs B: first-person plural)
- N4 — citation drift on sources `[7]–[12]` (prune vs anchor)
- U1 — splash double-handler (`transitionend` + `setTimeout` redundant)
- U2 — restart/back-to-top affordance
- U3 — keyboard nav modal gating

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