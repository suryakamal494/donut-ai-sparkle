import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle2, Info, FileUp, Users, Calendar, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { batches, assignedTracks } from "@/data/instituteData";
import { examPatternConfig } from "@/data/examsData";
import { classes } from "@/data/mockData";
import { getSubjectsForCourse, subjects as masterSubjects } from "@/data/masterData";
import { getSubjectsByClass } from "@/data/cbseMasterData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

type PatternType = "custom" | "jee_main" | "jee_advanced" | "neet";

const UploadExam = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  
  // Step 1: Exam Configuration
  const [examName, setExamName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Step 2: Pattern
  const [pattern, setPattern] = useState<PatternType>("custom");
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [duration, setDuration] = useState(60);
  const [marksPerQuestion, setMarksPerQuestion] = useState(4);
  
  // Step 3: Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Step 4: Batch & Schedule (optional)
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("");

  // Determine if CBSE (has classes) or JEE Mains (no classes)
  const selectedTrack = assignedTracks.find(t => t.id === selectedCourse);
  const isCBSE = selectedTrack?.hasClasses ?? false;

  // Get subjects based on course selection
  const availableSubjects = selectedCourse
    ? isCBSE
      ? selectedClassId
        ? getSubjectsByClass(selectedClassId).map(s => ({ id: s.id, name: s.name }))
        : []
      : getSubjectsForCourse(selectedCourse).map(s => ({ id: s.id, name: s.name }))
    : [];

  // Group batches by class
  const batchesByClass = batches.reduce((acc, batch) => {
    if (!acc[batch.className]) {
      acc[batch.className] = [];
    }
    acc[batch.className].push(batch);
    return acc;
  }, {} as Record<string, typeof batches>);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setUploadedFile(file);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleBatch = (batchId: string) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(b => b !== batchId)
        : [...prev, batchId]
    );
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedClassId("");
    setSelectedSubjects([]);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjects([]);
  };

  const handleCreate = (skipBatch: boolean = false) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setProcessComplete(true);
      if (skipBatch) {
        toast.success("Exam created! You can assign batches from the Exams page.");
      } else {
        toast.success("Exam created successfully!");
      }
    }, 2000);
  };

  const steps = [
    { number: 1, title: "Exam Configuration", icon: FileText },
    { number: 2, title: "Exam Pattern", icon: FileText },
    { number: 3, title: "Upload PDF", icon: Upload },
    { number: 4, title: "Batch Assignment", icon: Users },
    { number: 5, title: "Complete", icon: CheckCircle2 },
  ];

  const canProceedStep1 = examName && selectedCourse && selectedSubjects.length > 0 && (!isCBSE || selectedClassId);
  const canProceedStep2 = pattern;
  const canProceedStep3 = uploadedFile;

  const getStepContent = () => {
    if (processComplete) {
      return (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Exam Uploaded Successfully!</h3>
            <p className="text-muted-foreground">
              Questions extracted from PDF. Review them before publishing.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/institute/exams")}>
              Back to Exams
            </Button>
            <Button className="gradient-button" onClick={() => navigate("/institute/exams/review/new")}>
              Review Questions
            </Button>
          </div>
        </div>
      );
    }

    // Step 1: Exam Configuration
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Exam Configuration</h3>
            <p className="text-muted-foreground text-sm">Name your exam and select subjects</p>
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
              <div className="space-y-2">
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
              <div className="space-y-3">
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
            <Button variant="outline" onClick={() => navigate("/institute/exams")}>
              Cancel
            </Button>
            <Button 
              className="gradient-button gap-2"
              disabled={!canProceedStep1}
              onClick={() => setCurrentStep(2)}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Step 2: Exam Pattern
    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Exam Pattern</h3>
            <p className="text-muted-foreground text-sm">Choose a standard pattern or configure custom</p>
          </div>
          
          <div className="space-y-4">
            <RadioGroup value={pattern} onValueChange={(v) => setPattern(v as PatternType)}>
              <label
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                  pattern === "custom" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value="custom" />
                <div>
                  <p className="font-medium">Custom Configuration</p>
                  <p className="text-sm text-muted-foreground">Define your own question count, marks, and duration</p>
                </div>
              </label>
              
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Or use a standard pattern:</p>
                {Object.entries(examPatternConfig).map(([key, config]) => (
                  <label
                    key={key}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all mb-2",
                      pattern === key 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={key} />
                    <div className="flex-1">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{config.totalQuestions} Qs</p>
                      <p>{config.duration} mins</p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>

            {pattern === "custom" && (
              <div className="p-4 rounded-xl bg-muted/30 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Questions</Label>
                    <Input 
                      type="number"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input 
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Marks per Question</Label>
                    <Input 
                      type="number"
                      value={marksPerQuestion}
                      onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input 
                      type="number"
                      value={totalQuestions * marksPerQuestion}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              className="gradient-button gap-2"
              disabled={!canProceedStep2}
              onClick={() => setCurrentStep(3)}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Step 3: Upload PDF
    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Upload Question Paper</h3>
            <p className="text-muted-foreground text-sm">Upload a PDF to create the exam</p>
          </div>
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              uploadedFile ? "border-success bg-success/5" : "border-border hover:border-primary/50"
            )}
          >
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              {uploadedFile ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-success mx-auto" />
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="font-medium text-foreground">
                    Drag & drop a question paper PDF
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: PDF (max 50MB)
                  </p>
                </div>
              )}
            </label>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              PDF will be converted into questions automatically. You can review and edit before publishing.
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              className="gradient-button gap-2"
              disabled={!canProceedStep3}
              onClick={() => setCurrentStep(4)}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Step 4: Batch Assignment
    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Assign to Batches</h3>
            <p className="text-muted-foreground text-sm">Select batches or skip to assign later</p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(batchesByClass).map(([className, classBatches]) => (
              <div key={className} className="space-y-2">
                <Label className="text-muted-foreground">{className}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {classBatches.map((batch) => (
                    <label
                      key={batch.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedBatches.includes(batch.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox 
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={() => toggleBatch(batch.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{batch.name}</p>
                        <p className="text-xs text-muted-foreground">{batch.studentCount} students</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedBatches.length > 0 && (
            <div className="space-y-4 p-4 rounded-xl bg-muted/30">
              <Label>Schedule (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Input 
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  placeholder="Select time"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to save as draft and schedule later
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                className="gradient-button gap-2"
                disabled={isProcessing}
                onClick={() => handleCreate(false)}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upload & Create Exam
                    <FileUp className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            
            {selectedBatches.length === 0 && (
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => handleCreate(true)}
                disabled={isProcessing}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip - Assign Batches Later
              </Button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Upload Exam PDF"
        description="Create an exam by uploading a question paper PDF"
        breadcrumbs={[
          { label: "Dashboard", href: "/institute/dashboard" },
          { label: "Exams", href: "/institute/exams" },
          { label: "Upload Exam" },
        ]}
      />

      {/* Stepper */}
      {!processComplete && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
          <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center min-w-[60px]">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      currentStep === step.number
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : currentStep > step.number
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium text-center max-w-[70px]",
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 sm:w-12 h-1 mx-1 rounded-full",
                    currentStep > step.number ? "bg-success" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 max-w-2xl mx-auto">
        {getStepContent()}
      </div>
    </div>
  );
};

export default UploadExam;
