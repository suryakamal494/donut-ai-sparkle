import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES, CLASS_OPTIONS } from "@/data/ritx/mockData";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { OrganiserHeaderStrip } from "@/components/ritx/shared/OrganiserHeaderStrip";
import { AppFooter } from "@/components/ritx/shared/AppFooter";

interface Draft {
  teamName: string;
  leadName: string;
  school: string;
  grade: string;
  state: string;
  city: string;
  email: string;
}

export default function RitxTeamRegister() {
  const [step, setStep] = useState<1 | 2>(1);
  const [d, setD] = useState<Draft>({ teamName: "", leadName: "", school: "", grade: "", state: "", city: "", email: "" });
  const [otp, setOtp] = useState("");
  const nav = useNavigate();

  const canContinue =
    d.teamName.trim() && d.leadName.trim() && d.school.trim() && d.grade && d.state && d.city.trim() && /.+@.+\..+/.test(d.email);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50/40 to-white">
      <OrganiserHeaderStrip variant="hero" />
      <div className="flex-1 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <PageHeader title="Register your team" description={`Step ${step} of 2 · You can pick your track & theme after login`} />

        {step === 1 && (
          <Card className="p-5 md:p-6 space-y-4 rounded-2xl border-orange-100/70 shadow-sm shadow-orange-100/30 bg-white">
            <div className="flex items-center gap-2 text-xs text-donut-coral font-semibold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Team details
            </div>

            <div>
              <Label>Team name</Label>
              <Input value={d.teamName} onChange={(e) => setD({ ...d, teamName: e.target.value })} placeholder="e.g. Curious Cosmos" />
            </div>

            <div>
              <Label>Team lead name</Label>
              <Input value={d.leadName} onChange={(e) => setD({ ...d, leadName: e.target.value })} placeholder="Full name of the student lead" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>School</Label>
                <Input value={d.school} onChange={(e) => setD({ ...d, school: e.target.value })} placeholder="School name" />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={d.grade} onValueChange={(v) => setD({ ...d, grade: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>State</Label>
                <Select value={d.state} onValueChange={(v) => setD({ ...d, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Input value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} placeholder="City" />
              </div>
            </div>

            <div>
              <Label>Team lead email</Label>
              <Input type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} placeholder="lead@example.com" />
              <p className="text-[11px] text-muted-foreground mt-1">We'll send a 6-digit code to verify this address.</p>
            </div>

            <Button
              onClick={() => { toast.success("OTP sent (mock: 123456)"); setStep(2); }}
              disabled={!canContinue}
              className="w-full bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0 shadow-md shadow-donut-coral/30"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-5 md:p-6 space-y-4 rounded-2xl border-orange-100/70 shadow-sm shadow-orange-100/30 bg-white">
            <div className="font-semibold">Verify email</div>
            <p className="text-sm text-muted-foreground">Enter the code sent to <span className="font-medium">{d.email}</span>.</p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => { toast.success("Team registered! Pick your track from the dashboard."); nav("/team"); }}
                disabled={otp.length !== 6}
                className="flex-1 bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0 shadow-md shadow-donut-coral/30"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Complete registration
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Track and challenge theme are chosen from your team dashboard after login, and can be changed any time before the submission deadline.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
