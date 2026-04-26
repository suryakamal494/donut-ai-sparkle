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
import type { CopilotResource, StudentMessage, StudentArtifact, StudentRoutine, ClarificationContent } from "./types";
import type { PracticeState } from "./useInlinePractice";
import CopilotResourceCard from "./CopilotResourceCard";

interface Props {
  messages: StudentMessage[];
  streaming: boolean;
  streamedText: string;
  pendingArtifact: boolean;
  artifacts: StudentArtifact[];
  resources?: CopilotResource[];
  routine: StudentRoutine | null;
  quickStartChips?: string[];
  practiceStates: Record<string, PracticeState>;
  onSend: (text: string) => void;
  onPracticeAnswer: (artifactId: string, given: string, correct: boolean) => void;
  onPracticeNext: (artifactId: string) => void;
  onPracticeRetry: (artifactId: string) => void;
  onClarificationSubmit: (artifactId: string, answers: Record<string, string | string[]>) => void;
  onPracticeWeak?: (topic: string) => void;
  onOpenResource?: (resource: CopilotResource) => void;
}

const ChatMessageList: React.FC<Props> = ({
  messages,
  streaming,
  streamedText,
  pendingArtifact,
  artifacts,
  resources = [],
  routine,
  quickStartChips,
  practiceStates,
  onSend,
  onPracticeAnswer,
  onPracticeNext,
  onPracticeRetry,
  onClarificationSubmit,
  onPracticeWeak,
  onOpenResource,
}) => {
  // Pre-build lookup maps for practice and clarification artifacts to avoid O(n²) per render
  const practiceArtifactMap = useMemo(() => {
    const map = new Map<string, StudentArtifact>();
    const practiceArts = artifacts.filter(isInlinePracticeArtifact);
    for (const a of practiceArts) {
      const candidates = messages.filter((m) => m.role === "assistant" && m.thread_id === a.thread_id);
      const nearest = candidates.reduce<StudentMessage | null>((best, msg) => {
        const diff = Math.abs(new Date(a.created_at).getTime() - new Date(msg.created_at).getTime());
        if (diff > 120000) return best;
        if (!best) return msg;
        const bestDiff = Math.abs(new Date(a.created_at).getTime() - new Date(best.created_at).getTime());
        return diff < bestDiff ? msg : best;
      }, null);
      if (nearest) map.set(nearest.id, a);
    }
    return map;
  }, [artifacts, messages]);

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
    return practiceArtifactMap.get(msg.id) ?? null;
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

  const findRecommendedResources = (msg: StudentMessage): CopilotResource[] => {
    if (msg.role !== "assistant" || !resources.length) return [];
    const text = msg.content.toLowerCase();
    return resources
      .filter((resource) => {
        if (resource.thread_id && resource.thread_id === msg.thread_id) return true;
        const terms = [resource.topic, resource.chapter, resource.subject, ...resource.title.split(/\s+/).filter((part) => part.length > 5)]
          .filter(Boolean)
          .map((part) => String(part).toLowerCase());
        return terms.some((term) => text.includes(term));
      })
      .slice(0, 2);
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
        const recommendedResources = findRecommendedResources(msg);

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
                    const visibleQuestions = ps.questions.slice(0, Math.max(1, ps.visibleCount));
                    return (
                      <div className="space-y-3">
                        {visibleQuestions.map((q, qIndex) => (
                          <InlinePracticeCard
                            key={`${practiceArtifact.id}-${qIndex}`}
                            question={q}
                            index={qIndex}
                            total={ps.questions.length}
                            result={ps.results[qIndex]}
                            answered={Boolean(ps.results[qIndex])}
                            isActive={qIndex === visibleQuestions.length - 1 && !ps.results[qIndex]}
                            onAnswer={(given, correct) =>
                              onPracticeAnswer(practiceArtifact.id, given, correct)
                            }
                            onNext={() => onPracticeNext(practiceArtifact.id)}
                          />
                        ))}
                        {ps.finished && (
                          <PracticeSummaryCard
                            results={ps.results}
                            subject={(practiceArtifact.content as any)?.subject}
                            onRetry={() => onPracticeRetry(practiceArtifact.id)}
                            onPracticeWeak={onPracticeWeak}
                          />
                        )}
                      </div>
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

            {recommendedResources.length > 0 && onOpenResource && (
              <div className="flex justify-start">
                <div className="w-full max-w-[90%] space-y-1.5 md:max-w-[80%]">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended resource</p>
                  {recommendedResources.map((resource) => (
                    <CopilotResourceCard key={`${msg.id}-${resource.id}`} resource={resource} compact onOpen={onOpenResource} />
                  ))}
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

      {/* Pending library item skeleton */}
      {pendingArtifact && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-donut-coral/30 bg-donut-coral/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-donut-coral">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving to library…
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ChatMessageList);