import { BookOpen, Search, CheckSquare, XSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getActiveCurriculums } from "@/data/masterData";
import { classes, subjects } from "@/data/mockData";

interface Chapter {
  id: string;
  name: string;
  nameHindi?: string;
  order: number;
}

interface SourcePanelProps {
  sourceCurriculumId: string;
  sourceClassId: string;
  sourceSubjectId: string;
  sourceSearchQuery: string;
  selectedChapterIds: Set<string>;
  availableChapters: Chapter[];
  onCurriculumChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onChapterToggle: (chapterId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddSelected: () => void;
  onCreateChapter: () => void;
  onCreateTopic: () => void;
}

export const SourcePanel = ({
  sourceCurriculumId,
  sourceClassId,
  sourceSubjectId,
  sourceSearchQuery,
  selectedChapterIds,
  availableChapters,
  onCurriculumChange,
  onClassChange,
  onSubjectChange,
  onSearchChange,
  onChapterToggle,
  onSelectAll,
  onClearSelection,
  onAddSelected,
  onCreateChapter,
  onCreateTopic,
}: SourcePanelProps) => {
  return (
    <div className="bg-card rounded-lg sm:rounded-xl border border-border/50 shadow-soft overflow-hidden flex flex-col">
      <div className="p-3 sm:p-4 border-b border-border/50 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Source: Curriculum Tree</h3>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <Select value={sourceCurriculumId} onValueChange={onCurriculumChange}>
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Curriculum" />
            </SelectTrigger>
            <SelectContent>
              {getActiveCurriculums().map((curr) => (
                <SelectItem key={curr.id} value={curr.id}>{curr.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sourceClassId} onValueChange={onClassChange}>
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sourceSubjectId} onValueChange={onSubjectChange}>
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input 
            placeholder="Search chapters..." 
            className="pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm"
            value={sourceSearchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {availableChapters.length > 0 && (
          <div className="flex gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2">
              <CheckSquare className="w-3 h-3 mr-0.5 sm:mr-1" />
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2">
              <XSquare className="w-3 h-3 mr-0.5 sm:mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-3 sm:p-4">
        {!sourceClassId || !sourceSubjectId ? (
          <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-center text-muted-foreground">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-30" />
            <p className="text-xs sm:text-sm">Select a class and subject to view chapters</p>
          </div>
        ) : availableChapters.length === 0 ? (
          <div className="text-center text-muted-foreground py-6 sm:py-8">
            <p className="text-xs sm:text-sm">No chapters found</p>
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {availableChapters.map((chapter) => (
              <label
                key={chapter.id}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedChapterIds.has(chapter.id)
                    ? "bg-primary/5 border-primary/30"
                    : "bg-background border-border/50 hover:bg-accent/30"
                )}
              >
                <Checkbox
                  checked={selectedChapterIds.has(chapter.id)}
                  onCheckedChange={() => onChapterToggle(chapter.id)}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{chapter.name}</p>
                  {chapter.nameHindi && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{chapter.nameHindi}</p>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Ch. {chapter.order}</span>
              </label>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 sm:p-4 border-t border-border/50 space-y-1.5 sm:space-y-2">
        <Button 
          className="w-full h-8 sm:h-9 text-xs sm:text-sm" 
          disabled={selectedChapterIds.size === 0}
          onClick={onAddSelected}
        >
          Add Selected ({selectedChapterIds.size}) →
        </Button>
        <Button 
          variant="outline" 
          className="w-full gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
          onClick={onCreateChapter}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Create Course-Only Chapter</span>
          <span className="sm:hidden">Create Chapter</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
          onClick={onCreateTopic}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Create Course-Only Topic</span>
          <span className="sm:hidden">Create Topic</span>
        </Button>
      </div>
    </div>
  );
};
