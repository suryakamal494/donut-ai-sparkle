import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { InfoTooltip } from "@/components/timetable/InfoTooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChapterStudentBucket } from "@/data/teacher/reportsData";
import { FLAG_META } from "@/lib/performanceIndex";

const bandStyles: Record<string, { dot: string; border: string; bg: string; badge: string }> = {
  mastery: { dot: "bg-emerald-500", border: "border-l-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  stable: { dot: "bg-teal-500", border: "border-l-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
  reinforcement: { dot: "bg-amber-500", border: "border-l-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  risk: { dot: "bg-red-500", border: "border-l-red-500", bg: "bg-red-50 dark:bg-red-950/30", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  notAttempted: { dot: "bg-gray-400", border: "border-l-gray-400", bg: "bg-gray-50 dark:bg-gray-900/30", badge: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400" },
  absent: { dot: "bg-gray-300", border: "border-l-gray-300", bg: "bg-gray-50 dark:bg-gray-900/30", badge: "bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400" },
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

interface StudentBucketsProps {
  buckets: ChapterStudentBucket[];
  onGeneratePractice: () => void;
}

export const StudentBuckets = ({ buckets, onGeneratePractice }: StudentBucketsProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ reinforcement: true, risk: true });
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Card className="card-premium">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Student Performance Buckets
            <InfoTooltip content="Students are grouped into bands based on a composite performance score across all exams for this chapter, factoring in accuracy, consistency, time efficiency, and attempt rate." />
          </CardTitle>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button size="icon" className="h-8 w-8 gradient-button sm:hidden" onClick={onGeneratePractice}>
                <Sparkles className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Generate Homework</TooltipContent>
          </Tooltip>
          <Button size="sm" className="hidden sm:inline-flex h-8 text-xs gap-1.5 gradient-button" onClick={onGeneratePractice}>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Homework
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {buckets.map((bucket) => {
          const style = bandStyles[bucket.key];
          const isOpen = !!expanded[bucket.key];
          const isEmpty = bucket.count === 0;
          const isNeutral = bucket.key === "notAttempted" || bucket.key === "absent";

          return (
            <div key={bucket.key} className={cn("rounded-xl border border-border bg-card overflow-hidden border-l-4", style.border, isEmpty && "opacity-60")}>
              <button
                onClick={() => !isEmpty && toggle(bucket.key)}
                className={cn("flex items-center justify-between w-full p-3 min-h-[44px] text-left", isEmpty && "cursor-default")}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", style.dot)} />
                  <span className="text-sm font-semibold text-foreground truncate">{bucket.label}</span>
                  <span className={cn("text-xs font-medium rounded-full px-2 py-0.5 shrink-0", style.badge)}>{bucket.count}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isEmpty && (isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />)}
                </div>
              </button>

              {isEmpty && (
                <div className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground italic">No students in this band</p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {isOpen && !isEmpty && (
                  <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                    <div className="px-3 pb-3 space-y-1">
                      {bucket.students.map((s) => (
                        <div key={s.id} className={cn("rounded-lg px-3 py-2 text-sm", style.bg)}>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium truncate text-foreground">{s.studentName}</p>
                                {!isNeutral && <TrendIcon trend={s.trend} />}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">{s.rollNumber}</span>
                                {s.flags.map((flag) => (
                                  <span key={flag} className={cn("text-[10px] font-medium rounded-full px-1.5 py-0.5", FLAG_META[flag].className)}>
                                    {FLAG_META[flag].label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-semibold text-foreground">{s.masteryScore === null ? "—" : `${s.masteryScore}%`}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {isNeutral ? (bucket.key === "absent" ? "no tests" : "0 attempted") : `${s.examsAttempted} exam${s.examsAttempted > 1 ? "s" : ""}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
