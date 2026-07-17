import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { assignedTracks } from "@/data/instituteData";
import { getChaptersByClassAndSubject, getTopicsByChapter } from "@/data/cbseMasterData";
import { getSubjectsForCourse, getChaptersForCourseBySubject, subjects as masterSubjects } from "@/data/masterData";
import { classes } from "@/data/mockData";
import { mockQuestions } from "@/data/questionsData";

const questionTypes = [
  { id: "mcq", label: "MCQ (Single)" },
  { id: "multiple", label: "Multiple Correct" },
  { id: "numerical", label: "Numerical" },
  { id: "assertion", label: "Assertion-Reasoning" },
  { id: "fill", label: "Fill in Blanks" },
  { id: "short", label: "Short Answer" },
  { id: "long", label: "Long Answer" },
];

const cognitiveTypes = [
  { id: "logical", label: "Logical" },
  { id: "analytical", label: "Analytical" },
  { id: "conceptual", label: "Conceptual" },
  { id: "numerical", label: "Numerical" },
  { id: "application", label: "Application" },
  { id: "memory", label: "Memory" },
];

const CreateQuestion = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const isEditMode = !!questionId;

  // Find existing question if in edit mode
  const existingQuestion = useMemo(() => {
    if (!questionId) return null;
    return mockQuestions.find(q => q.id === questionId) || null;
  }, [questionId]);

  const [questionType, setQuestionType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [solution, setSolution] = useState("");
  const [hint, setHint] = useState("");
  const [marks, setMarks] = useState("4");
  const [negativeMarks, setNegativeMarks] = useState("1");

  // Course selection
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCognitiveType, setSelectedCognitiveType] = useState("");

  // Pre-populate form if editing
  useEffect(() => {
    if (existingQuestion) {
      // Map question type
      const typeMap: Record<string, string> = {
        mcq_single: "mcq",
        mcq_multiple: "multiple",
        numerical: "numerical",
        assertion_reasoning: "assertion",
        fill_blanks: "fill",
        short_answer: "short",
        long_answer: "long",
      };
      setQuestionType(typeMap[existingQuestion.type] || "mcq");
      setQuestionText(existingQuestion.questionText);
      setSolution(existingQuestion.solution);
      setMarks(existingQuestion.marks.toString());
      setNegativeMarks(existingQuestion.negativeMarks.toString());
      setSelectedDifficulty(existingQuestion.difficulty);
      setSelectedSubjectId(existingQuestion.subjectId);
      setSelectedClassId(existingQuestion.classId);
      
      if (existingQuestion.options) {
        setOptions(existingQuestion.options.map(o => o.text));
      }
      
      // Default to CBSE for existing questions (simplified)
      setSelectedCourse("cbse");
    }
  }, [existingQuestion]);

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

  // Get topics based on selected chapter
  const availableTopics = useMemo(() => {
    if (!selectedChapterId) return [];
    return getTopicsByChapter(selectedChapterId);
  }, [selectedChapterId]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedClassId("");
    setSelectedSubjectId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
  };

  const handleSubmit = () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    if (isCBSE && !selectedClassId) {
      toast.error("Please select a class");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }
    
    if (isEditMode) {
      toast.success("Question Updated! Changes have been saved.");
    } else {
      toast.success("Question Created! Question has been added to the bank.");
    }
    navigate("/institute/questions");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEditMode ? "Edit Question" : "Create Question"}
        description={isEditMode ? "Update the question details" : "Add a new question to your institute's question bank"}
        breadcrumbs={[
          { label: "Dashboard", href: "/institute/dashboard" },
          { label: "Questions", href: "/institute/questions" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Question Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setQuestionType(type.id)}
                      className={cn(
                        "p-2 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all",
                        questionType === type.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Question Text *</Label>
                <Textarea 
                  placeholder="Enter your question..." 
                  className="min-h-32" 
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>
              {(questionType === "mcq" || questionType === "multiple") && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-xs sm:text-sm font-medium shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Input 
                        placeholder={`Option ${index + 1}`} 
                        className="flex-1" 
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                      <input type={questionType === "multiple" ? "checkbox" : "radio"} name="correct" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  ))}
                </div>
              )}
              {questionType === "numerical" && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Input type="number" placeholder="Enter numerical answer" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Solution (Optional)</Label>
                <Textarea 
                  placeholder="Explain the solution..." 
                  className="min-h-24" 
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hint (Optional)</Label>
                <Input 
                  placeholder="Provide a hint for students" 
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classification */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Classification</h3>
            <div className="space-y-4">
              {/* Course Selection */}
              <div className="space-y-3">
                <Label>Select Course *</Label>
                <div className="space-y-2">
                  {assignedTracks.map((track) => (
                    <div
                      key={track.id}
                      className={cn(
                        "flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all",
                        selectedCourse === track.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                      onClick={() => handleCourseChange(track.id)}
                    >
                      <Checkbox checked={selectedCourse === track.id} />
                      <span className="font-medium text-sm">{track.name}</span>
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

                  {/* Chapter */}
                  {selectedSubjectId && (isCBSE ? selectedClassId : true) && (
                    <div className="space-y-2">
                      <Label>Chapter *</Label>
                      <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setSelectedTopicId(""); }}>
                        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>
                          {availableChapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Topic */}
                  {selectedChapterId && (
                    <div className="space-y-2">
                      <Label>Topic *</Label>
                      <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                        <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                        <SelectContent>
                          {availableTopics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cognitive Type</Label>
                <Select value={selectedCognitiveType} onValueChange={setSelectedCognitiveType}>
                  <SelectTrigger><SelectValue placeholder="Select cognitive type" /></SelectTrigger>
                  <SelectContent>
                    {cognitiveTypes.map((cog) => (
                      <SelectItem key={cog.id} value={cog.id}>{cog.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Marking */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Marking</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input 
                  type="number" 
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Negative Marks</Label>
                <Input 
                  type="number" 
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-primary to-primary/80" onClick={handleSubmit}>
            {isEditMode ? "Save Changes" : "Save Question"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
