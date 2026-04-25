// useStudentChat — streaming chat hook for student copilot
import { useState, useCallback, useRef } from "react";
import { insertMessage, updateThread, insertArtifact, fetchMessages } from "./api";
import { classifySubject, splitStoredContent, embedImages, buildAdaptivePracticeContext } from "./chatHelpers";
import type { StudentThread, StudentMessage, StudentArtifact, StudentRoutine } from "./types";

const ARTIFACT_RE = /__ARTIFACT__([\s\S]*?)__END__/g;

interface SendArgs {
  text: string;
  images?: string[];
  thread: StudentThread;
  routine: StudentRoutine | null;
  studentId: string;
  existingMessages: StudentMessage[];
  extraSystem?: string;
}

interface UseStudentChatReturn {
  streaming: boolean;
  streamedText: string;
  pendingArtifact: boolean;
  send: (args: SendArgs) => Promise<{
    assistantMessage: StudentMessage | null;
    artifacts: StudentArtifact[];
    detectedSubject: string | null;
  }>;
}

export function useStudentChat(): UseStudentChatReturn {
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [pendingArtifact, setPendingArtifact] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (args: SendArgs) => {
    const { text, images = [], thread, routine, studentId, existingMessages, extraSystem } = args;

    // Persist user message
    const storedContent = embedImages(text, images);
    await insertMessage(thread.id, "user", storedContent);
    const userActivityAt = new Date().toISOString();
    await updateThread(thread.id, {
      last_message_at: userActivityAt,
      last_activity_at: userActivityAt,
    });

    // Auto-title and auto-detect subject on first message
    let detectedSubject: string | null = null;
    const isFirst = existingMessages.length === 0;
    if (isFirst) {
      const title = text.slice(0, 60).trim() || "New chat";
      detectedSubject = classifySubject(text);
      await updateThread(thread.id, {
        title,
        ...(detectedSubject ? { subject: detectedSubject } : {}),
        last_message_at: userActivityAt,
        last_activity_at: userActivityAt,
      });
    }

    // Build messages array for API
    const apiMessages = existingMessages.map((m) => {
      const { text: t, images: imgs } = splitStoredContent(m.content);
      return {
        role: m.role,
        content: t,
        ...(imgs.length > 0 ? { images: imgs } : {}),
      };
    });
    apiMessages.push({
      role: "user",
      content: text,
      ...(images.length > 0 ? { images } : {}),
    });

    // Build system context — extraSystem now contains the full student context from orchestrator
    let fullExtraSystem = extraSystem ?? "";

    // Start streaming
    setStreaming(true);
    setStreamedText("");
    setPendingArtifact(false);

    const controller = new AbortController();
    abortRef.current = controller;

    let fullText = "";
    const collectedArtifacts: StudentArtifact[] = [];

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-copilot-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          thread_id: thread.id,
          student_id: studentId,
          routine_key: routine?.key ?? "s_doubt",
          messages: apiMessages,
          student_context: fullExtraSystem,
          extra_system: undefined,
        }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const errText = await resp.text().catch(() => "");
        console.error("Student copilot stream error:", resp.status, errText);
        setStreaming(false);
        return { assistantMessage: null, artifacts: [], detectedSubject };
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);

          // Detect artifact markers
          if (line.includes("__ARTIFACT__")) {
            setPendingArtifact(true);
            const match = ARTIFACT_RE.exec(line);
            if (match) {
              try {
                const artData = JSON.parse(match[1]);
                collectedArtifacts.push({
                  id: artData.id,
                  student_id: studentId,
                  thread_id: thread.id,
                  type: artData.type,
                  title: artData.title,
                  content: artData.content,
                  source: "ai",
                  created_at: new Date().toISOString(),
                });
              } catch { /* ignore parse errors */ }
            }
            ARTIFACT_RE.lastIndex = 0;
            setPendingArtifact(false);
            continue;
          }

          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          // Check for artifact creation events
          try {
            const parsed = JSON.parse(payload);
            if (parsed.sc_artifacts_created) continue;
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamedText(fullText);
            }
          } catch { /* partial JSON, ignore */ }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Stream error:", e);
      }
    }

    // Clean artifact markers from displayed text
    const cleanText = fullText.replace(ARTIFACT_RE, "").trim();

    // Persist assistant message
    let assistantMessage: StudentMessage | null = null;
    if (cleanText) {
      assistantMessage = await insertMessage(thread.id, "assistant", cleanText);
    }

    // Update thread timestamp
    const assistantActivityAt = new Date().toISOString();
    await updateThread(thread.id, {
      last_message_at: assistantActivityAt,
      last_activity_at: assistantActivityAt,
    });

    setStreaming(false);
    setStreamedText("");
    setPendingArtifact(false);

    return { assistantMessage, artifacts: collectedArtifacts, detectedSubject };
  }, []);

  return { streaming, streamedText, pendingArtifact, send };
}