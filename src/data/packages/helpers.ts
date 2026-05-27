import type {
  Package,
  PackageLessonPlan,
  PackageAttachment,
  PackageSourceType,
} from "@/types/packages";
import {
  mockPackages,
  mockPackageLessonPlans,
  mockPackageAttachments,
} from "./mockPackages";

// In-memory stores. Replaced with persisted storage in a later phase.
let packages: Package[] = [...mockPackages];
let lessonPlans: PackageLessonPlan[] = [...mockPackageLessonPlans];
let attachments: PackageAttachment[] = [...mockPackageAttachments];

export const getAllPackages = (): Package[] => packages;

export const getPackageById = (id: string): Package | undefined =>
  packages.find((p) => p.id === id);

export const getPackagesBySource = (
  sourceType: PackageSourceType,
  sourceId: string,
): Package[] =>
  packages.filter((p) => p.sourceType === sourceType && p.sourceId === sourceId);

export const upsertPackage = (pkg: Package): void => {
  const idx = packages.findIndex((p) => p.id === pkg.id);
  if (idx === -1) packages = [pkg, ...packages];
  else packages = packages.map((p) => (p.id === pkg.id ? pkg : p));
};

export const archivePackage = (id: string): void => {
  packages = packages.map((p) =>
    p.id === id ? { ...p, status: "archived", updatedAt: new Date().toISOString() } : p,
  );
};

export const getLessonPlansForPackage = (packageId: string): PackageLessonPlan[] =>
  lessonPlans.filter((lp) => lp.packageId === packageId);

export const getLessonPlansForChapter = (
  packageId: string,
  chapterId: string,
): PackageLessonPlan[] =>
  lessonPlans
    .filter((lp) => lp.packageId === packageId && lp.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);

export const getAttachmentsForPackage = (packageId: string): PackageAttachment[] =>
  attachments.filter((a) => a.packageId === packageId);

export const getAttachmentsForChapter = (
  packageId: string,
  chapterId: string,
): PackageAttachment[] =>
  attachments
    .filter((a) => a.packageId === packageId && a.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);

/** Grand tests live at the package level (no chapterId). */
export const getGrandTestsForPackage = (packageId: string): PackageAttachment[] =>
  attachments
    .filter((a) => a.packageId === packageId && a.kind === "grand-test" && !a.chapterId)
    .sort((a, b) => a.order - b.order);

export const attachExamsToPackage = (
  packageId: string,
  examIds: string[],
  scope: {
    kind: PackageAttachment["kind"];
    gradeId: string;
    subjectId: string;
    chapterId?: string;
  },
): void => {
  const existing = attachments.filter(
    (a) =>
      a.packageId === packageId &&
      a.gradeId === scope.gradeId &&
      a.subjectId === scope.subjectId &&
      (a.chapterId ?? null) === (scope.chapterId ?? null) &&
      a.kind === scope.kind,
  );
  const startOrder = existing.length;
  const fresh: PackageAttachment[] = examIds
    .filter((eid) => !existing.some((a) => a.examId === eid))
    .map((examId, i) => ({
      id: `${packageId}-${scope.kind}-${examId}-${Date.now()}-${i}`,
      packageId,
      gradeId: scope.gradeId,
      subjectId: scope.subjectId,
      chapterId: scope.chapterId,
      kind: scope.kind,
      examId,
      order: startOrder + i,
    }));
  attachments = [...attachments, ...fresh];
};

export const removeAttachment = (attachmentId: string): void => {
  attachments = attachments.filter((a) => a.id !== attachmentId);
};

/** Shape summary like "2 grades · 5 subjects". */
export const summarizeShape = (pkg: Package): string => {
  const gradeCount = pkg.shape.length;
  const subjectCount = pkg.shape.reduce(
    (sum, row) => sum + row.subjectIds.length,
    0,
  );
  return `${gradeCount} grade${gradeCount === 1 ? "" : "s"} · ${subjectCount} subject${subjectCount === 1 ? "" : "s"}`;
};

/** Counts of lessons + attachments for the list-view card. */
export const summarizeCounts = (
  pkg: Package,
): { lessons: number; tests: number } => ({
  lessons: getLessonPlansForPackage(pkg.id).length,
  tests: getAttachmentsForPackage(pkg.id).length,
});