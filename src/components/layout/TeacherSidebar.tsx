import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ClipboardCheck,
  FileText,
  Library,
  Database,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DonutLogo from "@/components/shared/DonutLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TeacherSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/teacher/dashboard" },
  
  { icon: Calendar, label: "My Schedule", path: "/teacher/schedule" },
  { icon: BookOpen, label: "Lesson Plans", path: "/teacher/lesson-plans" },
  { icon: TrendingUp, label: "Syllabus Progress", path: "/teacher/academic-progress" },
  { icon: ClipboardCheck, label: "Exams", path: "/teacher/exams" },
  { icon: BarChart3, label: "Reports", path: "/teacher/reports" },
  { icon: FileText, label: "Homework", path: "/teacher/homework" },
  { icon: Library, label: "Content Library", path: "/teacher/content" },
  { icon: Database, label: "Chapter Details", path: "/teacher/reference" },
];

const TeacherSidebar = ({ collapsed, onToggle, isMobile, onMobileClose }: TeacherSidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/teacher/dashboard") {
      return location.pathname === path || location.pathname === "/teacher";
    }
    return location.pathname.startsWith(path);
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const content = (
      <NavLink
        to={item.path}
        onClick={() => isMobile && onMobileClose?.()}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          active
            ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0 transition-transform duration-200",
          active && "scale-110"
        )} />
        {!collapsed && (
          <span className="font-medium text-sm truncate">{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            {item.badge}
          </span>
        )}
      </NavLink>
    );

    if (collapsed && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out",
        "bg-card sidebar-island",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header with Gradient Glow */}
      <div className={cn(
        "h-16 flex items-center px-4 sidebar-header-glow",
        collapsed ? "justify-center" : "justify-between",
        !collapsed && "rounded-tr-[2rem]"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <DonutLogo size={40} />
            <div>
              <h1 className="font-bold text-lg gradient-text">theDonutAI</h1>
              <p className="text-xs text-muted-foreground">Teacher Portal</p>
            </div>
          </div>
        )}
        
        {collapsed && !isMobile && (
          <DonutLogo size={40} />
        )}

        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="absolute right-3 top-4"
          >
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-muted/50",
              collapsed && "absolute -right-3 top-6 bg-card border shadow-sm"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default TeacherSidebar;