import React, { useState } from "react";
import { ExternalLink, FileText, Image as ImageIcon, Play, Presentation, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LearningResource } from "./types";
import ResourcePreviewDialog from "./ResourcePreviewDialog";

interface Props {
  resource: LearningResource;
  reason?: string;
}

const iconMap: Record<string, React.ElementType> = {
  ppt: Presentation,
  video: Video,
  pdf: FileText,
  animation: Play,
  iframe: Play,
  image: ImageIcon,
};

const labelMap: Record<string, string> = {
  ppt: "PowerPoint",
  video: "Video",
  pdf: "Document",
  animation: "Animation",
  iframe: "Interactive",
  image: "Image",
};

export default function InlineResourceCard({ resource, reason }: Props) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[resource.type] ?? FileText;
  const canOpen = Boolean(resource.embedUrl || resource.url);

  return (
    <>
      <button
        type="button"
        onClick={() => canOpen && setOpen(true)}
        className={cn(
          "w-full rounded-xl border bg-card p-3 text-left shadow-sm transition-colors",
          canOpen ? "hover:bg-muted/40" : "cursor-default"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>{labelMap[resource.type] ?? "Resource"}</span>
              {resource.subject && <span>• {resource.subject}</span>}
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">{resource.title}</p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {reason || resource.description || [resource.chapter, resource.topic].filter(Boolean).join(" • ")}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={(e) => { e.stopPropagation(); setOpen(true); }} disabled={!canOpen}>
            <ExternalLink className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Open</span>
          </Button>
        </div>
      </button>
      <ResourcePreviewDialog resource={resource} open={open} onOpenChange={setOpen} />
    </>
  );
}