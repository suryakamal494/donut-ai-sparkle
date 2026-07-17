import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Users, School, CheckCircle2, Clock, Trophy } from "lucide-react";
import { registrationStats, mockCompetition } from "@/data/ritx/mockData";

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}

export default function RitxAdminDashboard() {
  const s = registrationStats;
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description={mockCompetition.name} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total registrations" value={s.totalRegistrations} icon={Users} />
        <Stat label="Schools onboarded" value={s.totalSchools} icon={School} />
        <Stat label="Active teams" value={s.activeTeams} icon={CheckCircle2} />
        <Stat label="Consents pending" value={s.consentPending} icon={Clock} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="font-semibold mb-3">By registration mode</div>
          <div className="space-y-2">
            {Object.entries(s.byMode).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4" />By track</div>
          <div className="space-y-2">
            {mockCompetition.tracks.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.name}</span>
                <span className="font-medium">{(s.byTrack as Record<string, number>)[t.id] || 0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
