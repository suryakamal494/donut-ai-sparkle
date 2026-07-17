import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { mockCompetition } from "@/data/ritx/mockData";
import { initialRubrics, type RubricCriterion, type TrackRubric } from "@/data/ritx/rubricData";
import { toast } from "sonner";

function newCriterion(): RubricCriterion {
  return { id: `c-${Math.random().toString(36).slice(2, 7)}`, label: "New criterion", description: "", maxScore: 10, weight: 0 };
}

export default function RitxAdminRubrics() {
  const [rubrics, setRubrics] = useState<TrackRubric[]>(initialRubrics);
  const [active, setActive] = useState(mockCompetition.tracks[0].id);

  const rubric = rubrics.find((r) => r.trackId === active)!;
  const weightSum = useMemo(() => rubric.criteria.reduce((s, c) => s + Number(c.weight || 0), 0), [rubric]);
  const weightValid = Math.abs(weightSum - 1) < 0.001;

  const update = (patch: Partial<TrackRubric>) =>
    setRubrics((rs) => rs.map((r) => (r.trackId === active ? { ...r, ...patch } : r)));

  const updateCriterion = (id: string, patch: Partial<RubricCriterion>) =>
    update({ criteria: rubric.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const remove = (id: string) =>
    update({ criteria: rubric.criteria.filter((c) => c.id !== id) });

  const add = () => update({ criteria: [...rubric.criteria, newCriterion()] });

  const normalize = () => {
    const equal = 1 / rubric.criteria.length;
    update({ criteria: rubric.criteria.map((c) => ({ ...c, weight: Number(equal.toFixed(3)) })) });
  };

  const publish = () => {
    if (!weightValid) return toast.error("Weights must total 100% before publishing");
    update({ published: true, updatedAt: new Date().toISOString().slice(0, 10) });
    toast.success("Rubric published to judges");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Rubrics" description="Define scoring criteria per track. Judges see these in their blind scoring sheet." />

      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          {mockCompetition.tracks.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.name}</TabsTrigger>
          ))}
        </TabsList>

        {mockCompetition.tracks.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-4 space-y-4">
            <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge variant={rubric.published ? "default" : "secondary"}>
                  {rubric.published ? "Published" : "Draft"}
                </Badge>
                <div className="text-sm text-muted-foreground">Last updated {rubric.updatedAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${weightValid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                  {weightValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  Weights total {(weightSum * 100).toFixed(0)}%
                </div>
                <Button size="sm" variant="outline" onClick={normalize}>Distribute evenly</Button>
                <Button size="sm" onClick={publish}><Save className="w-4 h-4 mr-1" />Publish</Button>
              </div>
            </Card>

            <div className="space-y-3">
              {rubric.criteria.map((c) => (
                <Card key={c.id} className="p-4 grid md:grid-cols-12 gap-3 items-start">
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-xs">Criterion</Label>
                    <Input value={c.label} onChange={(e) => updateCriterion(c.id, { label: e.target.value })} />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea rows={2} value={c.description} onChange={(e) => updateCriterion(c.id, { description: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Max score</Label>
                    <Input type="number" min={1} max={100} value={c.maxScore} onChange={(e) => updateCriterion(c.id, { maxScore: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-1 space-y-1">
                    <Label className="text-xs">Weight %</Label>
                    <Input type="number" min={0} max={100} step={1} value={Math.round(c.weight * 100)} onChange={(e) => updateCriterion(c.id, { weight: Number(e.target.value) / 100 })} />
                  </div>
                  <div className="md:col-span-1 flex md:justify-end">
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={add}><Plus className="w-4 h-4 mr-1" />Add criterion</Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
