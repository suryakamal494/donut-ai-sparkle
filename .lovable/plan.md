# Teacher Reports QA — Three Test Cycle Documents

## Progress
- [x] Phase 1 — Chapters QA (`teacher-reports-chapters-qa.md`, ~45 scenarios across A–H, with data-seeding intro and highest-risk-bugs callouts)
- [ ] Phase 2 — Exams QA (next)
- [ ] Phase 3 — Students QA

---

Mirror the format already used in `timetable-substitution-edge-qa.md` and `timetable-upload-qa.md`: intent-led narrative intro, "Before You Begin" data-seeding section, scenarios with self-explanatory titles + 3 blocks (**What this is** / **What to try** / **Expected**). No `TR-` prefix — just `A1`, `B1`, etc. Plain numbering.

Each cycle stays in the 40–50 scenario range. Goal: give interns *intent* and edge-case awareness, not click-by-click recipes.

## Files to create

- `docs/06-testing-scenarios/inter-login-tests/teacher-reports-chapters-qa.md` (Phase 1)
- `docs/06-testing-scenarios/inter-login-tests/teacher-reports-exams-qa.md` (Phase 2)
- `docs/06-testing-scenarios/inter-login-tests/teacher-reports-students-qa.md` (Phase 3)

Plus update `.lovable/plan.md` to track progress and add entries to `docs/06-testing-scenarios/README.md` if a section listing exists.

---

## Common "Before You Begin" — Data Seeding Guidance

Every doc opens with a data-seeding section that tells the tester **what to populate and why**, never *exactly* which questions or marks to use. Example phrasing:

> Before testing Chapter reports you need a batch with enough varied performance signal to make the heatmap, buckets, and AI insight cards meaningful. Aim for:
> - **At least 2 batches** assigned to your teacher login, ideally one strong-performing and one struggling, so you can compare how the same UI handles different distributions.
> - **At least 25–30 students** per batch — fewer and the bucketing (Mastery / Stable / Reinforcement / Foundational Risk) won't have anything to split.
> - **At least 4–5 chapters** taught, with a mix: one chapter where most students score well, one where most struggle, one with very few attempts (sparse data), and one that has never been examined yet (zero data).
> - **6–10 completed exams** spread over the last few weeks — mix Quick Tests, Grand Tests, and at least one Institute Test on your subject. Variation in dates is what drives the trend arrows.
> - For at least one chapter, generate a **practice assignment** for each band so the Practice History section has rows to validate.

The intent line: *"You are not building toy data. You are building the conditions under which real bugs surface — empty states, single-student bands, every-student-passed chapters, etc."*

---

## Phase 1 — Chapters QA (~45 scenarios, 8 sections)

**File**: `teacher-reports-chapters-qa.md`

Routes touched: `/teacher/reports/:batchId` (Chapters tab), `/teacher/reports/:batchId/chapters/:chapterId`, `.../practice`, `.../practice/:sessionId`. Components: `ChaptersTab`, `ChapterOverviewBanner`, `TopicHeatmapGrid`, `StudentBuckets`, `ChapterPracticeHistory`, `ChapterExamBreakdown`, `BatchHealthCard`.

Sections:

- **A. Chapters Tab Listing & Sorting** (5) — empty state when no exams yet; chapter ordering (worst-first per project memory); chapters with zero attempts; long chapter names; subject filter when teacher has multiple subjects.
- **B. Chapter Overview Banner** (4) — overall success rate calculation across mixed exam types; `examsCovering` count when same exam covers chapter twice; `totalQuestionsAsked` when a question is reused across exams; banner behavior on a chapter with one exam vs many.
- **C. Topic Heatmap** (6) — color tier boundaries (75 / 50 / 35 thresholds — try seeding scores exactly on the line); topic with zero questions asked; very long topic names; heatmap density on 320px viewport; heatmap when all topics are green vs all red; tap-to-drill behavior.
- **D. Student Buckets & PI Bucketing** (7) — default expand/collapse per band (Reinforcement and Foundational Risk should open, others closed); single-student band; empty band; band that contains every student; PI tie-breaking (two students with identical PI); student who has attempted 0 questions in this chapter (should they appear?); behavior when a student transferred mid-cycle.
- **E. Generate Practice (3-step Wizard)** (8) — opening the wizard from each band's CTA; prefill correctness (chapter, weak topics, suggested difficulty); switching difficulty mid-wizard; generating with zero weak topics; assigning to a band that has 0 students; navigating back mid-wizard (state retention); double-clicking Generate (idempotency); long generation latency / abort.
- **F. Chapter Practice History** (5) — newly-generated session appearing immediately; sessions ordered most-recent-first; session that no student has attempted yet; session whose linked chapter was renamed in master data; deleting a practice (if supported) and verifying counts elsewhere update.
- **G. Chapter Exam Breakdown & Cross-Navigation** (5) — drilling from a row into the exam detail and back returning to this chapter (returnTo preservation); exam from a different subject incorrectly listed; exam that was un-published after results were captured; institute test rows distinguished visually (violet/purple per project memory); sort by date vs by avg.
- **H. Edge Cases & Stability** (5) — same chapter under two curriculums (CBSE Physics vs JEE Physics) showing correct curriculum context; chapter removed from master data after exams reference it; mock data stability — refreshing the page should not change numbers (tests the seeded-PRNG promise); rapid tab switching between Chapters / Exams / Students; chapter detail on 320px screen.

