import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileWarning } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  url?: string;
  mime?: string;
}

function ytEmbed(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export function ResourcePreviewDialog({ open, onOpenChange, title, url, mime }: Props) {
  const isYouTube = url ? /youtube\.com|youtu\.be/.test(url) : false;
  const isImage = mime?.startsWith("image/");
  const isVideo = mime?.startsWith("video/") && !isYouTube;
  const isPdf = mime === "application/pdf";
  const isOffice = mime && /(msword|officedocument|powerpoint|excel)/.test(mime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[92vw] h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 py-2.5 border-b flex-row items-center justify-between gap-2 space-y-0">
          <DialogTitle className="text-sm font-medium truncate">{title}</DialogTitle>
          {url && (
            <div className="flex items-center gap-1 pr-6">
              <Button size="sm" variant="ghost" asChild>
                <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1" />Open</a>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={url} download><Download className="w-3.5 h-3.5 mr-1" />Download</a>
              </Button>
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30">
          {!url ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileWarning className="w-6 h-6" />
              No preview available for this resource.
            </div>
          ) : isYouTube ? (
            <iframe src={ytEmbed(url)} className="w-full h-full" title={title} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img src={url} alt={title} className="max-w-full max-h-full object-contain" />
            </div>
          ) : isVideo ? (
            <video controls src={url} className="w-full h-full bg-black" />
          ) : isPdf ? (
            <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-full h-full bg-white" title={title} />
          ) : isOffice ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
              className="w-full h-full bg-white"
              title={title}
            />
          ) : (
            <iframe src={url} className="w-full h-full bg-white" title={title} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}