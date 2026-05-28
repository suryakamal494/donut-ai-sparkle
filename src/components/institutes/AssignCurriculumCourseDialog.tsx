import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Layers, Search, Plus, Wrench, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { curriculums, courses } from "@/data/masterData";
import { cn } from "@/lib/utils";
import { assignPackagesToInstitute, getAssignedPackageIds } from "@/data/institute/institutePackages";
import AssignPackagesStep from "./AssignPackagesStep";

interface AssignCurriculumCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instituteId: string;
  currentCurriculums: string[];
  currentCourses: string[];
}

export const AssignCurriculumCourseDialog = ({ 
  open, 
  onOpenChange, 
  instituteId,
  currentCurriculums,
  currentCourses 
}: AssignCurriculumCourseDialogProps) => {
  const navigate = useNavigate();
  const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCurriculums(currentCurriculums);
    setSelectedCourses(currentCourses);
    setSelectedPackages(getAssignedPackageIds(instituteId));
    setStep(1);
  }, [currentCurriculums, currentCourses, open, instituteId]);

  const toggleCurriculum = (curriculumId: string) => {
    setSelectedCurriculums(prev => 
      prev.includes(curriculumId) 
        ? prev.filter(c => c !== curriculumId)
        : [...prev, curriculumId]
    );
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(c => c !== courseId)
        : [...prev, courseId]
    );
  };

  const togglePackage = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId],
    );
  };

  const handleSave = () => {
    const addedCurriculums = selectedCurriculums.filter(c => !currentCurriculums.includes(c));
    const removedCurriculums = currentCurriculums.filter(c => !selectedCurriculums.includes(c));
    const addedCourses = selectedCourses.filter(c => !currentCourses.includes(c));
    const removedCourses = currentCourses.filter(c => !selectedCourses.includes(c));
    const previousPackages = getAssignedPackageIds(instituteId);
    const addedPackages = selectedPackages.filter((p) => !previousPackages.includes(p));
    const removedPackages = previousPackages.filter((p) => !selectedPackages.includes(p));

    // Drop any selected packages whose source is no longer assigned
    const finalPackages = selectedPackages; // already constrained by step-2 list
    assignPackagesToInstitute(instituteId, finalPackages);

    const changes = [];
    if (addedCurriculums.length) changes.push(`Added ${addedCurriculums.length} curriculum(s)`);
    if (removedCurriculums.length) changes.push(`Removed ${removedCurriculums.length} curriculum(s)`);
    if (addedCourses.length) changes.push(`Added ${addedCourses.length} course(s)`);
    if (removedCourses.length) changes.push(`Removed ${removedCourses.length} course(s)`);
    if (addedPackages.length) changes.push(`Added ${addedPackages.length} package(s)`);
    if (removedPackages.length) changes.push(`Removed ${removedPackages.length} package(s)`);

    if (changes.length) {
      toast.success(changes.join(", "));
    } else {
      toast.info("No changes made");
    }
    
    onOpenChange(false);
  };

  const handleCreateCustomCourse = () => {
    onOpenChange(false);
    navigate(`/superadmin/institutes/${instituteId}/custom-course`);
  };

  const filteredCurriculums = curriculums.filter(c => 
    c.isActive && c.name.toLowerCase().includes(curriculumSearch.toLowerCase())
  );

  const filteredCourses = courses.filter(c => 
    c.isActive && c.status === "published" && c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[88vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Assign Curriculums & Courses" : "Assign Packages"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Step 1 of 2 — pick the curriculums and courses this institute should have access to."
              : "Step 2 of 2 — pick which published packages from the chosen curriculums/courses go to this institute."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Curriculums Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Curriculums</h4>
              <Badge variant="outline" className="ml-auto">{selectedCurriculums.length}</Badge>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search curriculums..." 
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <ScrollArea className="h-[220px] pr-2">
              <div className="space-y-2">
                {filteredCurriculums.map((curriculum) => (
                  <div
                    key={curriculum.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedCurriculums.includes(curriculum.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleCurriculum(curriculum.id)}
                  >
                    <Checkbox 
                      checked={selectedCurriculums.includes(curriculum.id)}
                      onCheckedChange={() => toggleCurriculum(curriculum.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{curriculum.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{curriculum.description}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{curriculum.code}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Courses Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Courses</h4>
              <Badge variant="outline" className="ml-auto">{selectedCourses.length}</Badge>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses..." 
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <ScrollArea className="h-[220px] pr-2">
              <div className="space-y-2">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedCourses.includes(course.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleCourse(course.id)}
                  >
                    <Checkbox 
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{course.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{course.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize">{course.courseType}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        ) : (
          <div className="py-4">
            <AssignPackagesStep
              selectedCurriculums={selectedCurriculums}
              selectedCourses={selectedCourses}
              selectedPackages={selectedPackages}
              onToggle={togglePackage}
            />
          </div>
        )}

        {/* Custom Course Section */}
        {step === 1 && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Need a course tailored for this institute?</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreateCustomCourse}>
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Course
            </Button>
          </div>
        </div>
        )}

        <DialogFooter className="mt-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={() => setStep(2)} className="gap-1.5">
              Next: Packages <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="gap-1.5">
              <Check className="w-4 h-4" /> Save Assignments
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
