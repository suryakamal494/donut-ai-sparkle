// ============================================
// RITX MODULE ROUTES (Young Innovators Challenge)
// Phase 0 — Landing, Login, Admin setup, Team registration
// ============================================

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import LazyErrorBoundary from "@/components/ui/lazy-error-boundary";

const Landing = lazy(() => import("@/pages/ritx/Landing"));
const Login = lazy(() => import("@/pages/ritx/Login"));

const AdminLayout = lazy(() => import("@/pages/ritx/admin/Layout"));
const AdminDashboard = lazy(() => import("@/pages/ritx/admin/Dashboard"));
const AdminSetup = lazy(() => import("@/pages/ritx/admin/CompetitionSetup"));
const AdminRegistrations = lazy(() => import("@/pages/ritx/admin/Registrations"));

const TeamLayout = lazy(() => import("@/pages/ritx/team/Layout"));
const TeamHome = lazy(() => import("@/pages/ritx/team/Home"));
const TeamRegister = lazy(() => import("@/pages/ritx/team/Register"));
const TeamMembers = lazy(() => import("@/pages/ritx/team/Members"));

const StaffLayout = lazy(() => import("@/pages/ritx/staff/Layout"));
const StaffHome = lazy(() => import("@/pages/ritx/staff/Home"));

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<PageSkeleton variant="default" />}>{children}</Suspense>
    </LazyErrorBoundary>
  );
}

export default function RitxRoutes() {
  return (
    <Routes>
      <Route index element={<Lazy><Landing /></Lazy>} />
      <Route path="login" element={<Lazy><Login /></Lazy>} />
      <Route path="team/register" element={<Lazy><TeamRegister /></Lazy>} />

      <Route path="admin" element={<Lazy><AdminLayout /></Lazy>}>
        <Route index element={<AdminDashboard />} />
        <Route path="setup" element={<AdminSetup />} />
        <Route path="registrations" element={<AdminRegistrations />} />
      </Route>

      <Route path="team" element={<Lazy><TeamLayout /></Lazy>}>
        <Route index element={<TeamHome />} />
        <Route path="members" element={<TeamMembers />} />
        <Route path="submissions" element={<Navigate to="/ritx/team" replace />} />
      </Route>

      <Route path="staff" element={<Lazy><StaffLayout /></Lazy>}>
        <Route index element={<StaffHome />} />
        <Route path="judge" element={<StaffHome />} />
        <Route path="mentor" element={<StaffHome />} />
      </Route>

      <Route path="*" element={<Navigate to="/ritx" replace />} />
    </Routes>
  );
}
