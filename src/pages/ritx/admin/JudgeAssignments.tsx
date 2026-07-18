import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Gavel, X, Plus, Layers, Globe, Tag } from "lucide-react";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockStaff } from "@/data/ritx/staffData";
import { mockThemeAssignments, judgeIdsForTrack, setScopeJudges, mockAssignments } from "@/data/ritx/rubricData";
import { toast } from "sonner";

type ScopeKey = string; // `${trackId}::${subTheme ?? ""}`
const scopeKey = (trackId: string, subTheme?: string): ScopeKey => `${trackId}::${subTheme ?? ""}`;

export default function RitxAdminJudgeAssignments() {
  const allJudges = mockStaff.filter((s) => s.judgeAccess);
  const [selectedTrack, setSelectedTrack] = useState<string>(mockCompetition.tracks[0].id);
  // Map every scope (whole-theme or per-sub-theme) → its judge list.
  const [scopeJudges, setScopeJudgesState] = useState<Record<ScopeKey, string[]>>(() => {
    const map: Record<ScopeKey, string[]> = {};
    mockThemeAssignments.forEach((s) => {
      map[scopeKey(s.trackId, s.subTheme)] = [...s.judgeIds];
    });
    // Ensure every track has a "whole theme" bucket even if empty.
    mockCompetition.tracks.forEach((t) => {
      const k = scopeKey(t.id);
      if (!map[k]) map[k] = [];
    });
    return map;
  });
  const [addJudgeValues, setAddJudgeValues] = useState<Record<ScopeKey, string>>({});
  const [newSubThemeScope, setNewSubThemeScope] = useState<string>("");

  const track = mockCompetition.tracks.find((t) => t.id === selectedTrack)!;
  const teamsInTrack = useMemo(() => mockTeams.filter((t) => t.trackId === selectedTrack), [selectedTrack]);

  const themeStats = (trackId: string) => {
    const teams = mockTeams.filter((t) => t.trackId === trackId);
    const rows = mockAssignments.filter((a) => teams.some((t) => t.id === a.teamId));
    const scored = rows.filter((r) => r.status === "scored").length;
    return { teams: teams.length, judges: judgeIdsForTrack(trackId).length, scored, total: rows.length };
  };

  const commitScope = (trackId: string, subTheme: string | undefined, judgeIds: string[]) => {
    setScopeJudgesState((prev) => ({ ...prev, [scopeKey(trackId, subTheme)]: judgeIds }));
    setScopeJudges(trackId, subTheme, judgeIds);
  };

  const addJudge = (subTheme: string | undefined) => {
    const key = scopeKey(selectedTrack, subTheme);
    const jid = addJudgeValues[key];
    const current = scopeJudges[key] ?? [];
    if (!jid || current.includes(jid)) return;
    commitScope(selectedTrack, subTheme, [...current, jid]);
    setAddJudgeValues((prev) => ({ ...prev, [key]: "" }));
    toast.success("Judge added");
  };

  const removeJudge = (subTheme: string | undefined, jid: string) => {
    const key = scopeKey(selectedTrack, subTheme);
    const current = scopeJudges[key] ?? [];
    commitScope(selectedTrack, subTheme, current.filter((x) => x !== jid));
  };

  const addSubThemeScope = () => {
    if (!newSubThemeScope) return;
    const key = scopeKey(selectedTrack, newSubThemeScope);
    if (scopeJudges[key]) {
      toast.info("This sub-theme already has a scope.");
      setNewSubThemeScope("");
      return;
    }
    setScopeJudgesState((prev) => ({ ...prev, [key]: [] }));
    setNewSubThemeScope("");
  };

  const wholeThemeKey = scopeKey(selectedTrack);
  const wholeThemeJudges = scopeJudges[wholeThemeKey] ?? [];
  const subThemeScopes = track.subThemes
    .map((st) => ({ subTheme: st, key: scopeKey(selectedTrack, st), judgeIds: scopeJudges[scopeKey(selectedTrack, st)] }))
    .filter((s) => s.judgeIds !== undefined) as { subTheme: string; key: ScopeKey; judgeIds: string[] }[];
  const unusedSubThemes = track.subThemes.filter((st) => !scopeJudges[scopeKey(selectedTrack, st)]);

  const totalPairs = mockAssignments.length;
  const totalScored = mockAssignments.filter((a) => a.status === "scored").length;

  const ScopeBlock = ({
    subTheme,
    label,
    icon: Icon,
    hint,
    judgeIds,
    removable,
  }: {
    subTheme: string | undefined;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hint: string;
    judgeIds: string[];
    removable: boolean;
  }) => {
    const key = scopeKey(selectedTrack, subTheme);
    const availableToAdd = allJudges.filter((j) => !judgeIds.includes(j.id));
    return (
      <div className="rounded-lg border bg-muted/20 p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-background border flex items-center justify-center text-muted-foreground shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{label}</div>
              <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
            </div>
          </div>
          {removable && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => commitScope(selectedTrack, subTheme, [])}>
              <X className="w-3.5 h-3.5 mr-1" /> Remove scope
            </Button>
          )}
        </div>

        {judgeIds.length === 0 ? (
          <div className="text-xs italic text-muted-foreground pl-8">No judges yet.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pl-8">
            {judgeIds.map((jid) => {
              const j = allJudges.find((x) => x.id === jid);
              if (!j) return null;
              return (
                <div key={jid} className="inline-flex items-center gap-1.5 rounded-full border bg-background pl-2.5 pr-1 py-0.5 text-xs">
                  <span className="font-medium">{j.name}</span>
                  <button
                    onClick={() => removeJudge(subTheme, jid)}
                    className="w-4 h-4 rounded-full hover:bg-rose-100 text-muted-foreground hover:text-rose-600 flex items-center justify-center"
                    aria-label={`Remove ${j.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pl-8">
          <div className="flex-1 min-w-0">
            <Select value={addJudgeValues[key] ?? ""} onValueChange={(v) => setAddJudgeValues((prev) => ({ ...prev, [key]: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={availableToAdd.length ? "Add a judge…" : "All judges added"} /></SelectTrigger>
              <SelectContent>
                {availableToAdd.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.name} — {j.organisation}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" className="h-8" onClick={() => addJudge(subTheme)} disabled={!addJudgeValues[key]}>
            <Plus className="w-3.5 h-3.5 mr-1" />Add
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Judge assignments"
        description="Assign judges to a whole theme or scope them to specific sub-themes. Every team is reviewed by the union of matching judges."
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

          <div className="space-y-3">
            <ScopeBlock
              subTheme={undefined}
              label="Whole theme"
              icon={Globe}
              hint="Reviews every team in this theme, across all sub-themes."
              judgeIds={wholeThemeJudges}
              removable={false}
            />

            {subThemeScopes.map((s) => (
              <ScopeBlock
                key={s.key}
                subTheme={s.subTheme}
                label={s.subTheme}
                icon={Tag}
                hint={`Extra judges — only reviews teams whose sub-theme is "${s.subTheme}".`}
                judgeIds={s.judgeIds}
                removable
              />
            ))}

            {unusedSubThemes.length > 0 && (
              <div className="flex gap-2 items-end pt-1">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground mb-1">Add a sub-theme scope</div>
                  <Select value={newSubThemeScope} onValueChange={setNewSubThemeScope}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick a sub-theme…" /></SelectTrigger>
                    <SelectContent>
                      {unusedSubThemes.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="outline" className="h-8" onClick={addSubThemeScope} disabled={!newSubThemeScope}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add sub-theme
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teams in this theme</div>
              <Badge variant="secondary">{teamsInTrack.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {track.subThemes.map((st) => {
                const teams = teamsInTrack.filter((t) => t.subTheme === st);
                if (teams.length === 0) return null;
                const effJudges = wholeThemeJudges.length + (scopeJudges[scopeKey(selectedTrack, st)]?.length ?? 0);
                return (
                  <div key={st} className="flex items-start gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-muted/40 shrink-0">
                      <Tag className="w-3 h-3" />{st}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1">
                        {teams.map((t) => (
                          <span key={t.id} className="font-mono text-[10px] px-1.5 py-0.5 rounded border bg-background text-muted-foreground">{t.teamCode}</span>
                        ))}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {teams.length} team{teams.length === 1 ? "" : "s"} · {effJudges} effective judge{effJudges === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                );
              })}
              {teamsInTrack.length === 0 && <span className="text-xs text-muted-foreground italic">No teams registered in this theme yet.</span>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
