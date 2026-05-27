# Student Progress — Insights Tab QA

> Tests the Insights tab: `InsightBanner`, `StreakCalendar`, `SubjectRadarChart`, and the second instance of `WeeklyActivityChart`. **Read [Setup & Preconditions](./student-reports-setup-and-preconditions-qa.md) first.**

Route: `/student/progress` with `activeTab = "insights"`. Data: `getStudentInsight()`, `getDerivedStreakData()`, `getSubjectSummaries()` (for radar), `getDerivedWeeklyActivity()`.

### Threshold reference
75 / 50 / 35. See Setup §Threshold Reference.

---

## A. InsightBanner

**Why this matters:** the banner is the panel's "voice". Generic or wrong copy ("Keep going!" when the student is at 22%) undermines the entire feature.

**Scenarios**

- **A1.** With at least one subject < 35% → banner is a **warning** variant, mentions the specific subject by name, and offers an actionable link (to that subject's deep-dive or to a relevant test). Generic "you need to improve" copy without naming the subject = **P1** (not data-grounded).
- **A2.** With all subjects ≥ 75% → banner is a **celebration/milestone** variant. A warning variant in a mastery state = **P0** (wrong sentiment).
- **A3.** Mixed state → banner picks the most actionable signal (typically the weakest subject), not the average. Pure-average insights are **P2** missed opportunity.
- **A4.** Streak milestone (e.g., 7-day streak hit) → if the data layer surfaces it, banner should congratulate; otherwise hide the streak insight gracefully.

**What to try:** swap to a student with zero attempts → banner must show an onboarding-style "Take your first test" CTA, not a warning. A red warning on a fresh account = **P0**.

---

## B. StreakCalendar

**Scenarios**

- **B1.** `currentStreak` matches the count of consecutive recent days ending today (inclusive) with at least one activity.
- **B2.** `longestStreak` ≥ `currentStreak`. If `longestStreak < currentStreak` = **P0** math.
- **B3.** Active-day dots render on the correct grid cells. Cross-check the dots against `activeDays` array. Off-by-one (e.g., yesterday's dot painted on today) = **P0**.
- **B4.** Month boundary: navigate from end of month → next month → dots and labels update; no orphaned dots from the old month.
- **B5.** Zero activity → calendar still renders empty (no streak counts shown, or shown as 0). A crash on empty data = **P0**.

**What to try:** change device time forward by 2 days, reload, and verify whether `currentStreak` resets to 0 (because activity is no longer consecutive). Document the result — backend-driven streaks should not be timezone-spoof-able.

---

## C. SubjectRadarChart

**Scenarios**

- **C1.** Polygon has one vertex per subject with ≥ 1 attempt (see Setup §Minimum Data Floor: need ≥ 3). With < 3 subjects, the chart should hide or show a "Need at least 3 subjects with attempts" empty state — never render a degenerate 2-point line.
- **C2.** Axis scale is 0–100. A vertex at 75 must land at 75% of the way from center to edge. Mis-scaled axis = **P0** visual lie.
- **C3.** Color per subject must come from the subject palette (per `color-palette-and-visual-specs` memory) and be **consistent** with the colors used in the Subjects tab and Overview grid for the same subject.
- **C4.** Axis labels truncate gracefully at 320px. Overlapping labels = **P1**.

---

## D. WeeklyActivityChart (duplicated from Overview)

**Why this matters:** the same chart appears in two tabs; the two must agree byte-for-byte.

**Scenarios**

- **D1.** Bars and totals in Insights match Overview tab's `WeeklyActivityChart` exactly (same `weeklyActivity` source). Divergence = **P0**.
- **D2.** Switching between Overview and Insights does not refetch / shuffle the data (deterministic).

---

## E. At-Risk Cross-Surface Consistency

**Why this matters:** if a subject is "At Risk" (< 35%), every surface in the panel should say so — banner copy, radar vertex color, subject tile color.

**Scenarios**

- **E1.** Seed exactly one subject below 35%. Confirm:
  - `InsightBanner` warning mentions this subject.
  - The subject's tile in the Subjects tab is red.
  - The radar vertex for this subject sits in the inner ring (< 35%).
  - The Overview hero card's color tier is NOT red just because one subject is (hero tier depends on overall average).
  - Any disagreement among the first three = **P0**.

---

## F. Lazy Load & Layout Stability

**Scenarios**

- **F1.** Each chart in Insights is `React.lazy` (see `Progress.tsx` imports). Under throttled network, the skeletons (`InsightSkeleton`, `StreakSkeleton`, `RadarSkeleton`, `ChartSkeleton`) must appear and then swap WITHOUT layout shift. Visible jump ≥ 16px = **P1**.
- **F2.** If a lazy chunk fails to load (force a 404 on the chunk URL via dev tools), the page must not crash — it should show a graceful error within that chart's slot, not white-screen the whole tab.
- **F3.** Switch to Insights → immediately switch back to Overview before chunks resolve → no console errors, no orphan promises.

---

## Done Criteria

- Banner copy is always data-grounded (names the actual subject/chapter).
- Streak math is internally consistent (`longestStreak >= currentStreak`).
- Radar uses the same subject palette as Subjects/Overview tabs.
- Weekly activity numbers match Overview tab exactly.
- No layout shift > 16px during lazy chunk swaps.