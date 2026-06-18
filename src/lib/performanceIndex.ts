// Performance Index (PI) — Advanced Bucketing Logic
// PI = (0.50 × Accuracy) + (0.20 × Consistency) + (0.15 × Time Efficiency) + (0.15 × Attempt Rate)

export type SecondaryTag = "improving" | "declining" | "plateaued" | "inconsistent" | "speed-issue" | "low-attempt";
export type Trend = "up" | "down" | "flat";

export interface ExamHistoryEntry {
  examId: string;
  percentage: number;
  date: string;
  timeEfficiency: number; // 0-100
  attemptRate: number;    // 0-100
}

export interface PIResult {
  performanceIndex: number;
  accuracy: number;
  consistency: number;
  timeEfficiency: number;
  attemptRate: number;
  trend: Trend;
  secondaryTags: SecondaryTag[];
  examHistory: ExamHistoryEntry[];
}

/**
 * Calculate standard deviation of an array of numbers
 */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate linear regression slope for trend detection
 * Returns slope normalized per exam (positive = improving)
 */
function linearSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Convert consistency (inverse variance) to a 0-100 score
 * Low std dev = high consistency
 */
function consistencyScore(examPercentages: number[]): number {
  if (examPercentages.length < 2) return 75; // default for single exam
  const sd = stdDev(examPercentages);
  // Map: sd=0 → 100, sd=30+ → 0
  return Math.max(0, Math.min(100, Math.round(100 - (sd / 30) * 100)));
}

/**
 * Calculate the Performance Index from exam history
 */
export function calculatePI(examHistory: ExamHistoryEntry[]): {
  performanceIndex: number;
  accuracy: number;
  consistency: number;
  avgTimeEfficiency: number;
  avgAttemptRate: number;
} {
  if (examHistory.length === 0) {
    return { performanceIndex: 0, accuracy: 0, consistency: 0, avgTimeEfficiency: 0, avgAttemptRate: 0 };
  }

  const percentages = examHistory.map(e => e.percentage);
  const accuracy = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  const consistency = consistencyScore(percentages);
  const avgTimeEfficiency = Math.round(examHistory.reduce((s, e) => s + e.timeEfficiency, 0) / examHistory.length);
  const avgAttemptRate = Math.round(examHistory.reduce((s, e) => s + e.attemptRate, 0) / examHistory.length);

  const pi = Math.round(
    0.50 * accuracy +
    0.20 * consistency +
    0.15 * avgTimeEfficiency +
    0.15 * avgAttemptRate
  );

  return {
    performanceIndex: Math.max(0, Math.min(100, pi)),
    accuracy,
    consistency,
    avgTimeEfficiency,
    avgAttemptRate,
  };
}

/**
 * Detect trend direction from exam history (chronological order)
 */
export function detectTrend(examHistory: ExamHistoryEntry[]): Trend {
  if (examHistory.length < 2) return "flat";
  const percentages = examHistory.map(e => e.percentage);
  const slope = linearSlope(percentages);
  // Threshold: slope > 2 per exam = improving, < -2 = declining
  if (slope > 2) return "up";
  if (slope < -2) return "down";
  return "flat";
}

/**
 * Detect if student has plateaued
 * 3+ exams, std dev < 5, slope ≈ 0
 */
export function detectPlateau(examHistory: ExamHistoryEntry[]): boolean {
  if (examHistory.length < 3) return false;
  const recent = examHistory.slice(-3).map(e => e.percentage);
  const sd = stdDev(recent);
  const slope = Math.abs(linearSlope(recent));
  return sd < 5 && slope < 1.5;
}

/**
 * Assign secondary behavioral tags based on exam history and computed metrics
 */
export function assignSecondaryTags(
  examHistory: ExamHistoryEntry[],
  trend: Trend,
  avgTimeEfficiency: number,
  avgAttemptRate: number
): SecondaryTag[] {
  const tags: SecondaryTag[] = [];

  // Trend-based tags
  if (trend === "up" && examHistory.length >= 2) tags.push("improving");
  if (trend === "down" && examHistory.length >= 2) tags.push("declining");

  // Plateau detection (overrides flat trend)
  if (detectPlateau(examHistory)) {
    tags.push("plateaued");
  }

  // Inconsistency: high variance
  if (examHistory.length >= 3) {
    const sd = stdDev(examHistory.map(e => e.percentage));
    if (sd > 15) tags.push("inconsistent");
  }

  // Speed issue: accuracy decent but time usage poor
  if (avgTimeEfficiency < 40) tags.push("speed-issue");

  // Low attempt rate
  if (avgAttemptRate < 60) tags.push("low-attempt");

  // Return max 2 most relevant tags
  return tags.slice(0, 2);
}

