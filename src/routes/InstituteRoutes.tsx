// ============================================
// INSTITUTE MODULE ROUTES
// Minimal eager loads, everything else lazy
// ============================================

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import LazyErrorBoundary from "@/components/ui/lazy-error-boundary";
import InstituteLayout from "@/components/layout/InstituteLayout";

// ============================================
// ONLY Dashboard eager - everything else lazy
// ============================================
import InstituteDashboard from "@/pages/institute/Dashboard";

// ============================================
// LAZY LOADED PAGES - Load on demand
// ============================================

// Batches
const InstituteBatches = lazy(() => import("@/pages/institute/batches/Batches"));
const CreateBatch = lazy(() => import("@/pages/institute/batches/CreateBatch"));
const BatchDashboard = lazy(() => import("@/pages/institute/batches/BatchDashboard"));
const BatchTimetable = lazy(() => import("@/pages/institute/batches/BatchTimetable"));

// Teachers
const InstituteTeachers = lazy(() => import("@/pages/institute/teachers/Teachers"));
const CreateTeacher = lazy(() => import("@/pages/institute/teachers/CreateTeacher"));
const BulkUploadTeachers = lazy(() => import("@/pages/institute/teachers/BulkUploadTeachers"));

// Students
const InstituteStudents = lazy(() => import("@/pages/institute/students/Students"));
const AddStudent = lazy(() => import("@/pages/institute/students/AddStudent"));

// Timetable
const InstituteTimetable = lazy(() => import("@/pages/institute/timetable/Timetable"));
const InstituteTimetableSetup = lazy(() => import("@/pages/institute/timetable/TimetableSetup"));
const InstituteTimetableUpload = lazy(() => import("@/pages/institute/timetable/TimetableUpload"));
const InstituteViewTimetable = lazy(() => import("@/pages/institute/timetable/ViewTimetable"));
const InstituteSubstitution = lazy(() => import("@/pages/institute/timetable/Substitution"));
// ExamSchedule moved to TimetableSetup tab - keeping route for backwards compatibility

// Questions
const InstituteQuestions = lazy(() => import("@/pages/institute/questions/Questions"));
const InstituteAIQuestions = lazy(() => import("@/pages/institute/questions/AIQuestions"));
const InstituteUploadPDF = lazy(() => import("@/pages/institute/questions/UploadPDF"));
const InstituteCreateQuestion = lazy(() => import("@/pages/institute/questions/CreateQuestion"));

// Content
const InstituteContent = lazy(() => import("@/pages/institute/content/Content"));
const InstituteCreateContent = lazy(() => import("@/pages/institute/content/CreateContent"));
const InstituteAIContentGenerator = lazy(() => import("@/pages/institute/content/AIContentGenerator"));

// Packages (institute view)
const InstitutePackagesPage = lazy(() => import("@/pages/institute/packages/InstitutePackages"));
const InstitutePackageDetailPage = lazy(() => import("@/pages/institute/packages/InstitutePackageDetail"));

// Exams
const InstituteExams = lazy(() => import("@/pages/institute/exams/Exams"));
const InstituteCreateExam = lazy(() => import("@/pages/institute/exams/CreateExam"));
const InstituteUploadExam = lazy(() => import("@/pages/institute/exams/UploadExam"));
const InstituteReviewExam = lazy(() => import("@/pages/institute/exams/ReviewExam"));
const InstitutePreviousYearPapers = lazy(() => import("@/pages/institute/exams/PreviousYearPapers"));

// Exams New Module
const ExamsNew = lazy(() => import("@/pages/institute/exams-new/ExamsNew"));
const ExamsNewPatterns = lazy(() => import("@/pages/institute/exams-new/Patterns"));
const PatternBuilder = lazy(() => import("@/pages/institute/exams-new/PatternBuilder"));
const PatternView = lazy(() => import("@/pages/institute/exams-new/PatternView"));
const CreateExamNew = lazy(() => import("@/pages/institute/exams-new/CreateExamNew"));
const InstitutePYPView = lazy(() => import("@/pages/institute/exams/PYPView"));

// Master Data & Roles
const InstituteMasterData = lazy(() => import("@/pages/institute/masterdata/MasterData"));
const InstituteRoles = lazy(() => import("@/pages/institute/roles/Roles"));

