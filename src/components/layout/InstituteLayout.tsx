import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import InstituteSidebar from "./InstituteSidebar";
import { cn } from "@/lib/utils";
import { Bell, Search, User, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

const InstituteLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  // Auto-collapse the global nav whenever we are inside a specific package
  // detail page, mirroring the SuperAdmin layout behaviour.
  const inPackageDetail = /^\/institute\/packages\/[^/]+/.test(location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(inPackageDetail);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on smaller screens (tablets)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setSidebarCollapsed(inPackageDetail);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inPackageDetail]);

  // Collapse/expand when navigating into or out of a package detail page.
  useEffect(() => {
    setSidebarCollapsed(inPackageDetail);
  }, [inPackageDetail]);

  // Close mobile menu when route changes or screen becomes larger
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={cn(
        "md:block",
        isMobile && !mobileMenuOpen && "hidden",
        isMobile && mobileMenuOpen && "fixed inset-y-0 left-0 z-50"
      )}>
        <InstituteSidebar 
          collapsed={isMobile ? false : sidebarCollapsed} 
          onToggle={() => {
            if (isMobile) {
              setMobileMenuOpen(false);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          isMobile={isMobile}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : (sidebarCollapsed ? "ml-20" : "ml-72")
        )}
      >
        {/* Premium Header */}
        <header className="h-14 md:h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 md:w-64 lg:w-72 h-9 md:h-10 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile search button */}
            <Button variant="ghost" size="icon" className="sm:hidden hover:bg-muted/50">
              <Search className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 md:gap-3 hover:bg-muted/50 pr-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl gradient-button flex items-center justify-center">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[120px] lg:max-w-[180px]">Delhi Public School</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="p-4 md:p-6 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstituteLayout;
