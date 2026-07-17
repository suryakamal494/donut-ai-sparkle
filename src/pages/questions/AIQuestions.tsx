import { useState } from "react";
import { Sparkles, Wand2, ArrowLeft, Info, Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { questionTypeLabels, QuestionType } from "@/data/questionsData";
import { toast } from "sonner";
import { SourceTypeSelector } from "@/components/parameters";
import { ContentSourceType } from "@/components/parameters/SourceTypeSelector";
import { getActiveCurriculums, getPublishedCourses, getAllCourseChapters } from "@/data/masterData";
import { getChaptersByClassAndSubject, getTopicsByChapter } from "@/data/cbseMasterData";
import { classes, subjects } from "@/data/mockData";
import { TypeConfigPanel, TypeConfig } from "@/components/questions/TypeConfigPanel";
import { cn } from "@/lib/utils";

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
  
  // Source type state
  const [sourceType, setSourceType] = useState<ContentSourceType>('curriculum');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Question generation state
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["mcq_single"]);
  const [difficultyMix, setDifficultyMix] = useState<string[]>(["medium"]);
  const [selectedCognitiveTypes, setSelectedCognitiveTypes] = useState<string[]>(["conceptual"]);
  const [questionCount, setQuestionCount] = useState("10");
  const [instructions, setInstructions] = useState("");
  const [typeConfig, setTypeConfig] = useState<TypeConfig | null>(null);

  const activeCurriculums = getActiveCurriculums();
  const publishedCourses = getPublishedCourses();

  // Get chapters based on source type
  const availableChapters = sourceType === 'curriculum' && selectedClassId && selectedSubjectId
    ? getChaptersByClassAndSubject(selectedClassId, selectedSubjectId)
    : sourceType === 'course' && selectedCourseId
      ? getAllCourseChapters(selectedCourseId)
      : [];

  // Get topics for selected chapter
  const availableTopics = selectedChapterId ? getTopicsByChapter(selectedChapterId) : [];

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSourceTypeChange = (type: ContentSourceType) => {
    setSourceType(type);
    setSelectedCurriculumId("");
    setSelectedCourseId("");
    setSelectedClassId("");
    setSelectedSubjectId("");
    setSelectedChapterId("");
    setSelectedTopicIds([]);
  };

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
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
    if (sourceType === 'curriculum' && (!selectedClassId || !selectedSubjectId)) {
      toast.error("Please select class and subject");
      return;
    }
    if (sourceType === 'course' && !selectedCourseId) {
      toast.error("Please select a course");
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
      setIsGenerating(false);
      toast.success("Questions generated successfully!");
      navigate("/superadmin/questions/review");
    }, 2500);
  };

  const allQuestionTypes: QuestionType[] = [
    "mcq_single",
    "mcq_multiple",
    "numerical",
    "assertion_reasoning",
    "paragraph",
    "matrix_match",
    "fill_blanks",
    "true_false",
    "short_answer",
    "long_answer",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Generate Questions with AI"
        description="Automatically generate questions with answers and detailed solutions."
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Question Bank", href: "/superadmin/questions" },
          { label: "AI Generator" },
        ]}
        actions={
          <Link to="/superadmin/questions">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl gradient-button flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">AI Question Generator</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Configure parameters and let AI create questions
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 sm:space-y-5">
              {/* Question Types */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm">Question Types <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                  {allQuestionTypes.map((type) => (
                    <div
                      key={type}
                      className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
                        selectedTypes.includes(type)
                          ? "bg-primary/5 border-primary/30"
                          : "bg-muted/30 border-border/50 hover:border-primary/20"
                      }`}
                      onClick={() => toggleQuestionType(type)}
                    >
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleQuestionType(type)}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      />
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {questionTypeLabels[type]}
                      </span>
                    </div>
                  ))}
                </div>
                {selectedTypes.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedTypes.length} type(s) selected
                  </p>
                )}
              </div>

              {/* Custom Setup Panel */}
              {selectedTypes.length > 0 && (
                <TypeConfigPanel
                  selectedTypes={selectedTypes}
                  totalCount={parseInt(questionCount) || 10}
                  onConfigChange={setTypeConfig}
                />
              )}

              {/* Difficulty Mix (multi-select badges) */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm">Difficulty Mix <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  {difficultyLevels.map((diff) => (
                    <Badge
                      key={diff}
                      variant={difficultyMix.includes(diff) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer capitalize flex-1 justify-center py-2 text-xs sm:text-sm",
                        difficultyMix.includes(diff) && diff === "easy" && "bg-emerald-500 hover:bg-emerald-600",
                        difficultyMix.includes(diff) && diff === "medium" && "bg-amber-500 hover:bg-amber-600",
                        difficultyMix.includes(diff) && diff === "hard" && "bg-red-500 hover:bg-red-600"
                      )}
                      onClick={() => handleDifficultyToggle(diff)}
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cognitive Types */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <Label className="text-sm">Cognitive Types <span className="text-destructive">*</span></Label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {cognitiveTypes.map((cog) => (
                    <div
                      key={cog.id}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all text-xs sm:text-sm",
                        selectedCognitiveTypes.includes(cog.id)
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-primary/20"
                      )}
                      onClick={() => handleCognitiveToggle(cog.id)}
                    >
                      <Checkbox
                        checked={selectedCognitiveTypes.includes(cog.id)}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      />
                      <span>{cog.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Number of Questions (only shown in auto mode) */}
              {(!typeConfig || typeConfig.mode === "auto") && (
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                  />
                </div>
              )}

              {/* Additional Instructions */}
              <div className="space-y-2">
                <Label>Additional Instructions (Optional)</Label>
                <Textarea
                  placeholder="e.g., Focus on numerical problems, include diagram-based questions, avoid repeated concepts..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Info Box */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">How this works</p>
                    <p className="text-sm text-muted-foreground">
                      Questions will be automatically generated with answers and detailed solutions.
                      You can review and edit them before adding to the Question Bank.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Link to="/superadmin/questions">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gradient-button gap-2 min-w-[180px]"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Classification & Visibility */}
          <div className="space-y-4 sm:space-y-6">
            {/* Classification */}
            <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Classification</h3>
              <div className="space-y-3 sm:space-y-4">
                <SourceTypeSelector 
                  value={sourceType} 
                  onChange={handleSourceTypeChange} 
                />

                {sourceType === 'curriculum' ? (
                  <>
                    <div className="space-y-2">
                      <Label>Curriculum *</Label>
                      <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId}>
                        <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                        <SelectContent>
                          {activeCurriculums.map((curr) => (
                            <SelectItem key={curr.id} value={curr.id}>{curr.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Class *</Label>
                      <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setSelectedChapterId(""); setSelectedTopicIds([]); }}>
                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(""); setSelectedTopicIds([]); }}>
                        <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                        <SelectContent>
                          {subjects.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Chapter</Label>
                      <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setSelectedTopicIds([]); }}>
                        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>
                          {availableChapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {availableTopics.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center justify-between">
                          <span>Topics (Optional)</span>
                          {selectedTopicIds.length > 0 && (
                            <span className="text-xs text-primary font-medium">{selectedTopicIds.length} selected</span>
                          )}
                        </Label>
                        <div className="border rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                          {availableTopics.map((topic) => (
                            <div
                              key={topic.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                selectedTopicIds.includes(topic.id)
                                  ? "bg-primary/10 border-primary/30"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => toggleTopicSelection(topic.id)}
                            >
                              <Checkbox
                                checked={selectedTopicIds.includes(topic.id)}
                                onCheckedChange={() => toggleTopicSelection(topic.id)}
                                className="h-4 w-4"
                              />
                              <span className="text-sm truncate">{topic.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Course *</Label>
                      <Select value={selectedCourseId} onValueChange={(v) => { setSelectedCourseId(v); setSelectedChapterId(""); }}>
                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                        <SelectContent>
                          {publishedCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Chapter</Label>
                      <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setSelectedTopicIds([]); }}>
                        <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                        <SelectContent>
                          {availableChapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.name}
                              {'sourceLabel' in ch && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({ch.sourceLabel})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuestions;
