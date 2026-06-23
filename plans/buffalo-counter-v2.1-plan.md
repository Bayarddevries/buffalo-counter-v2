# Buffalo Counter v2 — v2.1 Fix Plan

**Repo:** `bayarddevries/buffalo-counter-v2` (commit `52212cc` — fixed Issue #1/B3, Issue #2/scroll-snap already done)
**Live URL:** https://bayarddevries.github.io/buffalo-counter-v2/
**Audit reference:** see `docs/audit-v2.md` (added in Phase 0 of this plan)
**Original v2.1 plan:** `~/buffalo-audit/plans/buffalo-counter-v2-fix-plan.md`

This plan supersedes the original v2.1 plan because the live code was being patched from the wrong repo (`~/buffalo-counter/` = v1 source), not this v2 repo. Re-baselined from freshly-cloned v2 source on 2026-06-23.

---

## Mapping — what the audit said vs what the source actually shows

| Audit ID | Audit claim | Re-baseline verdict (against on-disk v2 source) | Fix? |
|---|---|---|---|
| B1 | Counter year interpolates → invented years | **Confirmed valid.** Lines 127-128 interpolate year between events. | ✅ Yes |
| B2 | Duplicate `.card` rule (379 vs 395) | **Confirmed valid.** Both blocks present. | ✅ Yes |
| B3 | Mobile overlay opacity stack makes cards black | **Audit verdict no longer true.** Issue #1 was fixed (commit 280dc27) making `.card.active` background semi-transparent. The mobile opacity at line 534 (`.card { opacity: 0.35 }`) is still there, but the `.card.active` desktop background at the duplicate-rule block at 389 also exists as `.card.active { opacity: 1; transform: scale(1) }` inside the mobile query. **Net:** inactive cards still fade to 35% opacity on mobile, scroll-snap is supposed to mask this. Still worth verifying, lower priority. | ⚠ Verify only |
| B4 | 1880 rebound (150k→395k) | **Confirmed valid.** 1880 is 395K, 1877 is 150K. Card text lacks methodology explanation. | ✅ Yes |
| B5 | AGENTS.md lies about events, URL | **Confirmed valid.** AGENTS.md header says "14 events" but `timeline.json` has 11. AGENTS.md also lines 46, 46, 83, 84 still say "Currently broken by opaque .card.active" — already fixed in commit 280dc27. | ✅ Yes |
| N1 | 1874 card too long (577 chars) | **Confirmed valid.** | ✅ Yes |
| N2 | Voice inconsistent | **Confirmed valid.** | 🚪 Gate (Sprint 2) |
| N4 | Sources [7]-[12] unreferenced | **Need to re-verify** in this repo's `data/timeline.json`. | 🚪 Gate (Sprint 2) |
| U1 | Splash double-remove (`transitionend` + `setTimeout`) | **Confirmed valid.** Lines 482 + 485. | ⏸ Sprint 2 |
| U2 | No "back to top" affordance | **Confirmed valid.** No element. | ⏸ Sprint 2 |
| U3 | Keyboard nav modal gating incomplete | **Confirmed valid.** | ⏸ Sprint 2 |
| U4 | `styles.css?v=30` cache-buster is fake | **Audit verdict WRONG.** AGENTS.md line 90 documents this is intentional cache bust for GitHub Pages CDN; v=5, 15, etc. returning same content means no recent deploy past v30, not that the strategy is fake. | ❌ No fix |

**Net for Sprint 1:** 4 confirmed-bug fixes (B1, B2, B4/N1 — wait, B4 and N1 are separate even though I grouped them — both still in scope), B5 doc-fix, B3 verification-only. 4 sprint-2 gates (U1, U2, U3, N2, N4 — actually 5). 1 retracted audit finding (U4).

---

## Phase 0 · v2-repo doc baseline

| | |
|---|---|
| Touch | `~/buffalo-counter-v2-repo/docs/audit-v2.md` (NEW — abbreviated port of the external audit) |
| Touch | `~/buffalo-counter-v2-repo/CHANGELOG.md` (add `[Unreleased] v2.1` heading with bugfix list) |
| Touch | `~/buffalo-counter-v2-repo/AGENTS.md` (fix Issues #1 #2 hanging references; fix event count "14" → "11"; add Open Bugs table) |
| Action | (1) Copy/produce markdown summary of audit adapted to v2's actual state (4 bugs + 5 sprint-2 gates + 1 retracted finding). (2) CHANGELOG prepend v2.1 unreleased block listing Phases 1A, 1B, 2A, 2B, 3A-verification. (3) AGENTS.md: (a) fix event count in line 25/46 "14 events" → "11 events"; (b) update line 46 ("Currently broken by opaque...") since Issue #1 was already fixed in commit 280dc27 — change to "Fixed in 280dc27"; (c) update line 83-84 ("Atmospheric backgrounds hidden") same way; (d) add a new "Open Bugs — v2.1" table to track the audit findings. |
| Verify | `python3 -c "import json; d=json.load(open('data/timeline.json')); assert len(d['events'])==11"`; AGENTS.md event count says "11"; CHANGELOG has `[Unreleased] v2.1` block |
| Commit | `docs(v2.1): add audit summary, fix stale "14 events" and Issue #1 references` |
| Doesn't touch | any of `app.js`, `styles.css`, `index.html`, `data/timeline.json` content |

---

## Phase 1A · B1 — snap counter year to nearest event year (real fix this time)

| | |
|---|---|
| Touch | `~/buffalo-counter-v2-repo/app.js` |
| Lines | 109-148 (`animateCounter`) and 419-452 (`updateFromScroll`) |
| Pre-checks | (a) Confirm `state.timelineData.events` is non-null inside `updateFromScroll` by reading bootstrap (lines 620-660). (b) Confirm `state.timelineData` is set before scroll listener attaches (line 635 sets `setupScroll()`). (c) Verify every event has unique integer year. |
| Behavior change | Two options for clean execution; I'll pick the second. |
| | **Option picked:** edit `updateFromScroll` around lines 419-440. After computing `targetYear` (the linearly-interpolated year), snap it to the nearest event year by scanning `state.timelineData.events`. Then pass the **snapped integer year** to `animateCounter` BUT keep the interpolated pop+label+status logic. The animate function at lines 127-128 will then animate from `state.currentYear` to the snapped integer — which is identical to snapping at the call site, just routed through the animation. |
| | Either snap inline in updateFromScroll or keep `animateCounter` interpolating the year and add a snap step at the end of animation completion. Implementing in updateFromScroll is cleaner. |
| | Use the existing `state.timelineData.events` array (already populated by bootstrap). Don't introduce a hardcoded `EVENT_YEARS` constant. |
| Verify (smoke) | (a) grep for the new logic in app.js; (b) sintactically valid: bash `node --check app.js` if node available, else grep for unbalanced braces; (c) live test: load https://bayarddevries.github.io/buffalo-counter-v2/ and confirm counter year jumps only between [1800, 1825, 1850, 1865, 1870, 1874, 1877, 1880, 1883, 1889, 1900] |
| Commit | `fix(counter): snap year to nearest event (v2.1, closes audit B1)` |

---

## Phase 1B · B2 — remove duplicate `.card` CSS rule

| | |
|---|---|
| Touch | `~/buffalo-counter-v2-repo/styles.css` |
| Lines | 379-405 (delete first `.card` block including its no-op `.card.active { }`) |
| Pre-checks | Read both definitions; confirm second is strict superset |
| Behavior change | First block (lines 379-387) plus the dangling `.card.active { }` at 389 deleted. Second block (line 395+) wins. No visible user change. |
| Verify | `grep -n "^\.card {" styles.css` returns exactly one result. |
| Commit | `chore(css): remove duplicate .card declaration (v2.1, closes audit B2)` |

---

## Phase 2A · B4 — annotate 1880 rebound in card text

| | |
|---|---|
| Touch | `~/buffalo-counter-v2-repo/data/timeline.json` |
| Target | 1880 event's `text` field |
| Behavior change | Append: "The 1880 figure includes northern herd counts, which is why it appears higher than 1877's number — the southern herd remained near zero." |
| Verify | `python3 -c "import json; d=json.load(open('data/timeline.json')); e=[x for x in d['events'] if x['year']==1880][0]; assert 'northern herd' in e['text']"`; load 1880 card on live site |
| Commit | `content(data): annotate 1880 methodological rebound (v2.1, closes audit B4)` |

---

## Phase 2B · N1 — trim 1874 card body

| | |
|---|---|
| Touch | `~/buffalo-counter-v2-repo/data/timeline.json` |
| Target | 1874 event's `text` field (currently 577 chars) |
| Behavior change | Trim to 250-300 chars. Strategy: (a) keep the Sheridan quote and the "Métis world vanish in one winter" close; (b) move one of the two Fort MacLeod/I.G. Baker rate-fact repeats (already on 1877 card as "down from 250,000"); (c) tighten the tanning-process sentence. The user's most-quoted line: "The Métis watched their economy, their food, their world vanish in one winter" must remain. |
| Verify | All card texts in 220-360 char range. No info-loss: every numeric figure and citation either stays on 1874 or appears at least once across the timeline. |
| Commit | `content(data): tighten 1874 card body (v2.1, closes audit N1)` |

---

## Phase 3A · B3 — verify mobile opacity vs scroll-snap

| | |
|---|---|
| Touch | `~/buffalo-counter-v2-repo/styles.css` (read-only) |
| Behavior change | This is a verification phase, not a fix. Confirm via styles.css read + browser-emulated mobile mode whether `.card { opacity: 0.35 }` at line 534 (mobile) still stacks with the atmo-overlay to make inactive cards appear black. |
| Decision tree | (a) If visual is broken on mobile → write a follow-up P3 fix in this same commit, targeting opacity/rendering of inactive cards on mobile. (b) If scroll-snap already masks inactive cards visually → record as "non-issue in current state" in CHANGELOG and AGENTS.md, close audit B3 as a false alarm. |
| Verify | Browser emulation: load live site, toggle mobile width, scroll past first card, observe whether the inactive cards visibly fade or just stay opaque. (Cannot do real-device QA from CLI.) |
| Commit (non-fix) | `docs: close audit B3 as no-action (verified against current source)` |
| Commit (real fix) | `fix(ui): mask inactive cards on mobile via scroll-snap (v2.1, closes audit B3)` |

---

## Sprint 2 backlog (NOT executed now)

- **U1** — splash double-remove. Delete one of the two handlers.
- **U2** — restart/back-to-top affordance.
- **U3** — keyboard nav modal-gating.
- **N2** — voice consistency. **Gate on user choice: A)third-person reportage, B)first-person plural "we".** Audit doc has example rewrites available.
- **N4** — citation drift (prune vs anchor). **Gate on user choice.**

