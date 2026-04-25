// Student Copilot — Main 3-panel layout (orchestrator)
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { studentProfile } from "@/data/student/profile";
import StudentLeftRail from "./StudentLeftRail";
import StudentChatPane from "./StudentChatPane";
import StudentArtifactPane from "./StudentArtifactPane";
import { useStudentChat } from "./useStudentChat";
import { useInlinePractice } from "./useInlinePractice";
import {
  fetchStudentRoutines,
  fetchThreads,
  createThread,
  fetchMessages,
  fetchArtifacts,
  updateArtifactContent,
} from "./api";
import {
  fetchTopicMastery,
  fetchNotifications,
  dismissNotification,
} from "./api";
import type { StudentThread, StudentMessage, StudentRoutine, StudentArtifact, TopicMastery, StudentNotification } from "./types";
import { DEFAULT_ROUTINE_KEY } from "./types";
import { buildFullStudentContext } from "./context";
import { buildAdaptivePracticeContext } from "./chatHelpers";
import { seedCopilotDataIfNeeded } from "./seedCopilotData";
import { route as routeMessage, archiveStaleThreads } from "./router/sessionRouter";
import type { RouteDecision } from "./types";
import ContinuationBanner from "./ContinuationBanner";

const STUDENT_ID = studentProfile.id;

