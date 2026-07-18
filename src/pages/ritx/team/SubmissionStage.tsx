import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, Upload, AlertTriangle, Trash2, Plus, CheckCircle2, Lock, Film, FileText } from "lucide-react";
import { DeadlineTimer } from "@/components/ritx/shared/DeadlineTimer";
import { PaywallGate } from "@/components/ritx/shared/PaywallGate";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import {
  getStageForm,
  stageWindowStatus,
  type StageId,
  type SubmissionField,
  type FormSection,
} from "@/data/ritx/submissionData";
import { EVIDENCE_CATEGORIES, evidenceCategory } from "@/data/ritx/submissionData";
import { toast } from "sonner";

const team = mockTeams[0];

interface Attachment {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  name: string;
  sizeKb: number;
}

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

function FieldRenderer({
  field, value, onChange, disabled, error, onBlur,
}: {
  field: SubmissionField; value: unknown; onChange: (v: unknown) => void; disabled: boolean; error?: string; onBlur: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">
        {field.label}
        {field.required && <span className="text-rose-600 ml-1">*</span>}
      </Label>
      {field.helper && <div className="text-[11px] text-muted-foreground -mt-0.5">{field.helper}</div>}
      {field.type === "short-text" && (
        <Input disabled={disabled} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} maxLength={field.max} className="h-9" />
      )}
      {field.type === "long-text" && (
        <Textarea disabled={disabled} rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      )}
      {field.type === "number" && (
        <Input disabled={disabled} type="number" value={(value as number | string) ?? ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className="h-9" />
      )}
      {(field.type === "url" || field.type === "video-url") && (
        <Input disabled={disabled} type="url" placeholder="https://" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className="h-9" />
      )}
      {field.type === "select" && (
        <Select disabled={disabled} value={(value as string) ?? ""} onValueChange={(v) => { onChange(v); onBlur(); }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Choose one" /></SelectTrigger>
          <SelectContent>{(field.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      )}
      {field.type === "multi-select" && (
        <div className="flex flex-wrap gap-1">
          {(field.options ?? []).map((o) => {
            const arr = (value as string[]) ?? [];
            const on = arr.includes(o);
            return (
              <button key={o} type="button" disabled={disabled}
                onClick={() => { const next = on ? arr.filter((x) => x !== o) : [...arr, o]; onChange(next); onBlur(); }}
                className={`text-[11px] px-2 py-1 rounded-full border transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                {o}
              </button>
            );
          })}
        </div>
      )}
      {field.type === "file" && (
        <label className={`border-2 border-dashed rounded-md p-3 flex flex-col items-center gap-1 text-xs text-muted-foreground cursor-pointer ${disabled ? "opacity-60 pointer-events-none" : "hover:bg-accent/40"}`}>
          <Upload className="w-4 h-4" />
          <span>{value ? (value as { name: string }).name : "Click to upload"}</span>
          <span className="text-[10px]">{field.accept ?? "any"} · ≤{field.maxSizeMb ?? "?"}MB</span>
          <input type="file" className="hidden" accept={field.accept}
            onChange={(e) => {
              const file = e.target.files?.[0]; if (!file) return;
              if (field.maxSizeMb && file.size > field.maxSizeMb * 1024 * 1024) { toast.error(`File exceeds ${field.maxSizeMb}MB`); return; }
              onChange({ name: file.name, size: file.size }); onBlur();
            }} />
        </label>
      )}
      {error && <div className="text-[11px] text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</div>}
    </div>
  );
}

function AttachmentsBlock({
  items, onChange, disabled,
}: { items: Attachment[]; onChange: (next: Attachment[]) => void; disabled: boolean }) {
  const [adding, setAdding] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [draft, setDraft] = useState<{ categoryId: string; title: string; description: string; name: string | null; sizeKb: number }>({
    categoryId: "", title: "", description: "", name: null, sizeKb: 0,
  });

  const resetDraft = () => setDraft({ categoryId: "", title: "", description: "", name: null, sizeKb: 0 });

  const save = () => {
    if (!draft.categoryId) { toast.error("Pick a category"); return; }
    if (!draft.title.trim()) { toast.error("Enter a title"); return; }
    if (!draft.name) { toast.error("Choose a file"); return; }
    onChange([
      ...items,
      {
        id: `att-${Date.now()}`,
        categoryId: draft.categoryId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        name: draft.name,
        sizeKb: draft.sizeKb,
      },
    ]);
    resetDraft();
    setAdding(false);
  };

  const grouped = EVIDENCE_CATEGORIES.map((c) => ({
    category: c,
    entries: items.filter((i) => i.categoryId === c.id),
  }));

  const renderRow = (a: Attachment) => {
    const cat = evidenceCategory(a.categoryId);
    return (
      <div key={a.id} className="flex items-start gap-3 py-2.5 border-b last:border-0">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {cat && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cat.tone}`}>
                {cat.label} · {cat.weight}%
              </span>
            )}
            <span className="text-sm font-medium truncate">{a.title}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <FileText className="w-3 h-3" />
            <span className="truncate">{a.name}</span>
            <span>· {a.sizeKb} KB</span>
          </div>
          {a.description && (
            <div className="text-[11px] text-muted-foreground/90 leading-relaxed">{a.description}</div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={disabled} onClick={() => onChange(items.filter((x) => x.id !== a.id))}>
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="p-3 space-y-3 border-dashed">
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Evidence & attachments</div>
          <div className="text-[11px] text-muted-foreground">Add one entry per artefact. Tag each to a judging criterion so judges know what it supports.</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGroupByCategory((v) => !v)}
            className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          >
            {groupByCategory ? "Show as list" : "Group by criterion"}
          </button>
          <Button size="sm" variant="outline" className="h-8" disabled={disabled} onClick={() => setAdding(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add attachment
          </Button>
        </div>
      </div>

      {adding && (
        <Card className="p-3 space-y-2 bg-muted/30">
          <div className="grid md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">Category <span className="text-rose-600">*</span></Label>
              <Select value={draft.categoryId} onValueChange={(v) => setDraft((d) => ({ ...d, categoryId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Which criterion does this support?" /></SelectTrigger>
                <SelectContent>
                  {EVIDENCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label} · {c.weight}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">Title <span className="text-rose-600">*</span></Label>
              <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Household survey — 42 responses" className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium">Description</Label>
            <Textarea rows={2} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="One or two lines about what this file shows (recommended)." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="border rounded-md h-9 px-3 flex items-center gap-1.5 text-xs cursor-pointer hover:bg-accent/40">
              <Upload className="w-3.5 h-3.5" />
              {draft.name ?? "Choose file"}
              <input type="file" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setDraft((d) => ({ ...d, name: f.name, sizeKb: Math.round(f.size / 1024) })); }} />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => { resetDraft(); setAdding(false); }}>Cancel</Button>
              <Button size="sm" onClick={save}>Save attachment</Button>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 && !adding ? (
        <div className="border-2 border-dashed rounded-md p-6 text-center text-xs text-muted-foreground">
          No evidence added yet — start with your strongest artefact.
        </div>
      ) : groupByCategory ? (
        <div className="space-y-3">
          {grouped.map(({ category, entries }) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${category.tone}`}>
                  {category.label} · {category.weight}%
                </span>
                <span className="text-[10px] text-muted-foreground">{entries.length} file{entries.length === 1 ? "" : "s"}</span>
              </div>
              {entries.length === 0 ? (
                <div className="text-[11px] text-muted-foreground/80 italic pl-1">No file tagged to this criterion yet.</div>
              ) : (
                <div className="rounded-md border bg-background px-3">{entries.map(renderRow)}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-background px-3">{items.map(renderRow)}</div>
      )}
    </Card>
  );
}

function DeckBlock({
  deck, video, onDeck, onVideo, disabled,
}: {
  deck: { name: string; sizeKb: number } | null;
  video: string;
  onDeck: (v: { name: string; sizeKb: number } | null) => void;
  onVideo: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <Card className="p-3 space-y-3 border-dashed">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pitch deck & demo</div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Pitch deck <span className="text-rose-600">*</span></Label>
          <label className={`border-2 border-dashed rounded-md p-3 flex flex-col items-center gap-1 text-xs text-muted-foreground cursor-pointer ${disabled ? "opacity-60 pointer-events-none" : "hover:bg-accent/40"}`}>
            <Upload className="w-4 h-4" />
            <span>{deck ? deck.name : "PDF or PPTX · ≤15MB"}</span>
            <input type="file" className="hidden" accept="application/pdf,.pptx,.ppt"
              onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; onDeck({ name: f.name, sizeKb: Math.round(f.size / 1024) }); }} />
          </label>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Demo video URL <span className="text-rose-600">*</span></Label>
          <div className="relative">
            <Film className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input disabled={disabled} type="url" placeholder="https://youtu.be/…" value={video} onChange={(e) => onVideo(e.target.value)} className="h-9 pl-8" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RitxTeamSubmissionStage() {
  const { stageId } = useParams<{ stageId: StageId }>();
  const navigate = useNavigate();
  const track = mockCompetition.tracks.find((t) => t.id === team.trackId)!;
  const stage = stageId ? getStageForm(team.trackId, stageId) : undefined;

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attachmentsBySection, setAttachmentsBySection] = useState<Record<string, Attachment[]>>({});
  const [deckFile, setDeckFile] = useState<{ name: string; sizeKb: number } | null>(null);
  const [demoUrl, setDemoUrl] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");

  const status = stage ? stageWindowStatus(stage) : "upcoming";
  const locked = status !== "open" || !stage?.editable;

  const allFields: SubmissionField[] = useMemo(
    () => (stage ? stage.sections.flatMap((s) => s.fields) : []),
    [stage]
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    allFields.forEach((f) => { const err = validateField(f, values[f.id]); if (err) e[f.id] = err; });
    return e;
  }, [allFields, values]);

  const filled = allFields.filter((f) => {
    const v = values[f.id]; return !(v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0));
  }).length;
  const progress = allFields.length ? Math.round((filled / allFields.length) * 100) : 0;
  const canSubmit = !locked && Object.keys(errors).length === 0 && filled === allFields.length;

  if (!stage) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/team/submissions")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Card className="p-6">Submission stage not found.</Card>
      </div>
    );
  }

  const tabValue = activeTab || stage.sections[0].id;

  const submit = () => {
    const t: Record<string, boolean> = {}; allFields.forEach((f) => (t[f.id] = true)); setTouched(t);
    if (!canSubmit) { toast.error("Fix errors before submitting"); return; }
    toast.success(`${stage.label} submitted. You can edit until the deadline.`);
  };

  return (
    <PaywallGate feature="submission">
    <div className="space-y-3">
      {/* Compact sticky header — 48px */}
      <div className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-background/95 backdrop-blur border-b flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate("/team/submissions")} className="h-8 px-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="font-semibold text-sm">{stage.label}</div>
        <Badge variant="outline" className="text-[10px]">{track.name}</Badge>
        <DeadlineTimer stage={stage} />
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{filled}/{allFields.length} fields</span>
            <Progress value={progress} className="h-1.5 w-24" />
          </div>
          <Button size="sm" variant="outline" className="h-8" disabled={locked} onClick={() => toast.success("Draft saved")}>
            <Save className="w-3.5 h-3.5 mr-1" /> Draft
          </Button>
          <Button size="sm" className="h-8" disabled={!canSubmit} onClick={submit}>
            <Send className="w-3.5 h-3.5 mr-1" /> Submit
          </Button>
        </div>
      </div>

      {locked && status === "closed" && (
        <Alert className="border-slate-200 bg-slate-50 py-2">
          <Lock className="h-4 w-4" />
          <AlertTitle className="text-sm">Deadline passed</AlertTitle>
          <AlertDescription className="text-xs">Your work is saved as draft. Contact your mentor if you need an extension.</AlertDescription>
        </Alert>
      )}

      <Tabs value={tabValue} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto p-1">
          {stage.sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="text-xs">{s.label}</TabsTrigger>
          ))}
          <TabsTrigger value="__review" className="text-xs">Review & Submit</TabsTrigger>
        </TabsList>

        {stage.sections.map((section: FormSection) => (
          <TabsContent key={section.id} value={section.id} className="mt-3 space-y-3">
            {section.builtInAttachments && (
              <AttachmentsBlock
                items={attachmentsBySection[section.id] ?? []}
                onChange={(next) => setAttachmentsBySection((p) => ({ ...p, [section.id]: next }))}
                disabled={locked}
              />
            )}
            {section.builtInDeck && (
              <DeckBlock deck={deckFile} video={demoUrl} onDeck={setDeckFile} onVideo={setDemoUrl} disabled={locked} />
            )}
            {section.fields.length > 0 && (
              <Card className="p-3 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  {section.fields.map((f) => (
                    <div key={f.id} className={f.type === "long-text" || f.type === "multi-select" ? "md:col-span-2" : ""}>
                      <FieldRenderer
                        field={f}
                        value={values[f.id]}
                        onChange={(v) => setValues((p) => ({ ...p, [f.id]: v }))}
                        onBlur={() => setTouched((p) => ({ ...p, [f.id]: true }))}
                        error={touched[f.id] ? errors[f.id] : undefined}
                        disabled={locked}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        ))}

        <TabsContent value="__review" className="mt-3 space-y-3">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Review checklist</div>
              <span className="text-xs text-muted-foreground">{filled}/{allFields.length} required fields</span>
            </div>
            <Progress value={progress} className="h-1.5 mb-3" />
            <ul className="space-y-1 text-xs">
              {allFields.map((f) => {
                const v = values[f.id];
                const ok = !(v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) && !errors[f.id];
                return (
                  <li key={f.id} className="flex items-center gap-2">
                    {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    <span className={ok ? "text-muted-foreground" : ""}>{f.label}</span>
                    {!ok && errors[f.id] && <span className="text-rose-600 ml-1">— {errors[f.id]}</span>}
                  </li>
                );
              })}
            </ul>
          </Card>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" disabled={locked} onClick={() => toast.success("Draft saved")}>
              <Save className="w-4 h-4 mr-1" /> Save draft
            </Button>
            <Button disabled={!canSubmit} onClick={submit}>
              <Send className="w-4 h-4 mr-1" /> Submit {stage.label.toLowerCase()}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </PaywallGate>
  );
}