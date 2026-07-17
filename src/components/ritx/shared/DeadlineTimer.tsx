import { useEffect, useState } from "react";
import { Clock, Lock, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeToDeadline, type StageForm } from "@/data/ritx/submissionData";

const toneClass: Record<string, string> = {
  safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  upcoming: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export function DeadlineTimer({ stage, className }: { stage: StageForm; className?: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const t = timeToDeadline(stage);
  const Icon = t.tone === "closed" ? Lock : t.tone === "upcoming" ? CalendarClock : Clock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium",
        toneClass[t.tone],
        className
      )}
      title={new Date(stage.deadlineAt).toLocaleString()}
    >
      <Icon className="w-3 h-3" />
      {t.label}
    </span>
  );
}