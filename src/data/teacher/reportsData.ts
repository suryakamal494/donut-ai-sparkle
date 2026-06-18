// Reports Module — Mock Data
// Provides batch-level summaries, chapter analytics, and exam history

import { batchInfoMap } from "./examResults";
import { teacherExams } from "./exams";
import { mockGrandTests } from "@/data/examsData";
import {
  computeStudentSegregation,
  type Trend,
  type Band,
  type AssessmentType,
  type ResponseRecord,
  type SegregationFlag,
  LOW_DATA_THRESHOLD,
} from "@/lib/performanceIndex";

// ── Seeded PRNG (Park-Miller LCG + djb2 hash) ──

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ── Types ──

export interface BatchReportCard {
  batchId: string;
  batchName: string;
  className: string;
  totalExamsConducted: number;
  classAverage: number;
  previousAverage: number; // for trend
  trend: "up" | "down" | "stable";
  totalStudents: number;
  atRiskCount: number;
}

export interface ChapterReportCard {
  chapterId: string;
  chapterName: string;
  subject: string;
  examsCovering: number; // how many exams tested this chapter
  avgSuccessRate: number;
  topicCount: number;
  weakTopicCount: number;
  status: "strong" | "moderate" | "weak";
}

export interface BatchExamEntry {
  examId: string;
  examName: string;
  date: string;
  totalMarks: number;
  classAverage: number;
  highestScore: number;
  totalStudents: number;
  passPercentage: number;
}

export interface ChapterTopicAnalysis {
  topicId: string;
  topicName: string;
  questionsAsked: number;
  avgSuccessRate: number | null; // null = asked but nobody attempted
  lowData?: boolean;             // attempts <= LOW_DATA_THRESHOLD — fragile
  status: "strong" | "moderate" | "weak";
  examsAppeared: number;
}

export interface ChapterStudentEntry {
  id: string;
  studentName: string;
  rollNumber: string;
  asked: number;                 // 0 => absent (excluded from bands)
  attempted: boolean;            // false when asked > 0 but attempted 0
  examsAttempted: number;
  masteryScore: number | null;   // band decider + sort key; null for absent/not-attempted
  band: Band;
  testMastery: number | null;
  practiceMastery: number | null;
  dppEffort: number | null;
  pacing: number | null;
  consistency: number | null;
  trend: Trend;
  flags: SegregationFlag[];      // max 2, ordered by FLAG_PRIORITY
}

export interface ChapterStudentBucket {
  key: Band;
  label: string;
  count: number;
  students: ChapterStudentEntry[];
}

export interface ChapterDetailReport {
  chapterId: string;
  chapterName: string;
  subject: string;
  batchId: string;
  batchName: string;
  overallSuccessRate: number;
  totalQuestionsAsked: number;
  examsCovering: number;
  topics: ChapterTopicAnalysis[];
  examBreakdown: ChapterExamBreakdown[];
  studentBuckets: ChapterStudentBucket[];
}

export interface ChapterExamBreakdown {
  examId: string;
  examName: string;
  date: string;
  questionsFromChapter: number;
  avgSuccessRate: number;
}

// ── Data Generation ──

const generateBatchReports = (): BatchReportCard[] => {
  const batches = Object.entries(batchInfoMap);
  return batches.map(([batchId, info]) => {
    const rand = seededRandom(hashString(batchId + "-batch-report"));
    const batchExams = teacherExams.filter(
      (e) => e.batchIds.includes(batchId) && e.status === "completed"
    );
    const classAvg = 45 + Math.floor(rand() * 30);
    const prevAvg = classAvg + (rand() > 0.5 ? -5 : 5) * Math.round(rand() * 3);
    return {
      batchId,
      batchName: info.name,
      className: info.className,
      totalExamsConducted: batchExams.length,
      classAverage: classAvg,
      previousAverage: prevAvg,
      trend: classAvg > prevAvg ? "up" : classAvg < prevAvg ? "down" : "stable",
      totalStudents: 20 + Math.floor(rand() * 15),
      atRiskCount: Math.floor(rand() * 6),
    };
  });
};

