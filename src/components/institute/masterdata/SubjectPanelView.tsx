import { useMemo } from "react";
import { subjects } from "@/data/mockData";
import { allCBSEChapters } from "@/data/cbseMasterData";
import { courseChapterMappings, courseOwnedChapters } from "@/data/masterData";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectPanelViewProps {
  selectedClassId: string | null;
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
  trackId?: string;
  trackType?: "curriculum" | "course";
}

const coreSubjectIds = ['mathematics', 'physics', 'chemistry', 'history', 'hindi'];

// Map course subject IDs (1, 2, 3, 4) to display subject IDs
const courseSubjectIdMap: Record<string, string> = {
  "1": "physics",
  "2": "chemistry",
  "3": "mathematics",
  "4": "biology",
};

const subjectDotColors: Record<string, string> = {
  mathematics: '#3b82f6',
  physics: '#8b5cf6',
  chemistry: '#10b981',
  biology: '#ef4444',
  history: '#f59e0b',
  hindi: '#ec4899',
  english: '#06b6d4',
  geography: '#84cc16',
  economics: '#f97316',
  political_science: '#6366f1',
};

const getSubjectDotColor = (subjectId: string): string => {
  return subjectDotColors[subjectId] || '#94a3b8';
};

export const SubjectPanelView = ({ 
  selectedClassId, 
  selectedSubjectId, 
  onSelectSubject,
  trackId,
  trackType = "curriculum"
}: SubjectPanelViewProps) => {
  
  // For curriculum - count chapters by class and subject
  const getChapterCount = (classId: string, subjectId: string) => {
    return allCBSEChapters.filter(
      ch => ch.classId === classId && ch.subjectId === subjectId
    ).length;
  };

  // For courses - count chapters by subject (mapped + owned)
  const getCourseChapterCount = (subjectId: string) => {
    if (!trackId) return 0;
    
    // Get the course subject ID (1, 2, 3, 4) from display subject ID
    const courseSubjectId = Object.entries(courseSubjectIdMap)
      .find(([_, displayId]) => displayId === subjectId)?.[0];
    
    if (!courseSubjectId) return 0;
    
    // Count mapped chapters
    const mappedCount = courseChapterMappings.filter(m => {
      if (m.courseId !== trackId) return false;
      // Check if the mapped CBSE chapter belongs to this subject
      const cbseChapter = allCBSEChapters.find(ch => ch.id === m.chapterId);
      return cbseChapter?.subjectId === subjectId;
    }).length;
    
    // Count owned chapters
    const ownedCount = courseOwnedChapters.filter(
      c => c.courseId === trackId && c.subjectId === courseSubjectId
    ).length;
    
    return mappedCount + ownedCount;
  };

  // Get subjects based on track type
  const displaySubjects = useMemo(() => {
    if (trackType === "course" && trackId) {
      // Get unique subjects from course mappings and owned chapters
      const subjectIds = new Set<string>();
      
      // From mapped chapters
      courseChapterMappings
        .filter(m => m.courseId === trackId)
        .forEach(m => {
          const cbseChapter = allCBSEChapters.find(ch => ch.id === m.chapterId);
          if (cbseChapter) subjectIds.add(cbseChapter.subjectId);
        });
      
      // From owned chapters
      courseOwnedChapters
        .filter(c => c.courseId === trackId)
        .forEach(c => {
          const displaySubjectId = courseSubjectIdMap[c.subjectId];
          if (displaySubjectId) subjectIds.add(displaySubjectId);
        });
      
      return subjects.filter(s => subjectIds.has(s.id));
    }
    
    // Curriculum mode
    const filteredSubjects = subjects.filter(subject => {
      if (!selectedClassId) return coreSubjectIds.includes(subject.id);
      const hasContent = allCBSEChapters.some(
        ch => ch.classId === selectedClassId && ch.subjectId === subject.id
      );
      return hasContent || coreSubjectIds.includes(subject.id);
    });

    return [...filteredSubjects].sort((a, b) => {
      if (!selectedClassId) return 0;
      const aCount = getChapterCount(selectedClassId, a.id);
      const bCount = getChapterCount(selectedClassId, b.id);
      return bCount - aCount;
    });
  }, [selectedClassId, trackId, trackType]);

  const isDisabled = trackType === "curriculum" && !selectedClassId;

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden w-full lg:w-[200px]">
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Folder className="w-4 h-4 text-primary" />
          Subjects
        </h3>
        {isDisabled ? (
          <p className="text-xs text-muted-foreground mt-0.5">Select a class first</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            {displaySubjects.length} subjects
          </p>
        )}
      </div>
      <div className="p-2 space-y-1">
        {displaySubjects.map((subject) => {
          const chapterCount = trackType === "course"
            ? getCourseChapterCount(subject.id)
            : selectedClassId 
              ? getChapterCount(selectedClassId, subject.id) 
              : 0;
          const isSelected = selectedSubjectId === subject.id;
          
          return (
            <button
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              disabled={isDisabled}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between gap-2",
                isSelected 
                  ? 'gradient-button text-white shadow-md' 
                  : isDisabled 
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'hover:bg-muted/50 text-foreground'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div 
                  className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2",
                    isSelected ? "ring-white/30" : "ring-transparent"
                  )}
                  style={{ backgroundColor: isSelected ? '#fff' : getSubjectDotColor(subject.id) }}
                />
                <span className="text-sm font-medium truncate">{subject.name}</span>
              </div>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full min-w-[32px] text-center font-medium flex-shrink-0",
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
