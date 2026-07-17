import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { subjects } from "@/data/mockData";
import { allCBSEChapters } from "@/data/cbseMasterData";
import { SubjectFormDialog } from "./SubjectFormDialog";

interface SubjectPanelProps {
  selectedClassId: string | null;
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
}

// Core subjects that have CBSE data
const coreSubjectIds = ["1", "2", "3", "8", "12"]; // Physics, Chemistry, Math, Hindi, History

// Subject color mapping for dot indicators
const subjectDotColors: Record<string, string> = {
  "1": "#4f46e5", // Physics - Indigo
  "2": "#0d9488", // Chemistry - Teal
  "3": "#2563eb", // Mathematics - Blue
  "8": "#ea580c", // Hindi - Orange
  "12": "#b45309", // History - Amber
};

const getSubjectDotColor = (subjectId: string): string => {
  return subjectDotColors[subjectId] || "#6366f1";
};

export const SubjectPanel = ({ selectedClassId, selectedSubjectId, onSelectSubject }: SubjectPanelProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Get chapter counts per subject for selected class
  const getChapterCount = (subjectId: string) => {
    if (!selectedClassId) return 0;
    return allCBSEChapters.filter(ch => ch.classId === selectedClassId && ch.subjectId === subjectId).length;
  };

  // Filter subjects that have content for this class
  const subjectsWithContent = subjects.filter(sub => {
    if (!selectedClassId) return coreSubjectIds.includes(sub.id);
    return getChapterCount(sub.id) > 0 || coreSubjectIds.includes(sub.id);
  });

  // Sort: subjects with content first
  const sortedSubjects = [...subjectsWithContent].sort((a, b) => {
    const countA = getChapterCount(a.id);
    const countB = getChapterCount(b.id);
    return countB - countA;
  });

  return (
    <div className="flex flex-col h-full border-r border-border/50">
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Subjects
          {selectedClassId && (
            <span className="text-xs text-muted-foreground font-normal">
              ({sortedSubjects.length})
            </span>
          )}
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {!selectedClassId ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a class</p>
            </div>
          ) : (
            sortedSubjects.map((sub) => {
              const chapterCount = getChapterCount(sub.id);
              const isSelected = selectedSubjectId === sub.id;
              const dotColor = getSubjectDotColor(sub.id);
              
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubject(sub.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all gap-2",
                    isSelected
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className={cn(
                      "font-medium text-sm truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {sub.name}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full min-w-[28px] text-center shrink-0",
                    chapterCount > 0 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {chapterCount > 0 ? chapterCount : "—"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          disabled={!selectedClassId}
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      <SubjectFormDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};