/**
 * Full PI computation pipeline for a student
 */
export function computeStudentPI(examHistory: ExamHistoryEntry[]): PIResult {
  const { performanceIndex, accuracy, consistency, avgTimeEfficiency, avgAttemptRate } = calculatePI(examHistory);
  const trend = detectTrend(examHistory);
  const secondaryTags = assignSecondaryTags(examHistory, trend, avgTimeEfficiency, avgAttemptRate);

  return {
    performanceIndex,
    accuracy,
    consistency,
    timeEfficiency: avgTimeEfficiency,
    attemptRate: avgAttemptRate,
    trend,
    secondaryTags,
    examHistory,
  };
}

// ============================================================================
// Student Segregation Module (v4) — Mastery Band + Diagnostic Flags
// ----------------------------------------------------------------------------
// The blended Performance Index above is retained only for the legacy batch
// roster / student-profile generators. The chapter report now derives every
// number from a flat response matrix: one mastery score decides the band, and
// every other signal becomes a flag that names the intervention.
// See docs/03-teacher/chapter-report-calculations.md for the full contract.
// ============================================================================

export type AssessmentType = "chapterTest" | "classTest" | "dpp";

/** A single (student × question) outcome — the source of truth for all metrics. */
export interface ResponseRecord {
  examId: string;
  assessmentType: AssessmentType;
  chapterId: string;
  topicId: string;
  questionId: string;
  studentId: string;
  attempted: boolean;
  correct: boolean;      // only meaningful when attempted === true
  timeRatio?: number;    // timeUsed / allotted; absent on untimed assessments
}

/** Bucket / band keys. The first four are the actionable homework bands. */
export type Band =
  | "mastery"
  | "stable"
  | "reinforcement"
  | "risk"
  | "notAttempted"   // asked > 0 but attempted 0
  | "absent";        // asked === 0 in scope

// Tunable placeholders — recalibrate against a real class distribution.
export const STAKES_WEIGHT: Record<AssessmentType, number> = { chapterTest: 1.0, classTest: 0.6, dpp: 0.3 };
export const LOW_DATA_THRESHOLD = 2;
export const MIN_ATTEMPTS_PER_EXAM = 1;
export const DIFFICULTY_WEIGHTING = false;

export const FLAG_PRIORITY = [
  "cracks-under-pressure",
  "disengaged",
  "conceptual-gap",
  "declining",
  "topic-weakness",
  "pacing",
  "inconsistent",
  "plateaued",
  "improving",
] as const;

export type SegregationFlag = (typeof FLAG_PRIORITY)[number];

