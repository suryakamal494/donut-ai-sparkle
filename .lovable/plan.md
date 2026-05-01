# Final Audit — Teacher Reports QA Suite

Three docs audited against the actual code in `src/pages/teacher/*` and `src/components/teacher/reports/*`:

- `teacher-reports-chapters-qa.md` — 672 lines, 8 sections (A–H)
- `teacher-reports-exams-qa.md` — 723 lines, 8 sections (A–H)
- `teacher-reports-students-qa.md` — 595 lines, 7 sections (A–G)

## Verdict

**Strong on depth, narrative, and intent.** Every scenario reads as a story with "What this is / What to try / Expected", thresholds and PI bands match `reportColors.ts` and `studentReportData.ts`, P0–P2 severities are explicit, AI hallucination and concurrency cases are well covered.

**But coverage is incomplete.** Five real surfaces in the Teacher Reports flow are either missing or mentioned in passing only. A tester who runs every scenario as written today would still ship the product without exercising those screens.

## Coverage Gaps Found

### Gap 1 — Reports landing page (`/teacher/reports`) is uncovered
`src/pages/teacher/Reports.tsx` renders the batch grid: per-batch `classAverage` tile (with 65/40 color thresholds — note this is *yet another* threshold split distinct from 75/50/35), trend chip computed from `classAverage − previousAverage`, `atRiskCount` color tiers (>3 red, >0 amber, else green), empty state, and navigation to `/teacher/reports/:batchId`. **Zero scenarios exist for this page in any of the three docs.**

### Gap 2 — `BatchHealthCard` / "Today's Focus" widget is uncovered
Rendered on every batch page above the tabs (`BatchReport.tsx`), 178 lines of logic in `BatchHealthCard.tsx`. It's the first thing a teacher sees and surfaces weakest chapter, at-risk students, and quick-action navigation. The Chapters doc mentions it once (empty-state behavior) and the Students/Exams docs not at all.

### Gap 3 — `PracticeSessionDetail` page is uncovered
Route `reports/:batchId/chapters/:chapterId/practice/:sessionId`. The Chapters doc covers Practice History (Section F) and the 3-step generation flow (Section E) but stops at "session row appears in history". Drill-in to a completed session — per-band breakdown, question review, regenerate — is untested.

### Gap 4 — `InstituteTestDetail` deep dive is thin
Route `reports/:batchId/institute-test/:testId`, 166 lines. The Exams doc verifies the link works and subject scoping is enforced (Section B), but the page's own tabs (Chapters / Difficulty / Questions sub-views — `InstituteChaptersTab`, `InstituteDifficultyTab`, `InstituteQuestionsTab`) and how they differ from a regular Quick Test detail are not walked through.

### Gap 5 — Cross-cutting flows are split, not unified
Three docs, but the actual user journey is one loop: landing → batch (with health card) → tab → detail → back. There is no scenario that validates **breadcrumb integrity, back-button history depth, scroll-restoration, and active-tab preservation** across the full chain. Each doc tests its own slice in isolation.

## Smaller Findings

- **Threshold drift now has *three* values in play:** `reportColors.ts` uses 75/50/35, the `StudentReport.tsx` tooltip says 65/40, the `Reports.tsx` landing tile uses 65/40. The docs flag the first mismatch but never the third. Testers will see "65" on the landing page and "75" on a chapter and won't know which is the bug.
- **`StudentsTab` roster sorting/filtering** is covered in Section A of the students doc but the actual component file should be re-read to confirm whether band filter chips, search, and roll-number sort all exist as documented.
- **Export / share PDF** flow (`src/lib/exportReport.ts` exists) is not referenced in any scenario despite being a known feature surface.
- **Empty / single-data-point states** are covered for chapters and exams but not for the **landing page** (zero batches, one batch, batch with zero exams) or **Today's Focus** (everything green, everything red).

## What "Complete" Should Mean

If every scenario passes today, you can ship the **chapter detail, exam detail, and student detail pages** with confidence. You cannot yet ship the **entry experience** (landing + Today's Focus) or the **deepest drill-ins** (practice session, institute test sub-tabs) with the same confidence. That's the delta to close.

## Remediation Plan

Four focused additions, written in the same narrative depth as the existing docs. No rewrite of existing sections.

### Step 1 — New doc: `teacher-reports-landing-and-health-qa.md`
Covers the entry experience that all three current docs skip past.
- Section A: Reports landing batch grid — tile contents, threshold colors (flag the 65/40 vs 75/50/35 inconsistency explicitly), trend chip math, atRisk color tiers, empty state, single-batch state, navigation.
- Section B: Today's Focus / `BatchHealthCard` — what populates it, weakest-chapter selection logic, at-risk roll-up, quick-action links land on the right deep page with the right context, empty/all-green state, all-red overload state.
- Section C: Cross-page navigation chain — breadcrumbs at every depth, back-button preserves active tab, scroll restoration on return, deep-link entry (paste a `/students/:id` URL fresh).

### Step 2 — Extend Chapters doc with Section I: Practice Session Detail
Drill-in from Practice History row. Per-band breakdown matches what the generator produced, question-level review renders, regenerate flow returns to the 3-step page with prefill, deleted/missing session URL handling, back returns to Chapter Report with practice history scrolled into view.

### Step 3 — Extend Exams doc with Section I: Institute Test Detail page
Walk the full page (not just the link to it). Sub-tabs (`InstituteChaptersTab`, `InstituteDifficultyTab`, `InstituteQuestionsTab`) each get a scenario: what data is shown, how it differs from the Quick Test version, subject-scoping is enforced *inside* each sub-tab not just at page entry, multilingual rendering if any.

### Step 4 — Add a "Threshold Reference" callout to all four docs
A single shared block at the top stating: `reportColors.ts` is canonical at 75/50/35; any UI showing 65/40 is a bug to file against the *UI*, not the data. Eliminates the current ambiguity where a tester sees a mismatch and doesn't know which side to report.

### Out of scope
- No rewrite of the existing A–H sections in any doc — they passed the audit on depth and correctness after the previous two passes.
- No new scenarios for `Reports.tsx` (the teacher reports list page) beyond what's in Step 1, Section A.
- Export PDF flow stays out — it spans more than just Reports and deserves its own dedicated doc.

## Deliverables After Approval

- New file: `docs/06-testing-scenarios/inter-login-tests/teacher-reports-landing-and-health-qa.md`
- Edits: append Section I to `teacher-reports-chapters-qa.md`
- Edits: append Section I to `teacher-reports-exams-qa.md`
- Edits: prepend "Threshold Reference" block to all four docs
- Update `.lovable/plan.md` to mark the suite truly complete after these additions
