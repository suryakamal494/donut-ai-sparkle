// ============================================
// TEACHER → LESSON PLANS (package-sourced)
// ============================================
// Teachers never see the word "package". They see
// "Lesson Plans" that flow down from SuperAdmin →
// Institute → batch. A teacher only sees the slice
// that matches their batch + class + subject.
//
// Visibility rule (mirrors the backend):
//   A lesson source is visible to a teacher when
//   the package is bound to a batch the teacher is
//   assigned to AND its shape covers a grade the
//   teacher teaches AND a subject they teach there.
//
// This module also seeds a demo scenario so the
// teacher portal shows real content out of the box.
// In-memory only (mock layer).

import type { Package } from "@/types/packages";
import type { LessonPlanBlock } from "@/components/teacher/lesson-workspace/types";
import {
  getPackageById,
  getLessonPlanById,
} from "@/data/packages";
import {
  setBatchesForPackage,
  getPackagesForBatch,
} from "@/data/institute/institutePackageBatches";
import {
  getOwnLessonById,
} from "@/data/institute/institutePackageOwnContent";
import { getLessonAdditions } from "@/data/institute/institutePackageLessonAdditions";
import { getOrder, applyOrder } from "@/data/institute/institutePackageOrders";
import { INSTITUTE_LP_PREFIX } from "@/data/institute/institutePackageOwnContent";
import { curriculums, courses, getClassName } from "@/data/masterData";

// TODO: replace with real auth context once available.
export const CURRENT_TEACHER_ID = "teacher-1";
export const CURRENT_TEACHER_NAME = "Dr. Rajesh Kumar";
/** The institute the teacher belongs to (matches the package seed). */
export const TEACHER_INSTITUTE_ID = "inst-1";

// ------------------------------------------------------------------
// Demo scenario: what this teacher teaches, where.
// Two sources (CBSE curriculum + JEE Mains course), three classes,
// mixed subjects (Class 11 → Physics + Chemistry, Class 12 → Physics).
// Subject ids are the platform numeric ids: "1"=Physics, "2"=Chemistry.
// ------------------------------------------------------------------
interface TeacherBatchAssignment {
  batchId: string;
  gradeId: string; // kebab class id, e.g. "class-11"
  /** Subject ids this teacher teaches in this batch. */
  subjectIds: string[];
}

const teacherBatchAssignments: TeacherBatchAssignment[] = [
  // CBSE — Class 11: Physics + Chemistry
  { batchId: "tb-cbse-11", gradeId: "class-11", subjectIds: ["1", "2"] },
  // CBSE — Class 12: Physics only
  { batchId: "tb-cbse-12", gradeId: "class-12", subjectIds: ["1"] },
  // JEE Mains (course) — Class 11: Physics only
  { batchId: "tb-jee-11", gradeId: "class-11", subjectIds: ["1"] },
];

// Seed the institute → package → batch bindings so these batches
// actually consume the demo packages. Idempotent (runs once on import).
let seeded = false;
const seedTeacherBindings = () => {
  if (seeded) return;
  seeded = true;
  // CBSE Comprehensive Foundation Pack → CBSE batches
  setBatchesForPackage(TEACHER_INSTITUTE_ID, "cbse-comprehensive-foundation", [
    "tb-cbse-11",
    "tb-cbse-12",
  ]);
  // JEE Mains Accelerator → JEE batch
  setBatchesForPackage(TEACHER_INSTITUTE_ID, "jee-mains-accelerator", [
    "tb-jee-11",
  ]);
};
seedTeacherBindings();

// ------------------------------------------------------------------
// Resolver
// ------------------------------------------------------------------
export interface TeacherLessonClass {
  gradeId: string;
  className: string;
  subjectIds: string[];
}

export interface TeacherLessonSource {
  packageId: string;
  pkg: Package;
  sourceType: Package["sourceType"];
  sourceId: string;
  /** e.g. "CBSE" or "IIT-JEE Mains" — what the teacher sees. */
  sourceName: string;
  classes: TeacherLessonClass[];
}

const sourceNameFor = (pkg: Package): string =>
  pkg.sourceType === "curriculum"
    ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
    : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;

/**
 * All lesson sources visible to the teacher, grouped by package/source,
 * each narrowed to the grade+subject slices the teacher actually teaches.
 */
export const getLessonSourcesForTeacher = (
  teacherId: string = CURRENT_TEACHER_ID,
): TeacherLessonSource[] => {
  void teacherId; // single-teacher mock for now
  // packageId -> (gradeId -> Set<subjectId>)
  const acc = new Map<string, Map<string, Set<string>>>();

  for (const a of teacherBatchAssignments) {
    const pkgs = getPackagesForBatch(TEACHER_INSTITUTE_ID, a.batchId);
    for (const pkg of pkgs) {
      const row = pkg.shape.find((s) => s.gradeId === a.gradeId);
      if (!row) continue;
      const allowed = a.subjectIds.filter((sid) => row.subjectIds.includes(sid));
      if (allowed.length === 0) continue;

      let byGrade = acc.get(pkg.id);
      if (!byGrade) {
        byGrade = new Map();
        acc.set(pkg.id, byGrade);
      }
      let set = byGrade.get(a.gradeId);
      if (!set) {
        set = new Set();
        byGrade.set(a.gradeId, set);
      }
      allowed.forEach((s) => set!.add(s));
    }
  }

  const out: TeacherLessonSource[] = [];
  for (const [packageId, byGrade] of acc.entries()) {
    const pkg = getPackageById(packageId);
    if (!pkg) continue;
    const classes: TeacherLessonClass[] = Array.from(byGrade.entries())
      .map(([gradeId, set]) => ({
        gradeId,
        className: getClassName(gradeId),
        subjectIds: Array.from(set).sort((x, y) => Number(x) - Number(y)),
      }))
      .sort((x, y) => x.gradeId.localeCompare(y.gradeId));
    out.push({
      packageId,
      pkg,
      sourceType: pkg.sourceType,
      sourceId: pkg.sourceId,
      sourceName: sourceNameFor(pkg),
      classes,
    });
  }
  // Curriculum sources first, then courses; stable by name.
  return out.sort((a, b) => {
    if (a.sourceType !== b.sourceType) return a.sourceType === "curriculum" ? -1 : 1;
    return a.sourceName.localeCompare(b.sourceName);
  });
};

/**
 * Resolve a lesson's title + final block list for presenting.
 * Shared (SuperAdmin) lessons merge the teacher's own added blocks and any
 * local reorder; the teacher's own lessons return their blocks directly.
 */
export const resolveLessonForTeacher = (
  packageId: string,
  lessonId: string,
  teacherId: string = CURRENT_TEACHER_ID,
): { title: string; blocks: LessonPlanBlock[] } | null => {
  if (lessonId.startsWith(INSTITUTE_LP_PREFIX)) {
    const own = getOwnLessonById(teacherId, packageId, lessonId);
    if (!own) return null;
    return { title: own.title, blocks: own.blocks };
  }
  const master = getLessonPlanById(lessonId);
  if (!master) return null;
  const additions = getLessonAdditions(teacherId, packageId, lessonId);
  const order = getOrder(teacherId, packageId, { kind: "block", lessonId });
  const blocks = applyOrder([...master.blocks, ...additions], order);
  return { title: master.title, blocks };
};