import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings, CheckCircle2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPackageById,
  getGrandTestsForPackage,
  attachExamsToPackage,
  getLessonPlansForPackage,
  getLessonPlansForChapter,
  getAttachmentsForChapter,
  publishPackage,
} from "@/data/packages";
import { curriculums, courses } from "@/data/masterData";
import GradeSwitcher from "@/components/packages/editor/GradeSwitcher";
import SubjectTabs from "@/components/packages/editor/SubjectTabs";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";
import AttachTestSheet from "@/components/packages/editor/AttachTestSheet";
import PackageSettingsSheet from "@/components/packages/editor/PackageSettingsSheet";
import PackageSummaryStrip from "@/components/packages/editor/PackageSummaryStrip";
import ChapterRail, {
  type ChapterRailItem,
} from "@/components/packages/editor/ChapterRail";
import ChapterDetailPane from "@/components/packages/editor/ChapterDetailPane";
import GrandTestsPane from "@/components/packages/editor/GrandTestsPane";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [grandSheetOpen, setGrandSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const { toast } = useToast();
  const [view, setView] = useState<{ kind: "chapter"; id: string } | { kind: "grand" }>(
    { kind: "chapter", id: "" },
  );
  const [railOpen, setRailOpen] = useState(false);

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

  // Keep selection in sync with available chapters.
  useEffect(() => {
    if (view.kind === "grand") return;
    if (chapters.length === 0) return;
    if (!chapters.some((c) => c.id === view.id)) {
      setView({ kind: "chapter", id: chapters[0].id });
    }
  }, [chapters, view]);

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

  const lessonCount = getLessonPlansForPackage(pkg.id).length;

  // Per-chapter aggregates for the rail + summary strip.
  const railItems: ChapterRailItem[] = chapters.map((c) => {
    const lessons = pkg.inclusions.lessonPlans
      ? getLessonPlansForChapter(pkg.id, c.id)
      : [];
    const attachments = getAttachmentsForChapter(pkg.id, c.id).filter(
      (a) => a.kind !== "grand-test",
    );
    return {
      ...c,
      lessonCount: lessons.length,
      testCount: attachments.length,
      progress: 0,
    };
  });
  const maxLessons = Math.max(1, ...railItems.map((r) => r.lessonCount));
  railItems.forEach((r) => {
    r.progress = r.lessonCount / maxLessons;
  });
  const chaptersPopulated = railItems.filter(
    (r) => r.lessonCount > 0 || r.testCount > 0,
  ).length;
  const totalBlocks = railItems.reduce((sum, r) => {
    const lessons = getLessonPlansForChapter(pkg.id, r.id);
    return sum + lessons.reduce((s, lp) => s + lp.blocks.length, 0);
  }, 0);
  const chapterTestTotal = railItems.reduce((s, r) => s + r.testCount, 0);
  const grandTestItems = getGrandTestsForPackage(pkg.id);
  const totalTests = chapterTestTotal + grandTestItems.length;
  const activeChapterIndex =
    view.kind === "chapter" ? chapters.findIndex((c) => c.id === view.id) : -1;
  const activeChapter =
    activeChapterIndex >= 0 ? chapters[activeChapterIndex] : undefined;

  const anyTestInclusion =
    pkg.inclusions.chapterTests ||
    pkg.inclusions.grandTests ||
    pkg.inclusions.previousYearPapers;
  const lessonsRequirementMet =
    !pkg.inclusions.lessonPlans || lessonCount > 0;
  const hasAnyInclusion = pkg.inclusions.lessonPlans || anyTestInclusion;
  const canPublish =
    hasAnyInclusion &&
    lessonsRequirementMet &&
    pkg.status !== "published";
  const publishBlockReason =
    pkg.status === "published"
      ? "Package is already published."
      : !hasAnyInclusion
      ? "Enable at least one inclusion in settings."
      : pkg.inclusions.lessonPlans
      ? "Add at least one lesson plan to publish."
      : "Attach at least one test to publish.";

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
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">Settings</span>
        </Button>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  disabled={!canPublish}
                  onClick={() => setPublishOpen(true)}
                  className="gap-1.5"
                  style={{
                    background:
                      "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {pkg.status === "published" ? "Published" : "Publish"}
                  </span>
                </Button>
              </span>
            </TooltipTrigger>
            {!canPublish && (
              <TooltipContent side="bottom">{publishBlockReason}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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

      {/* Summary */}
      <PackageSummaryStrip
        chaptersPopulated={chaptersPopulated}
        chaptersTotal={railItems.length}
        lessonCount={lessonCount}
        blockCount={totalBlocks}
        testCount={totalTests}
      />

      {/* Mobile rail trigger */}
      <div className="md:hidden border-b bg-background px-3 py-2">
        <Sheet open={railOpen} onOpenChange={setRailOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 min-h-[40px]">
              <Menu className="w-4 h-4" />
              <span className="font-semibold truncate">
                {view.kind === "grand"
                  ? "Grand Tests"
                  : activeChapter
                  ? `${activeChapterIndex + 1}. ${activeChapter.name}`
                  : "Select a chapter"}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <ChapterRail
              items={railItems}
              selected={view}
              onSelectChapter={(id) => {
                setView({ kind: "chapter", id });
                setRailOpen(false);
              }}
              onSelectGrand={() => {
                setView({ kind: "grand" });
                setRailOpen(false);
              }}
              grandTestsEnabled={pkg.inclusions.grandTests}
              grandTestCount={grandTestItems.length}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Master-detail body */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] overflow-hidden">
        <aside className="hidden md:block min-h-0 overflow-hidden">
          <ChapterRail
            items={railItems}
            selected={view}
            onSelectChapter={(id) => setView({ kind: "chapter", id })}
            onSelectGrand={() => setView({ kind: "grand" })}
            grandTestsEnabled={pkg.inclusions.grandTests}
            grandTestCount={grandTestItems.length}
          />
        </aside>
        <section className="min-h-0 overflow-y-auto bg-background">
          {view.kind === "grand" && pkg.inclusions.grandTests ? (
            <GrandTestsPane
              packageId={pkg.id}
              onAttachClick={() => setGrandSheetOpen(true)}
              onChange={refresh}
            />
          ) : activeChapter ? (
            <ChapterDetailPane
              packageId={pkg.id}
              gradeId={activeGrade}
              subjectId={activeSubject}
              chapter={activeChapter}
              chapterIndex={activeChapterIndex}
              inclusionsEnabled={{
                lessons: pkg.inclusions.lessonPlans,
                tests: pkg.inclusions.chapterTests,
                pyp: pkg.inclusions.previousYearPapers,
              }}
              onChange={refresh}
            />
          ) : (
            <div className="h-full flex items-center justify-center px-6">
              <p className="text-sm text-muted-foreground text-center">
                No chapters in master data for this grade + subject yet.
              </p>
            </div>
          )}
        </section>
      </main>

      {pkg.inclusions.grandTests && (
        <AttachTestSheet
          open={grandSheetOpen}
          onOpenChange={setGrandSheetOpen}
          kind="grand-test"
          subjectId={activeSubject}
          excludeExamIds={getGrandTestsForPackage(pkg.id).map((a) => a.examId)}
          onAttach={(ids) => {
            attachExamsToPackage(pkg.id, ids, {
              kind: "grand-test",
              gradeId: activeGrade,
              subjectId: activeSubject,
            });
            refresh();
          }}
        />
      )}

      <PackageSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        pkg={pkg}
        onChange={refresh}
        onArchived={() => navigate("/superadmin/packages")}
      />

      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this package?</AlertDialogTitle>
            <AlertDialogDescription>
              Institutes on matching tiers will see this package immediately.
              You can still edit lessons and attachments after publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                publishPackage(pkg.id);
                setPublishOpen(false);
                refresh();
                toast({
                  title: "Published",
                  description: `${pkg.name} is now live.`,
                });
              }}
              style={{ background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)" }}
            >
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageEditor;