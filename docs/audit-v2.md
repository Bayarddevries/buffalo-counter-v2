# Audit — Buffalo Counter v2 (June 2026)

> Full visual audit document (rendered HTML, with scorecard and A/B/C options) lives externally at:
> `~/buffalo-audit/buffalo-counter-v2-audit.html`
>
> This is the **v2-repo internal summary**, scoped against the actual on-disk source.

**Audit date:** 2026-06-23
**Auditor:** Hermes (brutal-honesty mode per user preference)
**Live URL audited:** https://bayarddevries.github.io/buffalo-counter-v2/
**Repo source audited:** `~/buffalo-counter-v2-repo` (Bayarddevries/buffalo-counter-v2)
**Source reviewed:** `app.js`, `styles.css`, `index.html`, `data/timeline.json`, `data/images.json`

---

## Headline take

The counter is the most ambitious interactive-theater project the user has shipped. The v2 release gives the counter a narrative canvas to live inside. The infrastructure (scroll-snap cards, atmospheric-bg crossfade, three-tier citation system) is largely right-shape.

The reason for the audit is the codebase: a 669-line single-file `app.js`, a duplicate `.card` CSS rule, a counter that interpolates between events producing invented years, and a doc floor that lies about the data and references-to-issues. Ship-ready after triage; not "done."

**Recommended verdict:** ship after a 2-sprint triage (see `plans/buffalo-counter-v2.1-plan.md`). Stop expanding; re-evaluate in 60 days against real reader signal.

---

## Findings — adjusted against v2-repo source on 2026-06-23

| ID | Severity | Status | Finding |
|---|---|---|---|
| **B1** | Critical | **Open** | Counter year interpolates between data points (e.g., shows `1826, 1827, …` between 1825→1850). AGENTS.md doesn't mention snapping. |
| **B2** | Critical | **Open** | `.card` declared twice in `styles.css` lines 379 and 395. First declaration silently overridden. |
| **B3** | Major | **Likely resolved** | Per audit the mobile overlay opacity stack makes inactive cards appear black. **Issue #1 already fixed** via semi-transparent `.card.active` background (commit 280dc27). Needs visual re-verification only. |
| **B4** | Major | **Open** | 1880 event (395K) higher than 1877 (150K). Card text lacks methodology explanation. |
| **B5** | Major | **Open** | AGENTS.md says "14 events" — `timeline.json` has 11. Stale Issue #1 "Currently broken" references at lines 46, 83 — issue fixed in commit 280dc27. |
| **N1** | Major | **Open** | 1874 card body is 577 chars; every other card is 220-370. Bottlenecks read rhythm. |
| **N2** | Major | **Open · gate** | Voice inconsistent across cards. Splash uses first-person plural ("The Métis, who depended on buffalo..."); cards mixed third-person reportage. Needs user choice. |
| **N4** | Minor | **Open · gate** | Sources `[7]–[12]` listed but never anchored to any claim. Needs user choice (prune vs anchor). |
| **U1** | Minor | **Open** | Splash has `transitionend` + `setTimeout(600)` both calling `remove()`. Individually guarded, harmless, redundant. |
| **U2** | Minor | **Open** | No "Back to 1800" affordance after the last card. |
| **U3** | Minor | **Open** | Keyboard nav gates only on sources-open, not on any-modal-open. |
| **U4** | — | **Retracted** | Audit claimed `styles.css?v=30` cache-buster was fake. AGENTS.md line 90 documents this is intentional GitHub Pages CDN cache control — not fake, just hand-managed. |

### Strengths (preserved from original audit)

- **W1.** Counter shape (large serif digits, top-anchored, status label, drain 4 orders of magnitude).
- **W2.** Three-tier citation infrastructure (inline `[n]` → toast → categorized panel).
- **W3.** Atmospheric-bg crossfade (dual layer, z-index swap, 1.2s opacity).
- **W4.** Choice of restraint — scroll-snap + counter, no parallax/audio/particles.

---

## Scorecard

| Dimension | Grade | Notes |
|---|---|---|
| Concept & intent | A | The counter-as-spine is the strongest pattern. |
| Historical accuracy & sourcing | B | 11 events, 12 sources. Cite the unused sources or prune. |
| Counter mechanics | C | Bug B1 + B4 undercut credibility. Aesthetic right; integrity isn't. |
| Codebase health | C | B2, B5, modules/ dead code. Fix B2 in 1 minute. |
| Visual finish | B | Typography (IM Fell English + IBM Plex) is strong. Mobile opacity needs re-verification. |
| Narrative rhythm & voice | C | 1874 breaks rhythm (N1). Voice unstable (N2). |
| Sustainability / extensibility | C | Single-file `app.js`; abandoned `modules/` is dead weight. |
| **Overall** | **B−** | Solid concept, shippable artefact, four bugs to fix before claiming done. |

---

## Sprint-shape execution plan

Summary; full plan: `plans/buffalo-counter-v2.1-plan.md`.

**Sprint 1 (this sprint):**
- P0 — doc baseline (audit summary, CHANGELOG, AGENTS.md refresh)
- P1A — fix B1 (counter year snap)
- P1B — fix B2 (.card duplicate CSS)
- P2A — annotate 1880 rebound
- P2B — trim 1874 card body
- P3A — re-verify mobile opacity (likely closes as no-action)

**Sprint 2 (next sprint):**
- U1 — splash double-remove
- U2 — restart affordance
- U3 — keyboard modal gating
- N2 — voice consistency (GATE)
- N4 — citation drift (GATE)

**Sprint 3+ (only if data supports it):**
- Re-evaluate real reader signal before refactor or launch.

---

## Reconciliation note (for the record)

This plan was originally drafted against `/tmp/buffalo-review/` (deployed-but-not-local v2 source) under the mistaken impression that the v2 source lived in `~/buffalo-counter/master`. It does not. The v2 source lives at `~/buffalo-counter-v2-repo/`, freshly cloned 2026-06-23. The local-repo Phase 0 from `~/buffalo-counter/`, commit `23ce493`, was on the v1 source — kept for traceability but not relevant to v2.x deploys.
