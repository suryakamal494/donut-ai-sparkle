import { cn } from "@/lib/utils";
import { subjects } from "@/data/masterData";

interface Props {
  subjectIds: string[];
  activeId: string;
  onChange: (id: string) => void;
}

const SubjectTabs = ({ subjectIds, activeId, onChange }: Props) => {
  const items = subjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is { id: string; name: string } => Boolean(s));

  return (
    <div className="border-b bg-background px-4 md:px-6">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {items.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectTabs;