import { useMemo, useState } from "react";
import { Search, Plus, Check, Video, FileText, Presentation, Play, Image as ImageIcon, Link2, Eye, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getContentForChapter,
  addContentToLibrary,
  generateContentId,
} from "@/data/contentLibraryHelpers";
import type { ContentItem } from "@/data/contentLibraryData";

const TYPE_META: Record<
  ContentItem["type"],
  { label: string; icon: typeof Video; color: string }
> = {
  ppt: { label: "PPT", icon: Presentation, color: "text-orange-600" },
  pdf: { label: "PDF", icon: FileText, color: "text-blue-600" },
  video: { label: "Video", icon: Video, color: "text-red-600" },
  animation: { label: "Animation", icon: Play, color: "text-green-600" },
  image: { label: "Image", icon: ImageIcon, color: "text-purple-600" },
};

const TYPE_FILTERS: Array<{ value: "all" | ContentItem["type"]; label: string }> = [
  { value: "all", label: "All" },
  { value: "ppt", label: "PPT" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Video" },
  { value: "animation", label: "Animation" },
  { value: "image", label: "Image" },
];

interface ChapterContentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  chapterName: string;
  pathLabel: string; // e.g. "CBSE › Mathematics › Class 6 › Knowing Our Numbers"
  onAttach: (items: ContentItem[]) => void;
}

