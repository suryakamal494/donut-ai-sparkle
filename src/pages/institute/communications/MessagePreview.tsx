// WhatsApp-style message preview bubble (always visible)
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessagePreviewProps {
  body: string;
  className?: string;
  /** compact reduces padding for dense lists */
  compact?: boolean;
}

const MessagePreview = ({ body, className, compact }: MessagePreviewProps) => {
  return (
    <div
      className={cn(
        "rounded-xl p-3 bg-[#e7f7e3] dark:bg-emerald-950/30 border border-emerald-200/60",
        compact && "p-2.5",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35))",
      }}
    >
      <div className="rounded-lg bg-card shadow-sm px-3 py-2 max-w-full">
        <p
          className={cn(
            "whitespace-pre-line break-words text-foreground/90 leading-relaxed",
            compact ? "text-xs" : "text-[13px]",
          )}
        >
          {body}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-muted-foreground">
          <span>12:30 PM</span>
          <CheckCheck className="w-3 h-3 text-sky-500" />
        </div>
      </div>
      <p className="text-[10px] text-emerald-700/70 mt-1.5 flex items-center gap-1">
        <Check className="w-3 h-3" /> Preview of the message recipients receive
      </p>
    </div>
  );
};

export default MessagePreview;
