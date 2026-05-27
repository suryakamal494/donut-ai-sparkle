import { ArrowLeft, RefreshCw, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";
import type { Question } from "@/data/questionsData";
import { QuestionRow } from "./QuestionRow";
import type { QuizSelection } from "./useQuizSelection";

interface AiReviewPanelProps {
  results: Question[];
  regeneratingId: string | null;
  selection: QuizSelection;
  onBack: () => void;
  onRegenerateAll: () => void;
  onRegenerateOne: (q: Question, index: number) => void;
  onDelete: (id: string) => void;
  onDeleteUnselected: () => void;
}

export const AiReviewPanel = ({
  results,
  regeneratingId,
  selection,
  onBack,
  onRegenerateAll,
  onRegenerateOne,
  onDelete,
  onDeleteUnselected,
}: AiReviewPanelProps) => {
  const selectedCount = results.filter((q) => selection.has(q.id)).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="px-3 py-2 border-b shrink-0 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 px-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Settings
        </Button>
        <div className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{results.length}</span> generated ·{" "}
          <span className="font-medium text-foreground">{selectedCount}</span> selected
        </div>
        <div className="ml-auto flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 px-2"
            onClick={onDeleteUnselected}
            disabled={selectedCount === 0 || selectedCount === results.length}
          >
            <Trash2 className="w-3 h-3" /> Drop unselected
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 px-2"
            onClick={onRegenerateAll}
          >
            <RefreshCw className="w-3 h-3" /> Regenerate all
          </Button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1.5">
          {results.length > 0 ? (
            results.map((q, i) => {
              const isRegen = regeneratingId === q.id;
              return (
                <div key={q.id} className={isRegen ? "opacity-50 pointer-events-none" : ""}>
                  <QuestionRow
                    question={q}
                    isSelected={selection.has(q.id)}
                    onToggle={() => selection.toggle(q, "ai")}
                    showTopic
                    rightSlot={
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={isRegen}
                          >
                            {isRegen ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <MoreVertical className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => onRegenerateOne(q, i)} className="text-xs">
                            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Regenerate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(q.id)}
                            className="text-xs text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    }
                  />
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Sparkles className="w-9 h-9 mb-3 opacity-40" />
              <p className="text-sm font-medium">All questions removed</p>
              <p className="text-xs">Go back to settings or regenerate</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};