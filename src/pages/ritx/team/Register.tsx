import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCompetition } from "@/data/ritx/mockData";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function RitxTeamRegister() {
  const [step, setStep] = useState(1);
  const [team, setTeam] = useState({ name: "", school: "", city: "", state: "", trackId: "sci-investigator", subTheme: "", email: "" });
  const [otp, setOtp] = useState("");
  const nav = useNavigate();
  const track = mockCompetition.tracks.find((t) => t.id === team.trackId);

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <PageHeader title="Register your team" description={`Step ${step} of 3`} />
        {step === 1 && (
          <Card className="p-5 space-y-4">
            <div className="font-semibold">Team details</div>
            <div><Label>Team name</Label><Input value={team.name} onChange={(e) => setTeam({ ...team, name: e.target.value })} placeholder="e.g. Curious Cosmos" /></div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>School</Label><Input value={team.school} onChange={(e) => setTeam({ ...team, school: e.target.value })} /></div>
              <div><Label>City</Label><Input value={team.city} onChange={(e) => setTeam({ ...team, city: e.target.value })} /></div>
            </div>
            <div><Label>State</Label><Input value={team.state} onChange={(e) => setTeam({ ...team, state: e.target.value })} /></div>
            <div>
              <Label>Track</Label>
              <Select value={team.trackId} onValueChange={(v) => setTeam({ ...team, trackId: v, subTheme: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockCompetition.tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sub-theme</Label>
              <Select value={team.subTheme} onValueChange={(v) => setTeam({ ...team, subTheme: v })}>
                <SelectTrigger><SelectValue placeholder="Pick a sub-theme" /></SelectTrigger>
                <SelectContent>
                  {track?.subThemes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setStep(2)} className="w-full">Continue <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Card>
        )}
        {step === 2 && (
          <Card className="p-5 space-y-4">
            <div className="font-semibold">Team lead contact</div>
            <div><Label>Team lead email</Label><Input value={team.email} onChange={(e) => setTeam({ ...team, email: e.target.value })} placeholder="lead@example.com" /></div>
            <p className="text-xs text-muted-foreground">We'll send a 6-digit code to verify this address.</p>
            <Button onClick={() => { toast.success("OTP sent (mock: 123456)"); setStep(3); }} className="w-full">Send code</Button>
          </Card>
        )}
        {step === 3 && (
          <Card className="p-5 space-y-4">
            <div className="font-semibold">Verify code</div>
            <p className="text-sm text-muted-foreground">Enter the code sent to <span className="font-medium">{team.email || "your email"}</span>.</p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            <Button
              onClick={() => { toast.success("Team registered! Add your members next."); nav("/team/members"); }}
              className="w-full"
              disabled={otp.length !== 6}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Complete registration
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