const physicsChapters = [
  { id: "ch-kinematics", name: "Kinematics", topics: ["Displacement", "Velocity", "Acceleration", "Projectile Motion", "Relative Motion"] },
  { id: "ch-laws-of-motion", name: "Laws of Motion", topics: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Friction", "Circular Motion"] },
  { id: "ch-work-energy", name: "Work, Energy & Power", topics: ["Work", "Kinetic Energy", "Potential Energy", "Conservation of Energy", "Power"] },
  { id: "ch-gravitation", name: "Gravitation", topics: ["Universal Law", "Gravitational Field", "Orbital Velocity", "Escape Velocity", "Satellites"] },
  { id: "ch-optics", name: "Optics", topics: ["Reflection", "Refraction", "Lenses", "Mirrors", "Wave Optics", "Interference", "Diffraction"] },
  { id: "ch-thermodynamics", name: "Thermodynamics", topics: ["Zeroth Law", "First Law", "Second Law", "Entropy", "Heat Engines"] },
  { id: "ch-waves", name: "Waves & Sound", topics: ["Wave Motion", "Sound Waves", "Doppler Effect", "Superposition", "Standing Waves", "Beats"] },
  { id: "ch-electrostatics", name: "Electrostatics", topics: ["Coulomb's Law", "Electric Field", "Electric Potential", "Capacitance", "Gauss's Law"] },
  { id: "ch-current-electricity", name: "Current Electricity", topics: ["Ohm's Law", "Kirchhoff's Laws", "Wheatstone Bridge", "Potentiometer", "EMF"] },
  { id: "ch-magnetism", name: "Magnetism", topics: ["Magnetic Field", "Biot-Savart Law", "Ampere's Law", "Solenoid", "Magnetic Materials"] },
];

const generateChapterReports = (batchId: string): ChapterReportCard[] => {
  const rand = seededRandom(hashString(batchId + "-chapter-reports"));
  return physicsChapters.map((ch) => {
    const avgSuccess = 25 + Math.floor(rand() * 55);
    const weakCount = ch.topics.filter(() => rand() < 0.3).length;
    return {
      chapterId: ch.id,
      chapterName: ch.name,
      subject: "Physics",
      examsCovering: 1 + Math.floor(rand() * 4),
      avgSuccessRate: avgSuccess,
      topicCount: ch.topics.length,
      weakTopicCount: weakCount,
      status: avgSuccess >= 75 ? "strong" : avgSuccess >= 50 ? "moderate" : "weak",
    };
  });
};

const generateBatchExams = (batchId: string): BatchExamEntry[] => {
  const rand = seededRandom(hashString(batchId + "-batch-exams"));
  const batchExams = teacherExams.filter(
    (e) => e.batchIds.includes(batchId) && e.status === "completed"
  );
  return batchExams.map((exam) => ({
    examId: exam.id,
    examName: exam.name,
    date: exam.updatedAt,
    totalMarks: exam.totalMarks,
    classAverage: Math.round(exam.totalMarks * (0.4 + rand() * 0.35)),
    highestScore: Math.round(exam.totalMarks * (0.75 + rand() * 0.2)),
    totalStudents: 20 + Math.floor(rand() * 10),
    passPercentage: 30 + Math.floor(rand() * 60),
  }));
};

// ── Response Matrix (single source of truth for the chapter report) ──

const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const pct = (correct: number, attempted: number): number | null =>
  attempted === 0 ? null : Math.round((correct / attempted) * 100);

interface ChapterAssessment {
  examId: string;
  examName: string;
  date: string;
  type: AssessmentType;
  timed: boolean;
  qPerTopic: number;
  coverage: number; // fraction of topics covered
}

interface MatrixStudent {
  id: string;
  studentName: string;
  rollNumber: string;
  ability: number;
  absent: boolean;        // never sat any assessment
  neverAttempts: boolean; // sat assessments but attempted nothing
}

export interface ResponseMatrix {
  records: ResponseRecord[];
  students: MatrixStudent[];
  assessments: ChapterAssessment[];
  topics: { topicId: string; topicName: string; difficulty: number }[];
}

const ASSESSMENT_BLUEPRINT: Omit<ChapterAssessment, "examId" | "examName" | "date">[] = [
  { type: "chapterTest", timed: true, qPerTopic: 3, coverage: 1.0 },
  { type: "classTest", timed: true, qPerTopic: 2, coverage: 0.7 },
  { type: "classTest", timed: true, qPerTopic: 2, coverage: 0.6 },
  { type: "dpp", timed: false, qPerTopic: 2, coverage: 0.4 },
  { type: "dpp", timed: false, qPerTopic: 2, coverage: 0.5 },
  { type: "dpp", timed: false, qPerTopic: 1, coverage: 0.5 },
];

const STUDENT_NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Ananya Singh", "Vikram Reddy",
  "Sneha Iyer", "Arjun Nair", "Kavya Menon", "Rahul Das", "Meera Joshi",
  "Siddharth Kumar", "Divya Rao", "Aditya Verma", "Ishita Banerjee", "Karthik Subramaniam",
  "Neha Agarwal", "Varun Mishra", "Riya Chauhan", "Harsh Pandey", "Pooja Deshmukh",
  "Amit Tiwari", "Simran Kaur", "Nikhil Saxena", "Tanvi Kulkarni", "Deepak Yadav",
];

