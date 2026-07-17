import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessBadge, TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition, updateTeamTrack } from "@/data/ritx/mockData";
import { mockSessions } from "@/data/ritx/staffData";
import { AlertTriangle, Video, Clock, ExternalLink, Target, CalendarDays, Users as UsersIcon, Sparkles, Lock, Compass } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  // Color tile by session flavor
  const lower = title.toLowerCase();
  const tile = lower.includes("kickoff") || lower.includes("office")
    ? "from-donut-coral to-donut-orange"
    : lower.includes("workshop") || lower.includes("critique")
    ? "from-violet-500 to-fuchsia-500"
    : "from-teal-500 to-cyan-500";
  return (
    <Card key={id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white">
      <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-md", tile)}>
        <Video className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
          <span>{mentorName}</span><span>·</span><span>{trackName}</span><span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{when} · {durationMin}m</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${joinable ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-white/70 text-slate-600 border-slate-200"}`}>{label}</span>
        <Button size="sm" disabled={!joinable} onClick={() => { toast.success("Opening session…"); window.open(joinUrl, "_blank"); }} className={cn(joinable && "bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 shadow-md shadow-donut-coral/30 border-0")}>
          <ExternalLink className="w-3 h-3 mr-1" /> Join
        </Button>
      </div>
    </Card>
  );
}

export default function RitxTeamHome() {
  const team = mockTeams[0];
  const consentBlocked = team.members.some((m) => m.consent !== "confirmed");
  const [trackId, setTrackId] = useState(team.trackId || "");
  const [subTheme, setSubTheme] = useState(team.subTheme || "");
  const track = mockCompetition.tracks.find((t) => t.id === trackId);
  const deadlineMs = new Date(mockCompetition.submissionDeadline).getTime();
  const locked = Date.now() > deadlineMs;
  const dirty = trackId !== team.trackId || subTheme !== team.subTheme;
  const subThemeOptions = track?.subThemes ?? [];
  const hasSelection = Boolean(team.trackId);

  const trackName = (id: string) => mockCompetition.tracks.find((t) => t.id === id)?.name || id;
  const upcoming = [...mockSessions].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const onSave = () => {
    if (!trackId || !subTheme) { toast.error("Pick both a track and a theme"); return; }
    updateTeamTrack(team.id, trackId, subTheme);
    toast.success("Track & theme updated");
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-100/60 shadow-sm shadow-orange-100/30 bg-gradient-to-br from-amber-50 via-orange-50/50 to-white p-6 md:p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-donut-coral/20 to-donut-orange/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-gradient-to-br from-violet-200/40 to-transparent blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-donut-coral font-semibold uppercase tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Team Console
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{team.teamName}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <TeamIdChip code={team.teamCode} />
            <AccessBadge status={team.status} />
          </div>
        </div>
      </div>

      {consentBlocked && (
        <Card className="p-4 rounded-2xl border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 shadow-sm shadow-amber-100/50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-amber-900">Consent pending</div>
            <div className="text-amber-800">Final submission is disabled until every member's parent confirms consent.</div>
          </div>
        </Card>
      )}

      {/* Track & Theme selection */}
      <Card className="p-5 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 bg-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-donut-coral to-donut-orange flex items-center justify-center shadow-md flex-shrink-0">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold">Track &amp; challenge theme</div>
              {locked ? (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 font-medium">
                  <Lock className="w-3 h-3" /> Locked after submission deadline
                </span>
              ) : hasSelection ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Editable until {new Date(mockCompetition.submissionDeadline).toLocaleDateString()}</span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 font-medium">Pick your track to unlock resources</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the track your team wants to compete in and the sub-theme you'll focus on. You can change this any time before the submission deadline.
            </p>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Track</div>
                <Select value={trackId} onValueChange={(v) => { setTrackId(v); setSubTheme(""); }} disabled={locked}>
                  <SelectTrigger><SelectValue placeholder="Select a track" /></SelectTrigger>
                  <SelectContent>
                    {mockCompetition.tracks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {track && <p className="text-[11px] text-muted-foreground mt-1">{track.description}</p>}
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Challenge theme</div>
                <Select value={subTheme} onValueChange={setSubTheme} disabled={locked || !trackId}>
                  <SelectTrigger><SelectValue placeholder={trackId ? "Select a theme" : "Pick a track first"} /></SelectTrigger>
                  <SelectContent>
                    {subThemeOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button
                size="sm"
                onClick={onSave}
                disabled={locked || !dirty}
                className="bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0 shadow-md shadow-donut-coral/30"
              >
                Save selection
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Track", value: track?.name || "Not selected", sub: subTheme || "—", icon: Target, tile: "from-teal-500 to-cyan-500" },
          { label: "Submission deadline", value: mockCompetition.submissionDeadline, icon: CalendarDays, tile: "from-donut-coral to-donut-orange" },
          { label: "Members", value: String(team.members.length), icon: UsersIcon, tile: "from-violet-500 to-fuchsia-500" },
        ].map((m) => (
          <Card key={m.label} className="p-5 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white">
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md mb-3", m.tile)}>
              <m.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{m.label}</div>
            <div className="font-bold text-lg mt-1 leading-tight">{m.value}</div>
            {m.sub && <div className="text-xs text-muted-foreground mt-1">{m.sub}</div>}
          </Card>
        ))}
      </div>
      <div>
        <div className="font-bold text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-donut-coral to-donut-orange" />
          Upcoming sessions
        </div>
        <div className="space-y-2.5">
          {upcoming.map((s) => (
            <SessionCard key={s.id} id={s.id} title={s.title} mentorName={s.mentorName} trackName={trackName(s.trackId)} date={s.date} durationMin={s.durationMin} joinUrl={s.joinUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}
