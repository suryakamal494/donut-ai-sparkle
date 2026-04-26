// Student Copilot — TypeScript Types
// Adapted from prompt doc to fit DonutAI platform conventions

export const SUBJECTS = ["Physics", "Chemistry", "Math", "Biology", "English"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const TOOL_ROUTINE_KEYS = ["s_practice", "s_exam_prep", "s_roadmap", "s_progress"] as const;
export const DEFAULT_ROUTINE_KEY = "s_doubt";

// ---------- Session continuity (Phase 7) ----------

export const ROUTER_TOOLS = ["doubt", "practice", "plan", "exam", "debrief", "progress"] as const;
export type RouterTool = (typeof ROUTER_TOOLS)[number];

export const TOOL_TO_ROUTINE: Record<RouterTool, string> = {
  doubt: "s_doubt",
  practice: "s_practice",
  plan: "s_roadmap",
  exam: "s_exam_prep",
  debrief: "s_progress",
  progress: "s_progress",
};

export const ROUTINE_TO_TOOL: Record<string, RouterTool> = {
  s_doubt: "doubt",
  s_practice: "practice",
  s_roadmap: "plan",
  s_exam_prep: "exam",
  s_progress: "progress",
};

export type ThreadStatus = "active" | "recent" | "archived";

export interface RouteDecision {
  threadId: string;
  isNew: boolean;
  tool: RouterTool;
  scopeKey: string;
  scopeMeta: Record<string, any>;
  matchedThreadTitle?: string;
  confidence: number;
}

export type MasteryBand = "mastery_ready" | "stable" | "reinforcement" | "foundational_risk" | "unknown";

export type StudentArtifactType =
  | "concept_explainer"
  | "worked_solution"
  | "formula_sheet"
  | "practice_session"
  | "study_plan"
  | "target_tracker"
  | "mastery_map"
  | "progress_report"
  | "test_debrief"
  | "clarifications";

// ---------- DB Row types ----------

export interface StudentThread {
  id: string;
  student_id: string;
  routine_key: string;
  title: string;
  subject: string | null;
  last_message_at: string;
  created_at: string;
  tool?: string | null;
  scope_key?: string | null;
  scope_meta?: Record<string, any> | null;
  status?: ThreadStatus | string;
  last_activity_at?: string;
  archived_at?: string | null;
}

export interface StudentMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
}

export interface StudentArtifact {
  id: string;
  student_id: string;
  thread_id: string | null;
  type: StudentArtifactType | string;
  title: string;
  content: any;
  source: "ai" | "teacher" | string;
  created_at: string;
}

export interface StudentAttempt {
  student_id: string;
  thread_id?: string | null;
  artifact_id?: string | null;
  subject?: string | null;
  topic?: string | null;
  question_type?: string;
  question_text?: string | null;
  expected_answer?: string | null;
  given_answer?: string | null;
  correct: boolean;
  time_seconds?: number | null;
  source?: "practice" | "test" | "homework" | string;
}

export interface TopicMastery {
  student_id: string;
  subject: string;
  topic: string;
  attempts: number;
  accuracy: number;
  last_attempt_at: string;
  band: MasteryBand;
}

export interface StudentExam {
  id: string;
  student_id: string;
  name: string;
  exam_date: string;
  target_score: number | null;
  max_score: number | null;
  notes: string | null;
  roadmap_artifact_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentNotification {
  id: string;
  student_id: string;
  type: string;
  title: string;
  body: string | null;
  artifact_id: string | null;
  exam_id: string | null;
  subject: string | null;
  priority: number;
  dismissed: boolean;
  acted_on: boolean;
  created_at: string;
}

export interface StudyTaskCompletion {
  id: string;
  student_id: string;
  artifact_id: string;
  day_index: number;
  item_index: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// ---------- Routine (reuses rp_routines with audience='student') ----------

export interface StudentRoutine {
  id: string;
  key: string;
  label: string;
  icon: string;
  description: string | null;
  default_system_prompt: string | null;
  quick_start_chips: string[] | null;
  audience: string;
  is_active: boolean;
  sort_order: number;
}

// ---------- Clarification sub-types ----------

export interface ClarificationOption {
  label: string;
  value: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  options: ClarificationOption[];
  allow_other?: boolean;
  multi_select?: boolean;
}

export interface ClarificationContent {
  title?: string;
  intro?: string;
  questions: ClarificationQuestion[];
  answered?: boolean;
}

// ---------- Artifact-to-routine mapping ----------

export const ROUTINE_ARTIFACT_TYPES: Record<string, StudentArtifactType[]> = {
  s_doubt: ["concept_explainer", "worked_solution", "formula_sheet"],
  s_practice: ["practice_session", "test_debrief"],
  s_exam_prep: ["target_tracker", "study_plan"],
  s_roadmap: ["study_plan"],
  s_progress: ["mastery_map", "progress_report"],
};

export const TOOL_TO_ARTIFACT_TYPE: Record<string, StudentArtifactType> = {
  solve_doubt: "concept_explainer",
  create_practice_session: "practice_session",
  create_study_plan: "study_plan",
  create_target_tracker: "target_tracker",
  create_worked_solution: "worked_solution",
  create_formula_sheet: "formula_sheet",
  create_mastery_map: "mastery_map",
  ask_clarifications: "clarifications",
  create_test_debrief: "test_debrief",
  create_progress_report: "progress_report",
};