import { useState } from "react";
import { ChevronDown, BookOpen, ClipboardList, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { EditorChapter } from "./packageChapterLookup";
import {
  getLessonPlansForChapter,
  getAttachmentsForChapter,
  attachExamsToPackage,
  removeAttachment,
} from "@/data/packages";
import { teacherExams } from "@/data/teacher/exams";
import AttachTestSheet from "./AttachTestSheet";
import type { PackageAttachmentKind } from "@/types/packages";

interface Props {
  packageId: string;
  gradeId: string;
  subjectId: string;
  chapters: EditorChapter[];
  inclusionsEnabled: { tests: boolean; grand: boolean; pyp: boolean };
}

const ChapterAccordion = ({
  packageId,
  gradeId,
  subjectId,
  chapters,
  inclusionsEnabled,
}: Props) => {
  const [openId, setOpenId] = useState<string | null>(chapters[0]?.id ?? null);
  const [sheet, setSheet] = useState<{
    chapterId: string;
    kind: PackageAttachmentKind;
  } | null>(null);
  // tick to force re-render after mutating in-memory store
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  if (chapters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">
          No chapters in master data for this grade + subject yet.
        </p>
      </div>
    );
  }

  const examNameById = (id: string) =>
    teacherExams.find((e) => e.id === id)?.name ?? id;

  return (
    <>
    <div className="divide-y">
      {chapters.map((ch) => {
        const isOpen = openId === ch.id;
        const lessons = getLessonPlansForChapter(packageId, ch.id);
        const attachments = getAttachmentsForChapter(packageId, ch.id);
        return (
          <div key={ch.id} className="bg-background">
            <button
              onClick={() => setOpenId(isOpen ? null : ch.id)}
              className="w-full flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                  !isOpen && "-rotate-90",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {ch.name}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {lessons.length}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" />
                  {attachments.length}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 md:px-6 pb-4 pl-11 space-y-2">
                {lessons.length === 0 && attachments.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">
                    Nothing added yet. Add a lesson plan or attach a test.
                  </p>
                )}
                {lessons.map((lp) => (
                  <div
                    key={lp.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="flex-1 truncate">{lp.title}</span>
                  </div>
                ))}
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span className="flex-1 truncate">{examNameById(a.examId)}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {a.kind === "pyp" ? "PYP" : a.kind === "grand-test" ? "Grand" : "Test"}
                    </span>
                    <button
                      onClick={() => {
                        removeAttachment(a.id);
                        refresh();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-background"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" disabled className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add lesson plan
                  </Button>
                  {inclusionsEnabled.tests && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setSheet({ chapterId: ch.id, kind: "chapter-test" })}
                    >
                      <Plus className="w-3.5 h-3.5" /> Attach test
                    </Button>
                  )}
                  {inclusionsEnabled.pyp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setSheet({ chapterId: ch.id, kind: "pyp" })}
                    >
                      <Plus className="w-3.5 h-3.5" /> Attach PYP
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {sheet && (
      <AttachTestSheet
        open={!!sheet}
        onOpenChange={(o) => !o && setSheet(null)}
        kind={sheet.kind}
        subjectId={subjectId}
        excludeExamIds={getAttachmentsForChapter(packageId, sheet.chapterId)
          .filter((a) => a.kind === sheet.kind)
          .map((a) => a.examId)}
        onAttach={(ids) => {
          attachExamsToPackage(packageId, ids, {
            kind: sheet.kind,
            gradeId,
            subjectId,
            chapterId: sheet.chapterId,
          });
          refresh();
        }}
      />
    )}
    </>
  );
};

export default ChapterAccordion;