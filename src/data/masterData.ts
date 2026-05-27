import { Curriculum, Course, Chapter, CourseChapterMapping } from "@/types/masterData";

// ============================================
// CURRICULUMS
// ============================================
export const curriculums: Curriculum[] = [
  { 
    id: "cbse", 
    name: "CBSE", 
    code: "CBSE", 
    description: "Central Board of Secondary Education",
    isActive: true 
  },
  { 
    id: "icse", 
    name: "ICSE", 
    code: "ICSE", 
    description: "Indian Certificate of Secondary Education",
    isActive: true 
  },
  { 
    id: "igcse", 
    name: "IGCSE", 
    code: "IGCSE", 
    description: "Cambridge International General Certificate of Secondary Education",
    isActive: true 
  },
  { 
    id: "state-ap", 
    name: "AP State Board", 
    code: "APSB", 
    description: "Andhra Pradesh State Board of Intermediate Education",
    isActive: true 
  },
  { 
    id: "state-ts", 
    name: "Telangana State Board", 
    code: "TSSB", 
    description: "Telangana State Board of Intermediate Education",
    isActive: false 
  },
];

// ============================================
// COURSES (Competitive, Foundation, etc.)
// ============================================
export const courses: Course[] = [
  { 
    id: "jee-foundation", 
    name: "IIT-JEE Foundation", 
    code: "JEEF",
    description: "Foundation course for IIT-JEE preparation (Class 9-10)",
    courseType: "foundation",
    allowedCurriculums: ["cbse", "icse"],
    allowedClasses: ["4", "5"], // Class 9, 10
    status: "published",
    isActive: true
  },
  { 
    id: "jee-mains", 
    name: "IIT-JEE Mains", 
    code: "JEEM",
    description: "Joint Entrance Examination Main for engineering admissions",
    courseType: "competitive",
    allowedCurriculums: ["cbse", "icse"],
    allowedClasses: ["6", "7"], // Class 11, 12
    status: "published",
    isActive: true
  },
  { 
    id: "jee-advanced", 
    name: "IIT-JEE Advanced", 
    code: "JEEA",
    description: "Joint Entrance Examination Advanced for IIT admissions",
    courseType: "competitive",
    allowedCurriculums: ["cbse", "icse"],
    allowedClasses: ["6", "7"], // Class 11, 12
    status: "published",
    isActive: true
  },
  { 
    id: "neet", 
    name: "NEET", 
    code: "NEET",
    description: "National Eligibility cum Entrance Test for medical admissions",
    courseType: "competitive",
    allowedCurriculums: ["cbse", "icse"],
    allowedClasses: ["6", "7"], // Class 11, 12
    status: "published",
    isActive: true
  },
  { 
    id: "neet-foundation", 
    name: "NEET Foundation", 
    code: "NEETF",
    description: "Foundation course for NEET preparation (Class 9-10)",
    courseType: "foundation",
    allowedCurriculums: ["cbse", "icse"],
    allowedClasses: ["4", "5"], // Class 9, 10
    status: "published",
    isActive: true
  },
  { 
    id: "olympiad-math", 
    name: "Mathematics Olympiad", 
    code: "MATHO",
    description: "International Mathematical Olympiad preparation",
    courseType: "olympiad",
    allowedCurriculums: ["cbse", "icse", "igcse"],
    allowedClasses: ["4", "5", "6", "7"], // Class 9-12
    status: "draft",
    isActive: true
  },
  { 
    id: "olympiad-science", 
    name: "Science Olympiad", 
    code: "SCIO",
    description: "National/International Science Olympiad preparation",
    courseType: "olympiad",
    allowedCurriculums: ["cbse", "icse"],
    allowedClasses: ["1", "2", "3", "4", "5"], // Class 6-10
    status: "draft",
    isActive: true
  },
];

