// Student Copilot — Chat Pane (center panel)
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Paperclip, Menu, PanelRight, Sparkles, X, Plus, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ChatMessageList from "./ChatMessageList";
import type { CopilotResource, StudentThread, StudentMessage, StudentRoutine, StudentArtifact, StudentNotification } from "./types";
import type { PracticeState } from "./useInlinePractice";
import ProactiveCards from "./ProactiveCards";
import { studentProfile } from "@/data/student/profile";

interface Props {
  thread: StudentThread | null;
  routine: StudentRoutine | null;
  messages: StudentMessage[];
  streaming: boolean;
  streamedText: string;
  pendingArtifact: boolean;
  artifacts: StudentArtifact[];
  resources?: CopilotResource[];
  onOpenResource?: (resource: CopilotResource) => void;
  onSend: (text: string, images?: string[]) => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onNewThread: () => void;
  quickStartChips?: string[];
  practiceStates: Record<string, PracticeState>;
  onPracticeAnswer: (artifactId: string, given: string, correct: boolean) => void;
  onPracticeNext: (artifactId: string) => void;
  onPracticeRetry: (artifactId: string) => void;
  onClarificationSubmit: (artifactId: string, answers: Record<string, string | string[]>) => void;
  onPracticeWeak?: (topic: string) => void;
  notifications?: StudentNotification[];
  onNotificationAction?: (notif: StudentNotification) => void;
  onNotificationDismiss?: (notifId: string) => void;
  /** Optional continuation banner rendered above the message list when the
   *  router resumed an existing session. */
  continuationBanner?: React.ReactNode;
}

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

const StudentChatPane: React.FC<Props> = ({
  thread,
  routine,
  messages,
  streaming,
  streamedText,
  pendingArtifact,
  artifacts,
  resources = [],
  onOpenResource,
  onSend,
  onToggleLeft,
  onToggleRight,
  onNewThread,
  quickStartChips,
  practiceStates,
  onPracticeAnswer,
  onPracticeNext,
  onPracticeRetry,
  onClarificationSubmit,
  onPracticeWeak,
  notifications = [],
  onNotificationAction,
  onNotificationDismiss,
  continuationBanner,
}) => {
  const [input, setInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages.length, streamedText]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed && attachedImages.length === 0) return;
    if (streaming) return;
    onSend(trimmed, attachedImages.length > 0 ? attachedImages : undefined);
    setInput("");
    setAttachedImages([]);
  }, [input, attachedImages, streaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (attachedImages.length >= MAX_IMAGES) break;
      if (file.size > MAX_IMAGE_SIZE) continue;
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImages((prev) =>
          prev.length < MAX_IMAGES ? [...prev, reader.result as string] : prev
        );
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    for (const file of files) {
      if (attachedImages.length >= MAX_IMAGES) break;
      if (file.size > MAX_IMAGE_SIZE) continue;
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImages((prev) =>
          prev.length < MAX_IMAGES ? [...prev, reader.result as string] : prev
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/") && attachedImages.length < MAX_IMAGES) {
        const file = item.getAsFile();
        if (!file || file.size > MAX_IMAGE_SIZE) continue;
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedImages((prev) =>
            prev.length < MAX_IMAGES ? [...prev, reader.result as string] : prev
          );
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // No thread selected — welcome screen
  if (!thread) {
    return (
      <div className="flex-1 flex flex-col">
        <CopilotTopBar
          onToggleLeft={onToggleLeft}
          onToggleRight={onToggleRight}
          onNewThread={onNewThread}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-donut-coral to-donut-orange flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Welcome back! 👋</h2>
            <p className="text-sm text-muted-foreground">
              Start a new chat, practice, or plan your study roadmap.
            </p>
            {/* Proactive cards on welcome screen */}
            {notifications.length > 0 && onNotificationAction && onNotificationDismiss && (
              <div className="mt-6 text-left">
                <ProactiveCards
                  notifications={notifications}
                  onAction={onNotificationAction}
                  onDismiss={onNotificationDismiss}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CopilotTopBar
        onToggleLeft={onToggleLeft}
        onToggleRight={onToggleRight}
        onNewThread={onNewThread}
      />
      {/* Sub-header — routine pill + thread title (only when in a thread). */}
      <div className="px-4 py-1.5 border-b bg-card/20 flex items-center gap-2 min-w-0 flex-shrink-0">
        {routine && (
          <span className="text-xs font-medium text-donut-coral bg-donut-coral/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            {routine.label}
          </span>
        )}
        <span className="text-sm font-medium truncate text-foreground/85">{thread.title}</span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {continuationBanner}
        <ChatMessageList
          messages={messages}
          streaming={streaming}
          streamedText={streamedText}
          pendingArtifact={pendingArtifact}
          artifacts={artifacts}
          resources={resources}
          onOpenResource={onOpenResource}
          routine={routine}
          quickStartChips={quickStartChips}
          practiceStates={practiceStates}
          onSend={(text) => onSend(text)}
          onPracticeAnswer={onPracticeAnswer}
          onPracticeNext={onPracticeNext}
          onPracticeRetry={onPracticeRetry}
          onClarificationSubmit={onClarificationSubmit}
          onPracticeWeak={onPracticeWeak}
        />
      </div>

      {/* Composer */}
      <div className="border-t bg-background p-3">
        {/* Image previews */}
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-2">
            {attachedImages.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="w-14 h-14 object-cover rounded-lg" />
                <button
                  onClick={() => setAttachedImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
            onClick={() => fileRef.current?.click()}
            disabled={attachedImages.length >= MAX_IMAGES}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask a doubt, request practice…"
            className="min-h-[40px] max-h-[120px] resize-none text-sm rounded-xl"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachedImages.length === 0) || streaming}
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0 bg-gradient-to-r from-donut-coral to-donut-orange text-white hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudentChatPane);

// ─── Shared top bar ─────────────────────────────────────────────────────
// Profile + new-chat + panel toggles. Lives at the top of the chat pane
// (welcome and in-thread alike) so the left rail can stay slim.
interface TopBarProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onNewThread: () => void;
}

const CopilotTopBar: React.FC<TopBarProps> = ({ onToggleLeft, onToggleRight, onNewThread }) => {
  return (
    <div className="h-14 px-3 border-b bg-card/30 flex items-center gap-2 flex-shrink-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleLeft}
        className="h-9 w-9 p-0 flex-shrink-0"
        aria-label="Toggle history"
      >
        <Menu className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-donut-coral to-donut-orange flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold truncate">{studentProfile.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{studentProfile.grade}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNewThread}
        className="h-9 w-9 p-0 flex-shrink-0 text-foreground hover:bg-donut-coral/10 hover:text-donut-coral"
        aria-label="Start new chat"
        title="New chat (⌘K)"
      >
        <Plus className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleRight}
        className="h-9 w-9 p-0 flex-shrink-0 hidden lg:inline-flex"
        aria-label="Toggle library panel"
        title="Library"
      >
        <PanelRight className="w-4 h-4" />
      </Button>
    </div>
  );
};