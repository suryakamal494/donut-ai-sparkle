import { useState } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { classes } from "@/data/mockData";
import { allCBSEChapters } from "@/data/cbseMasterData";
import { ClassFormDialog } from "./ClassFormDialog";

interface ClassPanelProps {
  selectedClassId: string | null;
  onSelectClass: (classId: string) => void;
}

export const ClassPanel = ({ selectedClassId, onSelectClass }: ClassPanelProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Get chapter counts per class
  const getChapterCount = (classId: string) => {
    return allCBSEChapters.filter(ch => ch.classId === classId).length;
  };

  return (
    <div className="flex flex-col h-full border-r border-border/50">
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          Classes
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {classes.map((cls) => {
            const chapterCount = getChapterCount(cls.id);
            const isSelected = selectedClassId === cls.id;
            
            return (
              <button
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all",
                  isSelected
                    ? "gradient-button text-white shadow-md"
                    : "hover:bg-muted/50 text-foreground"
                )}
              >
                <span className="font-medium text-sm">{cls.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full min-w-[28px] text-center",
                  isSelected
                    ? "bg-white/20 text-white"
                    : chapterCount > 0 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                )}>
                  {chapterCount > 0 ? chapterCount : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      <ClassFormDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};
