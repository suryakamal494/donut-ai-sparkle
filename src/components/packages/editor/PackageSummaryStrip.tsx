import { BookOpen, Layers, ClipboardList, ListChecks } from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  chaptersPopulated: number;
  chaptersTotal: number;
  lessonCount: number;
  blockCount: number;
  testCount: number;
}

const PackageSummaryStrip = ({
  chaptersPopulated,
  chaptersTotal,
  lessonCount,
  blockCount,
  testCount,
}: Props) => {
  const stats: Stat[] = [
    {
      label: "Chapters",
      value: `${chaptersPopulated}`,
      hint: `/ ${chaptersTotal}`,
      icon: BookOpen,
    },
    { label: "Lesson plans", value: lessonCount, icon: ListChecks },
    { label: "Content blocks", value: blockCount, icon: Layers },
    { label: "Tests", value: testCount, icon: ClipboardList },
  ];

  return (
    <div className="border-b bg-muted/30 px-3 md:px-6 py-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2 min-w-0">
            <s.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate">
              {s.label}
            </span>
            <span className="text-sm font-bold text-foreground ml-auto tabular-nums">
              {s.value}
              {s.hint && (
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  {s.hint}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageSummaryStrip;