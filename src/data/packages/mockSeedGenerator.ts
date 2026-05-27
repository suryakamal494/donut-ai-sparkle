import type {
  Package,
  PackageLessonPlan,
  PackageAttachment,
  PackageAttachmentKind,
} from "@/types/packages";
import type { LessonPlanBlock, BlockType } from "@/components/teacher/lesson-workspace/types";
import { allCBSEChapters } from "@/data/cbseMasterData";
import { courseOwnedChapters } from "@/data/masterData";
import { teacherExams } from "@/data/teacher/exams";

// ============================================================
// Deterministic mock seed generator for SuperAdmin Packages.
// Goal: stress-test the editor UI with realistic volume.
// No randomness — index-driven cycling keeps re-renders stable.
// ============================================================

const GRADE_TO_NUMERIC: Record<string, string> = {
  "class-6": "1",
  "class-7": "2",
  "class-8": "3",
  "class-9": "4",
  "class-10": "5",
  "class-11": "6",
  "class-12": "7",
};

// Reusable dummy content pool — the same URLs intentionally appear many times.
const VIDEOS = [
  "https://www.youtube.com/watch?v=ZM8ECpBuQYE",
  "https://www.youtube.com/watch?v=Y6Sj3myr3WI",
  "https://www.youtube.com/watch?v=kw-bXBjz9Mg",
];
const SLIDES =
  "https://docs.google.com/presentation/d/1FwAk6JsKjsRPTRwQAfxX0Z5JEcjg_8H9-7sOXh3wMmM/edit";
const PDF = "https://www.africau.edu/images/default/sample.pdf";

const LESSON_TITLE_POOL = [
  "Introduction & Hook",
  "Core Concepts",
  "Worked Examples",
  "Guided Practice",
  "Recap & Assessment",
  "Advanced Drill",
];

const TOPIC_POOL = [
  "Definitions",
  "Key Formulae",
  "Solved Problems",
  "Common Pitfalls",
  "Quick Recap",
];

const BLOCK_PATTERN: BlockType[] = [
  "explain",
  "explain",
  "demonstrate",
  "demonstrate",
  "quiz",
  "quiz",
  "homework",
  "explain",
  "demonstrate",
  "quiz",
  "homework",
  "explain",
];

const buildBlocks = (count: number, lpId: string): LessonPlanBlock[] => {
  const blocks: LessonPlanBlock[] = [];
  for (let i = 0; i < count; i++) {
    const type = BLOCK_PATTERN[i % BLOCK_PATTERN.length];
    const base = {
      id: `${lpId}-blk-${i + 1}`,
      type,
      source: "library" as const,
      duration: type === "quiz" ? 5 : type === "homework" ? 15 : 10,
    };
    if (type === "explain") {
      const isSlides = i % 2 === 0;
      blocks.push({
        ...base,
        title: isSlides ? "Concept slides" : "Reference notes (PDF)",
        content: isSlides ? "Slide deck walkthrough." : "Annotated notes for self study.",
        attachmentUrl: isSlides ? SLIDES : PDF,
        linkType: isSlides ? "google-docs" : "iframe",
        embedUrl: isSlides ? SLIDES : PDF,
      });
    } else if (type === "demonstrate") {
      const url = VIDEOS[i % VIDEOS.length];
      blocks.push({
        ...base,
        title: "Worked example video",
        content: "Step-by-step demonstration on the whiteboard.",
        embedUrl: url,
        attachmentUrl: url,
        linkType: "youtube",
      });
    } else if (type === "quiz") {
      blocks.push({
        ...base,
        title: `In-class quiz ${Math.floor(i / 3) + 1}`,
        content: "5-minute pulse check covering the last segment.",
        questions: ["q-sample-1", "q-sample-2", "q-sample-3"],
      });
    } else {
      blocks.push({
        ...base,
        title: "Take-home practice set",
        content: "10 mixed problems with worked solutions in the appendix.",
        sourceType: "practice",
      });
    }
  }
  return blocks;
};

