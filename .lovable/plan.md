# Teacher Reports QA Suite — Status

## Complete

- `teacher-reports-chapters-qa.md` — sections A–H + Section I (Practice Session Detail), threshold reference block
- `teacher-reports-exams-qa.md` — sections A–H + Section I (Institute Test Detail), threshold reference block
- `teacher-reports-students-qa.md` — sections A–G, threshold reference block
- `teacher-reports-landing-and-health-qa.md` — new doc covering Reports landing grid, Today's Focus / `BatchHealthCard`, and the cross-page navigation chain (sections A–C)
- All four docs registered in `src/data/docsNavigation.ts` under "Teacher Reports QA"

## Coverage

Every page and component on the Teacher Reports tree is now covered:

- `/teacher/reports` — landing batch grid (landing-and-health doc, Section A)
- `BatchHealthCard` / Today's Focus — landing-and-health doc, Section B
- `/teacher/reports/:batchId` — three tabs covered by chapters / exams / students docs
- `/teacher/reports/:batchId/chapters/:chapterId` — chapters doc Sections A–H
- `/teacher/reports/:batchId/chapters/:chapterId/practice` — chapters doc Section E (3-step page)
- `/teacher/reports/:batchId/chapters/:chapterId/practice/:sessionId` — chapters doc Section I
- `/teacher/reports/:batchId/exams/:examId` — exams doc Sections A–H
- `/teacher/reports/:batchId/institute-test/:testId` — exams doc Section I
- `/teacher/reports/:batchId/students/:studentId` — students doc Sections A–G
- Cross-page navigation, breadcrumbs, deep-links, tab/scroll restoration — landing-and-health doc Section C

## Known Threshold Inconsistency

Documented in all four docs via the "Threshold Reference" block. Canonical scale is 75/50/35 in `src/lib/reportColors.ts`. The 65/40 hard-codes in `Reports.tsx` and `StudentReport.tsx` Chapter Mastery tooltip are documented as bugs to file against the UI, not against the test plan.
