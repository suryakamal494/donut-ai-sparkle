import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Gavel, BookOpen } from "lucide-react";
import { mockStaff, type StaffAccount } from "@/data/ritx/staffData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function AccessChip({ enabled, label, icon: Icon }: { enabled: boolean; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
      enabled ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
    )}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

export default function RitxStaff() {
  const [rows, setRows] = useState<StaffAccount[]>(mockStaff);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", organisation: "", mentorAccess: true, judgeAccess: false });

  const invite = () => {
    if (!draft.name || !draft.email) { toast.error("Name and email required"); return; }
    if (!draft.mentorAccess && !draft.judgeAccess) { toast.error("Grant at least one access"); return; }
    setRows([
      { id: `s${Date.now()}`, ...draft, invitedOn: new Date().toISOString().slice(0, 10), status: "invited" },
      ...rows,
    ]);
    setDraft({ name: "", email: "", organisation: "", mentorAccess: true, judgeAccess: false });
    setOpen(false);
    toast.success("Invite sent");
  };

  const toggleAccess = (id: string, key: "mentorAccess" | "judgeAccess") => {
    setRows(rows.map((r) => r.id === id ? { ...r, [key]: !r[key] } : r));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mentors & judges"
        description="One account per staff member. Grant Mentor or Judge access — or both."
        actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />Invite</Button>}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Toggle</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </TableCell>
                <TableCell className="text-sm">{r.organisation}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <AccessChip enabled={r.mentorAccess} label="Mentor" icon={BookOpen} />
                    <AccessChip enabled={r.judgeAccess} label="Judge" icon={Gavel} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1"><Checkbox checked={r.mentorAccess} onCheckedChange={() => toggleAccess(r.id, "mentorAccess")} />Mentor</label>
                    <label className="flex items-center gap-1"><Checkbox checked={r.judgeAccess} onCheckedChange={() => toggleAccess(r.id, "judgeAccess")} />Judge</label>
                  </div>
                </TableCell>
                <TableCell><span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", r.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200")}>{r.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite mentor or judge</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} type="email" /></div>
            <div><Label>Organisation</Label><Input value={draft.organisation} onChange={(e) => setDraft({ ...draft, organisation: e.target.value })} /></div>
            <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
              <div className="text-sm font-medium">Access</div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={draft.mentorAccess} onCheckedChange={(v) => setDraft({ ...draft, mentorAccess: !!v })} />
                <BookOpen className="w-4 h-4" /> Mentor — upload resources, host webinars
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={draft.judgeAccess} onCheckedChange={(v) => setDraft({ ...draft, judgeAccess: !!v })} />
                <Gavel className="w-4 h-4" /> Judge — blind view, rubric scoring
              </label>
              <p className="text-xs text-muted-foreground">Both can be enabled. Access flags control the staff shell tabs.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={invite}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
