// Documentation Navigation Structure
// Maps to actual markdown files in /docs folder

export interface DocNavItem {
  title: string;
  path: string;
  icon?: string;
  children?: DocNavItem[];
}

export interface DocSection {
  title: string;
  icon: string;
  color: string;
  items: DocNavItem[];
}

export const docsNavigation: DocSection[] = [
  {
    title: "Getting Started",
    icon: "📘",
    color: "text-blue-600",
    items: [
      { title: "Architecture Overview", path: "00-overview/README" },
    ],
  },
  {
    title: "SuperAdmin Portal",
    icon: "🔴",
    color: "text-red-500",
    items: [
      { title: "Overview", path: "01-superadmin/README" },
      { title: "Dashboard", path: "01-superadmin/dashboard" },
      {
        title: "Master Data",
        path: "01-superadmin/master-data",
        children: [
          { title: "Curriculum", path: "01-superadmin/master-data-curriculum" },
          { title: "Courses", path: "01-superadmin/master-data-courses" },
        ],
      },
      { title: "Institutes", path: "01-superadmin/institutes" },
      { title: "Tier Management", path: "01-superadmin/tier-management" },
      { title: "Users", path: "01-superadmin/users" },
      { title: "Content Library", path: "01-superadmin/content-library" },
      { title: "Question Bank", path: "01-superadmin/question-bank" },
      { title: "Exams", path: "01-superadmin/exams" },
      { title: "Roles & Access", path: "01-superadmin/roles-access" },
    ],
  },
  {
    title: "Institute Portal",
    icon: "🟢",
    color: "text-green-500",
    items: [
      { title: "Overview", path: "02-institute/README" },
      { title: "Dashboard", path: "02-institute/dashboard" },
      { title: "Batches", path: "02-institute/batches" },
      { title: "Teachers", path: "02-institute/teachers" },
      { title: "Students", path: "02-institute/students" },
      { title: "Master Data", path: "02-institute/master-data" },
      {
        title: "Timetable",
        path: "02-institute/timetable",
        children: [
          { title: "Setup", path: "02-institute/timetable-setup" },
          { title: "Workspace", path: "02-institute/timetable-workspace" },
          { title: "Substitution", path: "02-institute/timetable-substitution" },
        ],
      },
      {
        title: "Academic Schedule",
        path: "02-institute/academic-schedule",
        children: [
          { title: "Setup", path: "02-institute/academic-schedule-setup" },
          { title: "Planner", path: "02-institute/academic-planner" },
          { title: "Progress", path: "02-institute/batch-progress" },
        ],
      },
      { title: "Content Library", path: "02-institute/content-library" },
      { title: "Question Bank", path: "02-institute/question-bank" },
      { title: "Exams", path: "02-institute/exams-new" },
      { title: "Packages", path: "02-institute/packages" },
      {
        title: "Reports",
        path: "02-institute/reports-overview",
        children: [
          { title: "Overview", path: "02-institute/reports-overview" },
          { title: "Batch Reports", path: "02-institute/reports-batches" },
          { title: "Exam Reports", path: "02-institute/reports-exams" },
          { title: "Student Reports", path: "02-institute/reports-students" },
        ],
      },
      { title: "Roles & Access", path: "02-institute/roles-access" },
    ],
  },
  {
    title: "Teacher Portal",
    icon: "🔵",
    color: "text-blue-500",
    items: [
      { title: "Overview", path: "03-teacher/README" },
      { title: "Dashboard", path: "03-teacher/dashboard" },
      { title: "Schedule", path: "03-teacher/schedule" },
      { title: "Lesson Plans", path: "03-teacher/lesson-plans" },
      { title: "Lesson Workspace", path: "03-teacher/lesson-workspace" },
      { title: "Content Library", path: "03-teacher/content-library" },
      { title: "Homework", path: "03-teacher/homework" },
      { title: "Exams", path: "03-teacher/exams" },
      {
        title: "Reports",
        path: "03-teacher/reports-overview",
        children: [
          { title: "Overview", path: "03-teacher/reports-overview" },
          { title: "Chapters", path: "03-teacher/reports-chapters" },
          { title: "Exams", path: "03-teacher/reports-exams" },
          { title: "Students & Homework", path: "03-teacher/reports-students" },
          { title: "Chapter Report — Calculations", path: "03-teacher/chapter-report-calculations" },
        ],
      },
      { title: "Academic Progress", path: "03-teacher/academic-progress" },
    ],
  },
  {
    title: "Student Portal",
    icon: "🟣",
    color: "text-purple-500",
    items: [
      { title: "Overview", path: "04-student/README" },
      { title: "Dashboard", path: "04-student/dashboard" },
      { title: "Subjects", path: "04-student/subjects" },
      {
        title: "Chapter View",
        path: "04-student/chapter-view",
        children: [
          { title: "Classroom Mode", path: "04-student/classroom-mode" },
          { title: "My Path Mode", path: "04-student/mypath-mode" },
          { title: "Compete Mode", path: "04-student/compete-mode" },
        ],
      },
      { title: "Content Viewer", path: "04-student/content-viewer" },
      { title: "Test Player", path: "04-student/test-player" },
      { title: "Test Results", path: "04-student/test-results" },
      { title: "Homework", path: "04-student/homework" },
      { title: "Progress", path: "04-student/progress" },
      { title: "Copilot — Session Continuity", path: "04-student/copilot-session-continuity" },
    ],
  },
  {
    title: "Cross-Login Flows",
    icon: "🔄",
    color: "text-amber-500",
    items: [
      { title: "Overview", path: "05-cross-login-flows/README" },
      { title: "Content Propagation", path: "05-cross-login-flows/content-propagation" },
      { title: "Curriculum Flow", path: "05-cross-login-flows/curriculum-course-flow" },
      { title: "Package Flow", path: "05-cross-login-flows/package-flow" },
      { title: "Question Propagation", path: "05-cross-login-flows/question-propagation" },
      { title: "Batch Student Flow", path: "05-cross-login-flows/batch-student-flow" },
      { title: "Exam Flow", path: "05-cross-login-flows/exam-flow" },
      { title: "Timetable Flow", path: "05-cross-login-flows/timetable-flow" },
      { title: "Academic Schedule Flow", path: "05-cross-login-flows/academic-schedule-flow" },
      { title: "Homework Flow", path: "05-cross-login-flows/homework-flow" },
    ],
  },
  {
    title: "Product Audit",
    icon: "📊",
    color: "text-orange-500",
    items: [
      { title: "Pricing vs Product Gap Analysis", path: "07-product-audit/pricing-feature-gap-analysis" },
    ],
  },
  {
    title: "Testing Scenarios",
    icon: "🧪",
    color: "text-teal-500",
    items: [
      { title: "Overview", path: "06-testing-scenarios/README" },
      {
        title: "Smoke Tests",
        path: "06-testing-scenarios/smoke-tests",
        children: [
          { title: "SuperAdmin", path: "06-testing-scenarios/smoke-tests/superadmin" },
          { title: "Institute", path: "06-testing-scenarios/smoke-tests/institute" },
          { title: "Teacher", path: "06-testing-scenarios/smoke-tests/teacher" },
          { title: "Student", path: "06-testing-scenarios/smoke-tests/student" },
        ],
      },
      {
        title: "Intra-Login Tests",
        path: "06-testing-scenarios/intra-login-tests",
        children: [
          { title: "SuperAdmin", path: "06-testing-scenarios/intra-login-tests/superadmin" },
          { title: "Institute", path: "06-testing-scenarios/intra-login-tests/institute" },
          { title: "Teacher", path: "06-testing-scenarios/intra-login-tests/teacher" },
          { title: "Student", path: "06-testing-scenarios/intra-login-tests/student" },
        ],
      },
      {
        title: "Inter-Login Tests",
        path: "06-testing-scenarios/inter-login-tests",
        children: [
          { title: "Content Tests", path: "06-testing-scenarios/inter-login-tests/content-tests" },
          { title: "Exam Tests", path: "06-testing-scenarios/inter-login-tests/exam-tests" },
          { title: "Timetable Tests", path: "06-testing-scenarios/inter-login-tests/timetable-tests" },
          {
            title: "Timetable QA",
            path: "06-testing-scenarios/inter-login-tests/timetable-institute-qa",
            children: [
              { title: "Setup QA", path: "06-testing-scenarios/inter-login-tests/timetable-setup-qa" },
              { title: "Workspace QA", path: "06-testing-scenarios/inter-login-tests/timetable-workspace-qa" },
              { title: "Upload View QA", path: "06-testing-scenarios/inter-login-tests/timetable-upload-qa" },
              { title: "Substitution & Edge Cases QA", path: "06-testing-scenarios/inter-login-tests/timetable-substitution-edge-qa" },
            ],
          },
          { title: "Curriculum Tests", path: "06-testing-scenarios/inter-login-tests/curriculum-tests" },
          { title: "Packages QA", path: "06-testing-scenarios/inter-login-tests/packages-qa" },
          { title: "Tier Management Tests", path: "06-testing-scenarios/inter-login-tests/tier-institute-tests" },
          { title: "Question Bank Tests", path: "06-testing-scenarios/inter-login-tests/question-bank-tests" },
          { title: "Roles & Access Tests", path: "06-testing-scenarios/inter-login-tests/roles-access-tests" },
          { title: "Curriculum Scope QA", path: "06-testing-scenarios/inter-login-tests/curriculum-scope-qa" },
          { title: "Course Filtering QA", path: "06-testing-scenarios/inter-login-tests/course-chapter-filtering-qa" },
          { title: "Course Assignment QA", path: "06-testing-scenarios/inter-login-tests/course-assignment-scope-qa" },
          { title: "Exam Distribution QA", path: "06-testing-scenarios/inter-login-tests/exam-distribution-qa" },
          {
            title: "Teacher Reports QA",
            path: "06-testing-scenarios/inter-login-tests/teacher-reports-landing-and-health-qa",
            children: [
              { title: "Landing & Today's Focus", path: "06-testing-scenarios/inter-login-tests/teacher-reports-landing-and-health-qa" },
              { title: "Chapters QA", path: "06-testing-scenarios/inter-login-tests/teacher-reports-chapters-qa" },
              { title: "Exams QA", path: "06-testing-scenarios/inter-login-tests/teacher-reports-exams-qa" },
              { title: "Students QA", path: "06-testing-scenarios/inter-login-tests/teacher-reports-students-qa" },
            ],
          },
          {
            title: "Student Reports QA",
            path: "06-testing-scenarios/inter-login-tests/student-reports-setup-and-preconditions-qa",
            children: [
              { title: "Setup & Preconditions", path: "06-testing-scenarios/inter-login-tests/student-reports-setup-and-preconditions-qa" },
              { title: "Overview Tab QA", path: "06-testing-scenarios/inter-login-tests/student-progress-overview-qa" },
              { title: "Subjects Tab QA", path: "06-testing-scenarios/inter-login-tests/student-progress-subjects-qa" },
              { title: "Exams Tab QA", path: "06-testing-scenarios/inter-login-tests/student-progress-exams-qa" },
              { title: "Insights Tab QA", path: "06-testing-scenarios/inter-login-tests/student-progress-insights-qa" },
            ],
          },
        ],
      },
    ],
  },
];

// Flatten navigation for search
export function flattenDocsNavigation(): { title: string; path: string; section: string }[] {
  const result: { title: string; path: string; section: string }[] = [];

  function flatten(items: DocNavItem[], section: string) {
    for (const item of items) {
      result.push({ title: item.title, path: item.path, section });
      if (item.children) {
        flatten(item.children, section);
      }
    }
  }

  for (const section of docsNavigation) {
    flatten(section.items, section.title);
  }

  return result;
}
