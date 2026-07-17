import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseBulkInput } from "@/lib/parseUtils";
import { getActiveCurriculums } from "@/data/masterData";
import { classes, subjects } from "@/data/mockData";
import { getChaptersByClassAndSubject } from "@/data/cbseMasterData";
import { toast } from "sonner";
import { X, Plus, FileText, BookOpen } from "lucide-react";

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: { 
    curriculumId: string; 
    classId: string; 
    subjectId: string;
    chapterId: string;
    topics: string[] 
  }) => void;
}

export const AddTopicDialog = ({ open, onOpenChange, onSave }: AddTopicDialogProps) => {
  const isMobile = useIsMobile();
  const [curriculumId, setCurriculumId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [bulkInput, setBulkInput] = useState("");

  const activeCurriculums = getActiveCurriculums();

  // Get chapters based on selected class and subject
  const availableChapters = useMemo(() => {
    if (!classId || !subjectId) return [];
    return getChaptersByClassAndSubject(classId, subjectId);
  }, [classId, subjectId]);

  // Parse bulk input into topics
  const parsedTopics = useMemo(() => {
    return parseBulkInput(bulkInput);
  }, [bulkInput]);

  const canSubmit = curriculumId && classId && subjectId && chapterId && parsedTopics.length > 0;

  const selectedChapter = availableChapters.find(ch => ch.id === chapterId);

  const handleReset = () => {
    setCurriculumId("");
    setClassId("");
    setSubjectId("");
    setChapterId("");
    setBulkInput("");
  };

  const handleSave = () => {
    if (!canSubmit) return;

    if (onSave) {
      onSave({
        curriculumId,
        classId,
        subjectId,
        chapterId,
        topics: parsedTopics,
      });
    }

    toast.success(`${parsedTopics.length} topic(s) added to ${selectedChapter?.name}`);
    handleReset();
    onOpenChange(false);
  };

  const handleRemoveTopic = (index: number) => {
    const lines = bulkInput.split(/[\n\r]+/).filter(l => l.trim());
    lines.splice(index, 1);
    setBulkInput(lines.join("\n"));
  };

  const content = (
    <div className="space-y-4">
      {/* Selection Fields - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Curriculum *</Label>
          <Select value={curriculumId} onValueChange={(v) => { setCurriculumId(v); setClassId(""); setSubjectId(""); setChapterId(""); }}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {activeCurriculums.map((curr) => (
                <SelectItem key={curr.id} value={curr.id}>{curr.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Class *</Label>
          <Select value={classId} onValueChange={(v) => { setClassId(v); setSubjectId(""); setChapterId(""); }} disabled={!curriculumId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Subject *</Label>
          <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setChapterId(""); }} disabled={!classId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chapter Selection */}
      <div className="space-y-1.5">
        <Label className="text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Chapter *
        </Label>
        <Select value={chapterId} onValueChange={setChapterId} disabled={availableChapters.length === 0}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={availableChapters.length === 0 ? "Select class & subject first" : "Select chapter"} />
          </SelectTrigger>
          <SelectContent>
            {availableChapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedChapter && (
          <p className="text-xs text-muted-foreground">
            Topics will be added under: <span className="font-medium text-foreground">{selectedChapter.name}</span>
          </p>
        )}
      </div>

      {/* Bulk Input */}
      <div className="space-y-1.5">
        <Label className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Topic Names
        </Label>
        <p className="text-xs text-muted-foreground">
          Enter one topic per line, or paste multiple topics at once
        </p>
        <Textarea
          placeholder={`Newton's First Law\nNewton's Second Law\nNewton's Third Law\nApplications of Newton's Laws`}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          className="min-h-28 text-sm font-mono"
          disabled={!chapterId}
        />
      </div>

      {/* Preview */}
      {parsedTopics.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            Preview ({parsedTopics.length} topic{parsedTopics.length > 1 ? 's' : ''})
          </Label>
          <ScrollArea className="h-32 border rounded-lg">
            <div className="p-2 space-y-1.5">
              {parsedTopics.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm truncate">{topic}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => handleRemoveTopic(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button 
        className="gradient-button gap-2" 
        onClick={handleSave} 
        disabled={!canSubmit}
      >
        <Plus className="w-4 h-4" />
        Add {parsedTopics.length > 0 ? `${parsedTopics.length} Topic${parsedTopics.length > 1 ? 's' : ''}` : 'Topics'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Topics</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">
            {content}
          </div>
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Topics</DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