Critical edge bugs to call out at top of doc: stale numbers after returning from practice generation; bucket counts not summing to roster size; heatmap colors flipping after refresh (PRNG bug); returnTo lost when drilling two levels deep.

---

## Phase 2 — Exams QA (~48 scenarios, 8 sections)

**File**: `teacher-reports-exams-qa.md`

Routes: `/teacher/reports/:batchId` (Exams tab), `/teacher/reports/:batchId/exams/:examId` (4 sub-tabs: Overview, Questions, Chapters, Difficulty). Components: `ExamsTab`, `ExamResultCard`, `ActionableInsightsCard`, `AIAnalysisCard`, `ReteachingPlanCard`, `RecentExamsCard`, `ExamCompareCard`.

The exams cycle has the **strongest cross-portal angle** (institute-created Grand Tests must appear correctly per teacher subject), so emphasize that throughout.

Sections:

- **A. Exams Tab Listing — My Exams vs Institute Tests** (6) — visual separation of teacher-created vs institute-created tests; institute test styling (violet/purple); count badges on tabs; empty state for either side; sort by date vs avg; exam scheduled-but-not-completed not appearing here.
- **B. Institute Test Subject Scoping (HIGH PRIORITY)** (7) —
  - *Setup hint*: "Have institute admin create a Grand Test covering Physics + Chemistry + Maths, publish it to a batch with three teachers — one per subject. Log in as each teacher in turn."
  - Each teacher sees only their subject's questions and analytics — never the other two.
  - Teacher who teaches *two* subjects in the test sees both, side by side.
  - Teacher with no subject in this test should not see the test at all (or sees it disabled with explanation).
  - Multi-batch Grand Test: the same test appears under each batch with its own batch-level numbers.
  - Re-assigning the test to a new batch after results exist — does the new batch start clean or inherit?
  - A subject is added to the institute test after results captured — what does the teacher of that new subject see?
  - Teacher's subject assignment is *removed* mid-cycle — does the institute test row disappear?
- **C. Exam Detail — Overview Sub-tab** (5) — verdict card narrative; class average / median / top / bottom calculations; trend arrow vs previous exam in same chapter set; behavior when this is the first exam (no previous to compare); responsive layout at 320px.
- **D. Questions Sub-tab + Reteaching Plan** (6) — question accordion expand/collapse; questions sorted by lowest success rate first; option-level distractor breakdown; Reteaching Plan card appearing only when there are <50% success questions; "Generate Homework" from Reteaching Plan prefilling correct topics; question that no student attempted.
- **E. Chapters Sub-tab** (4) — per-chapter success rate within the exam; chapter that contributed only one question (statistical noise warning); cross-link to Chapter Report preserving exam context; chapter with all-correct vs all-wrong distribution.
- **F. Difficulty Sub-tab** (4) — difficulty mix (Easy/Medium/Hard) bar; case where one bucket is empty; case where students did better on Hard than Medium (anomaly highlighted?); difficulty data when teacher used AI-generated questions vs question-bank-pulled.
- **G. AI Touchpoints — Actionable Insights & AI Deep-Dive** (8) — Insight cards rendered with severity colors; "Take Action" launching AIHomeworkGeneratorDialog with correct prefill (subject, batch, topics, banner text); insight card when there are no findings (graceful empty state); AI Deep-Dive loading / error / timeout states; regenerate button; insight card based on stale data (after retest); insights for a Grand Test scoped to teacher's subject only; double-click protection on Take Action.
- **H. Edge Cases, UI/UX & Stability** (8) — exam where every student got 100%; exam with one submission; exam open vs closed state; tab switching between sub-tabs preserves scroll; export / share button on a long exam; printing a long exam (per export-and-sharing memory); exam that spans multiple chapters not all assigned to this teacher; rapid back-button navigation.

