// ============================================
// INSTITUTE LOCAL LESSON ADDITIONS
// ============================================
// SuperAdmin-authored lesson plans are shared,
// read-only master content. An institute can
// layer its OWN extra blocks (content / quiz)
// on top without ever mutating the SA master.
// Keyed by institute + package + lesson, so the
// same lesson can be tailored differently per
// institute. In-memory only (mock layer).

import type { LessonPlanBlock } from "@/components/teacher/lesson-workspace/types";

const additions = new Map<string, LessonPlanBlock[]>();

const keyFor = (instituteId: string, packageId: string, lessonId: string): string =>
  `${instituteId}::${packageId}::${lessonId}`;

/** Institute's own extra blocks for a shared lesson (empty when none). */
export const getLessonAdditions = (
  instituteId: string,
  packageId: string,
  lessonId: string,
): LessonPlanBlock[] => {
  const v = additions.get(keyFor(instituteId, packageId, lessonId));
  return v ? [...v] : [];
};

export const addLessonBlocks = (
  instituteId: string,
  packageId: string,
  lessonId: string,
  blocks: LessonPlanBlock[],
): void => {
  const key = keyFor(instituteId, packageId, lessonId);
  const existing = additions.get(key) ?? [];
  additions.set(key, [...existing, ...blocks]);
};

export const removeLessonBlock = (
  instituteId: string,
  packageId: string,
  lessonId: string,
  blockId: string,
): void => {
  const key = keyFor(instituteId, packageId, lessonId);
  const existing = additions.get(key);
  if (!existing) return;
  additions.set(
    key,
    existing.filter((b) => b.id !== blockId),
  );
};

export const clearLessonAdditions = (
  instituteId: string,
  packageId: string,
  lessonId: string,
): void => {
  additions.delete(keyFor(instituteId, packageId, lessonId));
};

/** True when the institute has layered any of its own blocks onto this lesson. */
export const hasLessonAdditions = (
  instituteId: string,
  packageId: string,
  lessonId: string,
): boolean => (additions.get(keyFor(instituteId, packageId, lessonId))?.length ?? 0) > 0;