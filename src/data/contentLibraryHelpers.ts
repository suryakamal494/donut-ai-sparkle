import { mockContentLibrary, type ContentItem } from "./contentLibraryData";

// ---------------------------------------------------------------
// Deterministic chapter-scoped mock generator.
// For the SuperAdmin Packages composer we want every chapter to
// have a healthy library (~15 items spanning all content types)
// so the UI can be evaluated at scale. The list is derived purely
// from the chapter+subject name, so it is stable across renders
// and identical every time the sheet is reopened.
// ---------------------------------------------------------------

const TYPE_CYCLE: ContentItem["type"][] = [
  "ppt",
  "pdf",
  "video",
  "animation",
  "image",
];

const TITLE_TEMPLATES: Record<ContentItem["type"], string[]> = {
  ppt: [
    "{chapter} — Concept slides",
    "{chapter} — Quick recap deck",
    "{chapter} — Worked examples deck",
  ],
  pdf: [
    "{chapter} — NCERT chapter notes",
    "{chapter} — Practice problem set",
    "{chapter} — Formula sheet",
  ],
  video: [
    "{chapter} — Full concept lecture",
    "{chapter} — Solved examples walkthrough",
    "{chapter} — Crash revision",
  ],
  animation: [
    "{chapter} — Interactive simulation",
    "{chapter} — Animated explainer",
  ],
  image: [
    "{chapter} — Concept map",
    "{chapter} — Reference diagram",
  ],
};

const DURATIONS = ["8 mins", "12 mins", "15 mins", "20 mins", "25 mins"];

const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const generateChapterContent = (
  subjectName: string,
  chapterName: string,
  count = 15,
): ContentItem[] => {
  if (!chapterName) return [];
  const seed = hashString(`${subjectName}::${chapterName}`);
  const items: ContentItem[] = [];
  for (let i = 0; i < count; i++) {
    const type = TYPE_CYCLE[i % TYPE_CYCLE.length];
    const templates = TITLE_TEMPLATES[type];
    const variantIdx = Math.floor(i / TYPE_CYCLE.length) % templates.length;
    const title = templates[variantIdx].replace("{chapter}", chapterName);
    const id = `mock-${hashString(`${chapterName}-${type}-${i}`)}-${i}`;
    items.push({
      id,
      title,
      type,
      subject: subjectName,
      chapter: chapterName,
      description:
        type === "video"
          ? `Recorded lecture covering all key points of ${chapterName}.`
          : type === "pdf"
          ? `Printable resource for ${chapterName} — self-study friendly.`
          : type === "ppt"
          ? `Classroom-ready slide deck for ${chapterName}.`
          : type === "animation"
          ? `Hands-on interactive for ${chapterName} concepts.`
          : `High-resolution diagram for ${chapterName}.`,
      duration:
        type === "video"
          ? DURATIONS[(seed + i) % DURATIONS.length]
          : undefined,
    });
  }
  return items;
};

/**
 * Returns library items scoped to a given subject + chapter (case-insensitive).
 * Combines any real library entries with a deterministic mock set (~15 items)
 * so the SuperAdmin Packages composer always has volume to render.
 */
export const getContentForChapter = (
  subjectName?: string,
  chapterName?: string,
): ContentItem[] => {
  const s = (subjectName ?? "").trim().toLowerCase();
  const c = (chapterName ?? "").trim().toLowerCase();
  const real = mockContentLibrary.filter((item) => {
    const matchSubject = !s || item.subject.toLowerCase() === s;
    const matchChapter = !c || (item.chapter ?? "").toLowerCase() === c;
    return matchSubject && matchChapter;
  });
  const generated = generateChapterContent(
    subjectName ?? "",
    chapterName ?? "",
    15,
  );
  return [...real, ...generated];
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