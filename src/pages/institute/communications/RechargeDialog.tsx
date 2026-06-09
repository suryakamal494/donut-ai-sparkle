// Recharge dialog (mock) — pick a pack, see GST breakdown, "pay"
import { useState } from "react";
import { Check, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  rechargePacks,
  GST_RATE,
  fmt,
  inr,
} from "@/data/institute/whatsappComms";

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecharge: (messages: number) => void;
}

const RechargeDialog = ({ open, onOpenChange, onRecharge }: RechargeDialogProps) => {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(rechargePacks[1].id);

  const pack = rechargePacks.find((p) => p.id === selectedId) ?? rechargePacks[0];
  const subtotal = pack.messages * pack.ratePerMessage;
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  const handlePay = () => {
    onRecharge(pack.messages);
    onOpenChange(false);
    toast({
      title: "Recharge successful",
      description: `${fmt(pack.messages)} messages added to your WhatsApp balance.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Recharge WhatsApp balance
          </DialogTitle>
          <DialogDescription>
            Pay-as-you-go. Pick a pack — billed once, no subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {rechargePacks.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-3 transition-all flex items-center gap-3 min-h-11",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                  )}
                >
                  {active && <Check className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{fmt(p.messages)} messages</span>
                    {p.tag && (
                      <Badge variant="secondary" className="text-[10px]">
                        {p.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inr(p.ratePerMessage)} / message
                  </p>
                </div>
                <span className="font-semibold text-sm shrink-0">
                  {inr(p.messages * p.ratePerMessage)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-muted/50 p-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{inr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GST (18%)</span>
            <span>{inr(gst)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground pt-1.5 border-t border-border">
            <span>Total payable</span>
            <span>{inr(total)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-11">
            Cancel
          </Button>
          <Button onClick={handlePay} className="min-h-11">
            Pay {inr(total)} &amp; Recharge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeDialog;
