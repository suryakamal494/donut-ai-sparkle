import { useState, useMemo } from "react";
import { 
  Sparkles, 
  Search,
  Loader2,
  Check,
  CircleDot,
  CheckSquare,
  Calculator,
  Scale,
  FileText,
  Grid3X3,
  Filter,
  X,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { type LessonPlanBlock } from "./types";
import { 
  mockQuestions, 
  type Question, 
  type QuestionType,
  type QuestionDifficulty,
  type CognitiveType,
  difficultyConfig,
  questionTypeLabels,
  cognitiveTypeConfig,
} from "@/data/questionsData";
import {
  generateMockAiQuestions,
  regenerateMockQuestion,
  getTopicsForChapter,
  type AiGenerationConfig,
} from "@/data/aiQuestionMock";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (block: Omit<LessonPlanBlock, 'id'>) => void;
  chapter?: string;
  subject?: string;
}

// Question type icon mapping
const getQuestionTypeIcon = (type: QuestionType) => {
  switch (type) {
    case 'mcq_single': return CircleDot;
    case 'mcq_multiple': return CheckSquare;
    case 'numerical': return Calculator;
    case 'assertion_reasoning': return Scale;
    case 'paragraph': return FileText;
    case 'matrix_match': return Grid3X3;
    default: return CircleDot;
  }
};

