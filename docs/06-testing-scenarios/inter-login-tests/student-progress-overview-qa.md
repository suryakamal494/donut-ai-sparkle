# Student Progress — Overview Tab QA

> Default landing tab of `/student/progress`. Tests the "first impression" surface: hero card, batch standing, subject snapshot grid, trend chart, and weekly activity. **Read [Setup & Preconditions](./student-reports-setup-and-preconditions-qa.md) first.**

Route under test: `/student/progress` with `activeTab = "overview"`.
Page file: `src/pages/student/Progress.tsx`. Tab content built from `getStudentOverview()`, `getSubjectSummaries()`, `getExamsWithContext()`, `getDerivedWeeklyActivity()` in `progressData.ts`.

### Threshold reference
75 / 50 / 35 from `reportColors.ts`. Any 65/40 split is a P1. See Setup §Threshold Reference.

---

## A. Header & Secondary Tags

**Why this matters:** the header is what the student sees in the first 300 ms. If the streak or PI badge is wrong here, every downstream chart loses credibility.

**Scenarios**

- **A1.** Land on `/student/progress` cold (fresh login). Verify the page title "My Progress" and subtitle "Track your learning journey" render before any chart. The donut-coral icon must not flash a broken-image placeholder.
- **A2.** With `overview.secondaryTags.length > 0`, verify the pills row renders above the tab bar and is **scrollable horizontally** on a 320px viewport without clipping the tab bar below.
- **A3.** Seed a student with **zero attempts**. Tags should be either an empty array (row hidden) or only show neutral tags (no fabricated "Top Performer" — that would indicate mock-data leakage).

**What to try:** zoom browser to 200%, narrow viewport to 320px, switch language (if RTL exists). **Expected:** tags wrap or scroll, never overlap the header icon. Wrong color tier on a tag → P1; fabricated tag with no data → P0.

---

## B. ProgressHeroCard

**Why this matters:** the single number the student remembers. Off-by-one or wrong-direction trend arrows destroy trust.

**Scenarios**

- **B1.** With ≥ 3 attempted exams, confirm the displayed overall % equals `round(mean(subjects[].average))` computed independently from the Subjects tab. If they disagree, **P0** (cross-tab math mismatch).
- **B2.** Trend arrow direction: if `overview.trend === "up"`, icon must be `TrendingUp` in emerald; `"down"` red; `"stable"` muted dash. A green arrow with a falling number is **P0**.
- **B3.** Color tier of the big number must follow Setup §Threshold Reference (Mastery/Stable/Reinforce/At Risk).

**What to try:** seed an exact boundary value (75, 50, 35) and verify the band assignment uses `>=` inclusive at 75/50/35 and exclusive on the upper side. **Expected:** 75 → Mastery, 74 → Stable, 50 → Stable, 49 → Reinforce, 35 → Reinforce, 34 → At Risk.

---

## C. BatchStandingCard

**Why this matters:** rank/percentile is where students compare themselves to peers; arithmetic errors are noticed instantly.

**Scenarios**

- **C1.** Verify `rank` is 1-indexed and `batchSize` matches the institute's recorded student count for the batch. Cross-check by counting student rows in `/institute/students` for that batch.
- **C2.** Percentile must equal `round((1 - (rank - 1) / batchSize) * 100)`. A student at rank 1 in a batch of 40 shows **100th percentile**, not 97.5.
- **C3.** Edge cases: rank 1 (no "above" student), rank == batchSize (last), ties (two students with the same average — both should not display rank 1 unless the data layer explicitly handles ties; if it does, the ordering must be deterministic across reloads).
- **C4.** Batch with only 1 student → card should either hide gracefully or show "Solo — no rank available", never `1/1 (100%)` which is misleading.

**What to try:** demote the student in the institute panel (change batch) and re-login. The card must reflect the new batch's standing, not the old one. Stale standing → P0 cache leak.

---

## D. SubjectOverviewGrid (compact)

**Why this matters:** this grid is the launchpad into the Subjects tab. Wrong colors here cascade into wrong impressions everywhere.

**Scenarios**

- **D1.** Every subject in the batch curriculum renders as a tile. A subject mapped to the batch but with zero attempts must still appear (with an "No data yet" state). A missing subject is **P0** (curriculum-binding bug).
- **D2.** Tile color tier follows Setup §Threshold Reference.
- **D3.** Tap a tile → `handleSubjectSelect(id)` runs → `activeTab` switches to `"subjects"` AND `selectedSubjectId` is set so `SubjectDeepDive` opens directly. Landing on the Subjects grid root after tapping a tile = **P1** (handoff broken).
- **D4.** With 6+ subjects on a 320px viewport, the grid wraps to 2 columns; tile labels truncate with ellipsis without breaking row alignment.

---

## E. ExamTrendChart

**Why this matters:** the chart is the most visible trend signal; degenerate states (1 exam, all same score) often render as broken lines.

**Scenarios**

- **E1.** Seed exactly **1** exam. Chart must show a single dot, not a flat line spanning the axis. No infinite-NaN domain.
- **E2.** Seed **2** exams on the same day → both points render at the same X; tooltip must distinguish them by exam name, not just date.
- **E3.** Seed exams across **multiple subjects**. The chart's subject filter (if present) must include only subjects with attempts, not every curriculum subject.
- **E4.** Cross-tab consistency: the line for "All subjects" must produce the same series the **Exams** tab's `ExamTrendChart` uses. Series divergence → **P0**.

**What to try:** throttle network to Slow 3G to expose the `Suspense` skeleton (`ChartSkeleton`) — it must appear and then swap without layout shift. Layout shift > 0.1 CLS → **P1**.

---

## F. WeeklyActivityChart

**Scenarios**

- **F1.** `totalMinutes` should equal the sum of `data[].minutes`. `averageMinutes` should equal `round(totalMinutes / 7)`. Off-by-one → **P0** (math).
- **F2.** Bar heights are proportional to `minutes`; the tallest bar must reach near the top of the container with no clipping at the cap.
- **F3.** Week boundary: test on Sunday night → Monday morning. The "current week" must roll over (ISO Monday-start) and old activity must move into "last week" or disappear depending on data window. Stale week labels → **P1**.
- **F4.** Zero-activity week → all bars at minimum height with a clear "No activity this week" caption, not 7 bars of 1px (looks broken).

---

## G. Responsiveness & Tab Navigation

**Why this matters:** student panel is mobile-first; the layout grid is `grid-cols-1 lg:grid-cols-2`.

**Scenarios**

- **G1.** At 320px the Overview content stacks vertically in order: Hero → Standing → Subjects → Trend → Activity. At `lg` (≥ 1024px) the two columns split as defined. Any horizontal scroll on 320px → **P1**.
- **G2.** Tab bar has `min-h-[44px]` per pill (touch target standard). Verify with browser dev tools.
- **G3.** Swipe horizontally on the tab body (via `useSwipeTabs`) on mobile → swiping left from Overview lands on Subjects. Swiping right from Overview must NOT navigate (it is the first tab).
- **G4.** Rapid tab switching (5× per second) must not leave a tab in "loading skeleton forever" state. Stuck skeleton = lazy-chunk error swallowed → **P0**.

---

## Done Criteria

- All 7 sections pass on a freshly seeded student matching Setup §Minimum Data Floor.
- All hero numbers cross-check with the Subjects tab and the Exams tab.
- No threshold band is computed with non-canonical (65/40) cutoffs.
- No skeleton remains visible > 2 s on a Fast 3G connection.