import { useMemo, useState, useEffect } from "react";
import { Search, ClipboardList, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { teacherExams } from "@/data/teacher/exams";
import { getSubjectById } from "@/data/masterData";
import type { PackageAttachmentKind } from "@/types/packages";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: PackageAttachmentKind;
  subjectId: string;
  excludeExamIds: string[];
  onAttach: (examIds: string[]) => void;
}

const kindLabel: Record<PackageAttachmentKind, string> = {
  "chapter-test": "Chapter Tests",
  "grand-test": "Grand Tests",
  pyp: "Previous Year Papers",
};

const AttachTestSheet = ({
  open,
  onOpenChange,
  kind,
  subjectId,
  excludeExamIds,
  onAttach,
}: Props) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(new Set());
    }
  }, [open]);

  const subjectName = getSubjectById(subjectId)?.name ?? "";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teacherExams.filter((ex) => {
      if (excludeExamIds.includes(ex.id)) return false;
      // crude subject filter — match by subject name when available
      if (
        subjectName &&
        ex.subjects &&
        ex.subjects.length > 0 &&
        !ex.subjects.some((s) => s.toLowerCase() === subjectName.toLowerCase())
      ) {
        // keep general/no-match tests too but rank lower; here we just keep them
      }
      if (!q) return true;
      return ex.name.toLowerCase().includes(q);
    });
  }, [query, excludeExamIds, subjectName]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAttach = () => {
    if (selected.size === 0) return;
    onAttach(Array.from(selected));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[560px] p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="text-base">Attach {kindLabel[kind]}</SheetTitle>
          <SheetDescription className="text-xs">
            Pick from existing exams in the {subjectName || "subject"} library.
          </SheetDescription>
          <div className="relative pt-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exams…"
              className="pl-9 h-9"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {visible.length === 0 ? (
            <div className="h-full flex items-center justify-center px-6 py-12">
              <p className="text-sm text-muted-foreground text-center">
                No matching exams found.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {visible.map((ex) => {
                const isSel = selected.has(ex.id);
                return (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => toggle(ex.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        isSel ? "bg-primary/10" : "hover:bg-muted/60",
                      )}
                    >
                      <Checkbox checked={isSel} className="pointer-events-none" />
                      <ClipboardList className="w-4 h-4 text-violet-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ex.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {ex.subjects?.join(" · ") || "—"} ·{" "}
                          {ex.totalQuestions} Qs · {ex.totalMarks} marks
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t px-5 py-3 flex items-center justify-between gap-2 bg-background">
          <p className="text-xs text-muted-foreground">
            {selected.size} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="gap-1"
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAttach}
              disabled={selected.size === 0}
              style={{
                background:
                  "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
              }}
            >
              Attach {selected.size > 0 ? selected.size : ""}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AttachTestSheet;