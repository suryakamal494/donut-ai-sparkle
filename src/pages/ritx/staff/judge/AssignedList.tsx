import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { DataTablePagination } from "@/components/ritx/shared/DataTablePagination";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { assignmentsForJudge, scoreTone, statusLabel } from "@/data/ritx/rubricData";
import { EyeOff, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock: current judge is s3 (Anita), matches staff/Layout demo
const CURRENT_JUDGE_ID = "s3";

export default function RitxJudgeAssigned() {
  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rows = useMemo(() => {
    return assignmentsForJudge(CURRENT_JUDGE_ID)
      .map((a) => ({ a, team: mockTeams.find((t) => t.id === a.teamId)! }))
      .filter((x) => x.team);
  }, []);

  const totals = {
    assigned: rows.length,
    scored: rows.filter((r) => r.a.status === "scored").length,
    inProgress: rows.filter((r) => r.a.status === "in-progress").length,
    pending: rows.filter((r) => r.a.status === "pending").length,
  };

  const filtered = rows
    .filter((r) => trackFilter === "all" || r.team.trackId === trackFilter)
    .filter((r) => statusFilter === "all" || r.a.status === statusFilter)
    .filter((r) => !query || r.team.teamCode.toLowerCase().includes(query.toLowerCase()));

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const actionLabel = (s: string) =>
    s === "scored" ? "View / revise" : s === "in-progress" ? "Continue" : "Start scoring";

  return (
    <div className="space-y-4">
      <PageHeader title="Judging queue" description={`Blind view — ${totals.assigned} submissions assigned to you`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3"><div className="text-xs text-muted-foreground">Assigned</div><div className="text-xl font-bold">{totals.assigned}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Scored</div><div className="text-xl font-bold text-emerald-600">{totals.scored}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">In progress</div><div className="text-xl font-bold text-amber-600">{totals.inProgress}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Pending</div><div className="text-xl font-bold text-slate-500">{totals.pending}</div></Card>
      </div>

      <Card className="p-3 flex items-center gap-2 bg-indigo-50 border-indigo-200">
        <EyeOff className="w-4 h-4 text-indigo-700 shrink-0" />
        <div className="text-sm text-indigo-900">Blind mode — you see only Team IDs, track and sub-theme. School, member and location details are hidden.</div>
      </Card>

      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search team ID" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          <Select value={trackFilter} onValueChange={(v) => { setTrackFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="scored">Scored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team ID</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Sub-theme</TableHead>
                <TableHead>Your status</TableHead>
                <TableHead className="text-right">Your score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map(({ a, team }) => (
                <TableRow key={team.id}>
                  <TableCell><TeamIdChip code={team.teamCode} /></TableCell>
                  <TableCell className="text-sm">{trackName(team.trackId)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{team.subTheme}</TableCell>
                  <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full border ${scoreTone(a.status)}`}>{statusLabel(a.status)}</span></TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{a.status === "scored" && a.score != null ? `${a.score.toFixed(2)}/10` : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={a.status === "scored" ? "outline" : "default"} onClick={() => navigate(`/ritx/staff/judge/${team.id}`)}>
                      {actionLabel(a.status)} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">No submissions match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      </Card>
    </div>
  );
}
