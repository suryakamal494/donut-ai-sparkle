import { cn } from "@/lib/utils";
import { subjects } from "@/data/masterData";

interface Props {
  subjectIds: string[];
  activeId: string;
  onChange: (id: string) => void;
  /**
   * When true, renders only the scrollable chip row with no band styling
   * (border/padding). Used by the teacher Lesson Plans compact filter where
   * subject chips sit inline next to the class dropdown.
   */
  bare?: boolean;
}

const SubjectTabs = ({ subjectIds, activeId, onChange, bare = false }: Props) => {
  const items = subjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is { id: string; name: string } => Boolean(s));

  const chips = (
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

  if (bare) return chips;

  return (
    <div className="border-b bg-background px-4 md:px-6 py-1.5">{chips}</div>
  );
};

export default SubjectTabs;