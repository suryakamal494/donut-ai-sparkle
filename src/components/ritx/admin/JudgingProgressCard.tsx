import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gavel, ChevronDown, ChevronRight, CheckCircle2, Clock, Circle, AlertTriangle } from "lucide-react";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockAssignments, judgeIdsForTrack } from "@/data/ritx/rubricData";
import { mockStaff } from "@/data/ritx/staffData";

function StatPill({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; tone: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2">
      <span className={`w-7 h-7 rounded-md flex items-center justify-center ${tone}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground truncate">{label}</div>
      </div>
    </div>
  );
}

function SegmentMeter({ done, inProgress, total }: { done: number; inProgress: number; total: number }) {
  const cells = Math.max(total, 1);
  return (
    <div className="flex gap-[3px]" aria-label={`${done} of ${total} scored`}>
      {Array.from({ length: cells }).map((_, i) => {
        const isDone = i < done;
        const isProg = !isDone && i < done + inProgress;
        const cls = isDone
          ? "bg-emerald-500"
          : isProg
          ? "bg-amber-400"
          : "bg-muted";
        return <span key={i} className={`h-2 flex-1 rounded-sm ${cls}`} />;
      })}
    </div>
  );
}

export function JudgingProgressCard() {
  const [showTeams, setShowTeams] = useState(false);

  const perTheme = useMemo(() => mockCompetition.tracks.map((track) => {
    const teams = mockTeams.filter((t) => t.trackId === track.id);
    const rows = mockAssignments.filter((a) => teams.some((t) => t.id === a.teamId));
    const done = rows.filter((r) => r.status === "scored").length;
    const inProg = rows.filter((r) => r.status === "in-progress").length;
    const judges = judgeIdsForTrack(track.id).length;
    return { track, teams: teams.length, judges, total: rows.length, done, inProg };
  }), []);

  const perTeam = useMemo(() => mockTeams.map((t) => {
    const rows = mockAssignments.filter((a) => a.teamId === t.id);
    const done = rows.filter((r) => r.status === "scored").length;
    const inProg = rows.filter((r) => r.status === "in-progress").length;
    return { team: t, done, inProg, total: rows.length };
  }), []);

  const totals = useMemo(() => {
    const total = mockAssignments.length;
    const done = mockAssignments.filter((a) => a.status === "scored").length;
    const inProg = mockAssignments.filter((a) => a.status === "in-progress").length;
    const pending = total - done - inProg;
    const teamsDone = perTeam.filter((t) => t.total > 0 && t.done === t.total).length;
    const teamsPartial = perTeam.filter((t) => t.done > 0 && t.done < t.total).length;
    const teamsNone = perTeam.filter((t) => t.total > 0 && t.done === 0).length;
    const judges = mockStaff.filter((s) => s.judgeAccess).length;
    return { total, done, inProg, pending, teamsDone, teamsPartial, teamsNone, judges };
  }, [perTeam]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold flex items-center gap-2 text-foreground">
          <span className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Gavel className="w-3.5 h-3.5" />
          </span>
          Judging progress
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {totals.done}/{totals.total} reviews · {totals.judges} judges
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">Judges are assigned by theme — every team in a theme is reviewed by its assigned judges.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        <StatPill icon={CheckCircle2} label="Teams fully scored" value={totals.teamsDone} tone="bg-emerald-100 text-emerald-700" />
        <StatPill icon={Clock} label="Partially scored" value={totals.teamsPartial} tone="bg-amber-100 text-amber-700" />
        <StatPill icon={Circle} label="Not started" value={totals.teamsNone} tone="bg-slate-100 text-slate-600" />
        <StatPill icon={Gavel} label="Reviews pending" value={totals.pending + totals.inProg} tone="bg-primary/10 text-primary" />
      </div>

      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">By theme</div>
        {perTheme.map(({ track, teams, judges, total, done, inProg }) => {
          const pct = total ? Math.round((done / total) * 100) : 0;
          const late = total > 0 && done === 0;
          return (
            <div key={track.id} className="grid grid-cols-[minmax(0,1fr)_minmax(140px,220px)_auto] items-center gap-3 py-1.5">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{track.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {teams} team{teams === 1 ? "" : "s"} · {judges} judge{judges === 1 ? "" : "s"}
                </div>
              </div>
              <SegmentMeter done={done} inProgress={inProg} total={total} />
              <div className="text-xs tabular-nums text-muted-foreground min-w-[64px] text-right flex items-center justify-end gap-1">
                {late && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                <span className="font-medium text-foreground">{done}/{total}</span>
                <span className="opacity-60">· {pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t pt-3">
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 -ml-2" onClick={() => setShowTeams((v) => !v)}>
          {showTeams ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
          {showTeams ? "Hide" : "Show"} team-level breakdown
        </Button>
        {showTeams && (
          <div className="mt-2 rounded-md border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Team</th>
                  <th className="text-left px-3 py-2 font-medium">Theme</th>
                  <th className="text-left px-3 py-2 font-medium">Judges done</th>
                  <th className="px-3 py-2 font-medium w-8"></th>
                </tr>
              </thead>
              <tbody>
                {perTeam.map(({ team, done, total }, i) => {
                  const state = total === 0 ? "none" : done === total ? "done" : done === 0 ? "late" : "partial";
                  const dot = state === "done" ? "bg-emerald-500" : state === "partial" ? "bg-amber-400" : state === "late" ? "bg-rose-400" : "bg-slate-300";
                  const track = mockCompetition.tracks.find((t) => t.id === team.trackId);
                  return (
                    <tr key={team.id} className={i % 2 ? "bg-muted/20" : ""}>
                      <td className="px-3 py-1.5"><TeamIdChip code={team.teamCode} /></td>
                      <td className="px-3 py-1.5 text-muted-foreground truncate max-w-[180px]">{track?.name}</td>
                      <td className="px-3 py-1.5 tabular-nums">{done}/{total}</td>
                      <td className="px-3 py-1.5"><span className={`inline-block w-2 h-2 rounded-full ${dot}`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}