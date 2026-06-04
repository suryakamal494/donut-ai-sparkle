import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  ListTree,
  ChevronDown,
  GraduationCap,
  Layers,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import GradeSwitcher from "@/components/packages/editor/GradeSwitcher";
import SubjectTabs from "@/components/packages/editor/SubjectTabs";
import ChapterRail, {
  type ChapterRailItem,
} from "@/components/packages/editor/ChapterRail";
import ChapterDetailPane from "@/components/packages/editor/ChapterDetailPane";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";
import {
  getLessonPlansForChapter,
  getAttachmentsForChapter,
} from "@/data/packages";
import {
  getOrder,
  setOrder,
  clearOrder,
} from "@/data/institute/institutePackageOrders";
import {
  getOwnLessons,
  getOwnTests,
  addOwnTests,
  removeOwnTest,
  removeOwnLesson,
} from "@/data/institute/institutePackageOwnContent";
import {
  getLessonSourcesForTeacher,
  CURRENT_TEACHER_ID,
} from "@/data/teacher/lessonPackages";
import MyLessonPlans from "./LessonPlans";

const T = CURRENT_TEACHER_ID;

const TeacherLessonPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const sources = useMemo(() => getLessonSourcesForTeacher(), []);
  const hasSources = sources.length > 0;

  const [tab, setTab] = useState<"library" | "mine">(
    hasSources ? "library" : "mine",
  );
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [activeSourceId, setActiveSourceId] = useState(
    () => sources[0]?.packageId ?? "",
  );
  const activeSource =
    sources.find((s) => s.packageId === activeSourceId) ?? sources[0];

  const [activeGrade, setActiveGrade] = useState(
    () => sources[0]?.classes[0]?.gradeId ?? "",
  );
  const activeClass =
    activeSource?.classes.find((c) => c.gradeId === activeGrade) ??
    activeSource?.classes[0];

  const [activeSubject, setActiveSubject] = useState(
    () => sources[0]?.classes[0]?.subjectIds[0] ?? "",
  );

  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapterSheetOpen, setChapterSheetOpen] = useState(false);

  const pkg = activeSource?.pkg;
  const packageId = activeSource?.packageId ?? "";

  // ---- Chapters for the active grade + subject ----
  const rawChapters = useMemo(() => {
    if (!pkg || !activeGrade || !activeSubject) return [];
    return getChaptersForScope(
      pkg.sourceType,
      pkg.sourceId,
      activeGrade,
      activeSubject,
    );
  }, [pkg, activeGrade, activeSubject]);

  const chapterOrder = packageId
    ? getOrder(T, packageId, {
        kind: "chapter",
        gradeId: activeGrade,
        subjectId: activeSubject,
      })
    : null;
  const chapters = useMemo(() => {
    if (!chapterOrder || chapterOrder.length === 0) return rawChapters;
    const byId = new Map(rawChapters.map((c) => [c.id, c]));
    const out: typeof rawChapters = [];
    for (const id of chapterOrder) {
      const c = byId.get(id);
      if (c) {
        out.push(c);
        byId.delete(id);
      }
    }
    for (const c of rawChapters) if (byId.has(c.id)) out.push(c);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawChapters, JSON.stringify(chapterOrder)]);

  // Keep a valid chapter selected.
  useEffect(() => {
    if (chapters.length === 0) return;
    if (!chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  // ---- Selectors ----
  const selectSource = (id: string) => {
    const s = sources.find((x) => x.packageId === id);
    setActiveSourceId(id);
    const g = s?.classes[0];
    setActiveGrade(g?.gradeId ?? "");
    setActiveSubject(g?.subjectIds[0] ?? "");
    setSelectedChapterId("");
  };
  const selectGrade = (gradeId: string) => {
    setActiveGrade(gradeId);
    const c = activeSource?.classes.find((x) => x.gradeId === gradeId);
    setActiveSubject(c?.subjectIds[0] ?? "");
    setSelectedChapterId("");
  };
  const selectSubject = (sid: string) => {
    setActiveSubject(sid);
    setSelectedChapterId("");
  };

  // ---- Rail items ----
  const railItems: ChapterRailItem[] = useMemo(
    () =>
      chapters.map((c) => {
        const lessons = pkg?.inclusions.lessonPlans
          ? getLessonPlansForChapter(packageId, c.id)
          : [];
        const atts = getAttachmentsForChapter(packageId, c.id).filter(
          (a) => a.kind !== "grand-test",
        );
        const ownLessons = getOwnLessons(T, packageId, c.id);
        const ownTests = getOwnTests(T, packageId, c.id);
        return {
          ...c,
          lessonCount: lessons.length + ownLessons.length,
          testCount: atts.length + ownTests.length,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapters, packageId, pkg?.inclusions.lessonPlans, tick],
  );

  const activeChapterIndex = chapters.findIndex((c) => c.id === selectedChapterId);
  const activeChapter =
    activeChapterIndex >= 0 ? chapters[activeChapterIndex] : undefined;

  // ---- Reorder helpers (per-teacher) ----
  const reorderChapters = (orderedIds: string[]) => {
    setOrder(
      T,
      packageId,
      { kind: "chapter", gradeId: activeGrade, subjectId: activeSubject },
      orderedIds,
    );
    refresh();
  };
  const resetChapterOrder = () => {
    clearOrder(T, packageId, {
      kind: "chapter",
      gradeId: activeGrade,
      subjectId: activeSubject,
    });
    toast({ title: "Order reset", description: "Restored the default chapter order." });
    refresh();
  };

  const lessonOrderForActiveChapter = activeChapter
    ? getOrder(T, packageId, {
        kind: "lesson",
        gradeId: activeGrade,
        subjectId: activeSubject,
        chapterId: activeChapter.id,
      })
    : null;
  const reorderLessons = (orderedIds: string[]) => {
    if (!activeChapter) return;
    setOrder(
      T,
      packageId,
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
    clearOrder(T, packageId, {
      kind: "lesson",
      gradeId: activeGrade,
      subjectId: activeSubject,
      chapterId: activeChapter.id,
    });
    toast({ title: "Order reset", description: "Restored the default lesson order." });
    refresh();
  };

  // ---- Navigation builders ----
  const lessonHref = (lessonId: string) =>
    `/teacher/lesson-plans/library/pkg/${packageId}/lesson/${lessonId}`;
  const presentHref = (lessonId: string) =>
    `/teacher/lesson-plans/library/pkg/${packageId}/present/${lessonId}`;
  const addLessonHref = () =>
    `/teacher/lesson-plans/library/pkg/${packageId}/lesson/new?grade=${activeGrade}&subject=${activeSubject}&chapter=${activeChapter?.id ?? ""}`;

  const selectChapterFromSheet = (id: string) => {
    setSelectedChapterId(id);
    setChapterSheetOpen(false);
  };

  const rail = (
    <ChapterRail
      items={railItems}
      selected={{ kind: "chapter", id: selectedChapterId }}
      onSelectChapter={selectChapterFromSheet}
      onSelectGrand={() => {}}
      grandTestsEnabled={false}
      grandTestCount={0}
      reorderable
      isCustomOrdered={!!chapterOrder && chapterOrder.length > 0}
      onReorder={reorderChapters}
      onResetOrder={resetChapterOrder}
    />
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-20 md:pb-6">
      <PageHeader
        title="Lesson Plans"
        description="Open the chapter you're teaching, present it on the board, or build your own."
        breadcrumbs={[
          { label: "Teacher", href: "/teacher" },
          { label: "Lesson Plans" },
        ]}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="library" className="gap-1.5">
            <Library className="w-3.5 h-3.5" /> Curriculum
          </TabsTrigger>
          <TabsTrigger value="mine" className="gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> My Plans
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Curriculum library ---------------- */}
        <TabsContent value="library" className="mt-4 outline-none">
          {!hasSources || !activeSource ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
              <Library className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No lesson plans assigned yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                When your institute assigns curriculum lesson plans to your
                batches, the chapters you teach will appear here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[calc(100vh-15rem)] min-h-[520px]">
              {/* Source + class selectors */}
              <div className="border-b bg-background px-3 md:px-5 py-3 space-y-3">
                {sources.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {sources.map((s) => {
                      const active = s.packageId === activeSourceId;
                      return (
                        <button
                          key={s.packageId}
                          onClick={() => selectSource(s.packageId)}
                          className={cn(
                            "shrink-0 inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-semibold transition-all",
                            active
                              ? "bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-md shadow-primary/20"
                              : "bg-background text-foreground hover:bg-muted border-border",
                          )}
                        >
                          {s.sourceType === "curriculum" ? (
                            <GraduationCap className="w-4 h-4" />
                          ) : (
                            <Layers className="w-4 h-4" />
                          )}
                          <span>{s.sourceName}</span>
                          <span
                            className={cn(
                              "text-[10px] font-medium uppercase tracking-wide rounded-full px-1.5 py-0.5",
                              active
                                ? "bg-white/20 text-white"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {s.sourceType === "curriculum" ? "Curriculum" : "Course"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {sources.length === 1 && (
                    <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {activeSource.sourceType === "curriculum" ? (
                        <GraduationCap className="w-3.5 h-3.5" />
                      ) : (
                        <Layers className="w-3.5 h-3.5" />
                      )}
                      {activeSource.sourceName}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Class
                  </span>
                  <GradeSwitcher
                    gradeIds={activeSource.classes.map((c) => c.gradeId)}
                    activeId={activeGrade}
                    onChange={selectGrade}
                    variant="dropdown"
                  />
                </div>
              </div>

              {/* Subject tabs */}
              <SubjectTabs
                subjectIds={activeClass?.subjectIds ?? []}
                activeId={activeSubject}
                onChange={selectSubject}
              />

              {/* Mobile chapter selector */}
              {chapters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setChapterSheetOpen(true)}
                  className="md:hidden flex items-center gap-2 w-full px-4 py-2.5 border-b bg-muted/30 text-left"
                >
                  <ListTree className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">
                      Chapter {String(activeChapterIndex + 1).padStart(2, "0")} of{" "}
                      {chapters.length}
                    </span>
                    <span className="block text-sm font-semibold text-foreground truncate leading-tight">
                      {activeChapter?.name ?? "Select a chapter"}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              )}

              {/* Rail + detail */}
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] overflow-hidden">
                <aside className="hidden md:block min-h-0 overflow-hidden border-r">
                  {rail}
                </aside>
                <section className="min-h-0 overflow-y-auto bg-background">
                  {activeChapter && pkg ? (
                    <ChapterDetailPane
                      packageId={packageId}
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
                      additive
                      ownLessons={getOwnLessons(T, packageId, activeChapter.id)}
                      ownTests={getOwnTests(T, packageId, activeChapter.id)}
                      onAddLesson={() => navigate(addLessonHref())}
                      onAttachOwnTest={(examIds) => {
                        addOwnTests(
                          T,
                          packageId,
                          {
                            gradeId: activeGrade,
                            subjectId: activeSubject,
                            chapterId: activeChapter.id,
                          },
                          examIds,
                        );
                        refresh();
                      }}
                      onDeleteOwnLesson={(lessonId) => {
                        removeOwnLesson(T, packageId, lessonId);
                        toast({ title: "Removed", description: "Your lesson plan was deleted." });
                        refresh();
                      }}
                      onRemoveOwnTest={(testId) => {
                        removeOwnTest(T, packageId, testId);
                        refresh();
                      }}
                      onPresentLesson={(lessonId) => navigate(presentHref(lessonId))}
                      lessonHrefBuilder={lessonHref}
                      lessonOrderOverride={lessonOrderForActiveChapter}
                      lessonReorderable
                      isLessonCustomOrdered={
                        !!lessonOrderForActiveChapter &&
                        lessonOrderForActiveChapter.length > 0
                      }
                      onLessonReorder={reorderLessons}
                      onResetLessonOrder={resetLessonOrder}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center px-6">
                      <p className="text-sm text-muted-foreground">
                        No chapters for this class &amp; subject.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ---------------- Teacher's own plans ---------------- */}
        <TabsContent value="mine" className="mt-4 outline-none">
          <MyLessonPlans embedded />
        </TabsContent>
      </Tabs>

      {/* Mobile chapter index sheet */}
      <Sheet open={chapterSheetOpen} onOpenChange={setChapterSheetOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm p-0 flex flex-col gap-0">
          <SheetHeader className="px-4 py-3 border-b shrink-0 text-left">
            <SheetTitle className="text-sm">Chapters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-hidden">{rail}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TeacherLessonPlans;