---

## Sprint 3 backlog (NOT executed now)

- **Refactor** to `modules/` directory. From AGENTS.md: "MODULAR VERSION — NOT USED IN PRODUCTION". This was already attempted once and abandoned. Re-attempt only if real reader signal justifies the 2-day refactor cost. The audit's Option C.
- **Launch** — public push to archive lists, retrospective share-image designed, classroom PDF export.

---

## Cut list

This plan does **not**:
- Delete or activate `modules/*.js`. (Touching that without scope approval violates AGENTS.md.)
- Add CDN dependencies. (Already no-CDN, preserve.)
- Touch `optimize_images.py` or image processing.
- Add new features (search, French, sister projects).
- Refactor `app.js` into modules (already attempted, AGENTS.md says don't).
- Re-introduce build step. (Pure static site.)
- Modify CITATION semantics (the system is the project's bravest design choice; preserve).

---

## Agent execution contract

For each subagent delegated in this plan:

- **Read-only orientation first.** Inspect the named files, then execute without asking.
- **Phase boundary checks.** Confirm pre-implementation anchors before patching. If anchor not found, halt and report.
- **Commit cadence.** `git add` with intent (`-p` if needed), single commit per phase, prescribed commit message.
- **No side quests.** Do not edit `modules/`, do not invent new rules, do not "while I'm here fix X".
- **Verify before commit.** Run the listed checks.
- **Failure mode.** Halt on blocker, do not improvise.

---

## Reconciliation note

This plan was originally drafted against `/tmp/buffalo-review/` (deployed-but-not-local v2 source) under the mistaken impression that the v2 source lived in `~/buffalo-counter/master`. It does not. The v2 source is at `~/buffalo-counter-v2-repo/`, freshly cloned 2026-06-23. Phase 0 in v2 local repo produced no usable commit (subagent reverted). The first commit of this plan is Phase 0 in the correct repo.