/**
 * Deterministic response matrix for a (chapter, batch). Every value drawn from
 * one seeded stream in fixed order (assessment → topic → question → student).
 */
export const buildResponseMatrix = (chapterId: string, batchId: string): ResponseMatrix => {
  const chapter = physicsChapters.find((c) => c.id === chapterId)!;
  const rand = seededRandom(hashString(`${chapterId}-${batchId}-matrix`));

  // Latent topic difficulty (fixed order).
  const topics = chapter.topics.map((name, i) => ({
    topicId: `${chapterId}-t${i}`,
    topicName: name,
    difficulty: 0.2 + rand() * 0.7,
  }));

  // Students with latent ability. Last student = absent, second-last = never attempts.
  const count = 20 + Math.floor(rand() * 5);
  const students: MatrixStudent[] = STUDENT_NAMES.slice(0, count).map((studentName, i) => ({
    id: `${chapterId}-s${i}`,
    studentName,
    rollNumber: `R${String(101 + i)}`,
    ability: 0.2 + rand() * 0.7,
    absent: i === count - 1,
    neverAttempts: i === count - 2,
  }));

  // Assessments (chronological — oldest first), names/dates deterministic.
  let classTestN = 0;
  let dppN = 0;
  const assessments: ChapterAssessment[] = ASSESSMENT_BLUEPRINT.map((b, i) => {
    const examName =
      b.type === "chapterTest" ? `${chapter.name} — Chapter Test` :
      b.type === "classTest" ? `${chapter.name} — Class Test ${++classTestN}` :
      `${chapter.name} — DPP ${++dppN}`;
    const daysBack = (ASSESSMENT_BLUEPRINT.length - i) * 9;
    return {
      examId: `${chapterId}-${b.type}-${i}`,
      examName,
      date: new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10),
      ...b,
    };
  });

  // Generate every (assessment → topic → question → student) record in order.
  const records: ResponseRecord[] = [];
  for (const a of assessments) {
    for (const topic of topics) {
      const covered = topic.difficulty <= a.coverage + 0.5; // deterministic coverage gate
      if (!covered && topics.indexOf(topic) % 2 === 0) continue;
      for (let q = 0; q < a.qPerTopic; q++) {
        const questionId = `${a.examId}-${topic.topicId}-q${q}`;
        for (const s of students) {
          if (s.absent) continue; // no records → absent
          const rAttempt = rand();
          const rCorrect = rand();
          const rTime = rand();
          // Realistic engagement: students attempt most questions (0.62–0.91),
          // so mastery (correct/asked) tracks accuracy without heavy-skip distortion.
          const pAttempt = clampNum(0.55 + s.ability * 0.4, 0, 1);
          const attempted = s.neverAttempts ? false : rAttempt < pAttempt;
          const pCorrect = sigmoid((s.ability - topic.difficulty) * 5);
          const correct = attempted && rCorrect < pCorrect;
          const timeRatio = a.timed && attempted
            ? clampNum(0.8 - s.ability * 0.4 + (rTime - 0.5) * 0.3, 0.1, 1)
            : undefined;
          records.push({
            examId: a.examId,
            assessmentType: a.type,
            chapterId,
            topicId: topic.topicId,
            questionId,
            studentId: s.id,
            attempted,
            correct,
            timeRatio,
          });
        }
      }
    }
  }

  return { records, students, assessments, topics };
};

