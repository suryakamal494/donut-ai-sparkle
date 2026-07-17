import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { AccessBadge, TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { Calendar, AlertTriangle } from "lucide-react";

export default function RitxTeamHome() {
  const team = mockTeams[0];
  const consentBlocked = team.members.some((m) => m.consent !== "confirmed");
  const track = mockCompetition.tracks.find((t) => t.id === team.trackId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={team.teamName}
        description={<span className="flex items-center gap-2"><TeamIdChip code={team.teamCode} /><AccessBadge status={team.status} /></span>}
      />
      {consentBlocked && (
        <Card className="p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-amber-900">Consent pending</div>
            <div className="text-amber-800">Final submission is disabled until every member's parent confirms consent.</div>
          </div>
        </Card>
      )}
      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Track</div>
          <div className="font-semibold mt-1">{track?.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{team.subTheme}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Submission deadline</div>
          <div className="font-semibold mt-1">{mockCompetition.submissionDeadline}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Members</div>
          <div className="font-semibold mt-1">{team.members.length}</div>
        </Card>
      </div>
      <Card className="p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
        <Calendar className="w-8 h-8 mb-2" />
        <div className="font-medium">No upcoming sessions</div>
        <div className="text-sm">Mentor webinars and workshops appear here once scheduled.</div>
      </Card>
    </div>
  );
}
