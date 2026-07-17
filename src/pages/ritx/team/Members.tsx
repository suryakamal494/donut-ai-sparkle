import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsentBadge } from "@/components/ritx/shared/AccessBadge";
import { mockTeams } from "@/data/ritx/mockData";
import type { TeamMember, ConsentStatus } from "@/data/ritx/mockData";
import { Plus, Send, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function RitxTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>(mockTeams[0].members);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<TeamMember>({ id: "", name: "", grade: "", email: "", parentEmail: "", consent: "pending" });

  const add = () => {
    if (!draft.name || !draft.parentEmail) { toast.error("Name and parent email required"); return; }
    setMembers([...members, { ...draft, id: `m${Date.now()}` }]);
    setDraft({ id: "", name: "", grade: "", email: "", parentEmail: "", consent: "pending" });
    setAdding(false);
    toast.success("Member added");
  };
  const sendConsent = (id: string) => {
    setMembers(members.map((m) => m.id === id ? { ...m, consent: "sent" as ConsentStatus } : m));
    toast.success("Consent request sent to parent");
  };
  const remove = (id: string) => setMembers(members.filter((m) => m.id !== id));
  const confirmedCount = members.filter((m) => m.consent === "confirmed").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Members & consent"
        description={`${confirmedCount} of ${members.length} consents confirmed`}
        actions={<Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-1" />Add member</Button>}
      />
      {adding && (
        <Card className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Grade</Label><Input value={draft.grade} onChange={(e) => setDraft({ ...draft, grade: e.target.value })} /></div>
            <div><Label>Student email</Label><Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
            <div><Label>Parent email</Label><Input value={draft.parentEmail} onChange={(e) => setDraft({ ...draft, parentEmail: e.target.value })} /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={add}>Add</Button>
          </div>
        </Card>
      )}
      <div className="space-y-2">
        {members.map((m) => (
          <Card key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{m.name} <span className="text-xs text-muted-foreground">· Grade {m.grade}</span></div>
              <div className="text-xs text-muted-foreground">Parent: {m.parentEmail}</div>
            </div>
            <ConsentBadge status={m.consent} />
            <div className="flex gap-2">
              {m.consent !== "confirmed" && (
                <Button size="sm" variant="outline" onClick={() => sendConsent(m.id)}>
                  <Send className="w-3 h-3 mr-1" /> {m.consent === "sent" ? "Resend" : "Send consent"}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => toast.info("Upload signed consent form")}>
                <Upload className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