const generateChapterDetail = (chapterId: string, batchId: string): ChapterDetailReport => {
  const chapter = physicsChapters.find((c) => c.id === chapterId)!;
  const batchInfo = batchInfoMap[batchId];
  const { records, students, assessments, topics: matrixTopics } = buildResponseMatrix(chapterId, batchId);

  // ── A. Topic Heatmap (pooled correct/attempted per topic) ──
  const topics: ChapterTopicAnalysis[] = matrixTopics
    .map((t) => {
      const recs = records.filter((r) => r.topicId === t.topicId);
      const attempted = recs.filter((r) => r.attempted).length;
      const correct = recs.filter((r) => r.attempted && r.correct).length;
      const questionsAsked = new Set(recs.map((r) => r.questionId)).size;
      const examsAppeared = new Set(recs.map((r) => r.examId)).size;
      const avgSuccessRate = pct(correct, attempted);
      const status: "strong" | "moderate" | "weak" =
        avgSuccessRate === null ? "weak" : avgSuccessRate >= 65 ? "strong" : avgSuccessRate >= 40 ? "moderate" : "weak";
      return {
        topicId: t.topicId,
        topicName: t.topicName,
        questionsAsked,
        avgSuccessRate,
        lowData: attempted <= LOW_DATA_THRESHOLD,
        status,
        examsAppeared,
      };
    })
    .filter((t) => t.questionsAsked > 0); // hide never-tested topics

  // ── Overall (pooled across ALL topics) ──
  const totalAttempted = records.filter((r) => r.attempted).length;
  const totalCorrect = records.filter((r) => r.attempted && r.correct).length;
  const overallSuccessRate = pct(totalCorrect, totalAttempted) ?? 0;
  const totalQuestionsAsked = new Set(records.map((r) => r.questionId)).size;

  // ── Per-assessment breakdown ──
  const examBreakdown: ChapterExamBreakdown[] = assessments.map((a) => {
    const recs = records.filter((r) => r.examId === a.examId);
    const att = recs.filter((r) => r.attempted).length;
    const cor = recs.filter((r) => r.attempted && r.correct).length;
    return {
      examId: a.examId,
      examName: a.examName,
      date: a.date,
      questionsFromChapter: new Set(recs.map((r) => r.questionId)).size,
      avgSuccessRate: pct(cor, att) ?? 0,
    };
  });

  // ── B. Student Segregation (mastery band + flags) ──
  const allStudents: ChapterStudentEntry[] = students.map((s) => {
    const seg = computeStudentSegregation(records.filter((r) => r.studentId === s.id));
    return {
      id: s.id,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
      asked: seg.asked,
      attempted: seg.attempted,
      examsAttempted: seg.examsAttempted,
      masteryScore: seg.masteryScore,
      band: seg.band,
      testMastery: seg.testMastery,
      practiceMastery: seg.practiceMastery,
      dppEffort: seg.dppEffort,
      pacing: seg.pacing,
      consistency: seg.consistency,
      trend: seg.trend,
      flags: seg.flags,
    };
  });

  const byBand = (band: Band) => allStudents.filter((s) => s.band === band);
  const studentBuckets: ChapterStudentBucket[] = [
    { key: "mastery", label: "Mastery Ready", count: byBand("mastery").length, students: byBand("mastery") },
    { key: "stable", label: "Stable Progress", count: byBand("stable").length, students: byBand("stable") },
    { key: "reinforcement", label: "Reinforcement Needed", count: byBand("reinforcement").length, students: byBand("reinforcement") },
    { key: "risk", label: "Foundational Risk", count: byBand("risk").length, students: byBand("risk") },
    { key: "notAttempted", label: "Not Attempted", count: byBand("notAttempted").length, students: byBand("notAttempted") },
    { key: "absent", label: "Absent", count: byBand("absent").length, students: byBand("absent") },
  ];

  // Dev reconciliation assertion (per scope).
  const bucketTotal = studentBuckets.reduce((sum, b) => sum + b.count, 0);
  console.assert(bucketTotal === students.length, "Bucket counts do not reconcile", { bucketTotal, students: students.length });

  return {
    chapterId,
    chapterName: chapter.name,
    subject: "Physics",
    batchId,
    batchName: batchInfo?.name || batchId,
    overallSuccessRate,
    totalQuestionsAsked,
    examsCovering: examBreakdown.length,
    topics,
    examBreakdown,
    studentBuckets,
  };
};

