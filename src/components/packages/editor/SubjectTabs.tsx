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
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap border transition-colors",
                active
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {s.name}
            </button>
          );
        })}
    </div>
  );
};

export default SubjectTabs;