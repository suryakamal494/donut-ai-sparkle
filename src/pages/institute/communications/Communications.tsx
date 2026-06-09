// WhatsApp Communications Hub — institute panel
import { useState } from "react";
import { MessageCircle, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmt } from "@/data/institute/whatsappComms";
import { useWhatsAppWallet } from "@/hooks/useWhatsAppWallet";
import PauseBanner from "./PauseBanner";
import RechargeDialog from "./RechargeDialog";
import OverviewTab from "./OverviewTab";
import AutomatedAlertsTab from "./AutomatedAlertsTab";
import BroadcastTab from "./BroadcastTab";
import HistoryTab from "./HistoryTab";

const Communications = () => {
  const wallet = useWhatsAppWallet();
  const { balance, level, isPaused, history, recharge, recordSend } = wallet;
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [tab, setTab] = useState("overview");

  const pillCls =
    level === "empty"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : level === "low"
        ? "bg-amber-50 text-amber-700 border-amber-300"
        : "bg-emerald-50 text-emerald-700 border-emerald-300";

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary shrink-0" />
            <span className="truncate">Communications</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            WhatsApp wallet, automated alerts, broadcasts &amp; history.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
              pillCls,
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="whitespace-nowrap">{fmt(balance.remaining)} left</span>
          </div>
          <Button onClick={() => setRechargeOpen(true)} size="sm" className="min-h-10">
            <Zap className="w-4 h-4 mr-1.5" /> Recharge
          </Button>
        </div>
      </div>

      {/* Global pause banner */}
      {isPaused && (
        <PauseBanner remaining={balance.remaining} onRecharge={() => setRechargeOpen(true)} />
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide h-auto p-1 flex-nowrap">
          <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="alerts" className="whitespace-nowrap">Automated Alerts</TabsTrigger>
          <TabsTrigger value="broadcast" className="whitespace-nowrap">Broadcast</TabsTrigger>
          <TabsTrigger value="history" className="whitespace-nowrap">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            balance={balance}
            level={level}
            history={history}
            onRecharge={() => setRechargeOpen(true)}
            onGoToHistory={() => setTab("history")}
          />
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <AutomatedAlertsTab />
        </TabsContent>
        <TabsContent value="broadcast" className="mt-4">
          <BroadcastTab
            remaining={balance.remaining}
            isPaused={isPaused}
            onSend={recordSend}
            onRecharge={() => setRechargeOpen(true)}
          />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <HistoryTab history={history} />
        </TabsContent>
      </Tabs>

      <RechargeDialog open={rechargeOpen} onOpenChange={setRechargeOpen} onRecharge={recharge} />
    </div>
  );
};

export default Communications;
