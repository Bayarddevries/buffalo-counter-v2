# AGENTS.md

This file is the contract for any agent or contributor working on `buffalo-counter-v2`.

## Your Job
- Advance the work without creating ambiguity for the next agent.
- Do not ship undocumented changes; update docs as you go.
- **GitHub issues are the authoritative backlog** — always check `gh issue list --state open` before starting work. Issues labeled `bug` take priority over enhancements.

## First Actions (Every Session)
1. Read `README.md`, `AGENTS.md`, and `CHANGELOG.md` before editing code.
2. **Check GitHub issues**: `gh issue list --state open` — these are the source of truth for bugs and features.
3. Run `git status` to check for uncommitted changes.
4. Verify local server or live Pages URL works: `https://bayarddevries.github.io/buffalo-counter-v2/`

## Project Structure
```
/home/bayard_devries/buffalo-counter-v2/
├── index.html          # Main HTML entry point
├── styles.css          # All styling (design tokens, components, responsive)
├── app.js              # Single-file app logic (deployed version - no build step)
├── modules/            # MODULAR VERSION - NOT USED IN PRODUCTION
│   ├── atmosphere.js
│   ├── cards.js
│   ├── counter.js
│   ├── data.js
│   ├── init.js
│   ├── keyboard.js
│   ├── scroll.js
│   ├── sources.js
│   ├── splash.js
│   ├── timeline.js
│   └── toast.js
├── data/
│   ├── timeline.json   # 11 events (1800-1900), 12 sources, citation markers
│   └── images.json     # 22 image manifests (alt, caption, credit, license, source_url)
└── images/             # 19 content images + 6 atmospheric backgrounds
```

## Code Rules
- **Pure static** — no build step, no bundler. Deploys as-is to GitHub Pages.
- **Single-file `app.js`** is the deployed version. `modules/` is dead code from an abandoned modularization attempt.
- **No synthesized data** — every population number traces to a cited source in `timeline.json`.
- **Citation standard**: Every event text uses `[n]` markers that map to `citations[]` array with `id` and `source`.
- **Image sourcing**: All images from user's Bison folder (`C:\Users\Bayard deVries\Desktop\Bison\`). Metadata in `data/images.json` (file, alt, caption, credit, license, source_url).
- **Atmospheric backgrounds**: Fixed full-screen images per card, crossfade on transition. Issue #1 (`.card.active` opaque background hiding them) **fixed in commit 280dc27** (`z-index` reminder: cards above atmo-overlay for readable text).

## Commit Conventions
```
<type>(<scope>): <concise description>
```

Types: `feat:`, `fix:`, `docs:`, `chore:`, `content:`
Scopes: `ui`, `data`, `images`, `scroll`, `counter`, `timeline`, `sources`, `a11y`, `deploy`

Rules:
- Imperative mood: "fix scroll snap" not "fixed scroll snap"
- No period at end
- Under 72 chars
- One logical change per commit

Examples:
```
fix(ui): make active card background semi-transparent for atmospheric bg
fix(scroll): change desktop snap-type to mandatory for reliable snapping
content(images): replace 1870 card image with hide yard photo
feat(sources): render credit/license/source-link below each image
```

## Handoff Expectations
- Update `CHANGELOG.md` with dated entry
- Commit and push all changes — no uncommitted work
- Update `AGENTS.md` if you discover new pitfalls or architectural decisions
- Verify live site works before declaring done: test scroll, counter, citations, sources panel, keyboard nav

## GitHub Issues Workflow
- **Source of truth**: `gh issue list --state open`
- Bugs first, then enhancements
- Reference issue numbers in commits: `fix(ui): atmospheric bg visible #1`
- Close issues via commit messages or `gh issue close <num>`

