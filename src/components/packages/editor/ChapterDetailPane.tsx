import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, Plus, X, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getLessonPlansForChapter,
  getAttachmentsForChapter,
  attachExamsToPackage,
  removeAttachment,
} from "@/data/packages";
import { teacherExams } from "@/data/teacher/exams";
import AttachTestSheet from "./AttachTestSheet";
import type { PackageAttachmentKind } from "@/types/packages";
import type { EditorChapter } from "./packageChapterLookup";

interface Props {
  packageId: string;
  gradeId: string;
  subjectId: string;
  chapter: EditorChapter;
  chapterIndex: number;
  inclusionsEnabled: { lessons: boolean; tests: boolean; pyp: boolean };
  onChange: () => void;
  /**
   * When true, all create/edit/delete controls are hidden so the pane can
   * be reused in read-only contexts (e.g. institute view).
   */
  readOnly?: boolean;
  /**
   * Lets the host swap the navigation target for "open lesson" clicks.
   * Defaults to the SuperAdmin lesson composer.
   */
  lessonHrefBuilder?: (lessonId: string) => string;
  /**
   * Lets the host inject its own ordering for the lesson list (used by the
   * institute view to honour local reorder overrides).
   */
  lessonOrderOverride?: string[] | null;
}

const ChapterDetailPane = ({
  packageId,
  gradeId,
  subjectId,
  chapter,
  chapterIndex,
  inclusionsEnabled,
  onChange,
  readOnly = false,
  lessonHrefBuilder,
  lessonOrderOverride,
}: Props) => {
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<PackageAttachmentKind | null>(null);

  const rawLessons = inclusionsEnabled.lessons
    ? getLessonPlansForChapter(packageId, chapter.id)
    : [];
  const lessons = (() => {
    if (!lessonOrderOverride || lessonOrderOverride.length === 0) return rawLessons;
    const byId = new Map(rawLessons.map((l) => [l.id, l]));
    const out: typeof rawLessons = [];
    for (const id of lessonOrderOverride) {
      const l = byId.get(id);
      if (l) {
        out.push(l);
        byId.delete(id);
      }
    }
    for (const remaining of rawLessons) {
      if (byId.has(remaining.id)) out.push(remaining);
    }
    return out;
  })();
  const attachments = getAttachmentsForChapter(packageId, chapter.id);
  const testAttachments = attachments.filter((a) => a.kind !== "grand-test");
  const blockCount = lessons.reduce((s, lp) => s + lp.blocks.length, 0);
  const examName = (id: string) =>
    teacherExams.find((e) => e.id === id)?.name ?? id;

  const openLesson = (lessonId: string) =>
    navigate(
      lessonHrefBuilder
        ? lessonHrefBuilder(lessonId)
        : `/superadmin/packages/${packageId}/lesson/${lessonId}`,
    );

  const addLesson = () =>
    navigate(
      `/superadmin/packages/${packageId}/lesson/new?grade=${gradeId}&subject=${subjectId}&chapter=${chapter.id}`,
    );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 border-b">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            Chapter {String(chapterIndex + 1).padStart(2, "0")}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
            {chapter.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              {lessons.length} lesson plan{lessons.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              {blockCount} block{blockCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  testAttachments.length > 0 ? "bg-emerald-500" : "bg-muted-foreground/40",
                )}
              />
              {testAttachments.length} test{testAttachments.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        {!readOnly && (
        <div className="flex flex-wrap gap-2">
          {inclusionsEnabled.lessons && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addLesson}>
              <Plus className="w-3.5 h-3.5" /> Add lesson plan
            </Button>
          )}
          {inclusionsEnabled.tests && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setSheet("chapter-test")}
            >
              <Plus className="w-3.5 h-3.5" /> Attach test
            </Button>
          )}
          {inclusionsEnabled.pyp && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setSheet("pyp")}
            >
              <Plus className="w-3.5 h-3.5" /> Attach PYP
            </Button>
          )}
        </div>
        )}
      </div>

      {/* Empty state */}
      {lessons.length === 0 && testAttachments.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            Nothing in this chapter yet
          </p>
          {!readOnly && (
            <>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            Add a lesson plan to start building content, or attach a chapter test for assessment.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {inclusionsEnabled.lessons && (
              <Button size="sm" className="gap-1.5" onClick={addLesson}>
                <Plus className="w-3.5 h-3.5" /> Add the first lesson plan
              </Button>
            )}
            {inclusionsEnabled.tests && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setSheet("chapter-test")}
              >
                <Plus className="w-3.5 h-3.5" /> Attach a test
              </Button>
            )}
          </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Lesson plans */}
          {lessons.length > 0 && (
            <div className="mt-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                Lesson plans
              </div>
              <ul className="space-y-2">
                {lessons.map((lp, i) => (
                  <li key={lp.id}>
                    <button
                      onClick={() => openLesson(lp.id)}
                      className="group w-full flex items-center gap-4 px-3 sm:px-4 py-3 rounded-xl border bg-background hover:border-primary/40 hover:shadow-sm transition-all text-left min-h-[64px]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {lp.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {lp.blocks.length} block{lp.blocks.length === 1 ? "" : "s"}
                          {lp.blocks.length > 0 && (
                            <> · ~{Math.max(5, lp.blocks.length * 5)} min</>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tests */}
          {testAttachments.length > 0 && (
            <div className="mt-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                Chapter tests
              </div>
              <ul className="space-y-2">
                {testAttachments.map((a) => (
                  <li
                    key={a.id}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40"
                  >
                    <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-violet-900 truncate">
                        {examName(a.examId)}
                      </p>
                      <p className="text-[11px] text-violet-700 font-medium">
                        {a.kind === "pyp" ? "Previous Year Paper" : "Chapter test"}
                      </p>
                    </div>
                    {!readOnly && (
                    <button
                      onClick={() => {
                        removeAttachment(a.id);
                        onChange();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded hover:bg-violet-100"
                      aria-label="Remove test"
                    >
                      <X className="w-3.5 h-3.5 text-violet-700" />
                    </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {sheet && (
        <AttachTestSheet
          open={!!sheet}
          onOpenChange={(o) => !o && setSheet(null)}
          kind={sheet}
          subjectId={subjectId}
          excludeExamIds={getAttachmentsForChapter(packageId, chapter.id)
            .filter((a) => a.kind === sheet)
            .map((a) => a.examId)}
          onAttach={(ids) => {
            attachExamsToPackage(packageId, ids, {
              kind: sheet,
              gradeId,
              subjectId,
              chapterId: chapter.id,
            });
            onChange();
          }}
        />
      )}
    </div>
  );
};

export default ChapterDetailPane;