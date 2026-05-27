## Student Reports QA — Plan

The student panel doesn't have a separate "Reports" page — the equivalent is **`/student/progress`**, which has exactly **4 tabs**: Overview, Subjects, Exams, Insights. Since student reports are largely a *consumption* surface (no creation, no scoping), the test cycles are smaller than teacher/institute. The hard part is **setting up the right upstream data** (tests from institute + teacher) so the tabs actually have something to display.

I'll write **5 documents** following the same depth/intent style as the Teacher Reports QA suite (narrative scenarios, exploratory "what to try" hints, P0–P2 severities).

---

### Document 1 — `student-reports-setup-and-preconditions-qa.md` (NEW, shared prerequisite)

A single-source-of-truth setup guide that the other 4 docs reference. Covers:

- **Required cross-login fixtures** the tester must seed BEFORE opening Progress:
  - Min 1 **Quick Test** per subject created by the **Teacher** (subject-scoped, batch-assigned).
  - Min 1 **Grand Test** created by the **Institute** (multi-subject — Physics + Chem + Maths or NEET pattern).
  - Min 1 **Previous Year Paper** assigned to the batch.
  - Min 1 **Multi-subject custom test** (where supported) to verify subject roll-ups.
  - At least 5–6 attempted exams across **3+ subjects** so trends, sparklines, and radar render meaningfully.
- **Login matrix**: which login creates what, and where the student must be enrolled.
- **Data thresholds** the tester needs to hit to verify each visual:
  - Trend chart needs ≥ 2 exams per subject.
  - Radar needs ≥ 3 subjects with attempts.
  - Streak calendar needs activity on multiple distinct days.
  - "At Risk" insight needs at least one subject < 35%.
- **Canonical thresholds reference** (mirrors teacher-reports docs): 75 / 50 / 35 from `reportColors.ts`.
- **How to reset state** between cycles (clear localStorage keys for curriculum persistence).

---

### Document 2 — `student-progress-overview-qa.md`

Covers the **Overview tab** (default landing). Sections:

- **A. Header & Secondary Tags** — overall PI badge, streak chip, rank chip rendering with empty/full data.
- **B. ProgressHeroCard** — overall average math, trend arrow direction vs. previous period.
- **C. BatchStandingCard** — rank vs. batch size, percentile band coloring, edge cases (rank #1, last rank, ties).
- **D. SubjectOverviewGrid (compact)** — subject tile colors, "tap to drill" handoff to Subjects tab with `selectedSubjectId` carried over.
- **E. ExamTrendChart** — line continuity with 1 exam (degenerate), 2 exams, many exams; subject filter behavior.
- **F. WeeklyActivityChart** — bar heights vs. minutes, total/average math, week boundary handling.
- **G. Responsiveness** — 320px stack vs. `lg:grid-cols-2` split; swipe between tabs via `useSwipeTabs`.

---

### Document 3 — `student-progress-subjects-qa.md`

Covers the **Subjects tab** + `SubjectDeepDive` drill-in. Sections:

- **A. Grid state** — all subjects from enrolled batch curriculum render; missing-data subject states.
- **B. Selection & deep-dive** — clicking a tile loads `SubjectDeepDive`; back button restores grid + scroll position.
- **C. Per-subject metrics** — average, exam count, weak chapters list, trend.
- **D. Cross-tab handoff** — selecting a subject in Overview lands here with the right subject pre-selected.
- **E. Curriculum-track behavior** — for multi-track students (e.g., NEET + boards), verify that each subject's track context is preserved (per `student-portal-curriculum-persistence` memory).
- **F. Empty states** — subject with zero exams, zero chapters attempted.

---

### Document 4 — `student-progress-exams-qa.md`

Covers the **Exams tab** (timeline + per-exam standing + trend). This is where the upstream test setup matters most. Sections:

- **A. Timeline composition** — Quick Tests, Grand Tests, PYPs all appear with correct type badges and subject labels ("Grand Test" label for multi-subject).
- **B. Newest-first ordering & auto-select** — verify latest exam is auto-selected on tab entry; manual selection persists across re-renders.
- **C. PerExamStandingCard** — rank, percentile, subject-wise breakdown for grand tests, total marks math `score/maxScore`.
- **D. ExamTrendChart in this tab** — uses same dataset; verify consistency with Overview tab's chart.
- **E. Cross-login traceability** — test created by Teacher A appears with Teacher A's name; institute Grand Test appears with institute label; PYP shows year/board.
- **F. Multi-subject test behavior** — verify per-subject score breakdown on the standing card; verify it does NOT corrupt subject-level averages in the Subjects tab.
- **G. Navigation** — clicking an exam (where supported) routes to `/student/tests/:testId/results`; back returns to the tab with selection preserved.

---

### Document 5 — `student-progress-insights-qa.md`

Covers the **Insights tab**. Sections:

- **A. InsightBanner** — verify banner type (encouragement vs. warning vs. milestone) matches data state; copy is data-grounded (mentions actual subject/chapter, not generic).
- **B. StreakCalendar** — current streak, longest streak, active-day dot rendering across month boundaries; behavior with zero activity.
- **C. SubjectRadarChart** — needs ≥ 3 subjects; verify axis labels, scale 0–100, color per subject from subject palette.
- **D. WeeklyActivityChart** (duplicated from Overview) — verify same numbers shown in both tabs.
- **E. At-Risk surfacing** — when any subject < 35%, verify it surfaces in insight banner copy AND aligns with the red color tier elsewhere.
- **F. Lazy-load behavior** — each chart is `React.lazy`; verify skeletons render briefly and chart appears without layout shift.

---

### Cross-cutting items in every doc

- **Threshold reference block** prepended (75/50/35 canonical, flag any 65/40 hard-codes as bugs).
- **Severity tags** (P0 broken/wrong-data, P1 visible UX defect, P2 polish).
- **"What to try"** exploratory variations: 320px viewport, swipe gestures, rapid tab-switching, network throttling on lazy chunks, localStorage clearing mid-session.
- **Mobile-first** orientation (matches project memory: student panel is mobile/tab first).

---

### Integration

- Register all 5 docs in `src/data/docsNavigation.ts` under a new **"Student Reports QA"** category nested in `06-testing-scenarios/inter-login-tests`.
- Update `.lovable/plan.md` to track this as the next QA cycle.

---

### Out of scope (intentionally)

- Test Player flow (`/student/tests/:testId`) — that's exam-taking, not reports. Already covered in `exam-tests.md`.
- Dashboard / Subjects landing / Timetable tabs — these are not "reports". The user explicitly scoped this to reports.
- Copilot insights — separate feature with its own architecture memory.

This keeps the suite **focused and not overboard**, mirroring the user's guidance.
