import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const AdminLayout = () => {
  const location = useLocation();
  // Auto-collapse the global nav whenever we are inside a specific package
  // (editor or lesson composer) so the 3-pane layout gets enough room.
  const inPackageDetail = /^\/superadmin\/packages\/[^/]+/.test(location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(inPackageDetail);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(inPackageDetail);
  }, [inPackageDetail]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      
      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <Sidebar 
            collapsed={false} 
            onToggle={() => setMobileOpen(false)}
            isMobile
            onMobileClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
      
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          // Desktop margins based on sidebar state
          "md:ml-16",
          !sidebarCollapsed && "md:ml-64"
        )}
      >
        <Header onMobileMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
