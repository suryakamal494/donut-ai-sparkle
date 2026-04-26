import React, { useState, useMemo } from "react";
import { X, ChevronLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CopilotResource, StudentArtifact, StudentThread } from "./types";
import { isInlinePracticeArtifact } from "./artifactNormalizers";
import ArtifactCard from "./artifacts/ArtifactCard";
import StudentArtifactView from "./artifacts/ArtifactView";
import CopilotResourceCard from "./CopilotResourceCard";
import { artifactMatchesSubject, timeGroup } from "./libraryUtils";

interface Props {
  artifacts: StudentArtifact[];
  thread: StudentThread | null;
  threads?: StudentThread[];
  routineKey?: string;
  subjectFilter?: string | null;
  resources?: CopilotResource[];
  selectedArtifactId?: string | null;
  onClose?: () => void;
  onViewAll?: () => void;
  onOpenResource?: (resource: CopilotResource) => void;
  completedTasks?: Set<string>;
  onToggleTask?: (dayIndex: number, itemIndex: number) => void;
  onPracticeTopic?: (subject: string, topic: string) => void;
  onStartTask?: (artifact: StudentArtifact, taskDescription: string, dayIndex: number, itemIndex: number) => void;
  onOpenThread?: (threadId: string) => void;
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
  resources = [],
  selectedArtifactId,
  onClose,
  onViewAll,
  onOpenResource,
  completedTasks,
  onToggleTask,
  onPracticeTopic,
  onStartTask,
  onOpenThread,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedArtifactId) setSelectedId(selectedArtifactId);
  }, [selectedArtifactId]);

  // Filter artifacts by routine type and thread
  const filtered = useMemo(() => {
    let list = thread ? artifacts.filter((a) => a.thread_id === thread.id) : [];
    // Exclude chat-only artifacts from the pane
    list = list.filter((a) => a.type !== "clarifications" && !isInlinePracticeArtifact(a));
    list = list.filter((a) => artifactMatchesSubject(a, subjectFilter, threads));
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [artifacts, thread, subjectFilter, threads]);

  const threadArtifactIds = useMemo(() => new Set(filtered.map((artifact) => artifact.id)), [filtered]);

  const filteredResources = useMemo(() => {
    if (!thread) return [];
    return resources
      .filter((resource) => resource.thread_id === thread.id || (resource.artifact_id ? threadArtifactIds.has(resource.artifact_id) : false))
      .filter((resource) => !subjectFilter || resource.subject === subjectFilter)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [resources, subjectFilter, thread, threadArtifactIds]);

  const pinnedTarget = useMemo(() => {
    if (!thread) return null;
    return artifacts
      .filter((a) => a.type === "target_tracker" && a.thread_id === thread.id)
      .filter((a) => artifactMatchesSubject(a, subjectFilter, threads))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
  }, [artifacts, subjectFilter, thread, threads]);

  // Group by time
  const grouped = useMemo(() => {
    const groups: Record<string, StudentArtifact[]> = {};
    for (const a of filtered.filter((item) => item.id !== pinnedTarget?.id).slice(0, 10)) {
      const g = timeGroup(a.created_at);
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    }
    return groups;
  }, [filtered, pinnedTarget]);

  const visibleResources = useMemo(() => filteredResources.slice(0, Math.max(0, 10 - Object.values(grouped).reduce((total, items) => total + items.length, 0))), [filteredResources, grouped]);

  const groupedItemCount = useMemo(
    () => Object.values(grouped).reduce((total, items) => total + items.length, 0),
    [grouped]
  );
  const visibleLibraryCount = groupedItemCount + visibleResources.length + (pinnedTarget ? 1 : 0);
  const totalAvailableCount = filtered.filter((item) => item.id !== pinnedTarget?.id).length + filteredResources.length + (pinnedTarget ? 1 : 0);

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
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Library</p>
          <p className="text-[10px] text-muted-foreground">Saved outputs and learning resources</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {totalAvailableCount}
          </span>
          {onViewAll && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onViewAll}>
              View all
            </Button>
          )}
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
          {visibleLibraryCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm font-medium mb-1">No thread items yet</p>
              <p className="text-xs">Resources created in this chat will appear here</p>
            </div>
          )}
          {thread && groupedItemCount > 0 && (
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current session first</p>
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
          {visibleResources.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Recommended resources</p>
              <div className="space-y-1.5">
                {visibleResources.map((resource) => (
                  <CopilotResourceCard key={resource.id} resource={resource} compact onOpen={(item) => onOpenResource?.(item)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}