import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { DataTablePagination } from "@/components/ritx/shared/DataTablePagination";
import { SubmissionViewer } from "@/components/ritx/judging/SubmissionViewer";
import { AdminScoreRecap } from "@/components/ritx/judging/AdminScoreRecap";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockTeamSubmissions, stageLabel, stageTone, type SubmissionStage } from "@/data/ritx/submissionData";
import { judgingSummaryForTeam } from "@/data/ritx/rubricData";
import { Search, Download, RotateCcw, Lock, Unlock, Eye } from "lucide-react";
import { toast } from "sonner";

export default function RitxAdminSubmissions() {
  const [subs, setSubs] = useState(mockTeamSubmissions);
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [judgingFilter, setJudgingFilter] = useState<string>("all");
  const [reviewTeamId, setReviewTeamId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  const rows = useMemo(() => subs
    .map((s) => ({ sub: s, team: mockTeams.find((t) => t.id === s.teamId)!, judging: judgingSummaryForTeam(s.teamId) }))
    .filter((r) => r.team)
    .filter((r) => (trackFilter === "all" ? true : r.team.trackId === trackFilter))
    .filter((r) => (stageFilter === "all" ? true : r.sub.stage === stageFilter))
    .filter((r) => (judgingFilter === "all" ? true : r.judging.status === judgingFilter))
    .filter((r) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return r.team.teamName.toLowerCase().includes(q) || r.team.teamCode.toLowerCase().includes(q) || r.team.school.toLowerCase().includes(q);
    }), [subs, trackFilter, stageFilter, judgingFilter, query]);

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

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

  const judgingBadge = (status: string) => {
    const tone = status === "complete" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "partial" ? "bg-amber-100 text-amber-700 border-amber-200"
      : status === "conflict" ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
    return `text-[10px] px-1.5 py-0.5 rounded border ${tone}`;
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Submissions & judging" description="Track every team's submission stage and view judge scoring — read-only." />
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
            <Input className="pl-9" placeholder="Search team, code, school" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          <Select value={trackFilter} onValueChange={(v) => { setTrackFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {Object.entries(stageLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={judgingFilter} onValueChange={(v) => { setJudgingFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All judging</SelectItem>
              <SelectItem value="awaiting">Awaiting judges</SelectItem>
              <SelectItem value="partial">Partially scored</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="conflict">Conflict</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success("Export queued")}><Download className="w-4 h-4 mr-1" /> Export</Button>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Judging</TableHead>
              <TableHead className="text-right">Avg score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map(({ sub, team, judging }) => (
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
                <TableCell className="w-[140px]">
                  <Progress value={sub.progressPct} className="h-2" />
                  <div className="text-[11px] text-muted-foreground mt-1">{sub.progressPct}% · v{sub.version}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium tabular-nums">{judging.scored}/{judging.assigned} scored</span>
                    <span className={judgingBadge(judging.status)}>{judging.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {judging.average != null ? judging.average.toFixed(2) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setReviewTeamId(team.id)} disabled={sub.stage === "not-started"}>
                      <Eye className="w-3 h-3 mr-1" /> Review
                    </Button>
                    {sub.stage === "submitted" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => setStage(team.id, "returned")} title="Return"><RotateCcw className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setStage(team.id, "locked")} title="Lock"><Lock className="w-3 h-3" /></Button>
                      </>
                    )}
                    {sub.stage === "locked" && (
                      <Button size="sm" variant="ghost" onClick={() => setStage(team.id, "submitted")} title="Unlock"><Unlock className="w-3 h-3" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pageRows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No submissions match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        <DataTablePagination page={page} pageSize={pageSize} total={rows.length} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      </Card>

      <Sheet open={!!reviewTeamId} onOpenChange={(v) => !v && setReviewTeamId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[min(1100px,95vw)] p-0 flex flex-col">
          <VisuallyHidden><SheetTitle>Submission review</SheetTitle></VisuallyHidden>
          {reviewTeamId && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-2 border-b flex items-center gap-2 bg-muted/30 text-xs">
                <Badge variant="outline" className="gap-1"><Lock className="w-3 h-3" /> Scores locked</Badge>
                <span className="text-muted-foreground">Only assigned judges can edit scores.</span>
              </div>
              <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                <ResizablePanel defaultSize={62} minSize={40}>
                  <SubmissionViewer teamId={reviewTeamId} mode="admin" />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={38} minSize={28}>
                  <AdminScoreRecap teamId={reviewTeamId} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}