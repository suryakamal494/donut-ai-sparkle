import React from "react";
import { FileText, Image, Play, Presentation, Video, Headphones, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CopilotResource } from "./types";

const iconMap: Record<CopilotResource["type"], React.ElementType> = {
  ppt: Presentation,
  video: Video,
  animation: Play,
  pdf: FileText,
  image: Image,
  audio: Headphones,
};

interface Props {
  resource: CopilotResource;
  compact?: boolean;
  onOpen: (resource: CopilotResource) => void;
}

export default function CopilotResourceCard({ resource, compact, onOpen }: Props) {
  const Icon = iconMap[resource.type] ?? FileText;

  return (
    <button
      type="button"
      onClick={() => onOpen(resource)}
      className={cn(
        "group w-full overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:bg-muted/40",
        compact ? "p-2" : "p-3"
      )}
    >
      <div className="flex gap-2.5">
        <div className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-muted text-primary",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}>
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            {resource.type} · {resource.subject}
            {resource.duration ? <span className="normal-case tracking-normal">· {resource.duration}</span> : null}
          </div>
          <p className={cn("mt-1 font-semibold leading-snug text-foreground", compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm")}>
            {resource.title}
          </p>
          {!compact && <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{resource.description}</p>}
        </div>
      </div>
    </button>
  );
}
