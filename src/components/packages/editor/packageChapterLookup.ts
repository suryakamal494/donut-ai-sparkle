import { allCBSEChapters } from "@/data/cbseMasterData";
import { courseOwnedChapters } from "@/data/masterData";

// Wizard uses kebab grade ids; CBSE data uses numeric "1"–"7".
const GRADE_TO_NUMERIC: Record<string, string> = {
  "class-6": "1",
  "class-7": "2",
  "class-8": "3",
  "class-9": "4",
  "class-10": "5",
  "class-11": "6",
  "class-12": "7",
};

export interface EditorChapter {
  id: string;
  name: string;
  order: number;
}

export const getChaptersForScope = (
  sourceType: "curriculum" | "course",
  sourceId: string,
  gradeId: string,
  subjectId: string,
): EditorChapter[] => {
  const numericGrade = GRADE_TO_NUMERIC[gradeId] ?? gradeId;

  if (sourceType === "curriculum") {
    return allCBSEChapters
      .filter(
        (c) =>
          c.curriculumId === sourceId &&
          c.classId === numericGrade &&
          c.subjectId === subjectId,
      )
      .map((c) => ({ id: c.id, name: c.name, order: c.order }))
      .sort((a, b) => a.order - b.order);
  }

  // course: course-owned + mapped curriculum chapters in the requested subject
  const owned = courseOwnedChapters
    .filter((c) => c.courseId === sourceId && c.subjectId === subjectId)
    .map((c) => ({ id: c.id, name: c.name, order: c.order }));

  // For course mappings we still surface CBSE chapter info filtered by grade+subject.
  const mapped = allCBSEChapters
    .filter((c) => c.classId === numericGrade && c.subjectId === subjectId)
    .map((c) => ({ id: c.id, name: c.name, order: c.order + 100 }));

  return [...owned, ...mapped].sort((a, b) => a.order - b.order);
};