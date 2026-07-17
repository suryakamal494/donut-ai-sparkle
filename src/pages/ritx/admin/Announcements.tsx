import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Send, Calendar, MessageCircle, Mail, Bell } from "lucide-react";
import { mockAnnouncements, type Announcement } from "@/data/ritx/resultsData";
import { toast } from "sonner";

const channels = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
  { id: "in-app", label: "In-app", icon: Bell },
] as const;

export default function RitxAdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>(mockAnnouncements);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("all-teams");
  const [selChannels, setSelChannels] = useState<Set<string>>(new Set(["in-app"]));
  const [schedule, setSchedule] = useState("");

  const toggle = (id: string) => setSelChannels((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const send = () => {
    if (!title || !body) return toast.error("Title and body are required");
    if (selChannels.size === 0) return toast.error("Pick at least one channel");
    const item: Announcement = {
      id: `a-${Date.now()}`,
      title, body, audience,
      channel: Array.from(selChannels) as Announcement["channel"],
      ...(schedule ? { scheduledAt: schedule } : { sentAt: new Date().toISOString() }),
    };
    setItems((i) => [item, ...i]);
    setTitle(""); setBody(""); setSchedule("");
    toast.success(schedule ? "Announcement scheduled" : "Announcement sent");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Announcements" description="Broadcast results, ceremony invites, and updates across channels." />

      <Card className="p-5 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Results are live!" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Audience</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v as Announcement["audience"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-teams">All teams</SelectItem>
                <SelectItem value="winners">Winners (gold/silver/bronze)</SelectItem>
                <SelectItem value="finalists">Finalists</SelectItem>
                <SelectItem value="staff">Mentors & judges</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Message</Label>
          <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Congratulations to all finalists…" />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Channels</Label>
            <div className="flex gap-2 flex-wrap">
              {channels.map((c) => (
                <label key={c.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm ${selChannels.has(c.id) ? "border-primary bg-primary/5" : "border-border"}`}>
                  <Checkbox checked={selChannels.has(c.id)} onCheckedChange={() => toggle(c.id)} />
                  <c.icon className="w-3.5 h-3.5" />{c.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />Schedule (optional)</Label>
            <Input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={send}><Send className="w-4 h-4 mr-1" />{schedule ? "Schedule" : "Send now"}</Button>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Megaphone className="w-4 h-4" />History</div>
        {items.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{a.title}</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{a.audience.replace("-", " ")}</Badge>
                {a.sentAt ? (
                  <Badge>Sent {new Date(a.sentAt).toLocaleDateString()}</Badge>
                ) : (
                  <Badge variant="secondary">Scheduled {new Date(a.scheduledAt!).toLocaleString()}</Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">{a.body}</div>
            <div className="mt-2 flex gap-2">
              {a.channel.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
