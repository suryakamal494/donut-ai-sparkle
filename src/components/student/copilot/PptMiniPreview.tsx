import React from "react";
import { Presentation } from "lucide-react";
import type { CopilotResource } from "./types";

interface Props {
  resource: CopilotResource;
  slideIndex?: number;
}

export default function PptMiniPreview({ resource, slideIndex = 0 }: Props) {
  const slide = resource.slides?.[slideIndex] ?? resource.slides?.[0];

  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card to-muted p-3 shadow-sm">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Presentation className="h-3.5 w-3.5 text-primary" />
          Slide {slideIndex + 1} / {Math.max(1, resource.slides?.length ?? 1)}
        </div>
        <div className="mt-3 grid flex-1 grid-cols-[1.2fr_0.8fr] gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-foreground">{slide?.title ?? resource.title}</p>
            {slide?.subtitle && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{slide.subtitle}</p>}
            <div className="mt-2 space-y-1">
              {(slide?.bullets ?? resource.objectives ?? []).slice(0, 3).map((item) => (
                <div key={item} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center rounded-md bg-primary/10 px-2 text-center text-[11px] font-medium text-primary">
            {slide?.visual ?? resource.type.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
