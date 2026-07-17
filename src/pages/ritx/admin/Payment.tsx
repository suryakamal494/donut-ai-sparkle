import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function RitxPayment() {
  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState("razorpay");
  const [fee, setFee] = useState(199);
  const [scholarship, setScholarship] = useState(true);

  return (
    <div className="space-y-4">
      <PageHeader title="Payment gateway" description="Configure fees, provider and fee-waiver policy" actions={<Button onClick={() => toast.success("Saved")}>Save</Button>} />

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" />Charge registration fee</div>
            <p className="text-xs text-muted-foreground">Only applies when competition mode is Paid.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Fee amount (INR)</Label>
            <Input type="number" value={fee} onChange={(e) => setFee(+e.target.value)} disabled={!enabled} />
          </div>
          <div>
            <Label>GST %</Label>
            <Input type="number" defaultValue={18} disabled={!enabled} />
          </div>
        </div>
        <div>
          <Label className="mb-2 block">Provider</Label>
          <RadioGroup value={provider} onValueChange={setProvider} className="grid sm:grid-cols-3 gap-2">
            {["razorpay", "stripe", "cashfree"].map((p) => (
              <label key={p} className="p-3 border rounded-lg cursor-pointer flex items-center gap-2 capitalize hover:bg-muted">
                <RadioGroupItem value={p} /> {p}
              </label>
            ))}
          </RadioGroup>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Scholarship waivers</div>
        <div className="flex items-center justify-between">
          <div className="text-sm">Allow schools to request fee waivers</div>
          <Switch checked={scholarship} onCheckedChange={setScholarship} />
        </div>
        <p className="text-xs text-muted-foreground">Admin reviews each request. Approved teams skip the payment step.</p>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="font-semibold">API credentials</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Key ID</Label><Input placeholder="rzp_test_xxxxxxxxx" /></div>
          <div><Label>Key secret</Label><Input type="password" placeholder="••••••••" /></div>
        </div>
        <p className="text-xs text-muted-foreground">Test-mode UI only. Wire to your gateway during backend integration.</p>
      </Card>
    </div>
  );
}
