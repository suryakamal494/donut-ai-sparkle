import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, Video, FileType, Wrench, Trash2 } from "lucide-react";
import { mockResources, type Resource } from "@/data/ritx/staffData";
import { mockCompetition } from "@/data/ritx/mockData";
import { toast } from "sonner";

const icons: Record<Resource["type"], React.ComponentType<{ className?: string }>> = {
  guide: FileText, video: Video, template: FileType, worksheet: Wrench,
};

export default function RitxMentorResources() {
  const [items, setItems] = useState<Resource[]>(mockResources);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Resource, "id" | "uploadedOn" | "sizeKb">>({ title: "", trackId: "sci-investigator", type: "guide", uploadedBy: "Ms. Anita Kaur" });

  const add = () => {
    if (!draft.title) { toast.error("Title required"); return; }
    setItems([{ ...draft, id: `r${Date.now()}`, uploadedOn: new Date().toISOString().slice(0, 10), sizeKb: Math.floor(Math.random() * 4000) + 100 }, ...items]);
    setDraft({ ...draft, title: "" });
    setOpen(false);
    toast.success("Resource uploaded");
  };

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader title="Resources" description="Theme-wise materials for teams" actions={<Button onClick={() => setOpen(true)}><Upload className="w-4 h-4 mr-1" />Upload</Button>} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((r) => {
          const Icon = icons[r.type];
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setItems(items.filter((x) => x.id !== r.id))}><Trash2 className="w-3 h-3" /></Button>
              </div>
              <div className="font-medium mt-2 line-clamp-2">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{trackName(r.trackId)}</div>
              <div className="text-[11px] text-muted-foreground mt-2 flex justify-between">
                <span>{r.uploadedBy}</span>
                <span>{(r.sizeKb / 1024).toFixed(1)} MB</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload resource</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div>
              <Label>Track</Label>
              <Select value={draft.trackId} onValueChange={(v) => setDraft({ ...draft, trackId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as Resource["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="worksheet">Worksheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-6 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground">
              Drag & drop a file, or <button className="text-primary underline">browse</button>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add}>Upload</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
