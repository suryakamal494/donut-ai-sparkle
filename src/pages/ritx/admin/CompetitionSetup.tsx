import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { mockCompetition, type CompetitionMode } from "@/data/mockData";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export default function RitxCompetitionSetup() {
  const [c, setC] = useState(mockCompetition);
  const [paidEnabled, setPaidEnabled] = useState(c.mode === "paid");

  const update = <K extends keyof typeof c>(k: K, v: (typeof c)[K]) => setC({ ...c, [k]: v });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competition setup"
        description="Configure mode, fees, team size, tracks and key dates"
        actions={<Button onClick={() => toast.success("Competition saved")}>Save changes</Button>}
      />
      <Card className="p-5 space-y-4">
        <div className="font-semibold">Basics</div>
        <div>
          <Label>Name</Label>
          <Input value={c.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Registration mode</Label>
            <Select value={c.mode} onValueChange={(v) => { update("mode", v as CompetitionMode); setPaidEnabled(v === "paid"); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="sponsored">Sponsored</SelectItem>
                <SelectItem value="invite">Invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fee (INR)</Label>
            <Input type="number" value={c.fee} onChange={(e) => update("fee", +e.target.value)} disabled={!paidEnabled} />
          </div>
          <div className="flex items-end gap-3 pb-2">
            <div className="flex items-center gap-2">
              <Switch checked={paidEnabled} onCheckedChange={(v) => { setPaidEnabled(v); update("mode", v ? "paid" : "free"); }} />
              <Label>Charge fee</Label>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Min team size</Label><Input type="number" value={c.minTeamSize} onChange={(e) => update("minTeamSize", +e.target.value)} /></div>
          <div><Label>Max team size</Label><Input type="number" value={c.maxTeamSize} onChange={(e) => update("maxTeamSize", +e.target.value)} /></div>
        </div>
      </Card>
      <Card className="p-5 space-y-4">
        <div className="font-semibold">Key dates</div>
        <div className="grid md:grid-cols-4 gap-3">
          <div><Label>Reg. opens</Label><Input type="date" value={c.registrationStart} onChange={(e) => update("registrationStart", e.target.value)} /></div>
          <div><Label>Reg. closes</Label><Input type="date" value={c.registrationEnd} onChange={(e) => update("registrationEnd", e.target.value)} /></div>
          <div><Label>Submission deadline</Label><Input type="date" value={c.submissionDeadline} onChange={(e) => update("submissionDeadline", e.target.value)} /></div>
          <div><Label>Results</Label><Input type="date" value={c.resultsDate} onChange={(e) => update("resultsDate", e.target.value)} /></div>
        </div>
      </Card>
      <Card className="p-5 space-y-4">
        <div className="font-semibold">Tracks &amp; sub-themes</div>
        {c.tracks.map((t, ti) => (
          <div key={t.id} className="p-4 rounded-lg border space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Track name</Label><Input value={t.name} onChange={(e) => {
                const nt = [...c.tracks]; nt[ti] = { ...t, name: e.target.value }; update("tracks", nt);
              }} /></div>
              <div><Label>Description</Label><Input value={t.description} onChange={(e) => {
                const nt = [...c.tracks]; nt[ti] = { ...t, description: e.target.value }; update("tracks", nt);
              }} /></div>
            </div>
            <div>
              <Label className="mb-2 block">Sub-themes</Label>
              <div className="flex flex-wrap gap-2">
                {t.subThemes.map((s, si) => (
                  <Badge key={si} variant="secondary" className="gap-1">
                    {s}
                    <button onClick={() => {
                      const nt = [...c.tracks]; nt[ti] = { ...t, subThemes: t.subThemes.filter((_, i) => i !== si) }; update("tracks", nt);
                    }}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
                <Button size="sm" variant="outline" className="h-6 gap-1" onClick={() => {
                  const nt = [...c.tracks]; nt[ti] = { ...t, subThemes: [...t.subThemes, "New theme"] }; update("tracks", nt);
                }}>
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
