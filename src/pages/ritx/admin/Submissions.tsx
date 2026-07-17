import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockTeamSubmissions, stageLabel, stageTone, type SubmissionStage } from "@/data/ritx/submissionData";
import { Search, Download, RotateCcw, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export default function RitxAdminSubmissions() {
  const [subs, setSubs] = useState(mockTeamSubmissions);
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;
  const rows = subs
    .map((s) => ({ sub: s, team: mockTeams.find((t) => t.id === s.teamId)! }))
    .filter((r) => r.team)
    .filter((r) => (trackFilter === "all" ? true : r.team.trackId === trackFilter))
    .filter((r) => (stageFilter === "all" ? true : r.sub.stage === stageFilter))
    .filter((r) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return r.team.teamName.toLowerCase().includes(q) || r.team.teamCode.toLowerCase().includes(q) || r.team.school.toLowerCase().includes(q);
    });

  const setStage = (teamId: string, stage: SubmissionStage) => {
    setSubs((prev) => prev.map((s) => (s.teamId === teamId ? { ...s, stage } : s)));
    toast.success(`Marked ${stageLabel[stage]}`);
  };

  const totals = {
    submitted: subs.filter((s) => s.stage === "submitted" || s.stage === "locked").length,
    inProgress: subs.filter((s) => s.stage === "in-progress").length,
    notStarted: subs.filter((s) => s.stage === "not-started").length,
    returned: subs.filter((s) => s.stage === "returned").length,
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Submissions" description="Track every team's submission stage across tracks." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-xs text-muted-foreground">Submitted</div><div className="text-2xl font-semibold">{totals.submitted}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">In progress</div><div className="text-2xl font-semibold">{totals.inProgress}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Not started</div><div className="text-2xl font-semibold">{totals.notStarted}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Returned</div><div className="text-2xl font-semibold">{totals.returned}</div></Card>
      </div>
      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search team, code, school" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {Object.entries(stageLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}><Download className="w-4 h-4 mr-1" /> Export</Button>
        </div>
      </Card>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Last edited</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ sub, team }) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="font-medium">{team.teamName}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <TeamIdChip code={team.teamCode} />
                    <span className="truncate max-w-[180px]">{team.school}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{trackName(team.trackId)}</TableCell>
                <TableCell>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${stageTone[sub.stage]}`}>{stageLabel[sub.stage]}</span>
                </TableCell>
                <TableCell className="w-[160px]">
                  <Progress value={sub.progressPct} className="h-2" />
                  <div className="text-[11px] text-muted-foreground mt-1">{sub.progressPct}% · v{sub.version}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{sub.lastEditedAt ? new Date(sub.lastEditedAt).toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right">
                  {sub.stage === "submitted" ? (
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setStage(team.id, "returned")}><RotateCcw className="w-3 h-3 mr-1" /> Return</Button>
                      <Button size="sm" variant="outline" onClick={() => setStage(team.id, "locked")}><Lock className="w-3 h-3 mr-1" /> Lock</Button>
                    </div>
                  ) : sub.stage === "locked" ? (
                    <Button size="sm" variant="outline" onClick={() => setStage(team.id, "submitted")}><Unlock className="w-3 h-3 mr-1" /> Unlock</Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No submissions match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}