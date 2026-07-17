import { useState, useCallback, useMemo } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { assignedTracks } from "@/data/instituteData";
import { getChaptersByClassAndSubject } from "@/data/cbseMasterData";
import { getSubjectsForCourse, getChaptersForCourseBySubject, subjects as masterSubjects } from "@/data/masterData";
import { classes } from "@/data/mockData";

type UploadState = "idle" | "uploading" | "success" | "error";

const UploadPDF = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // Course selection
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  // Get the selected track details
  const selectedTrack = assignedTracks.find(t => t.id === selectedCourse);
  const isCBSE = selectedTrack?.hasClasses;

  // Get available subjects based on course type
  const availableSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    if (isCBSE) {
      return masterSubjects;
    } else {
      return getSubjectsForCourse(selectedCourse);
    }
  }, [selectedCourse, isCBSE]);

  // Get chapters based on course type
  const availableChapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    if (isCBSE && selectedClassId) {
      return getChaptersByClassAndSubject(selectedClassId, selectedSubjectId);
    } else if (!isCBSE && selectedCourse) {
      return getChaptersForCourseBySubject(selectedCourse, selectedSubjectId);
    }
    return [];
  }, [selectedCourse, selectedClassId, selectedSubjectId, isCBSE]);

  const canProceedStep1 = isCBSE 
    ? (selectedCourse && selectedClassId && selectedSubjectId)
    : (selectedCourse && selectedSubjectId);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedClassId("");
    setSelectedSubjectId("");
    setSelectedChapterId("");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    
    setFileName(file.name);
    setUploadState("uploading");

    // Simulate upload process
    setTimeout(() => {
      setUploadState("success");
    }, 2000);
  };

  const handleGoToReview = () => {
    navigate("/institute/questions");
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
              currentStep >= step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step}
          </div>
          {step < 2 && (
            <div
              className={cn(
                "w-16 md:w-24 h-1 mx-2",
                currentStep > step ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (uploadState === "success") {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="PDF to Questions"
          breadcrumbs={[
            { label: "Dashboard", href: "/institute/dashboard" },
            { label: "Question Bank", href: "/institute/questions" },
            { label: "Upload PDF" },
          ]}
        />

        <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">PDF Uploaded Successfully!</h2>
          
          <p className="text-muted-foreground mb-2">
            <span className="font-medium text-foreground">{fileName}</span> has been uploaded.
          </p>
          
          <div className="bg-primary/5 rounded-xl p-6 mt-6 mb-8 border border-primary/10">
            <p className="text-lg font-medium text-foreground mb-2">Sit back & relax</p>
            <p className="text-muted-foreground">
              We are processing your document. Questions, answers, solutions, subjects, and chapters will be detected automatically.
            </p>
            <p className="text-sm text-primary mt-3">
              You will be notified once questions are ready for review.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link to="/institute/questions">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Question Bank
              </Button>
            </Link>
            <Button onClick={handleGoToReview} className="bg-gradient-to-r from-primary to-primary/80 gap-2">
              Go to Review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="PDF to Questions"
        description="Upload exam papers or question PDFs to automatically extract questions."
        breadcrumbs={[
          { label: "Dashboard", href: "/institute/dashboard" },
          { label: "Question Bank", href: "/institute/questions" },
          { label: "Upload PDF" },
        ]}
        actions={
          <Link to="/institute/questions">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        }
      />

      {renderStepIndicator()}
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">
          {currentStep === 1 && "Step 1: Classification"}
          {currentStep === 2 && "Step 2: Upload PDF"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {currentStep === 1 && "Set the default classification for extracted questions"}
          {currentStep === 2 && "Upload your PDF document"}
        </p>
      </div>

      {/* Step 1: Classification */}
      {currentStep === 1 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-5">
            {/* Course Selection */}
            <div className="space-y-3">
              <Label>Select Course *</Label>
              <div className="grid grid-cols-2 gap-3">
                {assignedTracks.map((track) => (
                  <div
                    key={track.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      selectedCourse === track.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                    onClick={() => handleCourseChange(track.id)}
                  >
                    <Checkbox checked={selectedCourse === track.id} />
                    <div>
                      <span className="font-medium">{track.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {track.hasClasses ? "Class-based curriculum" : "Competitive exam preparation"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCourse && (
              <>
                {/* Class - Only for CBSE */}
                {isCBSE && (
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setSelectedChapterId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select 
                    value={selectedSubjectId} 
                    onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(""); }}
                    disabled={isCBSE && !selectedClassId}
                  >
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapter (Optional) */}
                {selectedSubjectId && (isCBSE ? selectedClassId : true) && (
                  <div className="space-y-2">
                    <Label>Chapter (Optional)</Label>
                    <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                      <SelectTrigger><SelectValue placeholder="Auto-detect from PDF" /></SelectTrigger>
                      <SelectContent>
                        {availableChapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Leave empty to auto-detect chapters from PDF content</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className="bg-gradient-to-r from-primary to-primary/80 gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Upload PDF */}
      {currentStep === 2 && (
        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          <div
            className={cn(
              "bg-card rounded-2xl p-8 shadow-soft border-2 border-dashed transition-all duration-300",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border/50 hover:border-primary/50",
              uploadState === "uploading" && "pointer-events-none opacity-70"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors",
                dragActive ? "bg-primary/20" : "bg-muted"
              )}>
                {uploadState === "uploading" ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <Upload className={cn(
                    "w-8 h-8 transition-colors",
                    dragActive ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
              </div>

              {uploadState === "uploading" ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">Uploading...</h3>
                  <p className="text-muted-foreground">{fileName}</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    {dragActive ? "Drop your PDF here" : "Drag & Drop PDF"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    or click to browse files
                  </p>
                  
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload">
                    <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                      <span>
                        <FileText className="w-4 h-4" />
                        Browse Files
                      </span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-sm text-muted-foreground text-center mt-4">
            Supported: Competitive exam papers, previous year papers, or any question PDF.
          </p>

          {/* Important Note */}
          <div className="bg-primary/5 rounded-xl p-5 mt-6 border border-primary/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">How this works</p>
                <p className="text-sm text-muted-foreground">
                  Just upload the PDF. Questions, answers, solutions will be extracted automatically and tagged with your selected classification.
                </p>
                <p className="text-sm text-primary mt-2">
                  You will be notified once the questions are ready for review.
                </p>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-start mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;
