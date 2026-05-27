// ============================================
// LESSON PACKAGES — TYPE DEFINITIONS
// SuperAdmin-authored bundles of lesson plans
// + test attachments, scoped to a curriculum or
// course and a chosen set of grades/subjects.
// ============================================

import type { LessonPlanBlock } from "@/components/teacher/lesson-workspace/types";

export type PackageStatus = "draft" | "published" | "archived";
export type PackageSourceType = "curriculum" | "course";

/** One row of the package "shape": a grade plus the subjects covered in it. */
export interface PackageShapeEntry {
  gradeId: string;
  subjectIds: string[];
}

/** Which assessment slots the editor exposes for this package. */
export interface PackageInclusions {
  chapterTests: boolean;
  grandTests: boolean;
  previousYearPapers: boolean;
}

export interface Package {
  id: string;                  // kebab-case
  name: string;
  description?: string;
  sourceType: PackageSourceType;
  sourceId: string;            // curriculumId OR courseId
  shape: PackageShapeEntry[];
  inclusions: PackageInclusions;
  status: PackageStatus;
  createdAt: string;
  updatedAt: string;
}

/** A lesson plan authored inside a package, scoped to one chapter. */
export interface PackageLessonPlan {
  id: string;
  packageId: string;
  gradeId: string;
  subjectId: string;
  chapterId: string;
  order: number;
  title: string;
  topics: string[];
  blocks: LessonPlanBlock[];
  createdAt: string;
  updatedAt: string;
}

export type PackageAttachmentKind = "chapter-test" | "grand-test" | "pyp";

/** A test/PYP attached to a package — references an existing exam. */
export interface PackageAttachment {
  id: string;
  packageId: string;
  gradeId: string;
  subjectId: string;
  chapterId?: string; // omitted for package-wide grand tests
  kind: PackageAttachmentKind;
  examId: string;
  order: number;
}