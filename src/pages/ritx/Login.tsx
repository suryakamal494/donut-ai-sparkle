import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield, Users, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import DonutLogo from "@/components/shared/DonutLogo";

type Role = "admin" | "team" | "staff";

const roleConfig: Record<Role, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; redirect: string; hint: string }> = {
  admin: { label: "Admin", icon: Shield, color: "from-violet-500 to-fuchsia-500", redirect: "/admin", hint: "Program organiser" },
  team: { label: "Team", icon: Users, color: "from-donut-coral to-donut-orange", redirect: "/team", hint: "Student team login" },
  staff: { label: "Mentor / Judge", icon: Gavel, color: "from-teal-500 to-cyan-500", redirect: "/staff", hint: "Access granted by admin" },
};

export default function RitxLogin() {
  const [params] = useSearchParams();
  const initial = (params.get("role") as Role) || "admin";
  const [role, setRole] = useState<Role>(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(roleConfig[role].redirect);
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
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 shadow-lg shadow-donut-coral/30 border-0">Sign in</Button>
          {role === "team" && (
            <Button type="button" variant="outline" className="w-full border-orange-200 hover:bg-orange-50/50" onClick={() => navigate("/team/register")}>
              New team? Register here
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
