import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface RitxNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RitxShellProps {
  role: "Admin" | "Team" | "Staff";
  roleColor?: string;
  nav: RitxNavItem[];
}

export function RitxShell({ role, roleColor = "from-fuchsia-500 to-indigo-500", nav }: RitxShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-muted/30 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background sticky top-0 h-screen">
        <div className="p-4 border-b flex items-center gap-2">
          <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow", roleColor)}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">RiTX</div>
            <div className="text-[11px] text-muted-foreground">{role} Console</div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => navigate("/ritx/login")}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-background border-b flex items-center justify-between px-3 h-14">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", roleColor)}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="font-bold text-sm">RiTX · {role}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur p-3" onClick={() => setMobileOpen(false)}>
          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm",
                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
            <Button variant="ghost" className="w-full justify-start gap-2 mt-4" onClick={() => navigate("/ritx/login")}>
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </nav>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
