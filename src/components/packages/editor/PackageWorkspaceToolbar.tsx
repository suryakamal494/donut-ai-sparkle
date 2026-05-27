import { Plus, HelpCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PackageWorkspaceToolbarProps {
  onAddContent: () => void;
  onAddQuiz: () => void;
}

/**
 * SuperAdmin Packages composer toolbar.
 * Intentionally simpler than the teacher workspace: just two actions.
 * - Add content: opens a chapter-scoped library/quick-add sheet
 * - Add quiz: opens the shared QuizDialog
 */
export const PackageWorkspaceToolbar = ({
  onAddContent,
  onAddQuiz,
}: PackageWorkspaceToolbarProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <Button
        variant="outline"
        onClick={onAddContent}
        className="h-auto py-3 sm:py-4 flex-col gap-1.5 border-dashed hover:border-primary/50 hover:bg-primary/5"
      >
        <div className="flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Add content</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-normal">
          Pick from chapter library or quick-add
        </span>
      </Button>
      <Button
        variant="outline"
        onClick={onAddQuiz}
        className="h-auto py-3 sm:py-4 flex-col gap-1.5 border-dashed hover:border-primary/50 hover:bg-primary/5"
      >
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[hsl(var(--donut-pink))]" />
          <span className="text-sm font-semibold">Add quiz</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-normal">
          Pick questions or generate with AI
        </span>
      </Button>
    </div>
  );
};