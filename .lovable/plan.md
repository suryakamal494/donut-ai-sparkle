## Goal
Strip the repo down to the RiTX module + shared UI primitives so external readers see only RiTX code. Nothing RiTX-facing may break.

## What RiTX depends on (keep these)
Confirmed by scanning imports under `src/pages/ritx`, `src/components/ritx`, `src/data/ritx`, `src/routes/RitxRoutes.tsx`:

- `src/pages/ritx/**`, `src/components/ritx/**`, `src/data/ritx/**`
- `src/components/shared/DonutLogo.tsx`
- `src/components/ui/**` (shadcn primitives; some internally use `use-toast`, `use-mobile`)
- `src/hooks/use-media-query.ts`, `src/hooks/use-mobile.tsx`, `src/hooks/use-toast.ts`
- `src/lib/**`, `src/integrations/**`, `src/assets/**` (as-is)
- `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/App.css`, `src/vite-env.d.ts`
- `src/components/ScrollToTop.tsx`, `src/components/NavLink.tsx` (small shared helpers)
- `src/pages/NotFound.tsx`
- `src/routes/RitxRoutes.tsx`

## Delete list

**Pages** (`src/pages/`)
- Files: `Dashboard.tsx`, `Index.tsx`, `Landing.tsx`, `Login.tsx`
- Folders: `content/`, `docs/`, `exams/`, `institute/`, `institutes/`, `packages/`, `parameters/`, `questions/`, `roles/`, `student/`, `teacher/`, `users/`

**Components** (`src/components/`)
- Folders: `academic-schedule/`, `content/`, `docs/`, `exams/`, `institute/`, `institutes/`, `layout/`, `packages/`, `parameters/`, `questions/`, `roles/`, `student/`, `subject/`, `teacher/`, `timetable/`, `users/`

**Data** (`src/data/`)
- Keep only `src/data/ritx/`
- Delete everything else: `academic-schedule/`, `academicPlannerData.ts`, `academicScheduleData.ts`, `aiQuestionMock.ts`, `blockDialogContent.ts`, `cbseMasterData.ts`, `contentLibraryData.ts`, `contentLibraryHelpers.ts`, `docsNavigation.ts`, `examBlockData.ts`, `examPatternsData.ts`, `examQuestionBankData.ts`, `examQuestionsData.ts`, `examsData.ts`, `institute/`, `instituteData.ts`, `instituteRolesData.ts`, `master/`, `masterData.ts`, `mockData.ts`, `packages/`, `questionsData.ts`, `rolesData.ts`, `student/`, `teacher/`, `teacherData.ts`, `timetable/`, `timetableData.ts`

**Hooks** (`src/hooks/`)
- Keep: `use-media-query.ts`, `use-mobile.tsx`, `use-toast.ts`
- Delete: `use-swipe-tabs.ts`, `useAcademicPlanGenerator.ts`, `useChapterDrift.ts`, `useCourseBuilder.ts`, `useCourses.ts`, `useCurriculumSelection.ts`, `useExamCreation.ts`, `useExamCreationNew.ts`, `useExamReview.ts`, `useFilters.ts`, `useInstituteDriftSummary.ts`, `useNotificationPreferences.ts`, `usePatternBuilder.ts`, `usePushNotifications.ts`, `useSubstitution.ts`, `useTeacherExamCreation.ts`, `useTeacherNotifications.ts`, `useTeacherSyllabusProgress.ts`, `useTestSessionPersistence.ts`, `useTimetableHistory.ts`, `useTimetableSetup.ts`, `useTimetableUpload.ts`, `useTimetableWorkspace.ts`, `useWeekNavigation.ts`, `useWhatsAppWallet.ts`

**Stores & Types** — delete entirely
- `src/stores/` (only `teacherExamsStore.ts`)
- `src/types/` (all legacy: academicPlanner, academicSchedule, examBlock, masterData, packages, teacherNotifications, whatsappComms)

**Routes** (`src/routes/`)
- Keep: `RitxRoutes.tsx`
- Delete: `DocsRoutes.tsx`, `InstituteRoutes.tsx`, `StudentRoutes.tsx`, `SuperAdminRoutes.tsx`, `TeacherRoutes.tsx`, `index.ts` (barrel exports only legacy routes)

## Edits after deletion
- No edits to `App.tsx` needed — it already imports only `RitxRoutes`, `NotFound`, `ScrollToTop`, and UI providers.
- Re-verify no residual imports point at deleted paths by running `rg` against `src/` for any `@/pages/(content|docs|exams|institute|institutes|packages|parameters|questions|roles|student|teacher|users)`, `@/components/(academic-schedule|content|docs|exams|institute|...|users)`, `@/data/(academic-schedule|institute|master|packages|student|teacher|timetable)`, `@/stores`, `@/types`, `@/routes/(SuperAdmin|Institute|Teacher|Student|Docs)Routes`, and any deleted hook name. Fix any that surface (expected: none, since RiTX was already isolated).

## Verification
- `tsgo` typecheck passes.
- Dev server compiles; `/` renders RiTX Login; `/team/register`, `/admin`, `/staff`, `/team` still work.

## Out of scope
- No functional changes to RiTX.
- No design/token changes.
- No backend work.