export interface StudentSegregation {
  asked: number;
  attempted: boolean;        // false when asked > 0 but attempted 0
  examsAttempted: number;
  masteryScore: number | null;   // band decider + sort key; null for absent/not-attempted
  band: Band;
  testMastery: number | null;
  practiceMastery: number | null;
  dppEffort: number | null;
  pacing: number | null;
  consistency: number | null;
  trend: Trend;
  flags: SegregationFlag[];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Map a 0–100 mastery score to its band (inclusive lower bounds). */
export function bandFromMastery(mastery: number): Band {
  if (mastery >= 75) return "mastery";
  if (mastery >= 50) return "stable";
  if (mastery >= 35) return "reinforcement";
  return "risk";
}

/** Stakes-weighted pooled correct/asked across a set of records (0–100, or null). */
function weightedMastery(records: ResponseRecord[]): number | null {
  let wCorrect = 0;
  let wAsked = 0;
  for (const r of records) {
    const w = STAKES_WEIGHT[r.assessmentType];
    wAsked += w;
    if (r.attempted && r.correct) wCorrect += w;
  }
  return wAsked === 0 ? null : Math.round((wCorrect / wAsked) * 100);
}

/** Per-assessment accuracy (round(correct/attempted×100)), in record order. */
function perTestAccuracy(records: ResponseRecord[]): number[] {
  const byExam = new Map<string, { attempted: number; correct: number }>();
  for (const r of records) {
    if (!byExam.has(r.examId)) byExam.set(r.examId, { attempted: 0, correct: 0 });
    const e = byExam.get(r.examId)!;
    if (r.attempted) {
      e.attempted += 1;
      if (r.correct) e.correct += 1;
    }
  }
  const out: number[] = [];
  for (const e of byExam.values()) {
    if (e.attempted >= MIN_ATTEMPTS_PER_EXAM) out.push(Math.round((e.correct / e.attempted) * 100));
  }
  return out;
}

/**
 * Full segregation for ONE student's in-scope records.
 * Pass an empty array for a student with no assessments in scope → "absent".
 */
export function computeStudentSegregation(records: ResponseRecord[]): StudentSegregation {
  const empty: StudentSegregation = {
    asked: 0, attempted: false, examsAttempted: 0, masteryScore: null, band: "absent",
    testMastery: null, practiceMastery: null, dppEffort: null, pacing: null,
    consistency: null, trend: "flat", flags: [],
  };
  if (records.length === 0) return empty;

  const asked = records.length;
  const attemptedRecords = records.filter((r) => r.attempted);
  const examsAttempted = new Set(attemptedRecords.map((r) => r.examId)).size;

  if (attemptedRecords.length === 0) {
    return { ...empty, asked, examsAttempted: 0, band: "notAttempted" };
  }

  const masteryScore = weightedMastery(records)!;
  const band = bandFromMastery(masteryScore);

  // Diagnostic signals (feed flags, never the band)
  const graded = records.filter((r) => r.assessmentType !== "dpp");
  const dpps = records.filter((r) => r.assessmentType === "dpp");
  const testMastery = graded.length ? weightedMastery(graded) : null;
  const practiceMastery = dpps.length
    ? Math.round((dpps.filter((r) => r.attempted && r.correct).length / dpps.length) * 100)
    : null;
  const dppEffort = dpps.length
    ? Math.round((dpps.filter((r) => r.attempted).length / dpps.length) * 100)
    : null;

  const timedCorrect = records.filter((r) => r.attempted && r.correct && typeof r.timeRatio === "number");
  const pacing = timedCorrect.length
    ? clamp(Math.round(100 - (timedCorrect.reduce((s, r) => s + (r.timeRatio as number), 0) / timedCorrect.length) * 100), 0, 100)
    : null;

  const accuracies = perTestAccuracy(records);
  const consistency = accuracies.length < 2 ? null : clamp(Math.round(100 - (stdDev(accuracies) / 30) * 100), 0, 100);
  const slope = linearSlope(accuracies);
  const trend: Trend = accuracies.length < 2 ? "flat" : slope > 2 ? "up" : slope < -2 ? "down" : "flat";

  // Flags
  const flags: SegregationFlag[] = [];
  if (testMastery !== null && practiceMastery !== null && practiceMastery - testMastery >= 20) flags.push("cracks-under-pressure");
  if (dppEffort !== null && dppEffort < 60) flags.push("disengaged");
  if (testMastery !== null && practiceMastery !== null && practiceMastery < 50 && testMastery < 50) flags.push("conceptual-gap");
  if (trend === "down") flags.push("declining");
  if (pacing !== null && pacing < 40) flags.push("pacing");
  if (accuracies.length >= 3 && stdDev(accuracies) > 15) flags.push("inconsistent");
  if (accuracies.length >= 3 && stdDev(accuracies) < 5 && Math.abs(slope) < 1.5 && band !== "mastery") flags.push("plateaued");
  if (trend === "up") flags.push("improving");

  const ordered = flags
    .sort((a, b) => FLAG_PRIORITY.indexOf(a) - FLAG_PRIORITY.indexOf(b))
    .slice(0, 2);

  return {
    asked, attempted: true, examsAttempted, masteryScore, band,
    testMastery, practiceMastery, dppEffort, pacing, consistency, trend, flags: ordered,
  };
}

/** Human-readable label + tailwind classes for a flag chip. */
export const FLAG_META: Record<SegregationFlag, { label: string; className: string }> = {
  "cracks-under-pressure": { label: "Cracks under pressure", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  disengaged: { label: "Disengaged", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  "conceptual-gap": { label: "Conceptual gap", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  declining: { label: "Declining", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  "topic-weakness": { label: "Topic weakness", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  pacing: { label: "Pacing", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  inconsistent: { label: "Inconsistent", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  plateaued: { label: "Plateaued", className: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400" },
  improving: { label: "Improving", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};
