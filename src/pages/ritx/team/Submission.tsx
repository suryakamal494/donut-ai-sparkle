import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AccessBadge, TeamIdChip } from "@/components/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/mockData";
import { initialForms, mockTeamSubmissions, stageLabel, stageTone, type SubmissionField } from "@/data/submissionData";
import { AlertTriangle, Lock, Save, Send, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function validateField(f: SubmissionField, value: unknown): string | null {
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  if (f.required && empty) return "Required";
  if (empty) return null;
  if (f.type === "short-text" || f.type === "long-text") {
    const s = String(value); const n = s.trim().length;
    if (f.min && n < f.min) return `Min ${f.min} chars`;
    if (f.max && n > f.max) return `Max ${f.max} chars`;
  }
  if (f.type === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return "Must be a number";
    if (f.min !== undefined && n < f.min) return `Min ${f.min}`;
    if (f.max !== undefined && n > f.max) return `Max ${f.max}`;
  }
  if (f.type === "url" || f.type === "video-url") {
    try { new URL(String(value)); } catch { return "Invalid URL"; }
  }
  return null;
}

export default function RitxTeamSubmission() {
  const team = mockTeams[0];
  const track = mockCompetition.tracks.find((t) => t.id === team.trackId)!;
  const form = initialForms.find((f) => f.trackId === team.trackId)!;
  const record = mockTeamSubmissions.find((s) => s.teamId === team.id)!;
  const consentBlocked = team.members.some((m) => m.consent !== "confirmed");
  const locked = record.stage === "locked" || !form.editable;

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    form.fields.forEach((f) => { const err = validateField(f, values[f.id]); if (err) e[f.id] = err; });
    return e;
  }, [form.fields, values]);

  const filled = form.fields.filter((f) => {
    const v = values[f.id]; return !(v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0));
  }).length;
  const progress = Math.round((filled / form.fields.length) * 100);
  const canSubmit = !consentBlocked && !locked && Object.keys(errors).length === 0 && filled === form.fields.length;

  const set = (id: string, v: unknown) => setValues((prev) => ({ ...prev, [id]: v }));
  const markTouched = (id: string) => setTouched((prev) => ({ ...prev, [id]: true }));

  const submit = () => {
    const allTouched: Record<string, boolean> = {};
    form.fields.forEach((f) => (allTouched[f.id] = true));
    setTouched(allTouched);
    if (!canSubmit) { toast.error("Fix errors before submitting"); return; }
    toast.success("Submission received. You can edit until admin locks.");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Final submission"
        description={<span className="flex items-center gap-2"><TeamIdChip code={team.teamCode} /><AccessBadge status={team.status} /></span>}
      />

      {consentBlocked && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Consent incomplete</AlertTitle>
          <AlertDescription className="text-amber-800">
            All parent consents must be confirmed before you can submit. Currently{" "}
            {team.members.filter((m) => m.consent === "confirmed").length}/{team.members.length} confirmed.
          </AlertDescription>
        </Alert>
      )}

      {locked && (
        <Alert className="border-slate-200 bg-slate-50">
          <Lock className="h-4 w-4" />
          <AlertTitle>Submission locked</AlertTitle>
          <AlertDescription>Admin has locked edits. Contact your mentor if you need changes.</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{track.name}</Badge>
              <Badge variant="outline">{team.subTheme}</Badge>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ml-auto ${stageTone[record.stage]}`}>{stageLabel[record.stage]}</span>
            </div>
          </Card>

          {form.fields.map((f) => {
            const v = values[f.id]; const err = touched[f.id] && errors[f.id];
            return (
              <Card key={f.id} className="p-4 space-y-2">
                <Label className="text-sm">{f.label}{f.required && <span className="text-rose-600 ml-1">*</span>}</Label>
                {f.helper && <div className="text-xs text-muted-foreground">{f.helper}</div>}
                {f.type === "short-text" && (
                  <Input disabled={locked} value={(v as string) ?? ""} onChange={(e) => set(f.id, e.target.value)} onBlur={() => markTouched(f.id)} maxLength={f.max} />
                )}
                {f.type === "long-text" && (
                  <Textarea disabled={locked} rows={5} value={(v as string) ?? ""} onChange={(e) => set(f.id, e.target.value)} onBlur={() => markTouched(f.id)} />
                )}
                {f.type === "number" && (
                  <Input disabled={locked} type="number" value={(v as number | string) ?? ""} onChange={(e) => set(f.id, e.target.value)} onBlur={() => markTouched(f.id)} />
                )}
                {(f.type === "url" || f.type === "video-url") && (
                  <Input disabled={locked} type="url" placeholder="https://" value={(v as string) ?? ""} onChange={(e) => set(f.id, e.target.value)} onBlur={() => markTouched(f.id)} />
                )}
                {f.type === "select" && (
                  <Select disabled={locked} value={(v as string) ?? ""} onValueChange={(x) => { set(f.id, x); markTouched(f.id); }}>
                    <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
                    <SelectContent>{(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {f.type === "multi-select" && (
                  <div className="flex flex-wrap gap-1">
                    {(f.options ?? []).map((o) => {
                      const arr = (v as string[]) ?? [];
                      const on = arr.includes(o);
                      return (
                        <button key={o} type="button" disabled={locked}
                          onClick={() => { const next = on ? arr.filter((x) => x !== o) : [...arr, o]; set(f.id, next); markTouched(f.id); }}
                          className={`text-xs px-2 py-1 rounded-full border transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
                {f.type === "file" && (
                  <label className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center gap-1 text-xs text-muted-foreground cursor-pointer ${locked ? "opacity-60 pointer-events-none" : "hover:bg-accent/40"}`}>
                    <Upload className="w-5 h-5" />
                    <span>{v ? (v as { name: string }).name : "Click to upload"}</span>
                    <span className="text-[10px]">{f.accept ?? "any"} · ≤{f.maxSizeMb ?? "?"}MB</span>
                    <input type="file" className="hidden" accept={f.accept}
                      onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        if (f.maxSizeMb && file.size > f.maxSizeMb * 1024 * 1024) { toast.error(`File exceeds ${f.maxSizeMb}MB`); return; }
                        set(f.id, { name: file.name, size: file.size }); markTouched(f.id);
                      }} />
                  </label>
                )}
                {err && <div className="text-xs text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {err}</div>}
              </Card>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-4 self-start space-y-3">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Progress</div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">{filled}/{form.fields.length} fields · {progress}%</div>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" disabled={locked} onClick={() => toast.success("Draft saved")}><Save className="w-4 h-4 mr-1" /> Save draft</Button>
              <Button disabled={!canSubmit} onClick={submit}><Send className="w-4 h-4 mr-1" /> Submit</Button>
            </div>
            {canSubmit && (
              <div className="text-[11px] text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready to submit</div>
            )}
          </Card>
          <Card className="p-4 space-y-2">
            <div className="text-sm font-semibold">Deadline</div>
            <div className="text-sm">{mockCompetition.submissionDeadline}</div>
            <div className="text-xs text-muted-foreground">Late submissions are not accepted.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}