import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Gavel, BookOpen, LayoutDashboard, Video, FolderOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import DonutLogo from "@/components/shared/DonutLogo";
import { mockStaff } from "@/data/ritx/staffData";

// Mock current staff — Anita has BOTH access flags to demo tab switcher
const currentStaff = mockStaff.find((s) => s.id === "s3")!;

export default function RitxStaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; visible: boolean }[] = [
    { to: "/staff", label: "Overview", icon: LayoutDashboard, visible: true },
    { to: "/staff/mentor/resources", label: "Resources", icon: FolderOpen, visible: currentStaff.mentorAccess },
    { to: "/staff/mentor/sessions", label: "Sessions", icon: Video, visible: currentStaff.mentorAccess },
    { to: "/staff/judge", label: "Judging", icon: Gavel, visible: currentStaff.judgeAccess },
  ];
  const visibleNav = nav.filter((n) => n.visible);

  const showRoleTabs = currentStaff.mentorAccess && currentStaff.judgeAccess;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-orange-50/40 to-white flex">
      <aside className="hidden lg:flex w-64 flex-col sticky top-0 h-screen bg-gradient-to-b from-amber-50 via-orange-50/80 to-white border-r border-orange-100/60 shadow-lg shadow-orange-100/20">
        <div className="px-4 h-16 border-b border-orange-100/60 flex items-center gap-3">
          <DonutLogo size={40} />
          <div className="flex flex-col">
            <span className="font-bold text-lg gradient-text leading-tight">RiTX</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">{currentStaff.name}</span>
          </div>
        </div>
        {showRoleTabs && (
          <div className="px-3 pt-3 flex gap-1">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><BookOpen className="w-3 h-3" />Mentor</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1"><Gavel className="w-3 h-3" />Judge</span>
          </div>
        )}
        <nav className="flex-1 px-3 pt-4 space-y-1.5 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to} end
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                isActive ? "bg-gradient-to-r from-donut-coral to-donut-orange text-white font-medium shadow-md shadow-donut-coral/30" : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
              )}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-orange-100/60">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 hover:bg-white/80" onClick={() => navigate("/login")}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-gradient-to-r from-amber-50 to-orange-50/80 backdrop-blur border-b border-orange-100/60 flex items-center justify-between px-3 h-14">
        <div className="flex items-center gap-2">
          <DonutLogo size={32} />
          <div className="font-bold text-sm gradient-text">RiTX · Staff</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-gradient-to-b from-amber-50 via-orange-50/60 to-white/95 backdrop-blur p-3" onClick={() => setMobileOpen(false)}>
          <nav className="space-y-1">
            {visibleNav.map((item) => (
              <NavLink key={item.to} to={item.to} end
                className={({ isActive }) => cn("flex items-center gap-3 px-3 py-3 rounded-xl text-sm", isActive ? "bg-gradient-to-r from-donut-coral to-donut-orange text-white font-medium shadow-md shadow-donut-coral/30" : "hover:bg-white/70")}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
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
