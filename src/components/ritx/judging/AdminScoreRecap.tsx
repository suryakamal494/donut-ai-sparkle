import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle } from "lucide-react";
import { assignmentsForTeam, initialRubrics } from "@/data/ritx/rubricData";
import { mockTeams } from "@/data/ritx/mockData";
import { mockStaff } from "@/data/ritx/staffData";

export function AdminScoreRecap({ teamId }: { teamId: string }) {
  const team = mockTeams.find((t) => t.id === teamId);
  const rubric = team ? initialRubrics.find((r) => r.trackId === team.trackId) : undefined;
  const assignments = assignmentsForTeam(teamId);

  if (!team || !rubric) return null;

  const scores = assignments.filter((a) => a.status === "scored").map((a) => a.score!).filter((v) => v != null);
  const avg = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Lock className="w-3 h-3" /> Scores locked — only assigned judges can edit
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div className="text-xs text-muted-foreground">Average</div>
          <div className="text-2xl font-bold tabular-nums">{avg.toFixed(2)}<span className="text-xs text-muted-foreground font-normal">/10</span></div>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          Spread {spread.toFixed(2)}
          {spread >= 1.5 && <span className="inline-flex items-center gap-0.5 text-amber-600"><AlertTriangle className="w-3 h-3" /> Outlier</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Per-criterion scores</div>
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-2 py-1.5 font-medium">Criterion</th>
                {assignments.map((a, i) => {
                  const s = mockStaff.find((x) => x.id === a.judgeId);
                  return <th key={i} className="text-center px-2 py-1.5 font-medium truncate max-w-[100px]" title={s?.name}>{s?.name.split(" ").slice(-1)[0]}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {rubric.criteria.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-2 py-1.5">
                    <div className="font-medium">{c.label}</div>
                    <div className="text-[10px] text-muted-foreground">{Math.round(c.weight * 100)}%</div>
                  </td>
                  {assignments.map((a, i) => {
                    const v = a.criterionScores?.[c.id];
                    return (
                      <td key={i} className="text-center tabular-nums px-2 py-1.5">
                        {v == null ? <span className="text-muted-foreground">—</span> : Number.isInteger(v) ? v : v.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-semibold">
                <td className="px-2 py-1.5">Weighted total</td>
                {assignments.map((a, i) => (
                  <td key={i} className="text-center tabular-nums px-2 py-1.5">{a.score?.toFixed(2) ?? "—"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>

        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">Judge notes</div>
        {assignments.map((a, i) => {
          const s = mockStaff.find((x) => x.id === a.judgeId);
          return (
            <Card key={i} className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{s?.name}</div>
                <Badge variant={a.status === "scored" ? "default" : "secondary"} className="capitalize text-[10px]">{a.status.replace("-", " ")}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{a.comment || <span className="italic">No comment.</span>}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}