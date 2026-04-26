// Student Copilot — Left Rail (threads, tools, subject filter)
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Dumbbell, Target, Map, TrendingUp,
  ArrowLeft, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { StudentThread, StudentRoutine } from "./types";
import { SUBJECTS, DEFAULT_ROUTINE_KEY } from "./types";

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare, Dumbbell, Target, Map, TrendingUp,
};

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "bg-blue-500",
  Chemistry: "bg-emerald-500",
  Math: "bg-violet-500",
  Biology: "bg-rose-500",
  English: "bg-amber-500",
};

interface Props {
  routines: StudentRoutine[];
  threads: StudentThread[];
  currentThreadId: string | null;
  subjectFilter: string | null;
  onNewThread: (routineKey?: string) => void;
  onSelectThread: (id: string) => void;
  onSubjectFilter: (subject: string | null) => void;
  onClose?: () => void;
}

const StudentLeftRail: React.FC<Props> = ({
  routines,
  threads,
  currentThreadId,
  subjectFilter,
  onNewThread,
  onSelectThread,
  onSubjectFilter,
  onClose,
}) => {
  const navigate = useNavigate();

  const toolRoutines = useMemo(
    () => routines.filter((r) => r.key !== DEFAULT_ROUTINE_KEY),
    [routines]
  );

  const filteredThreads = useMemo(() => {
    if (!subjectFilter) return threads;
    return threads.filter((t) => t.subject === subjectFilter);
  }, [threads, subjectFilter]);

  // Group by lifecycle status (Rule 5). Threads without a `status` are
  // treated as `active` for backward compatibility.
  const grouped = useMemo(() => {
    const buckets: Record<"active" | "recent" | "archived", StudentThread[]> = {
      active: [],
      recent: [],
      archived: [],
    };
    for (const t of filteredThreads) {
      // Unstatused threads are auto-created by the router; they haven't been
      // touched by the lifecycle sweep yet, so the safe bucket is "recent"
      // (not "active"). Active is reserved for sessions explicitly being
      // worked on today.
      const s = (t.status as "active" | "recent" | "archived") ?? "recent";
      (buckets[s] ?? buckets.recent).push(t);
    }
    return buckets;
  }, [filteredThreads]);

  // Single-expand accordion state for the lifecycle buckets (Rule 5).
  // Default to whichever bucket has content, preferring active → recent → archived.
  type Bucket = "active" | "recent" | "archived";
  const [expandedBucket, setExpandedBucket] = React.useState<Bucket | null>(() => {
    if (grouped.active.length > 0) return "active";
    if (grouped.recent.length > 0) return "recent";
    return "archived";
  });

  useEffect(() => {
    if (expandedBucket === null) return;
    if (grouped[expandedBucket].length > 0) return;
    if (grouped.active.length > 0) {
      setExpandedBucket("active");
      return;
    }
    if (grouped.recent.length > 0) {
      setExpandedBucket("recent");
      return;
    }
    if (grouped.archived.length > 0) {
      setExpandedBucket("archived");
      return;
    }
    setExpandedBucket(null);
  }, [expandedBucket, grouped]);

  const toggleBucket = (b: Bucket) =>
    setExpandedBucket((prev) => (prev === b ? null : b));

  const handleThreadClick = (id: string) => {
    onSelectThread(id);
    onClose?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Exit Copilot */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => { navigate("/student/dashboard"); onClose?.(); }}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Copilot
        </button>
      </div>

      {/* Subject filter chips — wrapped so students can see every subject without horizontal scrolling. */}
      <div className="px-3 py-2 border-t">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSubjectFilter(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              !subjectFilter
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => onSubjectFilter(subjectFilter === s ? null : s)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                subjectFilter === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", SUBJECT_COLORS[s])} />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* History — grouped by lifecycle status (Rule 5). */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 py-2 space-y-1.5">
          {filteredThreads.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              {subjectFilter ? `No ${subjectFilter} conversations. Tap All to see every thread.` : "No conversations yet"}
            </p>
          )}

          {/* Single-expand accordion. Clicking another bucket auto-collapses the open one. */}
          <LifecycleSection
            bucket="active"
            label="Active"
            tone="active"
            threads={grouped.active}
            isOpen={expandedBucket === "active"}
            onToggle={() => toggleBucket("active")}
            currentThreadId={currentThreadId}
            onSelect={handleThreadClick}
            emptyHint="No active sessions — start a chat to begin."
          />
          <LifecycleSection
            bucket="recent"
            label="Recent"
            tone="recent"
            threads={grouped.recent}
            isOpen={expandedBucket === "recent"}
            onToggle={() => toggleBucket("recent")}
            currentThreadId={currentThreadId}
            onSelect={handleThreadClick}
            emptyHint="Nothing in the last 7 days."
          />
          <LifecycleSection
            bucket="archived"
            label="Archived"
            tone="archived"
            threads={grouped.archived}
            isOpen={expandedBucket === "archived"}
            onToggle={() => toggleBucket("archived")}
            currentThreadId={currentThreadId}
            onSelect={handleThreadClick}
            emptyHint="No archived sessions yet."
          />
        </div>
      </ScrollArea>

      {/* Quick Tools — escape hatch for direct tool access.
          Stays at the bottom by design (Rule 1: chat is the primary path),
          but styled to look intentional, not faded. */}
      <div className="shrink-0 border-t-2 border-border bg-background px-3 pt-2.5 pb-3 space-y-0.5">
        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider px-2 mb-1.5">
          Quick tools
        </p>
        {toolRoutines.map((r) => {
          const Icon = ICON_MAP[r.icon] ?? MessageSquare;
          return (
            <button
              key={r.key}
              onClick={() => { onNewThread(r.key); onClose?.(); }}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm text-foreground/90 hover:bg-donut-coral/10 hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4 flex-shrink-0 text-donut-coral/80" />
              <span className="truncate font-medium">{r.label}</span>
            </button>
          );
        })}
        <p className="text-[10px] text-muted-foreground/80 px-2 pt-1.5 leading-snug">
          Start focused work. Useful outputs are saved to Library.
        </p>
      </div>
    </div>
  );
};