// ── Institute Test Types ──

export interface InstituteTestEntry {
  examId: string;
  examName: string;
  date: string;
  pattern: "jee_main" | "jee_advanced" | "neet";
  source: "grand_test";
  totalMarks: number;
  subjectMaxMarks: number;
  subjectAvgScore: number;
  subjectHighest: number;
  passPercentage: number;
  participantCount: number;
}

// ── Institute Test Generator ──

const generateInstituteTests = (_batchId: string, teacherSubject: string): InstituteTestEntry[] => {
  const rand = seededRandom(hashString(_batchId + "-" + teacherSubject + "-inst-tests"));
  const completed = mockGrandTests.filter(
    (gt) => gt.status === "completed" && gt.subjects.includes(teacherSubject)
  );

  return completed.map((gt) => {
    const subjectCount = gt.subjects.length;
    const subjectMax = Math.round(gt.totalMarks / subjectCount);
    const subjectAvg = Math.round(subjectMax * (0.35 + rand() * 0.35));
    const subjectHighest = Math.round(subjectMax * (0.75 + rand() * 0.2));
    return {
      examId: gt.id,
      examName: gt.name,
      date: gt.completedDate || gt.scheduledDate || gt.createdAt,
      pattern: gt.pattern,
      source: "grand_test" as const,
      totalMarks: gt.totalMarks,
      subjectMaxMarks: subjectMax,
      subjectAvgScore: subjectAvg,
      subjectHighest: Math.min(subjectHighest, subjectMax),
      passPercentage: 30 + Math.floor(rand() * 60),
      participantCount: gt.participantCount || 0,
    };
  });
};




// ── Batch Health Summary Types ──

export interface BatchHealthSummary {
  generatedAt: string;
  overallTrend: 'improving' | 'declining' | 'stable';
  recentExamAvg: number;
  priorityTopics: {
    topic: string;
    chapter: string;
    chapterId: string;
    successRate: number;
    trend: 'up' | 'down' | 'flat';
    examCount: number;
  }[];
  studentsToCheckIn: {
    studentId: string;
    studentName: string;
    reason: string;
    avgPercentage: number;
    trend: 'up' | 'down' | 'flat';
  }[];
  suggestedFocus: string;
  atRiskCount: number;
  weakTopicCount: number;
}

/**
 * Generate mock batch health summary from existing batch data.
 * In production, replaced by AI edge function `batch-health-summary`.
 * See docs/03-teacher/reports-overview.md for prompt specification.
 */
