import React from "react";
import { ExternalLink, FileText, Image as ImageIcon, Play, Presentation, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LearningResource } from "./types";

interface Props {
  resource: LearningResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcon: Record<string, React.ElementType> = {
  ppt: Presentation,
  video: Video,
  pdf: FileText,
  animation: Play,
  iframe: Play,
  image: ImageIcon,
};

function viewerUrl(resource: LearningResource): string | undefined {
  if (resource.embedUrl) return resource.embedUrl;
  if (resource.type === "pdf" && resource.url) return `${resource.url}#toolbar=0`;
  if ((resource.type === "animation" || resource.type === "iframe") && resource.url) return resource.url;
  return undefined;
}

export default function ResourcePreviewDialog({ resource, open, onOpenChange }: Props) {
  if (!resource) return null;
  const Icon = typeIcon[resource.type] ?? FileText;
  const src = viewerUrl(resource);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] sm:max-w-5xl h-[88dvh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b pr-12">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base truncate">{resource.title}</DialogTitle>
              <p className="text-xs text-muted-foreground truncate">
                {[resource.subject, resource.chapter, resource.topic].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30">
          {resource.type === "image" && resource.url ? (
            <div className="h-full w-full flex items-center justify-center p-3 overflow-auto">
              <img src={resource.url} alt={resource.title} className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          ) : src ? (
            <iframe src={src} title={resource.title} className="h-full w-full min-h-[70dvh]" allowFullScreen />
          ) : (
            <div className="h-full min-h-[60dvh] flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Icon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Preview is not available here</p>
              {resource.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open original
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}