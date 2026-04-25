import React, { useState, useMemo } from "react";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StudentArtifact, StudentThread } from "./types";
import { ROUTINE_ARTIFACT_TYPES } from "./types";
import { isInlinePracticeArtifact } from "./artifactNormalizers";
import ArtifactCard from "./artifacts/ArtifactCard";
import StudentArtifactView from "./artifacts/ArtifactView";

interface Props {
  artifacts: StudentArtifact[];
  thread: StudentThread | null;
  routineKey?: string;
  onClose?: () => void;
  completedTasks?: Set<string>;
  onToggleTask?: (dayIndex: number, itemIndex: number) => void;
  onPracticeTopic?: (subject: string, topic: string) => void;
  onStartTask?: (taskDescription: string, dayIndex: number, itemIndex: number) => void;
}

function timeGroup(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = diff / 86400000;
  if (days < 1) return "Today";
  if (days < 7) return "This Week";
  return "Older";
}

export default function StudentArtifactPane({
  artifacts,
  thread,
  routineKey,
  onClose,
  completedTasks,
  onToggleTask,
  onPracticeTopic,
  onStartTask,
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
    return list;
  }, [artifacts, thread, routineKey]);

  // Group by time
  const grouped = useMemo(() => {
    const groups: Record<string, StudentArtifact[]> = {};
    for (const a of filtered) {
      const g = timeGroup(a.created_at);
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    }
    return groups;
  }, [filtered]);

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
        <p className="text-sm font-semibold text-foreground">Artifacts</p>
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
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm font-medium mb-1">No artifacts yet</p>
              <p className="text-xs">Generated artifacts will appear here</p>
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