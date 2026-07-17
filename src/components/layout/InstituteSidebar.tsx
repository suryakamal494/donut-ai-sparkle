import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  FileQuestion,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  Layers,
  Wrench,
  Eye,
  Library,
  UserCheck,
  Shield,
  BookOpenCheck,
  TrendingUp,
  Clock,
} from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Package as PackageIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DonutLogo from "@/components/shared/DonutLogo";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InstituteSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  subItems?: { title: string; icon: React.ElementType; href: string }[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/institute/dashboard" },
  { title: "Batches", icon: BookOpen, href: "/institute/batches" },
  { title: "Teachers", icon: Users, href: "/institute/teachers" },
  { title: "Students", icon: GraduationCap, href: "/institute/students" },
  { 
    title: "Timetable", 
    icon: Calendar, 
    href: "/institute/timetable",
    subItems: [
      { title: "Setup", icon: Settings, href: "/institute/timetable/setup" },
      { title: "Workspace", icon: Wrench, href: "/institute/timetable" },
      { title: "View Timetable", icon: Eye, href: "/institute/timetable/view" },
      { title: "Substitution", icon: UserCheck, href: "/institute/timetable/substitution" },
    ]
  },
  { 
    title: "Syllabus Tracker", 
    icon: BookOpenCheck, 
    href: "/institute/academic-schedule",
    subItems: [
      { title: "Setup", icon: Settings, href: "/institute/academic-schedule/setup" },
      { title: "Weekly Plans", icon: Calendar, href: "/institute/academic-schedule/plans" },
      { title: "Batch Progress", icon: TrendingUp, href: "/institute/academic-schedule/batches" },
    ]
  },
  { title: "Question Bank", icon: FileQuestion, href: "/institute/questions" },
  { title: "Content Library", icon: Library, href: "/institute/content" },
  { title: "Packages", icon: PackageIcon, href: "/institute/packages" },
  { title: "Exams", icon: ClipboardList, href: "/institute/exams" },
  {
    title: "Reports",
    icon: TrendingUp,
    href: "/institute/reports",
    subItems: [
      { title: "Batch Reports", icon: Layers, href: "/institute/reports/batches" },
      { title: "Exam Reports", icon: ClipboardList, href: "/institute/reports/exams" },
      { title: "Student Reports", icon: GraduationCap, href: "/institute/reports/students" },
    ]
  },
  { 
    title: "Exams New", 
    icon: ClipboardList, 
    href: "/institute/exams-new",
    badge: "New",
    subItems: [
      { title: "Exams", icon: ClipboardList, href: "/institute/exams-new" },
      { title: "Exam Patterns", icon: Library, href: "/institute/exams-new/patterns" },
    ]
  },
  { title: "Master Data", icon: Database, href: "/institute/master-data" },
  { title: "Roles & Access", icon: Shield, href: "/institute/roles" },
  { title: "Communications", icon: MessageCircle, href: "/institute/communications" },
  { title: "Settings", icon: Settings, href: "/institute/settings" },
];

const InstituteSidebar = ({ collapsed, onToggle, isMobile, onMobileClose }: InstituteSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Track which submenus are open
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(() => {
    const open: string[] = [];
    if (currentPath.startsWith('/institute/timetable')) open.push('Timetable');
    if (currentPath.startsWith('/institute/reports')) open.push('Reports');
    if (currentPath.startsWith('/institute/academic-schedule')) open.push('Syllabus Tracker');
    if (currentPath.startsWith('/institute/exams-new')) open.push('Exams New');
    return open;
  });

  const isActive = (href: string) => {
    if (href === "/institute/dashboard") {
      return currentPath === href;
    }
    if (href === "/institute/timetable") {
      return currentPath === href || currentPath === "/institute/timetable/setup" || currentPath === "/institute/timetable/upload";
    }
    if (href === "/institute/timetable/view") {
      return currentPath === href;
    }
    // Special handling for /institute/exams to not match /institute/exams-new
    if (href === "/institute/exams") {
      return currentPath === href || (currentPath.startsWith("/institute/exams/") && !currentPath.startsWith("/institute/exams-new"));
    }
    return currentPath.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => isActive(sub.href));
    }
    return isActive(item.href);
  };

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openSubmenus.includes(item.title);
    const parentActive = isParentActive(item);

    if (hasSubItems) {
      if (collapsed) {
        return (
          <Tooltip key={item.href} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate(item.subItems![0].href)}
                className={cn(
                  "w-full h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                  parentActive
                    ? "gradient-button shadow-md"
                    : "hover:bg-muted/50 text-foreground/70 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", parentActive ? "text-white" : "")} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <div className="space-y-1">
                <p className="font-semibold">{item.title}</p>
                {item.subItems!.map(sub => (
                  <button
                    key={sub.href}
                    onClick={() => navigate(sub.href)}
                    className={cn(
                      "block w-full text-left px-2 py-1 rounded text-sm",
                      isActive(sub.href) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <Collapsible
          key={item.href}
          open={isOpen}
          onOpenChange={() => toggleSubmenu(item.title)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                parentActive && !isOpen
                  ? "gradient-button shadow-md"
                  : "hover:bg-muted/50 text-foreground/70 hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", parentActive && !isOpen ? "text-white" : "")} />
              <span className={cn(
                "font-medium text-sm whitespace-nowrap flex-1 text-left",
                parentActive && !isOpen ? "text-white" : ""
              )}>
                {item.title}
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180",
                parentActive && !isOpen ? "text-white" : ""
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 mt-1 space-y-1">
            {item.subItems!.map(sub => {
              const SubIcon = sub.icon;
              const subActive = isActive(sub.href);
              return (
                <button
                  key={sub.href}
                  onClick={() => navigate(sub.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    subActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/50 text-foreground/70 hover:text-foreground"
                  )}
                >
                  <SubIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{sub.title}</span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const active = isActive(item.href);

    const linkContent = (
      <button
        onClick={() => navigate(item.href)}
        className={cn(
          "w-full flex items-center rounded-xl transition-all duration-200 group",
          collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5",
          active
            ? "gradient-button shadow-md"
            : "hover:bg-muted/50 text-foreground/70 hover:text-foreground"
        )}
      >
        <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-white" : "")} />
        {!collapsed && (
          <span className={cn(
            "font-medium text-sm whitespace-nowrap",
            active ? "text-white" : ""
          )}>
            {item.title}
          </span>
        )}
        {!collapsed && item.badge && (
          <span className={cn(
            "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
            active 
              ? "bg-white/20 text-white" 
              : "bg-primary/10 text-primary"
          )}>
            {item.badge}
          </span>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border/50 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo Section */}
      <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-border/50">
        <button 
          onClick={() => navigate("/")}
          className={cn(
            "flex items-center gap-3 transition-all duration-300",
            collapsed && "justify-center"
          )}
        >
          <DonutLogo size={36} />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg md:text-xl font-bold gradient-text whitespace-nowrap">theDonutAI</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Institute Panel</p>
            </div>
          )}
        </button>
        
        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
              collapsed && "absolute -right-4 top-6 bg-card border border-border shadow-md"
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scroll-smooth">
        <div className="space-y-1 pb-4">
          {navItems.map(item => renderNavItem(item))}
        </div>
      </nav>
    </aside>
  );
};

export default InstituteSidebar;