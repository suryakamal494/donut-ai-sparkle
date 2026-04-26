// One-time idempotent seeder for Student Copilot mock data
import { supabase } from "@/integrations/supabase/client";
import {
  MOCK_ROUTINES,
  MOCK_THREADS,
  MOCK_MESSAGES,
  MOCK_ARTIFACTS,
  MOCK_NOTIFICATIONS,
  MOCK_ATTEMPTS,
  MOCK_EXAMS,
} from "@/data/student/copilotMockData";

const SEED_KEY = "copilot_mock_seeded_v3";
const SEED_KEY_V4 = "copilot_mock_seeded_v4";
const SEED_KEY_V5 = "copilot_mock_seeded_v5";
const CLEANUP_KEY_V6 = "copilot_mock_cleanup_v6";

async function cleanupCopilotDemoClutter(): Promise<void> {
  if (localStorage.getItem(CLEANUP_KEY_V6) === "true") return;

  const { data: activeThreads } = await supabase
    .from("student_copilot_threads" as any)
    .select("id,title,routine_key,tool,status")
    .eq("student_id", "student-001")
    .eq("status", "active");

  const threads = (activeThreads ?? []) as any[];
  const ids = threads.map((t) => t.id).filter(Boolean);
  if (ids.length === 0) {
    localStorage.setItem(CLEANUP_KEY_V6, "true");
    return;
  }

  const [{ data: msgs }, { data: arts }] = await Promise.all([
    supabase.from("student_copilot_messages" as any).select("thread_id").in("thread_id", ids),
    supabase.from("student_copilot_artifacts" as any).select("thread_id").in("thread_id", ids),
  ]);

  const msgCount = new Map<string, number>();
  for (const m of (msgs ?? []) as any[]) msgCount.set(m.thread_id, (msgCount.get(m.thread_id) ?? 0) + 1);
  const artCount = new Map<string, number>();
  for (const a of (arts ?? []) as any[]) artCount.set(a.thread_id, (artCount.get(a.thread_id) ?? 0) + 1);

  const archiveIds = threads
    .filter((t) => {
      const title = String(t.title ?? "");
      const empty = (msgCount.get(t.id) ?? 0) === 0 && (artCount.get(t.id) ?? 0) === 0;
      const brokenRoadmap = t.routine_key === "s_roadmap" && !t.tool && (
        title.includes("[object Object]") ||
        title.startsWith("New Study roadmap chat") ||
        title.startsWith("Teach me about: Revise distance")
      );
      const emptyNewChat = empty && /^New (Chat|Exam target|Study roadmap|Practice)/i.test(title);
      return emptyNewChat || brokenRoadmap;
    })
    .map((t) => t.id);

  if (archiveIds.length > 0) {
    await supabase
      .from("student_copilot_threads" as any)
      .update({ status: "archived", archived_at: new Date().toISOString() } as any)
      .in("id", archiveIds);
  }

  localStorage.setItem(CLEANUP_KEY_V6, "true");
}

/** Throws on DB error so the caller can abort seeding */
async function insertOrSkip(
  table: string,
  data: any[],
  label: string
): Promise<void> {
  const { error } = await supabase.from(table as any).insert(data);
  if (error) {
    // 23505 = unique_violation → data already exists, not a real error
    if (error.code === "23505") return;
    throw new Error(`Seed ${label}: ${error.message}`);
  }
}

