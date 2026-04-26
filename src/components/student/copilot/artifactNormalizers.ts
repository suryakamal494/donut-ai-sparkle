// Normalize artifact content from various sources (AI edge functions, mock data, DB)
// into the canonical shapes expected by the artifact view components.

/**
 * Normalize practice_session content.
 * AI outputs: { prompt, answer, options: string[] }
 * Views expect: { question, correct_answer, options: {label, text}[], id }
 */
export function normalizePracticeSession(content: any): any {
  if (!content?.questions) return content;
  return {
    ...content,
    title: content.title ?? "Practice Session",
    questions: content.questions.map((q: any, i: number) => {
      const labels = ["A", "B", "C", "D", "E", "F"];
      const rawType = String(q.type ?? "mcq").toLowerCase();
      const options = Array.isArray(q.options)
        ? q.options.map((opt: any, j: number) =>
            typeof opt === "string"
              ? { label: labels[j] ?? String(j + 1), text: opt }
              : {
                  label: String(opt?.label ?? labels[j] ?? j + 1),
                  text: String(opt?.text ?? ""),
                }
          )
        : undefined;
      const rawCorrectAnswer = String(q.correct_answer ?? q.answer ?? "").trim();
      const matchedOption = options?.find(
        (opt) =>
          opt.label.toLowerCase() === rawCorrectAnswer.toLowerCase() ||
          opt.text.trim().toLowerCase() === rawCorrectAnswer.toLowerCase()
      );
      const normalized: any = {
        id: q.id ?? `q-${i + 1}`,
        type: options?.length ? rawType : rawType === "integer" || rawType === "numerical" ? "integer" : "short",
        question: q.question ?? q.prompt ?? "",
        correct_answer: matchedOption?.label ?? rawCorrectAnswer,
        explanation: q.explanation ?? q.hint ?? undefined,
        topic: q.topic,
        subject: q.subject,
        difficulty: q.difficulty,
        options,
      };
      return normalized;
    }),
  };
}

export function getPracticeQuestionCount(content: any): number {
  return Array.isArray(content?.questions) ? content.questions.length : 0;
}

export function isInlinePracticeArtifact(artifact: { type: string; content: any }): boolean {
  if (artifact.type !== "practice_session") return false;
  const content = artifact.content ?? {};
  return (
    content.presentation === "inline" ||
    content.show_in_artifact_pane === false ||
    getPracticeQuestionCount(content) <= 10
  );
}

/**
 * Normalize concept_explainer content.
 * Handles both: { summary, steps } and { intro, body, try_yourself }
 */
export function normalizeConceptExplainer(content: any): any {
  if (content?.steps) return content; // already canonical
  return {
    topic: content?.topic ?? "Concept",
    subject: content?.subject,
    summary: content?.summary ?? content?.intro ?? "",
    steps: content?.body
      ? [{ title: "Explanation", explanation: content.body }]
      : content?.steps ?? [],
    challenge: content?.challenge ?? content?.try_yourself,
    key_takeaway: content?.key_takeaway,
  };
}

/**
 * Normalize worked_solution content.
 * Handles both: { given (string), to_find } and { given (array), find }
 */
export function normalizeWorkedSolution(content: any): any {
  const result = { ...content };
  if (Array.isArray(content?.given)) {
    result.given = content.given.join(", ");
  }
  if (content?.find && !content?.to_find) {
    result.to_find = content.find;
  }
  if (content?.steps) {
    result.steps = content.steps.map((s: any, i: number) => ({
      step_number: s.step_number ?? i + 1,
      description: s.description ?? s.step ?? `Step ${i + 1}`,
      working: s.working ?? s.expression ?? s.justification ?? "",
    }));
  }
  return result;
}

/**
 * Normalize target_tracker content.
 * AI outputs: { exam, gap_analysis, todays_plan, weekly_progress }
 * View expects: { exam_name, subjects, today_plan, days_remaining }
 */