## Known Pitfalls
- **Atmospheric backgrounds (Issue #1)**: **FIXED in 280dc27** (`.card.active` background made semi-transparent; cards lifted above `.atmo-overlay` for readable text). Retain the pitfall note so future agents understand the historical failure mode.
- **Desktop scroll snap (Issue #2)**: **FIXED in 2487236+** (`scroll-snap-type: y mandatory` removed dead zones). Retain the pitfall note for the same reason.
- **Counter year interpolation (B1, audit 2026-06)**: `app.js:127-128` interpolates year between events. Counter displays non-existent years (e.g., 1826 between 1825→1850). Fix in v2.1 — see Open Bugs below.
- **Duplicate `.card` CSS rule (B2, audit 2026-06)**: `styles.css:379` and `:395` declare the same selector twice; second wins. `chore` fix in v2.1.
- **Single-file app.js only**: Do not edit `modules/` — they are not deployed. All changes go in `app.js`, `styles.css`, `index.html`, `data/`.
- **GitHub Pages CDN cache**: After push, live site may need `?v=N` cache bust. Build script doesn't exist; manually increment version query param in `index.html` if needed.
- **Local server port conflicts**: `python3 -m http.server` often fails with "Address already in use" in this environment. Test via live Pages URL instead.
- **Image manifest sync**: `timeline.json` references images by filename. `images.json` must have matching entry. No build-time validation — verify manually.
- **Counter animation timing**: `animationDuration = 800ms` in `app.js`. If scroll updates faster than animation completes, counter jumps. Uses `cancelAnimationFrame` guard.
- **Citation injection**: `injectCitations()` does string replace on `[n]` markers. Fails silently if marker not found. Always verify citation IDs match between `text` and `citations[]`.

## Reduced Motion
- `@media (prefers-reduced-motion: reduce)` disables all animations, transitions, scroll-behavior
- Timeline pulse animations respect this via CSS
- Card transitions, atmospheric crossfade, scroll prompt bounce all disabled

## Accessibility
- `aria-live` on counter value
- `aria-expanded` on sources panel
- Keyboard: Arrow Up/Down scrolls between cards
- Focus management on splash dismiss and sources toggle
- Semantic HTML: `figure`/`figcaption`, `dialog` for splash

## Data Sources (from timeline.json meta)
- Flores, Dan. *American Serengeti* (2016)
- Isenberg, Andrew C. *The Destruction of the Bison* (2000)
- MacEwan, Grant. *Buffalo: Sacred and Sacrificed* (1995)
- Hornaday, William Temple. *The Extermination of the American Bison* (1889)
- Calloway, Colin. *Our Hearts Fell to the Ground* (1996)
- Phillips, Nancy. "Skin and Bones" (2024)
- Taylor, Scott. "Buffalo Hunt" AER (2011)
- Congressional Globe, 43rd Congress (1874)
- Various archives: LAC, LOC, Glenbow Museum

## Environment Notes
- WSL Ubuntu 24.04
- Python 3.11 for local `http.server` (port conflicts common)
- GitHub Pages deploys from `main` branch root
- Repo: `bayarddevries/buffalo-counter-v2`
- Live: `https://bayarddevries.github.io/buffalo-counter-v2/`

---

## Open Bugs (v2.1, audit 2026-06)

Bug IDs from `docs/audit-v2.md`. Plan: `plans/buffalo-counter-v2.1-plan.md`.

| ID | Severity | Status | Target | File / line |
|---|---|---|---|---|
| B1 — counter year interpolation | Critical | open | Sprint 1 · P1A | `app.js:127-128` |
| B2 — duplicate `.card` CSS rule | Critical | open | Sprint 1 · P1B | `styles.css:379, 395` |
| B4 — 1880 methodological rebound | Major | open | Sprint 1 · P2A | `data/timeline.json` (1880 event) |
| N1 — 1874 card body too long | Major | open | Sprint 1 · P2B | `data/timeline.json` (1874 event) |
| B3 — mobile opacity stack | Major | open · verify-only | Sprint 1 · P3A | `styles.css:534` (likely closes as no-action) |
| N2 — voice inconsistency | Major | open · **user gate** | Sprint 2 · P4A | `data/timeline.json` (all events) |
| N4 — citation drift | Minor | open · **user gate** | Sprint 2 · P4B | `data/timeline.json` (sources array) |
| U1 — splash double-handler | Minor | open | Sprint 2 | `app.js:482-485` |
| U2 — restart affordance | Minor | open | Sprint 2 | n/a (missing) |
| U3 — modal gating scope | Minor | open | Sprint 2 | `app.js:588-597` |

**Resolved during v2.1:**
- B5 (audit): AGENTS.md doc rot — fixed in this Phase 0 (event count `14→11`; Issue #1/#2 references updated).
- U4 (audit): `styles.css?v=30` cache-buster false-positive — closed in Phase 0 with explanation in CHANGELOG.

For each entry, prefer fixing over inheriting; one commit per bug per convention above.
