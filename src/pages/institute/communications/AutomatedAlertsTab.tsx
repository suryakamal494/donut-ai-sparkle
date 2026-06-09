// Automated Alerts tab — toggle matrix with mandatory always-visible previews
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Users, BookUser } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { alertConfigRows, audienceLabels } from "@/data/institute/whatsappComms";
import type { AlertConfigRow, CommAudience } from "@/types/whatsappComms";
import MessagePreview from "./MessagePreview";

const STORAGE_KEY = "institute_whatsapp_alert_toggles";

const audienceIcon: Record<string, typeof Users> = {
  teachers: GraduationCap,
  parents: Users,
  students: BookUser,
};

function loadToggles(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  alertConfigRows.forEach((r) => (defaults[r.id] = r.enabledByDefault));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaults;
}

interface AudienceGroupProps {
  audience: CommAudience;
  rows: AlertConfigRow[];
  toggles: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSetAll: (audience: CommAudience, value: boolean) => void;
}

const AudienceGroup = ({ audience, rows, toggles, onToggle, onSetAll }: AudienceGroupProps) => {
  const Icon = audienceIcon[audience];
  const enabledCount = rows.filter((r) => toggles[r.id]).length;
  const allOn = enabledCount === rows.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </span>
            {audienceLabels[audience]}
            <Badge variant="secondary" className="text-[10px]">
              {enabledCount}/{rows.length} on
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onSetAll(audience, !allOn)}
          >
            {allOn ? "Disable all" : "Enable all"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => {
          const on = !!toggles[row.id];
          return (
            <div
              key={row.id}
              className="rounded-xl border border-border p-3 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{row.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.description}</p>
                </div>
                <Switch
                  checked={on}
                  onCheckedChange={() => onToggle(row.id)}
                  className="shrink-0 mt-0.5"
                  aria-label={`Toggle ${row.title}`}
                />
              </div>
              <MessagePreview body={row.previewBody} compact className={on ? "" : "opacity-60"} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const AutomatedAlertsTab = () => {
  const [toggles, setToggles] = useState<Record<string, boolean>>(loadToggles);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toggles));
    } catch {
      /* ignore */
    }
  }, [toggles]);

  const grouped = useMemo(() => {
    const map: Record<string, AlertConfigRow[]> = { teachers: [], parents: [], students: [] };
    alertConfigRows.forEach((r) => map[r.audience].push(r));
    return map;
  }, []);

  const handleToggle = (id: string) =>
    setToggles((t) => ({ ...t, [id]: !t[id] }));

  const handleSetAll = (audience: CommAudience, value: boolean) =>
    setToggles((t) => {
      const next = { ...t };
      grouped[audience].forEach((r) => (next[r.id] = value));
      return next;
    });

  const audiences: CommAudience[] = ["teachers", "parents"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Turn on the alerts you want sent automatically. Only enabled alerts are delivered —
        every message shows exactly what the recipient receives.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {audiences.map((a) => (
          <AudienceGroup
            key={a}
            audience={a}
            rows={grouped[a]}
            toggles={toggles}
            onToggle={handleToggle}
            onSetAll={handleSetAll}
          />
        ))}
      </div>
    </div>
  );
};

export default AutomatedAlertsTab;
