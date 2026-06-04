// ============================================
// INSTITUTE PRIVATE PACKAGE CONTENT
// ============================================
// SuperAdmin authors the master package (lesson
// plans + test attachments) — those stay
// read-only for institutes. On TOP of that, an
// institute can add its OWN lesson plans and
// attach its OWN tests to any chapter. This
// content is PRIVATE to the institute: it never
// appears in SA's master package or for any
// other institute. Keyed by institute + package
// + chapter. In-memory only (mock layer).

import type { PackageLessonPlan } from "@/types/packages";

/** Institute-owned lesson plans carry this id prefix everywhere. */
export const INSTITUTE_LP_PREFIX = "inst-lp-";
/** Institute-owned test attachments carry this id prefix. */
export const INSTITUTE_TEST_PREFIX = "inst-test-";

/** A test the institute attached to one of its package chapters. */
export interface InstituteOwnTest {
  id: string;
  packageId: string;
  gradeId: string;
  subjectId: string;
  chapterId: string;
  examId: string;
  order: number;
}

// instituteId :: packageId  ->  records
const ownLessons = new Map<string, PackageLessonPlan[]>();
const ownTests = new Map<string, InstituteOwnTest[]>();

const keyFor = (instituteId: string, packageId: string): string =>
  `${instituteId}::${packageId}`;

// ----- Lesson plans -----

/** Institute's own lesson plans for a chapter, sorted by order. */
export const getOwnLessons = (
  instituteId: string,
  packageId: string,
  chapterId: string,
): PackageLessonPlan[] =>
  (ownLessons.get(keyFor(instituteId, packageId)) ?? [])
    .filter((lp) => lp.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);

/** Look up one institute-owned lesson by id (across all chapters). */
export const getOwnLessonById = (
  instituteId: string,
  packageId: string,
  lessonId: string,
): PackageLessonPlan | undefined =>
  (ownLessons.get(keyFor(instituteId, packageId)) ?? []).find(
    (lp) => lp.id === lessonId,
  );

export const upsertOwnLesson = (
  instituteId: string,
  packageId: string,
  lesson: PackageLessonPlan,
): void => {
  const key = keyFor(instituteId, packageId);
  const existing = ownLessons.get(key) ?? [];
  const idx = existing.findIndex((lp) => lp.id === lesson.id);
  if (idx === -1) ownLessons.set(key, [...existing, lesson]);
  else
    ownLessons.set(
      key,
      existing.map((lp) => (lp.id === lesson.id ? lesson : lp)),
    );
};

export const removeOwnLesson = (
  instituteId: string,
  packageId: string,
  lessonId: string,
): void => {
  const key = keyFor(instituteId, packageId);
  const existing = ownLessons.get(key);
  if (!existing) return;
  ownLessons.set(
    key,
    existing.filter((lp) => lp.id !== lessonId),
  );
};

/** Next order index for a new lesson in a chapter. */
export const nextOwnLessonOrder = (
  instituteId: string,
  packageId: string,
  chapterId: string,
): number => getOwnLessons(instituteId, packageId, chapterId).length;

// ----- Test attachments -----

/** Institute's own tests attached to a chapter, sorted by order. */
export const getOwnTests = (
  instituteId: string,
  packageId: string,
  chapterId: string,
): InstituteOwnTest[] =>
  (ownTests.get(keyFor(instituteId, packageId)) ?? [])
    .filter((t) => t.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);

export const addOwnTests = (
  instituteId: string,
  packageId: string,
  scope: { gradeId: string; subjectId: string; chapterId: string },
  examIds: string[],
): void => {
  const key = keyFor(instituteId, packageId);
  const existing = ownTests.get(key) ?? [];
  const inChapter = existing.filter((t) => t.chapterId === scope.chapterId);
  const startOrder = inChapter.length;
  const fresh: InstituteOwnTest[] = examIds
    .filter((eid) => !inChapter.some((t) => t.examId === eid))
    .map((examId, i) => ({
      id: `${INSTITUTE_TEST_PREFIX}${packageId}-${examId}-${Date.now()}-${i}`,
      packageId,
      gradeId: scope.gradeId,
      subjectId: scope.subjectId,
      chapterId: scope.chapterId,
      examId,
      order: startOrder + i,
    }));
  ownTests.set(key, [...existing, ...fresh]);
};

export const removeOwnTest = (
  instituteId: string,
  packageId: string,
  testId: string,
): void => {
  const key = keyFor(instituteId, packageId);
  const existing = ownTests.get(key);
  if (!existing) return;
  ownTests.set(
    key,
    existing.filter((t) => t.id !== testId),
  );
};

/** True when a lesson id belongs to the institute (vs SuperAdmin master). */
export const isInstituteOwnedLesson = (lessonId: string): boolean =>
  lessonId.startsWith(INSTITUTE_LP_PREFIX);