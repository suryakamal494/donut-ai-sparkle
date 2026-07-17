import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowDown, ArrowUp, CalendarClock, Eye, Plus, Save, Trash2 } from "lucide-react";
import { mockCompetition } from "@/data/ritx/mockData";
import {
  stageForms,
  extendDeadline,
  updateStageForm,
  fieldTypeLabel,
  type FieldType,
  type SubmissionField,
  type StageId,
  type StageForm,
  type FormSection,
} from "@/data/ritx/submissionData";
import { DeadlineTimer } from "@/components/ritx/shared/DeadlineTimer";
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
    <Card className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">{fieldTypeLabel[field.type]}</Badge>
        <span className="text-xs text-muted-foreground truncate flex-1">{field.label}</span>
        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="w-3.5 h-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="w-3.5 h-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 text-rose-600" /></Button>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <Label className="text-[11px]">Label</Label>
          <Input value={field.label} onChange={(e) => set("label", e.target.value)} maxLength={120} className="h-8" />
        </div>
        <div>
          <Label className="text-[11px]">Type</Label>
          <Select value={field.type} onValueChange={(v) => set("type", v as FieldType)}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{fieldTypeLabel[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-[11px]">Helper text</Label>
        <Input value={field.helper ?? ""} onChange={(e) => set("helper", e.target.value)} maxLength={200} className="h-8" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs">
          <Switch checked={field.required} onCheckedChange={(v) => set("required", v)} />
          Required
        </label>
        {hasLen && (
          <>
            <div className="flex items-center gap-1"><Label className="text-[11px]">Min</Label><Input type="number" className="w-16 h-8" value={field.min ?? ""} onChange={(e) => set("min", e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div className="flex items-center gap-1"><Label className="text-[11px]">Max</Label><Input type="number" className="w-16 h-8" value={field.max ?? ""} onChange={(e) => set("max", e.target.value ? Number(e.target.value) : undefined)} /></div>
          </>
        )}
        {isFile && (
          <>
            <div className="flex items-center gap-1"><Label className="text-[11px]">Accept</Label><Input className="w-36 h-8" placeholder="application/pdf" value={field.accept ?? ""} onChange={(e) => set("accept", e.target.value)} /></div>
            <div className="flex items-center gap-1"><Label className="text-[11px]">Max MB</Label><Input type="number" className="w-16 h-8" value={field.maxSizeMb ?? ""} onChange={(e) => set("maxSizeMb", e.target.value ? Number(e.target.value) : undefined)} /></div>
          </>
        )}
      </div>
      {hasOptions && (
        <div>
          <Label className="text-[11px]">Options (one per line)</Label>
          <Textarea rows={3} value={(field.options ?? []).join("\n")} onChange={(e) => set("options", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
        </div>
      )}
    </Card>
  );
}

function LivePreview({ stage }: { stage: StageForm }) {
  return (
    <Card className="p-3 space-y-2 bg-slate-50/60 max-h-[70vh] overflow-y-auto">
      <div className="text-xs font-semibold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Team preview</div>
      <Tabs defaultValue={stage.sections[0]?.id} className="w-full">
        <TabsList className="flex-wrap h-auto p-1">
          {stage.sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="text-[11px]">{s.label}</TabsTrigger>
          ))}
        </TabsList>
        {stage.sections.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-2 space-y-2">
            {s.builtInAttachments && (
              <div className="border border-dashed rounded-md p-2 text-[11px] text-muted-foreground">Built-in: multi-attachment uploader</div>
            )}
            {s.builtInDeck && (
              <div className="border border-dashed rounded-md p-2 text-[11px] text-muted-foreground">Built-in: pitch deck + demo video URL</div>
            )}
            {s.fields.map((f) => (
              <div key={f.id} className="space-y-0.5">
                <Label className="text-[11px]">{f.label}{f.required && <span className="text-rose-600 ml-0.5">*</span>}</Label>
                <Input placeholder={fieldTypeLabel[f.type]} disabled className="h-8" />
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

export default function RitxAdminSubmissionForms() {
  const [, forceTick] = useState(0);
  const rerender = () => forceTick((n) => n + 1);
  const [activeTrack, setActiveTrack] = useState(mockCompetition.tracks[0].id);
  const [activeStage, setActiveStage] = useState<StageId>("progress");
  const [activeSection, setActiveSection] = useState<string>("");

  const trackForms = useMemo(() => stageForms.find((f) => f.trackId === activeTrack)!, [activeTrack]);
  const stage = trackForms.stages[activeStage];
  const sectionId = activeSection || stage.sections[0]?.id;
  const section = stage.sections.find((s) => s.id === sectionId) ?? stage.sections[0];

  const commitStage = (next: StageForm) => {
    updateStageForm(activeTrack, activeStage, next);
    rerender();
  };

  const updateSection = (nextSection: FormSection) => {
    commitStage({
      ...stage,
      sections: stage.sections.map((s) => (s.id === nextSection.id ? nextSection : s)),
    });
  };

  const addField = () => updateSection({ ...section, fields: [...section.fields, newField()] });
  const changeField = (i: number, nf: SubmissionField) => {
    const fields = [...section.fields]; fields[i] = nf; updateSection({ ...section, fields });
  };
  const deleteField = (i: number) => updateSection({ ...section, fields: section.fields.filter((_, x) => x !== i) });
  const moveField = (i: number, dir: -1 | 1) => {
    const fields = [...section.fields]; const j = i + dir; if (j < 0 || j >= fields.length) return;
    [fields[i], fields[j]] = [fields[j], fields[i]]; updateSection({ ...section, fields });
  };

  const doExtend = (days: number) => {
    extendDeadline(activeTrack, activeStage, days);
    toast.success(`Deadline extended by ${days} day${days > 1 ? "s" : ""}`);
    rerender();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold">Submission forms</h1>
          <p className="text-xs text-muted-foreground">Configure the two submission stages per track: fields, deadlines, and lock state.</p>
        </div>
      </div>

      <Tabs value={activeTrack} onValueChange={setActiveTrack}>
        <TabsList className="flex-wrap h-auto p-1">
          {mockCompetition.tracks.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs">{t.name}</TabsTrigger>
          ))}
        </TabsList>
        {mockCompetition.tracks.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-3 space-y-3">
            {/* Stage sub-tabs */}
            <Tabs value={activeStage} onValueChange={(v) => { setActiveStage(v as StageId); setActiveSection(""); }}>
              <TabsList className="p-1">
                <TabsTrigger value="progress" className="text-xs">Progress submission</TabsTrigger>
                <TabsTrigger value="final" className="text-xs">Final submission</TabsTrigger>
              </TabsList>

              {(["progress", "final"] as StageId[]).map((sid) => (
                <TabsContent key={sid} value={sid} className="mt-3 space-y-3">
                  {/* Deadline strip */}
                  <Card className="p-3 flex flex-wrap items-center gap-3">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Opens</div>
                      <div className="text-xs font-medium">{new Date(stage.openAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">Deadline</div>
                      <div className="text-xs font-medium">{new Date(stage.deadlineAt).toLocaleString()}</div>
                    </div>
                    <DeadlineTimer stage={stage} />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8"><CalendarClock className="w-3.5 h-3.5 mr-1" />Extend</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="start">
                        <div className="text-xs font-semibold mb-2">Extend deadline by</div>
                        <div className="flex gap-1">
                          {[1, 3, 7].map((d) => (
                            <Button key={d} size="sm" variant="secondary" className="flex-1 h-8" onClick={() => doExtend(d)}>+{d}d</Button>
                          ))}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-2">Extending automatically updates the team-side countdown timer.</div>
                      </PopoverContent>
                    </Popover>
                    <label className="flex items-center gap-2 text-xs ml-auto">
                      <Switch checked={stage.editable} onCheckedChange={(v) => commitStage({ ...stage, editable: v })} />
                      Teams can edit
                    </label>
                    <Button size="sm" onClick={() => toast.success("Form saved")} className="h-8"><Save className="w-3.5 h-3.5 mr-1" /> Save</Button>
                  </Card>

                  {/* Section tabs */}
                  <Tabs value={sectionId} onValueChange={setActiveSection}>
                    <TabsList className="p-1 flex-wrap h-auto">
                      {stage.sections.map((s) => (
                        <TabsTrigger key={s.id} value={s.id} className="text-[11px]">{s.label}</TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {sid === activeStage && (
                    <div className="grid lg:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        {(section.builtInAttachments || section.builtInDeck) && (
                          <Card className="p-2 text-[11px] text-muted-foreground bg-amber-50/40 border-amber-100">
                            This section includes a built-in {section.builtInAttachments ? "multi-attachment uploader" : ""}
                            {section.builtInAttachments && section.builtInDeck ? " and " : ""}
                            {section.builtInDeck ? "pitch-deck + demo-video block" : ""}. Fields you add below appear below it.
                          </Card>
                        )}
                        {section.fields.map((f, i) => (
                          <FieldEditor
                            key={f.id}
                            field={f}
                            onChange={(nf) => changeField(i, nf)}
                            onDelete={() => deleteField(i)}
                            onMove={(d) => moveField(i, d)}
                            canUp={i > 0}
                            canDown={i < section.fields.length - 1}
                          />
                        ))}
                        <Button size="sm" variant="outline" onClick={addField} className="w-full h-8"><Plus className="w-3.5 h-3.5 mr-1" /> Add field</Button>
                      </div>
                      <div className="lg:sticky lg:top-4 self-start">
                        <LivePreview stage={stage} />
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}