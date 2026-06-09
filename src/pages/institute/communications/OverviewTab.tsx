// Overview / Wallet tab
import {
  MessageCircle,
  TrendingUp,
  CalendarClock,
  Megaphone,
  Bot,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  fmt,
  audienceLabels,
  LOW_BALANCE_THRESHOLD,
} from "@/data/institute/whatsappComms";
import type { WhatsAppBalance, HistoryEntry } from "@/types/whatsappComms";

interface OverviewTabProps {
  balance: WhatsAppBalance;
  level: "ok" | "low" | "empty";
  history: HistoryEntry[];
  onRecharge: () => void;
  onGoToHistory: () => void;
}

const typeMeta: Record<HistoryEntry["type"], { label: string; icon: typeof Bot }> = {
  automated: { label: "Automated", icon: Bot },
  broadcast: { label: "Broadcast", icon: Megaphone },
  system: { label: "System", icon: AlertCircle },
};

const OverviewTab = ({ balance, level, history, onRecharge, onGoToHistory }: OverviewTabProps) => {
  // Mock: estimated daily run-rate from monthly usage
  const dailyRate = Math.max(1, Math.round(balance.usedThisMonth / 30));
  const daysLeft = Math.floor(balance.remaining / dailyRate);

  const automatedUsed = Math.round(balance.usedThisMonth * 0.62);
  const broadcastUsed = balance.usedThisMonth - automatedUsed;
  const byAudience = [
    { key: "parents", value: Math.round(balance.usedThisMonth * 0.7) },
    { key: "teachers", value: Math.round(balance.usedThisMonth * 0.22) },
    { key: "students", value: Math.round(balance.usedThisMonth * 0.08) },
  ];

  const recent = history.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Balance card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p
              className={cn(
                "text-4xl font-bold tracking-tight",
                level === "empty" && "text-destructive",
                level === "low" && "text-amber-600",
              )}
            >
              {fmt(balance.remaining)}
            </p>
            <p className="text-xs text-muted-foreground">messages remaining</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-muted-foreground text-xs">Used this month</p>
              <p className="font-semibold">{fmt(balance.usedThisMonth)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-muted-foreground text-xs">Est. days left</p>
              <p className="font-semibold">{level === "empty" ? "0" : `~${daysLeft}`}</p>
            </div>
          </div>
          <Button onClick={onRecharge} className="w-full min-h-11">
            Recharge
          </Button>
        </CardContent>
      </Card>

      {/* Usage breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Usage this month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Automated</p>
                <p className="font-semibold">{fmt(automatedUsed)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Broadcast</p>
                <p className="font-semibold">{fmt(broadcastUsed)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> By audience
            </p>
            {byAudience.map((a) => {
              const pct = Math.round((a.value / balance.usedThisMonth) * 100) || 0;
              return (
                <div key={a.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{audienceLabels[a.key]}</span>
                    <span className="text-muted-foreground">
                      {fmt(a.value)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Low balance explainer */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Low balance protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            When your balance hits zero, sending pauses automatically. A low-balance
            alert is sent to the principal on WhatsApp.
          </p>
          <div className="rounded-lg bg-muted/50 p-2.5 text-xs">
            <p className="text-muted-foreground">Alert threshold</p>
            <p className="font-semibold">{fmt(LOW_BALANCE_THRESHOLD)} messages</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5 text-xs">
            <p className="text-muted-foreground">Last alert sent</p>
            <p className="font-semibold">
              {balance.lastLowBalanceAlertAt
                ? new Date(balance.lastLowBalanceAlertAt).toLocaleString()
                : "No alerts yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <CalendarClock className="w-4 h-4" /> Recent activity
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onGoToHistory} className="text-xs h-8">
            View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.map((h) => {
            const Meta = typeMeta[h.type];
            const Icon = Meta.icon;
            return (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-lg border border-border p-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{h.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.sentAt).toLocaleDateString()} ·{" "}
                    {fmt(h.snapshot.recipients)} recipients
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {fmt(h.messagesUsed)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
