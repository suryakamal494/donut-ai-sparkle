import { useNavigate } from "react-router-dom";
import { Sparkles, Trophy, Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockCompetition } from "@/data/ritx/mockData";
import DonutLogo from "@/components/shared/DonutLogo";
import { cn } from "@/lib/utils";

const trackTiles = ["from-teal-500 to-cyan-500", "from-donut-coral to-donut-orange", "from-violet-500 to-fuchsia-500"];

export default function RitxLanding() {
  const navigate = useNavigate();
  const c = mockCompetition;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-orange-100/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-donut-coral/20 to-donut-orange/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/40 to-transparent blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex items-center gap-2 mb-6">
            <DonutLogo size={40} />
            <span className="font-bold text-lg gradient-text">RiTX</span>
            <span className="text-xs text-muted-foreground">powered by DonutAI</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">{c.name}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-6">
            A national competition celebrating young scientific investigators, innovators and problem-solvers.
            Team up, pick a track, and build something that matters.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/login?role=team")} className="gap-2 bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 shadow-lg shadow-donut-coral/30 border-0">
              Register your team <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-orange-200 hover:bg-white/70">
              Sign in
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-10">
        {/* Tracks */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">The three tracks</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {c.tracks.map((t, i) => (
              <Card key={t.id} className="p-5 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white">
                <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md mb-3", trackTiles[i % trackTiles.length])}>
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold mb-1">{t.name}</div>
                <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                <div className="flex flex-wrap gap-1">
                  {t.subThemes.slice(0, 4).map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-foreground">{s}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Rules */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Rules of participation</h2>
          <Card className="p-5 space-y-2 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 bg-white">
            {[
              `Teams of ${c.minTeamSize}–${c.maxTeamSize} members from grades 6–12`,
              "Every member must have parental consent to participate",
              "Submissions go through Progress and Final stages; Final locks after submit",
              "All judging is blind — judges see only Team IDs",
              "Original work only; plagiarism disqualifies the team",
            ].map((r) => (
              <div key={r} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-donut-coral mt-0.5 flex-shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Timeline</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Registrations open", date: c.registrationStart, icon: Users, tile: "from-teal-500 to-cyan-500" },
              { label: "Registrations close", date: c.registrationEnd, icon: Calendar, tile: "from-violet-500 to-fuchsia-500" },
              { label: "Submission deadline", date: c.submissionDeadline, icon: Trophy, tile: "from-donut-coral to-donut-orange" },
              { label: "Results announced", date: c.resultsDate, icon: Sparkles, tile: "from-amber-400 to-orange-500" },
            ].map((m) => (
              <Card key={m.label} className="p-4 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white">
                <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md mb-2", m.tile)}>
                  <m.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="font-semibold text-sm">{m.date}</div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
