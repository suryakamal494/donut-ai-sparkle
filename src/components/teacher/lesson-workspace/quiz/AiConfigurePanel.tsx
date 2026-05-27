import { useMemo, useState } from "react";
import { Sparkles, ChevronDown, Plus, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type CognitiveType,
  type QuestionType,
  type QuestionDifficulty,
  cognitiveTypeConfig,
  difficultyConfig,
  questionTypeLabels,
} from "@/data/questionsData";
import {
  getTopicsForChapter,
  type AiGenerationConfig,
} from "@/data/aiQuestionMock";
import { getTopicsByChapter } from "@/data/cbseMasterData";

const COUNT_CHIPS = [3, 5, 10, 15];

interface AiConfigurePanelProps {
  subject?: string;
  chapter?: string;
  chapterId?: string;
  onGenerate: (config: AiGenerationConfig) => void;
}

export const AiConfigurePanel = ({
  subject,
  chapter,
  chapterId,
  onGenerate,
}: AiConfigurePanelProps) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [topicPopoverOpen, setTopicPopoverOpen] = useState(false);
  const [topicDraft, setTopicDraft] = useState("");
  const [count, setCount] = useState(5);
  const [mix, setMix] = useState<Record<QuestionDifficulty, number>>({
    easy: 2,
    medium: 2,
    hard: 1,
  });
  const [cognitive, setCognitive] = useState<CognitiveType[]>(["conceptual"]);
  const [qType, setQType] = useState<QuestionType>("mcq_single");
  const [prompt, setPrompt] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const suggestions = useMemo(() => {
    const fromMaster = chapterId ? getTopicsByChapter(chapterId).map((t) => t.name) : [];
    if (fromMaster.length) return fromMaster;
    const fromBank = getTopicsForChapter(chapter, subject);
    if (fromBank.length) return fromBank;
    return [
      "Introduction",
      "Core Concepts",
      "Worked Examples",
      "Practice Problems",
      "Real-world Applications",
      "Common Misconceptions",
      "Summary",
    ];
  }, [chapterId, chapter, subject]);

  const total = mix.easy + mix.medium + mix.hard;

  const setCountAndRebalance = (next: number) => {
    setCount(next);
    const current = mix.easy + mix.medium + mix.hard;
    if (current === next) return;
    if (current === 0) {
      setMix({ easy: 0, medium: next, hard: 0 });
      return;
    }
    const scale = next / current;
    const e = Math.round(mix.easy * scale);
    const h = Math.round(mix.hard * scale);
    const m = Math.max(0, next - e - h);
    setMix({ easy: e, medium: m, hard: h });
  };

  const bump = (key: QuestionDifficulty, delta: number) => {
    const next = Math.max(0, Math.min(count, mix[key] + delta));
    if (next === mix[key]) return;
    const others = (["easy", "medium", "hard"] as QuestionDifficulty[]).filter((k) => k !== key);
    const diff = next - mix[key];
    // take from / give to the largest other bucket
    const target = others.sort((a, b) => mix[b] - mix[a])[0];
    const other2 = others.find((o) => o !== target)!;
    let m: Record<QuestionDifficulty, number> = { ...mix, [key]: next };
    let remaining = -diff;
    const fromTarget = Math.max(-mix[target], Math.min(remaining, mix[target]));
    m[target] = mix[target] + (remaining < 0 ? -Math.min(-remaining, mix[target]) : Math.min(remaining, count));
    // Recompute simply: keep `key` exact, distribute the rest proportionally between others
    const restTotal = count - next;
    const otherSum = mix[target] + mix[other2];
    if (otherSum === 0) {
      m = { ...m, [target]: restTotal, [other2]: 0 };
    } else {
      const t = Math.round((mix[target] / otherSum) * restTotal);
      m = { ...m, [target]: t, [other2]: Math.max(0, restTotal - t) };
    }
    setMix(m);
  };

  const toggleTopic = (t: string) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const addTopicDraft = () => {
    const t = topicDraft.trim();
    if (!t) return;
    if (!topics.includes(t)) setTopics((prev) => [...prev, t]);
    setTopicDraft("");
  };
  const toggleCognitive = (c: CognitiveType) =>
    setCognitive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const valid = topics.length > 0 && cognitive.length > 0 && count > 0 && total === count;

  const handleGenerate = () => {
    if (!valid) return;
    onGenerate({
      subject,
      chapter,
      topics,
      cognitiveTypes: cognitive,
      questionType: qType,
      difficultyMix: mix,
      count,
      prompt,
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {(subject || chapter) && (
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-muted-foreground">Context:</span>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5">
                {[subject, chapter].filter(Boolean).join(" • ")}
              </Badge>
            </div>
          )}

          {/* Topics */}
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1">
              Topics <span className="text-destructive">*</span>
              <span className="text-[10px] text-muted-foreground ml-auto font-normal">
                {topics.length} selected
              </span>
            </label>
            <Popover open={topicPopoverOpen} onOpenChange={setTopicPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-9 text-xs font-normal"
                >
                  <span className="truncate text-left text-muted-foreground">
                    {topics.length === 0
                      ? "Pick topics from this chapter…"
                      : topics.slice(0, 2).join(", ") + (topics.length > 2 ? ` +${topics.length - 2}` : "")}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-[--radix-popover-trigger-width] bg-popover z-50"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search or type new…" className="h-9 text-xs" value={topicDraft} onValueChange={setTopicDraft} />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty>
                      <button
                        type="button"
                        className="text-xs text-primary px-2 py-1 hover:underline"
                        onClick={() => {
                          addTopicDraft();
                          setTopicPopoverOpen(false);
                        }}
                      >
                        + Add "{topicDraft}"
                      </button>
                    </CommandEmpty>
                    <CommandGroup>
                      {suggestions.map((t) => {
                        const active = topics.includes(t);
                        return (
                          <CommandItem
                            key={t}
                            value={t}
                            onSelect={() => toggleTopic(t)}
                            className="text-xs"
                          >
                            <Checkbox checked={active} className="mr-2" />
                            <span className="flex-1 truncate">{t}</span>
                          </CommandItem>
                        );
                      })}
                      {topicDraft.trim() && !suggestions.some((s) => s.toLowerCase() === topicDraft.trim().toLowerCase()) && (
                        <CommandItem
                          value={`__add_${topicDraft}`}
                          onSelect={() => {
                            addTopicDraft();
                          }}
                          className="text-xs text-primary"
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Add "{topicDraft.trim()}"
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {topics.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {topics.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-[10px] gap-1 bg-primary/5 border-primary/30 text-primary px-1.5 py-0 h-5"
                  >
                    {t}
                    <button type="button" onClick={() => toggleTopic(t)} className="hover:text-foreground">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">How many questions?</label>
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-5">
                {count}
              </Badge>
            </div>
            <div className="flex gap-1.5">
              {COUNT_CHIPS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCountAndRebalance(n)}
                  className={cn(
                    "h-7 px-3 rounded-md text-xs border transition-colors",
                    count === n
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              ))}
              <div className="flex-1 flex items-center gap-2 pl-1">
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[count]}
                  onValueChange={(v) => setCountAndRebalance(v[0])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Difficulty mix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Difficulty mix</label>
              <span
                className={cn(
                  "text-[10px]",
                  total === count ? "text-muted-foreground" : "text-destructive",
                )}
              >
                {total} / {count}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as QuestionDifficulty[]).map((d) => (
                <div
                  key={d}
                  className={cn(
                    "rounded-md border p-1.5 flex flex-col items-center gap-1",
                    difficultyConfig[d].className,
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide font-medium">
                    {difficultyConfig[d].label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:bg-background/60"
                      onClick={() => bump(d, -1)}
                      disabled={mix[d] <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-semibold w-6 text-center tabular-nums">
                      {mix[d]}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:bg-background/60"
                      onClick={() => bump(d, 1)}
                      disabled={total >= count}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform",
                    advancedOpen && "rotate-180",
                  )}
                />
                Advanced options
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {/* Cognitive */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center justify-between">
                  Cognitive types <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-1 flex-wrap">
                  {(Object.keys(cognitiveTypeConfig) as CognitiveType[]).map((c) => {
                    const active = cognitive.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCognitive(c)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] border transition-colors",
                          active
                            ? cognitiveTypeConfig[c].className
                            : "bg-background hover:bg-muted border-border/60 text-muted-foreground",
                        )}
                      >
                        {cognitiveTypeConfig[c].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Question format</label>
                <Select value={qType} onValueChange={(v) => setQType(v as QuestionType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {(Object.keys(questionTypeLabels) as QuestionType[]).map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {questionTypeLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Specific requirements</label>
                <Textarea
                  placeholder='e.g., "Focus on real-world applications, avoid pure formula recall…"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[60px] text-xs resize-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Sticky generate */}
      <div className="p-3 border-t shrink-0 bg-background">
        <Button
          className="w-full gradient-button gap-2 h-10"
          onClick={handleGenerate}
          disabled={!valid}
        >
          <Sparkles className="w-4 h-4" />
          Generate {count} question{count !== 1 ? "s" : ""}
        </Button>
        {!valid && (
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            {topics.length === 0
              ? "Pick at least one topic to continue"
              : cognitive.length === 0
              ? "Open Advanced and pick at least one cognitive type"
              : total !== count
              ? `Difficulty mix must equal ${count}`
              : ""}
          </p>
        )}
      </div>
    </div>
  );
};