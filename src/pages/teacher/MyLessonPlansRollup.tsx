import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  GraduationCap,
  Layers,
  Presentation,
  PencilLine,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getOwnLessonRollupForTeacher } from "@/data/teacher/lessonPackages";

const MyLessonPlansRollup = () => {
  const navigate = useNavigate();
  const items = useMemo(() => getOwnLessonRollupForTeacher(), []);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const sourceOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.sourceName))).sort(),
    [items],
  );
  const classOptions = useMemo(
    () =>
      Array.from(new Map(items.map((i) => [i.gradeId, i.className])).entries())
        .map(([gradeId, className]) => ({ gradeId, className }))
        .sort((a, b) => a.gradeId.localeCompare(b.gradeId)),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchesSearch =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.chapterName.toLowerCase().includes(q) ||
        i.subjectName.toLowerCase().includes(q);
      const matchesSource =
        sourceFilter === "all" || i.sourceName === sourceFilter;
      const matchesClass = classFilter === "all" || i.gradeId === classFilter;
      return matchesSearch && matchesSource && matchesClass;
    });
  }, [items, search, sourceFilter, classFilter]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
        <p className="text-sm font-semibold text-foreground">
          You haven&apos;t created any lesson plans yet
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Open a chapter and add a lesson plan — everything you create will be
          collected here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-background"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px] h-11 bg-background shrink-0">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sourceOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[130px] h-11 bg-background shrink-0">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classOptions.map((c) => (
                <SelectItem key={c.gradeId} value={c.gradeId}>
                  {c.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No plans match your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={`${item.packageId}-${item.lessonId}`}
              className="rounded-2xl border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      item.sourceType === "curriculum"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    {item.sourceType === "curriculum" ? (
                      <GraduationCap className="w-3 h-3" />
                    ) : (
                      <Layers className="w-3 h-3" />
                    )}
                    {item.sourceName}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {item.className} · {item.subjectName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Ch: {item.chapterName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-10 gap-1.5"
                  onClick={() => navigate(item.openHref)}
                >
                  <PencilLine className="w-3.5 h-3.5" />
                  Open
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-10 gap-1.5 gradient-button"
                  onClick={() => navigate(item.presentHref)}
                >
                  <Presentation className="w-3.5 h-3.5" />
                  Present
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLessonPlansRollup;