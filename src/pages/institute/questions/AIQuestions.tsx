import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Sparkles,
  Wand2,
  Lightbulb,
  Target,
  RefreshCw,
  Plus,
  Check,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/ui/page-header";
import { questionTypeLabels, QuestionType } from "@/data/questionsData";
import { assignedTracks } from "@/data/instituteData";
import { getChaptersByClassAndSubject, getTopicsByChapter } from "@/data/cbseMasterData";
import { getSubjectsForCourse, getChaptersForCourseBySubject, subjects as masterSubjects } from "@/data/masterData";
import { classes } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TypeConfigPanel, TypeConfig } from "@/components/questions/TypeConfigPanel";

const difficultyLevels = ["easy", "medium", "hard"];

const cognitiveTypes = [
  { id: "logical", label: "Logical" },
  { id: "analytical", label: "Analytical" },
  { id: "conceptual", label: "Conceptual" },
  { id: "numerical", label: "Numerical" },
  { id: "application", label: "Application" },
  { id: "memory", label: "Memory" },
];

const AIQuestions = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  // Course selection (CBSE or JEE Mains)
  const [selectedCourse, setSelectedCourse] = useState("");
  
  // Form state
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["mcq_single"]);
  const [difficultyMix, setDifficultyMix] = useState<string[]>(["medium"]);
  const [selectedCognitiveTypes, setSelectedCognitiveTypes] = useState<string[]>(["conceptual"]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [typeConfig, setTypeConfig] = useState<TypeConfig | null>(null);

  // Get the selected track details
  const selectedTrack = assignedTracks.find(t => t.id === selectedCourse);
  const isCBSE = selectedTrack?.hasClasses;

  // Get available subjects based on course type
  const availableSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    if (isCBSE) {
      // For CBSE, return standard subjects
      return masterSubjects;
    } else {
      // For JEE Mains, get subjects that have chapters in the course
      return getSubjectsForCourse(selectedCourse);
    }
  }, [selectedCourse, isCBSE]);

  // Get chapters based on course type
  const availableChapters = useMemo(() => {
    if (!selectedSubject) return [];
    if (isCBSE && selectedClass) {
      return getChaptersByClassAndSubject(selectedClass, selectedSubject);
    } else if (!isCBSE && selectedCourse) {
      return getChaptersForCourseBySubject(selectedCourse, selectedSubject);
    }
    return [];
  }, [selectedCourse, selectedClass, selectedSubject, isCBSE]);

  // Get topics for selected chapter
  const availableTopics = useMemo(() => {
    if (!selectedChapter) return [];
    return getTopicsByChapter(selectedChapter);
  }, [selectedChapter]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedChapter("");
    setSelectedTopic("");
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setSelectedTopic("");
  };

  const handleTypeToggle = (type: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleDifficultyToggle = (diff: string) => {
    setDifficultyMix((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const handleCognitiveToggle = (type: string) => {
    setSelectedCognitiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    if (isCBSE && !selectedClass) {
      toast.error("Please select a class");
      return;
    }
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error("Please select at least one question type");
      return;
    }
    if (difficultyMix.length === 0) {
      toast.error("Please select at least one difficulty level");
      return;
    }
    if (selectedCognitiveTypes.length === 0) {
      toast.error("Please select at least one cognitive type");
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const chapterName = availableChapters.find(c => c.id === selectedChapter)?.name || "selected chapter";
      const topicName = availableTopics.find(t => t.id === selectedTopic)?.name || "";
      
      const mockGenerated = Array.from({ length: questionCount }, (_, i) => ({
        id: `gen-${i + 1}`,
        type: selectedTypes[i % selectedTypes.length],
        difficulty: difficultyMix[i % difficultyMix.length],
        cognitiveType: selectedCognitiveTypes[i % selectedCognitiveTypes.length],
        questionText: `Generated question ${i + 1} about ${topicName || chapterName}...`,
        options: [
          { id: "a", text: "Option A", isCorrect: i % 4 === 0 },
          { id: "b", text: "Option B", isCorrect: i % 4 === 1 },
          { id: "c", text: "Option C", isCorrect: i % 4 === 2 },
          { id: "d", text: "Option D", isCorrect: i % 4 === 3 },
        ],
        selected: true,
      }));

      setGeneratedQuestions(mockGenerated);
      setIsGenerating(false);
      toast.success(`Generated ${questionCount} questions!`);
    }, 2000);
  };

  const toggleQuestionSelection = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleAddToBank = () => {
    const selected = generatedQuestions.filter((q) => q.selected);
    if (selected.length === 0) {
      toast.error("Please select at least one question");
      return;
    }
    toast.success(`Added ${selected.length} questions to your Question Bank!`);
    navigate("/institute/questions");
  };

  const selectedCount = generatedQuestions.filter((q) => q.selected).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Question Generator"
        description="Generate questions instantly using AI. Specify the course, topic, difficulty, and question types to create custom questions for your tests."
        actions={
          <Button variant="outline" onClick={() => navigate("/institute/questions")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Question Bank
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Generation Settings
              </CardTitle>
              <CardDescription>
                Configure what kind of questions you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Course Selection */}
              <div className="space-y-3">
                <Label>Select Course *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {assignedTracks.map((track) => (
                    <div
                      key={track.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                        selectedCourse === track.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                      onClick={() => handleCourseChange(track.id)}
                    >
                      <Checkbox checked={selectedCourse === track.id} />
                      <span className="font-medium">{track.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cascading Dropdowns */}
              {selectedCourse && (
                <div className="space-y-3">
                  {/* Class - Only for CBSE */}
                  {isCBSE && (
                    <div className="space-y-2">
                      <Label>Class *</Label>
                      <Select value={selectedClass} onValueChange={handleClassChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class..." />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select 
                      value={selectedSubject} 
                      onValueChange={handleSubjectChange}
                      disabled={isCBSE && !selectedClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chapter */}
                  {selectedSubject && (isCBSE ? selectedClass : true) && (
                    <div className="space-y-2">
                      <Label>Chapter</Label>
                      <Select value={selectedChapter} onValueChange={handleChapterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chapter..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableChapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Topic */}
                  {selectedChapter && availableTopics.length > 0 && (
                    <div className="space-y-2">
                      <Label>Topic (Optional)</Label>
                      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTopics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Question Types */}
              <div className="space-y-3">
                <Label>Question Types *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {(Object.entries(questionTypeLabels) as [QuestionType, string][])
                    .map(([type, label]) => (
                      <div
                        key={type}
                        className={cn(
                          "flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all text-xs sm:text-sm min-h-[44px]",
                          selectedTypes.includes(type)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                        onClick={() => handleTypeToggle(type)}
                      >
                        <Checkbox checked={selectedTypes.includes(type)} className="shrink-0" />
                        <span>{label}</span>
                      </div>
                    ))}
                </div>
                {selectedTypes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTypes.length} type(s) selected
                  </p>
                )}
              </div>

              {/* Custom Setup Panel */}
              {selectedTypes.length > 0 && (
                <TypeConfigPanel
                  selectedTypes={selectedTypes}
                  totalCount={questionCount}
                  onConfigChange={setTypeConfig}
                />
              )}

              {/* Question Count - hidden in custom mode */}
              {(!typeConfig || typeConfig.mode === "auto") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Number of Questions</Label>
                    <Badge variant="secondary">{questionCount}</Badge>
                  </div>
                  <Slider
                    value={[questionCount]}
                    onValueChange={([v]) => setQuestionCount(v)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>
              )}

              {/* Difficulty */}
              <div className="space-y-3">
                <Label>Difficulty Mix *</Label>
                <div className="flex gap-2">
                  {difficultyLevels.map((diff) => (
                    <Badge
                      key={diff}
                      variant={difficultyMix.includes(diff) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer capitalize flex-1 justify-center py-2",
                        difficultyMix.includes(diff) && diff === "easy" && "bg-emerald-500",
                        difficultyMix.includes(diff) && diff === "medium" && "bg-amber-500",
                        difficultyMix.includes(diff) && diff === "hard" && "bg-red-500"
                      )}
                      onClick={() => handleDifficultyToggle(diff)}
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cognitive Types */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <Label>Cognitive Types *</Label>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {cognitiveTypes.map((cog) => (
                    <div
                      key={cog.id}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all text-xs sm:text-sm min-h-[44px]",
                        selectedCognitiveTypes.includes(cog.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                      onClick={() => handleCognitiveToggle(cog.id)}
                    >
                      <Checkbox checked={selectedCognitiveTypes.includes(cog.id)} className="shrink-0" />
                      <span>{cog.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <Label>Additional Instructions (optional)</Label>
                <Textarea
                  placeholder="e.g., Focus on numerical problems, include diagrams..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Questions Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Generated Questions
                  </CardTitle>
                  <CardDescription>
                    Review and select questions to add to your bank
                  </CardDescription>
                </div>
                {generatedQuestions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {selectedCount} / {generatedQuestions.length} selected
                    </Badge>
                    <Button onClick={handleAddToBank} disabled={selectedCount === 0} size="sm" className="sm:size-default">
                      <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Add to Bank</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No questions generated yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Configure your settings on the left and click "Generate Questions" to create AI-powered questions for your tests.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer",
                        q.selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                      onClick={() => toggleQuestionSelection(q.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                            q.selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground"
                          )}
                        >
                          {q.selected && <Check className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              Q{index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {questionTypeLabels[q.type as QuestionType]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs capitalize",
                                q.difficulty === "easy" && "text-emerald-600 border-emerald-300",
                                q.difficulty === "medium" && "text-amber-600 border-amber-300",
                                q.difficulty === "hard" && "text-red-600 border-red-300"
                              )}
                            >
                              {q.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize text-purple-600 border-purple-300">
                              {q.cognitiveType}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{q.questionText}</p>
                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                              {q.options.map((opt: any, i: number) => (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    "p-2 rounded text-xs border",
                                    opt.isCorrect
                                      ? "bg-success/10 border-success/30 text-success"
                                      : "bg-muted/30"
                                  )}
                                >
                                  {String.fromCharCode(65 + i)}. {opt.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIQuestions;