// Question card component
const QuestionItem = ({ 
  question, 
  isSelected, 
  onToggle 
}: { 
  question: Question; 
  isSelected: boolean;
  onToggle: () => void;
}) => {
  const TypeIcon = getQuestionTypeIcon(question.type);
  const difficulty = difficultyConfig[question.difficulty];
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isSelected 
          ? "bg-primary/5 border-primary/30" 
          : "bg-background border-border/50 hover:border-primary/20"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isSelected} 
          className="mt-1 shrink-0"
          onCheckedChange={onToggle}
        />
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              {question.questionId}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 gap-1">
              <TypeIcon className="w-3 h-3" />
              {questionTypeLabels[question.type].replace('MCQ ', '').slice(0, 10)}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("text-[10px] px-1.5 py-0.5 h-5", difficulty.className)}
            >
              {difficulty.label}
            </Badge>
          </div>
          
          {/* Question text */}
          <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
            {question.questionText}
          </p>
          
          {/* Options preview for MCQ */}
          {question.options && question.options.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {question.options.slice(0, 4).map((opt, i) => (
                <span 
                  key={opt.id} 
                  className={cn(
                    "text-xs",
                    opt.isCorrect ? "text-success font-medium" : "text-muted-foreground"
                  )}
                >
                  {String.fromCharCode(65 + i)}. {opt.text.slice(0, 20)}{opt.text.length > 20 ? '...' : ''}
                  {opt.isCorrect && ' ✓'}
                </span>
              ))}
            </div>
          )}
          
          {/* Chapter tag */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {question.subject} › {question.chapter}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuizDialog = ({ 
  open, 
  onOpenChange, 
  onAddBlock,
  chapter,
  subject,
}: QuizDialogProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'bank' | 'ai'>('bank');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  
  // AI generate state
  const [aiStep, setAiStep] = useState<'configure' | 'generating' | 'review'>('configure');
  const [aiPrompt, setAiPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [aiTopics, setAiTopics] = useState<string[]>([]);
  const [aiCognitive, setAiCognitive] = useState<CognitiveType[]>(['conceptual']);
  const [aiQType, setAiQType] = useState<QuestionType>('mcq_single');
  const [aiDiffMix, setAiDiffMix] = useState<Record<QuestionDifficulty, number>>({
    easy: 2, medium: 2, hard: 1,
  });
  const [topicDraft, setTopicDraft] = useState('');
  const [aiResults, setAiResults] = useState<Question[]>([]);
  const [aiSelected, setAiSelected] = useState<Set<string>>(new Set());
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  
  // Filter questions
  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter(q => {
      const matchesSearch = searchQuery === '' || 
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.questionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || q.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      
      // If subject/chapter context is provided, prioritize those
      const matchesContext = !subject || q.subject.toLowerCase() === subject.toLowerCase();
      
      return matchesSearch && matchesType && matchesDifficulty && matchesContext;
    });
  }, [searchQuery, selectedType, selectedDifficulty, subject]);

  // Topic suggestions from the question bank for the current chapter/subject
  const topicSuggestions = useMemo(
    () => getTopicsForChapter(chapter, subject).slice(0, 12),
    [chapter, subject],
  );

  const totalMix = aiDiffMix.easy + aiDiffMix.medium + aiDiffMix.hard;

  // Keep difficulty mix in sync with the slider count
  const setCount = (next: number) => {
    setQuestionCount(next);
    const current = aiDiffMix.easy + aiDiffMix.medium + aiDiffMix.hard;
    if (current === next) return;
    if (current === 0) {
      setAiDiffMix({ easy: 0, medium: next, hard: 0 });
      return;
    }
    // Scale proportionally then fix rounding into medium
    const scale = next / current;
    const e = Math.round(aiDiffMix.easy * scale);
    const h = Math.round(aiDiffMix.hard * scale);
    const m = Math.max(0, next - e - h);
    setAiDiffMix({ easy: e, medium: m, hard: h });
  };

  const updateMix = (key: QuestionDifficulty, value: number) => {
    const clamped = Math.max(0, Math.min(questionCount, value));
    const others = (["easy", "medium", "hard"] as QuestionDifficulty[]).filter(k => k !== key);
    const remaining = questionCount - clamped;
    const othersSum = others.reduce((a, k) => a + aiDiffMix[k], 0);
    const next: Record<QuestionDifficulty, number> = { ...aiDiffMix, [key]: clamped };
    if (othersSum === 0) {
      next[others[0]] = remaining;
      next[others[1]] = 0;
    } else {
      const r0 = Math.round((aiDiffMix[others[0]] / othersSum) * remaining);
      next[others[0]] = Math.max(0, Math.min(remaining, r0));
      next[others[1]] = Math.max(0, remaining - next[others[0]]);
    }
    setAiDiffMix(next);
  };

  const toggleTopic = (t: string) => {
    setAiTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };
  const addTopicDraft = () => {
    const t = topicDraft.trim();
    if (!t) return;
    if (!aiTopics.includes(t)) setAiTopics(prev => [...prev, t]);
    setTopicDraft('');
  };
  const toggleCognitive = (c: CognitiveType) => {
    setAiCognitive(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const buildAiConfig = (): AiGenerationConfig => ({
    subject, chapter,
    topics: aiTopics,
    cognitiveTypes: aiCognitive,
    questionType: aiQType,
    difficultyMix: aiDiffMix,
    count: questionCount,
    prompt: aiPrompt,
  });

  const runGenerate = async () => {
    setAiStep('generating');
    await new Promise(r => setTimeout(r, 1400));
    const results = generateMockAiQuestions(buildAiConfig());
    setAiResults(results);
    setAiSelected(new Set(results.map(r => r.id)));
    setAiStep('review');
  };

  const regenerateOne = async (q: Question, index: number) => {
    setRegeneratingId(q.id);
    await new Promise(r => setTimeout(r, 700));
    const replacement = regenerateMockQuestion(buildAiConfig(), index, q);
    setAiResults(prev => prev.map((x, i) => i === index ? replacement : x));
    setAiSelected(prev => {
      const next = new Set(prev);
      if (next.delete(q.id)) next.add(replacement.id);
      return next;
    });
    setRegeneratingId(null);
  };

  const regenerateAll = async () => {
    setAiStep('generating');
    await new Promise(r => setTimeout(r, 1200));
    const results = generateMockAiQuestions(buildAiConfig());
    setAiResults(results);
    setAiSelected(new Set(results.map(r => r.id)));
    setAiStep('review');
  };

  const deleteOne = (id: string) => {
    setAiResults(prev => prev.filter(q => q.id !== id));
    setAiSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleAiSelect = (id: string) => {
    setAiSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const resetAiFlow = () => {
    setAiStep('configure');
    setAiResults([]);
    setAiSelected(new Set());
  };

  const configValid = aiTopics.length > 0 && aiCognitive.length > 0 && questionCount > 0;
  
  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };
  
  const handleAddSelected = () => {
    if (selectedQuestions.size === 0) return;
    
    onAddBlock({
      type: 'quiz',
      title: `Quiz: ${selectedQuestions.size} Questions`,
      source: 'library',
      questions: Array.from(selectedQuestions),
      duration: selectedQuestions.size * 2,
    });
    
    setSelectedQuestions(new Set());
    onOpenChange(false);
  };
  
  const handleAddAiSelected = () => {
    if (aiSelected.size === 0) return;
    const ids = aiResults.filter(q => aiSelected.has(q.id)).map(q => q.id);
    onAddBlock({
      type: 'quiz',
      title: `AI Quiz: ${ids.length} Questions on ${chapter || 'Topic'}`,
      content: aiPrompt,
      source: 'ai',
      questions: ids,
      duration: ids.length * 2,
      aiGenerated: true,
    });
    resetAiFlow();
    setAiPrompt('');
    onOpenChange(false);
  };

  // Shared dialog content
  const dialogContent = (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'bank' | 'ai')} className="flex flex-col flex-1">
        <div className="px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="bank" className="text-xs gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Question Bank
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Generate
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Question Bank Tab */}
        <TabsContent value="bank" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Filters */}
          <div className="px-4 py-3 space-y-2 border-b shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            {/* Filter row */}
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="mcq_single" className="text-xs">MCQ Single</SelectItem>
                  <SelectItem value="mcq_multiple" className="text-xs">MCQ Multiple</SelectItem>
                  <SelectItem value="numerical" className="text-xs">Numerical</SelectItem>
                  <SelectItem value="assertion_reasoning" className="text-xs">Assertion</SelectItem>
                  <SelectItem value="paragraph" className="text-xs">Paragraph</SelectItem>
                  <SelectItem value="matrix_match" className="text-xs">Matrix Match</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all" className="text-xs">All Levels</SelectItem>
                  <SelectItem value="easy" className="text-xs">Easy</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="hard" className="text-xs">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Selection summary */}
            {selectedQuestions.size > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-md">
                <span className="text-sm font-medium text-primary">
                  {selectedQuestions.size} question{selectedQuestions.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedQuestions(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          
          {/* Question List - with proper scroll container */}
          <ScrollArea className={cn("flex-1 min-h-0", isMobile ? "h-[45vh]" : "h-[280px]")}>
            <div className="p-3 space-y-2">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestions.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No questions found</p>
                  <p className="text-xs">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Footer with Add button */}
          <div className="p-4 border-t shrink-0">
            <Button
              className="w-full gradient-button gap-2"
              onClick={handleAddSelected}
              disabled={selectedQuestions.size === 0}
            >
              <Check className="w-4 h-4" />
              Add {selectedQuestions.size || ''} Question{selectedQuestions.size !== 1 ? 's' : ''} to Quiz
            </Button>
          </div>
        </TabsContent>
        
        {/* AI Generate Tab */}
        <TabsContent value="ai" className="mt-0 p-4 space-y-4">
          {/* Question Count */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              How many questions?
            </label>
            <div className="flex gap-2 flex-wrap">
              {[3, 5, 10, 15].map((count) => (
                <Button
                  key={count}
                  variant={questionCount === count ? 'default' : 'outline'}
                  size="sm"
                  className={cn("h-9 px-4", questionCount === count && "gradient-button")}
                  onClick={() => setQuestionCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Topic Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Topic or specific focus (optional)
            </label>
            <Textarea
              placeholder={`e.g., "Focus on numerical problems about force calculation..."`}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-[100px] text-sm resize-none"
            />
          </div>
          
          {chapter && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Context:</span>
              <Badge variant="secondary" className="text-xs">
                {subject} • {chapter}
              </Badge>
            </div>
          )}
          
          <Button
            className="w-full gradient-button gap-2"
            onClick={handleAIGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {questionCount} Questions
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="pb-2 shrink-0">
            <DrawerTitle>Add Quiz Block</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'bank' 
                ? `${filteredQuestions.length} questions available` 
                : 'Generate questions with AI'}
            </p>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            {dialogContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 shrink-0">
          <DialogTitle className="text-lg">Add Quiz Block</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'bank' 
              ? `${filteredQuestions.length} questions available` 
              : 'Generate questions with AI'}
          </p>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
};