// ─── Lifecycle accordion section ───
interface LifecycleSectionProps {
  bucket: "active" | "recent" | "archived";
  label: string;
  tone: "active" | "recent" | "archived";
  threads: StudentThread[];
  isOpen: boolean;
  onToggle: () => void;
  currentThreadId: string | null;
  onSelect: (id: string) => void;
  emptyHint?: string;
}

const TONE_STYLES: Record<
  "active" | "recent" | "archived",
  { dot: string; pillBg: string; pillText: string }
> = {
  active:   { dot: "bg-emerald-500", pillBg: "bg-emerald-500/15",  pillText: "text-emerald-700 dark:text-emerald-400" },
  recent:   { dot: "bg-amber-500",   pillBg: "bg-amber-500/15",    pillText: "text-amber-700 dark:text-amber-400" },
  archived: { dot: "bg-muted-foreground/50", pillBg: "bg-muted",  pillText: "text-muted-foreground" },
};

const LifecycleSection: React.FC<LifecycleSectionProps> = ({
  bucket,
  label,
  tone,
  threads,
  isOpen,
  onToggle,
  currentThreadId,
  onSelect,
  emptyHint,
}) => {
  const isEmpty = threads.length === 0;
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 overflow-hidden bg-card transition-shadow",
        isOpen && "shadow-sm",
      )}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors",
          isOpen ? "bg-muted/70" : "bg-muted/30 hover:bg-muted/50",
        )}
      >
        <ChevronRight
          className={cn(
            "w-4 h-4 flex-shrink-0 text-foreground transition-transform",
            isOpen && "rotate-90",
            isEmpty && "opacity-50",
          )}
        />
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", styles.dot)} />
        <span className="text-sm font-bold text-foreground tracking-tight">
          {label}
        </span>
        <span
          className={cn(
            "ml-auto text-[11px] font-semibold rounded-full px-2 py-0.5 min-w-[24px] text-center",
            styles.pillBg,
            styles.pillText,
          )}
        >
          {threads.length}
        </span>
      </button>

      {isOpen && (
        <div className="px-1.5 py-1.5 space-y-0.5 bg-background">
          {isEmpty ? (
            <p className="text-[11px] text-muted-foreground/70 px-2 py-2 italic">
              {emptyHint}
            </p>
          ) : (
            threads.map((t) => {
              const isCurrent = t.id === currentThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                    isCurrent
                      ? "bg-donut-coral/10 text-foreground font-medium border-l-2 border-donut-coral"
                      : "text-foreground/85 hover:bg-muted/60 hover:text-foreground",
                    bucket === "active" && !isCurrent && "border-l-2 border-transparent hover:border-donut-coral/40",
                  )}
                >
                  {t.subject && (
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", SUBJECT_COLORS[t.subject] ?? "bg-muted")} />
                  )}
                  <span className="truncate">{t.title}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(StudentLeftRail);