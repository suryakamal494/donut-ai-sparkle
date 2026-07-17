import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import DonutLogo from "@/components/shared/DonutLogo";
import { CLASS_OPTIONS } from "@/data/ritx/mockData";
import { getWorkspaceForUser, loginOrRegister } from "@/data/ritx/workspaceState";
import { toast } from "sonner";

type Role = "admin" | "team" | "staff";

const roleConfig: Record<Role, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; redirect: string; hint: string }> = {
  admin: { label: "Admin", icon: Shield, color: "from-violet-500 to-fuchsia-500", redirect: "/admin", hint: "Program organiser" },
  team: { label: "Student", icon: Users, color: "from-donut-coral to-donut-orange", redirect: "/team", hint: "Sign in with your own email — you'll join a team workspace next" },
  staff: { label: "Mentor / Judge", icon: Gavel, color: "from-teal-500 to-cyan-500", redirect: "/staff", hint: "Access granted by admin" },
};

export default function RitxLogin() {
  const [params] = useSearchParams();
  const initial = (params.get("role") as Role) || "admin";
  const [role, setRole] = useState<Role>(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [klass, setKlass] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "team") {
      if (!name.trim() || !email.trim() || !klass) {
        toast.error("Fill in name, email and class to continue");
        return;
      }
      const user = loginOrRegister({ name, email, class: klass });
      const ws = getWorkspaceForUser(user.id);
      navigate(ws ? "/team" : "/team/join");
      return;
    }
    navigate(roleConfig[role].redirect);
  };

  const continueAsDemo = () => {
    const user = loginOrRegister({
      name: "Demo Student",
      email: "demo.student@ritx.test",
      class: "9",
    });
    const ws = getWorkspaceForUser(user.id);
    navigate(ws ? "/team" : "/team/join");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50/60 to-white p-4 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-donut-coral/20 to-donut-orange/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/40 to-transparent blur-3xl" />
      <Card className="w-full max-w-md p-6 md:p-8 rounded-2xl border-orange-100/60 shadow-xl shadow-orange-100/40 bg-white/90 backdrop-blur relative">
        <div className="flex items-center gap-3 mb-6">
          <DonutLogo size={40} />
          <div>
            <div className="font-bold text-lg gradient-text leading-tight">RiTX</div>
            <div className="text-xs text-muted-foreground">Sign in to continue</div>
          </div>
        </div>

        {/* Role picker */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(Object.keys(roleConfig) as Role[]).map((r) => {
            const c = roleConfig[r];
            const active = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs transition-all",
                  active ? "border-donut-coral bg-orange-50/70 shadow-md shadow-donut-coral/20" : "border-orange-100 hover:bg-orange-50/50"
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md", c.color)}>
                  <c.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{c.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mb-5 text-center">{roleConfig[role].hint}</p>

        <form onSubmit={submit} className="space-y-3">
          {role === "team" ? (
            <>
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ananya Rao" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={klass} onValueChange={setKlass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </>
          )}
          <Button type="submit" className="w-full bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 shadow-lg shadow-donut-coral/30 border-0">
            {role === "team" ? "Continue" : "Sign in"}
          </Button>
          {role === "team" && (
            <>
              <p className="text-[11px] text-center text-muted-foreground">
                After sign-in you'll either <span className="font-medium">create a new team workspace</span> or <span className="font-medium">paste an invite code</span> to join one.
              </p>
              <button
                type="button"
                onClick={continueAsDemo}
                className="w-full text-xs text-donut-coral hover:underline font-medium"
              >
                Continue as demo student →
              </button>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}
