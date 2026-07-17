import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { initialRubrics, assignmentFor, updateAssignment } from "@/data/ritx/rubricData";
import { mockTeams } from "@/data/ritx/mockData";
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

  const snap = (v: number) => Math.max(0, Math.min(10, Math.round(v * 4) / 4));
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, ""));

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
          const set = (n: number) => setScores((s) => ({ ...s, [c.id]: snap(n) }));
          return (
            <div key={c.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-snug">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{c.description}</div>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{Math.round(c.weight * 100)}%</Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Slider
                  value={[val ?? 0]}
                  min={0}
                  max={c.maxScore}
                  step={0.25}
                  onValueChange={([n]) => set(n)}
                  className={cn("flex-1", val == null && "opacity-70")}
                  aria-label={`${c.label} score`}
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={c.maxScore}
                  step={0.25}
                  value={val ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") { setScores((s) => { const n = { ...s }; delete n[c.id]; return n; }); return; }
                    const n = parseFloat(raw);
                    if (!Number.isNaN(n)) set(n);
                  }}
                  placeholder="—"
                  className="w-16 h-8 text-center tabular-nums text-sm px-1"
                />
                <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">/{c.maxScore}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground tabular-nums px-0.5">
                <span>0</span><span>2.5</span><span>5</span><span>7.5</span><span>10</span>
              </div>
              {val != null && (
                <div className="mt-1 text-[11px] text-muted-foreground">Selected: <span className="font-medium text-foreground tabular-nums">{fmt(val)}</span> · steps of 0.25</div>
              )}
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