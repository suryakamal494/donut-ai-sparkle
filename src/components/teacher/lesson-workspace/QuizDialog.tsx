import { useEffect, useState } from "react";
import { Sparkles, Search, Loader2, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { type LessonPlanBlock } from "./types";
import {
  generateMockAiQuestions,
  regenerateMockQuestion,
  type AiGenerationConfig,
} from "@/data/aiQuestionMock";
import type { Question } from "@/data/questionsData";
import { QuestionBankPanel } from "./quiz/QuestionBankPanel";
import { AiConfigurePanel } from "./quiz/AiConfigurePanel";
import { AiReviewPanel } from "./quiz/AiReviewPanel";
import { useQuizSelection } from "./quiz/useQuizSelection";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (block: Omit<LessonPlanBlock, "id">) => void;
  chapter?: string;
  subject?: string;
  chapterId?: string;
}

type AiStep = "configure" | "generating" | "review";

export const QuizDialog = ({
  open,
  onOpenChange,
  onAddBlock,
  chapter,
  subject,
  chapterId,
}: QuizDialogProps) => {
  const isMobile = useIsMobile();
  const selection = useQuizSelection();

  const [tab, setTab] = useState<"bank" | "ai">("bank");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(10);
  const [autoDuration, setAutoDuration] = useState(true);

  // AI state
  const [aiStep, setAiStep] = useState<AiStep>("configure");
  const [aiResults, setAiResults] = useState<Question[]>([]);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<AiGenerationConfig | null>(null);

  // Keep duration synced to count when in auto mode
  useEffect(() => {
    if (autoDuration) setDuration(Math.max(2, selection.count * 2));
  }, [selection.count, autoDuration]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      selection.clear();
      setAiResults([]);
      setAiStep("configure");
      setTitle("");
      setDuration(10);
      setAutoDuration(true);
      setTab("bank");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const runGenerate = async (config: AiGenerationConfig) => {
    setLastConfig(config);
    setAiStep("generating");
    await new Promise((r) => setTimeout(r, 1200));
    const results = generateMockAiQuestions(config);
    setAiResults(results);
    selection.addMany(results, "ai");
    setAiStep("review");
  };

  const regenerateAll = async () => {
    if (!lastConfig) return;
    setAiStep("generating");
    await new Promise((r) => setTimeout(r, 1000));
    aiResults.forEach((q) => selection.remove(q.id));
    const results = generateMockAiQuestions(lastConfig);
    setAiResults(results);
    selection.addMany(results, "ai");
    setAiStep("review");
  };

  const regenerateOne = async (q: Question, index: number) => {
    if (!lastConfig) return;
    setRegeneratingId(q.id);
    await new Promise((r) => setTimeout(r, 600));
    const replacement = regenerateMockQuestion(lastConfig, index, q);
    setAiResults((prev) => prev.map((x, i) => (i === index ? replacement : x)));
    const wasSelected = selection.has(q.id);
    selection.remove(q.id);
    if (wasSelected) selection.addMany([replacement], "ai");
    setRegeneratingId(null);
  };

  const deleteOne = (id: string) => {
    setAiResults((prev) => prev.filter((q) => q.id !== id));
    selection.remove(id);
  };

  const deleteUnselected = () => {
    const keep = new Set(aiResults.filter((q) => selection.has(q.id)).map((q) => q.id));
    setAiResults((prev) => prev.filter((q) => keep.has(q.id)));
  };

  const handleAdd = () => {
    if (selection.count === 0) return;
    const ids = selection.items.map((i) => i.question.id);
    const hasAi = selection.aiCount > 0;
    const hasBank = selection.bankCount > 0;
    const autoTitle = hasAi && hasBank
      ? `Quiz: ${selection.count} Questions`
      : hasAi
      ? `AI Quiz: ${selection.count} on ${chapter || "Topic"}`
      : `Quiz: ${selection.count} Questions`;
    onAddBlock({
      type: "quiz",
      title: title.trim() || autoTitle,
      source: hasAi && !hasBank ? "ai" : "library",
      questions: ids,
      duration,
      aiGenerated: hasAi,
    });
    onOpenChange(false);
  };

  // ---- Layout (shared) ----
  const body = (
    <div className="min-h-0 overflow-hidden flex flex-col">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "bank" | "ai")}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="px-3 pt-3 pb-2 shrink-0">
          <TabsList className="w-full grid grid-cols-2 h-8">
            <TabsTrigger value="bank" className="text-xs gap-1.5 h-7">
              <Search className="w-3.5 h-3.5" />
              Question Bank
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1.5 h-7">
              <Sparkles className="w-3.5 h-3.5" />
              AI Generate
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="bank"
          className="data-[state=active]:flex data-[state=inactive]:hidden flex-col flex-1 min-h-0 mt-0 outline-none"
        >
          <QuestionBankPanel subject={subject} chapter={chapter} selection={selection} />
        </TabsContent>

        <TabsContent
          value="ai"
          className="data-[state=active]:flex data-[state=inactive]:hidden flex-col flex-1 min-h-0 mt-0 outline-none"
        >
          {aiStep === "configure" && (
            <AiConfigurePanel
              subject={subject}
              chapter={chapter}
              chapterId={chapterId}
              onGenerate={runGenerate}
            />
          )}
          {aiStep === "generating" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium">Drafting questions…</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Working with your topics, mix and cognitive types
              </p>
            </div>
          )}
          {aiStep === "review" && (
            <AiReviewPanel
              results={aiResults}
              regeneratingId={regeneratingId}
              selection={selection}
              onBack={() => setAiStep("configure")}
              onRegenerateAll={regenerateAll}
              onRegenerateOne={regenerateOne}
              onDelete={deleteOne}
              onDeleteUnselected={deleteUnselected}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  // Meta strip + footer (shared, always pinned)
  const footer = (
    <div className="border-t bg-background shrink-0">
      {selection.count > 0 && (
        <div className="px-3 py-2 border-b bg-muted/30 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Quiz title (${selection.count} question${selection.count !== 1 ? "s" : ""})`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => {
                  setAutoDuration(false);
                  setDuration(Math.max(1, parseInt(e.target.value || "1", 10)));
                }}
                className="h-8 w-14 text-xs text-center"
              />
              <span className="text-[11px] text-muted-foreground">min</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {selection.count} selected
              </Badge>
              {selection.bankCount > 0 && (
                <span className="text-muted-foreground">{selection.bankCount} bank</span>
              )}
              {selection.aiCount > 0 && (
                <span className="text-muted-foreground">· {selection.aiCount} AI</span>
              )}
            </div>
            <button
              type="button"
              onClick={selection.clear}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
        </div>
      )}
      <div className="p-3">
        <Button
          className={cn(
            "w-full gap-2 h-10",
            selection.count > 0 ? "gradient-button" : "",
          )}
          variant={selection.count > 0 ? "default" : "outline"}
          onClick={handleAdd}
          disabled={selection.count === 0}
        >
          <Check className="w-4 h-4" />
          {selection.count > 0
            ? `Add ${selection.count} question${selection.count !== 1 ? "s" : ""} to lesson`
            : "Pick at least one question"}
        </Button>
      </div>
    </div>
  );

  const header = (
    <div className="px-4 py-3 shrink-0 border-b">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">Add Quiz Block</h2>
        <span className="text-xs text-muted-foreground">
          · {tab === "bank" ? "Pick from bank" : "Generate with AI"}
        </span>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] grid grid-rows-[auto,1fr,auto] p-0 overflow-hidden">
          {header}
          {body}
          {footer}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] h-[min(85vh,720px)] grid grid-rows-[auto,1fr,auto] p-0 overflow-hidden gap-0">
        {header}
        {body}
        {footer}
      </DialogContent>
    </Dialog>
  );
};