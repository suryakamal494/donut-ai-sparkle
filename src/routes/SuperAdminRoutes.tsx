// ============================================
// SUPER ADMIN MODULE ROUTES
// Core pages eager loaded, heavy pages lazy loaded
// ============================================

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import LazyErrorBoundary from "@/components/ui/lazy-error-boundary";
import AdminLayout from "@/components/layout/AdminLayout";

// Core pages - EAGER LOADED for instant navigation
import Dashboard from "@/pages/Dashboard";
import Institutes from "@/pages/institutes/Institutes";
import CreateInstitute from "@/pages/institutes/CreateInstitute";
import InstituteDetails from "@/pages/institutes/InstituteDetails";
import InstituteCustomCourse from "@/pages/institutes/InstituteCustomCourse";
import EditInstitute from "@/pages/institutes/EditInstitute";
import InstituteTiers from "@/pages/institutes/InstituteTiers";
import EditTier from "@/pages/institutes/EditTier";
import Users from "@/pages/users/Users";
import Parameters from "@/pages/parameters/Parameters";
import Courses from "@/pages/parameters/Courses";
import Roles from "@/pages/roles/Roles";
import Questions from "@/pages/questions/Questions";
import CreateQuestion from "@/pages/questions/CreateQuestion";
import Exams from "@/pages/exams/Exams";
import CreatePreviousYearPaper from "@/pages/exams/CreatePreviousYearPaper";
import CreateGrandTest from "@/pages/exams/CreateGrandTest";
import ReviewExam from "@/pages/exams/ReviewExam";
import Content from "@/pages/content/Content";
import CreateContent from "@/pages/content/CreateContent";
import Packages from "@/pages/packages/Packages";
import CreatePackage from "@/pages/packages/CreatePackage";
import PackageEditor from "@/pages/packages/PackageEditor";
import PackageLessonComposer from "@/pages/packages/PackageLessonComposer";

// Heavy pages - LAZY LOADED
const CourseBuilder = lazy(() => import("@/pages/parameters/CourseBuilder"));
const AIQuestions = lazy(() => import("@/pages/questions/AIQuestions"));
const UploadPDF = lazy(() => import("@/pages/questions/UploadPDF"));
const ReviewQuestions = lazy(() => import("@/pages/questions/ReviewQuestions"));
const AIContentGenerator = lazy(() => import("@/pages/content/AIContentGenerator"));

// Suspense wrapper for lazy-loaded pages
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="institutes" element={<Institutes />} />
        <Route path="institutes/create" element={<CreateInstitute />} />
        <Route path="institutes/:id" element={<InstituteDetails />} />
        <Route path="institutes/:id/custom-course" element={<InstituteCustomCourse />} />
        <Route path="institutes/:id/edit" element={<EditInstitute />} />
        <Route path="institutes/tiers" element={<InstituteTiers />} />
        <Route path="institutes/tiers/edit/:tierId" element={<EditTier />} />
        <Route path="users" element={<Users />} />
        <Route path="parameters" element={<Parameters />} />
        <Route path="parameters/courses" element={<Courses />} />
        <Route path="parameters/course-builder" element={<LazyPage><CourseBuilder /></LazyPage>} />
        <Route path="roles" element={<Roles />} />
        <Route path="questions" element={<Questions />} />
        <Route path="questions/create" element={<CreateQuestion />} />
        <Route path="questions/ai" element={<LazyPage><AIQuestions /></LazyPage>} />
        <Route path="questions/upload-pdf" element={<LazyPage><UploadPDF /></LazyPage>} />
        <Route path="questions/review" element={<LazyPage><ReviewQuestions /></LazyPage>} />
        <Route path="exams" element={<Exams />} />
        <Route path="exams/previous-year/create" element={<CreatePreviousYearPaper />} />
        <Route path="exams/grand-test/create" element={<CreateGrandTest />} />
        <Route path="exams/review/:examId" element={<ReviewExam />} />
        <Route path="content" element={<Content />} />
        <Route path="content/upload" element={<CreateContent />} />
        <Route path="content/create" element={<CreateContent />} />
        <Route path="content/ai-generate" element={<LazyPage><AIContentGenerator /></LazyPage>} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/new" element={<CreatePackage />} />
        <Route path="packages/:id" element={<PackageEditor />} />
        <Route path="packages/:id/lesson/:lpId" element={<PackageLessonComposer />} />
      </Route>
    </Routes>
  );
}
