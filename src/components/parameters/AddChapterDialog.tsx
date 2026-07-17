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
import { toast } from "sonner";
import { X, Plus, FileText } from "lucide-react";

interface AddChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: { 
    curriculumId: string; 
    classId: string; 
    subjectId: string; 
    chapters: string[] 
  }) => void;
}

export const AddChapterDialog = ({ open, onOpenChange, onSave }: AddChapterDialogProps) => {
  const isMobile = useIsMobile();
  const [curriculumId, setCurriculumId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [bulkInput, setBulkInput] = useState("");

  const activeCurriculums = getActiveCurriculums();

  // Parse bulk input into chapters
  const parsedChapters = useMemo(() => {
    return parseBulkInput(bulkInput);
  }, [bulkInput]);

  const canSubmit = curriculumId && classId && subjectId && parsedChapters.length > 0;

  const handleReset = () => {
    setCurriculumId("");
    setClassId("");
    setSubjectId("");
    setBulkInput("");
  };

  const handleSave = () => {
    if (!canSubmit) return;

    if (onSave) {
      onSave({
        curriculumId,
        classId,
        subjectId,
        chapters: parsedChapters,
      });
    }

    toast.success(`${parsedChapters.length} chapter(s) added successfully`);
    handleReset();
    onOpenChange(false);
  };

  const handleRemoveChapter = (index: number) => {
    const lines = bulkInput.split(/[\n\r]+/).filter(l => l.trim());
    lines.splice(index, 1);
    setBulkInput(lines.join("\n"));
  };

  const content = (
    <div className="space-y-4">
      {/* Selection Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Curriculum *</Label>
          <Select value={curriculumId} onValueChange={(v) => { setCurriculumId(v); setClassId(""); setSubjectId(""); }}>
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
          <Select value={classId} onValueChange={(v) => { setClassId(v); setSubjectId(""); }} disabled={!curriculumId}>
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
          <Select value={subjectId} onValueChange={setSubjectId} disabled={!classId}>
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

      {/* Bulk Input */}
      <div className="space-y-1.5">
        <Label className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Chapter Names
        </Label>
        <p className="text-xs text-muted-foreground">
          Enter one chapter per line, or paste multiple chapters at once
        </p>
        <Textarea
          placeholder={`Laws of Motion\nWork, Energy and Power\nGravitation\nProperties of Bulk Matter`}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          className="min-h-28 text-sm font-mono"
        />
      </div>

      {/* Preview */}
      {parsedChapters.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            Preview ({parsedChapters.length} chapter{parsedChapters.length > 1 ? 's' : ''})
          </Label>
          <ScrollArea className="h-32 border rounded-lg">
            <div className="p-2 space-y-1.5">
              {parsedChapters.map((chapter, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm truncate">{chapter}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => handleRemoveChapter(index)}
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
        Add {parsedChapters.length > 0 ? `${parsedChapters.length} Chapter${parsedChapters.length > 1 ? 's' : ''}` : 'Chapters'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Chapters</DrawerTitle>
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
          <DialogTitle>Add Chapters</DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
