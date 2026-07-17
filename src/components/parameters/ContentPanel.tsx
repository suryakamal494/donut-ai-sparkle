import { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, BookOpen, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { classes, subjects } from "@/data/mockData";
import { allCBSEChapters, allCBSETopics, type CBSEChapter, type CBSETopic } from "@/data/cbseMasterData";
import { SubjectBadge } from "@/components/subject";
import { ChapterFormDialog } from "./ChapterFormDialog";
import { TopicFormDialog } from "./TopicFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContentPanelProps {
  selectedClassId: string | null;
  selectedSubjectId: string | null;
}

export const ContentPanel = ({ selectedClassId, selectedSubjectId }: ContentPanelProps) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);
  const [addingTopicToChapter, setAddingTopicToChapter] = useState<string | null>(null);
  const [newChapterName, setNewChapterName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [editingChapter, setEditingChapter] = useState<CBSEChapter | null>(null);
  const [editingTopic, setEditingTopic] = useState<CBSETopic | null>(null);

  // Get filtered chapters
  const chapters = useMemo(() => {
    if (!selectedClassId || !selectedSubjectId) return [];
    return allCBSEChapters
      .filter(ch => ch.classId === selectedClassId && ch.subjectId === selectedSubjectId)
      .filter(ch => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const matchesChapter = ch.name.toLowerCase().includes(query) || 
          ch.nameHindi?.toLowerCase().includes(query) ||
          ch.nameTransliterated?.toLowerCase().includes(query);
        
        // Also check if any topic matches
        const chapterTopics = allCBSETopics.filter(t => t.chapterId === ch.id);
        const matchesTopic = chapterTopics.some(t => 
          t.name.toLowerCase().includes(query) ||
          t.nameHindi?.toLowerCase().includes(query)
        );
        
        return matchesChapter || matchesTopic;
      })
      .sort((a, b) => a.order - b.order);
  }, [selectedClassId, selectedSubjectId, searchQuery]);

  // Get topics for a chapter
  const getTopics = (chapterId: string) => {
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
    setExpandedChapters(new Set(chapters.map(ch => ch.id)));
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
  };

  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "";
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "";

  // Render chapter name with Hindi support
  const renderChapterName = (chapter: CBSEChapter) => {
    if (chapter.nameHindi) {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{chapter.nameHindi}</span>
          <span className="text-xs text-muted-foreground">
            {chapter.nameTransliterated || chapter.name}
          </span>
        </div>
      );
    }
    return <span className="font-medium">{chapter.name}</span>;
  };

  // Empty state
  if (!selectedClassId || !selectedSubjectId) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-border/50 bg-muted/30">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Chapters & Topics
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">Select a class and subject</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Choose from the left panels to view chapters and topics
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const totalTopics = chapters.reduce((acc, ch) => acc + getTopics(ch.id).length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <SubjectBadge subject={getSubjectName(selectedSubjectId)} size="md" />
            <div className="text-sm">
              <span className="text-muted-foreground">{getClassName(selectedClassId)}</span>
              <span className="mx-2 text-muted-foreground/50">•</span>
              <span className="text-primary font-medium">{chapters.length} chapters</span>
              <span className="mx-1 text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">{totalTopics} topics</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs">
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs">
              Collapse All
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chapters and topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-3 space-y-1 pb-8">
          {chapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No chapters found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            chapters.map((chapter, index) => {
              const topics = getTopics(chapter.id);
              const isExpanded = expandedChapters.has(chapter.id);
              
              return (
                <div key={chapter.id} className="rounded-lg border border-border/50 overflow-hidden group/chapter">
                  {/* Chapter Header */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors",
                      isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
                    )}
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <button className="p-0.5 hover:bg-muted rounded">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    
                    <span className="text-xs text-muted-foreground font-mono w-6">
                      {index + 1}.
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      {renderChapterName(chapter)}
                    </div>
                    
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {topics.length} topics
                    </span>
                    
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/chapter:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-7 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChapter(chapter);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-7 h-7 text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{chapter.name}"? This will also remove all topics under this chapter.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Topics */}
                  {isExpanded && (
                    <div className="border-t border-border/50 bg-background">
                      {topics.length === 0 ? (
                        <div className="px-10 py-3 text-sm text-muted-foreground italic">
                          No topics added yet
                        </div>
                      ) : (
                        topics.map((topic, topicIndex) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-2 px-3 py-2 ml-6 border-l-2 border-muted hover:bg-muted/20 group"
                          >
                            <span className="text-xs text-muted-foreground font-mono w-8">
                              {index + 1}.{topicIndex + 1}
                            </span>
                            <div className="flex-1 text-sm">
                              {topic.nameHindi ? (
                                <div>
                                  <span>{topic.nameHindi}</span>
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    ({topic.name})
                                  </span>
                                </div>
                              ) : (
                                topic.name
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-6 h-6"
                                onClick={() => setEditingTopic(topic)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="w-6 h-6 text-destructive">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{topic.name}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* Add Topic Inline */}
                      {addingTopicToChapter === chapter.id ? (
                        <div className="flex items-center gap-2 px-3 py-2 ml-6 border-l-2 border-primary bg-primary/5">
                          <Input
                            autoFocus
                            placeholder="Enter topic name..."
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setAddingTopicToChapter(null);
                                setNewTopicName("");
                              }
                              if (e.key === "Enter" && newTopicName.trim()) {
                                // TODO: Add topic to database
                                console.log("Add topic:", newTopicName, "to chapter:", chapter.id);
                                setAddingTopicToChapter(null);
                                setNewTopicName("");
                              }
                            }}
                            className="h-8 flex-1"
                          />
                          <Button 
                            size="sm" 
                            className="gradient-button"
                            onClick={() => {
                              if (newTopicName.trim()) {
                                // TODO: Add topic to database
                                console.log("Add topic:", newTopicName, "to chapter:", chapter.id);
                                setAddingTopicToChapter(null);
                                setNewTopicName("");
                              }
                            }}
                            disabled={!newTopicName.trim()}
                          >
                            Add
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setAddingTopicToChapter(null);
                              setNewTopicName("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTopicToChapter(chapter.id)}
                          className="flex items-center gap-2 px-3 py-2 ml-6 border-l-2 border-dashed border-muted text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors w-full"
                        >
                          <Plus className="w-4 h-4" />
                          Add Topic
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Add Chapter */}
          {addingChapter ? (
            <div className="rounded-lg border-2 border-dashed border-primary p-3 bg-primary/5">
              <Input
                autoFocus
                placeholder="Enter chapter name..."
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setAddingChapter(false);
                    setNewChapterName("");
                  }
                  if (e.key === "Enter" && newChapterName.trim()) {
                    // TODO: Add chapter
                    setAddingChapter(false);
                    setNewChapterName("");
                  }
                }}
                className="mb-2"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setAddingChapter(false);
                    setNewChapterName("");
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" className="gradient-button">
                  Add Chapter
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingChapter(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-muted text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Chapter
            </button>
          )}
        </div>
      </ScrollArea>

      {/* Edit Chapter Dialog */}
      <ChapterFormDialog
        open={!!editingChapter}
        onOpenChange={(open) => !open && setEditingChapter(null)}
        editingChapter={editingChapter}
        onSave={(data) => {
          // TODO: Implement save
          console.log("Save chapter:", data);
          setEditingChapter(null);
        }}
      />

      {/* Edit Topic Dialog */}
      <TopicFormDialog
        open={!!editingTopic}
        onOpenChange={(open) => !open && setEditingTopic(null)}
        editingTopic={editingTopic}
        onSave={(data) => {
          // TODO: Implement save
          console.log("Save topic:", data);
          setEditingTopic(null);
        }}
      />
    </div>
  );
};
