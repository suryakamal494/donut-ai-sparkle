/**
 * Reports Context Resolver — runs in the browser to assemble the same data
 * the Teacher Reports pages render, so the AI can answer with identical numbers.
 *
 * Copilot batches use UUIDs (e.g. "11111111-…-111101" / "Class 9-A").
 * Teacher Reports mock data uses keys like "batch-10a", "batch-10b", "batch-11a".
 * We pick the closest reports batch by grade+section. If no perfect match,
 * fall back to "batch-10a" so the conversation is never empty.
 *
 * For deep-dive Q&A (per-student, per-chapter, per-topic, comparisons,
 * actionable insights), this module pre-resolves every entity for the
 * active batch into compact lookup tables and ships them inline with the
 * chat request. This keeps the edge function pure (no callbacks) while
 * guaranteeing the AI sees the EXACT same numbers the report pages show.
 */
import {
  getBatchChapters,
  getBatchExamHistory,
  getChapterDetail,
  getBatchHealth,
  type BatchExamEntry,
  type ChapterReportCard,
  type ChapterDetailReport,
  type BatchHealthSummary,
} from "@/data/teacher/reportsData";
import {
  getBatchStudentRoster,
  getStudentBatchProfile,
  generateMockStudentInsight,
  type StudentBatchProfile,
} from "@/data/teacher/studentReportData";
import {
  getExamAnalyticsForBatch,
  getExamAnalytics,
  computePerformanceBands,
  computeTopicFlags,
  generateVerdictSummary,
  generateMockActionableInsights,
  batchInfoMap,
  type ExamAnalytics,
  type ActionableInsight,
} from "@/data/teacher/examResults";
import type { Batch } from "../types";

export interface ReportsBatchContext {
  reportsBatchId: string;
  reportsBatchName: string;
  recentExams: BatchExamEntry[];
  chapters: ChapterReportCard[];
  studentRoster: ReturnType<typeof getBatchStudentRoster>;
  health: BatchHealthSummary;
}

/**
 * Map a Copilot batch (UUID, grade, section) to the closest reports batch key.
 */
export function resolveReportsBatchId(batch: Batch): string {
  const want = `${batch.grade}${(batch.section ?? "").toLowerCase()}`;
  const direct = `batch-${want}`;
  if (batchInfoMap[direct]) return direct;
  const gradeMatch = Object.keys(batchInfoMap).find((k) =>
    k.startsWith(`batch-${batch.grade}`)
  );
  if (gradeMatch) return gradeMatch;
  return Object.keys(batchInfoMap)[0] ?? "batch-10a";
}

export function buildReportsContext(batch: Batch): ReportsBatchContext {
  const reportsBatchId = resolveReportsBatchId(batch);
  const info = batchInfoMap[reportsBatchId];
  const chapters = getBatchChapters(reportsBatchId);
  const examHistory = getBatchExamHistory(reportsBatchId);
  const studentRoster = getBatchStudentRoster(reportsBatchId);
  const health = getBatchHealth(
    reportsBatchId,
    chapters,
    examHistory,
    studentRoster.map((s) => ({
      studentName: s.studentName,
      studentId: s.studentId,
      avgPercentage: s.avgPercentage,
      trend: s.trend,
      piBucket: s.piBucket,
      secondaryTags: s.secondaryTags as unknown as string[],
    }))
  );

  return {
    reportsBatchId,
    reportsBatchName: info?.name ?? reportsBatchId,
    recentExams: [...examHistory]
      .sort((a, b) => (b.date < a.date ? -1 : 1))
      .slice(0, 8),
    chapters,
    studentRoster,
    health,
  };
}

// ─── Helpers to compress full deep-dive data into compact JSON the model can read ───

function compressStudentProfile(p: StudentBatchProfile) {
  const insight = generateMockStudentInsight(p);
  return {
    id: p.studentId,
    name: p.studentName,
    roll: p.rollNumber,
    pi: p.performanceIndex,
    accuracy: p.overallAccuracy,
    consistency: p.consistency,
    trend: p.trend,
    secondary_tags: p.secondaryTags,
    total_exams: p.totalExams,
    suggested_difficulty: p.suggestedDifficulty,
    weak_topic_names: p.weakTopicNames,
    chapter_mastery: p.chapterMastery.map((c) => ({
      chapter_id: c.chapterId,
      chapter: c.chapterName,
      avg: c.avgSuccessRate,
      status: c.status,
      trend: c.trend,
    })),
    weak_topics: p.weakTopics.slice(0, 8).map((t) => ({
      topic: t.topicName,
      chapter: t.chapterName,
      accuracy: t.accuracy,
    })),
    difficulty_breakdown: p.difficultyBreakdown.map((d) => ({
      level: d.level,
      attempted: d.questionsAttempted,
      accuracy: d.accuracy,
      avg_time: d.avgTimePerQuestion,
    })),
    exam_history: p.examHistory.map((e) => ({
      exam_id: e.examId,
      exam: e.examName,
      date: e.date,
      score: e.score,
      max: e.maxScore,
      pct: e.percentage,
      rank: e.rank,
      total: e.totalStudents,
    })),
    ai_summary: insight.summary,
    ai_strengths: insight.strengths,
    ai_priorities: insight.priorities,
    ai_engagement_note: insight.engagementNote,
  };
}

