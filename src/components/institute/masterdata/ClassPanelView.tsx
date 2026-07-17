import { classes } from "@/data/mockData";
import { allCBSEChapters } from "@/data/cbseMasterData";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassPanelViewProps {
  selectedClassId: string | null;
  onSelectClass: (classId: string) => void;
}

export const ClassPanelView = ({ selectedClassId, onSelectClass }: ClassPanelViewProps) => {
  const getChapterCount = (classId: string) => {
    return allCBSEChapters.filter(ch => ch.classId === classId).length;
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden w-full lg:w-[180px]">
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <GraduationCap className="w-4 h-4 text-primary" />
          Classes
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{classes.length} classes</p>
      </div>
      <div className="p-2 space-y-1">
        {classes.map((cls) => {
          const chapterCount = getChapterCount(cls.id);
          const isSelected = selectedClassId === cls.id;
          
          return (
            <button
              key={cls.id}
              onClick={() => onSelectClass(cls.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group",
                isSelected 
                  ? 'gradient-button text-white shadow-md' 
                  : 'hover:bg-muted/50 text-foreground'
              )}
            >
              <span className="text-sm font-medium">{cls.name}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full min-w-[32px] text-center font-medium",
                chapterCount > 0 
                  ? isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'bg-primary/10 text-primary'
                  : isSelected
                    ? 'bg-white/10 text-white/60'
                    : 'text-muted-foreground/50'
              )}>
                {chapterCount > 0 ? chapterCount : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
