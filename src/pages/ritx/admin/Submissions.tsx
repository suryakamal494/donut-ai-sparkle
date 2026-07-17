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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { DataTablePagination } from "@/components/ritx/shared/DataTablePagination";
import { SubmissionViewer } from "@/components/ritx/judging/SubmissionViewer";
import { AdminScoreRecap } from "@/components/ritx/judging/AdminScoreRecap";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockTeamSubmissions, stageLabel, stageTone, type SubmissionStage } from "@/data/ritx/submissionData";
import { judgingSummaryForTeam, assignmentsForTeam } from "@/data/ritx/rubricData";
import { mockStaff } from "@/data/ritx/staffData";
import { Search, Download, RotateCcw, Lock, Unlock, Eye, ChevronDown, ChevronRight, Columns3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---- helpers ----
function hashHue(code: string) {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}
function TeamAvatar({ code, name, hideName }: { code: string; name: string; hideName?: boolean }) {
  const hue = hashHue(code);
  const label = hideName ? code.slice(-4) : initials(name);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 75% 45%))` }}
    >
      {label}
    </div>
  );
}
function fmtScore(v: number | undefined | null) {
  if (v == null) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

type ColKey = "team" | "track" | "stage" | "judges" | "avg" | "spread" | "actions";

export default function RitxAdminSubmissions() {
  const [subs, setSubs] = useState(mockTeamSubmissions);
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [judgingFilter, setJudgingFilter] = useState<string>("all");
  const [reviewTeamId, setReviewTeamId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hideNames, setHideNames] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<ColKey, boolean>>({
    team: true, track: true, stage: true, judges: true, avg: true, spread: true, actions: true,
  });

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

  const judgingBadgeCls = (status: string) => {
    const tone = status === "complete" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "partial" ? "bg-amber-100 text-amber-700 border-amber-200"
      : status === "conflict" ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
    return `text-[10px] px-1.5 py-0.5 rounded border ${tone}`;
  };

  const toggleExpand = (id: string) => setExpanded((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleSelect = (id: string) => setSelected((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.team.id));
  const toggleAllPage = () => setSelected((prev) => {
    const n = new Set(prev);
    if (allOnPageSelected) pageRows.forEach((r) => n.delete(r.team.id));
    else pageRows.forEach((r) => n.add(r.team.id));
    return n;
  });

  const bulkSetStage = (stage: SubmissionStage) => {
    if (selected.size === 0) return;
    setSubs((prev) => prev.map((s) => (selected.has(s.teamId) ? { ...s, stage } : s)));
    toast.success(`${selected.size} team(s) → ${stageLabel[stage]}`);
    setSelected(new Set());
  };

  const activeChipCount = (trackFilter !== "all" ? 1 : 0) + (stageFilter !== "all" ? 1 : 0) + (judgingFilter !== "all" ? 1 : 0);
  const colSpanCount = 1 + (Object.values(visibleCols).filter(Boolean).length);

  return (
    <div className="space-y-4">
      <PageHeader title="Submissions & judging" description="Track every team's submission stage and view judge scoring — read-only." />

      {/* slim summary strip */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-baseline gap-1.5"><span className="text-2xl font-bold tabular-nums">{totals.submitted}</span><span className="text-xs text-muted-foreground">Submitted</span></div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex items-baseline gap-1.5"><span className="text-2xl font-bold tabular-nums text-amber-600">{totals.inProgress}</span><span className="text-xs text-muted-foreground">In progress</span></div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex items-baseline gap-1.5"><span className="text-2xl font-bold tabular-nums text-slate-500">{totals.notStarted}</span><span className="text-xs text-muted-foreground">Not started</span></div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex items-baseline gap-1.5"><span className="text-2xl font-bold tabular-nums text-rose-600">{totals.returned}</span><span className="text-xs text-muted-foreground">Returned</span></div>
          <div className="ml-auto text-xs text-muted-foreground">Showing {rows.length} of {subs.length} teams</div>
        </div>
      </Card>

      {/* chip filter bar */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 rounded-full" placeholder="Search team, code, school" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setPage(1); }}>
            <SelectTrigger className={cn("w-auto min-w-[130px] rounded-full h-9 gap-1", stageFilter !== "all" && "border-donut-coral text-donut-coral")}>
              <SelectValue placeholder="Set Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {Object.entries(stageLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={trackFilter} onValueChange={(v) => { setTrackFilter(v); setPage(1); }}>
            <SelectTrigger className={cn("w-auto min-w-[130px] rounded-full h-9 gap-1", trackFilter !== "all" && "border-donut-coral text-donut-coral")}>
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={judgingFilter} onValueChange={(v) => { setJudgingFilter(v); setPage(1); }}>
            <SelectTrigger className={cn("w-auto min-w-[130px] rounded-full h-9 gap-1", judgingFilter !== "all" && "border-donut-coral text-donut-coral")}>
              <SelectValue placeholder="Judging" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All judging</SelectItem>
              <SelectItem value="awaiting">Awaiting judges</SelectItem>
              <SelectItem value="partial">Partially scored</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="conflict">Conflict</SelectItem>
            </SelectContent>
          </Select>
          {activeChipCount > 0 && (
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setStageFilter("all"); setTrackFilter("all"); setJudgingFilter("all"); setPage(1); }}>
              Clear
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-9"><Columns3 className="w-4 h-4 mr-1" /> Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(visibleCols) as ColKey[]).filter((k) => k !== "team" && k !== "actions").map((k) => (
                  <DropdownMenuCheckboxItem key={k} checked={visibleCols[k]} onCheckedChange={(v) => setVisibleCols((s) => ({ ...s, [k]: !!v }))} onSelect={(e) => e.preventDefault()}>
                    {k === "avg" ? "Avg score" : k === "spread" ? "Score spread" : k.charAt(0).toUpperCase() + k.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={hideNames} onCheckedChange={(v) => setHideNames(!!v)} onSelect={(e) => e.preventDefault()}>
                  Anonymise team names
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="rounded-full h-9" onClick={() => toast.success("Export queued")}><Download className="w-4 h-4 mr-1" /> Export</Button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-sm">
            <span className="font-medium">{selected.size} selected</span>
            <div className="h-4 w-px bg-border mx-1" />
            <Select onValueChange={(v) => bulkSetStage(v as SubmissionStage)}>
              <SelectTrigger className="w-[170px] h-8"><SelectValue placeholder="Set stage ▾" /></SelectTrigger>
              <SelectContent>
                {Object.entries(stageLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear selection</Button>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10">
                <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAllPage} aria-label="Select all on page" />
              </TableHead>
              {visibleCols.team && <TableHead>Team</TableHead>}
              {visibleCols.track && <TableHead>Track / Sub-theme</TableHead>}
              {visibleCols.stage && <TableHead>Stage</TableHead>}
              {visibleCols.judges && <TableHead>Judges</TableHead>}
              {visibleCols.avg && <TableHead className="text-right">Avg score</TableHead>}
              {visibleCols.spread && <TableHead className="text-right">Spread</TableHead>}
              {visibleCols.actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map(({ sub, team, judging }) => {
              const isExpanded = expanded.has(team.id);
              const judgeRows = assignmentsForTeam(team.id);
              const scores = judgeRows.filter((a) => a.status === "scored").map((a) => a.score!).filter((v) => v != null);
              const min = scores.length ? Math.min(...scores) : null;
              const max = scores.length ? Math.max(...scores) : null;
              const spread = min != null && max != null ? max - min : null;
              const outlier = spread != null && spread >= 1.5;
              const avg = judging.average;
              return (
                <>
                  <TableRow key={team.id} className={cn("hover:bg-muted/30", selected.has(team.id) && "bg-orange-50/60")}>
                    <TableCell className="w-10">
                      <Checkbox checked={selected.has(team.id)} onCheckedChange={() => toggleSelect(team.id)} aria-label={`Select ${team.teamName}`} />
                    </TableCell>
                    {visibleCols.team && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => toggleExpand(team.id)} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Expand judges">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <TeamAvatar code={team.teamCode} name={team.teamName} hideName={hideNames} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{hideNames ? "Anonymous team" : team.teamName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <TeamIdChip code={team.teamCode} />
                              {!hideNames && <span className="truncate max-w-[180px]">{team.school}</span>}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleCols.track && (
                      <TableCell>
                        <div className="text-sm">{trackName(team.trackId)}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">{team.subTheme}</div>
                      </TableCell>
                    )}
                    {visibleCols.stage && (
                      <TableCell>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${stageTone[sub.stage]}`}>{stageLabel[sub.stage]}</span>
                        <div className="mt-1.5 w-28"><Progress value={sub.progressPct} className="h-1.5" /></div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{sub.progressPct}% · v{sub.version}</div>
                      </TableCell>
                    )}
                    {visibleCols.judges && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {judgeRows.slice(0, 3).map((a) => {
                              const s = mockStaff.find((x) => x.id === a.judgeId);
                              const hue = hashHue(a.judgeId);
                              const dot = a.status === "scored" ? "bg-emerald-500" : a.status === "in-progress" ? "bg-amber-500" : "bg-slate-300";
                              return (
                                <div key={a.judgeId} className="relative" title={`${s?.name} — ${a.status}`}>
                                  <div className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-semibold text-white" style={{ background: `hsl(${hue} 65% 45%)` }}>
                                    {s ? initials(s.name) : "?"}
                                  </div>
                                  <span className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background", dot)} />
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-xs">
                            <div className="tabular-nums font-medium">{judging.scored}/{judging.assigned}</div>
                            <span className={judgingBadgeCls(judging.status)}>{judging.status}</span>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleCols.avg && (
                      <TableCell className="text-right">
                        <div className="text-lg font-semibold tabular-nums">{avg != null ? avg.toFixed(2) : <span className="text-muted-foreground text-sm font-normal">—</span>}</div>
                        {avg != null && <div className="text-[10px] text-muted-foreground">/10</div>}
                      </TableCell>
                    )}
                    {visibleCols.spread && (
                      <TableCell className="text-right">
                        {spread != null ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="tabular-nums text-sm">{fmtScore(min)}–{fmtScore(max)}</span>
                            {outlier && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-label="Score spread ≥ 1.5" />}
                          </div>
                        ) : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                    )}
                    {visibleCols.actions && (
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
                    )}
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell></TableCell>
                      <TableCell colSpan={colSpanCount - 1} className="py-3">
                        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Per-judge scoring · read-only</div>
                        <div className="overflow-x-auto rounded border bg-background">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium">Judge</th>
                                <th className="text-right px-3 py-2 font-medium">Weighted score</th>
                                <th className="text-right px-3 py-2 font-medium">Δ from mean</th>
                                <th className="text-left px-3 py-2 font-medium">Status</th>
                                <th className="text-left px-3 py-2 font-medium">Scored on</th>
                                <th className="text-left px-3 py-2 font-medium">Comment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {judgeRows.map((a) => {
                                const s = mockStaff.find((x) => x.id === a.judgeId);
                                const delta = a.score != null && avg != null ? a.score - avg : null;
                                const flagged = delta != null && Math.abs(delta) >= 0.75;
                                return (
                                  <tr key={a.judgeId} className="border-t">
                                    <td className="px-3 py-2">
                                      <div className="font-medium">{s?.name ?? a.judgeId}</div>
                                      <div className="text-[10px] text-muted-foreground">{s?.organisation}</div>
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{a.score != null ? a.score.toFixed(2) : "—"}</td>
                                    <td className={cn("px-3 py-2 text-right tabular-nums", flagged ? "text-amber-600 font-medium" : "text-muted-foreground")}>
                                      {delta != null ? (delta > 0 ? "+" : "") + delta.toFixed(2) : "—"}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={judgingBadgeCls(a.status === "scored" ? "complete" : a.status === "in-progress" ? "partial" : "awaiting")}>
                                        {a.status.replace("-", " ")}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-muted-foreground">
                                      {a.scoredAt ? new Date(a.scoredAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[280px]">
                                      {a.comment || <span className="italic">—</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Admins cannot edit judge scores. Open <button className="underline" onClick={() => setReviewTeamId(team.id)}>Review</button> for the full submission.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
            {pageRows.length === 0 && (
              <TableRow><TableCell colSpan={colSpanCount} className="text-center text-sm text-muted-foreground py-10">No submissions match your filters.</TableCell></TableRow>
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