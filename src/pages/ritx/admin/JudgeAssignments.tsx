import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Gavel, X, Plus, Copy, Layers } from "lucide-react";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockStaff } from "@/data/ritx/staffData";
import { mockThemeAssignments, judgeIdsForTrack, setThemeJudges, mockAssignments } from "@/data/ritx/rubricData";
import { toast } from "sonner";

export default function RitxAdminJudgeAssignments() {
  const allJudges = mockStaff.filter((s) => s.judgeAccess);
  const [selectedTrack, setSelectedTrack] = useState<string>(mockCompetition.tracks[0].id);
  const [judgesByTrack, setJudgesByTrack] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(mockCompetition.tracks.map((t) => [t.id, [...judgeIdsForTrack(t.id)]])),
  );
  const [addJudgeValue, setAddJudgeValue] = useState<string>("");
  const [copyFrom, setCopyFrom] = useState<string>("");

  const currentJudges = judgesByTrack[selectedTrack] ?? [];
  const track = mockCompetition.tracks.find((t) => t.id === selectedTrack)!;
  const teamsInTrack = useMemo(() => mockTeams.filter((t) => t.trackId === selectedTrack), [selectedTrack]);

  const themeStats = (trackId: string) => {
    const teams = mockTeams.filter((t) => t.trackId === trackId);
    const rows = mockAssignments.filter((a) => teams.some((t) => t.id === a.teamId));
    const scored = rows.filter((r) => r.status === "scored").length;
    return { teams: teams.length, judges: (judgesByTrack[trackId] ?? []).length, scored, total: rows.length };
  };

  const commit = (trackId: string, judgeIds: string[]) => {
    setJudgesByTrack((prev) => ({ ...prev, [trackId]: judgeIds }));
    setThemeJudges(trackId, judgeIds);
  };

  const addJudge = () => {
    if (!addJudgeValue || currentJudges.includes(addJudgeValue)) return;
    commit(selectedTrack, [...currentJudges, addJudgeValue]);
    setAddJudgeValue("");
    toast.success("Judge added to theme");
  };

  const removeJudge = (jid: string) => {
    commit(selectedTrack, currentJudges.filter((x) => x !== jid));
  };

  const copyJudges = () => {
    if (!copyFrom) return;
    const src = judgesByTrack[copyFrom] ?? [];
    commit(selectedTrack, Array.from(new Set([...currentJudges, ...src])));
    setCopyFrom("");
    toast.success("Judges copied from theme");
  };

  const availableToAdd = allJudges.filter((j) => !currentJudges.includes(j.id));
  const totalPairs = Object.entries(judgesByTrack).reduce((sum, [tid, ids]) => sum + ids.length * mockTeams.filter((t) => t.trackId === tid).length, 0);
  const totalScored = mockAssignments.filter((a) => a.status === "scored").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Judge assignments"
        description="Assign judges to themes. Every team in a theme is automatically reviewed by its assigned judges."
      />

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Layers className="w-4 h-4" /></span>
          <div><div className="text-xs text-muted-foreground">Themes</div><div className="text-xl font-bold">{mockCompetition.tracks.length}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Users className="w-4 h-4" /></span>
          <div><div className="text-xs text-muted-foreground">Judges available</div><div className="text-xl font-bold">{allJudges.length}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Gavel className="w-4 h-4" /></span>
          <div><div className="text-xs text-muted-foreground">Reviews scored</div><div className="text-xl font-bold tabular-nums">{totalScored}/{totalPairs}</div></div>
        </Card>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        <Card className="p-2 h-fit">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Themes</div>
          <div className="space-y-1">
            {mockCompetition.tracks.map((t) => {
              const s = themeStats(t.id);
              const active = t.id === selectedTrack;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrack(t.id)}
                  className={`w-full text-left rounded-md px-3 py-2 transition ${active ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50 border border-transparent"}`}
                >
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{s.judges} judge{s.judges === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>{s.teams} team{s.teams === 1 ? "" : "s"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 space-y-5">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Theme</div>
            <div className="text-lg font-semibold">{track.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{track.description}</div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Assigned judges ({currentJudges.length})</div>
            {currentJudges.length === 0 ? (
              <div className="text-sm text-muted-foreground italic border border-dashed rounded-md px-3 py-4 text-center">
                No judges assigned yet. Add one below.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentJudges.map((jid) => {
                  const j = allJudges.find((x) => x.id === jid);
                  if (!j) return null;
                  return (
                    <div key={jid} className="inline-flex items-center gap-2 rounded-full border bg-muted/40 pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">{j.name}</span>
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">· {j.organisation}</span>
                      <button
                        onClick={() => removeJudge(jid)}
                        className="w-5 h-5 rounded-full hover:bg-rose-100 text-muted-foreground hover:text-rose-600 flex items-center justify-center"
                        aria-label={`Remove ${j.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[220px]">
              <div className="text-[11px] text-muted-foreground mb-1">Add judge</div>
              <Select value={addJudgeValue} onValueChange={setAddJudgeValue}>
                <SelectTrigger><SelectValue placeholder={availableToAdd.length ? "Select a judge…" : "All judges added"} /></SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.name} — {j.organisation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={addJudge} disabled={!addJudgeValue}><Plus className="w-4 h-4 mr-1" />Add</Button>

            <div className="flex-1 min-w-[220px]">
              <div className="text-[11px] text-muted-foreground mb-1">Copy judges from…</div>
              <Select value={copyFrom} onValueChange={setCopyFrom}>
                <SelectTrigger><SelectValue placeholder="Another theme" /></SelectTrigger>
                <SelectContent>
                  {mockCompetition.tracks.filter((t) => t.id !== selectedTrack).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={copyJudges} disabled={!copyFrom}><Copy className="w-4 h-4 mr-1" />Copy</Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teams in this theme</div>
              <Badge variant="secondary">{teamsInTrack.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
              {teamsInTrack.map((t) => (
                <span key={t.id} className="text-[11px] font-mono px-2 py-0.5 rounded border bg-background text-muted-foreground">
                  {t.teamCode}
                </span>
              ))}
              {teamsInTrack.length === 0 && <span className="text-xs text-muted-foreground italic">No teams registered in this theme yet.</span>}
            </div>
            <div className="text-[11px] text-muted-foreground mt-3">
              These {teamsInTrack.length} team{teamsInTrack.length === 1 ? "" : "s"} will appear in each assigned judge's queue automatically.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
