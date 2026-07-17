import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Gavel, BookOpen, LayoutDashboard, Video, FolderOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { mockStaff } from "@/data/ritx/staffData";

// Mock current staff — Anita has BOTH access flags to demo tab switcher
const currentStaff = mockStaff.find((s) => s.id === "s3")!;

export default function RitxStaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; visible: boolean }[] = [
    { to: "/ritx/staff", label: "Overview", icon: LayoutDashboard, visible: true },
    { to: "/ritx/staff/mentor/resources", label: "Resources", icon: FolderOpen, visible: currentStaff.mentorAccess },
    { to: "/ritx/staff/mentor/sessions", label: "Sessions", icon: Video, visible: currentStaff.mentorAccess },
    { to: "/ritx/staff/judge", label: "Judging (blind)", icon: Gavel, visible: currentStaff.judgeAccess },
  ];
  const visibleNav = nav.filter((n) => n.visible);

  const showRoleTabs = currentStaff.mentorAccess && currentStaff.judgeAccess;

  return (
    <div className="min-h-screen w-full bg-muted/30 flex">
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background sticky top-0 h-screen">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">RiTX</div>
            <div className="text-[11px] text-muted-foreground">{currentStaff.name}</div>
          </div>
        </div>
        {showRoleTabs && (
          <div className="px-3 pt-3 flex gap-1">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><BookOpen className="w-3 h-3" />Mentor</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1"><Gavel className="w-3 h-3" />Judge</span>
          </div>
        )}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to} end
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
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

      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-background border-b flex items-center justify-between px-3 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
          <div className="font-bold text-sm">RiTX · Staff</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur p-3" onClick={() => setMobileOpen(false)}>
          <nav className="space-y-1">
            {visibleNav.map((item) => (
              <NavLink key={item.to} to={item.to} end
                className={({ isActive }) => cn("flex items-center gap-3 px-3 py-3 rounded-lg text-sm", isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
