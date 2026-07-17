import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Save, Users, Gavel } from "lucide-react";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockStaff } from "@/data/ritx/staffData";
import { mockAssignments, statusLabel, scoreTone } from "@/data/ritx/rubricData";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { toast } from "sonner";

export default function RitxAdminJudgeAssignments() {
  const judges = mockStaff.filter((s) => s.judgeAccess);
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    judges.forEach((j) => (init[j.id] = new Set(mockAssignments.filter((a) => a.judgeId === j.id).map((a) => a.teamId))));
    return init;
  });

  const toggle = (judgeId: string, teamId: string) => {
    setMatrix((m) => {
      const next = { ...m };
      const set = new Set(next[judgeId]);
      set.has(teamId) ? set.delete(teamId) : set.add(teamId);
      next[judgeId] = set;
      return next;
    });
  };

  const autoAssign = (perTeam = 2) => {
    const next: Record<string, Set<string>> = {};
    judges.forEach((j) => (next[j.id] = new Set()));
    mockTeams.forEach((t, idx) => {
      for (let k = 0; k < perTeam; k++) {
        const j = judges[(idx + k) % judges.length];
        next[j.id].add(t.id);
      }
    });
    setMatrix(next);
    toast.success(`Auto-assigned ${perTeam} judges per team`);
  };

  const statusOf = (judgeId: string, teamId: string) =>
    mockAssignments.find((a) => a.judgeId === judgeId && a.teamId === teamId)?.status;

  const totals = useMemo(() => {
    const perTeam = mockTeams.map((t) => Object.values(matrix).filter((s) => s.has(t.id)).length);
    const scored = mockAssignments.filter((a) => a.status === "scored").length;
    const total = Object.values(matrix).reduce((s, v) => s + v.size, 0);
    return { perTeam, scored, total, pct: total ? Math.round((scored / total) * 100) : 0 };
  }, [matrix]);

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Judge assignments"
        description="Assign judges to teams. Each cell locks a submission into that judge's blind queue."
      />

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3"><Users className="w-4 h-4 text-primary" /><div><div className="text-xs text-muted-foreground">Judges</div><div className="text-xl font-bold">{judges.length}</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><Gavel className="w-4 h-4 text-primary" /><div className="flex-1"><div className="text-xs text-muted-foreground">Scoring progress</div><div className="text-xl font-bold">{totals.scored}/{totals.total}</div><Progress value={totals.pct} className="mt-1 h-1.5" /></div></Card>
        <Card className="p-4 flex items-center gap-3"><div className="flex-1"><div className="text-xs text-muted-foreground">Coverage</div><div className="text-sm">{totals.perTeam.filter((n) => n >= 2).length}/{mockTeams.length} teams have ≥2 judges</div></div></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => autoAssign(2)}><Shuffle className="w-4 h-4 mr-1" />Auto-assign (2 judges/team)</Button>
        <Button size="sm" variant="outline" onClick={() => autoAssign(3)}><Shuffle className="w-4 h-4 mr-1" />Auto-assign (3 judges/team)</Button>
        <Button size="sm" onClick={() => toast.success("Assignments saved")}><Save className="w-4 h-4 mr-1" />Save</Button>
      </div>

      <Card className="p-0 overflow-x-auto max-h-[520px]">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted/40 sticky top-0 z-10">
            <tr>
              <th className="text-left p-3 min-w-[200px] sticky left-0 bg-muted/60 z-20 border-r">Judge</th>
              {mockTeams.map((t) => (
                <th key={t.id} className="p-2 min-w-[130px] text-left">
                  <TeamIdChip code={t.teamCode} />
                  <div className="text-[10px] text-muted-foreground mt-1">{trackName(t.trackId)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {judges.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="p-3 sticky left-0 bg-background z-10 border-r">
                  <div className="font-medium">{j.name}</div>
                  <div className="text-xs text-muted-foreground">{j.organisation}</div>
                </td>
                {mockTeams.map((t) => {
                  const on = matrix[j.id]?.has(t.id);
                  const st = statusOf(j.id, t.id);
                  return (
                    <td key={t.id} className="p-2">
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <Checkbox checked={on} onCheckedChange={() => toggle(j.id, t.id)} />
                        {on && st && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border w-fit ${scoreTone(st)}`}>{statusLabel(st)}</span>
                        )}
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold mb-2">Coverage per team</div>
        <div className="space-y-2">
          {mockTeams.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 text-sm">
              <TeamIdChip code={t.teamCode} />
              <div className="flex-1">
                <Progress value={Math.min(100, (totals.perTeam[i] / 3) * 100)} className="h-2" />
              </div>
              <Badge variant={totals.perTeam[i] >= 2 ? "default" : "secondary"}>{totals.perTeam[i]} judges</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
