import { useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Sparkles, Trophy } from "lucide-react";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { initialResults, awardLabel, awardTone } from "@/data/ritx/resultsData";
import { toast } from "sonner";

// Mock: currently signed-in team is t2 (Neon Neurons)
const CURRENT_TEAM_ID = "t2";

export default function RitxTeamResults() {
  const team = mockTeams.find((t) => t.id === CURRENT_TEAM_ID)!;
  const result = initialResults.find((r) => r.teamId === CURRENT_TEAM_ID)!;
  const track = mockCompetition.tracks.find((t) => t.id === team.trackId)!;
  const certRef = useRef<HTMLDivElement>(null);

  const totalInTrack = initialResults.filter((r) => mockTeams.find((t) => t.id === r.teamId)?.trackId === team.trackId).length;

  return (
    <div className="space-y-4">
      <PageHeader title="Your result" description={`${mockCompetition.name} — ${track.name}`} />

      <Card className="p-6 bg-gradient-to-br from-amber-50 via-white to-indigo-50 border-amber-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Rank</div>
              <div className="text-3xl font-bold">#{result.rank}<span className="text-base text-muted-foreground"> of {totalInTrack}</span></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Weighted score</div>
            <div className="text-3xl font-bold tabular-nums">{result.average.toFixed(2)}<span className="text-base text-muted-foreground">/10</span></div>
          </div>
          {result.award && (
            <Badge className={`${awardTone[result.award]} text-sm px-3 py-1`} variant="outline">
              <Award className="w-4 h-4 mr-1" />{awardLabel[result.award]}
            </Badge>
          )}
        </div>
      </Card>

      <div ref={certRef}>
        <Card className="p-8 border-2 border-amber-200 bg-gradient-to-br from-white via-amber-50/40 to-white text-center relative overflow-hidden">
          <div className="absolute top-3 left-3 flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="w-3 h-3" />RiTX Certificate</div>
          <div className="absolute top-3 right-3 text-xs text-muted-foreground">{team.teamCode}</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-6">Certificate of Achievement</div>
          <div className="text-3xl md:text-4xl font-bold mt-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{team.teamName}</div>
          <div className="text-sm text-muted-foreground mt-1">{team.school} · {team.city}</div>
          <div className="mt-6 text-sm">is recognised as a</div>
          <div className="text-2xl font-bold mt-1">{result.award ? awardLabel[result.award] : "Participant"}</div>
          <div className="text-sm text-muted-foreground">in the {track.name} track</div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm max-w-md mx-auto">
            <div><div className="font-semibold text-lg">#{result.rank}</div><div className="text-xs text-muted-foreground">Rank</div></div>
            <div><div className="font-semibold text-lg">{result.average.toFixed(2)}</div><div className="text-xs text-muted-foreground">Score</div></div>
            <div><div className="font-semibold text-lg">{result.scores.length}</div><div className="text-xs text-muted-foreground">Judges</div></div>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">Awarded {new Date(mockCompetition.resultsDate).toLocaleDateString()}</div>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => toast.success("Certificate download queued (PDF)")}><Download className="w-4 h-4 mr-1" />Download PDF</Button>
        <Button onClick={() => toast.success("Shared to your team members")}>Share with team</Button>
      </div>

      <Card className="p-4">
        <div className="font-semibold mb-2">Judge scores</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {result.scores.map((s, i) => (
            <div key={i} className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Judge {i + 1}</span>
              <span className="font-semibold tabular-nums">{s.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-3">Judge identities are kept anonymous. Detailed rubric breakdown will be shared by mentors.</div>
      </Card>
    </div>
  );
}