export async function seedCopilotDataIfNeeded(): Promise<void> {
  await cleanupCopilotDemoClutter();

  // Clear stale v1/v2 keys so we re-seed with fixed UUIDs
  localStorage.removeItem("copilot_mock_seeded_v1");
  localStorage.removeItem("copilot_mock_seeded_v2");
  localStorage.removeItem(SEED_KEY); // clear v3 to force re-seed
  localStorage.removeItem(SEED_KEY_V4); // clear v4 — v5 introduces lifecycle buckets

  if (localStorage.getItem(SEED_KEY_V5) === "true") return;

  try {
    // 1. Routines — check first
    const { data: existingRoutines } = await supabase
      .from("rp_routines")
      .select("key")
      .eq("audience", "student")
      .limit(1);

    if (!existingRoutines || existingRoutines.length === 0) {
      await insertOrSkip("rp_routines", MOCK_ROUTINES as any[], "routines");
    }

    // 2. Threads — v5 reshapes the lifecycle (active / recent / archived).
    // For every mock thread: upsert by id so existing rows from v4 get the new
    // tool / scope_key / status / last_activity_at / archived_at backfilled.
    const { data: existingMockThreads } = await supabase
      .from("student_copilot_threads" as any)
      .select("id")
      .in("id", MOCK_THREADS.map(t => t.id));

    const existingIds = new Set((existingMockThreads ?? []).map((r: any) => r.id));
    const toInsert = MOCK_THREADS.filter(t => !existingIds.has(t.id));
    const toUpdate = MOCK_THREADS.filter(t => existingIds.has(t.id));

    if (toInsert.length > 0) {
      await insertOrSkip("student_copilot_threads", toInsert as any[], "threads (insert)");
    }

    // Backfill the lifecycle columns on every existing row.
    for (const t of toUpdate) {
      const { error } = await supabase
        .from("student_copilot_threads" as any)
        .update({
          tool: (t as any).tool,
          scope_key: (t as any).scope_key,
          scope_meta: (t as any).scope_meta,
          status: (t as any).status,
          last_activity_at: (t as any).last_activity_at,
          archived_at: (t as any).archived_at,
          title: t.title,
        })
        .eq("id", t.id);
      if (error) console.warn("Thread backfill warn:", t.id, error.message);
    }

    // Seed messages only when the original 6 mock threads are first inserted.
    if (toInsert.some(t => ["a0a0a0a0-1111-4000-8000-000000000001"].includes(t.id))) {
      await insertOrSkip("student_copilot_messages", MOCK_MESSAGES as any[], "messages");
    }

    // 3. Artifacts — seed independently of threads
    const { data: existingMockArtifacts } = await supabase
      .from("student_copilot_artifacts" as any)
      .select("id")
      .in("id", MOCK_ARTIFACTS.map(a => a.id))
      .limit(1);

    if (!existingMockArtifacts || existingMockArtifacts.length === 0) {
      await insertOrSkip("student_copilot_artifacts", MOCK_ARTIFACTS as any[], "artifacts");
    }

    // 4. Notifications — seed independently
    const { data: existingNotifs } = await supabase
      .from("student_notifications")
      .select("id")
      .eq("student_id", "student-001")
      .eq("dismissed", false)
      .limit(1);

    if (!existingNotifs || existingNotifs.length === 0) {
      await insertOrSkip("student_notifications", MOCK_NOTIFICATIONS as any[], "notifications");
    }

    // 5. Attempts — for mastery view
    const { data: existingAttempts } = await supabase
      .from("student_attempts")
      .select("id")
      .eq("student_id", "student-001")
      .limit(1);

    if (!existingAttempts || existingAttempts.length === 0) {
      await insertOrSkip("student_attempts", MOCK_ATTEMPTS as any[], "attempts");
    }

    // 6. Exams
    const { data: existingExams } = await supabase
      .from("student_exams")
      .select("id")
      .eq("student_id", "student-001")
      .limit(1);

    if (!existingExams || existingExams.length === 0) {
      await insertOrSkip("student_exams", MOCK_EXAMS as any[], "exams");
    }

    // Only mark as seeded if we got here without throwing
    localStorage.setItem(SEED_KEY_V5, "true");
    console.log("✅ Copilot mock data seeded successfully");
  } catch (err) {
    console.error("❌ Copilot seeder error (will retry next load):", err);
    // Do NOT set localStorage — allows retry on next page load
  }
}