import { cn } from "@/lib/utils";
import { getClassName } from "@/data/masterData";

interface Props {
  gradeIds: string[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "row" | "compact";
}

const GradeSwitcher = ({ gradeIds, activeId, onChange, variant = "row" }: Props) => {
  if (variant === "compact") {
    if (gradeIds.length <= 1) {
      return (
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {getClassName(gradeIds[0] ?? "")}
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1 max-w-[55vw] overflow-x-auto no-scrollbar">
        {gradeIds.map((g) => {
          const active = g === activeId;
          return (
            <button
              key={g}
              onClick={() => onChange(g)}
              className={cn(
                "px-2.5 h-7 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted border-border",
              )}
            >
              {getClassName(g)}
            </button>
          );
        })}
      </div>
    );
  }

  if (gradeIds.length <= 1) {
    return (
      <div className="px-4 md:px-6 py-2 text-sm font-medium text-foreground">
        {getClassName(gradeIds[0] ?? "")}
      </div>
    );
  }
  return (
    <div className="px-4 md:px-6 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
      {gradeIds.map((g) => {
        const active = g === activeId;
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground hover:bg-muted border-border",
            )}
          >
            {getClassName(g)}
          </button>
        );
      })}
    </div>
  );
};

export default GradeSwitcher;