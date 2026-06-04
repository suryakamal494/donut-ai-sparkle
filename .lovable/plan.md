## Goal

The "My Plans" tab is now a roll-up of lessons the teacher personally created in chapters. Since no teacher-authored lessons are seeded, the tab shows only the empty state — so it's impossible to see how it works. We'll seed a handful of mock teacher-authored lessons across the teacher's existing CBSE and IIT-JEE sources, so "My Plans" displays a populated, realistic list out of the box (matching how CBSE and IIT-JEE already show seeded content).

## What the user sees

When they open the **My Plans** tab, instead of the empty state they see ~6 lesson-plan cards spread across both sources and multiple classes/subjects/chapters, e.g.:

```text
┌────────────────────────────┐  ┌────────────────────────────┐
│ Newton's Laws — Recap      │  │ Mole Concept Walkthrough   │
│ CBSE                       │  │ CBSE                       │
│ Class 11 · Physics         │  │ Class 11 · Chemistry       │
│ Ch: Laws of Motion         │  │ Ch: Some Basic Concepts    │
│ [ Open ]      [ Present ]   │  │ [ Open ]      [ Present ]   │
└────────────────────────────┘  └────────────────────────────┘
┌────────────────────────────┐  ┌────────────────────────────┐
│ Kinematics Problem Set     │  │ JEE Physics — Quick Drills │
│ CBSE · Class 12 · Physics  │  │ IIT-JEE Mains · Cls 11 ·Phy│
└────────────────────────────┘  └────────────────────────────┘
```

Search, Source ▾, and Class ▾ filters all work against this seeded data. Each card's **Open** / **Present** navigates into the real chapter library view, because the seeded lessons are stored exactly like teacher-created ones.

## Implementation

All changes are confined to the mock data layer — no UI/component changes needed (the roll-up already renders whatever `getOwnLessons` returns).

### `src/data/teacher/lessonPackages.ts` — add a seeding step

Add a `seedTeacherOwnLessons()` function, called once on import right after `seedTeacherBindings()` (guarded by a module-level `seeded` flag so it never double-runs).

It will:
- Iterate `getLessonSourcesForTeacher()` → each source's classes → each subject.
- For each (source, grade, subject), resolve chapters via `getChaptersForScope(pkg.sourceType, pkg.sourceId, gradeId, subjectId)`.
- For the **first one or two chapters** of selected slices, build a `PackageLessonPlan` (id prefixed with `INSTITUTE_LP_PREFIX` + `packageId`, kebab-safe) and call `upsertOwnLesson(CURRENT_TEACHER_ID, packageId, lesson)`.
- Keep it modest: ~5–6 lessons total spanning both sources, both classes, and Physics + Chemistry, with realistic titles per subject (e.g. Physics → "Newton's Laws — Recap", "Kinematics Problem Set"; Chemistry → "Mole Concept Walkthrough").
- Each seeded lesson gets a small, realistic `blocks` array (2–3 `LessonPlanBlock`s: an `explain` block + a `quiz`/`homework` block, `source: "custom"`), plus `topics`, `order` from `nextOwnLessonOrder`, and `createdAt`/`updatedAt` timestamps.

Because the seed writes through the same `upsertOwnLesson` store the in-chapter creation flow uses, the lessons appear both in **My Plans** and inside each chapter's library view, and Open/Present resolve correctly via the existing `resolveLessonForTeacher` path.

## Technical notes

- Reuses existing imports already present in the file (`getChaptersForScope`, `getOwnLessons`, `INSTITUTE_LP_PREFIX`); adds imports for `upsertOwnLesson` and `nextOwnLessonOrder` from `institutePackageOwnContent`.
- Idempotent: seeding guarded by a flag and only writes when a chapter has no existing own lessons, so it won't duplicate on hot reloads.
- All ids stay kebab-case per project convention.
- In-memory mock only — no backend/persistence, no new dependencies.

## Out of scope

- Lesson composer / presentation internals.
- The roll-up component UI (unchanged).
- Institute / SuperAdmin seeding.