const CONTEXTUAL_FOLLOW_UP_RE = /^(?:[a-d]|option\s*[a-d]|answer\s*[a-d]|next|continue|yes|no|ok(?:ay)?|explain(?:\s+this)?|why|how|start\s+day\s+\d+|teach\s+this(?:\s+topic)?|i\s+(?:do\s+not|don't)\s+understand)\b/i;

function isContextualFollowUp(text: string): boolean {
  return CONTEXTUAL_FOLLOW_UP_RE.test(text.trim());
}

function isDefaultEmptyThread(thread: StudentThread, messageCount: number): boolean {
  return messageCount === 0 && thread.routine_key === DEFAULT_ROUTINE_KEY;
}

const StudentCopilotPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [routines, setRoutines] = useState<StudentRoutine[]>([]);
  const [threads, setThreads] = useState<StudentThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [artifacts, setArtifacts] = useState<StudentArtifact[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  // Last router decision (for the continuation banner). Cleared when the
  // user starts fresh or sends another message.
  const [lastDecision, setLastDecision] = useState<RouteDecision | null>(null);
  // When set, the next send forces a brand-new thread (escape hatch).
  const forceNewRef = useRef(false);
  // Ref for messages to avoid stale closure in handleSend
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Panel visibility
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);

  // Chat hook
  const { streaming, streamedText, pendingArtifact, send } = useStudentChat();

  // Mastery & notifications state
  const [mastery, setMastery] = useState<TopicMastery[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);

  // Practice hook
  const { practiceStates, startPractice, answerQuestion, nextQuestion, resetPractice } =
    useInlinePractice(STUDENT_ID);

  // Current thread/routine
  const currentThread = useMemo(
    () => threads.find((t) => t.id === currentThreadId) ?? null,
    [threads, currentThreadId]
  );
  const currentRoutine = useMemo(() => {
    if (!currentThread) return routines.find((r) => r.key === DEFAULT_ROUTINE_KEY) ?? null;
    return routines.find((r) => r.key === currentThread.routine_key) ?? null;
  }, [currentThread, routines]);

  // Quick start chips
  const quickStartChips = useMemo(() => {
    if (!currentRoutine?.quick_start_chips) return [];
    const chips = currentRoutine.quick_start_chips;
    if (Array.isArray(chips)) return chips as string[];
    return [];
  }, [currentRoutine]);

  // Track if we've handled the initial query params
  const initialParamsHandled = useRef(false);

  // Initial data load
  useEffect(() => {
    (async () => {
      await seedCopilotDataIfNeeded();
      // Lifecycle sweep — auto-archives stale threads (Rule 8).
      await archiveStaleThreads(STUDENT_ID);
      const [rts, ths, arts, mast, notifs] = await Promise.all([
        fetchStudentRoutines(),
        fetchThreads(STUDENT_ID),
        fetchArtifacts(STUDENT_ID),
        fetchTopicMastery(STUDENT_ID),
        fetchNotifications(STUDENT_ID),
      ]);
      setRoutines(rts);
      setThreads(ths);
      setArtifacts(arts);
      setMastery(mast);
      setNotifications(notifs);
    })();
  }, []);

  // Handle query params from dashboard deep-links
  useEffect(() => {
    if (initialParamsHandled.current) return;
    if (routines.length === 0) return; // Wait for routines to load

    // New contract: dashboards use ?intent=<scope-hinted-prompt>.
    // Legacy ?routine=...&prompt=... is still accepted and routed the same way.
    const intent = searchParams.get('intent');
    const legacyRoutine = searchParams.get('routine');
    const legacyPrompt = searchParams.get('prompt');
    const threadParam = searchParams.get('thread');
    const prompt = intent ?? legacyPrompt;
    if (!prompt && !legacyRoutine && !threadParam) return;

    initialParamsHandled.current = true;

    // Clear search params from URL
    setSearchParams({}, { replace: true });

    const subject = searchParams.get('subject');
    if (subject) setSubjectFilter(subject);

    // Route the deep-link prompt — resume or create automatically.
    (async () => {
      // Direct-thread deep-link (e.g. RecentCopilotCard "Resume").
      if (threadParam && !prompt) {
        setCurrentThreadId(threadParam);
        return;
      }
      if (!prompt) return;
      // Defer to handleSend so the same router path is used everywhere.
      // We need handleSend to be defined first; the effect re-runs once it is
      // because `send` is in its dependency list.
      handleSend(prompt);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routines, searchParams]);

  // Load messages when thread changes
  useEffect(() => {
    if (!currentThreadId) {
      setMessages([]);
      return;
    }
    (async () => {
      const msgs = await fetchMessages(currentThreadId);
      setMessages(msgs);
    })();
  }, [currentThreadId]);

  // Build full student context with mastery data
  const studentContext = useMemo(() => {
    const base = buildFullStudentContext(mastery);
    const adaptive = buildAdaptivePracticeContext(mastery);
    return adaptive ? `${base}\n\n${adaptive}` : base;
  }, [mastery]);

  // Keyboard shortcut: Cmd+K → new chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNewThread();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [routines]);

  // Refresh mastery after practice completes
  const refreshMastery = useCallback(async () => {
    const mast = await fetchTopicMastery(STUDENT_ID);
    setMastery(mast);
  }, []);

  const handleNewThread = useCallback(
    async (routineKey?: string) => {
      const key = routineKey ?? DEFAULT_ROUTINE_KEY;
      const routine = routines.find((r) => r.key === key);
      const title = routine ? `New ${routine.label} chat` : "New chat";
      const thread = await createThread(STUDENT_ID, key, title, subjectFilter);
      if (thread) {
        setThreads((prev) => [thread, ...prev]);
        setCurrentThreadId(thread.id);
        setMessages([]);
      }
    },
    [routines, subjectFilter]
  );

  const handleSend = useCallback(
    async (text: string, images?: string[]) => {
      // ── ROUTER PATH ─────────────────────────────────────────────────────
      // Every send goes through the router. It decides resume-vs-new.
      // The student never picks a thread.
      const decision = await routeMessage(text, {
        studentId: STUDENT_ID,
        fallbackSubject: subjectFilter,
        forceNew: forceNewRef.current,
      });
      forceNewRef.current = false;

      // If the decision picked a different (or new) thread, switch to it and
      // load its existing messages (if any).
      let activeThread: StudentThread | null = null;
      if (decision.threadId !== currentThread?.id) {
        // Fetch the canonical thread row (esp. if it was just created).
        const ths = await fetchThreads(STUDENT_ID);
        setThreads(ths);
        activeThread = ths.find((t) => t.id === decision.threadId) ?? null;
        setCurrentThreadId(decision.threadId);
        const existingMsgs = decision.isNew ? [] : await fetchMessages(decision.threadId);
        setMessages(existingMsgs);
      } else {
        activeThread = currentThread;
      }
      setLastDecision(decision.isNew ? null : decision);

      if (!activeThread) return;

      // Pick the routine for the chat hook based on the routed tool.
      const routedRoutine =
        routines.find((r) => r.key === activeThread.routine_key) ?? currentRoutine;

      // Optimistic user message.
      const tempUserMsg: StudentMessage = {
        id: `temp-${Date.now()}`,
        thread_id: activeThread.id,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Prepare existing messages context for the model (when resuming).
      const baseMessages = decision.isNew
        ? []
        : (await fetchMessages(activeThread.id)).filter((m) => m.id !== tempUserMsg.id);

      const result = await send({
        text,
        images,
        thread: activeThread,
        routine: routedRoutine ?? null,
        studentId: STUDENT_ID,
        existingMessages: baseMessages,
        extraSystem: studentContext,
      });

      const msgs = await fetchMessages(activeThread.id);
      setMessages(msgs);

      if (result.artifacts.length > 0) {
        setArtifacts((prev) => [...result.artifacts, ...prev]);
      }
    },
    [currentThread, currentRoutine, routines, subjectFilter, send, studentContext]
  );

  // Escape hatch — the "Start fresh" link in the continuation banner.
  const handleStartFresh = useCallback(() => {
    forceNewRef.current = true;
    setCurrentThreadId(null);
    setMessages([]);
    setLastDecision(null);
  }, []);

  // Auto-start practice when a new practice_session artifact appears.
  // Only depend on artifacts — not practiceStates, to avoid infinite loops.
  useEffect(() => {
    for (const a of artifacts) {
      if (a.type === "practice_session" && !practiceStates[a.id]) {
        const content = a.content as any;
        if (content?.questions?.length > 0) {
          startPractice(a);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts, startPractice]);

  // Refresh mastery when any practice finishes — separate effect to avoid loops
  useEffect(() => {
    for (const [artId, state] of Object.entries(practiceStates)) {
      if (!state?.finished) continue;
      const art = artifacts.find((a) => a.id === artId);
      if (art) {
        refreshMastery();
        return; // Only refresh once per cycle
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceStates]);

  const handleClarificationSubmit = useCallback(
    async (artifactId: string, answers: Record<string, string | string[]>) => {
      // Mark artifact as answered
      const artifact = artifacts.find((a) => a.id === artifactId);
      if (!artifact) return;
      const updatedContent = { ...(artifact.content as any), answered: true };
      await updateArtifactContent(artifactId, updatedContent);
      setArtifacts((prev) =>
        prev.map((a) => (a.id === artifactId ? { ...a, content: updatedContent } : a))
      );

      // Format answers and send as user message
      const lines = Object.entries(answers)
        .map(([, v]) => (Array.isArray(v) ? v.join(", ") : v))
        .join("\n");
      handleSend(lines);
    },
    [artifacts, handleSend]
  );

  const handlePracticeWeak = useCallback(
    (topic: string) => {
      handleSend(`Practice more on ${topic}`);
    },
    [handleSend]
  );

  const handleStartTask = useCallback(
    (taskDescription: string, _dayIndex: number, _itemIndex: number) => {
      handleSend(`Teach me about: ${taskDescription}`);
    },
    [handleSend]
  );

  const handleDismissNotification = useCallback(async (notifId: string) => {
    await dismissNotification(notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  const handleNotificationAction = useCallback((notif: StudentNotification) => {
    const routineMap: Record<string, string> = {
      homework: "s_practice",
      exam_reminder: "s_exam_prep",
      chapter_today: "s_doubt",
      debrief_available: "s_progress",
    };
    const routineKey = routineMap[notif.type] ?? DEFAULT_ROUTINE_KEY;
    handleNewThread(routineKey);
    setTimeout(() => {
      const prompt = notif.body ?? notif.title;
      handleSend(prompt);
    }, 300);
  }, [handleNewThread, handleSend]);

  const handleSelectThread = useCallback((id: string) => {
    setCurrentThreadId(id);
  }, []);

  const toggleLeft = useCallback(() => {
    if (isMobile) {
      setLeftSheetOpen((v) => !v);
    } else {
      setLeftVisible((v) => !v);
    }
  }, [isMobile]);

  const toggleRight = useCallback(() => {
    setRightVisible((v) => !v);
  }, []);

  const railProps = {
    routines,
    threads,
    currentThreadId,
    subjectFilter,
    onNewThread: handleNewThread,
    onSelectThread: handleSelectThread,
    onSubjectFilter: setSubjectFilter,
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Desktop left rail */}
      {!isMobile && leftVisible && (
        <div className="hidden md:flex w-[260px] flex-shrink-0 border-r bg-card/40 flex-col">
          <StudentLeftRail {...railProps} />
        </div>
      )}

      {/* Mobile left sheet */}
      {isMobile && (
        <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <StudentLeftRail {...railProps} onClose={() => setLeftSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Center chat pane */}
      <div className="flex-1 min-w-0 flex flex-col border-r">
        <StudentChatPane
          thread={currentThread}
          routine={currentRoutine}
          messages={messages}
          streaming={streaming}
          streamedText={streamedText}
          pendingArtifact={pendingArtifact}
          artifacts={artifacts}
          onSend={handleSend}
          onToggleLeft={toggleLeft}
          onToggleRight={toggleRight}
          onNewThread={() => handleNewThread()}
          quickStartChips={quickStartChips}
          practiceStates={practiceStates}
          onPracticeAnswer={answerQuestion}
          onPracticeNext={nextQuestion}
          onPracticeRetry={resetPractice}
          onClarificationSubmit={handleClarificationSubmit}
          onPracticeWeak={handlePracticeWeak}
          notifications={notifications}
          onNotificationAction={handleNotificationAction}
          onNotificationDismiss={handleDismissNotification}
          continuationBanner={
            lastDecision && currentThread
              ? (
                <ContinuationBanner
                  threadTitle={lastDecision.matchedThreadTitle ?? currentThread.title}
                  toolLabel={lastDecision.tool}
                  onStartFresh={handleStartFresh}
                />
              )
              : null
          }
        />
      </div>

      {/* Desktop right artifact pane */}
      {!isMobile && rightVisible && (
        <div className="hidden lg:flex w-[360px] flex-shrink-0 bg-card/40 flex-col">
          <StudentArtifactPane
            artifacts={artifacts}
            thread={currentThread}
            routineKey={currentRoutine?.key}
            onClose={toggleRight}
            onStartTask={handleStartTask}
          />
        </div>
      )}
    </div>
  );
};

export default StudentCopilotPage;