// Reports
const ReportsLanding = lazy(() => import("@/pages/institute/reports/ReportsLanding"));
const BatchReports = lazy(() => import("@/pages/institute/reports/BatchReports"));
const BatchReportDetail = lazy(() => import("@/pages/institute/reports/BatchReportDetail"));
const ExamReports = lazy(() => import("@/pages/institute/reports/ExamReports"));
const ExamResultDetail = lazy(() => import("@/pages/institute/reports/ExamResultDetail"));
const GrandTestResults = lazy(() => import("@/pages/institute/reports/GrandTestResults"));
const SubjectDetail = lazy(() => import("@/pages/institute/reports/SubjectDetail"));
const StudentReports = lazy(() => import("@/pages/institute/reports/StudentReports"));
const StudentProfile360 = lazy(() => import("@/pages/institute/reports/StudentProfile360"));

// Academic Schedule - Consolidated
const AcademicScheduleSetup = lazy(() => import("@/pages/institute/academic-schedule/Setup"));
const AcademicPlannerHub = lazy(() => import("@/pages/institute/academic-schedule/AcademicPlannerHub"));
const AcademicPlannerWorkspace = lazy(() => import("@/pages/institute/academic-schedule/AcademicPlannerWorkspace"));
const BatchHub = lazy(() => import("@/pages/institute/academic-schedule/BatchHub"));
const ConsolidatedBatchView = lazy(() => import("@/pages/institute/academic-schedule/ConsolidatedBatchView"));
const AcademicScheduleTeachingView = lazy(() => import("@/pages/institute/academic-schedule/TeachingView"));
const AcademicScheduleYearOverview = lazy(() => import("@/pages/institute/academic-schedule/YearOverview"));
const AcademicScheduleChapterDetail = lazy(() => import("@/pages/institute/academic-schedule/ChapterDetail"));

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