// ============================================
// COURSE-OWNED CHAPTERS (The 20%)
// These chapters exist ONLY within courses, not in curriculum tree
// ============================================
export const courseOwnedChapters: Chapter[] = [
  // JEE Advanced specific chapters - Physics
  { 
    id: "jee-adv-mech", 
    name: "Advanced Mechanics - Problem Solving", 
    courseId: "jee-advanced",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jee-adv-calc", 
    name: "Calculus-Based Physics Problems", 
    courseId: "jee-advanced",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 2
  },
  { 
    id: "jee-adv-multi", 
    name: "Multi-Concept Practice Sets", 
    courseId: "jee-advanced",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 3
  },
  { 
    id: "jee-adv-thermo", 
    name: "Advanced Thermodynamics Problems", 
    courseId: "jee-advanced",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 4
  },
  { 
    id: "jee-adv-em", 
    name: "Electromagnetic Theory Deep Dive", 
    courseId: "jee-advanced",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 5
  },
  // JEE Advanced - Chemistry
  { 
    id: "jee-adv-org-mech", 
    name: "Organic Reaction Mechanisms", 
    courseId: "jee-advanced",
    subjectId: "2", // Chemistry
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jee-adv-coord-adv", 
    name: "Advanced Coordination Chemistry", 
    courseId: "jee-advanced",
    subjectId: "2", // Chemistry
    isCourseOwned: true,
    order: 2
  },
  // JEE Advanced - Mathematics
  { 
    id: "jee-adv-complex-int", 
    name: "Complex Integration Techniques", 
    courseId: "jee-advanced",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jee-adv-ode", 
    name: "Advanced Differential Equations", 
    courseId: "jee-advanced",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 2
  },
  
  // JEE Mains specific chapters
  { 
    id: "jee-math-tools", 
    name: "Mathematical Tools for JEE", 
    courseId: "jee-mains",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jee-problem-strat", 
    name: "Problem Solving Strategies", 
    courseId: "jee-mains",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 2
  },
  { 
    id: "jee-dim-analysis", 
    name: "Dimensional Analysis Mastery", 
    courseId: "jee-mains",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jee-error-analysis", 
    name: "Error Analysis & Measurements", 
    courseId: "jee-mains",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 2
  },
  { 
    id: "jee-mole-concept", 
    name: "Mole Concept Problem Bank", 
    courseId: "jee-mains",
    subjectId: "2", // Chemistry
    isCourseOwned: true,
    order: 1
  },
  
  // JEE Foundation specific chapters
  { 
    id: "jeef-mental-math", 
    name: "Mental Mathematics & Shortcuts", 
    courseId: "jee-foundation",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jeef-aptitude", 
    name: "Aptitude & Logical Reasoning", 
    courseId: "jee-foundation",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 2
  },
  { 
    id: "jeef-science-lab", 
    name: "Science Lab Techniques", 
    courseId: "jee-foundation",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "jeef-exam-aware", 
    name: "Competitive Exam Awareness", 
    courseId: "jee-foundation",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 2
  },
  
  // NEET specific chapters - Biology
  { 
    id: "neet-bio-diagrams", 
    name: "Diagram-Based Questions in Biology", 
    courseId: "neet",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "neet-assertion", 
    name: "Assertion-Reason Practice", 
    courseId: "neet",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 2
  },
  { 
    id: "neet-bio-quick-rev", 
    name: "NEET Biology Quick Revision", 
    courseId: "neet",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 3
  },
  { 
    id: "neet-med-terms", 
    name: "Medical Terminology Basics", 
    courseId: "neet",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 4
  },
  { 
    id: "neet-pyp-analysis", 
    name: "Previous Year Pattern Analysis", 
    courseId: "neet",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 5
  },
  // NEET - Physics
  { 
    id: "neet-phy-bio-apps", 
    name: "Physics in Biological Systems", 
    courseId: "neet",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 1
  },
  // NEET - Chemistry
  { 
    id: "neet-biomolecules-adv", 
    name: "Advanced Biomolecules", 
    courseId: "neet",
    subjectId: "2", // Chemistry
    isCourseOwned: true,
    order: 1
  },
  
  // NEET Foundation specific
  { 
    id: "neetf-bio-basics", 
    name: "Biology Fundamentals for NEET", 
    courseId: "neet-foundation",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "neetf-diagram-skills", 
    name: "Diagram Drawing Skills", 
    courseId: "neet-foundation",
    subjectId: "4", // Biology
    isCourseOwned: true,
    order: 2
  },
  
  // Olympiad specific chapters
  { 
    id: "oly-number-theory", 
    name: "Advanced Number Theory", 
    courseId: "olympiad-math",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "oly-combinatorics", 
    name: "Combinatorics & Counting", 
    courseId: "olympiad-math",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 2
  },
  { 
    id: "oly-geometry", 
    name: "Advanced Euclidean Geometry", 
    courseId: "olympiad-math",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 3
  },
  { 
    id: "oly-inequalities", 
    name: "Algebraic Inequalities", 
    courseId: "olympiad-math",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 4
  },
  { 
    id: "oly-functional-eq", 
    name: "Functional Equations", 
    courseId: "olympiad-math",
    subjectId: "3", // Mathematics
    isCourseOwned: true,
    order: 5
  },
  
  // Science Olympiad
  { 
    id: "scio-exp-design", 
    name: "Experimental Design", 
    courseId: "olympiad-science",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 1
  },
  { 
    id: "scio-data-analysis", 
    name: "Scientific Data Analysis", 
    courseId: "olympiad-science",
    subjectId: "1", // Physics
    isCourseOwned: true,
    order: 2
  },
];

// ============================================
// TOPICS FOR COURSE-OWNED CHAPTERS
// ============================================
export const courseOwnedChapterTopics = [
  // JEE Advanced - Advanced Mechanics
  { id: "jee-adv-mech-t1", chapterId: "jee-adv-mech", name: "Energy Methods in Mechanics", order: 1 },
  { id: "jee-adv-mech-t2", chapterId: "jee-adv-mech", name: "Variable Mass Systems", order: 2 },
  { id: "jee-adv-mech-t3", chapterId: "jee-adv-mech", name: "Rotating Reference Frames", order: 3 },
  
  // JEE Mains - Mole Concept Problem Bank
  { id: "jee-mole-t1", chapterId: "jee-mole-concept", name: "Introduction to Mole Concept", order: 1 },
  { id: "jee-mole-t2", chapterId: "jee-mole-concept", name: "Avogadro's Number Applications", order: 2 },
  { id: "jee-mole-t3", chapterId: "jee-mole-concept", name: "Molar Mass Calculations", order: 3 },
  { id: "jee-mole-t4", chapterId: "jee-mole-concept", name: "Stoichiometry Practice", order: 4 },
  
  // JEE Mains - Dimensional Analysis
  { id: "jee-dim-t1", chapterId: "jee-dim-analysis", name: "Dimensional Formulas", order: 1 },
  { id: "jee-dim-t2", chapterId: "jee-dim-analysis", name: "Dimensional Equations", order: 2 },
  { id: "jee-dim-t3", chapterId: "jee-dim-analysis", name: "Limitations of Dimensional Analysis", order: 3 },
  
  // JEE Mains - Mathematical Tools
  { id: "jee-math-t1", chapterId: "jee-math-tools", name: "Basic Differentiation", order: 1 },
  { id: "jee-math-t2", chapterId: "jee-math-tools", name: "Integration Techniques", order: 2 },
  { id: "jee-math-t3", chapterId: "jee-math-tools", name: "Vector Algebra Review", order: 3 },
  
  // NEET - Diagram-Based Questions
  { id: "neet-diag-t1", chapterId: "neet-bio-diagrams", name: "Cell Structure Diagrams", order: 1 },
  { id: "neet-diag-t2", chapterId: "neet-bio-diagrams", name: "Human Anatomy Labeling", order: 2 },
  { id: "neet-diag-t3", chapterId: "neet-bio-diagrams", name: "Plant Morphology Diagrams", order: 3 },
  
  // Olympiad - Number Theory
  { id: "oly-num-t1", chapterId: "oly-number-theory", name: "Divisibility and Primes", order: 1 },
  { id: "oly-num-t2", chapterId: "oly-number-theory", name: "Modular Arithmetic", order: 2 },
  { id: "oly-num-t3", chapterId: "oly-number-theory", name: "Diophantine Equations", order: 3 },
];

