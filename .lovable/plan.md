## Goal

Make Inclusions truly modular so a SuperAdmin can build a package with **any combination** of slots — including tests-only packages with no lesson plans, or content-only packages with no tests.

Today the Inclusions step only toggles test-style slots (Chapter Tests, Grand Tests, PYPs). Lesson plans are always-on and the editor forces ≥1 lesson plan before publishing. We'll add a **Lesson Plans (Content)** inclusion alongside the test toggles and gate the editor + publish rule accordingly.

## Changes

### 1. Type — `src/types/packages.ts`
Add `lessonPlans: boolean` to `PackageInclusions`.

### 2. Create wizard — `src/pages/packages/CreatePackage.tsx` (Step 3)
- Default `inclusions` to `{ lessonPlans: true, chapterTests: true, grandTests: false, previousYearPapers: false }`.
- Add a new toggle row at the top of the Inclusions list:
  - **Lesson Plans (Content)** — "Author lesson plans with videos, PDFs, slides, and quizzes per chapter." (BookOpen icon)
- Add validation on Create: at least one inclusion must be enabled, otherwise disable the Create button with a small inline hint ("Enable at least one slot to continue").

### 3. Settings sheet — `src/components/packages/editor/PackageSettingsSheet.tsx`
Add the same "Lesson Plans (Content)" row at the top of the Inclusions section so it can be toggled later. Same "at least one enabled" guard before persisting.

### 4. Editor — `src/pages/packages/PackageEditor.tsx`
- Pass `lessons: pkg.inclusions.lessonPlans` into `ChapterAccordion`'s `inclusionsEnabled`.
- **Publish rule:** replace `lessonCount > 0` with a content-aware rule:
  - If `inclusions.lessonPlans` → need ≥1 lesson plan.
  - Else if any test inclusion enabled → need ≥1 attachment across chapters or grand tests.
  - Else (shouldn't happen due to guard) → block.
  - Update tooltip copy accordingly ("Add a lesson plan or attach at least one test to publish.").

### 5. Chapter accordion — `src/components/packages/editor/ChapterAccordion.tsx`
- Extend `inclusionsEnabled` with `lessons: boolean`.
- Hide the **Add lesson plan** button and rendered lesson rows when `lessons === false`.
- If a chapter has neither lesson plans nor attachments AND no inclusions are enabled for that chapter, keep the "Nothing added yet" message contextual ("Attach a test to this chapter." / "Add a lesson plan." / both).

### 6. Backfill mock data — `src/data/packages/mockPackages.ts`
Every seeded package's `inclusions` object needs `lessonPlans: true` so existing mocks behave unchanged.

### 7. Optional polish (small)
- In `PackageWorkspaceToolbar` no change needed — that toolbar lives inside the lesson composer which is only reachable when `lessonPlans` is on.

## Out of scope
- No changes to attachments data layer, AttachTestSheet, or grand-test section logic.
- No backend/migration work (mock data only).

## Files touched
- `src/types/packages.ts`
- `src/pages/packages/CreatePackage.tsx`
- `src/components/packages/editor/PackageSettingsSheet.tsx`
- `src/pages/packages/PackageEditor.tsx`
- `src/components/packages/editor/ChapterAccordion.tsx`
- `src/data/packages/mockPackages.ts`
