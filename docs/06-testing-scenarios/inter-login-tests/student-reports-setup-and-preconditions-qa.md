# Student Reports QA — Setup & Preconditions

> Shared prerequisite guide for the four Student Progress tab QA documents (Overview, Subjects, Exams, Insights). Read this first. Every scenario in the four sibling docs assumes the fixtures defined here are in place.

The student panel does **not** have a dedicated "Reports" page. The equivalent surface is `/student/progress`, a 4-tab analytics view (Overview / Subjects / Exams / Insights) backed by `src/data/student/progressData.ts`. Because it is a pure *consumption* surface, almost every defect you will see during testing is actually an **upstream data problem** — a test that was never assigned, a batch that has no curriculum, a teacher that forgot to publish a Quick Test. This document tells you exactly what to seed before opening Progress, so you can tell apart "the report is broken" from "there is nothing to report".

---

## Threshold Reference (Canonical)

All four sibling docs use the same color thresholds, defined in `src/lib/reportColors.ts`:

| Band | Range | Color |
|------|-------|-------|
| Mastery | `>= 75` | Emerald |
| Stable | `50 – 74` | Teal |
| Reinforce | `35 – 49` | Amber |
| At Risk | `< 35` | Red |

Any tile, chart, badge, or label in `/student/progress` that uses **65 / 40** or any other split is a **bug** — file as P1 ("non-canonical threshold") and reference this section.

---

## Login Matrix — Who Creates What

Progress draws from data created by **three** other logins. Before any cycle, confirm each row is satisfied.

| Fixture | Created by | Where | Why Progress needs it |
|---------|------------|-------|-----------------------|
| Student account + batch enrollment | Institute Admin | `/institute/students` | Without enrollment the student has no curriculum and `/student/progress` renders empty hero + zero subjects. |
| Batch curriculum (Curriculum + Course + Subjects mapped to batch) | Institute Admin | `/institute/batches/:id` | Determines which subject tiles appear in **Subjects** tab and which axes appear on the radar. |
| **Quick Test** (1 per subject minimum) | Teacher | `/teacher/exams` → Create Quick Test | Populates the **Exams** tab timeline with subject-scoped attempts and feeds per-subject averages. |
| **Grand Test** (multi-subject) | Institute Admin | `/institute/exams` → Grand Test | Renders with `"Grand Test"` subject label and a per-subject breakdown card in **Exams** tab. |
| **Previous Year Paper** assignment | Institute Admin | `/institute/exams` → PYP library | Verifies the timeline shows year/board badges and that PYPs do not corrupt subject roll-ups. |
| Optional: **Multi-subject custom test** | Teacher (if enabled) | `/teacher/exams` | Verifies subject roll-up math when one attempt contributes to multiple subjects. |
| Student attempts on the above | Student | `/student/tests` | Without attempts, every chart is empty and "auto-select latest" has nothing to select. |

---

## Minimum Data Floor (per cycle)

If you cannot hit these numbers, downgrade your bug findings — most "empty" or "broken" reports are simply under-seeded.

| Visual | Minimum data needed |
|--------|---------------------|
| `ExamTrendChart` line | ≥ 2 attempted exams in the chosen subject filter |
| `SubjectRadarChart` polygon | ≥ 3 subjects with at least 1 attempt each |
| `StreakCalendar` non-empty | activity on ≥ 2 distinct calendar days |
| `WeeklyActivityChart` bars | ≥ 1 minute of activity in the current ISO week |
| `BatchStandingCard` rank | batch must have ≥ 2 enrolled students with attempts |
| `InsightBanner` "At Risk" copy | ≥ 1 subject with overall < 35% |
| `PerExamStandingCard` subject breakdown | the selected exam must be a Grand Test or multi-subject |

**Recommended seed:** 6 attempted exams across 3+ subjects, spanning 2 calendar weeks, including at least one Grand Test and one PYP. This unlocks every chart in every tab.

---

## Test Type Catalogue

Each type renders differently in `/student/progress` → **Exams** tab. Make sure you test all four.

| Type | `subject` label shown | Standing card breakdown | Origin login |
|------|-----------------------|--------------------------|--------------|
| Quick Test (single subject) | actual subject name | overall only | Teacher |
| Grand Test (multi-subject) | literal string `"Grand Test"` | per-subject rows | Institute |
| Previous Year Paper | actual subject (or pattern) | overall + year/board badge | Institute |
| Multi-subject custom | first subject + `+N` chip | per-subject rows | Teacher (if supported) |

If any of these renders identically to another, file as P0 — the Exams tab cannot fulfil its discrimination purpose.

---

## State Reset Protocol

Between cycles, several pieces of *local* state can poison results. Reset in this order before each fresh cycle:

1. **LocalStorage curriculum keys** — keys prefixed `student-curriculum-` (per `student-portal-curriculum-persistence`). Wrong stored track will skew which subjects render.
2. **LocalStorage test session keys** — keys prefixed `test-session-` (see `useTestSessionPersistence`). A half-finished attempt counts as in-progress and skews counts.
3. **Hard reload** (`Cmd+Shift+R`) — clears the in-memory Map caches in `progressData.ts` (these are seeded PRNG caches; without a reload you may keep seeing stale mock data).
4. **Re-login** as the student — re-fetches batch enrollment and curriculum.

If after a reset a chart still shows stale numbers, that is a P0 (cache leak across sessions).

---

## How To Use This Doc

- Treat the **Login Matrix** as a checklist before each cycle.
- When a sibling doc says "see Setup §Minimum Data Floor", it means *come back here* and confirm the floor is met before logging a bug.
- When a sibling doc says "see Setup §Threshold Reference", use the 75/50/35 table above as the source of truth.
- Severities used across the suite:
  - **P0** — wrong data / cross-tab math mismatch / canonical threshold violated / cache leak across sessions.
  - **P1** — visible UX defect (layout shift, missing skeleton, wrong color tier, missing breadcrumb).
  - **P2** — polish (animation jitter, tooltip copy, microcopy alignment).

---

## Sibling Documents

- [Overview Tab QA](./student-progress-overview-qa.md)
- [Subjects Tab QA](./student-progress-subjects-qa.md)
- [Exams Tab QA](./student-progress-exams-qa.md)
- [Insights Tab QA](./student-progress-insights-qa.md)