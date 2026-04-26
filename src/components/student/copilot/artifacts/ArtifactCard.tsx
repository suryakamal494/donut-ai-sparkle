import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calculator,
  FileText,
  Dumbbell,
  Calendar,
  Target,
  Brain,
  BarChart3,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import type { StudentArtifact } from "../types";

const artifactIcons: Record<string, React.ElementType> = {
  concept_explainer: BookOpen,
  worked_solution: Calculator,
  formula_sheet: FileText,
  practice_session: Dumbbell,
  study_plan: Calendar,
  target_tracker: Target,
  mastery_map: Brain,
  progress_report: BarChart3,
  test_debrief: ClipboardList,
  clarifications: HelpCircle,
};

const artifactColors: Record<string, string> = {
  concept_explainer: "text-blue-600 bg-blue-50",
  worked_solution: "text-violet-600 bg-violet-50",
  formula_sheet: "text-teal-600 bg-teal-50",
  practice_session: "text-orange-600 bg-orange-50",
  study_plan: "text-emerald-600 bg-emerald-50",
  target_tracker: "text-rose-600 bg-rose-50",
  mastery_map: "text-purple-600 bg-purple-50",
  progress_report: "text-cyan-600 bg-cyan-50",
  test_debrief: "text-amber-600 bg-amber-50",
  clarifications: "text-muted-foreground bg-muted",
};

interface Props {
  artifact: StudentArtifact;
  selected?: boolean;
  onClick?: () => void;
}

export default function ArtifactCard({ artifact, selected, onClick }: Props) {
  const Icon = artifactIcons[artifact.type] ?? FileText;
  const colorClass = artifactColors[artifact.type] ?? "text-muted-foreground bg-muted";

  const timeAgo = React.useMemo(() => {
    const diff = Date.now() - new Date(artifact.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }, [artifact.created_at]);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-sm",
        selected && "ring-2 ring-primary/50 border-primary/30"
      )}
      onClick={onClick}
    >
      <CardContent className="p-2.5 flex items-center gap-2.5">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{artifact.title}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
        </div>
        {artifact.source === "teacher" && (
          <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">Teacher</span>
        )}
      </CardContent>
    </Card>
  );
}