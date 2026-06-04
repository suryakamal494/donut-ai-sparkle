# Teacher Lesson Plans — Package-sourced content

## Goal
Teachers should see the lesson content that flows down from SuperAdmin → Institute → batch, but **never see the word "package"** — to them it is all **"Lesson Plans"**. A teacher only sees the slice that matches **their batch + class + subject**, navigable as **Curriculum/Course → Class → Subject → Chapter → Lessons**. Teachers can open a lesson to **edit / add their own lessons & attach tests** (mirroring the institute), and **Present** any lesson on a smartboard. Mobile/tablet-first throughout. The existing lesson-plan **editor/canvas is reused untouched**; the timetable auto-open is intentionally deferred.

## The visibility rule (mirrors the backend)
A lesson set is visible to a teacher when there is a three-way match:
1. The package is **bound to a batch** the teacher is assigned to (`getPackagesForBatch`), AND
2. its shape includes a **grade/class** the teacher teaches, AND
3. its shape includes a **subject** the teacher teaches in that class.

The teacher is shown **only** the matching grade+subject slices, grouped by the package's source (curriculum or course).

```text
SuperAdmin package ─assign→ Institute ─bind→ Batch ─teacher assigned→ Teacher
                                                   └ filter to teacher's class + subject
Teacher "Lesson Plans":
  [CBSE]  [JEE Foundation (course)]      ← source switcher (only if >1)
     └ Class 10 ▸ Physics ▸ Chapters ▸ Lessons / Tests
```

## Demo scenario to seed
Reshape the demo teacher so the combinatorics are visible:
- Teacher teaches across **two sources**: **CBSE** (curriculum package) + **one course** package.
- **~3 classes**, mixed subjects — e.g. Class 10 → Physics; Class 11 → Physics + Chemistry; Course class → one subject.
- Bind those packages to the teacher's batches so the three-way match resolves.

## Phases

### Phase 1 — Data layer (teacher scope)
- Add a teacher resolver `getLessonSourcesForTeacher(teacherId)` that returns the matching packages grouped by source (curriculum/course) with the allowed class+subject slices, using existing `getPackagesForBatch`, package `shape`, and the teacher profile.
- Add teacher-scoped mirror stores keyed by `teacherId` (same pattern as the institute ones):
  - `teacherPackageOrders` (chapter/lesson reorder),
  - `teacherPackageOwnContent` (own lessons + attached tests),
  - `teacherPackageLessonAdditions` (composer-created lessons).
- Extend demo mock data: teacher profile (curricula/classes/subjects), batches, and `institutePackageBatches` bindings to realize the CBSE + course scenario.

### Phase 2 — Lesson Plans information architecture (no "package" wording)
- Repoint `/teacher/lesson-plans` to a new **Lesson Library** view (curriculum/course → class → subject → chapter rail → lesson detail). The existing "my plans" list is preserved as a secondary tab so nothing is lost.
- Source switcher shown **only when the teacher has more than one** curriculum/course; class & subject selectors below it (matches the existing curriculum-selection UX).
- Reuse the existing teacher design system (teal/cyan, lighter), 44px+ touch targets, 320px-safe. Mobile: chapter index in a bottom/left sheet, large tap rows.

### Phase 3 — Chapter detail (view + edit + add-own, like institute)
- Reuse/adapt the institute `ChapterDetailPane` flow in teacher styling: per chapter show shared lessons + tests, plus the teacher's **own** lessons/tests with add & delete.
- "Add lesson" opens the existing **lesson composer/canvas** (untouched) scoped to the chapter; "Attach test" reuses the existing exam-picker.
- Per-teacher chapter/lesson reordering via the new `teacherPackageOrders` store, with "reset to default".

### Phase 4 — Present (smartboard viewer)
- Add a **Present** action on each lesson and within the lesson detail.
- Build a full-screen, classroom-optimized viewer: large type, one block at a time, swipe / arrow-key / on-screen next-prev, progress indicator, exit button. Renders the same `LessonPlanBlock[]`, so editing and presenting share one data source.
- Editing stays in the existing workspace; presenting is a separate read-only mode — no duplicated content model.

### Phase 5 — Wiring & QA
- Keep sidebar/bottom-nav labels as **"Lesson Plans" / "Plans"** (no new nav item, no "package" term).
- Verify: source/class/subject filtering shows only matching slices; add/delete own content persists; reorder persists & resets; Present works on mobile, tablet, smartboard widths; existing canvas editor and old plans list still work; build passes with zero TS errors.

## Technical notes
- New pages under `src/pages/teacher/` (e.g. `LessonLibrary`, `LessonChapter`, `LessonPresent`); new teacher stores under `src/data/teacher/`; adapt shared components from `src/components/packages/editor/*` with a teacher `mode`/styling rather than forking logic.
- Routes added under the existing `/teacher/lesson-plans/*` tree in `TeacherRoutes.tsx`; lesson editor routes reused as-is.
- `CURRENT_TEACHER_ID = "teacher-1"` placeholder until auth, matching the institute's `CURRENT_INSTITUTE_ID` convention.
- Deferred (next iteration): timetable-driven auto-open of the current period's chapter.
