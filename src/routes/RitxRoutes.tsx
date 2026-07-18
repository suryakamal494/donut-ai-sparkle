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
const AdminStaff = lazy(() => import("@/pages/ritx/admin/Staff"));
const AdminCommunications = lazy(() => import("@/pages/ritx/admin/Communications"));
const AdminPayment = lazy(() => import("@/pages/ritx/admin/Payment"));
const AdminSubmissionForms = lazy(() => import("@/pages/ritx/admin/SubmissionForms"));
const AdminSubmissions = lazy(() => import("@/pages/ritx/admin/Submissions"));
const AdminRubrics = lazy(() => import("@/pages/ritx/admin/Rubrics"));
const AdminJudgeAssignments = lazy(() => import("@/pages/ritx/admin/JudgeAssignments"));
const AdminResults = lazy(() => import("@/pages/ritx/admin/Results"));
const AdminAnnouncements = lazy(() => import("@/pages/ritx/admin/Announcements"));

const TeamLayout = lazy(() => import("@/pages/ritx/team/Layout"));
const TeamHome = lazy(() => import("@/pages/ritx/team/Home"));
const TeamRegister = lazy(() => import("@/pages/ritx/team/Register"));
const TeamMembers = lazy(() => import("@/pages/ritx/team/Members"));
const TeamResources = lazy(() => import("@/pages/ritx/team/Resources"));
const TeamSubmission = lazy(() => import("@/pages/ritx/team/Submission"));
const TeamSubmissionStage = lazy(() => import("@/pages/ritx/team/SubmissionStage"));
const TeamResults = lazy(() => import("@/pages/ritx/team/Results"));

const StaffLayout = lazy(() => import("@/pages/ritx/staff/Layout"));
const StaffHome = lazy(() => import("@/pages/ritx/staff/Home"));
const StaffMentorResources = lazy(() => import("@/pages/ritx/staff/mentor/Resources"));
const StaffMentorSessions = lazy(() => import("@/pages/ritx/staff/mentor/Sessions"));
const StaffJudgeAssigned = lazy(() => import("@/pages/ritx/staff/judge/AssignedList"));
const StaffJudgeScoreSheet = lazy(() => import("@/pages/ritx/staff/judge/ScoreSheet"));

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
      <Route path="team/join" element={<Navigate to="/team" replace />} />

      <Route path="admin" element={<Lazy><AdminLayout /></Lazy>}>
        <Route index element={<AdminDashboard />} />
        <Route path="setup" element={<AdminSetup />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="communications" element={<AdminCommunications />} />
        <Route path="payment" element={<AdminPayment />} />
        <Route path="submission-forms" element={<AdminSubmissionForms />} />
        <Route path="submissions" element={<AdminSubmissions />} />
        <Route path="rubrics" element={<AdminRubrics />} />
        <Route path="judge-assignments" element={<AdminJudgeAssignments />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
      </Route>

      <Route path="team" element={<Lazy><TeamLayout /></Lazy>}>
        <Route index element={<TeamHome />} />
        <Route path="members" element={<TeamMembers />} />
        <Route path="resources" element={<TeamResources />} />
        <Route path="submissions" element={<TeamSubmission />} />
        <Route path="submissions/:stageId" element={<TeamSubmissionStage />} />
        <Route path="results" element={<TeamResults />} />
      </Route>

      <Route path="staff" element={<Lazy><StaffLayout /></Lazy>}>
        <Route index element={<StaffHome />} />
        <Route path="mentor/resources" element={<StaffMentorResources />} />
        <Route path="mentor/sessions" element={<StaffMentorSessions />} />
        <Route path="judge" element={<StaffJudgeAssigned />} />
        <Route path="judge/:teamId" element={<StaffJudgeScoreSheet />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
