import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjects } from "@/data/mockData";
import { NewChapterForm } from "@/hooks/useCourseBuilder";

interface CreateChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newChapter: NewChapterForm;
  onChapterChange: (chapter: NewChapterForm) => void;
  onCreate: () => void;
}

export const CreateChapterDialog = ({
  open,
  onOpenChange,
  newChapter,
  onChapterChange,
  onCreate,
}: CreateChapterDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Course-Only Chapter</DialogTitle>
          <DialogDescription>
            This chapter will only exist inside this course and won't appear in regular curriculum.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="chapterName" className="text-xs sm:text-sm">Chapter Name *</Label>
            <Input
              id="chapterName"
              placeholder="e.g., Advanced Mechanics - Problem Solving"
              className="h-8 sm:h-9 text-xs sm:text-sm"
              value={newChapter.name}
              onChange={(e) => onChapterChange({ ...newChapter, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="chapterSubject" className="text-xs sm:text-sm">Subject *</Label>
            <Select 
              value={newChapter.subjectId} 
              onValueChange={(v) => onChapterChange({ ...newChapter, subjectId: v })}
            >
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 sm:h-9 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={onCreate} className="h-8 sm:h-9 text-xs sm:text-sm">Create Chapter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
