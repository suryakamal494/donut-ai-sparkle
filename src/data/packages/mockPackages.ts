import type { Package, PackageLessonPlan, PackageAttachment } from "@/types/packages";
import { seedAll } from "./mockSeedGenerator";

// ============================================
// MOCK SEED DATA
// Two starter packages so the list view has
// something to render in Phase 2. Real data
// will be authored via the wizard.
// ============================================

export const mockPackages: Package[] = [
  {
    id: "cbse-comprehensive-foundation",
    name: "CBSE Comprehensive Foundation Pack",
    description:
      "End-to-end CBSE pack: Mathematics for Class 6–7 and Physics + Chemistry for Class 11–12.",
    sourceType: "curriculum",
    sourceId: "cbse",
    shape: [
      { gradeId: "class-6", subjectIds: ["3"] }, // Math
      { gradeId: "class-7", subjectIds: ["3"] }, // Math
      { gradeId: "class-11", subjectIds: ["1", "2"] }, // Physics, Chemistry
      { gradeId: "class-12", subjectIds: ["1", "2"] },
    ],
    inclusions: {
      chapterTests: true,
      grandTests: true,
      previousYearPapers: false,
    },
    status: "published",
    createdAt: "2026-04-12T09:00:00.000Z",
    updatedAt: "2026-05-18T14:20:00.000Z",
  },
  {
    id: "jee-mains-accelerator",
    name: "JEE Mains Accelerator",
    description:
      "Course-scoped pack for JEE Mains — Physics + Chemistry across Class 11 & 12 with PYPs and full mocks.",
    sourceType: "course",
    sourceId: "jee-mains",
    shape: [
      { gradeId: "class-11", subjectIds: ["1", "2"] },
      { gradeId: "class-12", subjectIds: ["1", "2"] },
    ],
    inclusions: {
      chapterTests: true,
      grandTests: true,
      previousYearPapers: true,
    },
    status: "draft",
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-05-24T16:30:00.000Z",
  },
];

// Generate rich, deterministic seed content for both packages so the editor
// has real volume to work against.
const seeded = seedAll([
  {
    pkg: mockPackages[0],
    chaptersPerCell: 5,
    lessonsPerChapter: 5, // 6 cells × 5 × 5 = 150 lesson plans
    blocksPerLesson: 8,
    attachChapterTest: true,
    attachPyp: false,
    grandTestCount: 3,
  },
  {
    pkg: mockPackages[1],
    chaptersPerCell: 5,
    lessonsPerChapter: 5, // 4 cells × 5 × 5 = 100 lesson plans
    blocksPerLesson: 10,
    attachChapterTest: true,
    attachPyp: true,
    grandTestCount: 5,
  },
]);

export const mockPackageLessonPlans: PackageLessonPlan[] = seeded.lessonPlans;
export const mockPackageAttachments: PackageAttachment[] = seeded.attachments;