// ============================================
// TEACHER MODULE ROUTES
// Core pages eager loaded, heavy pages lazy loaded
// ============================================

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import LazyErrorBoundary from "@/components/ui/lazy-error-boundary";
import TeacherLayout from "@/components/layout/TeacherLayout";

// Core pages - EAGER LOADED for instant navigation
import TeacherDashboard from "@/pages/teacher/Dashboard";
import TeacherSchedule from "@/pages/teacher/Schedule";
import TeacherLessonPlans from "@/pages/teacher/TeacherLessonPlans";
import TeacherAcademicProgress from "@/pages/teacher/AcademicProgress";
import TeacherExams from "@/pages/teacher/Exams";
import TeacherHomework from "@/pages/teacher/Homework";
import TeacherContent from "@/pages/teacher/Content";
import TeacherReference from "@/pages/teacher/Reference";
import TeacherProfile from "@/pages/teacher/Profile";
import TeacherNotifications from "@/pages/teacher/Notifications";
import RoutinePilot from "@/pages/teacher/RoutinePilot";

// Heavy pages - LAZY LOADED
const LessonPlanCanvas = lazy(() => import("@/pages/teacher/LessonPlanCanvas"));
const TeacherPackageLessonView = lazy(() => import("@/pages/teacher/TeacherPackageLessonView"));
const TeacherLessonPresent = lazy(() => import("@/pages/teacher/TeacherLessonPresent"));
const CreateTeacherExam = lazy(() => import("@/pages/teacher/CreateExam"));
const TeacherExamResults = lazy(() => import("@/pages/teacher/ExamResults"));
const EditTeacherExam = lazy(() => import("@/pages/teacher/EditExam"));
const TeacherCreateContent = lazy(() => import("@/pages/teacher/content/CreateContent"));
const TeacherAIContentGenerator = lazy(() => import("@/pages/teacher/content/AIContentGenerator"));
const TeacherEditContent = lazy(() => import("@/pages/teacher/content/EditContent"));
const TeacherReports = lazy(() => import("@/pages/teacher/Reports"));
const TeacherBatchReport = lazy(() => import("@/pages/teacher/BatchReport"));
const TeacherChapterReport = lazy(() => import("@/pages/teacher/ChapterReport"));
const TeacherInstituteTestDetail = lazy(() => import("@/pages/teacher/InstituteTestDetail"));
const TeacherStudentReport = lazy(() => import("@/pages/teacher/StudentReport"));
const ChapterPracticeReview = lazy(() => import("@/pages/teacher/ChapterPracticeReview"));
const PracticeSessionDetail = lazy(() => import("@/pages/teacher/PracticeSessionDetail"));

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

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="lesson-plans" element={<TeacherLessonPlans />} />
        <Route path="lesson-plans/new" element={<LazyPage><LessonPlanCanvas /></LazyPage>} />
        <Route
          path="lesson-plans/library/pkg/:packageId/lesson/:lpId"
          element={<LazyPage><TeacherPackageLessonView /></LazyPage>}
        />
        <Route
          path="lesson-plans/library/pkg/:packageId/present/:lpId"
          element={<LazyPage><TeacherLessonPresent /></LazyPage>}
        />
        <Route path="lesson-plans/:planId" element={<LazyPage><LessonPlanCanvas /></LazyPage>} />
        <Route path="academic-progress" element={<TeacherAcademicProgress />} />
        <Route path="exams" element={<TeacherExams />} />
        <Route path="exams/create" element={<LazyPage><CreateTeacherExam /></LazyPage>} />
        <Route path="exams/:examId/edit" element={<LazyPage><EditTeacherExam /></LazyPage>} />
        
        <Route path="homework" element={<TeacherHomework />} />
        <Route path="reports" element={<LazyPage><TeacherReports /></LazyPage>} />
        <Route path="reports/:batchId" element={<LazyPage><TeacherBatchReport /></LazyPage>} />
        <Route path="reports/:batchId/chapters/:chapterId" element={<LazyPage><TeacherChapterReport /></LazyPage>} />
        <Route path="reports/:batchId/chapters/:chapterId/practice" element={<LazyPage><ChapterPracticeReview /></LazyPage>} />
        <Route path="reports/:batchId/chapters/:chapterId/practice/:sessionId" element={<LazyPage><PracticeSessionDetail /></LazyPage>} />
        <Route path="reports/:batchId/exams/:examId" element={<LazyPage><TeacherExamResults /></LazyPage>} />
        <Route path="reports/:batchId/institute-test/:testId" element={<LazyPage><TeacherInstituteTestDetail /></LazyPage>} />
        <Route path="reports/:batchId/students/:studentId" element={<LazyPage><TeacherStudentReport /></LazyPage>} />
        <Route path="content" element={<TeacherContent />} />
        <Route path="content/create" element={<LazyPage><TeacherCreateContent /></LazyPage>} />
        <Route path="content/ai-generate" element={<LazyPage><TeacherAIContentGenerator /></LazyPage>} />
        <Route path="content/edit/:id" element={<LazyPage><TeacherEditContent /></LazyPage>} />
        <Route path="reference" element={<TeacherReference />} />
        <Route path="routine-pilot" element={<RoutinePilot />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="notifications" element={<TeacherNotifications />} />
      </Route>
    </Routes>
  );
}
