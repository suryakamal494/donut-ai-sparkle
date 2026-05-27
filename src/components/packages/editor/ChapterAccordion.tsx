import { useState } from "react";
import { ChevronDown, BookOpen, ClipboardList, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { EditorChapter } from "./packageChapterLookup";
import {
  getLessonPlansForChapter,
  getAttachmentsForChapter,
} from "@/data/packages";

interface Props {
  packageId: string;
  chapters: EditorChapter[];
  inclusionsEnabled: { tests: boolean; grand: boolean; pyp: boolean };
}

const ChapterAccordion = ({ packageId, chapters, inclusionsEnabled }: Props) => {
  const [openId, setOpenId] = useState<string | null>(chapters[0]?.id ?? null);

  if (chapters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">
          No chapters in master data for this grade + subject yet.
        </p>
      </div>
    );
  }

  return (
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-violet-600" />
                    <span className="flex-1 truncate">{a.examId}</span>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" disabled className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add lesson plan
                  </Button>
                  {inclusionsEnabled.tests && (
                    <Button size="sm" variant="outline" disabled className="gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Attach test
                    </Button>
                  )}
                  {inclusionsEnabled.pyp && (
                    <Button size="sm" variant="outline" disabled className="gap-1.5">
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
  );
};

export default ChapterAccordion;