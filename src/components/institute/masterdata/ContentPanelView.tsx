import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, BookOpen, FileText, ChevronsUpDown, ChevronsDownUp, Star, BookMarked } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classes, subjects } from "@/data/mockData";
import { allCBSEChapters, allCBSETopics, CBSEChapter } from "@/data/cbseMasterData";
import { courseChapterMappings, courseOwnedChapters, courseOwnedChapterTopics, curriculums } from "@/data/masterData";
import { cn } from "@/lib/utils";

interface ContentPanelViewProps {
  selectedClassId: string | null;
  selectedSubjectId: string | null;
  trackId?: string;
  trackType?: "curriculum" | "course";
}

// Map course subject IDs (1, 2, 3, 4) to display subject IDs
const courseSubjectIdMap: Record<string, string> = {
  "1": "physics",
  "2": "chemistry",
  "3": "mathematics",
  "4": "biology",
};

interface DisplayChapter {
  id: string;
  name: string;
  nameHindi?: string;
  nameTransliterated?: string;
  order: number;
  isCourseOwned: boolean;
  sourceLabel?: string;
  classId?: string;
}

export const ContentPanelView = ({ 
  selectedClassId, 
  selectedSubjectId,
  trackId,
  trackType = "curriculum"
}: ContentPanelViewProps) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Get chapters based on track type
  const displayChapters = useMemo((): DisplayChapter[] => {
    if (trackType === "course" && trackId && selectedSubjectId) {
      const chapters: DisplayChapter[] = [];
      
      // Get the course subject ID
      const courseSubjectId = Object.entries(courseSubjectIdMap)
        .find(([_, displayId]) => displayId === selectedSubjectId)?.[0];
      
      // Get mapped chapters
      const mappings = courseChapterMappings.filter(m => m.courseId === trackId);
      mappings.forEach(mapping => {
        const cbseChapter = allCBSEChapters.find(ch => ch.id === mapping.chapterId);
        if (cbseChapter && cbseChapter.subjectId === selectedSubjectId) {
          // Get curriculum name
          const curriculum = curriculums.find(c => c.id === mapping.sourceCurriculumId);
          const classNum = cbseChapter.classId?.replace('class-', '') || '';
          
          chapters.push({
            id: cbseChapter.id,
            name: cbseChapter.name,
            nameHindi: cbseChapter.nameHindi,
            nameTransliterated: cbseChapter.nameTransliterated,
            order: mapping.order,
            isCourseOwned: false,
            sourceLabel: `From ${curriculum?.code || 'CBSE'} ${classNum}`,
            classId: cbseChapter.classId
          });
        }
      });
      
      // Get owned chapters
      if (courseSubjectId) {
        const owned = courseOwnedChapters.filter(
          c => c.courseId === trackId && c.subjectId === courseSubjectId
        );
        owned.forEach(ch => {
          chapters.push({
            id: ch.id,
            name: ch.name,
            order: 1000 + ch.order, // Put owned chapters after mapped
            isCourseOwned: true,
            sourceLabel: "Course Exclusive"
          });
        });
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return chapters.filter(ch => {
          const chapterMatch = ch.name.toLowerCase().includes(query) ||
            ch.nameHindi?.toLowerCase().includes(query) ||
            ch.nameTransliterated?.toLowerCase().includes(query);
          
          // Check topics too
          const topics = getTopicsForChapter(ch.id, ch.isCourseOwned);
          const topicMatch = topics.some(t => t.name.toLowerCase().includes(query));
          
          return chapterMatch || topicMatch;
        });
      }
      
      return chapters.sort((a, b) => a.order - b.order);
    }
    
    // Curriculum mode
    if (!selectedClassId || !selectedSubjectId) return [];
    
    let chapters = allCBSEChapters.filter(
      ch => ch.classId === selectedClassId && ch.subjectId === selectedSubjectId
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      chapters = chapters.filter(ch => {
        const chapterMatch = ch.name.toLowerCase().includes(query) ||
          ch.nameHindi?.toLowerCase().includes(query) ||
          ch.nameTransliterated?.toLowerCase().includes(query);
        
        const topics = allCBSETopics.filter(t => t.chapterId === ch.id);
        const topicMatch = topics.some(t => t.name.toLowerCase().includes(query));
        
        return chapterMatch || topicMatch;
      });
    }

    return chapters.sort((a, b) => a.order - b.order).map(ch => ({
      id: ch.id,
      name: ch.name,
      nameHindi: ch.nameHindi,
      nameTransliterated: ch.nameTransliterated,
      order: ch.order,
      isCourseOwned: false,
      classId: ch.classId
    }));
  }, [selectedClassId, selectedSubjectId, searchQuery, trackId, trackType]);

  const getTopicsForChapter = (chapterId: string, isCourseOwned: boolean) => {
    if (isCourseOwned) {
      return courseOwnedChapterTopics
        .filter(t => t.chapterId === chapterId)
        .sort((a, b) => a.order - b.order);
    }
    return allCBSETopics
      .filter(t => t.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedChapters(new Set(displayChapters.map(ch => ch.id)));
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
  };

  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || id;
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

  const renderChapterName = (chapter: DisplayChapter) => {
    if (chapter.nameHindi) {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{chapter.nameHindi}</span>
          {chapter.nameTransliterated && (
            <span className="text-xs text-muted-foreground italic">
              {chapter.nameTransliterated}
            </span>
          )}
        </div>
      );
    }
    return <span className="text-sm font-medium">{chapter.name}</span>;
  };

  const totalTopics = useMemo(() => {
    return displayChapters.reduce((acc, ch) => 
      acc + getTopicsForChapter(ch.id, ch.isCourseOwned).length, 0
    );
  }, [displayChapters]);

  // Group chapters by source for courses - MUST be before any early returns
  const groupedChapters = useMemo(() => {
    if (trackType !== "course") return null;
    
    const mapped = displayChapters.filter(ch => !ch.isCourseOwned);
    const owned = displayChapters.filter(ch => ch.isCourseOwned);
    
    // Group mapped by source
    const mappedBySource = mapped.reduce((acc, ch) => {
      const source = ch.sourceLabel || "Other";
      if (!acc[source]) acc[source] = [];
      acc[source].push(ch);
      return acc;
    }, {} as Record<string, DisplayChapter[]>);
    
    return { mappedBySource, owned };
  }, [displayChapters, trackType]);

  // Check if we should show content
  const shouldShowContent = trackType === "course" 
    ? selectedSubjectId 
    : selectedClassId && selectedSubjectId;

  if (!shouldShowContent) {
    return (
      <div className="flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden min-h-[400px] max-h-[70vh]">
        <div className="p-3 border-b border-border/50 bg-muted/30">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
            <FileText className="w-4 h-4 text-primary" />
            Chapters & Topics
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {trackType === "course" 
                ? "Select a subject to view chapters"
                : "Select a class and subject to view chapters"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden min-h-[400px] max-h-[70vh]">
      <div className="p-3 border-b border-border/50 bg-muted/30 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">
                {getSubjectName(selectedSubjectId!)}
                {selectedClassId && trackType === "curriculum" && ` • ${getClassName(selectedClassId)}`}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayChapters.length} chapters • {totalTopics} topics
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="h-7 px-2 text-xs hidden sm:flex"
            >
              <ChevronsUpDown className="h-3 w-3 mr-1" />
              Expand
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="h-7 px-2 text-xs hidden sm:flex"
            >
              <ChevronsDownUp className="h-3 w-3 mr-1" />
              Collapse
            </Button>
            {/* Mobile version */}
            <Button
              variant="ghost"
              size="icon"
              onClick={expandedChapters.size > 0 ? collapseAll : expandAll}
              className="h-7 w-7 sm:hidden"
            >
              {expandedChapters.size > 0 ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search chapters or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 sm:p-3 space-y-2">
          {displayChapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {searchQuery ? 'No matching chapters found' : 'No chapters available'}
              </p>
            </div>
          ) : trackType === "course" && groupedChapters ? (
            // Course view with grouped chapters
            <>
              {/* Owned chapters first */}
              {groupedChapters.owned.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-300 to-transparent" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      Course Exclusive
                    </span>
                    <Badge className="text-[10px] h-5 px-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                      {groupedChapters.owned.length}
                    </Badge>
                    <div className="h-px flex-1 bg-gradient-to-l from-amber-300 to-transparent" />
                  </div>
                  <div className="space-y-2">
                    {groupedChapters.owned.map((chapter) => renderChapterItem(chapter))}
                  </div>
                </div>
              )}
              
              {/* Mapped chapters by source */}
              {Object.entries(groupedChapters.mappedBySource).map(([source, chapters]) => (
                <div key={source} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-teal-300 to-transparent" />
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide flex items-center gap-1.5">
                      <BookMarked className="h-3.5 w-3.5" />
                      {source}
                    </span>
                    <Badge className="text-[10px] h-5 px-2 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-50">
                      {chapters.length}
                    </Badge>
                    <div className="h-px flex-1 bg-gradient-to-l from-teal-300 to-transparent" />
                  </div>
                  <div className="space-y-2">
                    {chapters.map((chapter) => renderChapterItem(chapter))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Curriculum view - simple list
            displayChapters.map((chapter) => renderChapterItem(chapter))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  function renderChapterItem(chapter: DisplayChapter) {
    const topics = getTopicsForChapter(chapter.id, chapter.isCourseOwned);
    const isExpanded = expandedChapters.has(chapter.id);

    return (
      <div 
        key={chapter.id} 
        className={cn(
          "rounded-lg border bg-background shadow-sm overflow-hidden transition-all",
          chapter.isCourseOwned 
            ? "border-amber-200/50 bg-gradient-to-r from-amber-50/30 to-orange-50/30" 
            : "border-border/50"
        )}
      >
        <button
          onClick={() => toggleChapter(chapter.id)}
          className={cn(
            "w-full text-left px-3 py-2.5 flex items-start gap-2 transition-colors",
            isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
          )}
        >
          <span className={cn(
            "mt-0.5 p-1 rounded transition-colors",
            isExpanded ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )}>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {chapter.isCourseOwned && (
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
              )}
              {renderChapterName(chapter)}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                topics.length > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}>
                {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
              </span>
            </div>
          </div>
        </button>

        {isExpanded && topics.length > 0 && (
          <div className="border-t border-border/50 bg-muted/20 px-3 py-2 space-y-1">
            {topics.map((topic, idx) => (
              <div
                key={topic.id}
                className="flex items-start gap-2 px-4 sm:px-6 py-1.5 text-sm text-muted-foreground hover:bg-background/50 rounded transition-colors"
              >
                <span className="text-xs text-primary font-medium min-w-[20px] mt-0.5">
                  {idx + 1}.
                </span>
                <span className="text-sm">{topic.name}</span>
              </div>
            ))}
          </div>
        )}

        {isExpanded && topics.length === 0 && (
          <div className="border-t border-border/50 bg-muted/20 px-3 py-3 text-center">
            <span className="text-xs text-muted-foreground">No topics available</span>
          </div>
        )}
      </div>
    );
  }
};
