import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SourceTypeSelector } from "@/components/parameters";
import { ContentSourceType } from "@/components/parameters/SourceTypeSelector";
import { getActiveCurriculums, getPublishedCourses, getAllCourseChapters } from "@/data/masterData";
import { classes, subjects } from "@/data/ritx/mockData";
import { getChaptersByClassAndSubject, getTopicsByChapter } from "@/data/cbseMasterData";
import { countBlanks } from "@/lib/parseUtils";
import {
  cognitiveTypes,
  questionTypes,
  assertionReasoningOptions,
} from "./createQuestion.constants";
import type { SubQuestion } from "./createQuestion.types";

const CreateQuestion = () => {
  const [questionType, setQuestionType] = useState("mcq");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<"true" | "false" | "">("");
  
  // Assertion-Reasoning state
  const [assertion, setAssertion] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [assertionAnswer, setAssertionAnswer] = useState("");
  
  // Fill in Blanks state
  const [fillQuestion, setFillQuestion] = useState("");
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);
  
  // Paragraph-based state
  const [passage, setPassage] = useState("");
  const [subQuestionCount, setSubQuestionCount] = useState(2);
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '' },
    { type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '' },
  ]);
  const [currentSubQuestion, setCurrentSubQuestion] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Source & Visibility state
  const [sourceType, setSourceType] = useState<ContentSourceType>('curriculum');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCognitiveType, setSelectedCognitiveType] = useState("");

  const activeCurriculums = getActiveCurriculums();
  const publishedCourses = getPublishedCourses();

  // Get chapters based on source type - now includes ALL course chapters (owned + mapped)
  const availableChapters = sourceType === 'curriculum' && selectedClassId && selectedSubjectId
    ? getChaptersByClassAndSubject(selectedClassId, selectedSubjectId)
    : sourceType === 'course' && selectedCourseId
      ? getAllCourseChapters(selectedCourseId)
      : [];

  // Get topics based on selected chapter
  const availableTopics = selectedChapterId ? getTopicsByChapter(selectedChapterId) : [];

  // Handle fill in blanks question text change
  const handleFillQuestionChange = (text: string) => {
    setFillQuestion(text);
    const blankCount = countBlanks(text);
    // Resize answers array to match blank count
    setBlankAnswers(prev => {
      const newAnswers = [...prev];
      while (newAnswers.length < blankCount) newAnswers.push("");
      return newAnswers.slice(0, blankCount);
    });
  };

  // Handle sub-question count change for paragraph type
  const handleSubQuestionCountChange = (count: number) => {
    setSubQuestionCount(count);
    setSubQuestions(prev => {
      const newQuestions = [...prev];
      while (newQuestions.length < count) {
        newQuestions.push({ type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '' });
      }
      return newQuestions.slice(0, count);
    });
    if (currentSubQuestion >= count) {
      setCurrentSubQuestion(count - 1);
    }
  };

  // Update a specific sub-question
  const updateSubQuestion = (index: number, updates: Partial<SubQuestion>) => {
    setSubQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], ...updates };
      return newQuestions;
    });
  };

  const handleSubmit = () => {
    toast({ title: "Question Created!", description: "Question has been added to the bank." });
    navigate("/superadmin/questions");
  };

  const handleSourceTypeChange = (type: ContentSourceType) => {
    setSourceType(type);
    // Reset selections when switching
    setSelectedCurriculumId("");
    setSelectedCourseId("");
    setSelectedClassId("");
    setSelectedSubjectId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create Question"
        description="Add a new question to the question bank"
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Questions", href: "/superadmin/questions" },
          { label: "Create" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Question Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Question Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setQuestionType(type.id)}
                      className={cn(
                        "p-2 sm:p-3 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-medium transition-all",
                        questionType === type.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Hide Question Text for fill and paragraph types */}
              {questionType !== "fill" && questionType !== "paragraph" && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm">Question Text</Label>
                  <Textarea placeholder="Enter your question..." className="min-h-24 sm:min-h-32 text-sm" />
                </div>
              )}
              {(questionType === "mcq" || questionType === "multiple") && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm">Options</Label>
                  {options.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-xs sm:text-sm font-medium shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Input placeholder={`Option ${index + 1}`} className="flex-1 h-9 text-sm" />
                      <input type={questionType === "multiple" ? "checkbox" : "radio"} name="correct" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  ))}
                </div>
              )}
              {questionType === "numerical" && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm">Correct Answer</Label>
                  <Input type="number" placeholder="Enter numerical answer" className="h-9 text-sm" />
                </div>
              )}
              {questionType === "truefalse" && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm">Correct Answer</Label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="truefalse" 
                        value="true"
                        checked={trueFalseAnswer === "true"}
                        onChange={(e) => setTrueFalseAnswer(e.target.value as "true" | "false")}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-primary" 
                      />
                      <span className="text-sm font-medium">True</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="truefalse" 
                        value="false"
                        checked={trueFalseAnswer === "false"}
                        onChange={(e) => setTrueFalseAnswer(e.target.value as "true" | "false")}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-primary" 
                      />
                      <span className="text-sm font-medium">False</span>
                    </label>
                  </div>
                </div>
              )}
              {questionType === "assertion" && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Assertion (Statement 1)</Label>
                    <Textarea 
                      placeholder="Enter the assertion statement..."
                      value={assertion}
                      onChange={(e) => setAssertion(e.target.value)}
                      className="min-h-20 text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Reason (Statement 2)</Label>
                    <Textarea 
                      placeholder="Enter the reasoning statement..."
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                      className="min-h-20 text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Correct Answer</Label>
                    <div className="space-y-2">
                      {assertionReasoningOptions.map((opt) => (
                        <label 
                          key={opt.id} 
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                            assertionAnswer === opt.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <input 
                            type="radio"
                            name="assertion-answer"
                            value={opt.id}
                            checked={assertionAnswer === opt.id}
                            onChange={(e) => setAssertionAnswer(e.target.value)}
                            className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                          />
                          <span className="text-xs sm:text-sm leading-snug">
                            <strong className="mr-1">({opt.id})</strong>
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {questionType === "fill" && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Question with Blanks</Label>
                    <p className="text-xs text-muted-foreground">Use ___ (3+ underscores), [blank], or {"{blank}"} to mark blanks</p>
                    <Textarea 
                      placeholder="The capital of France is ____ and it is located in ____."
                      value={fillQuestion}
                      onChange={(e) => handleFillQuestionChange(e.target.value)}
                      className="min-h-24 text-sm" 
                    />
                  </div>
                  {countBlanks(fillQuestion) > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Answers ({countBlanks(fillQuestion)} blank{countBlanks(fillQuestion) > 1 ? 's' : ''} detected)</Label>
                      <div className="space-y-2">
                        {blankAnswers.map((answer, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                              {index + 1}
                            </span>
                            <Input
                              placeholder={`Answer for blank ${index + 1}`}
                              value={answer}
                              onChange={(e) => {
                                const newAnswers = [...blankAnswers];
                                newAnswers[index] = e.target.value;
                                setBlankAnswers(newAnswers);
                              }}
                              className="flex-1 h-9 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {questionType === "paragraph" && (
                <div className="space-y-4">
                  {/* Passage */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Passage / Paragraph</Label>
                    <Textarea 
                      placeholder="Enter the passage or paragraph that the questions will be based on..."
                      value={passage}
                      onChange={(e) => setPassage(e.target.value)}
                      className="min-h-32 text-sm" 
                    />
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Number of Questions</Label>
                    <Select 
                      value={subQuestionCount.toString()} 
                      onValueChange={(v) => handleSubQuestionCountChange(parseInt(v))}
                    >
                      <SelectTrigger className="h-9 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} Question{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sub-Question Navigation */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {subQuestions.map((_, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={currentSubQuestion === index ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0",
                          currentSubQuestion === index && "gradient-button"
                        )}
                        onClick={() => setCurrentSubQuestion(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  {/* Current Sub-Question Editor */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Question {currentSubQuestion + 1}</h4>
                      <Select 
                        value={subQuestions[currentSubQuestion]?.type || 'mcq'}
                        onValueChange={(v) => updateSubQuestion(currentSubQuestion, { type: v as SubQuestion['type'] })}
                      >
                        <SelectTrigger className="h-8 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">MCQ (Single)</SelectItem>
                          <SelectItem value="multiple">Multiple Correct</SelectItem>
                          <SelectItem value="numerical">Numerical</SelectItem>
                          <SelectItem value="fill">Fill in Blanks</SelectItem>
                          <SelectItem value="truefalse">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Question Text</Label>
                      <Textarea
                        placeholder="Enter question text..."
                        value={subQuestions[currentSubQuestion]?.text || ''}
                        onChange={(e) => updateSubQuestion(currentSubQuestion, { text: e.target.value })}
                        className="min-h-16 text-sm"
                      />
                    </div>

                    {(subQuestions[currentSubQuestion]?.type === 'mcq' || subQuestions[currentSubQuestion]?.type === 'multiple') && (
                      <div className="space-y-2">
                        <Label className="text-xs">Options</Label>
                        {subQuestions[currentSubQuestion]?.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-background flex items-center justify-center text-xs font-medium shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...(subQuestions[currentSubQuestion]?.options || [])];
                                newOptions[optIndex] = e.target.value;
                                updateSubQuestion(currentSubQuestion, { options: newOptions });
                              }}
                              className="flex-1 h-8 text-sm"
                            />
                            <input 
                              type={subQuestions[currentSubQuestion]?.type === 'multiple' ? 'checkbox' : 'radio'}
                              name={`sub-q-${currentSubQuestion}`}
                              className="w-4 h-4"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {subQuestions[currentSubQuestion]?.type === 'numerical' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Correct Answer</Label>
                        <Input
                          type="number"
                          placeholder="Enter numerical answer"
                          value={subQuestions[currentSubQuestion]?.correctAnswer || ''}
                          onChange={(e) => updateSubQuestion(currentSubQuestion, { correctAnswer: e.target.value })}
                          className="h-8 text-sm w-40"
                        />
                      </div>
                    )}

                    {subQuestions[currentSubQuestion]?.type === 'fill' && (
                      <div className="space-y-2">
                        <Label className="text-xs">Question with Blanks</Label>
                        <p className="text-[10px] text-muted-foreground">Use ___ (3+ underscores) to mark blanks</p>
                        <Textarea
                          placeholder="The capital of France is ____ ."
                          value={subQuestions[currentSubQuestion]?.text || ''}
                          onChange={(e) => {
                            const text = e.target.value;
                            const blankCount = countBlanks(text);
                            const currentBlankAnswers = subQuestions[currentSubQuestion]?.blankAnswers || [];
                            const newBlankAnswers = [...currentBlankAnswers];
                            while (newBlankAnswers.length < blankCount) newBlankAnswers.push("");
                            updateSubQuestion(currentSubQuestion, { 
                              text, 
                              blankAnswers: newBlankAnswers.slice(0, blankCount) 
                            });
                          }}
                          className="min-h-16 text-sm"
                        />
                        {countBlanks(subQuestions[currentSubQuestion]?.text || '') > 0 && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Answers ({countBlanks(subQuestions[currentSubQuestion]?.text || '')} blank(s))</Label>
                            {(subQuestions[currentSubQuestion]?.blankAnswers || []).map((ans, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-background flex items-center justify-center text-xs font-medium shrink-0">
                                  {idx + 1}
                                </span>
                                <Input
                                  placeholder={`Answer ${idx + 1}`}
                                  value={ans}
                                  onChange={(e) => {
                                    const newAnswers = [...(subQuestions[currentSubQuestion]?.blankAnswers || [])];
                                    newAnswers[idx] = e.target.value;
                                    updateSubQuestion(currentSubQuestion, { blankAnswers: newAnswers });
                                  }}
                                  className="flex-1 h-7 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {subQuestions[currentSubQuestion]?.type === 'truefalse' && (
                      <div className="space-y-2">
                        <Label className="text-xs">Correct Answer</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`sub-tf-${currentSubQuestion}`}
                              value="true"
                              checked={subQuestions[currentSubQuestion]?.correctAnswer === "true"}
                              onChange={(e) => updateSubQuestion(currentSubQuestion, { correctAnswer: e.target.value })}
                              className="w-4 h-4 accent-primary" 
                            />
                            <span className="text-sm font-medium">True</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`sub-tf-${currentSubQuestion}`}
                              value="false"
                              checked={subQuestions[currentSubQuestion]?.correctAnswer === "false"}
                              onChange={(e) => updateSubQuestion(currentSubQuestion, { correctAnswer: e.target.value })}
                              className="w-4 h-4 accent-primary" 
                            />
                            <span className="text-sm font-medium">False</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSubQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentSubQuestion === 0}
                    >
                      ← Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSubQuestion(prev => Math.min(subQuestions.length - 1, prev + 1))}
                      disabled={currentSubQuestion === subQuestions.length - 1}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Solution (Optional)</Label>
                <Textarea placeholder="Explain the solution..." className="min-h-20 sm:min-h-24 text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Hint (Optional)</Label>
                <Input placeholder="Provide a hint for students" className="h-9 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Source Type & Classification */}
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
                    <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setSelectedChapterId(""); }}>
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
                    <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Course *</Label>
                    <Select value={selectedCourseId} onValueChange={(v) => { setSelectedCourseId(v); setSelectedChapterId(""); setSelectedTopicId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>
                        {publishedCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Marking</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Marks</Label>
                <Input type="number" defaultValue="4" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Negative Marks</Label>
                <Input type="number" defaultValue="1" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <Button className="w-full gradient-button text-sm" onClick={handleSubmit}>Save Question</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
