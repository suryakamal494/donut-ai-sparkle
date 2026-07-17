import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import LazyErrorBoundary from "@/components/ui/lazy-error-boundary";

import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// Only RiTX is mounted. Other portal modules remain on disk but are not routed.
const RitxRoutes = lazy(() => import("./routes/RitxRoutes"));

const queryClient = new QueryClient();

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

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* RiTX is the entire app for now. `/` renders the RiTX Landing. */}
        <Route path="/*" element={
          <ModuleBoundary><RitxRoutes /></ModuleBoundary>
        } />
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
