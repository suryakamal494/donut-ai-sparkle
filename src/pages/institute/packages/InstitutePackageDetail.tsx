import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getPackageById,
  getLessonPlansForChapter,
  getAttachmentsForChapter,
  getGrandTestsForPackage,
  getLessonPlansForPackage,
} from "@/data/packages";
import { curriculums, courses } from "@/data/masterData";
import GradeSwitcher from "@/components/packages/editor/GradeSwitcher";
import SubjectTabs from "@/components/packages/editor/SubjectTabs";
import ChapterRail, {
  type ChapterRailItem,
} from "@/components/packages/editor/ChapterRail";
import ChapterDetailPane from "@/components/packages/editor/ChapterDetailPane";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";
import { batches } from "@/data/instituteData";
import {
  getBatchesForPackage,
  toggleBatchForPackage,
  countBoundBatches,
} from "@/data/institute/institutePackageBatches";
import {
  getOrder,
  setOrder,
  clearOrder,
  applyOrder,
} from "@/data/institute/institutePackageOrders";

const CURRENT_INSTITUTE_ID = "inst-1";

const InstitutePackageDetail = () => {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const pkg = packageId ? getPackageById(packageId) : undefined;
  const { toast } = useToast();
  const [tab, setTab] = useState<"content" | "batches">("content");
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const gradeIds = useMemo(() => pkg?.shape.map((s) => s.gradeId) ?? [], [pkg]);
  const [activeGrade, setActiveGrade] = useState<string>(gradeIds[0] ?? "");
  const activeRow = useMemo(
    () => pkg?.shape.find((s) => s.gradeId === activeGrade),
    [pkg, activeGrade],
  );
  const [activeSubject, setActiveSubject] = useState<string>(
    activeRow?.subjectIds[0] ?? "",
  );

  useEffect(() => {
    if (activeRow && !activeRow.subjectIds.includes(activeSubject)) {
      setActiveSubject(activeRow.subjectIds[0] ?? "");
    }
  }, [activeRow, activeSubject]);

  const rawChapters = useMemo(() => {
    if (!pkg || !activeGrade || !activeSubject) return [];
    return getChaptersForScope(pkg.sourceType, pkg.sourceId, activeGrade, activeSubject);
  }, [pkg, activeGrade, activeSubject]);

  const chapterOrder = pkg
    ? getOrder(CURRENT_INSTITUTE_ID, pkg.id, {
        kind: "chapter",
        gradeId: activeGrade,
        subjectId: activeSubject,
      })
    : null;
  const chapters = applyOrder(rawChapters, chapterOrder);

  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  useEffect(() => {
    if (chapters.length === 0) return;
    if (!chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  if (!pkg) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate("/institute/packages")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">Package not found.</p>
      </div>
    );
  }

  const sourceName =
    pkg.sourceType === "curriculum"
      ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
      : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;

  const railItems: ChapterRailItem[] = chapters.map((c) => {
    const lessons = pkg.inclusions.lessonPlans ? getLessonPlansForChapter(pkg.id, c.id) : [];
    const atts = getAttachmentsForChapter(pkg.id, c.id).filter((a) => a.kind !== "grand-test");
    return { ...c, lessonCount: lessons.length, testCount: atts.length };
  });
  const activeChapterIndex = chapters.findIndex((c) => c.id === selectedChapterId);
  const activeChapter = activeChapterIndex >= 0 ? chapters[activeChapterIndex] : undefined;

  const grandTestCount = getGrandTestsForPackage(pkg.id).length;
  const lessonCount = getLessonPlansForPackage(pkg.id).length;

  // ---- Chapter reorder helpers ----
  const reorderChapters = (orderedIds: string[]) => {
    setOrder(
      CURRENT_INSTITUTE_ID,
      pkg.id,
      { kind: "chapter", gradeId: activeGrade, subjectId: activeSubject },
      orderedIds,
    );
    refresh();
  };
  const resetChapterOrder = () => {
    clearOrder(CURRENT_INSTITUTE_ID, pkg.id, {
      kind: "chapter",
      gradeId: activeGrade,
      subjectId: activeSubject,
    });
    toast({ title: "Order reset", description: "Restored SuperAdmin's chapter order." });
    refresh();
  };

  // ---- Lesson reorder for the active chapter ----
  const lessonOrderForActiveChapter = activeChapter
    ? getOrder(CURRENT_INSTITUTE_ID, pkg.id, {
        kind: "lesson",
        gradeId: activeGrade,
        subjectId: activeSubject,
        chapterId: activeChapter.id,
      })
    : null;
  const reorderLessons = (orderedIds: string[]) => {
    if (!activeChapter) return;
    setOrder(
      CURRENT_INSTITUTE_ID,
      pkg.id,
      {
        kind: "lesson",
        gradeId: activeGrade,
        subjectId: activeSubject,
        chapterId: activeChapter.id,
      },
      orderedIds,
    );
    refresh();
  };
  const resetLessonOrder = () => {
    if (!activeChapter) return;
    clearOrder(CURRENT_INSTITUTE_ID, pkg.id, {
      kind: "lesson",
      gradeId: activeGrade,
      subjectId: activeSubject,
      chapterId: activeChapter.id,
    });
    toast({ title: "Order reset", description: "Restored SuperAdmin's lesson order." });
    refresh();
  };

  // ---- Batches tab ----
  const boundBatchIds = getBatchesForPackage(CURRENT_INSTITUTE_ID, pkg.id);
  const packageGradeIds = new Set(pkg.shape.map((s) => s.gradeId));
  const eligibleBatchesByGrade = pkg.shape
    .map((row) => ({
      gradeId: row.gradeId,
      gradeName: batches.find((b) => b.classId === row.gradeId)?.className ?? row.gradeId,
      batches: batches.filter((b) => b.classId === row.gradeId),
    }))
    .filter((row) => row.batches.length > 0);

  const toggleBatch = (batchId: string) => {
    toggleBatchForPackage(CURRENT_INSTITUTE_ID, pkg.id, batchId);
    refresh();
  };
  const selectAllInGrade = (gradeId: string) => {
    const batchIdsInGrade = batches.filter((b) => b.classId === gradeId).map((b) => b.id);
    const allSelected = batchIdsInGrade.every((id) => boundBatchIds.includes(id));
    batchIdsInGrade.forEach((id) => {
      const isBound = boundBatchIds.includes(id);
      if (allSelected && isBound) toggleBatchForPackage(CURRENT_INSTITUTE_ID, pkg.id, id);
      else if (!allSelected && !isBound) toggleBatchForPackage(CURRENT_INSTITUTE_ID, pkg.id, id);
    });
    refresh();
  };

  const totalAssignedBatches = countBoundBatches(CURRENT_INSTITUTE_ID, pkg.id);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-3 md:px-6 py-2 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => navigate("/institute/packages")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {pkg.sourceType === "curriculum" ? "Curriculum" : "Course"} · {sourceName}
          </p>
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight">
            {pkg.name}
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {lessonCount} lessons · {grandTestCount} grand tests ·{" "}
            <span className="font-semibold text-foreground">{totalAssignedBatches}</span> batch
            {totalAssignedBatches === 1 ? "" : "es"} assigned
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex gap-1">
          <Eye className="w-3 h-3" /> Read-only
        </Badge>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 min-h-0 flex flex-col">
        <div className="border-b bg-background px-3 md:px-6">
          <TabsList className="h-11 bg-transparent p-0 gap-1">
            <TabsTrigger value="content" className="data-[state=active]:bg-muted gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Content
            </TabsTrigger>
            <TabsTrigger value="batches" className="data-[state=active]:bg-muted gap-1.5">
              <Users className="w-3.5 h-3.5" /> Batches
              {totalAssignedBatches > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                  {totalAssignedBatches}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Grade/subject switchers for the Content tab */}
        {tab === "content" && (
          <>
            <div className="px-3 md:px-6 py-2 border-b bg-background flex items-center gap-2 flex-wrap">
              <GradeSwitcher
                gradeIds={gradeIds}
                activeId={activeGrade}
                onChange={setActiveGrade}
                variant="dropdown"
              />
            </div>
            <SubjectTabs
              subjectIds={activeRow?.subjectIds ?? []}
              activeId={activeSubject}
              onChange={setActiveSubject}
            />
          </>
        )}

        <TabsContent value="content" className="flex-1 min-h-0 mt-0 outline-none">
          <main className="h-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] overflow-hidden">
            <aside className="hidden md:block min-h-0 overflow-hidden">
              <ChapterRail
                items={railItems}
                selected={{ kind: "chapter", id: selectedChapterId }}
                onSelectChapter={setSelectedChapterId}
                onSelectGrand={() => {}}
                grandTestsEnabled={false}
                grandTestCount={0}
                reorderable
                isCustomOrdered={!!chapterOrder && chapterOrder.length > 0}
                onReorder={reorderChapters}
                onResetOrder={resetChapterOrder}
              />
            </aside>
            <section className="min-h-0 overflow-y-auto bg-background">
              {activeChapter ? (
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
                  readOnly
                  lessonHrefBuilder={(lessonId) =>
                    `/institute/packages/${pkg.id}/lesson/${lessonId}`
                  }
                  lessonOrderOverride={lessonOrderForActiveChapter}
                  lessonReorderable
                  isLessonCustomOrdered={
                    !!lessonOrderForActiveChapter && lessonOrderForActiveChapter.length > 0
                  }
                  onLessonReorder={reorderLessons}
                  onResetLessonOrder={resetLessonOrder}
                />
              ) : (
                <div className="h-full flex items-center justify-center px-6">
                  <p className="text-sm text-muted-foreground">
                    No chapters for this grade + subject.
                  </p>
                </div>
              )}
            </section>
          </main>
        </TabsContent>

        <TabsContent value="batches" className="flex-1 min-h-0 mt-0 outline-none overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-3xl space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Assign this package to batches
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Pick the batches that should use this package. Students in any selected batch
                will get access automatically.
              </p>
            </div>

            {eligibleBatchesByGrade.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                None of your batches match the grades in this package.
              </p>
            ) : (
              <div className="space-y-5">
                {eligibleBatchesByGrade.map((row) => {
                  const allBound = row.batches.every((b) => boundBatchIds.includes(b.id));
                  return (
                    <div key={row.gradeId} className="rounded-2xl border bg-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">{row.gradeName}</h3>
                        <button
                          type="button"
                          onClick={() => selectAllInGrade(row.gradeId)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {allBound ? "Clear all" : "Select all in this grade"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.batches.map((b) => {
                          const active = boundBatchIds.includes(b.id);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => toggleBatch(b.id)}
                              className={cn(
                                "inline-flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl border text-sm font-medium transition-all",
                                active
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background text-foreground/80 hover:border-primary/50",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-4 h-4 rounded-full border-2 grid place-items-center",
                                  active ? "border-primary bg-primary" : "border-muted-foreground/40",
                                )}
                              >
                                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                              </span>
                              <span className="truncate max-w-[200px]">{b.name}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {b.studentCount} students
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutePackageDetail;