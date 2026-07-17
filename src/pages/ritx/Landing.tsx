import { useNavigate } from "react-router-dom";
import { Sparkles, Trophy, Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockCompetition } from "@/data/mockData";

export default function RitxLanding() {
  const navigate = useNavigate();
  const c = mockCompetition;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">RiTX</span>
            <span className="text-xs text-muted-foreground">powered by DonutAI</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">{c.name}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-6">
            A national competition celebrating young scientific investigators, innovators and problem-solvers.
            Team up, pick a track, and build something that matters.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/login?role=team")} className="gap-2">
              Register your team <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
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
            {c.tracks.map((t) => (
              <Card key={t.id} className="p-5">
                <Trophy className="w-6 h-6 text-primary mb-3" />
                <div className="font-semibold mb-1">{t.name}</div>
                <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                <div className="flex flex-wrap gap-1">
                  {t.subThemes.slice(0, 4).map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-muted">{s}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Rules */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Rules of participation</h2>
          <Card className="p-5 space-y-2">
            {[
              `Teams of ${c.minTeamSize}–${c.maxTeamSize} members from grades 6–12`,
              "Every member must have parental consent to participate",
              "Submissions go through Progress and Final stages; Final locks after submit",
              "All judging is blind — judges see only Team IDs",
              "Original work only; plagiarism disqualifies the team",
            ].map((r) => (
              <div key={r} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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
              { label: "Registrations open", date: c.registrationStart, icon: Users },
              { label: "Registrations close", date: c.registrationEnd, icon: Calendar },
              { label: "Submission deadline", date: c.submissionDeadline, icon: Trophy },
              { label: "Results announced", date: c.resultsDate, icon: Sparkles },
            ].map((m) => (
              <Card key={m.label} className="p-4">
                <m.icon className="w-4 h-4 text-primary mb-2" />
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
