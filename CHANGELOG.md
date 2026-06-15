# CHANGELOG.md

All notable changes to `buffalo-counter-v2`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

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