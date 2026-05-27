import type { Package, PackageLessonPlan, PackageAttachment } from "@/types/packages";

// ============================================
// MOCK SEED DATA
// Two starter packages so the list view has
// something to render in Phase 2. Real data
// will be authored via the wizard.
// ============================================

export const mockPackages: Package[] = [
  {
    id: "cbse-class-7-science-foundation",
    name: "CBSE Class 7 Science Foundation",
    description: "Term-1 science foundation pack covering Heat, Acids & Bases, and Fibre to Fabric.",
    sourceType: "curriculum",
    sourceId: "cbse",
    shape: [
      { gradeId: "class-7", subjectIds: ["3"] }, // Mathematics
    ],
    inclusions: {
      chapterTests: true,
      grandTests: false,
      previousYearPapers: false,
    },
    status: "published",
    createdAt: "2026-04-12T09:00:00.000Z",
    updatedAt: "2026-05-18T14:20:00.000Z",
  },
  {
    id: "cbse-middle-school-combo",
    name: "CBSE Middle School Combo",
    description: "Multi-grade pack for Classes 7–9 covering core subjects with chapter and grand tests.",
    sourceType: "curriculum",
    sourceId: "cbse",
    shape: [
      { gradeId: "class-7", subjectIds: ["1", "3"] }, // Physics, Math
      { gradeId: "class-8", subjectIds: ["1", "3"] },
      { gradeId: "class-9", subjectIds: ["1", "2", "4"] }, // Physics, Chem, Bio
    ],
    inclusions: {
      chapterTests: true,
      grandTests: true,
      previousYearPapers: false,
    },
    status: "draft",
    createdAt: "2026-05-02T11:15:00.000Z",
    updatedAt: "2026-05-22T08:45:00.000Z",
  },
  {
    id: "jee-mains-physics-accelerator",
    name: "JEE Mains Physics Accelerator",
    description: "Course-scoped pack for JEE Mains physics with PYPs and grand tests.",
    sourceType: "course",
    sourceId: "jee-mains",
    shape: [
      { gradeId: "class-11", subjectIds: ["1"] }, // Physics
      { gradeId: "class-12", subjectIds: ["1"] },
    ],
    inclusions: {
      chapterTests: true,
      grandTests: true,
      previousYearPapers: true,
    },
    status: "published",
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-05-24T16:30:00.000Z",
  },
];

export const mockPackageLessonPlans: PackageLessonPlan[] = [];
export const mockPackageAttachments: PackageAttachment[] = [];