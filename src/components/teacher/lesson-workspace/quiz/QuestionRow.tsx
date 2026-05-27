import {
  CircleDot,
  CheckSquare,
  Calculator,
  Scale,
  FileText,
  Grid3X3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  type Question,
  type QuestionType,
  difficultyConfig,
  questionTypeLabels,
} from "@/data/questionsData";

const typeIcon = (type: QuestionType) => {
  switch (type) {
    case "mcq_single": return CircleDot;
    case "mcq_multiple": return CheckSquare;
    case "numerical": return Calculator;
    case "assertion_reasoning": return Scale;
    case "paragraph": return FileText;
    case "matrix_match": return Grid3X3;
    default: return CircleDot;
  }
};

interface QuestionRowProps {
  question: Question;
  isSelected: boolean;
  onToggle: () => void;
  showTopic?: boolean;
  rightSlot?: React.ReactNode;
}

export const QuestionRow = ({
  question,
  isSelected,
  onToggle,
  showTopic,
  rightSlot,
}: QuestionRowProps) => {
  const TypeIcon = typeIcon(question.type);
  const difficulty = difficultyConfig[question.difficulty];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group p-2.5 rounded-lg border cursor-pointer transition-all",
        "min-h-[44px]",
        isSelected
          ? "bg-primary/5 border-primary/40"
          : "bg-background border-border/60 hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground">
              {question.questionId}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 gap-1 font-normal"
            >
              <TypeIcon className="w-2.5 h-2.5" />
              {questionTypeLabels[question.type].replace("MCQ ", "")}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 h-4 font-normal", difficulty.className)}
            >
              {difficulty.label}
            </Badge>
            {showTopic && question.topic && (
              <span className="text-[10px] text-muted-foreground truncate">
                · {question.topic}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground line-clamp-2 leading-snug">
            {question.questionText}
          </p>
          {question.options && question.options.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {question.options.slice(0, 4).map((opt, i) => (
                <span
                  key={opt.id}
                  className={cn(
                    "text-[11px]",
                    opt.isCorrect
                      ? "text-success font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + i)}. {opt.text.slice(0, 22)}
                  {opt.text.length > 22 ? "…" : ""}
                  {opt.isCorrect && " ✓"}
                </span>
              ))}
            </div>
          )}
        </div>
        {rightSlot && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
};