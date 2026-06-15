# The Vanishing Buffalo — Scroll Edition

A scroll-driven visualization of the North American buffalo (bison) population collapse, 1800–1900. Every data point is cited. Every image is sourced.

**Live:** https://bayarddevries.github.io/buffalo-counter-v2/

---

## What It Shows

| Year | Population | Context |
|------|------------|---------|
| 1800 | 30,000,000 | Pre-contact abundance |
| 1825 | 25,000,000 | Fur trade intensifies |
| 1850 | 20,000,000 | Hide trade expands |
| 1865 | 13,500,000 | Railroads reach the plains |
| 1870 | 5,500,000 | Great collapse begins |
| 1874 | 800,000 | Peak slaughter (1871–1874) |
| 1877 | 150,000 | Hide trade collapses |
| 1880 | 395,000 | Bone picking industry |
| 1883 | 100,000 | Northern herd vanishes |
| 1889 | 635 | Hornaday's final count |
| 1900 | 500 | Functionally extinct |

**The collapse was not natural.** Commercial hunting, military policy, and railroad logistics destroyed the foundation of Plains Indigenous life in a single lifetime.

---

## Features

- **Animated counter** — Smooth count-up/count-down as you scroll through years
- **Growing timeline bar** — Visualizes tragedy accumulating left→right (1800→1900)
- **Atmospheric backgrounds** — Full-screen period images crossfade per era
- **Citation system** — Click any `[n]` for full source in a toast
- **Sources panel** — Collapsible, categorized bibliography (12 sources)
- **Keyboard navigation** — Arrow Up/Down to move between cards
- **Reduced motion support** — Respects `prefers-reduced-motion`
- **Mobile-first** — Scroll-snap mandatory on mobile, proximity on desktop
- **Zero build step** — Pure static files, deploys directly to GitHub Pages

---

## Data Integrity

> **No synthesized data.** Every population estimate traces to a documented historical source.

**Primary sources:**
- Flores, Dan. *American Serengeti* (2016)
- Isenberg, Andrew C. *The Destruction of the Bison* (2000)
- MacEwan, Grant. *Buffalo: Sacred and Sacrificed* (1995)
- Hornaday, William Temple. *The Extermination of the American Bison* (1889)
- Calloway, Colin. *Our Hearts Fell to the Ground* (1996)
- Phillips, Nancy. "Skin and Bones" (2024)
- Taylor, Scott. "Buffalo Hunt" (2011)
- Congressional Globe, 43rd Congress (1874)

Population points are interpolated between documented estimates. The scale of collapse is undisputed; exact numbers are approximations.

---

## Image Sourcing

All images from the curated Bison archive. Each has full metadata in `data/images.json`:

```json
{
  "file": "pc005127.jpg",
  "alt": "A herd of plains buffalo at Buffalo National Park...",
  "caption": "Survivors gathered in a protected sanctuary...",
  "credit": "Bell Photo / Library and Archives Canada",
  "license": "Public domain / Crown copyright expired",
  "source_url": "https://www.bac-lac.gc.ca/"
}
```

Images display credit, license, and a "View source" link below each figure.

---

## Project Structure

```
buffalo-counter-v2/
├── index.html          # HTML entry point
├── styles.css          # Design tokens + all components
├── app.js              # Single-file app logic (deployed)
├── data/
│   ├── timeline.json   # Events, sources, citations
│   └── images.json     # Image manifest with metadata
└── images/             # 25 optimized images
```

**No `modules/` folder in production** — it contains an abandoned modular rewrite. The deployed version is the single ES6 IIFE in `app.js`.

---

## Development

### Local Preview
```bash
cd buffalo-counter-v2
python3 -m http.server 8080
# Open http://localhost:8080
```
> **Note:** Port conflicts are common in this environment. Test via live Pages URL instead.

### Deploy
```bash
git add -A
git commit -m "fix(ui): atmospheric backgrounds visible #1"
git push origin main
# GitHub Pages auto-deploys from main branch root
# Live at https://bayarddevries.github.io/buffalo-counter-v2/
# Add ?v=N to bust CDN cache if needed
```

### GitHub Issues (Authoritative Backlog)
```bash
gh issue list --state open
```
Always check issues before starting work. Bugs (`bug` label) take priority.

---

## Commit Conventions

```
<type>(<scope>): <description>
```

| Type | Use For |
|------|---------|
| `fix:` | Bug fixes (scroll snap, atmospheric bg, counter) |
| `feat:` | New features (keyboard nav, sources panel) |
| `content:` | Data/image/text changes (new event, better image) |
| `docs:` | Documentation only (this file, AGENTS.md) |
| `chore:` | Tooling, formatting, no logic changes |

Scopes: `ui`, `data`, `images`, `scroll`, `counter`, `timeline`, `sources`, `a11y`, `deploy`

Examples:
```
fix(ui): make active card bg semi-transparent for atmospheric layer #1
fix(scroll): desktop snap-type mandatory for reliable snapping #2
content(images): replace 1870 card with hide yard photograph #3
feat(sources): render credit/license/source-link below images #6
```

---

## Accessibility

- Semantic HTML: `dialog` (splash), `figure`/`figcaption` (images), `nav` (timeline)
- `aria-live="polite"` on counter value
- `aria-expanded` on sources panel toggle
- Keyboard: Arrow Up/Down scroll between cards, Escape closes sources
- Focus management on splash dismiss and panel toggle
- Reduced motion: all animations/transitions disabled via media query
- Color contrast: WCAG AA compliant on all text

---

## Browser Support

Modern browsers with:
- CSS Custom Properties
- IntersectionObserver (polyfilled if needed)
- `scroll-snap-type`
- `requestAnimationFrame`

Tested: Firefox 128+, Chrome 128+, Safari 17+, Edge 128+

---

## License

Code: MIT — see `LICENSE` (to be added)

Content: Historical facts and public domain/archival images. Source citations required for reuse.

---

## Credits

Created by **Bayard deVries** — [bayarddevries.github.io](https://bayarddevries.github.io/)

Sources: See [Sources Panel](https://bayarddevries.github.io/buffalo-counter-v2/) in the app (▲ SOURCES & REFERENCES)