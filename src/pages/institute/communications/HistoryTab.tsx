// History / audit log tab — immutable frozen snapshots
import { useMemo, useState } from "react";
import { Search, Bot, Megaphone, AlertCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fmt, audienceLabels } from "@/data/institute/whatsappComms";
import type { HistoryEntry, CommMessageType } from "@/types/whatsappComms";

interface HistoryTabProps {
  history: HistoryEntry[];
}

const typeMeta: Record<CommMessageType, { label: string; icon: typeof Bot; cls: string }> = {
  automated: { label: "Automated", icon: Bot, cls: "bg-blue-100 text-blue-700" },
  broadcast: { label: "Broadcast", icon: Megaphone, cls: "bg-purple-100 text-purple-700" },
  system: { label: "System", icon: AlertCircle, cls: "bg-slate-100 text-slate-700" },
};

const statusCls: Record<HistoryEntry["status"], string> = {
  sent: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  paused: "bg-red-100 text-red-700",
};

const PAGE = 5;

const HistoryTab = ({ history }: HistoryTabProps) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE);
  const [active, setActive] = useState<HistoryEntry | null>(null);

  const filtered = useMemo(() => {
    return history.filter((h) => {
      if (typeFilter !== "all" && h.type !== typeFilter) return false;
      if (audienceFilter !== "all" && !h.snapshot.audiences.includes(audienceFilter as never))
        return false;
      if (search && !`${h.title} ${h.body}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [history, typeFilter, audienceFilter, search]);

  const shown = filtered.slice(0, visible);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisible(PAGE);
            }}
            placeholder="Search messages…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setVisible(PAGE); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="automated">Automated</SelectItem>
              <SelectItem value="broadcast">Broadcast</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={audienceFilter} onValueChange={(v) => { setAudienceFilter(v); setVisible(PAGE); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              <SelectItem value="teachers">Teachers</SelectItem>
              <SelectItem value="parents">Parents</SelectItem>
              <SelectItem value="students">Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="font-medium px-4 py-2.5">Date</th>
              <th className="font-medium px-4 py-2.5">Type</th>
              <th className="font-medium px-4 py-2.5">Audience &amp; sections</th>
              <th className="font-medium px-4 py-2.5 text-right">Recipients</th>
              <th className="font-medium px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((h) => {
              const Meta = typeMeta[h.type];
              return (
                <tr
                  key={h.id}
                  onClick={() => setActive(h)}
                  className="border-t border-border hover:bg-muted/30 cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {fmtDate(h.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", Meta.cls)}>
                      <Meta.icon className="w-3 h-3" /> {Meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[260px]">{h.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.snapshot.audiences.map((a) => audienceLabels[a]).join(", ") || "—"}
                      {h.snapshot.sections.length > 0 && ` · ${h.snapshot.sections.join(", ")}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(h.snapshot.recipients)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] capitalize", statusCls[h.status])}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {shown.map((h) => {
          const Meta = typeMeta[h.type];
          return (
            <Card key={h.id} onClick={() => setActive(h)} className="cursor-pointer">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", Meta.cls)}>
                    <Meta.icon className="w-3 h-3" /> {Meta.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{fmtDate(h.sentAt)}</span>
                </div>
                <p className="font-medium text-sm">{h.title}</p>
                <p className="text-xs text-muted-foreground">
                  {h.snapshot.audiences.map((a) => audienceLabels[a]).join(", ") || "—"}
                  {h.snapshot.sections.length > 0 && ` · ${h.snapshot.sections.join(", ")}`}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {fmt(h.snapshot.recipients)} recipients
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] capitalize", statusCls[h.status])}>
                    {h.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No messages found.</p>
      )}

      {visible < filtered.length && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
            Show more
          </Button>
        </div>
      )}

      {/* Detail drawer */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.title}</SheetTitle>
                <SheetDescription>
                  Sent {new Date(active.sentAt).toLocaleString()}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Audience snapshot (at send time)
                  </p>
                  <div className="rounded-lg border border-border p-3 space-y-1.5 text-sm">
                    <p>
                      <span className="text-muted-foreground">Audience: </span>
                      {active.snapshot.audiences.map((a) => audienceLabels[a]).join(", ") || "—"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Classes: </span>
                      {active.snapshot.sections.length > 0 ? active.snapshot.sections.join(", ") : "—"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Recipients: </span>
                      <span className="font-semibold">{fmt(active.snapshot.recipients)}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Message</p>
                  <div className="rounded-lg border border-border p-3 text-sm whitespace-pre-line">
                    {active.body}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Used</p>
                    <p className="font-semibold">{fmt(active.messagesUsed)}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <p className="text-[11px] text-emerald-700">Delivered</p>
                    <p className="font-semibold text-emerald-700">{fmt(active.delivery.delivered)}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2.5">
                    <p className="text-[11px] text-red-700">Failed</p>
                    <p className="font-semibold text-red-700">{fmt(active.delivery.failed)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HistoryTab;
