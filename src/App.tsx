import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import LazyErrorBoundary from "@/components/ui/lazy-error-boundary";

// ============================================
// LANDING & ERROR - Always eager (tiny, entry points)
// ============================================
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// ============================================
// MODULE ROUTES - LAZY LOADED
// Only the active module loads, others stay inactive
// ============================================
const SuperAdminRoutes = lazy(() => import("./routes/SuperAdminRoutes"));
const InstituteRoutes = lazy(() => import("./routes/InstituteRoutes"));
const TeacherRoutes = lazy(() => import("./routes/TeacherRoutes"));
const StudentRoutes = lazy(() => import("./routes/StudentRoutes"));
const DocsRoutes = lazy(() => import("./routes/DocsRoutes"));
const RitxRoutes = lazy(() => import("./routes/RitxRoutes"));

const queryClient = new QueryClient();

// Preload critical modules after initial render
function preloadModules() {
  // Preload Institute module (most commonly accessed)
  import("./routes/InstituteRoutes").catch(() => {});
}

// Module boundary wrapper with error handling and loading state
function ModuleBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<PageSkeleton variant="dashboard" />}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Root component with preloading
function AppContent() {
  useEffect(() => {
    // Preload after 1.5s to not block initial render
    const timer = setTimeout(preloadModules, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing Page - Portal Selection */}
        <Route path="/" element={<Landing />} />
        
        {/* Module Boundaries - Only one loads at a time */}
        <Route path="/superadmin/*" element={
          <ModuleBoundary><SuperAdminRoutes /></ModuleBoundary>
        } />
        <Route path="/institute/*" element={
          <ModuleBoundary><InstituteRoutes /></ModuleBoundary>
        } />
        <Route path="/teacher/*" element={
          <ModuleBoundary><TeacherRoutes /></ModuleBoundary>
        } />
        <Route path="/student/*" element={
          <ModuleBoundary><StudentRoutes /></ModuleBoundary>
        } />
        <Route path="/docs/*" element={
          <ModuleBoundary><DocsRoutes /></ModuleBoundary>
        } />
        <Route path="/ritx/*" element={
          <ModuleBoundary><RitxRoutes /></ModuleBoundary>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