// ============================================
// COURSE-CHAPTER MAPPINGS (The 80%)
// Links curriculum chapters to courses
// ============================================
export const courseChapterMappings: CourseChapterMapping[] = [
  // ===============================
  // JEE MAINS - Complete syllabus
  // ===============================
  
  // JEE Mains - Physics from CBSE Class 11 (All 15 chapters)
  { id: "jm-phy-11-1", courseId: "jee-mains", chapterId: "phy-11-1", sourceCurriculumId: "cbse", order: 1 },
  { id: "jm-phy-11-2", courseId: "jee-mains", chapterId: "phy-11-2", sourceCurriculumId: "cbse", order: 2 },
  { id: "jm-phy-11-3", courseId: "jee-mains", chapterId: "phy-11-3", sourceCurriculumId: "cbse", order: 3 },
  { id: "jm-phy-11-4", courseId: "jee-mains", chapterId: "phy-11-4", sourceCurriculumId: "cbse", order: 4 },
  { id: "jm-phy-11-5", courseId: "jee-mains", chapterId: "phy-11-5", sourceCurriculumId: "cbse", order: 5 },
  { id: "jm-phy-11-6", courseId: "jee-mains", chapterId: "phy-11-6", sourceCurriculumId: "cbse", order: 6 },
  { id: "jm-phy-11-7", courseId: "jee-mains", chapterId: "phy-11-7", sourceCurriculumId: "cbse", order: 7 },
  { id: "jm-phy-11-8", courseId: "jee-mains", chapterId: "phy-11-8", sourceCurriculumId: "cbse", order: 8 },
  { id: "jm-phy-11-9", courseId: "jee-mains", chapterId: "phy-11-9", sourceCurriculumId: "cbse", order: 9 },
  { id: "jm-phy-11-10", courseId: "jee-mains", chapterId: "phy-11-10", sourceCurriculumId: "cbse", order: 10 },
  { id: "jm-phy-11-11", courseId: "jee-mains", chapterId: "phy-11-11", sourceCurriculumId: "cbse", order: 11 },
  { id: "jm-phy-11-12", courseId: "jee-mains", chapterId: "phy-11-12", sourceCurriculumId: "cbse", order: 12 },
  { id: "jm-phy-11-13", courseId: "jee-mains", chapterId: "phy-11-13", sourceCurriculumId: "cbse", order: 13 },
  { id: "jm-phy-11-14", courseId: "jee-mains", chapterId: "phy-11-14", sourceCurriculumId: "cbse", order: 14 },
  { id: "jm-phy-11-15", courseId: "jee-mains", chapterId: "phy-11-15", sourceCurriculumId: "cbse", order: 15 },
  
  // JEE Mains - Physics from CBSE Class 12 (All 14 chapters)
  { id: "jm-phy-12-1", courseId: "jee-mains", chapterId: "phy-12-1", sourceCurriculumId: "cbse", order: 16 },
  { id: "jm-phy-12-2", courseId: "jee-mains", chapterId: "phy-12-2", sourceCurriculumId: "cbse", order: 17 },
  { id: "jm-phy-12-3", courseId: "jee-mains", chapterId: "phy-12-3", sourceCurriculumId: "cbse", order: 18 },
  { id: "jm-phy-12-4", courseId: "jee-mains", chapterId: "phy-12-4", sourceCurriculumId: "cbse", order: 19 },
  { id: "jm-phy-12-5", courseId: "jee-mains", chapterId: "phy-12-5", sourceCurriculumId: "cbse", order: 20 },
  { id: "jm-phy-12-6", courseId: "jee-mains", chapterId: "phy-12-6", sourceCurriculumId: "cbse", order: 21 },
  { id: "jm-phy-12-7", courseId: "jee-mains", chapterId: "phy-12-7", sourceCurriculumId: "cbse", order: 22 },
  { id: "jm-phy-12-8", courseId: "jee-mains", chapterId: "phy-12-8", sourceCurriculumId: "cbse", order: 23 },
  { id: "jm-phy-12-9", courseId: "jee-mains", chapterId: "phy-12-9", sourceCurriculumId: "cbse", order: 24 },
  { id: "jm-phy-12-10", courseId: "jee-mains", chapterId: "phy-12-10", sourceCurriculumId: "cbse", order: 25 },
  { id: "jm-phy-12-11", courseId: "jee-mains", chapterId: "phy-12-11", sourceCurriculumId: "cbse", order: 26 },
  { id: "jm-phy-12-12", courseId: "jee-mains", chapterId: "phy-12-12", sourceCurriculumId: "cbse", order: 27 },
  { id: "jm-phy-12-13", courseId: "jee-mains", chapterId: "phy-12-13", sourceCurriculumId: "cbse", order: 28 },
  { id: "jm-phy-12-14", courseId: "jee-mains", chapterId: "phy-12-14", sourceCurriculumId: "cbse", order: 29 },
  
  // JEE Mains - Chemistry from CBSE Class 11 (All 14 chapters)
  { id: "jm-che-11-1", courseId: "jee-mains", chapterId: "che-11-1", sourceCurriculumId: "cbse", order: 30 },
  { id: "jm-che-11-2", courseId: "jee-mains", chapterId: "che-11-2", sourceCurriculumId: "cbse", order: 31 },
  { id: "jm-che-11-3", courseId: "jee-mains", chapterId: "che-11-3", sourceCurriculumId: "cbse", order: 32 },
  { id: "jm-che-11-4", courseId: "jee-mains", chapterId: "che-11-4", sourceCurriculumId: "cbse", order: 33 },
  { id: "jm-che-11-5", courseId: "jee-mains", chapterId: "che-11-5", sourceCurriculumId: "cbse", order: 34 },
  { id: "jm-che-11-6", courseId: "jee-mains", chapterId: "che-11-6", sourceCurriculumId: "cbse", order: 35 },
  { id: "jm-che-11-7", courseId: "jee-mains", chapterId: "che-11-7", sourceCurriculumId: "cbse", order: 36 },
  { id: "jm-che-11-8", courseId: "jee-mains", chapterId: "che-11-8", sourceCurriculumId: "cbse", order: 37 },
  { id: "jm-che-11-9", courseId: "jee-mains", chapterId: "che-11-9", sourceCurriculumId: "cbse", order: 38 },
  { id: "jm-che-11-10", courseId: "jee-mains", chapterId: "che-11-10", sourceCurriculumId: "cbse", order: 39 },
  { id: "jm-che-11-11", courseId: "jee-mains", chapterId: "che-11-11", sourceCurriculumId: "cbse", order: 40 },
  { id: "jm-che-11-12", courseId: "jee-mains", chapterId: "che-11-12", sourceCurriculumId: "cbse", order: 41 },
  { id: "jm-che-11-13", courseId: "jee-mains", chapterId: "che-11-13", sourceCurriculumId: "cbse", order: 42 },
  { id: "jm-che-11-14", courseId: "jee-mains", chapterId: "che-11-14", sourceCurriculumId: "cbse", order: 43 },
  
  // JEE Mains - Chemistry from CBSE Class 12 (All 16 chapters)
  { id: "jm-che-12-1", courseId: "jee-mains", chapterId: "che-12-1", sourceCurriculumId: "cbse", order: 44 },
  { id: "jm-che-12-2", courseId: "jee-mains", chapterId: "che-12-2", sourceCurriculumId: "cbse", order: 45 },
  { id: "jm-che-12-3", courseId: "jee-mains", chapterId: "che-12-3", sourceCurriculumId: "cbse", order: 46 },
  { id: "jm-che-12-4", courseId: "jee-mains", chapterId: "che-12-4", sourceCurriculumId: "cbse", order: 47 },
  { id: "jm-che-12-5", courseId: "jee-mains", chapterId: "che-12-5", sourceCurriculumId: "cbse", order: 48 },
  { id: "jm-che-12-6", courseId: "jee-mains", chapterId: "che-12-6", sourceCurriculumId: "cbse", order: 49 },
  { id: "jm-che-12-7", courseId: "jee-mains", chapterId: "che-12-7", sourceCurriculumId: "cbse", order: 50 },
  { id: "jm-che-12-8", courseId: "jee-mains", chapterId: "che-12-8", sourceCurriculumId: "cbse", order: 51 },
  { id: "jm-che-12-9", courseId: "jee-mains", chapterId: "che-12-9", sourceCurriculumId: "cbse", order: 52 },
  { id: "jm-che-12-10", courseId: "jee-mains", chapterId: "che-12-10", sourceCurriculumId: "cbse", order: 53 },
  { id: "jm-che-12-11", courseId: "jee-mains", chapterId: "che-12-11", sourceCurriculumId: "cbse", order: 54 },
  { id: "jm-che-12-12", courseId: "jee-mains", chapterId: "che-12-12", sourceCurriculumId: "cbse", order: 55 },
  { id: "jm-che-12-13", courseId: "jee-mains", chapterId: "che-12-13", sourceCurriculumId: "cbse", order: 56 },
  { id: "jm-che-12-14", courseId: "jee-mains", chapterId: "che-12-14", sourceCurriculumId: "cbse", order: 57 },
  { id: "jm-che-12-15", courseId: "jee-mains", chapterId: "che-12-15", sourceCurriculumId: "cbse", order: 58 },
  { id: "jm-che-12-16", courseId: "jee-mains", chapterId: "che-12-16", sourceCurriculumId: "cbse", order: 59 },
  
  // JEE Mains - Mathematics from CBSE Class 11 (All 16 chapters)
  { id: "jm-mat-11-1", courseId: "jee-mains", chapterId: "mat-11-1", sourceCurriculumId: "cbse", order: 60 },
  { id: "jm-mat-11-2", courseId: "jee-mains", chapterId: "mat-11-2", sourceCurriculumId: "cbse", order: 61 },
  { id: "jm-mat-11-3", courseId: "jee-mains", chapterId: "mat-11-3", sourceCurriculumId: "cbse", order: 62 },
  { id: "jm-mat-11-4", courseId: "jee-mains", chapterId: "mat-11-4", sourceCurriculumId: "cbse", order: 63 },
  { id: "jm-mat-11-5", courseId: "jee-mains", chapterId: "mat-11-5", sourceCurriculumId: "cbse", order: 64 },
  { id: "jm-mat-11-6", courseId: "jee-mains", chapterId: "mat-11-6", sourceCurriculumId: "cbse", order: 65 },
  { id: "jm-mat-11-7", courseId: "jee-mains", chapterId: "mat-11-7", sourceCurriculumId: "cbse", order: 66 },
  { id: "jm-mat-11-8", courseId: "jee-mains", chapterId: "mat-11-8", sourceCurriculumId: "cbse", order: 67 },
  { id: "jm-mat-11-9", courseId: "jee-mains", chapterId: "mat-11-9", sourceCurriculumId: "cbse", order: 68 },
  { id: "jm-mat-11-10", courseId: "jee-mains", chapterId: "mat-11-10", sourceCurriculumId: "cbse", order: 69 },
  { id: "jm-mat-11-11", courseId: "jee-mains", chapterId: "mat-11-11", sourceCurriculumId: "cbse", order: 70 },
  { id: "jm-mat-11-12", courseId: "jee-mains", chapterId: "mat-11-12", sourceCurriculumId: "cbse", order: 71 },
  { id: "jm-mat-11-13", courseId: "jee-mains", chapterId: "mat-11-13", sourceCurriculumId: "cbse", order: 72 },
  { id: "jm-mat-11-14", courseId: "jee-mains", chapterId: "mat-11-14", sourceCurriculumId: "cbse", order: 73 },
  { id: "jm-mat-11-15", courseId: "jee-mains", chapterId: "mat-11-15", sourceCurriculumId: "cbse", order: 74 },
  { id: "jm-mat-11-16", courseId: "jee-mains", chapterId: "mat-11-16", sourceCurriculumId: "cbse", order: 75 },
  
  // JEE Mains - Mathematics from CBSE Class 12 (All 13 chapters)
  { id: "jm-mat-12-1", courseId: "jee-mains", chapterId: "mat-12-1", sourceCurriculumId: "cbse", order: 76 },
  { id: "jm-mat-12-2", courseId: "jee-mains", chapterId: "mat-12-2", sourceCurriculumId: "cbse", order: 77 },
  { id: "jm-mat-12-3", courseId: "jee-mains", chapterId: "mat-12-3", sourceCurriculumId: "cbse", order: 78 },
  { id: "jm-mat-12-4", courseId: "jee-mains", chapterId: "mat-12-4", sourceCurriculumId: "cbse", order: 79 },
  { id: "jm-mat-12-5", courseId: "jee-mains", chapterId: "mat-12-5", sourceCurriculumId: "cbse", order: 80 },
  { id: "jm-mat-12-6", courseId: "jee-mains", chapterId: "mat-12-6", sourceCurriculumId: "cbse", order: 81 },
  { id: "jm-mat-12-7", courseId: "jee-mains", chapterId: "mat-12-7", sourceCurriculumId: "cbse", order: 82 },
  { id: "jm-mat-12-8", courseId: "jee-mains", chapterId: "mat-12-8", sourceCurriculumId: "cbse", order: 83 },
  { id: "jm-mat-12-9", courseId: "jee-mains", chapterId: "mat-12-9", sourceCurriculumId: "cbse", order: 84 },
  { id: "jm-mat-12-10", courseId: "jee-mains", chapterId: "mat-12-10", sourceCurriculumId: "cbse", order: 85 },
  { id: "jm-mat-12-11", courseId: "jee-mains", chapterId: "mat-12-11", sourceCurriculumId: "cbse", order: 86 },
  { id: "jm-mat-12-12", courseId: "jee-mains", chapterId: "mat-12-12", sourceCurriculumId: "cbse", order: 87 },
  { id: "jm-mat-12-13", courseId: "jee-mains", chapterId: "mat-12-13", sourceCurriculumId: "cbse", order: 88 },
  
  // ===============================
  // JEE ADVANCED - Inherits JEE Mains + Advanced topics
  // ===============================
  
  // JEE Advanced - Physics Class 11 (Key chapters)
  { id: "ja-phy-11-3", courseId: "jee-advanced", chapterId: "phy-11-3", sourceCurriculumId: "cbse", order: 1 },
  { id: "ja-phy-11-4", courseId: "jee-advanced", chapterId: "phy-11-4", sourceCurriculumId: "cbse", order: 2 },
  { id: "ja-phy-11-5", courseId: "jee-advanced", chapterId: "phy-11-5", sourceCurriculumId: "cbse", order: 3 },
  { id: "ja-phy-11-6", courseId: "jee-advanced", chapterId: "phy-11-6", sourceCurriculumId: "cbse", order: 4 },
  { id: "ja-phy-11-7", courseId: "jee-advanced", chapterId: "phy-11-7", sourceCurriculumId: "cbse", order: 5 },
  { id: "ja-phy-11-8", courseId: "jee-advanced", chapterId: "phy-11-8", sourceCurriculumId: "cbse", order: 6 },
  { id: "ja-phy-11-9", courseId: "jee-advanced", chapterId: "phy-11-9", sourceCurriculumId: "cbse", order: 7 },
  { id: "ja-phy-11-10", courseId: "jee-advanced", chapterId: "phy-11-10", sourceCurriculumId: "cbse", order: 8 },
  { id: "ja-phy-11-12", courseId: "jee-advanced", chapterId: "phy-11-12", sourceCurriculumId: "cbse", order: 9 },
  { id: "ja-phy-11-14", courseId: "jee-advanced", chapterId: "phy-11-14", sourceCurriculumId: "cbse", order: 10 },
  { id: "ja-phy-11-15", courseId: "jee-advanced", chapterId: "phy-11-15", sourceCurriculumId: "cbse", order: 11 },
  
  // JEE Advanced - Physics Class 12
  { id: "ja-phy-12-1", courseId: "jee-advanced", chapterId: "phy-12-1", sourceCurriculumId: "cbse", order: 12 },
  { id: "ja-phy-12-2", courseId: "jee-advanced", chapterId: "phy-12-2", sourceCurriculumId: "cbse", order: 13 },
  { id: "ja-phy-12-3", courseId: "jee-advanced", chapterId: "phy-12-3", sourceCurriculumId: "cbse", order: 14 },
  { id: "ja-phy-12-4", courseId: "jee-advanced", chapterId: "phy-12-4", sourceCurriculumId: "cbse", order: 15 },
  { id: "ja-phy-12-6", courseId: "jee-advanced", chapterId: "phy-12-6", sourceCurriculumId: "cbse", order: 16 },
  { id: "ja-phy-12-9", courseId: "jee-advanced", chapterId: "phy-12-9", sourceCurriculumId: "cbse", order: 17 },
  { id: "ja-phy-12-10", courseId: "jee-advanced", chapterId: "phy-12-10", sourceCurriculumId: "cbse", order: 18 },
  
  // JEE Advanced - Mathematics Class 12 (Key advanced chapters)
  { id: "ja-mat-12-5", courseId: "jee-advanced", chapterId: "mat-12-5", sourceCurriculumId: "cbse", order: 19 },
  { id: "ja-mat-12-6", courseId: "jee-advanced", chapterId: "mat-12-6", sourceCurriculumId: "cbse", order: 20 },
  { id: "ja-mat-12-7", courseId: "jee-advanced", chapterId: "mat-12-7", sourceCurriculumId: "cbse", order: 21 },
  { id: "ja-mat-12-8", courseId: "jee-advanced", chapterId: "mat-12-8", sourceCurriculumId: "cbse", order: 22 },
  { id: "ja-mat-12-9", courseId: "jee-advanced", chapterId: "mat-12-9", sourceCurriculumId: "cbse", order: 23 },
  { id: "ja-mat-12-10", courseId: "jee-advanced", chapterId: "mat-12-10", sourceCurriculumId: "cbse", order: 24 },
  { id: "ja-mat-12-11", courseId: "jee-advanced", chapterId: "mat-12-11", sourceCurriculumId: "cbse", order: 25 },
  
  // JEE Advanced - Chemistry Class 11
  { id: "ja-che-11-2", courseId: "jee-advanced", chapterId: "che-11-2", sourceCurriculumId: "cbse", order: 26 },
  { id: "ja-che-11-4", courseId: "jee-advanced", chapterId: "che-11-4", sourceCurriculumId: "cbse", order: 27 },
  { id: "ja-che-11-6", courseId: "jee-advanced", chapterId: "che-11-6", sourceCurriculumId: "cbse", order: 28 },
  { id: "ja-che-11-7", courseId: "jee-advanced", chapterId: "che-11-7", sourceCurriculumId: "cbse", order: 29 },
  { id: "ja-che-11-12", courseId: "jee-advanced", chapterId: "che-11-12", sourceCurriculumId: "cbse", order: 30 },
  
  // JEE Advanced - Chemistry Class 12
  { id: "ja-che-12-3", courseId: "jee-advanced", chapterId: "che-12-3", sourceCurriculumId: "cbse", order: 31 },
  { id: "ja-che-12-4", courseId: "jee-advanced", chapterId: "che-12-4", sourceCurriculumId: "cbse", order: 32 },
  { id: "ja-che-12-9", courseId: "jee-advanced", chapterId: "che-12-9", sourceCurriculumId: "cbse", order: 33 },
  
  // ===============================
  // NEET - Biology focused
  // ===============================
  
  // NEET - Physics from Class 11
  { id: "neet-phy-11-3", courseId: "neet", chapterId: "phy-11-3", sourceCurriculumId: "cbse", order: 1 },
  { id: "neet-phy-11-5", courseId: "neet", chapterId: "phy-11-5", sourceCurriculumId: "cbse", order: 2 },
  { id: "neet-phy-11-6", courseId: "neet", chapterId: "phy-11-6", sourceCurriculumId: "cbse", order: 3 },
  { id: "neet-phy-11-8", courseId: "neet", chapterId: "phy-11-8", sourceCurriculumId: "cbse", order: 4 },
  { id: "neet-phy-11-10", courseId: "neet", chapterId: "phy-11-10", sourceCurriculumId: "cbse", order: 5 },
  { id: "neet-phy-11-11", courseId: "neet", chapterId: "phy-11-11", sourceCurriculumId: "cbse", order: 6 },
  { id: "neet-phy-11-14", courseId: "neet", chapterId: "phy-11-14", sourceCurriculumId: "cbse", order: 7 },
  { id: "neet-phy-11-15", courseId: "neet", chapterId: "phy-11-15", sourceCurriculumId: "cbse", order: 8 },
  
  // NEET - Physics from Class 12
  { id: "neet-phy-12-1", courseId: "neet", chapterId: "phy-12-1", sourceCurriculumId: "cbse", order: 9 },
  { id: "neet-phy-12-3", courseId: "neet", chapterId: "phy-12-3", sourceCurriculumId: "cbse", order: 10 },
  { id: "neet-phy-12-9", courseId: "neet", chapterId: "phy-12-9", sourceCurriculumId: "cbse", order: 11 },
  { id: "neet-phy-12-11", courseId: "neet", chapterId: "phy-12-11", sourceCurriculumId: "cbse", order: 12 },
  { id: "neet-phy-12-12", courseId: "neet", chapterId: "phy-12-12", sourceCurriculumId: "cbse", order: 13 },
  { id: "neet-phy-12-13", courseId: "neet", chapterId: "phy-12-13", sourceCurriculumId: "cbse", order: 14 },
  
  // NEET - Chemistry from Class 11
  { id: "neet-che-11-1", courseId: "neet", chapterId: "che-11-1", sourceCurriculumId: "cbse", order: 15 },
  { id: "neet-che-11-2", courseId: "neet", chapterId: "che-11-2", sourceCurriculumId: "cbse", order: 16 },
  { id: "neet-che-11-3", courseId: "neet", chapterId: "che-11-3", sourceCurriculumId: "cbse", order: 17 },
  { id: "neet-che-11-4", courseId: "neet", chapterId: "che-11-4", sourceCurriculumId: "cbse", order: 18 },
  { id: "neet-che-11-7", courseId: "neet", chapterId: "che-11-7", sourceCurriculumId: "cbse", order: 19 },
  { id: "neet-che-11-12", courseId: "neet", chapterId: "che-11-12", sourceCurriculumId: "cbse", order: 20 },
  { id: "neet-che-11-13", courseId: "neet", chapterId: "che-11-13", sourceCurriculumId: "cbse", order: 21 },
  
  // NEET - Chemistry from Class 12
  { id: "neet-che-12-2", courseId: "neet", chapterId: "che-12-2", sourceCurriculumId: "cbse", order: 22 },
  { id: "neet-che-12-3", courseId: "neet", chapterId: "che-12-3", sourceCurriculumId: "cbse", order: 23 },
  { id: "neet-che-12-4", courseId: "neet", chapterId: "che-12-4", sourceCurriculumId: "cbse", order: 24 },
  { id: "neet-che-12-10", courseId: "neet", chapterId: "che-12-10", sourceCurriculumId: "cbse", order: 25 },
  { id: "neet-che-12-11", courseId: "neet", chapterId: "che-12-11", sourceCurriculumId: "cbse", order: 26 },
  { id: "neet-che-12-12", courseId: "neet", chapterId: "che-12-12", sourceCurriculumId: "cbse", order: 27 },
  { id: "neet-che-12-13", courseId: "neet", chapterId: "che-12-13", sourceCurriculumId: "cbse", order: 28 },
  { id: "neet-che-12-14", courseId: "neet", chapterId: "che-12-14", sourceCurriculumId: "cbse", order: 29 },
  
  // ===============================
  // JEE FOUNDATION - Class 9 & 10
  // ===============================
  
  // JEE Foundation - Mathematics Class 9
  { id: "jf-mat-9-1", courseId: "jee-foundation", chapterId: "mat-9-1", sourceCurriculumId: "cbse", order: 1 },
  { id: "jf-mat-9-2", courseId: "jee-foundation", chapterId: "mat-9-2", sourceCurriculumId: "cbse", order: 2 },
  { id: "jf-mat-9-3", courseId: "jee-foundation", chapterId: "mat-9-3", sourceCurriculumId: "cbse", order: 3 },
  { id: "jf-mat-9-4", courseId: "jee-foundation", chapterId: "mat-9-4", sourceCurriculumId: "cbse", order: 4 },
  { id: "jf-mat-9-5", courseId: "jee-foundation", chapterId: "mat-9-5", sourceCurriculumId: "cbse", order: 5 },
  { id: "jf-mat-9-6", courseId: "jee-foundation", chapterId: "mat-9-6", sourceCurriculumId: "cbse", order: 6 },
  { id: "jf-mat-9-7", courseId: "jee-foundation", chapterId: "mat-9-7", sourceCurriculumId: "cbse", order: 7 },
  { id: "jf-mat-9-10", courseId: "jee-foundation", chapterId: "mat-9-10", sourceCurriculumId: "cbse", order: 8 },
  { id: "jf-mat-9-12", courseId: "jee-foundation", chapterId: "mat-9-12", sourceCurriculumId: "cbse", order: 9 },
  { id: "jf-mat-9-13", courseId: "jee-foundation", chapterId: "mat-9-13", sourceCurriculumId: "cbse", order: 10 },
  
  // JEE Foundation - Mathematics Class 10
  { id: "jf-mat-10-1", courseId: "jee-foundation", chapterId: "mat-10-1", sourceCurriculumId: "cbse", order: 11 },
  { id: "jf-mat-10-2", courseId: "jee-foundation", chapterId: "mat-10-2", sourceCurriculumId: "cbse", order: 12 },
  { id: "jf-mat-10-3", courseId: "jee-foundation", chapterId: "mat-10-3", sourceCurriculumId: "cbse", order: 13 },
  { id: "jf-mat-10-4", courseId: "jee-foundation", chapterId: "mat-10-4", sourceCurriculumId: "cbse", order: 14 },
  { id: "jf-mat-10-5", courseId: "jee-foundation", chapterId: "mat-10-5", sourceCurriculumId: "cbse", order: 15 },
  { id: "jf-mat-10-6", courseId: "jee-foundation", chapterId: "mat-10-6", sourceCurriculumId: "cbse", order: 16 },
  { id: "jf-mat-10-7", courseId: "jee-foundation", chapterId: "mat-10-7", sourceCurriculumId: "cbse", order: 17 },
  { id: "jf-mat-10-8", courseId: "jee-foundation", chapterId: "mat-10-8", sourceCurriculumId: "cbse", order: 18 },
  { id: "jf-mat-10-12", courseId: "jee-foundation", chapterId: "mat-10-12", sourceCurriculumId: "cbse", order: 19 },
  { id: "jf-mat-10-13", courseId: "jee-foundation", chapterId: "mat-10-13", sourceCurriculumId: "cbse", order: 20 },
  
  // ===============================
  // NEET FOUNDATION - Class 9 & 10
  // ===============================
  
  // NEET Foundation - Mathematics Class 9
  { id: "nf-mat-9-1", courseId: "neet-foundation", chapterId: "mat-9-1", sourceCurriculumId: "cbse", order: 1 },
  { id: "nf-mat-9-2", courseId: "neet-foundation", chapterId: "mat-9-2", sourceCurriculumId: "cbse", order: 2 },
  { id: "nf-mat-9-13", courseId: "neet-foundation", chapterId: "mat-9-13", sourceCurriculumId: "cbse", order: 3 },
  { id: "nf-mat-9-14", courseId: "neet-foundation", chapterId: "mat-9-14", sourceCurriculumId: "cbse", order: 4 },
  
  // NEET Foundation - Mathematics Class 10
  { id: "nf-mat-10-1", courseId: "neet-foundation", chapterId: "mat-10-1", sourceCurriculumId: "cbse", order: 5 },
  { id: "nf-mat-10-14", courseId: "neet-foundation", chapterId: "mat-10-14", sourceCurriculumId: "cbse", order: 6 },
  { id: "nf-mat-10-15", courseId: "neet-foundation", chapterId: "mat-10-15", sourceCurriculumId: "cbse", order: 7 },
  
  // ===============================
  // MATHEMATICS OLYMPIAD
  // ===============================
  
  // Olympiad - Math Class 9
  { id: "om-mat-9-1", courseId: "olympiad-math", chapterId: "mat-9-1", sourceCurriculumId: "cbse", order: 1 },
  { id: "om-mat-9-2", courseId: "olympiad-math", chapterId: "mat-9-2", sourceCurriculumId: "cbse", order: 2 },
  { id: "om-mat-9-7", courseId: "olympiad-math", chapterId: "mat-9-7", sourceCurriculumId: "cbse", order: 3 },
  { id: "om-mat-9-10", courseId: "olympiad-math", chapterId: "mat-9-10", sourceCurriculumId: "cbse", order: 4 },
  
  // Olympiad - Math Class 10
  { id: "om-mat-10-1", courseId: "olympiad-math", chapterId: "mat-10-1", sourceCurriculumId: "cbse", order: 5 },
  { id: "om-mat-10-4", courseId: "olympiad-math", chapterId: "mat-10-4", sourceCurriculumId: "cbse", order: 6 },
  { id: "om-mat-10-5", courseId: "olympiad-math", chapterId: "mat-10-5", sourceCurriculumId: "cbse", order: 7 },
  { id: "om-mat-10-6", courseId: "olympiad-math", chapterId: "mat-10-6", sourceCurriculumId: "cbse", order: 8 },
  { id: "om-mat-10-15", courseId: "olympiad-math", chapterId: "mat-10-15", sourceCurriculumId: "cbse", order: 9 },
  
  // Olympiad - Math Class 11
  { id: "om-mat-11-4", courseId: "olympiad-math", chapterId: "mat-11-4", sourceCurriculumId: "cbse", order: 10 },
  { id: "om-mat-11-5", courseId: "olympiad-math", chapterId: "mat-11-5", sourceCurriculumId: "cbse", order: 11 },
  { id: "om-mat-11-7", courseId: "olympiad-math", chapterId: "mat-11-7", sourceCurriculumId: "cbse", order: 12 },
  { id: "om-mat-11-9", courseId: "olympiad-math", chapterId: "mat-11-9", sourceCurriculumId: "cbse", order: 13 },
  
  // ===============================
  // SCIENCE OLYMPIAD
  // ===============================
  
  // Science Olympiad - Mathematics Class 6
  { id: "so-mat-6-1", courseId: "olympiad-science", chapterId: "mat-6-1", sourceCurriculumId: "cbse", order: 1 },
  { id: "so-mat-6-3", courseId: "olympiad-science", chapterId: "mat-6-3", sourceCurriculumId: "cbse", order: 2 },
  { id: "so-mat-6-11", courseId: "olympiad-science", chapterId: "mat-6-11", sourceCurriculumId: "cbse", order: 3 },
  
  // Science Olympiad - Mathematics Class 7
  { id: "so-mat-7-1", courseId: "olympiad-science", chapterId: "mat-7-1", sourceCurriculumId: "cbse", order: 4 },
  { id: "so-mat-7-9", courseId: "olympiad-science", chapterId: "mat-7-9", sourceCurriculumId: "cbse", order: 5 },
  { id: "so-mat-7-12", courseId: "olympiad-science", chapterId: "mat-7-12", sourceCurriculumId: "cbse", order: 6 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get curriculum by ID
export const getCurriculumById = (id: string): Curriculum | undefined => {
  return curriculums.find(c => c.id === id);
};

// Get course by ID
export const getCourseById = (id: string): Course | undefined => {
  return courses.find(c => c.id === id);
};

// Get all chapters for a course (both mapped and course-owned)
export const getChaptersForCourse = (courseId: string): string[] => {
  const mappedChapterIds = courseChapterMappings
    .filter(m => m.courseId === courseId)
    .map(m => m.chapterId);
  
  const ownedChapterIds = courseOwnedChapters
    .filter(c => c.courseId === courseId)
    .map(c => c.id);
  
  return [...mappedChapterIds, ...ownedChapterIds];
};

// Get course-owned chapters for a course
export const getCourseOwnedChapters = (courseId: string): Chapter[] => {
  return courseOwnedChapters.filter(c => c.courseId === courseId);
};

// Check if a chapter is part of a course
export const isChapterInCourse = (chapterId: string, courseId: string): boolean => {
  const inMapping = courseChapterMappings.some(
    m => m.chapterId === chapterId && m.courseId === courseId
  );
  const isOwned = courseOwnedChapters.some(
    c => c.id === chapterId && c.courseId === courseId
  );
  return inMapping || isOwned;
};

// Get active curriculums
export const getActiveCurriculums = (): Curriculum[] => {
  return curriculums.filter(c => c.isActive);
};

// Get active courses
export const getActiveCourses = (): Course[] => {
  return courses.filter(c => c.isActive);
};

// Get published courses
export const getPublishedCourses = (): Course[] => {
  return courses.filter(c => c.status === 'published' && c.isActive);
};

// Get courses by type
export const getCoursesByType = (type: Course['courseType']): Course[] => {
  return courses.filter(c => c.courseType === type && c.isActive);
};

// Get mappings for a specific course
export const getMappingsForCourse = (courseId: string): CourseChapterMapping[] => {
  return courseChapterMappings.filter(m => m.courseId === courseId);
};

// Import CBSE data for chapter lookups
import { allCBSEChapters, CBSEChapter } from "./cbseMasterData";

// DisplayChapter for UI (includes source label)
export interface DisplayChapter {
  id: string;
  name: string;
  sourceLabel: string;
  subjectId: string;
  isCourseOwned: boolean;
}

// Get ALL chapters for a course (both mapped curriculum chapters + course-owned)
export const getAllCourseChapters = (courseId: string): DisplayChapter[] => {
  // Get course-owned chapters
  const ownedChapters: DisplayChapter[] = courseOwnedChapters
    .filter(c => c.courseId === courseId)
    .map(c => ({
      id: c.id,
      name: c.name,
      sourceLabel: "Course-Owned",
      subjectId: c.subjectId,
      isCourseOwned: true,
    }));
  
  // Get mapped curriculum chapters
  const mappings = courseChapterMappings.filter(m => m.courseId === courseId);
  const mappedChapters: DisplayChapter[] = mappings
    .map(mapping => {
      const chapter = allCBSEChapters.find(ch => ch.id === mapping.chapterId);
      if (!chapter) return null;
      
      // Determine class label
      const classLabels: Record<string, string> = {
        "1": "Class 6", "2": "Class 7", "3": "Class 8", "4": "Class 9",
        "5": "Class 10", "6": "Class 11", "7": "Class 12"
      };
      const classLabel = classLabels[chapter.classId] || `Class ${chapter.classId}`;
      
      return {
        id: chapter.id,
        name: chapter.name,
        sourceLabel: `CBSE ${classLabel}`,
        subjectId: chapter.subjectId,
        isCourseOwned: false,
      };
    })
    .filter((ch): ch is DisplayChapter => ch !== null);
  
  return [...ownedChapters, ...mappedChapters];
};

// Get chapters by curriculum (all chapters for a curriculum)
export const getChaptersByCurriculum = (curriculumId: string): CBSEChapter[] => {
  return allCBSEChapters.filter(ch => ch.curriculumId === curriculumId);
};

// Check if content is visible in a specific course
export const isVisibleInCourse = (visibleInCourses: string[], courseId: string): boolean => {
  return visibleInCourses.includes(courseId);
};

// Get chapter count for a specific course (owned + mapped)
export const getChapterCountForCourse = (courseId: string): number => {
  const ownedCount = courseOwnedChapters.filter(c => c.courseId === courseId).length;
  const mappedCount = courseChapterMappings.filter(m => m.courseId === courseId).length;
  return ownedCount + mappedCount;
};

// Get curriculum name by ID
export const getCurriculumName = (curriculumId: string): string => {
  const curriculum = curriculums.find(c => c.id === curriculumId);
  return curriculum?.name || curriculumId;
};

// Get class name by ID
export const getClassName = (classId: string): string => {
  const classMap: Record<string, string> = {
    "class-6": "Class 6",
    "class-7": "Class 7",
    "class-8": "Class 8",
    "class-9": "Class 9",
    "class-10": "Class 10",
    "class-11": "Class 11",
    "class-12": "Class 12",
    "1": "Class 6",
    "2": "Class 7",
    "3": "Class 8",
    "4": "Class 9",
    "5": "Class 10",
    "6": "Class 11",
    "7": "Class 12",
  };
  return classMap[classId] || classId;
};

// Subjects with their IDs and names (used across the platform)
export const subjects = [
  { id: "1", name: "Physics" },
  { id: "2", name: "Chemistry" },
  { id: "3", name: "Mathematics" },
  { id: "4", name: "Biology" },
  { id: "5", name: "History" },
  { id: "6", name: "Hindi" },
  { id: "7", name: "English" },
  { id: "8", name: "Geography" },
  { id: "9", name: "Sanskrit" },
];

// Get subject by ID
export const getSubjectById = (subjectId: string): { id: string; name: string } | undefined => {
  return subjects.find(s => s.id === subjectId);
};

// Get subjects for a course (only subjects that have chapters in the course)
export interface CourseSubject {
  id: string;
  name: string;
  chapterCount: number;
}

export const getSubjectsForCourse = (courseId: string): CourseSubject[] => {
  const allChapters = getAllCourseChapters(courseId);
  
  // Group by subject and count
  const subjectMap = new Map<string, number>();
  allChapters.forEach(chapter => {
    const count = subjectMap.get(chapter.subjectId) || 0;
    subjectMap.set(chapter.subjectId, count + 1);
  });
  
  // Convert to array with names
  return Array.from(subjectMap.entries())
    .map(([subjectId, count]) => {
      const subject = subjects.find(s => s.id === subjectId);
      return {
        id: subjectId,
        name: subject?.name || `Subject ${subjectId}`,
        chapterCount: count,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get chapters for a course filtered by subject
export const getChaptersForCourseBySubject = (courseId: string, subjectId: string): DisplayChapter[] => {
  const allChapters = getAllCourseChapters(courseId);
  return allChapters.filter(ch => ch.subjectId === subjectId);
};

// Stats
export const masterDataStats = {
  totalCurriculums: curriculums.filter(c => c.isActive).length,
  totalCourses: courses.filter(c => c.isActive).length,
  publishedCourses: courses.filter(c => c.status === 'published').length,
  draftCourses: courses.filter(c => c.status === 'draft').length,
  courseOwnedChapters: courseOwnedChapters.length,
  totalMappings: courseChapterMappings.length,
};
