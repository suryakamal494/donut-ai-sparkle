// Student Copilot — Supabase API layer
import { supabase } from "@/integrations/supabase/client";
import type {
  StudentThread,
  StudentMessage,
  StudentArtifact,
  StudentAttempt,
  TopicMastery,
  StudentExam,
  StudentNotification,
  StudyTaskCompletion,
  StudentRoutine,
} from "./types";

// ---------- Routines ----------

export async function fetchStudentRoutines(): Promise<StudentRoutine[]> {
  const { data } = await supabase
    .from("rp_routines")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  // Filter for student audience client-side since column was just added
  const all = (data ?? []) as any[];
  return all.filter((r) => r.audience === "student") as StudentRoutine[];
}

// ---------- Threads ----------

export async function fetchThreads(studentId: string): Promise<StudentThread[]> {
  const { data } = await supabase
    .from("student_copilot_threads" as any)
    .select("*")
    .eq("student_id", studentId)
    .order("last_message_at", { ascending: false })
    .limit(50);
  return (data ?? []) as unknown as StudentThread[];
}

export async function createThread(
  studentId: string,
  routineKey: string,
  title: string,
  subject?: string | null
): Promise<StudentThread | null> {
  const { data } = await supabase
    .from("student_copilot_threads" as any)
    .insert({ student_id: studentId, routine_key: routineKey, title, subject: subject ?? null } as any)
    .select("*")
    .single();
  return (data as unknown as StudentThread) ?? null;
}

export async function updateThread(
  threadId: string,
  updates: { title?: string; subject?: string; last_message_at?: string; last_activity_at?: string }
): Promise<void> {
  await supabase
    .from("student_copilot_threads" as any)
    .update(updates as any)
    .eq("id", threadId);
}

// ---------- Messages ----------

export async function fetchMessages(threadId: string): Promise<StudentMessage[]> {
  const { data } = await supabase
    .from("student_copilot_messages" as any)
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at");
  return (data ?? []) as unknown as StudentMessage[];
}

export async function insertMessage(
  threadId: string,
  role: string,
  content: string
): Promise<StudentMessage | null> {
  const { data } = await supabase
    .from("student_copilot_messages" as any)
    .insert({ thread_id: threadId, role, content } as any)
    .select("*")
    .single();
  return (data as unknown as StudentMessage) ?? null;
}

// ---------- Artifacts ----------

export async function fetchArtifacts(studentId: string): Promise<StudentArtifact[]> {
  const { data } = await supabase
    .from("student_copilot_artifacts" as any)
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as StudentArtifact[];
}

export async function fetchArtifactById(id: string): Promise<StudentArtifact | null> {
  const { data } = await supabase
    .from("student_copilot_artifacts" as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as StudentArtifact) ?? null;
}

export async function insertArtifact(artifact: {
  student_id: string;
  thread_id?: string | null;
  type: string;
  title: string;
  content: any;
  source?: string;
}): Promise<StudentArtifact | null> {
  const { data } = await supabase
    .from("student_copilot_artifacts" as any)
    .insert({ ...artifact, source: artifact.source ?? "ai" } as any)
    .select("*")
    .single();
  return (data as unknown as StudentArtifact) ?? null;
}

export async function updateArtifactContent(
  artifactId: string,
  content: any
): Promise<void> {
  await supabase
    .from("student_copilot_artifacts" as any)
    .update({ content } as any)
    .eq("id", artifactId);
}

// ---------- Attempts ----------

export async function insertAttempts(rows: StudentAttempt[]): Promise<void> {
  if (rows.length === 0) return;
  await supabase.from("student_attempts" as any).insert(rows as any);
}

// ---------- Mastery ----------

export async function fetchTopicMastery(
  studentId: string,
  subject?: string
): Promise<TopicMastery[]> {
  let q = supabase
    .from("student_topic_mastery" as any)
    .select("*")
    .eq("student_id", studentId);
  if (subject) q = q.eq("subject", subject);
  const { data } = await q;
  return (data ?? []) as unknown as TopicMastery[];
}

// ---------- Exams ----------

export async function fetchExams(studentId: string): Promise<StudentExam[]> {
  const { data } = await supabase
    .from("student_exams" as any)
    .select("*")
    .eq("student_id", studentId)
    .order("exam_date");
  return (data ?? []) as unknown as StudentExam[];
}

// ---------- Notifications ----------

export async function fetchNotifications(studentId: string): Promise<StudentNotification[]> {
  const { data } = await supabase
    .from("student_notifications" as any)
    .select("*")
    .eq("student_id", studentId)
    .eq("dismissed", false)
    .order("priority", { ascending: false });
  return (data ?? []) as unknown as StudentNotification[];
}

export async function dismissNotification(id: string): Promise<void> {
  await supabase
    .from("student_notifications" as any)
    .update({ dismissed: true } as any)
    .eq("id", id);
}

export async function markNotificationActedOn(id: string): Promise<void> {
  await supabase
    .from("student_notifications" as any)
    .update({ acted_on: true, dismissed: true } as any)
    .eq("id", id);
}

// ---------- Study Tasks ----------

export async function fetchStudyTaskCompletions(
  studentId: string
): Promise<Record<string, Set<string>>> {
  const { data } = await supabase
    .from("student_study_tasks" as any)
    .select("*")
    .eq("student_id", studentId)
    .eq("completed", true);
  const map: Record<string, Set<string>> = {};
  for (const row of (data ?? []) as unknown as StudyTaskCompletion[]) {
    if (!map[row.artifact_id]) map[row.artifact_id] = new Set();
    map[row.artifact_id].add(`${row.day_index}-${row.item_index}`);
  }
  return map;
}

export async function markStudyTaskComplete(
  studentId: string,
  artifactId: string,
  dayIndex: number,
  itemIndex: number
): Promise<void> {
  await supabase.from("student_study_tasks" as any).upsert(
    {
      student_id: studentId,
      artifact_id: artifactId,
      day_index: dayIndex,
      item_index: itemIndex,
      completed: true,
      completed_at: new Date().toISOString(),
    } as any,
    { onConflict: "artifact_id,day_index,item_index" }
  );
}