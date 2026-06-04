## Goal

Today the "My Plans" tab renders an old standalone screen (`LessonPlans.tsx`) backed by an unrelated mock list (`teacherData.teacherLessonPlans`). It has its own "New Plan" button and filters that are completely disconnected from courses, classes, chapters, and the real package system. Meanwhile, the lesson plans a teacher actually creates live per-chapter via `getOwnLessons` (keyed by teacher + package + chapter).

We will make "My Plans" a true **roll-up index**: a read-only list that aggregates every lesson the teacher personally authored across all their sources/chapters. It is not a creation surface. Clicking a plan jumps back into that chapter's library view to teach, present, or edit it.

## What the user sees

- The `[ CBSE ] [ IIT-JEE Mains ] [ My Plans ]` chip row stays exactly as is.
- "My Plans" now shows a clean list/grid of cards, one per teacher-created lesson. Each card shows:
  - Lesson title
  - Context line: Source (CBSE / IIT-JEE Mains) · Class · Subject · Chapter
  - Actions: **Open** (edit in chapter) and **Present**
- A lightweight search box and optional Source + Class filters at the top (driven by real data, not the old free-text fields).
- Empty state: "You haven't created any lesson plans yet. Open a chapter and add one to see it here."
- No "New Plan" button — creation happens only inside a chapter.

```text
My Plans
[ search... ]   [ Source ▾ ]  [ Class ▾ ]

┌────────────────────────────┐  ┌────────────────────────────┐
│ Newton's Laws — Recap      │  │ Organic Basics Intro       │
│ CBSE · Class 11 · Physics  │  │ CBSE · Class 11 · Chemistry │
│ Ch: Laws of Motion         │  │ Ch: Some Basic Concepts    │
│ [ Open ]      [ Present ]   │  │ [ Open ]      [ Present ]   │
└────────────────────────────┘  └────────────────────────────┘
```

## Implementation

### 1. New aggregator (data layer) — `src/data/teacher/lessonPackages.ts`
Add `getOwnLessonRollupForTeacher(teacherId?)` that:
- Iterates `getLessonSourcesForTeacher()` → each source's classes → each class's subjects.
- For each (source, grade, subject) resolves chapters via `getChaptersForScope(pkg.sourceType, pkg.sourceId, gradeId, subjectId)`.
- For each chapter calls `getOwnLessons(teacherId, packageId, chapterId)` (own/teacher-authored lessons only — these carry the `inst-lp-` prefix).
- Emits a flat array of roll-up items, each with: `lessonId`, `title`, `packageId`, `sourceName`, `sourceType`, `gradeId`, `className`, `subjectId`, subject name (via existing subject lookup in masterData), `chapterId`, `chapterName`, plus prebuilt `openHref` and `presentHref` using the existing patterns:
  - open → `/teacher/lesson-plans/library/pkg/{packageId}/lesson/{lessonId}`
  - present → `/teacher/lesson-plans/library/pkg/{packageId}/present/{lessonId}`

This reuses all existing resolvers; no new storage and no change to how lessons are created.

### 2. New roll-up component — `src/pages/teacher/MyLessonPlansRollup.tsx`
- Calls the aggregator, holds local `search` + `sourceFilter` + `classFilter` state, filters client-side.
- Renders the card grid + search/filter bar + empty state described above, following the teacher design system (compact, mobile-first, 44px touch targets).
- `Open`/`Present` use `navigate(...)` with the prebuilt hrefs.
- Re-uses a `tick`/refresh-free read on mount (in-memory mock); list reflects current `getOwnLessons` state.

### 3. Wire it into the tab — `src/pages/teacher/TeacherLessonPlans.tsx`
- Replace `<MyLessonPlans embedded />` (the `tab === "mine"` branch) with `<MyLessonPlansRollup />`.
- Remove the now-unused `import MyLessonPlans from "./LessonPlans";`.

### 4. Cleanup
- The old standalone screen `LessonPlans.tsx` is no longer referenced from the hub. Keep the file only if its `/teacher/lesson-plans/new` + canvas creation flow is still wanted; the roll-up itself does not link to it. (Creation is now exclusively in-chapter via the existing "Add lesson" flow.) No route changes required.

## Out of scope
- Lesson composer / presentation internals.
- How lessons are created inside a chapter (unchanged).
- Institute / SuperAdmin package editors.
- Any backend/data persistence (still in-memory mock layer).

## Technical notes
- Subject id → name uses the existing master-data helper already imported in `lessonPackages.ts` (`getClassName` is there; add the analogous subject lookup).
- All identifiers stay kebab-case in URLs per project convention.
- No new dependencies.
