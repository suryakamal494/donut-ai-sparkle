import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Wallet, Send, History } from "lucide-react";
import { mockWaTemplates, waWallet } from "@/data/ritx/staffData";
import { toast } from "sonner";

export default function RitxCommunications() {
  const [templates, setTemplates] = useState(mockWaTemplates);
  const [selected, setSelected] = useState(templates[0].id);
  const [audience, setAudience] = useState<string>("all-teams");
  const [body, setBody] = useState(templates[0].body);

  const pick = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSelected(id); setAudience(t.audience); setBody(t.body);
  };

  const send = () => {
    setTemplates(templates.map((t) => t.id === selected ? { ...t, sentCount: t.sentCount + 1, lastSent: new Date().toISOString().slice(0, 10) } : t));
    toast.success("WhatsApp broadcast queued");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="WhatsApp notifications" description="Broadcast reminders, consent nudges and session alerts" />
      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><Wallet className="w-5 h-5 text-emerald-700" /></div>
          <div><div className="text-xs text-muted-foreground">Wallet</div><div className="font-semibold">₹{waWallet.balance} · {waWallet.plan}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" /></div>
          <div><div className="text-xs text-muted-foreground">Used this month</div><div className="font-semibold">{waWallet.usedThisMonth} messages</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><History className="w-5 h-5 text-indigo-700" /></div>
          <div><div className="text-xs text-muted-foreground">Templates</div><div className="font-semibold">{templates.length}</div></div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2 lg:col-span-1">
          <div className="font-semibold text-sm">Templates</div>
          {templates.map((t) => (
            <button key={t.id} onClick={() => pick(t.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${selected === t.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}>
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{t.audience.replace("-", " ")} · sent {t.sentCount}×</div>
            </button>
          ))}
        </Card>
        <Card className="p-4 space-y-3 lg:col-span-2">
          <div className="font-semibold text-sm">Compose</div>
          <div>
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-teams">All teams</SelectItem>
                <SelectItem value="team-leads">Team leads</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
                <SelectItem value="staff">Staff (mentors/judges)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Message body</Label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Merge tags supported: <code>{"{{team_name}}"}</code>, <code>{"{{team_id}}"}</code>, <code>{"{{join_url}}"}</code></p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => toast.info("Preview sent to your number")}>Send test</Button>
            <Button onClick={send}><Send className="w-4 h-4 mr-1" />Broadcast</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