export function generateMockBatchHealth(
  chapters: ChapterReportCard[],
  examHistory: BatchExamEntry[],
  studentRoster: { studentName: string; studentId: string; avgPercentage: number; trend: string; piBucket: string; secondaryTags: string[] }[]
): BatchHealthSummary {
  // Priority topics: weak chapters with topics needing attention
  const weakChapters = chapters
    .filter(ch => ch.status === 'weak' || ch.avgSuccessRate < 50)
    .sort((a, b) => a.avgSuccessRate - b.avgSuccessRate)
    .slice(0, 3);

  const priorityTopics = weakChapters.map(ch => ({
    topic: ch.chapterName === "Thermodynamics" ? "Second Law" :
           ch.chapterName === "Waves & Sound" ? "Doppler Effect" :
           ch.chapterName === "Optics" ? "Wave Optics" :
           ch.chapterName === "Gravitation" ? "Escape Velocity" :
           ch.chapterName,
    chapter: ch.chapterName,
    chapterId: ch.chapterId,
    successRate: ch.avgSuccessRate,
    trend: (ch.avgSuccessRate < 35 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
    examCount: ch.examsCovering,
  }));

  // Students to check in: at-risk or declining
  const atRiskStudents = studentRoster
    .filter(s => s.piBucket === 'risk' || s.piBucket === 'reinforcement')
    .sort((a, b) => a.avgPercentage - b.avgPercentage)
    .slice(0, 3);

  const studentsToCheckIn = atRiskStudents.map(s => ({
    studentId: s.studentId,
    studentName: s.studentName,
    reason: s.piBucket === 'risk'
      ? `At risk — ${s.avgPercentage}% average`
      : s.secondaryTags.includes('declining')
      ? 'Declining performance over recent exams'
      : s.secondaryTags.includes('plateaued')
      ? 'Plateaued — no improvement in 3+ exams'
      : 'Needs reinforcement',
    avgPercentage: s.avgPercentage,
    trend: (s.trend === 'up' ? 'up' : s.trend === 'down' ? 'down' : 'flat') as 'up' | 'down' | 'flat',
  }));

  // Recent exam average
  const recentExams = examHistory.slice(0, 5);
  const recentExamAvg = recentExams.length > 0
    ? Math.round(recentExams.reduce((s, e) => s + Math.round((e.classAverage / e.totalMarks) * 100), 0) / recentExams.length)
    : 0;

  // Overall trend
  const atRiskCount = studentRoster.filter(s => s.piBucket === 'risk').length;
  const weakTopicCount = chapters.filter(ch => ch.status === 'weak').length;

  const overallTrend: 'improving' | 'declining' | 'stable' =
    atRiskCount > 5 ? 'declining' : atRiskCount <= 2 && weakTopicCount <= 1 ? 'improving' : 'stable';

  // Suggested focus
  const focusTopic = priorityTopics[0];
  const suggestedFocus = focusTopic
    ? `Review ${focusTopic.topic} in ${focusTopic.chapter} — ${atRiskStudents.length} students consistently below 35% on this area.`
    : recentExamAvg < 50
    ? `Class average is ${recentExamAvg}%. Consider a revision session on the weakest areas before the next assessment.`
    : `Class is performing well overall (${recentExamAvg}% avg). Focus on pushing reinforcement-band students into stable progress.`;

  return {
    generatedAt: new Date().toISOString(),
    overallTrend,
    recentExamAvg,
    priorityTopics,
    studentsToCheckIn,
    suggestedFocus,
    atRiskCount,
    weakTopicCount,
  };
}

// ── Caches ──

const chapterReportsCache = new Map<string, ChapterReportCard[]>();
const batchExamsCache = new Map<string, BatchExamEntry[]>();
const chapterDetailCache = new Map<string, ChapterDetailReport>();
const instituteTestsCache = new Map<string, InstituteTestEntry[]>();
const batchHealthCache = new Map<string, BatchHealthSummary>();

// ── Exports ──

export const batchReports = generateBatchReports();

export const getBatchChapters = (batchId: string): ChapterReportCard[] => {
  if (!chapterReportsCache.has(batchId)) {
    chapterReportsCache.set(batchId, generateChapterReports(batchId));
  }
  return chapterReportsCache.get(batchId)!;
};

export const getBatchExamHistory = (batchId: string): BatchExamEntry[] => {
  if (!batchExamsCache.has(batchId)) {
    batchExamsCache.set(batchId, generateBatchExams(batchId));
  }
  return batchExamsCache.get(batchId)!;
};

export const getChapterDetail = (chapterId: string, batchId: string): ChapterDetailReport => {
  const key = `${chapterId}__${batchId}`;
  if (!chapterDetailCache.has(key)) {
    chapterDetailCache.set(key, generateChapterDetail(chapterId, batchId));
  }
  return chapterDetailCache.get(key)!;
};

export const getBatchInstituteTests = (batchId: string, teacherSubject: string): InstituteTestEntry[] => {
  const key = `${batchId}__${teacherSubject}`;
  if (!instituteTestsCache.has(key)) {
    instituteTestsCache.set(key, generateInstituteTests(batchId, teacherSubject));
  }
  return instituteTestsCache.get(key)!;
};

export const getBatchHealth = (
  batchId: string,
  chapters: ChapterReportCard[],
  examHistory: BatchExamEntry[],
  studentRoster: { studentName: string; studentId: string; avgPercentage: number; trend: string; piBucket: string; secondaryTags: string[] }[]
): BatchHealthSummary => {
  if (!batchHealthCache.has(batchId)) {
    batchHealthCache.set(batchId, generateMockBatchHealth(chapters, examHistory, studentRoster));
  }
  return batchHealthCache.get(batchId)!;
};
