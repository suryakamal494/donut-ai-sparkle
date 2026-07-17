import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EyeOff, ArrowLeft, Send } from "lucide-react";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { initialRubrics } from "@/data/ritx/rubricData";
import { toast } from "sonner";

export default function RitxJudgeScoreSheet() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const team = mockTeams.find((t) => t.id === teamId);
  const rubric = team ? initialRubrics.find((r) => r.trackId === team.trackId) : undefined;

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  const weighted = useMemo(() => {
    if (!rubric) return 0;
    return rubric.criteria.reduce((sum, c) => {
      const s = scores[c.id] ?? 0;
      return sum + (s / c.maxScore) * 10 * c.weight;
    }, 0);
  }, [rubric, scores]);

  const scoredCount = rubric ? rubric.criteria.filter((c) => scores[c.id] != null).length : 0;
  const pct = rubric ? Math.round((scoredCount / rubric.criteria.length) * 100) : 0;

  if (!team || !rubric) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/ritx/staff/judge")}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Card className="p-6 mt-2">Submission not found or rubric not published.</Card>
      </div>
    );
  }

  const trackName = mockCompetition.tracks.find((t) => t.id === team.trackId)?.name;

  const submit = () => {
    if (scoredCount < rubric.criteria.length) return toast.error("Score every criterion before submitting");
    toast.success(`Score submitted: ${weighted.toFixed(2)}/10`);
    setTimeout(() => navigate("/ritx/staff/judge"), 600);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/ritx/staff/judge")}><ArrowLeft className="w-4 h-4 mr-1" />Back to queue</Button>

      <PageHeader title="Score submission" description="Blind evaluation — identities hidden per competition policy." />

      <Card className="p-3 bg-indigo-50 border-indigo-200 flex items-center gap-2">
        <EyeOff className="w-4 h-4 text-indigo-700" />
        <div className="text-sm text-indigo-900">Blind mode active. You only see Team ID, track and sub-theme.</div>
      </Card>

      <Card className="p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <TeamIdChip code={team.teamCode} />
          <div className="mt-2 font-semibold">{trackName}</div>
          <div className="text-xs text-muted-foreground">Sub-theme: {team.subTheme}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Weighted score</div>
          <div className="text-3xl font-bold">{weighted.toFixed(2)}<span className="text-base text-muted-foreground">/10</span></div>
          <Progress value={pct} className="mt-2 h-1.5 w-40" />
          <div className="text-[11px] text-muted-foreground mt-1">{scoredCount}/{rubric.criteria.length} criteria scored</div>
        </div>
      </Card>

      <div className="space-y-3">
        {rubric.criteria.map((c) => {
          const val = scores[c.id] ?? 0;
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium flex items-center gap-2">{c.label} <Badge variant="secondary" className="text-[10px]">{Math.round(c.weight * 100)}%</Badge></div>
                  <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold tabular-nums">{val}</div>
                  <div className="text-[11px] text-muted-foreground">of {c.maxScore}</div>
                </div>
              </div>
              <Slider
                className="mt-4"
                min={0}
                max={c.maxScore}
                step={1}
                value={[val]}
                onValueChange={(v) => setScores((s) => ({ ...s, [c.id]: v[0] }))}
              />
            </Card>
          );
        })}
      </div>

      <Card className="p-4 space-y-2">
        <div className="font-medium text-sm">Private comments (not shared with team)</div>
        <Textarea rows={4} placeholder="Notes for organisers — strengths, gaps, standout moments…" value={comment} onChange={(e) => setComment(e.target.value)} />
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit}><Send className="w-4 h-4 mr-1" />Submit score</Button>
      </div>
    </div>
  );
}
