import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPackageById } from "@/data/packages";
import { curriculums, courses } from "@/data/masterData";
import GradeSwitcher from "@/components/packages/editor/GradeSwitcher";
import SubjectTabs from "@/components/packages/editor/SubjectTabs";
import ChapterAccordion from "@/components/packages/editor/ChapterAccordion";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";

const statusStyles = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-muted text-muted-foreground",
} as const;

const PackageEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pkg = id ? getPackageById(id) : undefined;

  const gradeIds = useMemo(() => pkg?.shape.map((s) => s.gradeId) ?? [], [pkg]);
  const [activeGrade, setActiveGrade] = useState<string>(gradeIds[0] ?? "");

  const activeRow = useMemo(
    () => pkg?.shape.find((s) => s.gradeId === activeGrade),
    [pkg, activeGrade],
  );
  const [activeSubject, setActiveSubject] = useState<string>(
    activeRow?.subjectIds[0] ?? "",
  );

  // When grade changes, snap subject to first available for that grade.
  useEffect(() => {
    if (!activeRow) return;
    if (!activeRow.subjectIds.includes(activeSubject)) {
      setActiveSubject(activeRow.subjectIds[0] ?? "");
    }
  }, [activeRow, activeSubject]);

  const chapters = useMemo(() => {
    if (!pkg || !activeGrade || !activeSubject) return [];
    return getChaptersForScope(
      pkg.sourceType,
      pkg.sourceId,
      activeGrade,
      activeSubject,
    );
  }, [pkg, activeGrade, activeSubject]);

  if (!pkg) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-16 flex items-center gap-3 px-6 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/superadmin/packages")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Package not found</h1>
        </header>
      </div>
    );
  }

  const sourceName =
    pkg.sourceType === "curriculum"
      ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
      : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar — package name + status + actions */}
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/superadmin/packages")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {pkg.sourceType === "curriculum" ? "Curriculum" : "Course"} · {sourceName}
          </p>
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight">
            {pkg.name}
          </h1>
        </div>
        <span
          className={cn(
            "hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
            statusStyles[pkg.status],
          )}
        >
          {pkg.status}
        </span>
        <Button variant="ghost" size="sm" disabled className="gap-1.5">
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">Settings</span>
        </Button>
        <Button
          size="sm"
          disabled
          className="gap-1.5"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden md:inline">Publish</span>
        </Button>
      </header>

      {/* Grade switcher */}
      <div className="border-b bg-background/60">
        <GradeSwitcher
          gradeIds={gradeIds}
          activeId={activeGrade}
          onChange={setActiveGrade}
        />
      </div>

      {/* Subject tabs */}
      <SubjectTabs
        subjectIds={activeRow?.subjectIds ?? []}
        activeId={activeSubject}
        onChange={setActiveSubject}
      />

      {/* Chapters canvas — owns the scroll */}
      <main className="flex-1 overflow-y-auto">
        <ChapterAccordion
          packageId={pkg.id}
          chapters={chapters}
          inclusionsEnabled={{
            tests: pkg.inclusions.chapterTests,
            grand: pkg.inclusions.grandTests,
            pyp: pkg.inclusions.previousYearPapers,
          }}
        />

        {pkg.inclusions.grandTests && (
          <section className="border-t bg-muted/20 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Grand Tests
                </h2>
                <p className="text-xs text-muted-foreground">
                  Package-wide assessments not tied to a specific chapter.
                </p>
              </div>
              <Button size="sm" variant="outline" disabled>
                Attach grand test
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PackageEditor;