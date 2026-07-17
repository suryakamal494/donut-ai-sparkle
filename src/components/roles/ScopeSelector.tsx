import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { classes, subjects } from "@/data/mockData";
import { ScopeConfig } from "./types";
import { cn } from "@/lib/utils";

interface ScopeSelectorProps {
  scope: ScopeConfig;
  onChange: (scope: ScopeConfig) => void;
  disabled?: boolean;
  showInheritOption?: boolean;
  isInheriting?: boolean;
  onInheritChange?: (inherit: boolean) => void;
}

const ScopeSelector = ({ 
  scope, 
  onChange, 
  disabled = false,
  showInheritOption = false,
  isInheriting = false,
  onInheritChange,
}: ScopeSelectorProps) => {
  const handleAllClassesChange = (checked: boolean) => {
    onChange({ ...scope, allClasses: checked, classIds: checked ? [] : scope.classIds });
  };

  const handleClassToggle = (classId: string) => {
    const newClassIds = scope.classIds.includes(classId)
      ? scope.classIds.filter(id => id !== classId)
      : [...scope.classIds, classId];
    onChange({ ...scope, classIds: newClassIds, allClasses: false });
  };

  const handleAllSubjectsChange = (checked: boolean) => {
    onChange({ ...scope, allSubjects: checked, subjectIds: checked ? [] : scope.subjectIds });
  };

  const handleSubjectToggle = (subjectId: string) => {
    const newSubjectIds = scope.subjectIds.includes(subjectId)
      ? scope.subjectIds.filter(id => id !== subjectId)
      : [...scope.subjectIds, subjectId];
    onChange({ ...scope, subjectIds: newSubjectIds, allSubjects: false });
  };

  const isDisabled = disabled || isInheriting;

  return (
    <div className="space-y-4">
      {showInheritOption && onInheritChange && (
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <Checkbox 
            id="inherit-scope"
            checked={isInheriting}
            onCheckedChange={(checked) => onInheritChange(!!checked)}
            disabled={disabled}
          />
          <Label htmlFor="inherit-scope" className="text-sm cursor-pointer">
            Inherit scope from Question Bank
          </Label>
        </div>
      )}
      
      {/* Classes */}
      <div className={cn(isDisabled && "opacity-50 pointer-events-none")}>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Classes</Label>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="all-classes"
              checked={scope.allClasses}
              onCheckedChange={(checked) => handleAllClassesChange(!!checked)}
            />
            <Label htmlFor="all-classes" className="text-sm cursor-pointer">All Classes</Label>
          </div>
        </div>
        
        {!scope.allClasses && (
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <Badge
                key={cls.id}
                variant={scope.classIds.includes(cls.id) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleClassToggle(cls.id)}
              >
                {cls.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Subjects */}
      <div className={cn(isDisabled && "opacity-50 pointer-events-none")}>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Subjects</Label>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="all-subjects"
              checked={scope.allSubjects}
              onCheckedChange={(checked) => handleAllSubjectsChange(!!checked)}
            />
            <Label htmlFor="all-subjects" className="text-sm cursor-pointer">All Subjects</Label>
          </div>
        </div>
        
        {!scope.allSubjects && (
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {subjects.slice(0, 12).map((subject) => (
              <Badge
                key={subject.id}
                variant={scope.subjectIds.includes(subject.id) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleSubjectToggle(subject.id)}
              >
                {subject.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScopeSelector;
