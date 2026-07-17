import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AccessBadge, TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { DeadlineTimer } from "@/components/ritx/shared/DeadlineTimer";
import { PaywallGate } from "@/components/ritx/shared/PaywallGate";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { getCurrentWorkspace } from "@/data/ritx/workspaceState";
import { getStageForm, stageWindowStatus, type StageId } from "@/data/ritx/submissionData";
import { ArrowRight, CheckCircle2, ClipboardList, FileText, Lock } from "lucide-react";

const stageMeta: { id: StageId; icon: React.ComponentType<{ className?: string }>; tint: string; desc: string }[] = [
  { id: "progress", icon: ClipboardList, tint: "from-amber-100 to-orange-100 text-amber-700", desc: "Mid-programme check-in. Share your problem, progress and early evidence." },
  { id: "final", icon: FileText, tint: "from-emerald-100 to-teal-100 text-emerald-700", desc: "Pitch or prototype with policy & SDG lens, deck and demo video." },
];

function pctFilled(): number {
  // demo — random-free deterministic based on stage id
  return 0;
}

export default function RitxTeamSubmission() {
  const workspace = getCurrentWorkspace();
  const trackId = workspace?.trackId || mockTeams[0].trackId;
  const track = mockCompetition.tracks.find((t) => t.id === trackId);
  const progressForm = getStageForm(trackId, "progress");
  const finalForm = getStageForm(trackId, "final");
  const progressStatus = progressForm ? stageWindowStatus(progressForm) : "upcoming";

  return (
    <PaywallGate feature="submission">
    <div className="space-y-4">
      {/* Compact header — no PageHeader vertical padding */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Submissions</h1>
        <span className="text-muted-foreground text-sm">·</span>
        {workspace && <TeamIdChip code={workspace.code} />}
        <AccessBadge status="active" />
        {track && <Badge variant="outline" className="ml-auto">{track.name}</Badge>}
      </div>

      {!trackId && (
        <Alert className="border-amber-200 bg-amber-50 py-2">
          <AlertTitle className="text-amber-900 text-sm">Pick a track first</AlertTitle>
          <AlertDescription className="text-amber-800 text-xs">
            Go to your Team home and choose a track &amp; theme before starting a submission.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {stageMeta.map(({ id, icon: Icon, tint, desc }) => {
          const form = id === "progress" ? progressForm : finalForm;
          if (!form) return null;
          const status = stageWindowStatus(form);
          const finalBlockedByProgress = id === "final" && progressStatus === "open";
          const disabled = status === "upcoming" || finalBlockedByProgress;
          const locked = status === "closed";
          const pct = pctFilled();
          return (
            <Card key={id} className="p-4 rounded-2xl border border-orange-100/70 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tint} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold">{form.label}</div>
                    <DeadlineTimer stage={form} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{form.sections.length} sections</span>
                  <span>{pct}% complete</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  {locked ? (
                    <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Editing closed</span>
                  ) : finalBlockedByProgress ? (
                    <span>Opens after Progress deadline</span>
                  ) : status === "upcoming" ? (
                    <span>Opens {new Date(form.openAt).toLocaleDateString()}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Open now</span>
                  )}
                </div>
                <Button asChild size="sm" disabled={disabled}>
                  <Link to={disabled ? "#" : `/team/submissions/${id}`}>
                    {locked ? "View draft" : pct > 0 ? "Continue" : "Start"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
    </PaywallGate>
  );
}