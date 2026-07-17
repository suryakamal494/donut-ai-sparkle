import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Save, Eye } from "lucide-react";
import { mockCompetition } from "@/data/ritx/mockData";
import { initialForms, fieldTypeLabel, type FieldType, type SubmissionField, type TrackSubmissionForm } from "@/data/ritx/submissionData";
import { toast } from "sonner";

const TYPES: FieldType[] = ["short-text", "long-text", "number", "url", "select", "multi-select", "file", "video-url"];

function newField(): SubmissionField {
  return { id: `f-${Math.random().toString(36).slice(2, 8)}`, type: "short-text", label: "New field", required: false };
}

function FieldEditor({ field, onChange, onDelete, onMove, canUp, canDown }: {
  field: SubmissionField;
  onChange: (f: SubmissionField) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
}) {
  const set = <K extends keyof SubmissionField>(k: K, v: SubmissionField[K]) => onChange({ ...field, [k]: v });
  const hasOptions = field.type === "select" || field.type === "multi-select";
  const hasLen = field.type === "short-text" || field.type === "long-text" || field.type === "number";
  const isFile = field.type === "file";

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <Badge variant="secondary" className="text-[10px]">{fieldTypeLabel[field.type]}</Badge>
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon" variant="ghost" disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Label</Label>
          <Input value={field.label} onChange={(e) => set("label", e.target.value)} maxLength={120} />
        </div>
        <div>
          <Label className="text-xs">Field type</Label>
          <Select value={field.type} onValueChange={(v) => set("type", v as FieldType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{fieldTypeLabel[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Helper text (optional)</Label>
        <Input value={field.helper ?? ""} onChange={(e) => set("helper", e.target.value)} maxLength={200} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={field.required} onCheckedChange={(v) => set("required", v)} />
          Required
        </label>
        {hasLen && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Min</Label>
              <Input type="number" className="w-24" value={field.min ?? ""} onChange={(e) => set("min", e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Max</Label>
              <Input type="number" className="w-24" value={field.max ?? ""} onChange={(e) => set("max", e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </>
        )}
        {isFile && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Accept</Label>
              <Input className="w-48" placeholder="application/pdf" value={field.accept ?? ""} onChange={(e) => set("accept", e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Max MB</Label>
              <Input type="number" className="w-20" value={field.maxSizeMb ?? ""} onChange={(e) => set("maxSizeMb", e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </>
        )}
      </div>
      {hasOptions && (
        <div>
          <Label className="text-xs">Options (one per line)</Label>
          <Textarea rows={3} value={(field.options ?? []).join("\n")} onChange={(e) => set("options", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
        </div>
      )}
    </Card>
  );
}

function LivePreview({ form }: { form: TrackSubmissionForm }) {
  return (
    <Card className="p-5 space-y-4 bg-slate-50/60">
      <div className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4" /> Team preview</div>
      {form.fields.map((f) => (
        <div key={f.id} className="space-y-1">
          <Label className="text-sm">{f.label}{f.required && <span className="text-rose-600 ml-1">*</span>}</Label>
          {f.helper && <div className="text-xs text-muted-foreground">{f.helper}</div>}
          {f.type === "short-text" && <Input placeholder="Type your answer" disabled />}
          {f.type === "long-text" && <Textarea rows={3} placeholder="Type your answer" disabled />}
          {f.type === "number" && <Input type="number" placeholder="0" disabled />}
          {f.type === "url" && <Input type="url" placeholder="https://" disabled />}
          {f.type === "video-url" && <Input type="url" placeholder="https://youtube.com/…" disabled />}
          {f.type === "select" && (
            <Select disabled><SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger><SelectContent /></Select>
          )}
          {f.type === "multi-select" && (
            <div className="flex flex-wrap gap-1">{(f.options ?? []).map((o) => <Badge key={o} variant="outline" className="text-[11px]">{o}</Badge>)}</div>
          )}
          {f.type === "file" && (
            <div className="border-2 border-dashed rounded-md p-3 text-xs text-muted-foreground text-center">Drop file · {f.accept ?? "any"} · ≤{f.maxSizeMb ?? "?"}MB</div>
          )}
        </div>
      ))}
    </Card>
  );
}

export default function RitxAdminSubmissionForms() {
  const [forms, setForms] = useState<TrackSubmissionForm[]>(initialForms);
  const [activeTrack, setActiveTrack] = useState(mockCompetition.tracks[0].id);
  const form = useMemo(() => forms.find((f) => f.trackId === activeTrack)!, [forms, activeTrack]);

  const updateForm = (next: TrackSubmissionForm) =>
    setForms((prev) => prev.map((f) => (f.trackId === next.trackId ? next : f)));

  const addField = () => updateForm({ ...form, fields: [...form.fields, newField()] });
  const changeField = (i: number, nf: SubmissionField) => {
    const fields = [...form.fields]; fields[i] = nf; updateForm({ ...form, fields });
  };
  const deleteField = (i: number) => updateForm({ ...form, fields: form.fields.filter((_, x) => x !== i) });
  const moveField = (i: number, dir: -1 | 1) => {
    const fields = [...form.fields]; const j = i + dir; if (j < 0 || j >= fields.length) return;
    [fields[i], fields[j]] = [fields[j], fields[i]]; updateForm({ ...form, fields });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Submission forms" description="Configure the fields each team fills for their track." />
      <Tabs value={activeTrack} onValueChange={setActiveTrack}>
        <TabsList className="flex-wrap h-auto">
          {mockCompetition.tracks.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.name}</TabsTrigger>
          ))}
        </TabsList>
        {mockCompetition.tracks.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-4">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="text-sm text-muted-foreground">{form.fields.length} fields · updated {form.updatedAt}</div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.editable} onCheckedChange={(v) => updateForm({ ...form, editable: v })} />
                  Teams can edit
                </label>
                <Button size="sm" variant="outline" onClick={addField}><Plus className="w-4 h-4 mr-1" /> Add field</Button>
                <Button size="sm" onClick={() => toast.success("Form saved")}><Save className="w-4 h-4 mr-1" /> Save</Button>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                {form.fields.map((f, i) => (
                  <FieldEditor
                    key={f.id}
                    field={f}
                    onChange={(nf) => changeField(i, nf)}
                    onDelete={() => deleteField(i)}
                    onMove={(d) => moveField(i, d)}
                    canUp={i > 0}
                    canDown={i < form.fields.length - 1}
                  />
                ))}
                {form.fields.length === 0 && (
                  <Card className="p-6 text-center text-sm text-muted-foreground">No fields yet. Add your first field.</Card>
                )}
              </div>
              <div className="lg:sticky lg:top-4 self-start">
                <LivePreview form={form} />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}