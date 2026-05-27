# Student Progress — Exams Tab QA

> The most upstream-dependent tab. Tests `ExamHistoryTimeline`, `PerExamStandingCard`, and the second instance of `ExamTrendChart`. **Read [Setup & Preconditions](./student-reports-setup-and-preconditions-qa.md) first — this tab will look broken if the test fixtures aren't seeded.**

Route: `/student/progress` with `activeTab = "exams"`. Data: `getExamsWithContext()`. Auto-selects the most recent exam on first render (see `Progress.tsx` `useEffect`).

### Threshold reference
75 / 50 / 35. See Setup §Threshold Reference.

---

## A. Timeline Composition (the big one)

**Why this matters:** the timeline is the only place where Quick Tests, Grand Tests, PYPs, and multi-subject tests visually mix. Any one of them rendering wrong is a category failure.

**Preconditions:** all four fixture types from Setup §Test Type Catalogue must be attempted at least once.

**Scenarios**

- **A1.** A Teacher-created **Quick Test** appears with the actual subject name (e.g., "Physics") and the teacher's name as the creator chip.
- **A2.** An Institute-created **Grand Test** appears with the literal label `"Grand Test"` and shows a multi-subject indicator (chip, badge, or icon). Showing the first subject only and hiding the multi-subject nature = **P0** (mislabel).
- **A3.** A **PYP** appears with a year badge (e.g., "2023") and the board/pattern (e.g., "JEE Main").
- **A4.** Multi-subject custom test (if supported) appears with a `+N` chip indicating additional subjects.
- **A5.** Type badges must be visually distinct (color or icon). Two types rendering identically = **P0**.

**What to try:** seed two exams with identical names but different types → both must still be uniquely identifiable in the timeline (by type chip + date, not by name alone).

---

## B. Newest-First & Auto-Select

**Scenarios**

- **B1.** On first land on the Exams tab, the latest exam by `date` is auto-selected and `PerExamStandingCard` shows its details. See `Progress.tsx` line ~88. If a second-latest exam is selected instead → **P0** (sort bug).
- **B2.** Two exams with the same `date` timestamp → tie-breaker should be deterministic across reloads (verify; if it flips, file P1).
- **B3.** Manually select an older exam → `selectedExamId` persists during the same tab visit. Leave tab and return → spec is acceptable to re-auto-select latest; document expected behaviour and verify it matches.

---

## C. PerExamStandingCard

**Scenarios**

- **C1.** Score line shows `score / maxScore` and `round((score / maxScore) * 100)%`. Mismatched percentage = **P0**.
- **C2.** Rank and percentile (if released) — see `Access Security` memory: ranks may be delayed post-exam. A leaked rank before the release window = **P0** security/UX failure.
- **C3.** **Grand Test selected** → card shows a per-subject breakdown (rows for Physics / Chemistry / Maths or whichever subjects). Missing breakdown on a Grand Test = **P0** (defeats the purpose of the type).
- **C4.** **Quick Test selected** → no per-subject breakdown (would be redundant); shows overall score, accuracy, and time taken if available.
- **C5.** Close button (`onClose`) clears `selectedExamId` → card collapses or shows "Select an exam from the timeline" empty state.

---

## D. Trend Chart Consistency

**Scenarios**

- **D1.** Selecting "All subjects" in the Exams tab's `ExamTrendChart` must produce the same line as the Overview tab's chart. Series divergence = **P0** (data layer split).
- **D2.** Filtering the chart to a single subject must produce the same series the **Subjects** tab uses for that subject's chart (if rendered). Three-way divergence = **P0**.
- **D3.** Adding a new attempt (e.g., student finishes a test in another tab and returns) — verify whether the chart updates on tab re-entry or requires a hard reload. Document as a known limitation if reload-required.

---

## E. Cross-Login Traceability

**Why this matters:** an exam's metadata is set upstream. If the student panel renders the wrong teacher name or origin label, the bug is in the data layer not the UI.

**Scenarios**

- **E1.** Teacher A creates a Quick Test → in the student timeline, the creator chip reads "Teacher A" not a generic placeholder.
- **E2.** Institute renames a Grand Test → student sees the new name on next reload. Old name persisting = **P0** stale cache.
- **E3.** Institute deletes/un-assigns a test the student already attempted → attempt should remain in history (immutable record); deletion should not corrupt the timeline. A vanished attempt = **P0** data integrity.
- **E4.** PYP year/board values match the Institute's PYP catalogue. Wrong year = **P1** metadata bug.

---

## F. Multi-Subject Math Hygiene

**Why this matters:** Grand Tests can either count toward subject averages or not. The system must do one and only one consistent thing.

**Scenarios**

- **F1.** Note a subject's average in the Subjects tab BEFORE seeding a Grand Test. Attempt the Grand Test. Return to Subjects.
  - If Grand Test contributes to subject averages: the subject's average must shift by the documented weighting.
  - If it does NOT contribute: the subject's average must be unchanged.
  - Inconsistency (e.g., contributing to some subjects but not others) = **P0**.
- **F2.** Verify the rule is the same across all subjects (Physics, Chem, Maths). Asymmetric inclusion = **P0**.

---

## G. Navigation

**Scenarios**

- **G1.** Where supported, clicking an exam → routes to `/student/tests/:testId/results`. Back button returns to `/student/progress` Exams tab with `selectedExamId` preserved (or at least with the tab still active). Landing on Overview after Back = **P1**.
- **G2.** Direct deep-link to `/student/progress?tab=exams` (if supported) must land on Exams; otherwise document that deep-linking by tab is not supported.
- **G3.** Rapidly clicking different timeline rows must not race the `PerExamStandingCard` Suspense fallback (no infinite skeleton).

---

## Done Criteria

- All four test types render distinctly in the timeline.
- Auto-select picks the newest exam.
- Grand Test selection shows per-subject breakdown.
- Trend chart series matches Overview tab byte-for-byte.
- Subject-average inclusion rule for Grand Tests is consistent across all subjects.