import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Video, Users, Clock } from "lucide-react";
import { mockSessions, type Session } from "@/data/staffData";
import { mockCompetition } from "@/data/mockData";
import { toast } from "sonner";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function RitxMentorSessions() {
  const [items, setItems] = useState<Session[]>(mockSessions);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", mentorName: "Ms. Anita Kaur", trackId: "sci-investigator", date: "", time: "10:00", durationMin: 60, joinUrl: "" });

  const add = () => {
    if (!draft.title || !draft.date || !draft.joinUrl) { toast.error("Title, date and join URL required"); return; }
    const iso = new Date(`${draft.date}T${draft.time}:00`).toISOString();
    setItems([{ id: `w${Date.now()}`, title: draft.title, mentorName: draft.mentorName, trackId: draft.trackId, date: iso, durationMin: draft.durationMin, joinUrl: draft.joinUrl }, ...items]);
    setOpen(false);
    toast.success("Session scheduled");
  };

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader title="Webinars & office hours" description="Teams see these in their calendar with a join countdown" actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />Schedule</Button>} />

      <div className="grid gap-3">
        {items.map((s) => (
          <Card key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Video className="w-5 h-5 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.mentorName}</span>
                <span>·</span>
                <span>{trackName(s.trackId)}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatWhen(s.date)} · {s.durationMin} min</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule session</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
              <div><Label>Time</Label><Input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={draft.durationMin} onChange={(e) => setDraft({ ...draft, durationMin: +e.target.value })} /></div>
              <div>
                <Label>Track</Label>
                <Select value={draft.trackId} onValueChange={(v) => setDraft({ ...draft, trackId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Join URL</Label><Input value={draft.joinUrl} onChange={(e) => setDraft({ ...draft, joinUrl: e.target.value })} placeholder="https://meet.example/..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add}>Schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
