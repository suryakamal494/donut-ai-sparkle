// Global auto-pause banner shown on all Communications tabs when balance is 0
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/data/institute/whatsappComms";

interface PauseBannerProps {
  remaining: number;
  onRecharge: () => void;
}

const PauseBanner = ({ remaining, onRecharge }: PauseBannerProps) => {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-lg bg-destructive/15 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-destructive text-sm sm:text-base">
            WhatsApp Messaging Paused
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Current balance: <span className="font-medium text-foreground">{fmt(remaining)} messages</span>.
            Automated alerts and broadcasts will not be delivered until you recharge.
          </p>
        </div>
      </div>
      <Button
        onClick={onRecharge}
        className="shrink-0 w-full sm:w-auto min-h-11"
        variant="destructive"
      >
        Recharge
      </Button>
    </div>
  );
};

export default PauseBanner;
