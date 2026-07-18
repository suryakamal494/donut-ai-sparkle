import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard } from "lucide-react";
import { PayDialog } from "./PayDialog";
import {
  getCurrentUser,
  getCurrentWorkspace,
  hasUserPaid,
  isLead,
  pricing,
} from "@/data/ritx/workspaceState";

interface Props {
  feature: "submission" | "result";
  children: React.ReactNode;
}

export function PaywallGate({ feature, children }: Props) {
  const [open, setOpen] = useState(false);
  const [, bump] = useState(0);
  const navigate = useNavigate();
  const ws = getCurrentWorkspace();
  const user = getCurrentUser();

  if (hasUserPaid(user, ws)) return <>{children}</>;
  if (!user) return <>{children}</>; // not logged in — let auth flow handle it

  const preCreate = !ws;
  const lead = preCreate ? true : isLead(ws, user.id);
  const label = feature === "submission" ? "Submissions" : "Results & certificates";

  return (
    <>
      <Card className="p-8 rounded-2xl border-orange-200 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 shadow-sm shadow-orange-100/40 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-donut-coral to-donut-orange flex items-center justify-center shadow-lg shadow-donut-coral/30 mb-4">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="text-xs uppercase tracking-widest text-donut-coral font-semibold">Payment required</div>
        <h2 className="text-2xl font-bold mt-1">{label} are locked</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          This is a paid competition. Complete the one-time team fee of{" "}
          <span className="font-semibold text-foreground">₹{pricing.amount.toLocaleString("en-IN")}</span>{" "}
          {preCreate
            ? "to create your team workspace and unlock every stage of the competition."
            : <>to unlock {feature === "submission" ? "both submission stages" : "your team result and certificates"} for every member of <span className="font-semibold text-foreground">{ws!.name}</span>.</>}
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            onClick={() => setOpen(true)}
            disabled={!lead}
            className="bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0 shadow-md shadow-donut-coral/30"
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            {lead ? `Pay ₹${pricing.amount.toLocaleString("en-IN")} & unlock` : "Waiting on team lead"}
          </Button>
          {!lead && (
            <span className="text-xs text-muted-foreground">Only the team lead can complete payment.</span>
          )}
        </div>
      </Card>

      <PayDialog
        open={open}
        onOpenChange={setOpen}
        workspace={ws ?? undefined}
        mode={preCreate ? "pre-create" : "workspace-unlock"}
        onPaid={() => {
          bump((n) => n + 1);
          if (preCreate) navigate("/team");
        }}
      />
    </>
  );
}