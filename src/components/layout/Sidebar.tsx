import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Shield,
  FileQuestion,
  ClipboardList,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Crown,
  PanelLeftClose,
  PanelLeft,
  GraduationCap,
  FolderTree,
  Package as PackageIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DonutLogo from "@/components/shared/DonutLogo";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  children?: { title: string; href: string; icon?: React.ElementType }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/superadmin/dashboard",
  },
  {
    title: "Institutes",
    icon: Building2,
    children: [
      { title: "All Institutes", href: "/superadmin/institutes", icon: Building2 },
      { title: "Tier Management", href: "/superadmin/institutes/tiers", icon: Crown },
    ],
  },
  {
    title: "Users",
    icon: Users,
    href: "/superadmin/users",
  },
  {
    title: "Master Data",
    icon: Settings,
    children: [
      { title: "Curriculum", href: "/superadmin/parameters", icon: FolderTree },
      { title: "Courses", href: "/superadmin/parameters/courses", icon: GraduationCap },
    ],
  },
  {
    title: "Packages",
    icon: PackageIcon,
    href: "/superadmin/packages",
  },
  {
    title: "Roles & Access",
    icon: Shield,
    href: "/superadmin/roles",
  },
  {
    title: "Question Bank",
    icon: FileQuestion,
    href: "/superadmin/questions",
  },
  {
    title: "Exams",
    icon: ClipboardList,
    href: "/superadmin/exams",
  },
  {
    title: "Content Library",
    icon: FolderOpen,
    href: "/superadmin/content",
  },
];

const Sidebar = ({ collapsed, onToggle, isMobile, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(["Institutes", "Master Data"]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActiveRoute = (href: string) => location.pathname === href;
  const isActiveParent = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname.startsWith(child.href));

  const handleNavClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 ease-in-out",
        "border-r",
        isMobile ? "w-full" : (isCollapsed ? "fixed left-0 top-0 z-40 w-16" : "fixed left-0 top-0 z-40 w-64")
      )}
      style={{
        background: "linear-gradient(180deg, hsl(30 40% 96%) 0%, hsl(30 35% 94%) 100%)",
        borderColor: "hsl(30 25% 88%)",
      }}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: "hsl(30 25% 88%)" }}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <DonutLogo size={36} />
            <span className="font-bold text-lg text-primary">theDonutAI</span>
          </div>
        )}
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto"
          >
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "text-muted-foreground hover:text-primary hover:bg-primary/10",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.title);
          const isActive = item.href ? isActiveRoute(item.href) : isActiveParent(item.children);

          if (item.href) {
            return (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
                  "text-foreground/90 font-semibold hover:bg-pink-100/60",
                  isActive && "text-white shadow-md",
                  isCollapsed && "justify-center px-0"
                )}
                style={isActive ? {
                  background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)"
                } : undefined}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            );
          }

          return (
            <Collapsible
              key={item.title}
              open={!isCollapsed && isOpen}
              onOpenChange={() => !isCollapsed && toggleMenu(item.title)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
                    "text-foreground/90 font-semibold hover:bg-pink-100/60",
                    isActive && "text-primary",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              {!isCollapsed && (
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = isActiveRoute(child.href);
                    return (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-sm",
                          "text-foreground/80 font-medium hover:bg-pink-100/60",
                          isChildActive && "text-white shadow-md"
                        )}
                        style={isChildActive ? {
                          background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
                          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)"
                        } : undefined}
                      >
                        {ChildIcon && <ChildIcon className={cn("w-4 h-4", isChildActive && "text-white")} />}
                        <span>{child.title}</span>
                      </NavLink>
                    );
                  })}
                </CollapsibleContent>
              )}
            </Collapsible>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;