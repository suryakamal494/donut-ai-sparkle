import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getActiveCurriculums } from "@/data/masterData";
import { classes } from "@/data/mockData";
import { Course } from "@/types/masterData";
import { NewCourseForm } from "@/hooks/useCourseBuilder";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCourse: NewCourseForm;
  onCourseChange: (course: NewCourseForm) => void;
  onToggleCurriculum: (currId: string) => void;
  onToggleClass: (classId: string) => void;
  onCreate: () => void;
}

export const CreateCourseDialog = ({
  open,
  onOpenChange,
  newCourse,
  onCourseChange,
  onToggleCurriculum,
  onToggleClass,
  onCreate,
}: CreateCourseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Create a competitive or foundation course to group chapters from different curriculums.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="courseName" className="text-xs sm:text-sm">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., IIT-JEE Mains"
                className="h-8 sm:h-9 text-xs sm:text-sm"
                value={newCourse.name}
                onChange={(e) => onCourseChange({ ...newCourse, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="courseCode" className="text-xs sm:text-sm">Code *</Label>
              <Input
                id="courseCode"
                placeholder="e.g., JEEM"
                className="h-8 sm:h-9 text-xs sm:text-sm"
                value={newCourse.code}
                onChange={(e) => onCourseChange({ ...newCourse, code: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="courseType" className="text-xs sm:text-sm">Course Type</Label>
            <Select 
              value={newCourse.courseType} 
              onValueChange={(v) => onCourseChange({ ...newCourse, courseType: v as Course["courseType"] })}
            >
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="competitive">Competitive</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="board">Board Preparation</SelectItem>
                <SelectItem value="olympiad">Olympiad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Allowed Curriculums *</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {getActiveCurriculums().map((curr) => (
                <label key={curr.id} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border cursor-pointer hover:bg-accent/30 transition-colors">
                  <Checkbox
                    checked={newCourse.allowedCurriculums.includes(curr.id)}
                    onCheckedChange={() => onToggleCurriculum(curr.id)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <span className="text-xs sm:text-sm">{curr.code}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Allowed Classes *</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border cursor-pointer hover:bg-accent/30 transition-colors">
                  <Checkbox
                    checked={newCourse.allowedClasses.includes(cls.id)}
                    onCheckedChange={() => onToggleClass(cls.id)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <span className="text-xs sm:text-sm">{cls.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="courseDesc" className="text-xs sm:text-sm">Description</Label>
            <Textarea
              id="courseDesc"
              placeholder="Brief description of the course..."
              className="text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
              value={newCourse.description}
              onChange={(e) => onCourseChange({ ...newCourse, description: e.target.value })}
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 sm:h-9 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={onCreate} className="h-8 sm:h-9 text-xs sm:text-sm">Create Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
