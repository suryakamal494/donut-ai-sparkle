import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { mockAssignments, scoreTone, statusLabel } from "@/data/ritx/rubricData";
import { EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock: current judge is s3 (Anita), matches staff/Layout demo
const CURRENT_JUDGE_ID = "s3";

export default function RitxJudgeAssigned() {
  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;
  const navigate = useNavigate();
  const mine = mockAssignments.filter((a) => a.judgeId === CURRENT_JUDGE_ID);
  const teamsForMe = mine
    .map((a) => ({ a, team: mockTeams.find((t) => t.id === a.teamId)! }))
    .filter((x) => x.team);

  return (
    <div className="space-y-4">
      <PageHeader title="Judging queue" description={`Blind view — ${teamsForMe.length} submissions assigned to you`} />

      <Card className="p-3 flex items-center gap-2 bg-indigo-50 border-indigo-200">
        <EyeOff className="w-4 h-4 text-indigo-700" />
        <div className="text-sm text-indigo-900">You see only Team IDs, track and sub-theme. School, member and location details are hidden.</div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teamsForMe.map(({ a, team: t }) => (
          <Card key={t.id} className="p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <TeamIdChip code={t.teamCode} />
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${scoreTone(a.status)}`}>{statusLabel(a.status)}</span>
            </div>
            <div className="mt-3 font-medium">Submission #{t.id.toUpperCase()}</div>
            <div className="text-xs text-muted-foreground mt-1">{trackName(t.trackId)} · {t.subTheme}</div>
            {a.status === "scored" && a.score != null && (
              <div className="mt-3 text-sm">Your score: <span className="font-semibold">{a.score.toFixed(2)}/10</span></div>
            )}
            <Button size="sm" variant={a.status === "scored" ? "outline" : "default"} className="mt-4 self-start" onClick={() => navigate(`/ritx/staff/judge/${t.id}`)}>
              {a.status === "scored" ? "View / revise" : a.status === "in-progress" ? "Continue scoring" : "Start scoring"}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
