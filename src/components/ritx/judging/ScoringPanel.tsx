import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { initialRubrics, assignmentFor, updateAssignment } from "@/data/rubricData";
import { mockTeams } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  teamId: string;
  judgeId: string;
  onSubmitted?: () => void;
  compact?: boolean;
}

export function ScoringPanel({ teamId, judgeId, onSubmitted, compact }: Props) {
  const team = mockTeams.find((t) => t.id === teamId);
  const rubric = team ? initialRubrics.find((r) => r.trackId === team.trackId) : undefined;
  const existing = assignmentFor(judgeId, teamId);

  const [scores, setScores] = useState<Record<string, number>>(existing?.criterionScores ?? {});
  const [comment, setComment] = useState(existing?.comment ?? "");

  useEffect(() => {
    setScores(existing?.criterionScores ?? {});
    setComment(existing?.comment ?? "");
  }, [teamId, judgeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const weighted = useMemo(() => {
    if (!rubric) return 0;
    return rubric.criteria.reduce((sum, c) => {
      const s = scores[c.id];
      if (s == null) return sum;
      return sum + (s / c.maxScore) * 10 * c.weight;
    }, 0);
  }, [rubric, scores]);

  if (!rubric || !team) return null;

  const scoredCount = rubric.criteria.filter((c) => scores[c.id] != null).length;
  const pct = Math.round((scoredCount / rubric.criteria.length) * 100);
  const complete = scoredCount === rubric.criteria.length;

  const submit = () => {
    if (!complete) return toast.error("Score every criterion before submitting");
    updateAssignment(judgeId, teamId, {
      status: "scored",
      score: Number(weighted.toFixed(2)),
      criterionScores: scores,
      comment,
      scoredAt: new Date().toISOString(),
    });
    toast.success(`Score submitted: ${weighted.toFixed(2)}/10`);
    onSubmitted?.();
  };

  return (
    <div className={cn("flex flex-col h-full", compact ? "gap-3" : "gap-4")}>
      <div className="border rounded-lg p-3 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-baseline justify-between">
          <div className="text-xs text-muted-foreground">Weighted score</div>
          <div className="text-[11px] text-muted-foreground">{scoredCount}/{rubric.criteria.length}</div>
        </div>
        <div className="text-3xl font-bold tabular-nums leading-none mt-1">{weighted.toFixed(2)}<span className="text-sm text-muted-foreground font-normal">/10</span></div>
        <Progress value={pct} className="mt-2 h-1.5" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {rubric.criteria.map((c) => {
          const val = scores[c.id];
          return (
            <div key={c.id} className="border rounded-lg p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-snug">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{c.description}</div>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{Math.round(c.weight * 100)}%</Badge>
              </div>
              <div className="mt-2 grid grid-cols-11 gap-1">
                {Array.from({ length: c.maxScore + 1 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, [c.id]: i }))}
                    className={cn(
                      "h-7 text-[11px] font-medium rounded tabular-nums border transition-colors",
                      val === i
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-muted border-border"
                    )}
                    aria-label={`Score ${i}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div className="border rounded-lg p-2.5">
          <div className="text-xs font-medium mb-1.5">Private comment</div>
          <Textarea rows={3} placeholder="Notes for organisers only…" value={comment} onChange={(e) => setComment(e.target.value)} className="text-sm" />
        </div>
      </div>

      <Button onClick={submit} disabled={!complete} className="w-full">
        <Send className="w-4 h-4 mr-1.5" />
        {existing?.status === "scored" ? "Update score" : "Submit score"}
      </Button>
    </div>
  );
}