export const ChapterContentSheet = ({
  open,
  onOpenChange,
  subjectName,
  chapterName,
  pathLabel,
  onAttach,
}: ChapterContentSheetProps) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"library" | "quick">("library");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ContentItem["type"]>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  // Quick-add form
  const [qaTitle, setQaTitle] = useState("");
  const [qaType, setQaType] = useState<ContentItem["type"]>("ppt");
  const [qaUrl, setQaUrl] = useState("");

  const libraryItems = useMemo(
    () => getContentForChapter(subjectName, chapterName),
    [subjectName, chapterName, open], // re-read when sheet re-opens (in case Quick add pushed new items)
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return libraryItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [libraryItems, search, typeFilter]);

  const reset = () => {
    setSelected(new Set());
    setSearch("");
    setTypeFilter("all");
    setQaTitle("");
    setQaUrl("");
    setQaType("ppt");
    setTab("library");
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAttachLibrary = () => {
    if (selected.size === 0) return;
    const items = libraryItems.filter((i) => selected.has(i.id));
    onAttach(items);
    reset();
    onOpenChange(false);
  };

  const handleQuickAdd = () => {
    if (!qaTitle.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const newItem: ContentItem = {
      id: generateContentId(),
      title: qaTitle.trim(),
      type: qaType,
      subject: subjectName,
      chapter: chapterName,
      description: qaUrl.trim() || undefined,
    };
    addContentToLibrary(newItem);
    onAttach([newItem]);
    toast({
      title: "Added to library",
      description: `${newItem.title} is now available in ${chapterName}.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-base">Add content</SheetTitle>
          <SheetDescription className="text-[11px] text-muted-foreground truncate">
            {pathLabel}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "library" | "quick")} className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 pt-3 shrink-0">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="library" className="text-xs">
                Library ({libraryItems.length})
              </TabsTrigger>
              <TabsTrigger value="quick" className="text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Quick add
              </TabsTrigger>
            </TabsList>
          </div>

          {/* LIBRARY TAB */}
          <TabsContent value="library" className="flex-1 min-h-0 flex flex-col mt-3 data-[state=inactive]:hidden">
            <div className="px-4 space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search this chapter's content…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <ToggleGroup
                type="single"
                value={typeFilter}
                onValueChange={(v) => v && setTypeFilter(v as typeof typeFilter)}
                className="flex flex-wrap justify-start gap-1"
              >
                {TYPE_FILTERS.map((f) => (
                  <ToggleGroupItem
                    key={f.value}
                    value={f.value}
                    className="h-7 px-2.5 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {f.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <ScrollArea className="flex-1 min-h-0 mt-2">
              <div className="px-4 pb-4 space-y-2">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    <p className="font-medium mb-1">No content for this chapter yet</p>
                    <p className="text-xs">
                      Switch to <span className="font-medium">Quick add</span> to attach one.
                    </p>
                  </div>
                ) : (
                  filtered.map((item) => {
                    const meta = TYPE_META[item.type];
                    const Icon = meta.icon;
                    const isSelected = selected.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "group w-full p-3 rounded-lg border transition-all flex gap-3 items-start",
                          isSelected
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/60 hover:border-primary/30 bg-background",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          className="flex gap-3 items-start min-w-0 flex-1 text-left"
                        >
                          <Checkbox checked={isSelected} className="mt-0.5 shrink-0 pointer-events-none" />
                          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-muted", meta.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <Badge variant="outline" className="h-4 text-[10px] px-1.5">
                                {meta.label}
                              </Badge>
                              {item.duration && (
                                <span className="text-[10px] text-muted-foreground">{item.duration}</span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPreviewItem(item);
                                }}
                                className="ml-auto inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </button>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t shrink-0">
              <Button
                className="w-full gap-2"
                onClick={handleAttachLibrary}
                disabled={selected.size === 0}
              >
                <Check className="w-4 h-4" />
                Add {selected.size > 0 ? selected.size : ""} item{selected.size === 1 ? "" : "s"}
              </Button>
            </div>
          </TabsContent>

          {/* QUICK ADD TAB */}
          <TabsContent value="quick" className="flex-1 min-h-0 flex flex-col mt-3 data-[state=inactive]:hidden">
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 pb-4 space-y-4">
                <div className="rounded-md border bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Will be saved under
                  </p>
                  <p className="text-xs font-medium text-foreground truncate">{pathLabel}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Title
                  </label>
                  <Input
                    value={qaTitle}
                    onChange={(e) => setQaTitle(e.target.value)}
                    placeholder="e.g. Knowing our Numbers — Intro slides"
                    className="h-9"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Type
                  </label>
                  <ToggleGroup
                    type="single"
                    value={qaType}
                    onValueChange={(v) => v && setQaType(v as ContentItem["type"])}
                    className="flex flex-wrap justify-start gap-1"
                  >
                    {(Object.keys(TYPE_META) as ContentItem["type"][]).map((t) => {
                      const m = TYPE_META[t];
                      const Icon = m.icon;
                      return (
                        <ToggleGroupItem
                          key={t}
                          value={t}
                          className="h-8 px-2.5 gap-1.5 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {m.label}
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> URL or link
                  </label>
                  <Input
                    value={qaUrl}
                    onChange={(e) => setQaUrl(e.target.value)}
                    placeholder="https://…"
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Paste a YouTube, Drive, or document link. We'll attach it as-is.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="p-3 border-t shrink-0">
              <Button
                className="w-full gap-2"
                onClick={handleQuickAdd}
                disabled={!qaTitle.trim()}
              >
                <Plus className="w-4 h-4" />
                Save & attach
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
      <ContentPreviewDialog
        item={previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      />
    </Sheet>
  );
};

// ----------------------------------------------------------------
// Preview dialog — renders inline depending on content type. Lives
// alongside the sheet so dismissing the dialog never closes the
// sheet (Radix Dialog/Sheet are independent overlays).
// ----------------------------------------------------------------

interface ContentPreviewDialogProps {
  item: ContentItem | null;
  onOpenChange: (open: boolean) => void;
}

const toEmbed = (url: string, type: ContentItem["type"]): string => {
  if (!url) return url;
  if (type === "video") {
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
  }
  return url;
};

const ContentPreviewDialog = ({ item, onOpenChange }: ContentPreviewDialogProps) => {
  if (!item) return null;
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const url = item.previewUrl ?? "";
  const embed = toEmbed(url, item.type);

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-sm flex items-center gap-2">
            <span className={cn("w-7 h-7 rounded-md flex items-center justify-center bg-muted", meta.color)}>
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="truncate">{item.title}</span>
            <Badge variant="outline" className="h-5 text-[10px] ml-auto mr-6">{meta.label}</Badge>
          </DialogTitle>
          {item.description && (
            <DialogDescription className="text-[11px] truncate">
              {item.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="bg-muted/40 w-full" style={{ aspectRatio: "16 / 9" }}>
          {url ? (
            item.type === "image" ? (
              <img
                src={url}
                alt={item.title}
                className="w-full h-full object-contain bg-black/5"
              />
            ) : (
              <iframe
                key={item.id}
                src={embed}
                title={item.title}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No preview available
            </div>
          )}
        </div>

        {url && (
          <div className="px-4 py-2 border-t flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground truncate">{url}</p>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1 text-[11px] shrink-0"
            >
              <a href={url} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};