export default function InstituteRoutes() {
  return (
    <Routes>
      <Route element={<InstituteLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboard - Eager loaded */}
        <Route path="dashboard" element={<InstituteDashboard />} />
        
        {/* Batches */}
        <Route path="batches" element={<LazyPage><InstituteBatches /></LazyPage>} />
        <Route path="batches/create" element={<LazyPage><CreateBatch /></LazyPage>} />
        <Route path="batches/:batchId" element={<LazyPage><BatchDashboard /></LazyPage>} />
        <Route path="batches/:batchId/timetable" element={<LazyPage><BatchTimetable /></LazyPage>} />
        
        {/* Teachers */}
        <Route path="teachers" element={<LazyPage><InstituteTeachers /></LazyPage>} />
        <Route path="teachers/create" element={<LazyPage><CreateTeacher /></LazyPage>} />
        <Route path="teachers/:teacherId/edit" element={<LazyPage><CreateTeacher /></LazyPage>} />
        <Route path="teachers/bulk-upload" element={<LazyPage><BulkUploadTeachers /></LazyPage>} />
        
        {/* Students */}
        <Route path="students" element={<LazyPage><InstituteStudents /></LazyPage>} />
        <Route path="students/add" element={<LazyPage><AddStudent /></LazyPage>} />
        <Route path="students/:studentId/edit" element={<LazyPage><AddStudent /></LazyPage>} />
        
        {/* Timetable */}
        <Route path="timetable" element={<LazyPage><InstituteTimetable /></LazyPage>} />
        <Route path="timetable/setup" element={<LazyPage><InstituteTimetableSetup /></LazyPage>} />
        <Route path="timetable/upload" element={<LazyPage><InstituteTimetableUpload /></LazyPage>} />
        <Route path="timetable/view" element={<LazyPage><InstituteViewTimetable /></LazyPage>} />
        <Route path="timetable/substitution" element={<LazyPage><InstituteSubstitution /></LazyPage>} />
        <Route path="timetable/exam-schedule" element={<Navigate to="/institute/timetable/setup" replace />} />
        
        {/* Questions */}
        <Route path="questions" element={<LazyPage><InstituteQuestions /></LazyPage>} />
        <Route path="questions/ai" element={<LazyPage><InstituteAIQuestions /></LazyPage>} />
        <Route path="questions/upload-pdf" element={<LazyPage><InstituteUploadPDF /></LazyPage>} />
        <Route path="questions/create" element={<LazyPage><InstituteCreateQuestion /></LazyPage>} />
        <Route path="questions/edit/:questionId" element={<LazyPage><InstituteCreateQuestion /></LazyPage>} />
        
        {/* Content */}
        <Route path="content" element={<LazyPage><InstituteContent /></LazyPage>} />
        <Route path="content/create" element={<LazyPage><InstituteCreateContent /></LazyPage>} />
        <Route path="content/edit/:contentId" element={<LazyPage><InstituteCreateContent /></LazyPage>} />
        <Route path="content/ai-generate" element={<LazyPage><InstituteAIContentGenerator /></LazyPage>} />

        {/* Packages (institute-side view) */}
        <Route path="packages" element={<LazyPage><InstitutePackagesPage /></LazyPage>} />
        <Route path="packages/:packageId" element={<LazyPage><InstitutePackageDetailPage /></LazyPage>} />
        
        {/* Exams */}
        <Route path="exams" element={<LazyPage><InstituteExams /></LazyPage>} />
        <Route path="exams/create" element={<LazyPage><InstituteCreateExam /></LazyPage>} />
        <Route path="exams/upload" element={<LazyPage><InstituteUploadExam /></LazyPage>} />
        <Route path="exams/review/:examId" element={<LazyPage><InstituteReviewExam /></LazyPage>} />
        <Route path="exams/previous-year-papers" element={<LazyPage><InstitutePreviousYearPapers /></LazyPage>} />
        <Route path="exams/pyp-view/:paperId" element={<LazyPage><InstitutePYPView /></LazyPage>} />
        
        {/* Exams New Module */}
        <Route path="exams-new" element={<LazyPage><ExamsNew /></LazyPage>} />
        <Route path="exams-new/create" element={<LazyPage><CreateExamNew /></LazyPage>} />
        <Route path="exams-new/patterns" element={<LazyPage><ExamsNewPatterns /></LazyPage>} />
        <Route path="exams-new/patterns/create" element={<LazyPage><PatternBuilder /></LazyPage>} />
        <Route path="exams-new/patterns/:patternId" element={<LazyPage><PatternView /></LazyPage>} />
        <Route path="exams-new/patterns/:patternId/edit" element={<LazyPage><PatternBuilder /></LazyPage>} />
        
        {/* Master Data & Roles */}
        <Route path="master-data" element={<LazyPage><InstituteMasterData /></LazyPage>} />
        <Route path="roles" element={<LazyPage><InstituteRoles /></LazyPage>} />
        
        {/* Reports */}
        <Route path="reports" element={<LazyPage><ReportsLanding /></LazyPage>} />
        <Route path="reports/batches" element={<LazyPage><BatchReports /></LazyPage>} />
        <Route path="reports/batches/:batchId" element={<LazyPage><BatchReportDetail /></LazyPage>} />
        <Route path="reports/batches/:batchId/subjects/:subjectId" element={<LazyPage><SubjectDetail /></LazyPage>} />
        <Route path="reports/exams" element={<LazyPage><ExamReports /></LazyPage>} />
        <Route path="reports/exams/:examId" element={<LazyPage><ExamResultDetail /></LazyPage>} />
        <Route path="reports/exams/:examId/grand-test" element={<LazyPage><GrandTestResults /></LazyPage>} />
        <Route path="reports/students" element={<LazyPage><StudentReports /></LazyPage>} />
        <Route path="reports/students/:studentId" element={<LazyPage><StudentProfile360 /></LazyPage>} />

        {/* Academic Schedule - Consolidated */}
        <Route path="academic-schedule/setup" element={<LazyPage><AcademicScheduleSetup /></LazyPage>} />
        <Route path="academic-schedule/plans" element={<LazyPage><AcademicPlannerHub /></LazyPage>} />
        <Route path="academic-schedule/planner/:batchId" element={<LazyPage><AcademicPlannerWorkspace /></LazyPage>} />
        <Route path="academic-schedule/batches" element={<LazyPage><BatchHub /></LazyPage>} />
        <Route path="academic-schedule/batches/:batchId" element={<LazyPage><ConsolidatedBatchView /></LazyPage>} />
        
        {/* Legacy routes - redirect to new consolidated view */}
        <Route path="academic-schedule/progress" element={<Navigate to="/institute/academic-schedule/batches" replace />} />
        <Route path="academic-schedule/progress/:batchId" element={<Navigate to="/institute/academic-schedule/batches" replace />} />
        <Route path="academic-schedule/pending" element={<Navigate to="/institute/academic-schedule/batches" replace />} />
        <Route path="academic-schedule/views" element={<Navigate to="/institute/academic-schedule/batches" replace />} />
        <Route path="academic-schedule/alignment" element={<Navigate to="/institute/academic-schedule/batches" replace />} />
        
        {/* Keep direct access to specific views (optional) */}
        <Route path="academic-schedule/year-view" element={<LazyPage><AcademicScheduleYearOverview /></LazyPage>} />
        <Route path="academic-schedule/teaching-view" element={<LazyPage><AcademicScheduleTeachingView /></LazyPage>} />
        <Route path="academic-schedule/chapter-detail" element={<LazyPage><AcademicScheduleChapterDetail /></LazyPage>} />
      </Route>
    </Routes>
  );
}
