import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CopilotResource, StudentArtifact, StudentThread } from "./types";
import { SUBJECTS } from "./types";
import ArtifactCard from "./artifacts/ArtifactCard";
import CopilotResourceCard from "./CopilotResourceCard";
import { artifactMatchesSubject, timeGroup } from "./libraryUtils";

const TIME_FILTERS = ["All", "Today", "This Week", "Last Month"] as const;
const TYPE_FILTERS = ["All", "Explainer", "Solution", "Formula", "Practice", "Plan", "Target", "Report", "PPT", "Video", "Animation", "PDF", "Image"] as const;

type LibraryEntry =
  | { kind: "artifact"; id: string; created_at: string; artifact: StudentArtifact; searchable: string; typeLabel: string }
  | { kind: "resource"; id: string; created_at: string; resource: CopilotResource; searchable: string; typeLabel: string };

const artifactTypeLabel: Record<string, string> = {
  concept_explainer: "Explainer",
  worked_solution: "Solution",
  formula_sheet: "Formula",
  practice_session: "Practice",
  study_plan: "Plan",
  target_tracker: "Target",
  mastery_map: "Report",
  progress_report: "Report",
  test_debrief: "Report",
};

function inTimeFilter(date: string, filter: string): boolean {
  if (filter === "All") return true;
  const diffDays = (Date.now() - new Date(date).getTime()) / 86400000;
  if (filter === "Today") return diffDays < 1;
  if (filter === "This Week") return diffDays < 7;
  if (filter === "Last Month") return diffDays < 31;
  return true;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifacts: StudentArtifact[];
  resources: CopilotResource[];
  threads: StudentThread[];
  currentThreadId?: string | null;
  subjectFilter?: string | null;
  onOpenArtifact: (artifact: StudentArtifact) => void;
  onOpenResource: (resource: CopilotResource) => void;
}

export default function CopilotLibraryDialog({ open, onOpenChange, artifacts, resources, threads, currentThreadId, subjectFilter, onOpenArtifact, onOpenResource }: Props) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string | null>(subjectFilter ?? null);
  const [type, setType] = useState<string>("All");
  const [time, setTime] = useState<string>("All");

  const threadArtifactIds = useMemo(
    () => new Set(artifacts.filter((artifact) => artifact.thread_id === currentThreadId).map((artifact) => artifact.id)),
    [artifacts, currentThreadId]
  );

  React.useEffect(() => {
    if (open) setSubject(subjectFilter ?? null);
  }, [open, subjectFilter]);

  const entries = useMemo<LibraryEntry[]>(() => {
    const artifactEntries: LibraryEntry[] = artifacts
      .filter((artifact) => Boolean(currentThreadId) && artifact.thread_id === currentThreadId)
      .filter((a) => a.type !== "clarifications")
      .map((artifact) => ({
        kind: "artifact",
        id: artifact.id,
        created_at: artifact.created_at,
        artifact,
        typeLabel: artifactTypeLabel[artifact.type] ?? artifact.type,
        searchable: `${artifact.title} ${artifact.type} ${JSON.stringify(artifact.content ?? {})}`,
      }));

    const resourceEntries: LibraryEntry[] = resources
      .filter((resource) => Boolean(currentThreadId) && (resource.thread_id === currentThreadId || (resource.artifact_id ? threadArtifactIds.has(resource.artifact_id) : false)))
      .map((resource) => ({
        kind: "resource",
        id: resource.id,
        created_at: resource.created_at,
        resource,
        typeLabel: resource.type.toUpperCase() === "PPT" ? "PPT" : resource.type.charAt(0).toUpperCase() + resource.type.slice(1),
        searchable: `${resource.title} ${resource.subject} ${resource.chapter ?? ""} ${resource.topic ?? ""} ${resource.description}`,
      }));

    return [...artifactEntries, ...resourceEntries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [artifacts, currentThreadId, resources, threadArtifactIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (entry.kind === "artifact" && !artifactMatchesSubject(entry.artifact, subject, threads)) return false;
      if (entry.kind === "resource" && subject && entry.resource.subject !== subject) return false;
      if (type !== "All" && entry.typeLabel.toLowerCase() !== type.toLowerCase()) return false;
      if (!inTimeFilter(entry.created_at, time)) return false;
      if (q && !entry.searchable.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, query, subject, threads, time, type]);

  const grouped = useMemo(() => {
    const groups: Record<string, LibraryEntry[]> = {};
    for (const entry of filtered) {
      const group = timeGroup(entry.created_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(entry);
    }
    return groups;
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] w-[calc(100vw-1rem)] max-w-5xl flex-col overflow-hidden p-0 sm:w-full">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle>Copilot Library</DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">Saved Copilot outputs and recommended learning resources.</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search library by title, topic, chapter…" className="pl-9" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <FilterChip label="All subjects" active={!subject} onClick={() => setSubject(null)} />
            {SUBJECTS.map((s) => <FilterChip key={s} label={s} active={subject === s} onClick={() => setSubject(subject === s ? null : s)} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((item) => <FilterChip key={item} label={item} active={type === item} onClick={() => setType(item)} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TIME_FILTERS.map((item) => <FilterChip key={item} label={item} active={time === item} onClick={() => setTime(item)} />)}
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3 sm:p-4">
            <div className="mb-3 text-xs font-medium text-muted-foreground">{filtered.length} items</div>
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No matching library items</div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([group, items]) => (
                  <section key={group}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((entry) => entry.kind === "artifact" ? (
                        <ArtifactCard key={entry.id} artifact={entry.artifact} onClick={() => onOpenArtifact(entry.artifact)} />
                      ) : (
                        <CopilotResourceCard key={entry.id} resource={entry.resource} onOpen={onOpenResource} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
    </button>
  );
}
