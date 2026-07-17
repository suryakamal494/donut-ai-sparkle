import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { assignedTracks } from "@/data/instituteData";
import { classes } from "@/data/mockData";

interface ExamDetailsStepProps {
  examName: string;
  setExamName: (name: string) => void;
  selectedCourse: string;
  selectedClassId: string;
  selectedSubjects: string[];
  isCBSE: boolean;
  availableSubjects: { id: string; name: string }[];
  handleCourseChange: (courseId: string) => void;
  handleClassChange: (classId: string) => void;
  toggleSubject: (subjectId: string) => void;
  canProceed: boolean;
  classSelectRef: React.RefObject<HTMLDivElement>;
  subjectSelectRef: React.RefObject<HTMLDivElement>;
  onNext: () => void;
  onCancel: () => void;
}

export const ExamDetailsStep = ({
  examName,
  setExamName,
  selectedCourse,
  selectedClassId,
  selectedSubjects,
  isCBSE,
  availableSubjects,
  handleCourseChange,
  handleClassChange,
  toggleSubject,
  canProceed,
  classSelectRef,
  subjectSelectRef,
  onNext,
  onCancel,
}: ExamDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Exam Details</h3>
        <p className="text-muted-foreground text-sm">Basic information about your exam</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="examName">Exam Name *</Label>
          <Input 
            id="examName"
            value={examName} 
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g., Mid-Term Physics Test"
          />
        </div>

        {/* Course Selection */}
        <div className="space-y-3">
          <Label>Select Course *</Label>
          <div className="grid grid-cols-2 gap-3">
            {assignedTracks.map((track) => (
              <label
                key={track.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  selectedCourse === track.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Checkbox 
                  checked={selectedCourse === track.id}
                  onCheckedChange={() => handleCourseChange(track.id)}
                />
                <div>
                  <p className="font-medium">{track.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {track.hasClasses ? "Board curriculum" : "Competitive exam"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Class Selection (only for CBSE) */}
        {isCBSE && selectedCourse && (
          <div className="space-y-2" ref={classSelectRef}>
            <Label>Class *</Label>
            <Select value={selectedClassId} onValueChange={handleClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject Selection */}
        {availableSubjects.length > 0 && (
          <div className="space-y-3" ref={subjectSelectRef}>
            <Label>Subjects *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSubjects.map((subject) => (
                <label
                  key={subject.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedSubjects.includes(subject.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox 
                    checked={selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => toggleSubject(subject.id)}
                  />
                  <span className="text-sm">{subject.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="gradient-button gap-2"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
