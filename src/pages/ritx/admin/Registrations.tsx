import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccessBadge, TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { Download, Upload, Search } from "lucide-react";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { toast } from "sonner";

export default function RitxRegistrations() {
  const [q, setQ] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");

  const filtered = mockTeams.filter((t) => {
    const match = !q || [t.teamName, t.school, t.city, t.teamCode].some((f) => f.toLowerCase().includes(q.toLowerCase()));
    const trackOk = trackFilter === "all" || t.trackId === trackFilter;
    return match && trackOk;
  });
  const trackName = (id: string) => mockCompetition.tracks.find((x) => x.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Registrations"
        description={`${filtered.length} of ${mockTeams.length} teams`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("Bulk import — Phase 1")}><Upload className="w-4 h-4 mr-1" />Import</Button>
            <Button variant="outline" onClick={() => toast.success("Export queued")}><Download className="w-4 h-4 mr-1" />Export</Button>
          </>
        }
      />
      <Card className="p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team, school, city, ID" className="pl-9" />
        </div>
        <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
          <option value="all">All tracks</option>
          {mockCompetition.tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Card>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team ID</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell><TeamIdChip code={t.teamCode} /></TableCell>
                <TableCell className="font-medium">{t.teamName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.school}<div className="text-xs">{t.city}, {t.state}</div></TableCell>
                <TableCell className="text-sm">{trackName(t.trackId)}<div className="text-xs text-muted-foreground">{t.subTheme}</div></TableCell>
                <TableCell>{t.members.length}</TableCell>
                <TableCell><AccessBadge status={t.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
