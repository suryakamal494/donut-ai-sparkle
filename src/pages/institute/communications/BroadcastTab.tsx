// Broadcast composer tab
import { useMemo, useState } from "react";
import {
  GraduationCap,
  Users,
  Send,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  commClasses,
  teacherHeadcount,
  fmt,
  SCHOOL_NAME,
} from "@/data/institute/whatsappComms";
import type { CommAudience, HistoryEntry } from "@/types/whatsappComms";
import MessagePreview from "./MessagePreview";

interface BroadcastTabProps {
  remaining: number;
  isPaused: boolean;
  onSend: (entry: Omit<HistoryEntry, "id" | "sentAt">) => boolean;
  onRecharge: () => void;
}

const audienceOptions: { key: CommAudience; label: string; icon: typeof Users }[] = [
  { key: "teachers", label: "Teachers", icon: GraduationCap },
  { key: "parents", label: "Parents", icon: Users },
];

const templates = [
  {
    label: "Exam reminder",
    body:
      "Dear Parent,\nThis is a reminder that exams begin next week. Please ensure your ward is well prepared.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    label: "Holiday notice",
    body:
      "Dear Parent,\nThe school will remain closed tomorrow. Regular classes resume the following day.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    label: "Staff meeting",
    body:
      "Dear Teacher,\nA staff meeting is scheduled today at 4:00 PM in the Conference Hall.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
];

const BroadcastTab = ({ remaining, isPaused, onSend, onRecharge }: BroadcastTabProps) => {
  const { toast } = useToast();
  const [audiences, setAudiences] = useState<CommAudience[]>(["parents"]);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  const toggleAudience = (key: CommAudience) =>
    setAudiences((a) => (a.includes(key) ? a.filter((x) => x !== key) : [...a, key]));

  const toggleSection = (id: string) =>
    setSelectedSections((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSectionIds = useMemo(
    () => commClasses.flatMap((c) => c.sections.map((s) => s.id)),
    [],
  );
  const allSelected = selectedSections.size === allSectionIds.length && allSectionIds.length > 0;

  const toggleAllSections = () =>
    setSelectedSections(allSelected ? new Set() : new Set(allSectionIds));

  const toggleClassSections = (classId: string) => {
    const cls = commClasses.find((c) => c.id === classId);
    if (!cls) return;
    const ids = cls.sections.map((s) => s.id);
    const allOn = ids.every((id) => selectedSections.has(id));
    setSelectedSections((s) => {
      const next = new Set(s);
      ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  // Recipient math
  const sectionRecipients = useMemo(() => {
    let total = 0;
    commClasses.forEach((c) =>
      c.sections.forEach((s) => {
        if (selectedSections.has(s.id)) total += s.recipients;
      }),
    );
    return total;
  }, [selectedSections]);

  const needsSections = audiences.some((a) => a === "parents" || a === "students");
  const studentScopeCount = audiences.filter((a) => a === "parents" || a === "students").length;
  const estMessages =
    (audiences.includes("teachers") ? teacherHeadcount : 0) +
    studentScopeCount * sectionRecipients;

  const selectedSectionLabels = useMemo(
    () =>
      commClasses
        .flatMap((c) => c.sections)
        .filter((s) => selectedSections.has(s.id))
        .map((s) => s.label),
    [selectedSections],
  );

  const overBalance = estMessages > remaining;
  const canSend =
    !isPaused &&
    !overBalance &&
    audiences.length > 0 &&
    message.trim().length > 0 &&
    estMessages > 0 &&
    (!needsSections || selectedSections.size > 0);

  const handleSend = () => {
    const ok = onSend({
      type: "broadcast",
      title: "Broadcast",
      body: message.trim(),
      snapshot: {
        audiences: [...audiences],
        sections: needsSections ? selectedSectionLabels : [],
        recipients: estMessages,
      },
      messagesUsed: estMessages,
      status: "sent",
      delivery: { delivered: estMessages, failed: 0 },
    });
    if (ok) {
      toast({
        title: "Broadcast sent",
        description: `Delivered to ${fmt(estMessages)} recipients. ${fmt(estMessages)} messages used.`,
      });
      setMessage("");
      setSelectedSections(new Set());
    } else {
      toast({
        title: "Send failed",
        description: "Insufficient WhatsApp balance. Please recharge.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* Composer */}
      <div className="space-y-4">
        {/* Audience */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">1. Choose audience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {audienceOptions.map((opt) => {
                const Icon = opt.icon;
                const active = audiences.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleAudience(opt.key)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all min-h-11",
                      active
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                    {active && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Scope */}
        <Card className={cn(!needsSections && "opacity-60 pointer-events-none")}>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">2. Choose classes &amp; sections</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={toggleAllSections}>
              {allSelected ? "Clear all" : "All classes"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {!needsSections && (
              <p className="text-xs text-muted-foreground">
                Not required for teachers-only broadcasts.
              </p>
            )}
            {commClasses.map((cls) => {
              const ids = cls.sections.map((s) => s.id);
              const classAllOn = ids.every((id) => selectedSections.has(id));
              return (
                <div key={cls.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{cls.label}</span>
                    <button
                      className="text-[11px] text-primary"
                      onClick={() => toggleClassSections(cls.id)}
                    >
                      {classAllOn ? "Clear" : "All sections"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.sections.map((s) => {
                      const active = selectedSections.has(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSection(s.id)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-xs transition-all min-h-9",
                            active
                              ? "border-primary bg-primary/10 text-primary font-medium"
                              : "border-border hover:bg-muted/50",
                          )}
                        >
                          {s.label}
                          <span className="text-[10px] text-muted-foreground ml-1">
                            {fmt(s.recipients)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">3. Compose message</CardTitle>
            <span className="text-[11px] text-muted-foreground">{message.length} chars</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {templates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setMessage(t.body)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-muted/50"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message…"
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview + review */}
      <div className="space-y-4 lg:sticky lg:top-20">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Live preview</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagePreview
              body={message.trim() || "Your message preview will appear here…"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">4. Review &amp; send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-xs text-muted-foreground">Recipients</p>
                <p className="font-semibold">{fmt(estMessages)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-xs text-muted-foreground">Messages to deduct</p>
                <p className="font-semibold">{fmt(estMessages)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {audiences.map((a) => (
                <Badge key={a} variant="secondary" className="capitalize text-[10px]">
                  {a}
                </Badge>
              ))}
              {selectedSectionLabels.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>

            {isPaused ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Messaging is paused. Recharge to send.
              </div>
            ) : overBalance ? (
              <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-2.5 text-xs text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This exceeds your balance of {fmt(remaining)} messages.
              </div>
            ) : null}

            {isPaused || overBalance ? (
              <Button onClick={onRecharge} className="w-full min-h-11">
                Recharge to send
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!canSend} className="w-full min-h-11">
                <Send className="w-4 h-4 mr-2" /> Send broadcast
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BroadcastTab;