export function normalizeTargetTracker(content: any): any {
  if (content?.exam_name) return content; // already canonical
  return {
    exam_name: content?.exam_name ?? content?.exam ?? "Exam",
    exam_date: content?.exam_date,
    current_score: content?.current_score ?? 0,
    target_score: content?.target_score ?? 0,
    max_score: content?.max_score ?? 100,
    days_remaining: content?.days_remaining,
    weekly_target: content?.weekly_target,
    subjects: content?.subjects ?? content?.gap_analysis ?? [],
    today_plan: content?.today_plan ?? content?.todays_plan ?? [],
  };
}

/**
 * Normalize progress_report content.
 * AI outputs: { questions_attempted, accuracy_by_topic, time_by_subject, highlights }
 * View expects: { total_attempts, subjects, weekly_activity, recommendations }
 */
export function normalizeProgressReport(content: any): any {
  if (content?.subjects) return content; // already canonical
  return {
    title: content?.title ?? "Progress Report",
    period: content?.period,
    overall_accuracy: content?.overall_accuracy ?? 0,
    overall_trend: content?.overall_trend ?? "flat",
    total_attempts: content?.total_attempts ?? content?.questions_attempted ?? 0,
    subjects: content?.subjects ?? [],
    weekly_activity: content?.weekly_activity ?? [],
    recommendations: content?.recommendations ?? content?.highlights ?? [],
  };
}

/**
 * Normalize test_debrief content.
 * AI outputs: { q, why_wrong, followups }
 * View expects: { questions, weak_topics, follow_up }
 */
export function normalizeTestDebrief(content: any): any {
  if (content?.questions) return content; // already canonical
  return {
    title: content?.title ?? "Test Debrief",
    subject: content?.subject,
    total_questions: content?.total_questions ?? 0,
    correct: content?.correct ?? 0,
    incorrect: content?.incorrect ?? 0,
    unattempted: content?.unattempted ?? 0,
    accuracy: content?.accuracy ?? 0,
    questions: content?.questions ?? content?.q ?? [],
    weak_topics: content?.weak_topics ?? [],
    follow_up: content?.follow_up ?? content?.followups ?? [],
  };
}

/**
 * Normalize study_plan content.
 * AI outputs: { focus, minutes } per item/day
 * View expects: { label, duration, task } per item, { day, label, items } per day
 */
export function normalizeStudyPlan(content: any): any {
  if (!content?.days) return content;
  const toText = (value: any): string => {
    if (typeof value === "string") return value;
    if (value == null) return "Task";
    return String(value.task ?? value.description ?? value.title ?? value.label ?? value.name ?? JSON.stringify(value));
  };
  return {
    ...content,
    title: content.title ?? content.exam ?? "Study Plan",
    total_days: content.total_days ?? content.days?.length ?? 0,
    days: content.days.map((d: any, i: number) => ({
      day: d.day ?? i + 1,
      label: d.label ?? d.focus ?? undefined,
      date: d.date,
      items: (d.items ?? []).map((item: any) => ({
        task: toText(item.task ?? item.description ?? item),
        duration: item.duration ?? (item.minutes ? `${item.minutes} min` : undefined),
        resource: item.resource ?? item.type,
      })),
    })),
    tips: content.tips,
  };
}

/**
 * Master normalizer — dispatches by artifact type.
 */
export function normalizeArtifactContent(type: string, content: any): any {
  switch (type) {
    case "practice_session":
      return normalizePracticeSession(content);
    case "concept_explainer":
      return normalizeConceptExplainer(content);
    case "worked_solution":
      return normalizeWorkedSolution(content);
    case "target_tracker":
      return normalizeTargetTracker(content);
    case "progress_report":
      return normalizeProgressReport(content);
    case "test_debrief":
      return normalizeTestDebrief(content);
    case "study_plan":
      return normalizeStudyPlan(content);
    default:
      return content;
  }
}