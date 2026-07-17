import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockResources } from "@/data/ritx/staffData";
import { mockCompetition, mockTeams } from "@/data/ritx/mockData";
import { FileText, Video, FileType, Wrench, Download, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourcePreviewDialog } from "@/components/ritx/shared/ResourcePreviewDialog";

const icons = { guide: FileText, video: Video, template: FileType, worksheet: Wrench } as const;
const team = mockTeams[0];

export default function RitxTeamResources() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [preview, setPreview] = useState<{ title: string; url?: string; mime?: string } | null>(null);

  const filtered = mockResources.filter((r) => {
    const trackOk = filter === "all" || r.trackId === filter;
    const matchQ = !q || r.title.toLowerCase().includes(q.toLowerCase());
    return trackOk && matchQ;
  });

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader title="Resources" description="Materials shared by mentors, grouped by track" />
      <Card className="p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources" className="pl-9" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
          <option value="all">All tracks</option>
          <option value={team.trackId}>My track — {trackName(team.trackId)}</option>
          {mockCompetition.tracks.filter((t) => t.id !== team.trackId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r) => {
          const Icon = icons[r.type];
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Preview" onClick={() => setPreview({ title: r.title, url: r.url, mime: r.mime })}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Download" asChild>
                    <a href={r.url} download><Download className="w-3 h-3" /></a>
                  </Button>
                </div>
              </div>
              <div className="font-medium mt-2 line-clamp-2">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{trackName(r.trackId)}</div>
              <div className="text-[11px] text-muted-foreground mt-2">{r.uploadedBy} · {(r.sizeKb / 1024).toFixed(1)} MB</div>
            </Card>
          );
        })}
      </div>
      <ResourcePreviewDialog
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        title={preview?.title ?? ""}
        url={preview?.url}
        mime={preview?.mime}
      />
    </div>
  );
}
