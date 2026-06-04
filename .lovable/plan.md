## What you're asking for

Today, when an institute opens a package chapter (e.g. *Knowing Our Numbers*), it sees **only the lesson plans and tests authored by SuperAdmin**, and the whole pane is read-only. The institute can reorder and layer extra blocks onto a shared lesson, but it **cannot add its own brand-new lesson plans or its own tests** to a chapter.

You want institutes to be able to, **per chapter**:
- **Create their own lesson plans** (full composer: name it, add content blocks + quizzes) that sit *alongside* SuperAdmin's lessons.
- **Attach their own tests** (picked from their existing exam library) to that chapter, alongside SuperAdmin's tests.

Rules that stay intact:
- SuperAdmin's lessons/tests remain **read-only** — institutes can use and reorder but **never edit or delete** them.
- Institute-created lessons/tests are **fully editable and deletable by that institute** (their own content).
- Everything an institute adds is **private to that institute** — it never appears in SuperAdmin's master package or for any other institute.

```text
Chapter 01 — Knowing Our Numbers
├── Lesson plans
│   ├── [Shared]   Introduction & Hook        (read-only, lock badge)
│   ├── [Shared]   Core Concepts              (read-only, lock badge)
│   └── [Yours]    Extra Practice Walkthrough (edit / delete) ← NEW
└── Tests
    ├── [Shared]   SA Chapter Test            (read-only)
    └── [Yours]    DPS Weekly Quiz            (remove)        ← NEW
```

## How it will work

### 1. New private data layer (mock, in-memory, institute-scoped)
Create `src/data/institute/institutePackageOwnContent.ts`, mirroring the existing `institutePackageLessonAdditions`/`institutePackageOrders` pattern — keyed by `instituteId :: packageId :: chapterId`:
- **Own lesson plans**: `getOwnLessons`, `getOwnLessonById`, `upsertOwnLesson`, `removeOwnLesson`.
- **Own test attachments**: `getOwnTests`, `addOwnTests(examIds)`, `removeOwnTest`.

This keeps institute content fully isolated. (The current `OwnLessonComposer` mistakenly saves into the *global* package store; this fix routes it to the private store so it never leaks to SuperAdmin.)

### 2. ChapterDetailPane — new "additive" mode
Replace the all-or-nothing `readOnly` with an additive mode used by the institute view:
- Show **"Add lesson plan"** and **"Attach test"** buttons again.
- Render a **merged list**: SuperAdmin lessons/tests (lock/"Shared" badge, no delete) + institute lessons/tests ("Yours" badge, with edit/delete).
- "Add lesson plan" → navigates to the institute lesson composer (`lesson/new`, already routed).
- "Attach test" → opens the existing `AttachTestSheet` (pick from existing exams) and saves into the private store.
- Delete/remove controls appear **only on institute-owned items**.
- Empty state offers both add actions.

### 3. InstitutePackageDetail wiring
- Merge SuperAdmin + institute counts in the chapter rail (`lessonCount`, `testCount`).
- Pass the new additive props and handlers (create lesson, attach test, delete own lesson, remove own test) into `ChapterDetailPane`.
- Combined SA+institute lessons feed the existing local reorder logic unchanged.
- Update the header badge from a hard "Read-only" to convey "shared content is read-only, but you can add your own" (small label tweak).

### 4. Institute lesson composer (`InstitutePackageLessonView`)
- `OwnLessonComposer` save → `upsertOwnLesson` in the private store (not the global package store).
- Lesson lookup resolves `inst-lp-` IDs from the private store first, then falls back to shared lessons for the read-only "SharedLessonView".
- Editing/deleting an institute-owned lesson works end-to-end; shared lessons keep the existing "layer blocks + reset to original" behavior.

### 5. Docs
Update `docs/02-institute/packages.md` to document that institutes can add private lesson plans and attach private tests per chapter, with the use-don't-delete rule for shared content.

## Technical notes
- No backend/schema changes — this module is entirely mock/in-memory, consistent with the rest of packages.
- Reuses existing components: `AttachTestSheet`, `PackageWorkspaceToolbar`, `WorkspaceCanvas`, `ChapterContentSheet`, `QuizDialog`.
- Multi-tenant isolation enforced by always keying reads/writes on `CURRENT_INSTITUTE_ID` (`inst-1` in the mock).
- Mobile-first: new add buttons and merged rows reuse the already-responsive layouts (44px+ targets, stacked toolbar < 400px).

### Files
- **New**: `src/data/institute/institutePackageOwnContent.ts`
- **Edit**: `src/components/packages/editor/ChapterDetailPane.tsx` (additive mode, merged lists, own-item delete)
- **Edit**: `src/pages/institute/packages/InstitutePackageDetail.tsx` (merge counts, wire handlers, badge)
- **Edit**: `src/pages/institute/packages/InstitutePackageLessonView.tsx` (save/lookup via private store)
- **Edit**: `docs/02-institute/packages.md`
