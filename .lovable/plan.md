## Goal

1. SA assigns whole packages to an institute (via the curriculum/course assignment dialog, as a second step).
2. Institute sees those packages in a new "Packages" section, reorganises chapters/lessons/blocks locally, and **assigns each package to one or more of its batches** from inside the package detail itself.
3. Once a package is bound to a batch, every student in that batch implicitly gains access. (Actual student/teacher surfacing is out of scope here — we only persist the binding.)

## Key UX decision — batch assignment inside the package

Lives **inside the package detail page** as a dedicated "Batches" tab (not a separate module). Reason: the question "which of my batches uses this package?" is always asked while looking at a package. Batches list is short (3–10 per institute typically), so this stays light.

Layout per package, "Batches" tab:

```text
Package: JEE Foundation 2025  (Class 9–12)

Class 9
  ☐ Batch A — Morning      ☐ Batch B — Evening
Class 10
  ☑ Batch C — Foundation A  ☑ Batch D — Foundation B
Class 11
  ☑ Batch E — Advanced      ☐ Batch F — Drop-out
Class 12
  ☐ Batch G — Repeaters
```

- Grades come from the package's shape; rows are skipped if the institute has no batch in that grade.
- Each row lists the institute's batches in that grade as toggleable chips (44px touch targets).
- A bulk "Select all in this grade" link sits on each row.
- Saving writes `(instituteId, packageId, batchId)` rows to a binding store.
- The top-vs-bottom-batch scenario is solved naturally: pick package P1 for Batches C+D, switch to P2 and pick Batches E+F.
- A batch may be bound to several packages (different subjects covered by different packages). No exclusivity enforcement in this phase — a conflict-resolution UX is deferred to the batch-binding follow-up build.

Inside the package list view, each card shows a small "Assigned to 3 of 5 batches" footer chip so the institute can see assignment health at a glance.

## Out of scope (explicit)

- Teacher-facing and student-facing surfacing of packages.
- Per-subject conflict resolution when two packages cover the same batch+subject.
- Per-grade masking inside a package (whole package goes; institute ignores what they don't teach).
- Hiding individual lessons/blocks (only reorder).
- DB persistence — all stores stay in-memory.

---

## Phase 1 — Data layer & helpers (no UI)

Land the contracts first so every later phase has stable types.

**New** `src/data/institute/institutePackages.ts`:
- `assignPackagesToInstitute(instituteId, packageIds[])`
- `getPackagesForInstitute(instituteId): Package[]`
- `removePackageFromInstitute(instituteId, packageId)`

**New** `src/data/institute/institutePackageOrders.ts` (local reorder overrides):
- `getInstituteChapterOrder/setInstituteChapterOrder`
- `getInstituteLessonOrder/setInstituteLessonOrder`
- `getInstituteBlockOrder/setInstituteBlockOrder`
- `resetOrder(instituteId, packageId, scope)`
- Keys: `${instituteId}:${packageId}:${gradeId}:${subjectId}[:chapterId[:lessonId]]`
- Falls back to SA's `order` field when no override exists.

**New** `src/data/institute/institutePackageBatches.ts`:
- `getBatchesForPackage(instituteId, packageId): { gradeId, batchIds }[]`
- `setBatchesForPackage(instituteId, packageId, gradeId, batchIds[])`
- `getPackagesForBatch(instituteId, batchId): Package[]` (used by future student/teacher panels)

**Edit** `src/data/packages/helpers.ts` — add `getEligiblePackagesForAssignment(curriculumIds, courseIds)`.

Verification: write a one-off scratch test in `/tmp` calling each helper to confirm round-trip works.

## Phase 2 — SA: add packages step to the assignment dialog

**Edit** `src/components/institutes/AssignCurriculumCourseDialog.tsx`:
- Convert single-screen dialog to a 2-step wizard:
  - **Step 1** (existing) — curriculums + courses
  - **Step 2** (new) — eligible packages, grouped by source (CBSE / JEE / etc.), with search and source badges
- Footer: Back / Next / Save
- On Save: call `assignPackagesToInstitute` with selected IDs in addition to current curriculum/course save.

**New** `src/components/institutes/AssignPackagesStep.tsx` — the Step 2 body, reusing `PackageCard` (compact variant) for each row.

Verification: open SA → Institutes → Assign → Step 2 lists only packages whose `sourceId` matches Step 1 selection; Save persists.

## Phase 3 — Institute: Packages list view

**New** `src/pages/institute/packages/InstitutePackages.tsx` — grid of `PackageCard` (with new `mode="institute"` prop) for everything `getPackagesForInstitute(instituteId)` returns. Each card shows source badge, shape summary, lesson/test counts, and "Assigned to X of Y batches".

**Edit** `src/components/packages/PackageCard.tsx` — add `mode: "superadmin" | "institute"`. In institute mode: hide edit/archive/draft chips, only "View" CTA, append batch-assignment footer.

**Edit** sidebar + routes (`src/components/layout/Sidebar.tsx` institute section, institute routes file) — register `/institute/packages` and `/institute/packages/:packageId`.

Verification: institute portal sidebar has Packages; list reflects SA assignments; empty state when none assigned.

## Phase 4 — Institute: Packages detail (read-only content + local reorder)

**New** `src/pages/institute/packages/InstitutePackageDetail.tsx` — reuses the SA package editor layout with three top tabs:
- **Content** (default)
- **Tests** (chapter tests, grand tests, PYPs — read-only list)
- **Batches** (Phase 5)

**Edit** `src/components/packages/editor/ChapterRail.tsx`,
`ChapterAccordion.tsx`,
`ChapterDetailPane.tsx`,
`PackageWorkspaceToolbar.tsx` — add `mode` prop. In `institute` mode:
- All create / edit / delete / publish / archive controls hidden.
- Drag handles enabled on chapters, lesson plans, and content blocks; persist via `institutePackageOrders`.
- "Reset order" button per scope when an override exists.
- Reads order with this precedence: institute override → SA `order` → array index.

Verification: drag a chapter, refresh — order persists. Open same package in SA — SA's order untouched. Reset clears override.

## Phase 5 — Institute: assign package to batches

**New** `src/components/institute/packages/PackageBatchAssignmentPanel.tsx` — the "Batches" tab body described above. Pulls institute batches from existing data, groups by grade, intersects with the package's shape, and renders toggle chips. Save writes via `setBatchesForPackage`.

Wire `PackageCard` footer ("Assigned to X of Y batches") to the same store so list and detail stay in sync.

Verification: scenario test — package with grades 10–12, four batches (two in 10, two in 11). Bind the package to one Class 10 batch + one Class 11 batch; reopen, state intact; `getPackagesForBatch` returns the package for those two batches only.

## Phase 6 — Docs

- `docs/02-institute/packages.md` — model, visibility rules, reorder semantics, batch assignment.
- `docs/05-cross-login-flows/package-flow.md` — SA assigns → Institute assigns to batches → (future) Teacher/Student see it.
- Update `docs/06-testing-scenarios/inter-login-tests/packages-qa.md` (existing) with a new "Institute view + batch assignment" section, narrative style, same severity scheme already in use.

## Verification across phases

- SA dialog Step 2 lists only source-matching packages.
- Institute Packages page shows exactly what SA assigned.
- Reorder in institute view never mutates SA's order.
- Batch toggles per grade row, multi-select, persisted, reflected in card footer.
- `getPackagesForBatch` returns correct packages — confirms the contract that future student/teacher panels will rely on, without us building those panels here.
