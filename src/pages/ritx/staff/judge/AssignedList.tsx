import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { EyeOff } from "lucide-react";

export default function RitxJudgeAssigned() {
  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <PageHeader title="Judging queue" description="Blind view — identities are hidden" />

      <Card className="p-3 flex items-center gap-2 bg-indigo-50 border-indigo-200">
        <EyeOff className="w-4 h-4 text-indigo-700" />
        <div className="text-sm text-indigo-900">You see only Team IDs, track and sub-theme. School, member and location details are hidden.</div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mockTeams.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <TeamIdChip code={t.teamCode} />
              <span className="text-[11px] text-muted-foreground">Pending</span>
            </div>
            <div className="mt-3 font-medium">Submission #{t.id.toUpperCase()}</div>
            <div className="text-xs text-muted-foreground mt-1">{trackName(t.trackId)} · {t.subTheme}</div>
            <div className="mt-4 text-xs text-muted-foreground">Rubric scoring opens in Phase 3</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
