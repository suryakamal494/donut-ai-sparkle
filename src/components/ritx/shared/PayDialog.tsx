import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentUser,
  isLead,
  payForWorkspace,
  pricing,
  type Workspace,
} from "@/data/ritx/workspaceState";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  onPaid?: () => void;
}

export function PayDialog({ open, onOpenChange, workspace, onPaid }: Props) {
  const user = getCurrentUser();
  const lead = user ? isLead(workspace, user.id) : false;

  const pay = () => {
    if (!user) return;
    if (!lead) { toast.error("Only the team lead can complete payment."); return; }
    payForWorkspace(workspace, user.id);
    toast.success(`Payment received. ${workspace.name} is unlocked.`);
    onOpenChange(false);
    onPaid?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-donut-coral" />
            Unlock submissions & results
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4">
          <div className="text-xs uppercase tracking-wide text-donut-coral font-semibold">Team registration fee</div>
          <div className="text-3xl font-bold mt-1">
            ₹{pricing.amount.toLocaleString("en-IN")}
            <span className="text-sm text-muted-foreground font-normal"> · one-time, whole team</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Workspace: <span className="font-medium text-foreground">{workspace.name}</span></div>
        </div>

        <ul className="text-xs text-muted-foreground space-y-1.5 mt-1">
          <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-donut-coral" /> Unlocks both submission stages for every member</li>
          <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-donut-coral" /> Unlocks results and per-member certificates</li>
          <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Payment is by the team lead only, once per workspace</li>
        </ul>

        {!lead && (
          <div className="text-xs rounded-md border border-amber-200 bg-amber-50 text-amber-800 p-2">
            Only the team lead can complete this payment. Ask them to pay from their login.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={pay}
            disabled={!lead}
            className="bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0 shadow-md shadow-donut-coral/30"
          >
            Pay ₹{pricing.amount.toLocaleString("en-IN")} & unlock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}