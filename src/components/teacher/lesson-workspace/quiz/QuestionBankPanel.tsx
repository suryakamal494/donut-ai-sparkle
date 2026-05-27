import { useMemo, useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockQuestions,
  questionTypeLabels,
  type QuestionType,
} from "@/data/questionsData";
import { QuestionRow } from "./QuestionRow";
import type { QuizSelection } from "./useQuizSelection";

interface QuestionBankPanelProps {
  subject?: string;
  chapter?: string;
  selection: QuizSelection;
}

export const QuestionBankPanel = ({
  subject,
  chapter,
  selection,
}: QuestionBankPanelProps) => {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockQuestions.filter((row) => {
      if (subject && row.subject.toLowerCase() !== subject.toLowerCase()) return false;
      if (chapter && row.chapter.toLowerCase() !== chapter.toLowerCase()) {
        // soft match — keep if no chapter results would otherwise show
      }
      if (difficulty !== "all" && row.difficulty !== difficulty) return false;
      if (type !== "all" && row.type !== type) return false;
      if (q) {
        return (
          row.questionText.toLowerCase().includes(q) ||
          row.questionId.toLowerCase().includes(q) ||
          row.topic?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, difficulty, type, subject, chapter]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((q) => selection.has(q.id));
  const someVisibleSelected =
    filtered.some((q) => selection.has(q.id)) && !allVisibleSelected;

  const selectAllVisible = () => selection.addMany(filtered, "bank");
  const clearVisible = () => filtered.forEach((q) => selection.has(q.id) && selection.remove(q.id));

  const resetFilters = () => {
    setSearch("");
    setDifficulty("all");
    setType("all");
  };

  const hasFilters = search !== "" || difficulty !== "all" || type !== "all";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Filter bar */}
      <div className="px-3 pt-3 pb-2 space-y-2 shrink-0 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search questions, ID, topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ToggleGroup
            type="single"
            value={difficulty}
            onValueChange={(v) => v && setDifficulty(v)}
            className="gap-1"
          >
            <ToggleGroupItem value="all" className="h-7 px-2.5 text-[11px] data-[state=on]:bg-primary/10 data-[state=on]:text-primary border">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="easy" className="h-7 px-2.5 text-[11px] data-[state=on]:bg-success/10 data-[state=on]:text-success border">
              Easy
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" className="h-7 px-2.5 text-[11px] data-[state=on]:bg-warning/10 data-[state=on]:text-warning border">
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem value="hard" className="h-7 px-2.5 text-[11px] data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive border">
              Hard
            </ToggleGroupItem>
          </ToggleGroup>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-7 text-[11px] w-auto gap-1 px-2 ml-auto">
              <Filter className="w-3 h-3" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all" className="text-xs">All types</SelectItem>
              {(Object.keys(questionTypeLabels) as QuestionType[]).map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {questionTypeLabels[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection bar (sticky) */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-muted/30 border-b shrink-0 text-[11px]">
        <span className="text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-2 text-primary hover:underline"
            >
              Reset filters
            </button>
          )}
        </span>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={allVisibleSelected ? clearVisible : selectAllVisible}
            className="text-primary font-medium hover:underline"
          >
            {allVisibleSelected
              ? "Clear visible"
              : someVisibleSelected
              ? "Select all visible"
              : "Select all visible"}
          </button>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1.5">
          {filtered.length > 0 ? (
            filtered.map((q) => (
              <QuestionRow
                key={q.id}
                question={q}
                isSelected={selection.has(q.id)}
                onToggle={() => selection.toggle(q, "bank")}
                showTopic
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="w-9 h-9 mb-3 opacity-40" />
              <p className="text-sm font-medium">No questions found</p>
              <p className="text-xs">Try clearing filters or changing your search</p>
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-7 text-xs"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};