import type { StudentArtifact, StudentThread } from "./types";
import { SUBJECTS } from "./types";

export function timeGroup(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = diff / 86400000;
  if (days < 1) return "Today";
  if (days < 7) return "This Week";
  if (days < 31) return "Last Month";
  return "Older";
}

export function valueHasSubject(value: unknown, subject: string): boolean {
  if (!value) return false;
  if (typeof value === "string") return value.toLowerCase().includes(subject.toLowerCase());
  if (Array.isArray(value)) return value.some((item) => valueHasSubject(item, subject));
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((item) => valueHasSubject(item, subject));
  return false;
}

export function artifactMatchesSubject(
  artifact: StudentArtifact,
  subject: string | null | undefined,
  threads: StudentThread[]
): boolean {
  if (!subject) return true;
  const linkedThread = artifact.thread_id ? threads.find((t) => t.id === artifact.thread_id) : null;
  if (linkedThread?.subject === subject) return true;
  const content = artifact.content as Record<string, unknown> | null;
  if (content?.subject === subject) return true;
  if (valueHasSubject(content?.subjects, subject)) return true;
  if (valueHasSubject(artifact.title, subject)) return true;
  return SUBJECTS.some((s) => s === subject) && valueHasSubject(content, subject);
}
