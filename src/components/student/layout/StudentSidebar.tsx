// Student Sidebar - Premium warm gradient design for desktop
// Completely separate from other portal sidebars

import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import DonutLogo from "@/components/shared/DonutLogo";
import { studentProfile } from "@/data/student/profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Home", icon: Home, path: "/student/dashboard" },
  { id: "timetable", label: "Timetable", icon: Calendar, path: "/student/timetable" },
  { id: "subjects", label: "Subjects", icon: BookOpen, path: "/student/subjects" },
  { id: "tests", label: "Tests", icon: Trophy, path: "/student/tests" },
  { id: "progress", label: "Progress", icon: TrendingUp, path: "/student/progress" },
];

const StudentSidebar = ({ collapsed, onToggle }: StudentSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/student/dashboard") {
      return location.pathname === "/student/dashboard" || location.pathname === "/student";
    }
    return location.pathname.startsWith(path);
  };

  const initials = studentProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-amber-50 via-orange-50/80 to-white",
        "border-r border-orange-100/50 shadow-lg shadow-orange-100/20",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header with Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-orange-100/50",
        collapsed && "justify-center"
      )}>
        <DonutLogo size={40} />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg gradient-text">theDonutAI</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Learning made fun</span>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className={cn(
        "mx-3 mt-4 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-orange-100/50",
        collapsed && "mx-2 p-2"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-10 w-10 border-2 border-donut-coral/30 shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-donut-coral to-donut-orange text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {studentProfile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {studentProfile.grade}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">Streak</span>
            <span className="text-sm font-bold text-donut-coral flex items-center gap-1">
              🔥 {studentProfile.streak} days
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 mt-4">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            const navButton = (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-gradient-to-r from-donut-coral to-donut-orange text-white shadow-md shadow-donut-coral/30"
                    : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("w-5 h-5 flex-shrink-0", active && "text-white")}
                  strokeWidth={active ? 2.5 : 2}
                />
                {!collapsed && (
                  <>
                    <span className={cn("font-medium text-sm", active && "text-white")}>
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span
                        className={cn(
                          "ml-auto min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold rounded-full px-1.5",
                          active
                            ? "bg-white/30 text-white"
                            : "bg-gradient-to-br from-red-500 to-rose-500 text-white"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold rounded-full px-1 bg-gradient-to-br from-red-500 to-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navButton;
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-orange-100/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full justify-center text-muted-foreground hover:text-foreground hover:bg-white/80",
            !collapsed && "justify-start"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
