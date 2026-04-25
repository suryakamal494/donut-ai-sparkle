// InlinePracticeCard — renders a single practice question inline in chat
import React, { useState } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import MathMarkdown from "./MathMarkdown";

export interface PracticeQuestion {
  question: string;
  type: "mcq" | "short" | "integer" | "true_false" | "assertion_reason" | "multi_step";
  options?: Array<{ label: string; text: string }>;
  answer: string;
  explanation?: string;
  topic?: string;
  subject?: string;
}

interface Props {
  question: PracticeQuestion;
  index: number;
  total: number;
  result?: { given: string; correct: boolean };
  onAnswer: (given: string, correct: boolean) => void;
  onNext: () => void;
  answered: boolean;
  isActive?: boolean;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/^option\s+/, "");
}

function isOptionQuestion(question: PracticeQuestion) {
  return ["mcq", "true_false", "assertion_reason", "multi_step"].includes(question.type) && Boolean(question.options?.length);
}

const InlinePracticeCard: React.FC<Props> = ({
  question,
  index,
  total,
  onAnswer,
  onNext,
  answered,
  result,
  isActive = false,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [shortInput, setShortInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const displayedAnswer = result?.given ?? selected;
  const displayedCorrect = result?.correct ?? isCorrect;

  const handleSubmit = (answer: string) => {
    if (answered) return;
    const normalizedGiven = normalizeAnswer(answer);
    const normalizedExpected = normalizeAnswer(question.answer);
    const matchedOption = question.options?.find(
      (opt) => normalizeAnswer(opt.label) === normalizedExpected || normalizeAnswer(opt.text) === normalizedExpected
    );
    const correct = normalizedGiven === normalizeAnswer(matchedOption?.label ?? question.answer);
    setSelected(answer);
    setIsCorrect(correct);
    onAnswer(answer, correct);
  };

  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4 space-y-3 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Question {index + 1} of {total}
        </span>
        {question.topic && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {question.topic}
          </span>
        )}
      </div>

      {/* Question text */}
      <div className="text-sm">
        <MathMarkdown compact>{question.question}</MathMarkdown>
      </div>

      {/* MCQ options */}
      {isOptionQuestion(question) &&
        question.options && (
          <div className="grid gap-2">
            {question.options.map((opt, i) => {
              const letter = opt.label || String.fromCharCode(65 + i);
              const isSelected = displayedAnswer === opt.label;
              const isAnswer =
                answered &&
                normalizeAnswer(opt.label) === normalizeAnswer(question.answer);

              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => handleSubmit(opt.label)}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-lg border text-left text-sm transition-colors min-h-[44px]",
                    !answered && "hover:bg-muted/50 active:bg-muted",
                    isSelected && displayedCorrect && "border-green-500 bg-green-500/10",
                    isSelected && displayedCorrect === false && "border-destructive bg-destructive/10",
                    !isSelected && isAnswer && "border-green-500 bg-green-500/5",
                    !answered && "cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border text-xs flex items-center justify-center font-medium",
                      isSelected && displayedCorrect && "bg-green-500 text-white border-green-500",
                      isSelected && displayedCorrect === false && "bg-destructive text-destructive-foreground border-destructive",
                      !isSelected && isAnswer && "bg-green-500 text-white border-green-500"
                    )}
                  >
                    {answered && isSelected ? (
                      displayedCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />
                    ) : answered && isAnswer ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      letter
                    )}
                  </span>
                  <span className="pt-0.5 flex-1">
                    <MathMarkdown compact>{opt.text}</MathMarkdown>
                  </span>
                </button>
              );
            })}
          </div>
        )}

      {/* Short answer */}
      {(question.type === "short" || question.type === "integer" || (!question.options?.length && question.type === "multi_step")) && !answered && (
        <div className="flex gap-2">
          <Input
            value={shortInput}
            onChange={(e) => setShortInput(e.target.value)}
            placeholder="Type your answer…"
            className="flex-1 text-sm h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(shortInput);
              }
            }}
          />
          <Button
            size="sm"
            className="h-10 min-w-[44px]"
            disabled={!shortInput.trim()}
            onClick={() => handleSubmit(shortInput)}
          >
            Submit
          </Button>
        </div>
      )}

      {/* Short answer result */}
      {(question.type === "short" || question.type === "integer" || (!question.options?.length && question.type === "multi_step")) && answered && (
        <div
          className={cn(
            "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
            displayedCorrect ? "border-green-500 bg-green-500/10" : "border-destructive bg-destructive/10"
          )}
        >
          {displayedCorrect ? (
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 text-destructive flex-shrink-0" />
          )}
          <span>
            Your answer: <strong>{displayedAnswer}</strong>
            {!displayedCorrect && (
              <span className="text-muted-foreground inline-flex flex-wrap items-center gap-1">
                <span>· Correct:</span> <MathMarkdown compact inline>{question.answer}</MathMarkdown>
              </span>
            )}
          </span>
        </div>
      )}

      {/* Explanation */}
      {answered && question.explanation && (
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Explanation
          </p>
          <MathMarkdown compact>{question.explanation}</MathMarkdown>
        </div>
      )}

      {/* Next button */}
      {answered && isActive && index < total - 1 && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={onNext} className="h-9 gap-1">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(InlinePracticeCard);