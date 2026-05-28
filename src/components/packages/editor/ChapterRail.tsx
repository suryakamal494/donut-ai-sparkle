import { cn } from "@/lib/utils";
import { ClipboardCheck } from "lucide-react";
import type { EditorChapter } from "./packageChapterLookup";

export interface ChapterRailItem extends EditorChapter {
  lessonCount: number;
  testCount: number;
}

interface Props {
  items: ChapterRailItem[];
  selected: { kind: "chapter"; id: string } | { kind: "grand" };
  onSelectChapter: (id: string) => void;
  onSelectGrand: () => void;
  grandTestsEnabled: boolean;
  grandTestCount: number;
}

const ChapterRail = ({
  items,
  selected,
  onSelectChapter,
  onSelectGrand,
  grandTestsEnabled,
  grandTestCount,
}: Props) => {
  return (
    <nav className="h-full overflow-y-auto bg-muted/20 border-r">
      <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Chapter Index
      </div>
      <ul className="px-2 pb-2 space-y-1">
        {items.length === 0 && (
          <li className="px-3 py-4 text-xs text-muted-foreground">
            No chapters in master data.
          </li>
        )}
        {items.map((c, idx) => {
          const isActive = selected.kind === "chapter" && selected.id === c.id;
          const dim = c.lessonCount === 0 && c.testCount === 0;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelectChapter(c.id)}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2 border transition-all min-h-[44px]",
                  isActive
                    ? "bg-background border-primary/40 shadow-sm"
                    : "border-transparent hover:bg-background hover:border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold truncate",
                      isActive ? "text-foreground" : dim ? "text-muted-foreground" : "text-foreground/80",
                    )}
                  >
                    <span className="text-muted-foreground font-normal mr-1.5 tabular-nums">
                      {idx + 1}.
                    </span>
                    {c.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : c.lessonCount > 0
                        ? "bg-muted text-muted-foreground"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {c.lessonCount}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {grandTestsEnabled && (
        <>
          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground border-t mt-2">
            Global
          </div>
          <div className="px-2 pb-4">
            <button
              onClick={onSelectGrand}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 border transition-all min-h-[44px]",
                selected.kind === "grand"
                  ? "bg-background border-violet-300 shadow-sm"
                  : "border-transparent hover:bg-background hover:border-border",
              )}
            >
              <ClipboardCheck className="w-4 h-4 text-violet-600 shrink-0" />
              <span className="flex-1 text-left text-sm font-semibold text-foreground/80">
                Grand Tests
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  grandTestCount > 0
                    ? "bg-violet-100 text-violet-700"
                    : "text-muted-foreground/60",
                )}
              >
                {grandTestCount}
              </span>
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default ChapterRail;