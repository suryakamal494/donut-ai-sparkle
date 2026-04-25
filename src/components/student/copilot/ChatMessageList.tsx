// ChatMessageList — extracted message rendering with inline interactive cards
import React, { useMemo } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MathMarkdown from "./MathMarkdown";
import InlinePracticeCard from "./InlinePracticeCard";
import PracticeSummaryCard from "./PracticeSummaryCard";
import ClarificationCard from "./ClarificationCard";
import { splitStoredContent } from "./chatHelpers";
import { isInlinePracticeArtifact } from "./artifactNormalizers";
import type { StudentMessage, StudentArtifact, StudentRoutine, ClarificationContent } from "./types";
import type { PracticeState } from "./useInlinePractice";

interface Props {
  messages: StudentMessage[];
  streaming: boolean;
  streamedText: string;
  pendingArtifact: boolean;
  artifacts: StudentArtifact[];
  routine: StudentRoutine | null;
  quickStartChips?: string[];
  practiceStates: Record<string, PracticeState>;
  onSend: (text: string) => void;
  onPracticeAnswer: (artifactId: string, given: string, correct: boolean) => void;
  onPracticeNext: (artifactId: string) => void;
  onPracticeRetry: (artifactId: string) => void;
  onClarificationSubmit: (artifactId: string, answers: Record<string, string | string[]>) => void;
  onPracticeWeak?: (topic: string) => void;
}

const ChatMessageList: React.FC<Props> = ({
  messages,
  streaming,
  streamedText,
  pendingArtifact,
  artifacts,
  routine,
  quickStartChips,
  practiceStates,
  onSend,
  onPracticeAnswer,
  onPracticeNext,
  onPracticeRetry,
  onClarificationSubmit,
  onPracticeWeak,
}) => {
  // Pre-build lookup maps for practice and clarification artifacts to avoid O(n²) per render
  const practiceArtifactMap = useMemo(() => {
    const map = new Map<string, StudentArtifact>();
    const practiceArts = artifacts.filter(isInlinePracticeArtifact);
    // Build a simple thread-based lookup
    for (const a of practiceArts) {
      if (a.thread_id) {
        // Use thread_id as key — works for single practice per thread
        const existing = map.get(a.thread_id);
        if (!existing || new Date(a.created_at) > new Date(existing.created_at)) {
          map.set(a.thread_id, a);
        }
      }
    }
    return map;
  }, [artifacts]);

  const clarificationArtifactMap = useMemo(() => {
    const map = new Map<string, StudentArtifact>();
    const clarArts = artifacts.filter((a) => a.type === "clarifications");
    for (const a of clarArts) {
      if (a.thread_id) {
        const existing = map.get(a.thread_id);
        if (!existing || new Date(a.created_at) > new Date(existing.created_at)) {
          map.set(a.thread_id, a);
        }
      }
    }
    return map;
  }, [artifacts]);

  const findPracticeArtifact = (msg: StudentMessage): StudentArtifact | null => {
    if (msg.role !== "assistant") return null;
    const candidate = practiceArtifactMap.get(msg.thread_id);
    if (candidate && Math.abs(new Date(candidate.created_at).getTime() - new Date(msg.created_at).getTime()) < 120000) {
      return candidate;
    }
    // Fallback for multiple practice artifacts in same thread
    return artifacts.find(
        (a) =>
          isInlinePracticeArtifact(a) &&
          a.thread_id === msg.thread_id &&
          Math.abs(new Date(a.created_at).getTime() - new Date(msg.created_at).getTime()) < 120000
    ) ?? null;
  };

  const findClarificationArtifact = (msg: StudentMessage): StudentArtifact | null => {
    if (msg.role !== "assistant") return null;
    const candidate = clarificationArtifactMap.get(msg.thread_id);
    if (candidate && Math.abs(new Date(candidate.created_at).getTime() - new Date(msg.created_at).getTime()) < 120000) {
      return candidate;
    }
    return artifacts.find(
        (a) =>
          a.type === "clarifications" &&
          a.thread_id === msg.thread_id &&
          Math.abs(new Date(a.created_at).getTime() - new Date(msg.created_at).getTime()) < 120000
    ) ?? null;
  };

  return (
    <>
      {/* Empty thread — quick start chips */}
      {messages.length === 0 && !streaming && (
        <div className="flex flex-col items-center justify-center py-12">
          <Sparkles className="w-10 h-10 text-donut-coral mb-3" />
          {routine && (
            <>
              <h3 className="text-lg font-semibold mb-1">{routine.label}</h3>
              {routine.description && (
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
                  {routine.description}
                </p>
              )}
            </>
          )}
          {quickStartChips && quickStartChips.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {quickStartChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => onSend(chip)}
                  className="px-3 py-1.5 rounded-full border text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors min-h-[36px]"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message bubbles */}
      {messages.map((msg) => {
        const { text, images } = splitStoredContent(msg.content);
        const isUser = msg.role === "user";
        const practiceArtifact = findPracticeArtifact(msg);
        const clarificationArtifact = findClarificationArtifact(msg);

        return (
          <React.Fragment key={msg.id}>
            <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5",
                  isUser
                    ? "bg-gradient-to-br from-donut-coral to-donut-orange text-white rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                {images.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {images.map((img, i) => (
                      <img key={i} src={img} alt="Attached" className="w-24 h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                ) : (
                  <MathMarkdown compact className={cn(!isUser && "text-foreground")}>
                    {text}
                  </MathMarkdown>
                )}
              </div>
            </div>

            {/* Inline practice card */}
            {practiceArtifact && practiceStates[practiceArtifact.id] && (
              <div className="flex justify-start">
                <div className="max-w-[90%] md:max-w-[80%]">
                  {(() => {
                    const ps = practiceStates[practiceArtifact.id];
                    if (ps.finished) {
                      return (
                        <PracticeSummaryCard
                          results={ps.results}
                          subject={(practiceArtifact.content as any)?.subject}
                          onRetry={() => onPracticeRetry(practiceArtifact.id)}
                          onPracticeWeak={onPracticeWeak}
                        />
                      );
                    }
                    const q = ps.questions[ps.currentIndex];
                    if (!q) return null;
                    return (
                      <InlinePracticeCard
                        question={q}
                        index={ps.currentIndex}
                        total={ps.questions.length}
                        answered={ps.results.length > ps.currentIndex}
                        onAnswer={(given, correct) =>
                          onPracticeAnswer(practiceArtifact.id, given, correct)
                        }
                        onNext={() => onPracticeNext(practiceArtifact.id)}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Inline clarification card */}
            {clarificationArtifact && (
              <div className="flex justify-start">
                <div className="max-w-[90%] md:max-w-[80%]">
                  <ClarificationCard
                    content={clarificationArtifact.content as ClarificationContent}
                    onSubmit={(answers) =>
                      onClarificationSubmit(clarificationArtifact.id, answers)
                    }
                    disabled={(clarificationArtifact.content as ClarificationContent)?.answered}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Streaming bubble */}
      {streaming && (
        <div className="flex justify-start">
          <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
            {streamedText ? (
              <MathMarkdown compact>{streamedText}</MathMarkdown>
            ) : (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-donut-coral animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-donut-coral animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-donut-coral animate-bounce [animation-delay:300ms]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending artifact skeleton */}
      {pendingArtifact && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-donut-coral/30 bg-donut-coral/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-donut-coral">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating artifact…
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ChatMessageList);