function compressChapterDetail(d: ChapterDetailReport) {
  return {
    chapter_id: d.chapterId,
    chapter: d.chapterName,
    subject: d.subject,
    overall_success_rate: d.overallSuccessRate,
    total_questions_asked: d.totalQuestionsAsked,
    exams_covering: d.examsCovering,
    topics: d.topics.map((t) => ({
      topic_id: t.topicId,
      topic: t.topicName,
      questions: t.questionsAsked,
      success_rate: t.avgSuccessRate,
      status: t.status,
      exams_appeared: t.examsAppeared,
    })),
    exam_breakdown: d.examBreakdown.map((e) => ({
      exam_id: e.examId,
      exam: e.examName,
      date: e.date,
      questions_from_chapter: e.questionsFromChapter,
      avg_success_rate: e.avgSuccessRate,
    })),
    student_buckets: d.studentBuckets.map((b) => ({
      key: b.key,
      label: b.label,
      count: b.count,
      students: b.students.slice(0, 8).map((s) => ({
        id: s.id,
        name: s.studentName,
        roll: s.rollNumber,
        mastery: s.masteryScore,
        band: s.band,
        flags: s.flags,
        trend: s.trend,
      })),
    })),
  };
}

function compressExamAnalysis(
  examEntry: BatchExamEntry,
  reportsBatchId: string
) {
  const analytics =
    getExamAnalyticsForBatch(examEntry.examId, reportsBatchId) ??
    getExamAnalytics(examEntry.examId);
  if (!analytics) {
    // Synthetic fallback from batch summary
    const avgPct = examEntry.totalMarks
      ? Math.round((examEntry.classAverage / examEntry.totalMarks) * 100)
      : 0;
    return {
      exam_id: examEntry.examId,
      exam_name: examEntry.examName,
      date: examEntry.date,
      total_marks: examEntry.totalMarks,
      class_average: examEntry.classAverage,
      avg_pct: avgPct,
      highest_score: examEntry.highestScore,
      pass_percentage: examEntry.passPercentage,
      total_students: examEntry.totalStudents,
      attempted_count: examEntry.totalStudents,
      verdict_text: `Class average ${avgPct}% on ${examEntry.totalMarks} marks. ${examEntry.passPercentage}% pass rate.`,
      bands: [],
      topic_flags: [],
      score_distribution: [],
      question_analysis: [],
      difficulty_mix: [],
      cognitive_mix: [],
      actionable_insights: [],
      synthetic: true,
    };
  }
  const bands = computePerformanceBands(analytics.allStudents);
  const topicFlags = computeTopicFlags(analytics.questionAnalysis);
  const verdict = generateVerdictSummary(analytics, bands, topicFlags);
  const insights = generateMockActionableInsights(analytics, bands, topicFlags);

  // Difficulty + cognitive mixes from question_analysis
  const diffBuckets: Record<string, { total: number; sum: number }> = {
    easy: { total: 0, sum: 0 },
    medium: { total: 0, sum: 0 },
    hard: { total: 0, sum: 0 },
  };
  const cogBuckets: Record<string, { total: number; sum: number }> = {};
  for (const q of analytics.questionAnalysis) {
    const d = diffBuckets[q.difficulty] ?? (diffBuckets[q.difficulty] = { total: 0, sum: 0 });
    d.total += 1;
    d.sum += q.successRate;
    const c = cogBuckets[q.cognitiveType] ?? (cogBuckets[q.cognitiveType] = { total: 0, sum: 0 });
    c.total += 1;
    c.sum += q.successRate;
  }

  return {
    exam_id: analytics.examId,
    exam_name: analytics.examName,
    date: examEntry.date,
    total_marks: examEntry.totalMarks,
    class_average: analytics.averageScore,
    avg_pct: verdict.averagePercentage,
    highest_score: analytics.highestScore,
    lowest_score: analytics.lowestScore,
    pass_percentage: analytics.passPercentage,
    total_students: analytics.totalStudents,
    attempted_count: analytics.attemptedCount,
    verdict_text: verdict.verdictText,
    top_student: verdict.topStudent,
    bands: bands.map((b) => ({ key: b.key, label: b.label, count: b.count })),
    topic_flags: topicFlags.map((t) => ({
      topic: t.topic,
      success_rate: t.successRate,
      status: t.status,
    })),
    score_distribution: analytics.scoreDistribution.map((s) => ({
      range: s.range,
      count: s.count,
    })),
    question_analysis: analytics.questionAnalysis.map((q) => ({
      q_no: q.questionNumber,
      topic: q.topic,
      difficulty: q.difficulty,
      cognitive_type: q.cognitiveType,
      success_rate: q.successRate,
      correct: q.correctAttempts,
      incorrect: q.incorrectAttempts,
      unattempted: q.unattempted,
      avg_time_s: q.averageTime,
    })),
    difficulty_mix: Object.entries(diffBuckets)
      .filter(([, v]) => v.total > 0)
      .map(([level, v]) => ({
        level,
        question_count: v.total,
        avg_success_rate: Math.round(v.sum / v.total),
      })),
    cognitive_mix: Object.entries(cogBuckets).map(([type, v]) => ({
      type,
      question_count: v.total,
      avg_success_rate: Math.round(v.sum / v.total),
    })),
    actionable_insights: insights.map((ins) => ({
      id: ins.id,
      type: ins.type,
      severity: ins.severity,
      finding: ins.finding,
      detail: ins.detail,
      affected_students: ins.affectedStudents,
      suggested_action: ins.suggestedAction,
      action_type: ins.actionType,
      action_payload: ins.actionPayload,
    })),
    synthetic: false,
  };
}

