import { cn } from "@/lib/utils";
import { getClassName } from "@/data/masterData";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Props {
  gradeIds: string[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "row" | "compact" | "dropdown";
}

const GradeSwitcher = ({ gradeIds, activeId, onChange, variant = "row" }: Props) => {
  if (variant === "dropdown") {
    const label = getClassName(activeId) || "Select class";
    if (gradeIds.length <= 1) {
      return (
        <span className="inline-flex items-center h-7 px-2 rounded-md text-sm font-medium text-foreground bg-muted/60 border border-border whitespace-nowrap">
          {label}
        </span>
      );
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2 rounded-md text-sm font-medium",
            "text-foreground bg-background border border-border hover:bg-muted",
            "transition-colors whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-ring",
          )}
        >
          <span>{label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[10rem]">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Class
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {gradeIds.map((g) => {
            const active = g === activeId;
            return (
              <DropdownMenuItem
                key={g}
                onSelect={() => onChange(g)}
                className={cn("flex items-center justify-between gap-3", active && "font-semibold")}
              >
                <span>{getClassName(g)}</span>
                {active && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

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