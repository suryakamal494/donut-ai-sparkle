import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Image, Play, Video, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CopilotResource } from "./types";
import PptMiniPreview from "./PptMiniPreview";

interface Props {
  resource: CopilotResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CopilotResourceViewer({ resource, open, onOpenChange }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);

  React.useEffect(() => {
    if (open) setSlideIndex(0);
  }, [open, resource?.id]);

  if (!resource) return null;

  const slideCount = resource.slides?.length ?? 0;
  const canSlide = resource.type === "ppt" && slideCount > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-4xl flex-col overflow-hidden p-0 sm:w-full">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="line-clamp-2 text-base sm:text-lg">{resource.title}</DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {resource.type.toUpperCase()} · {resource.subject}{resource.chapter ? ` · ${resource.chapter}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {resource.type === "ppt" ? (
            <div className="space-y-3">
              <PptMiniPreview resource={resource} slideIndex={slideIndex} />
              {canSlide && (
                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={() => setSlideIndex((v) => Math.max(0, v - 1))} disabled={slideIndex === 0}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">{slideIndex + 1} / {slideCount}</span>
                  <Button variant="outline" size="sm" onClick={() => setSlideIndex((v) => Math.min(slideCount - 1, v + 1))} disabled={slideIndex >= slideCount - 1}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 p-6 text-center">
              {resource.type === "video" ? <Video className="h-12 w-12 text-primary" /> : resource.type === "animation" ? <Play className="h-12 w-12 text-primary" /> : resource.type === "image" ? <Image className="h-12 w-12 text-primary" /> : <FileText className="h-12 w-12 text-primary" />}
              <div>
                <p className="text-sm font-semibold text-foreground">{resource.type === "video" ? "Video preview" : resource.type === "animation" ? "Animation preview" : resource.type === "image" ? "Image preview" : "Document preview"}</p>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">{resource.description}</p>
              </div>
              {resource.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={resource.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open original
                  </a>
                </Button>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{resource.description}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Focus areas</p>
              <div className="mt-2 space-y-1.5">
                {(resource.objectives ?? [resource.topic, resource.chapter].filter(Boolean) as string[]).map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
