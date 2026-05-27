import { Plus, X, ClipboardCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGrandTestsForPackage, removeAttachment } from "@/data/packages";
import { teacherExams } from "@/data/teacher/exams";

interface Props {
  packageId: string;
  onAttachClick: () => void;
  onChange: () => void;
}

const GrandTestsPane = ({ packageId, onAttachClick, onChange }: Props) => {
  const items = getGrandTestsForPackage(packageId);
  const examName = (id: string) =>
    teacherExams.find((e) => e.id === id)?.name ?? id;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 border-b">
        <div className="min-w-0 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Grand Tests
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Package-wide assessments not tied to a specific chapter.
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5" onClick={onAttachClick}>
          <Plus className="w-3.5 h-3.5" /> Attach grand test
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <ClipboardCheck className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No grand tests attached yet
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            Attach exams that cover multiple chapters or the full package syllabus.
          </p>
          <Button size="sm" className="gap-1.5" onClick={onAttachClick}>
            <Plus className="w-3.5 h-3.5" /> Attach grand test
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((a) => (
            <li
              key={a.id}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="flex-1 truncate text-sm font-semibold text-violet-900">
                {examName(a.examId)}
              </span>
              <button
                onClick={() => {
                  removeAttachment(a.id);
                  onChange();
                }}
                className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded hover:bg-violet-100"
                aria-label="Remove grand test"
              >
                <X className="w-3.5 h-3.5 text-violet-700" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GrandTestsPane;