Top-of-doc highlighted bugs: **subject leakage on Grand Tests** (P0), insight prefill drift, AI Deep-Dive showing other subject's text, stale verdict after retest.

---

## Phase 3 — Students QA (~45 scenarios, 8 sections)

**File**: `teacher-reports-students-qa.md`

Routes: `/teacher/reports/:batchId` (Students tab), `/teacher/reports/:batchId/students/:studentId`. Components: `StudentsTab`, `StudentHeaderCard`, `StudentAISummary`, `ChapterMasteryCard`, `ExamHistoryTimeline`, `DifficultyAnalysis`, `WeakTopicsList`, `MultiSubjectRiskCard`, `AIHomeworkGeneratorDialog`.

Setup emphasis: tester needs students that span all four PI bands, at least one student weak in multiple subjects (to exercise multi-subject risk card), one student with very few attempts (sparse data), one student newly added.

Sections:

- **A. Students Tab Roster & PI Bucketing** (6) — bucket distribution; single-student bucket; empty bucket (default state); roster sort within bucket (worst-first); search/filter by name; student count badge accuracy.
- **B. Student Header Card** (4) — name + class + batch shown; PI not shown to teacher (per memory — internal only); "Generate Homework" button position; header on 320px.
- **C. AI Student Summary** (5) — strengths / priorities / engagement note rendering; summary for a top performer (no priorities — graceful); summary for a student with zero attempts; "Scroll to Weak Topics" anchor working; "Generate Homework" prefill carrying student name + weak topics into the dialog banner.
- **D. Chapter Mastery Grid** (5) — color tiers (≥65 green, 40–64 amber, <40 red — verify exact thresholds per the page tooltip); expand/collapse single chapter at a time; chapter with no attempts; very wide grid scroll behavior; long chapter name truncation.
- **E. Exam History Timeline** (5) — exams ordered chronologically; exam the student missed (absent / didn't submit); institute tests interspersed and visually distinct; tap-through to exam detail with returnTo back to this student; very long history (10+ exams) — pagination or scroll.
- **F. Difficulty Analysis & Weak Topics** (5) — collapsible default state (collapsed on small screens per memory); weak topic list ordered worst-first; weak topic with one supporting attempt vs many; topic that no longer exists in master data; export-friendly rendering.
- **G. Multi-Subject Risk & Cross-Subject Signal** (5) —
  - *Setup hint*: "You need a student whose Performance Index is below 35 in at least two of your subjects. If you only teach one subject this section won't fire — confirm that's the expected behavior."
  - Card appearing only when criteria met (PI < 35 in 2+ subjects per memory);
  - card content listing each subject and its PI;
  - card on a student weak in only one subject (should not appear);
  - card when teacher only teaches one subject (should not appear, or shows itself differently);
  - tapping a subject inside the card navigating to the right context.
- **H. Generate Homework from Student Profile + Edge Cases** (10) — three entry points (header CTA, AI summary CTA, weak topic row CTA) all opening the same dialog with consistent prefill; dialog prefill including student name in banner and weak topics in instructions; switching subject inside the dialog when student has multi-subject weakness; generating without any weak topics (graceful default); double-click on Generate; navigating away mid-generation; student deleted from batch while you have their report open; student transferred to another batch (does this report still load?); student profile on 320px screen with collision padding (per UX memory); rapid drilling student → chapter → back → another student (state cleanup).

Top-of-doc highlighted bugs: prefill drift between the three Generate Homework entry points (P0); chapter mastery thresholds disagreeing with the tooltip; institute exam history rows opening the wrong subject view; multi-subject risk card showing for single-subject teachers.

---

## Cross-cutting UI/UX checks (woven into each cycle, not a separate section)

Each cycle includes responsive checks at 320 / 768 / desktop widths, touch target ≥44px verification, swipe-to-dismiss on mobile dialogs, and visual distinction of institute content (violet/purple) per project memory. These appear as individual scenarios in the Edge Cases section of each doc rather than as a dedicated section, so the focus stays on data correctness.

---

## Execution sequence

1. **Phase 1**: Write `teacher-reports-chapters-qa.md`. Update `.lovable/plan.md`.
2. **Phase 2**: Write `teacher-reports-exams-qa.md`. Update plan.
3. **Phase 3**: Write `teacher-reports-students-qa.md`. Update plan and the testing-scenarios `README.md` index if a list exists.

Deliver phase 1 first, then ask for confirmation before phase 2 — same cadence used for the timetable docs. No code changes, docs only.