const getChaptersForSeed = (
  sourceType: "curriculum" | "course",
  sourceId: string,
  gradeId: string,
  subjectId: string,
  limit: number,
): { id: string; name: string; order: number }[] => {
  const numeric = GRADE_TO_NUMERIC[gradeId] ?? gradeId;
  if (sourceType === "curriculum") {
    return allCBSEChapters
      .filter(
        (c) =>
          c.curriculumId === sourceId &&
          c.classId === numeric &&
          c.subjectId === subjectId,
      )
      .sort((a, b) => a.order - b.order)
      .slice(0, limit)
      .map((c) => ({ id: c.id, name: c.name, order: c.order }));
  }
  const owned = courseOwnedChapters
    .filter((c) => c.courseId === sourceId && c.subjectId === subjectId)
    .map((c) => ({ id: c.id, name: c.name, order: c.order }));
  const mapped = allCBSEChapters
    .filter((c) => c.classId === numeric && c.subjectId === subjectId)
    .map((c) => ({ id: c.id, name: c.name, order: c.order + 100 }));
  return [...owned, ...mapped]
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
};

interface SeedSpec {
  pkg: Package;
  lessonsPerChapter: number;
  blocksPerLesson: number;
  chaptersPerCell: number;
  attachChapterTest: boolean;
  attachPyp: boolean;
  grandTestCount: number;
}

export interface SeedResult {
  lessonPlans: PackageLessonPlan[];
  attachments: PackageAttachment[];
}

export const seedPackage = (spec: SeedSpec): SeedResult => {
  const lessonPlans: PackageLessonPlan[] = [];
  const attachments: PackageAttachment[] = [];
  const now = new Date().toISOString();

  let examCursor = 0;
  const nextExam = () => {
    const ex = teacherExams[examCursor % teacherExams.length];
    examCursor++;
    return ex.id;
  };

  for (const row of spec.pkg.shape) {
    for (const subjectId of row.subjectIds) {
      const chapters = getChaptersForSeed(
        spec.pkg.sourceType,
        spec.pkg.sourceId,
        row.gradeId,
        subjectId,
        spec.chaptersPerCell,
      );
      chapters.forEach((ch, chIdx) => {
        // Lesson plans for this chapter
        for (let n = 0; n < spec.lessonsPerChapter; n++) {
          const lpId = `${spec.pkg.id}-lp-${row.gradeId}-${subjectId}-${ch.id}-${n + 1}`;
          const title = `${ch.name} — ${LESSON_TITLE_POOL[n % LESSON_TITLE_POOL.length]}`;
          lessonPlans.push({
            id: lpId,
            packageId: spec.pkg.id,
            gradeId: row.gradeId,
            subjectId,
            chapterId: ch.id,
            order: n,
            title,
            topics: TOPIC_POOL.slice(0, 3),
            blocks: buildBlocks(spec.blocksPerLesson, lpId),
            createdAt: now,
            updatedAt: now,
          });
        }
        // Chapter test
        if (spec.attachChapterTest) {
          attachments.push({
            id: `${spec.pkg.id}-att-test-${ch.id}`,
            packageId: spec.pkg.id,
            gradeId: row.gradeId,
            subjectId,
            chapterId: ch.id,
            kind: "chapter-test",
            examId: nextExam(),
            order: 0,
          });
        }
        // PYP
        if (spec.attachPyp) {
          attachments.push({
            id: `${spec.pkg.id}-att-pyp-${ch.id}`,
            packageId: spec.pkg.id,
            gradeId: row.gradeId,
            subjectId,
            chapterId: ch.id,
            kind: "pyp",
            examId: nextExam(),
            order: 1,
          });
        }
        void chIdx;
      });

      // Grand tests are package-level but we still tag a grade+subject for context.
      // Add a few per (grade,subject) cell up to grandTestCount budget below.
    }
  }

  // Grand tests — package-wide, attach against the first shape cell for context.
  if (spec.grandTestCount > 0 && spec.pkg.shape.length > 0) {
    const first = spec.pkg.shape[0];
    const subjectId = first.subjectIds[0];
    for (let i = 0; i < spec.grandTestCount; i++) {
      attachments.push({
        id: `${spec.pkg.id}-att-grand-${i + 1}`,
        packageId: spec.pkg.id,
        gradeId: first.gradeId,
        subjectId,
        kind: "grand-test" as PackageAttachmentKind,
        examId: nextExam(),
        order: i,
      });
    }
  }

  return { lessonPlans, attachments };
};

export const seedAll = (specs: SeedSpec[]): SeedResult => {
  const out: SeedResult = { lessonPlans: [], attachments: [] };
  for (const s of specs) {
    const r = seedPackage(s);
    out.lessonPlans.push(...r.lessonPlans);
    out.attachments.push(...r.attachments);
  }
  return out;
};