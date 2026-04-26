import React, { useState, useMemo } from "react";
import { X, ChevronLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StudentArtifact, StudentThread } from "./types";
import { ROUTINE_ARTIFACT_TYPES, SUBJECTS } from "./types";
import { isInlinePracticeArtifact } from "./artifactNormalizers";
import ArtifactCard from "./artifacts/ArtifactCard";
import StudentArtifactView from "./artifacts/ArtifactView";

interface Props {
  artifacts: StudentArtifact[];
  thread: StudentThread | null;
  threads?: StudentThread[];
  routineKey?: string;
  subjectFilter?: string | null;
  onClose?: () => void;
  completedTasks?: Set<string>;
  onToggleTask?: (dayIndex: number, itemIndex: number) => void;
  onPracticeTopic?: (subject: string, topic: string) => void;
  onStartTask?: (artifact: StudentArtifact, taskDescription: string, dayIndex: number, itemIndex: number) => void;
  onOpenThread?: (threadId: string) => void;
}

function timeGroup(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = diff / 86400000;
  if (days < 1) return "Today";
  if (days < 7) return "This Week";
  return "Older";
}

function valueHasSubject(value: unknown, subject: string): boolean {
  if (!value) return false;
  if (typeof value === "string") return value.toLowerCase().includes(subject.toLowerCase());
  if (Array.isArray(value)) return value.some((item) => valueHasSubject(item, subject));
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((item) => valueHasSubject(item, subject));
  return false;
}

function artifactMatchesSubject(
  artifact: StudentArtifact,
  subject: string | null | undefined,
  threads: StudentThread[]
): boolean {
  if (!subject) return true;
  const linkedThread = artifact.thread_id ? threads.find((t) => t.id === artifact.thread_id) : null;
  if (linkedThread?.subject === subject) return true;
  const content = artifact.content as Record<string, unknown> | null;
  if (content?.subject === subject) return true;
  if (valueHasSubject(content?.subjects, subject)) return true;
  if (valueHasSubject(artifact.title, subject)) return true;
  return SUBJECTS.some((s) => s === subject) && valueHasSubject(content, subject);
}

function targetScoreLabel(artifact: StudentArtifact): string {
  const content = artifact.content as Record<string, any>;
  const current = content?.current_score;
  const target = content?.target_score;
  if (current != null && target != null) return `${current} → ${target}`;
  return "Target";
}

function targetTitle(artifact: StudentArtifact): string {
  const content = artifact.content as Record<string, any>;
  const exam = content?.exam_name ?? content?.exam ?? artifact.title;
  const target = content?.target_score;
  return target != null ? `${exam} — Target ${target}` : exam;
}

export default function StudentArtifactPane({
  artifacts,
  thread,
  threads = [],
  routineKey,
  subjectFilter,
  onClose,
  completedTasks,
  onToggleTask,
  onPracticeTopic,
  onStartTask,
  onOpenThread,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter artifacts by routine type and thread
  const filtered = useMemo(() => {
    let list = artifacts;
    // Exclude chat-only artifacts from the pane
    list = list.filter((a) => a.type !== "clarifications" && !isInlinePracticeArtifact(a));
    // If viewing a thread, show that thread's artifacts first
    if (thread) {
      const threadArtifacts = list.filter((a) => a.thread_id === thread.id);
      // If the thread has artifacts, show them; otherwise fall back to all recent artifacts
      if (threadArtifacts.length > 0) {
        list = threadArtifacts;
      }
      // else: keep all artifacts as fallback so pane isn't empty
    }
    // Filter by routine artifact types if applicable
    if (routineKey && ROUTINE_ARTIFACT_TYPES[routineKey]) {
      const allowedTypes = ROUTINE_ARTIFACT_TYPES[routineKey];
      list = list.filter((a) => allowedTypes.includes(a.type as any));
    }
    list = list.filter((a) => artifactMatchesSubject(a, subjectFilter, threads));
    return list;
  }, [artifacts, thread, routineKey, subjectFilter, threads]);

  const pinnedTarget = useMemo(() => {
    return artifacts
      .filter((a) => a.type === "target_tracker")
      .filter((a) => artifactMatchesSubject(a, subjectFilter, threads))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
  }, [artifacts, subjectFilter, threads]);

  // Group by time
  const grouped = useMemo(() => {
    const groups: Record<string, StudentArtifact[]> = {};
    for (const a of filtered.filter((item) => item.id !== pinnedTarget?.id)) {
      const g = timeGroup(a.created_at);
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    }
    return groups;
  }, [filtered, pinnedTarget]);

  const selectedArtifact = selectedId ? artifacts.find((a) => a.id === selectedId) ?? null : null;

  // Detail view
  if (selectedArtifact) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 border-b shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedId(null)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-xs font-medium text-foreground truncate flex-1">{selectedArtifact.title}</p>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3">
            <StudentArtifactView
              artifact={selectedArtifact}
              completedTasks={completedTasks}
              onToggleTask={onToggleTask}
              onPracticeTopic={onPracticeTopic}
              onStartTask={onStartTask}
            />
          </div>
        </ScrollArea>
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <p className="text-sm font-semibold text-foreground">Library</p>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {filtered.length}
          </span>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {pinnedTarget && (
            <button
              type="button"
              onClick={() => pinnedTarget.thread_id ? onOpenThread?.(pinnedTarget.thread_id) : setSelectedId(pinnedTarget.id)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Pinned · Target
                </div>
                <span className="text-sm tabular-nums text-muted-foreground">{targetScoreLabel(pinnedTarget)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-snug text-foreground">{targetTitle(pinnedTarget)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, Math.max(0, Math.round((((pinnedTarget.content as any)?.current_score ?? 0) / ((pinnedTarget.content as any)?.target_score || (pinnedTarget.content as any)?.max_score || 100)) * 100)))}%`,
                  }}
                />
              </div>
            </button>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm font-medium mb-1">No library items yet</p>
              <p className="text-xs">Saved study materials will appear here</p>
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{group}</p>
              <div className="space-y-1.5">
                {items.map((a) => (
                  <ArtifactCard
                    key={a.id}
                    artifact={a}
                    selected={selectedId === a.id}
                    onClick={() => setSelectedId(a.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}