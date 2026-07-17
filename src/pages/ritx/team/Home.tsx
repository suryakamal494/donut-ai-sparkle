import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessBadge, TeamIdChip } from "@/components/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/mockData";
import { mockSessions } from "@/data/staffData";
import { AlertTriangle, Video, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

function useCountdown(iso: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const diffMs = new Date(iso).getTime() - now;
  const mins = Math.floor(diffMs / 60_000);
  return { mins, joinable: mins <= 10 && mins > -60, started: mins <= 0 };
}

function SessionCard({ id, title, mentorName, trackName, date, durationMin, joinUrl }: { id: string; title: string; mentorName: string; trackName: string; date: string; durationMin: number; joinUrl: string }) {
  const { mins, joinable, started } = useCountdown(date);
  const when = new Date(date).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const label = mins > 60 * 24 ? `In ${Math.floor(mins / (60 * 24))}d` : mins > 60 ? `In ${Math.floor(mins / 60)}h` : mins > 0 ? `In ${mins}m` : started ? "Live" : "Ended";
  return (
    <Card key={id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Video className="w-5 h-5 text-primary" /></div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
          <span>{mentorName}</span><span>·</span><span>{trackName}</span><span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{when} · {durationMin}m</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${joinable ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{label}</span>
        <Button size="sm" disabled={!joinable} onClick={() => { toast.success("Opening session…"); window.open(joinUrl, "_blank"); }}>
          <ExternalLink className="w-3 h-3 mr-1" /> Join
        </Button>
      </div>
    </Card>
  );
}

export default function RitxTeamHome() {
  const team = mockTeams[0];
  const consentBlocked = team.members.some((m) => m.consent !== "confirmed");
  const track = mockCompetition.tracks.find((t) => t.id === team.trackId);
  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;
  const upcoming = [...mockSessions].sort((a, b) => +new Date(a.date) - +new Date(b.date));

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
      <div>
        <div className="font-semibold mb-2">Upcoming sessions</div>
        <div className="space-y-2">
          {upcoming.map((s) => (
            <SessionCard key={s.id} id={s.id} title={s.title} mentorName={s.mentorName} trackName={trackName(s.trackId)} date={s.date} durationMin={s.durationMin} joinUrl={s.joinUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}
