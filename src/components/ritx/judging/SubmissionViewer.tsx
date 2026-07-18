import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamIdChip } from "@/components/ritx/shared/AccessBadge";
import { mockTeams, mockCompetition } from "@/data/ritx/mockData";
import { defaultFields, submissionForTeam, type AnswerValue, type SubmissionField } from "@/data/ritx/submissionData";
import { evidenceForTeam, EVIDENCE_CATEGORIES, evidenceCategory } from "@/data/ritx/submissionData";
import { assignmentsForTeam } from "@/data/ritx/rubricData";
import { mockStaff } from "@/data/ritx/staffData";
import { FileText, Film, Image as ImageIcon } from "lucide-react";

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}
function youtubeEmbed(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function AnswerCell({ field, value }: { field: SubmissionField; value: AnswerValue | undefined }) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <div className="text-xs italic text-muted-foreground">— not provided —</div>;
  }
  if (typeof value === "string" || typeof value === "number") {
    return <div className="text-sm whitespace-pre-wrap leading-relaxed">{String(value)}</div>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v) => <Badge key={v} variant="secondary">{v}</Badge>)}
      </div>
    );
  }
  // file object
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-2">
      <FileText className="w-3.5 h-3.5" />
      {value.name} · {value.sizeKb ? `${value.sizeKb} KB` : value.mime}
    </div>
  );
}

interface Props {
  teamId: string;
  mode: "judge" | "admin";
}

export function SubmissionViewer({ teamId, mode }: Props) {
  const team = mockTeams.find((t) => t.id === teamId);
  const submission = submissionForTeam(teamId);
  const track = mockCompetition.tracks.find((t) => t.id === team?.trackId);
  const fields = team ? defaultFields(team.trackId) : [];

  const evidence = useMemo(() => {
    if (!submission) return [];
    return fields
      .filter((f) => f.type === "file" || f.type === "video-url")
      .map((f) => ({ field: f, value: submission.answers[f.id] }))
      .filter((x) => x.value != null);
  }, [fields, submission]);

  const attachments = useMemo(() => (team ? evidenceForTeam(team.id) : []), [team]);
  const attachmentsByCategory = useMemo(
    () => EVIDENCE_CATEGORIES.map((c) => ({ category: c, items: attachments.filter((a) => a.categoryId === c.id) })),
    [attachments],
  );
  const evidenceCount = evidence.length + attachments.length;

  if (!team || !submission) {
    return <Card className="p-6 text-sm text-muted-foreground">Submission not available.</Card>;
  }

  const judges = assignmentsForTeam(teamId);

  return (
    <Tabs defaultValue="overview" className="flex flex-col h-full">
      <div className="border-b px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <TeamIdChip code={team.teamCode} />
          <Badge variant="outline">{track?.name}</Badge>
          <Badge variant="secondary">{team.subTheme}</Badge>
          <span className="text-xs text-muted-foreground">· {team.teamName} · {team.school}</span>
        </div>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="evidence">
            Evidence {evidenceCount > 0 && <span className="ml-1 text-[10px] opacity-60">({evidenceCount})</span>}
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="overview" className="p-4 space-y-3 mt-0">
          <Card className="p-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs text-muted-foreground">Stage</div><div className="font-medium capitalize">{submission.stage.replace("-", " ")}</div></div>
              <div><div className="text-xs text-muted-foreground">Progress</div><div className="font-medium">{submission.progressPct}%</div></div>
              <div><div className="text-xs text-muted-foreground">Submitted</div><div className="font-medium">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Version</div><div className="font-medium">v{submission.version}</div></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-2">Judges assigned</div>
            <div className="space-y-1.5">
              {judges.map((a, i) => {
                const s = mockStaff.find((x) => x.id === a.judgeId);
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{s?.name ?? `Judge ${i + 1}`}</span>
                    <Badge variant={a.status === "scored" ? "default" : "secondary"} className="capitalize text-[10px]">{a.status.replace("-", " ")}</Badge>
                  </div>
                );
              })}
              {judges.length === 0 && <div className="text-xs text-muted-foreground">No judges assigned yet.</div>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="p-4 mt-0 space-y-3">
          {fields.filter((f) => f.type !== "file" && f.type !== "video-url").map((f) => (
            <Card key={f.id} className="p-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{f.label}{f.required && <span className="text-rose-500 ml-0.5">*</span>}</div>
              {f.helper && <div className="text-[11px] text-muted-foreground/80 mt-0.5">{f.helper}</div>}
              <div className="mt-2">
                <AnswerCell field={f} value={submission.answers[f.id]} />
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="evidence" className="p-4 mt-0 space-y-4">
          {evidenceCount === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">No evidence uploaded yet.</Card>
          )}

          {attachments.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Team attachments by criterion</div>
              {attachmentsByCategory.map(({ category, items }) => items.length > 0 && (
                <Card key={category.id} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${category.tone}`}>
                      {category.label} · {category.weight}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">{items.length} file{items.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((a) => {
                      const cat = evidenceCategory(a.categoryId);
                      return (
                        <div key={a.id} className="border rounded-md p-2 bg-muted/20">
                          <div className="flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 mt-0.5 text-primary" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{a.title}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{a.name} · {a.sizeKb} KB{cat && ` · ${cat.label}`}</div>
                              {a.description && (
                                <div className="text-[11px] text-muted-foreground/90 mt-1 leading-relaxed">{a.description}</div>
                              )}
                            </div>
                          </div>
                          {a.url && a.mime === "application/pdf" && (
                            <iframe src={`${a.url}#toolbar=0&navpanes=0`} title={a.title} className="w-full h-[45vh] rounded border bg-white mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {evidence.map(({ field, value }) => (
            <Card key={field.id} className="p-3">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                {field.type === "video-url" ? <Film className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                {field.label}
              </div>
              {field.type === "video-url" && typeof value === "string" ? (
                isYouTube(value) ? (
                  <div className="aspect-video w-full rounded overflow-hidden border bg-black">
                    <iframe src={youtubeEmbed(value)} title={field.label} className="w-full h-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <video controls className="w-full rounded border" src={value} />
                )
              ) : field.type === "file" && typeof value === "object" && value != null && !Array.isArray(value) ? (
                value.mime?.startsWith("image/") ? (
                  <div className="border rounded overflow-hidden bg-muted/30 flex items-center justify-center">
                    <img src={value.url} alt={field.label} className="max-h-[60vh] w-auto" />
                    <ImageIcon className="sr-only" />
                  </div>
                ) : (
                  <iframe src={`${value.url}#toolbar=0&navpanes=0`} title={field.label} className="w-full h-[65vh] rounded border bg-white" />
                )
              ) : null}
            </Card>
          ))}
        </TabsContent>
      </div>
    </Tabs>
  );
}