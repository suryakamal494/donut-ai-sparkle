import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import TeacherBottomNav from "./TeacherBottomNav";
import { cn } from "@/lib/utils";
import { Bell, Search, User, ChevronDown, Menu, KeyRound, LogOut, Pencil, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { currentTeacher } from "@/data/teacherData";
import { Badge } from "@/components/ui/badge";
import { ProfileEditDialog, PasswordResetDialog } from "@/components/teacher";
import { toast } from "sonner";
import { useTeacherNotifications } from "@/hooks/useTeacherNotifications";
import { TeacherNotificationCard } from "@/components/teacher/notifications";
import CopilotLauncher from "@/components/teacher/routine-pilot/CopilotLauncher";
import { CopilotProvider } from "@/components/teacher/routine-pilot/CopilotContext";

const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  
  // Get notifications
  const { notifications, unreadCount, markAsRead } = useTeacherNotifications();

  const handleLogout = () => {
    // Clear any local state/tokens (in real app, call supabase.auth.signOut())
    toast.success("Signed out successfully");
    navigate("/login");
  };

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse on the Lesson Plans page so the chapter/lesson panes get
  // more room. Re-openable manually via the sidebar toggle.
  useEffect(() => {
    if (location.pathname.startsWith("/teacher/lesson-plans")) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <CopilotProvider>
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
        "hidden md:block",
        isMobile && mobileMenuOpen && "fixed inset-y-0 left-0 z-50 block"
      )}>
        <TeacherSidebar 
          collapsed={isMobile ? false : sidebarCollapsed} 
          onToggle={() => {
            if (isMobile) {
              setMobileMenuOpen(false);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          isMobile={isMobile && mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? "ml-0 pb-20" : (sidebarCollapsed ? "ml-20" : "ml-72")
        )}
      >
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between gap-2 px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
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
            
            {/* Greeting - mobile */}
            {isMobile && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Hi, {currentTeacher.name.split(' ')[1]}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTeacher.subjects.join(', ')}</p>
              </div>
            )}
            
            {/* Search - desktop */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search lessons, classes..."
                className="w-48 lg:w-72 h-10 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted/50">
              <Search className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
                  {notifications.slice(0, 5).map((notification) => (
                    <TeacherNotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      compact
                    />
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="border-t border-border p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-sm h-9"
                    onClick={() => navigate("/teacher/notifications")}
                  >
                    View All Notifications
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 md:gap-3 hover:bg-muted/50 pr-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[120px] lg:max-w-[180px]">
                      {currentTeacher.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {currentTeacher.subjects.map((subject) => (
                        <Badge 
                          key={subject} 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                <DropdownMenuItem 
                  onClick={() => setEditProfileOpen(true)}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setResetPasswordOpen(true)}
                  className="cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-4 md:p-6 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && <TeacherBottomNav />}

      {/* Floating Copilot launcher - visible on every teacher page */}
      <CopilotLauncher />

      {/* Profile Edit Dialog */}
      <ProfileEditDialog 
        open={editProfileOpen} 
        onOpenChange={setEditProfileOpen} 
      />

      {/* Password Reset Dialog */}
      <PasswordResetDialog 
        open={resetPasswordOpen} 
        onOpenChange={setResetPasswordOpen} 
      />
    </div>
    </CopilotProvider>
  );
};

export default TeacherLayout;
