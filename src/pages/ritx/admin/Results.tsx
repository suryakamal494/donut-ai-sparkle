import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Award, Download, Send, Trophy } from "lucide-react";
import { mockTeams, mockCompetition } from "@/data/mockData";
import { initialResults, awardLabel, awardTone, type TeamResult } from "@/data/resultsData";
import { TeamIdChip } from "@/components/shared/AccessBadge";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { toast } from "sonner";

export default function RitxAdminResults() {
  const [results, setResults] = useState<TeamResult[]>(initialResults);
  const [reveal, setReveal] = useState(false);
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    if (trackFilter === "all") return results;
    return results.filter((r) => mockTeams.find((t) => t.id === r.teamId)?.trackId === trackFilter);
  }, [results, trackFilter]);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const flagged = results.filter((r) => r.spread >= 1.5);
  const publishedCount = results.filter((r) => r.status === "published").length;

  const setAward = (teamId: string, award: TeamResult["award"]) =>
    setResults((rs) => rs.map((r) => (r.teamId === teamId ? { ...r, award } : r)));

  const publishAll = () => {
    setResults((rs) => rs.map((r) => ({ ...r, status: "published" })));
    toast.success("Results published to all teams");
  };

  const team = (id: string) => mockTeams.find((t) => t.id === id)!;
  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader title="Results & moderation" description="Aggregate judge scores, resolve outliers, and publish awards." />

      <div className="grid sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Teams ranked</div><div className="text-2xl font-bold">{results.length}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Outliers (spread ≥ 1.5)</div><div className="text-2xl font-bold text-amber-600">{flagged.length}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Published</div><div className="text-2xl font-bold">{publishedCount}/{results.length}</div></Card>
        <Card className="p-4 flex items-center justify-center"><Button size="sm" onClick={publishAll}><Send className="w-4 h-4 mr-1" />Publish results</Button></Card>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="moderation">Moderation ({flagged.length})</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Select value={trackFilter} onValueChange={setTrackFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tracks</SelectItem>
                {mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setReveal((v) => !v)}>
                {reveal ? "Hide identities" : "Reveal identities"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("CSV export queued")}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
            </div>
          </div>

          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Team</th>
                  <th className="p-3 text-left">Track</th>
                  <th className="p-3 text-right">Average</th>
                  <th className="p-3 text-right">Judges</th>
                  <th className="p-3 text-right">Spread</th>
                  <th className="p-3 text-left">Award</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const t = team(r.teamId);
                  return (
                    <tr key={r.teamId} className="border-t">
                      <td className="p-3 font-bold tabular-nums">#{r.rank}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <TeamIdChip code={t.teamCode} />
                          {reveal && <span className="text-xs text-muted-foreground">{t.teamName} · {t.school}</span>}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{trackName(t.trackId)}</td>
                      <td className="p-3 text-right font-semibold tabular-nums">{r.average.toFixed(2)}</td>
                      <td className="p-3 text-right tabular-nums">{r.scores.length}</td>
                      <td className={`p-3 text-right tabular-nums ${r.spread >= 1.5 ? "text-amber-600 font-medium" : ""}`}>{r.spread.toFixed(2)}</td>
                      <td className="p-3">
                        {r.award && <Badge className={awardTone[r.award]} variant="outline">{awardLabel[r.award]}</Badge>}
                      </td>
                      <td className="p-3">
                        <Badge variant={r.status === "published" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <DataTablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        </TabsContent>

        <TabsContent value="moderation" className="mt-4 space-y-3">
          {flagged.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">All scores are within tolerance.</Card>
          )}
          {flagged.map((r) => {
            const t = team(r.teamId);
            return (
              <Card key={r.teamId} className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <TeamIdChip code={t.teamCode} />
                    <span className="text-xs text-muted-foreground">{trackName(t.trackId)}</span>
                  </div>
                  <div className="text-sm">Spread <span className="font-semibold text-amber-600">{r.spread.toFixed(2)}</span> · Avg {r.average.toFixed(2)}</div>
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  {r.scores.map((s, i) => (
                    <div key={i} className="p-2 rounded border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Judge {i + 1}</span>
                      <span className="font-semibold tabular-nums">{s.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.info("Requested third-judge review")}>Request third judge</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Marked as moderated")}>Accept average</Button>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="awards" className="mt-4 space-y-3">
          {results.map((r) => {
            const t = team(r.teamId);
            return (
              <Card key={r.teamId} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">#{r.rank}</div>
                  <div>
                    <div className="flex items-center gap-2"><TeamIdChip code={t.teamCode} /><span className="text-sm text-muted-foreground">{trackName(t.trackId)}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Avg {r.average.toFixed(2)} · {r.scores.length} judges</div>
                  </div>
                </div>
                <Select value={r.award} onValueChange={(v) => setAward(r.teamId, v as TeamResult["award"])}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">🥇 Gold</SelectItem>
                    <SelectItem value="silver">🥈 Silver</SelectItem>
                    <SelectItem value="bronze">🥉 Bronze</SelectItem>
                    <SelectItem value="finalist">Finalist</SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