/**
 * Strip down to a compact JSON payload that the edge function can introspect.
 * Now includes pre-resolved deep-dive data for every entity in the batch
 * so the AI can answer ANY question without callbacks to the client.
 */
export function serializeReportsContext(ctx: ReportsBatchContext) {
  // Pre-resolve every student profile (compact form)
  const studentProfiles = ctx.studentRoster.map((s) =>
    compressStudentProfile(getStudentBatchProfile(s.studentId, ctx.reportsBatchId))
  );

  // Pre-resolve every chapter detail
  const chapterDetails = ctx.chapters.map((c) =>
    compressChapterDetail(getChapterDetail(c.chapterId, ctx.reportsBatchId))
  );

  // Pre-resolve every exam analysis (verdict, bands, questions, insights)
  const examAnalyses = ctx.recentExams.map((e) =>
    compressExamAnalysis(e, ctx.reportsBatchId)
  );

  // Topic index: aggregate every topic across chapters with an avg success rate
  // and the list of students struggling on it (accuracy < 50% in their profile)
  type TopicAgg = {
    topic: string;
    chapter: string;
    chapter_id: string;
    success_rate: number;
    status: "strong" | "moderate" | "weak";
    affected_students: { id: string; name: string; accuracy: number }[];
    exam_count: number;
  };
  const topicMap = new Map<string, TopicAgg>();
  for (const cd of chapterDetails) {
    for (const t of cd.topics) {
      const key = `${cd.chapter_id}__${t.topic}`;
      topicMap.set(key, {
        topic: t.topic,
        chapter: cd.chapter,
        chapter_id: cd.chapter_id,
        success_rate: t.success_rate,
        status: t.status,
        affected_students: [],
        exam_count: t.exams_appeared,
      });
    }
  }
  for (const sp of studentProfiles) {
    for (const wt of sp.weak_topics) {
      // Find a matching topic key (chapter+topic name)
      for (const [key, agg] of topicMap.entries()) {
        if (agg.topic === wt.topic && agg.chapter === wt.chapter) {
          if (agg.affected_students.length < 12) {
            agg.affected_students.push({ id: sp.id, name: sp.name, accuracy: wt.accuracy });
          }
          break;
        }
      }
    }
  }
  const topics = Array.from(topicMap.values());

  // Multi-subject risk — single-subject batch in mock data, so this surfaces
  // students at risk in 2+ chapters (closest analog to "subjects" given mock).
  const multiAreaRisk = studentProfiles
    .map((sp) => {
      const weakChapters = sp.chapter_mastery.filter((c) => c.status === "weak");
      return {
        id: sp.id,
        name: sp.name,
        roll: sp.roll,
        weak_chapter_count: weakChapters.length,
        weak_chapters: weakChapters.map((c) => c.chapter),
        pi: sp.pi,
        trend: sp.trend,
      };
    })
    .filter((s) => s.weak_chapter_count >= 2)
    .sort((a, b) => b.weak_chapter_count - a.weak_chapter_count);

  return {
    reports_batch_id: ctx.reportsBatchId,
    reports_batch_name: ctx.reportsBatchName,
    overall_trend: ctx.health.overallTrend,
    recent_exam_avg: ctx.health.recentExamAvg,
    at_risk_count: ctx.health.atRiskCount,
    weak_topic_count: ctx.health.weakTopicCount,
    suggested_focus: ctx.health.suggestedFocus,
    priority_topics: ctx.health.priorityTopics,
    students_to_check_in: ctx.health.studentsToCheckIn,
    chapters: ctx.chapters.map((c) => ({
      id: c.chapterId,
      name: c.chapterName,
      avg_success_rate: c.avgSuccessRate,
      status: c.status,
      weak_topic_count: c.weakTopicCount,
      exams_covering: c.examsCovering,
      topic_count: c.topicCount,
    })),
    recent_exams: ctx.recentExams.map((e) => ({
      id: e.examId,
      name: e.examName,
      date: e.date,
      total_marks: e.totalMarks,
      class_average: e.classAverage,
      highest_score: e.highestScore,
      pass_percentage: e.passPercentage,
      total_students: e.totalStudents,
    })),
    student_roster_summary: {
      total: ctx.studentRoster.length,
      mastery: ctx.studentRoster.filter((s) => s.piBucket === "mastery").length,
      stable: ctx.studentRoster.filter((s) => s.piBucket === "stable").length,
      reinforcement: ctx.studentRoster.filter((s) => s.piBucket === "reinforcement").length,
      risk: ctx.studentRoster.filter((s) => s.piBucket === "risk").length,
    },
    student_roster: ctx.studentRoster.map((s) => ({
      id: s.studentId,
      name: s.studentName,
      roll: s.rollNumber,
      avg: s.avgPercentage,
      pi: s.performanceIndex,
      bucket: s.piBucket,
      trend: s.trend,
      secondary_tags: s.secondaryTags,
    })),
    at_risk_students: ctx.studentRoster
      .filter((s) => s.piBucket === "risk" || s.piBucket === "reinforcement")
      .sort((a, b) => a.performanceIndex - b.performanceIndex)
      .slice(0, 12)
      .map((s) => ({
        id: s.studentId,
        name: s.studentName,
        roll: s.rollNumber,
        avg: s.avgPercentage,
        pi: s.performanceIndex,
        bucket: s.piBucket,
        trend: s.trend,
      })),
    top_performers: [...ctx.studentRoster]
      .sort((a, b) => b.performanceIndex - a.performanceIndex)
      .slice(0, 6)
      .map((s) => ({
        id: s.studentId,
        name: s.studentName,
        roll: s.rollNumber,
        avg: s.avgPercentage,
        pi: s.performanceIndex,
        trend: s.trend,
      })),
    // Deep-dive lookup tables
    student_profiles: studentProfiles,
    chapter_details: chapterDetails,
    exam_analyses: examAnalyses,
    topics,
    multi_area_risk: multiAreaRisk,
  };
}

/** (Kept for legacy callers — same as before.) */
export function getExamAnalysisForReports(
  examId: string,
  reportsBatchId: string
): {
  analytics: ExamAnalytics | null;
  bands: ReturnType<typeof computePerformanceBands>;
  topicFlags: ReturnType<typeof computeTopicFlags>;
  verdict: ReturnType<typeof generateVerdictSummary> | null;
  insights: ActionableInsight[];
} {
  const analytics =
    getExamAnalyticsForBatch(examId, reportsBatchId) ?? getExamAnalytics(examId);
  if (!analytics)
    return { analytics: null, bands: [], topicFlags: [], verdict: null, insights: [] };
  const bands = computePerformanceBands(analytics.allStudents);
  const topicFlags = computeTopicFlags(analytics.questionAnalysis);
  const verdict = generateVerdictSummary(analytics, bands, topicFlags);
  const insights = generateMockActionableInsights(analytics, bands, topicFlags);
  return { analytics, bands, topicFlags, verdict, insights };
}

export function getChapterReportData(chapterId: string, reportsBatchId: string) {
  return getChapterDetail(chapterId, reportsBatchId);
}
