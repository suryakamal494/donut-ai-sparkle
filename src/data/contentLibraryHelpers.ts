import { mockContentLibrary, type ContentItem } from "./contentLibraryData";

/**
 * Returns library items scoped to a given subject + chapter (case-insensitive).
 * Used by the SuperAdmin Packages lesson composer so admins only see content
 * relevant to the chapter they're assembling.
 */
export const getContentForChapter = (
  subjectName?: string,
  chapterName?: string,
): ContentItem[] => {
  const s = (subjectName ?? "").trim().toLowerCase();
  const c = (chapterName ?? "").trim().toLowerCase();
  return mockContentLibrary.filter((item) => {
    const matchSubject = !s || item.subject.toLowerCase() === s;
    const matchChapter = !c || (item.chapter ?? "").toLowerCase() === c;
    return matchSubject && matchChapter;
  });
};

/**
 * Mutates the in-memory mock library. Mirrors how other mock data layers in
 * the project handle "quick add" flows without a real backend.
 */
export const addContentToLibrary = (item: ContentItem): ContentItem => {
  mockContentLibrary.unshift(item);
  return item;
};

export const generateContentId = () => `content-${Date.now()}`;