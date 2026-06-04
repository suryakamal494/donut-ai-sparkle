import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight, Pencil, Lock, RotateCcw, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  WorkspaceCanvas,
  WorkspaceFooter,
  QuizDialog,
  detectLinkType,
  type LessonPlanBlock,
} from "@/components/teacher/lesson-workspace";
import { getPackageById, getLessonPlanById } from "@/data/packages";
import { getSubjectById, curriculums, courses } from "@/data/masterData";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";
import { PackageWorkspaceToolbar } from "@/components/packages/editor/PackageWorkspaceToolbar";
import { ChapterContentSheet } from "@/components/packages/editor/ChapterContentSheet";
import type { ContentItem } from "@/data/contentLibraryData";
import type { PackageLessonPlan } from "@/types/packages";
import {
  getLessonAdditions,
  addLessonBlocks,
  removeLessonBlock,
  clearLessonAdditions,
  hasLessonAdditions,
} from "@/data/institute/institutePackageLessonAdditions";
import {
  getOwnLessonById,
  upsertOwnLesson,
  nextOwnLessonOrder,
  INSTITUTE_LP_PREFIX,
} from "@/data/institute/institutePackageOwnContent";
import {
  getOrder,
  setOrder,
  clearOrder,
  applyOrder,
} from "@/data/institute/institutePackageOrders";
import { CURRENT_TEACHER_ID, CURRENT_TEACHER_NAME } from "@/data/teacher/lessonPackages";

const T = CURRENT_TEACHER_ID;

const GRADE_LABEL: Record<string, string> = {
  "class-6": "Class 6",
  "class-7": "Class 7",
  "class-8": "Class 8",
  "class-9": "Class 9",
  "class-10": "Class 10",
  "class-11": "Class 11",
  "class-12": "Class 12",
};

const TeacherPackageLessonView = () => {
  const navigate = useNavigate();
  const { packageId, lpId } = useParams<{ packageId: string; lpId: string }>();
  const [searchParams] = useSearchParams();

  const pkg = packageId ? getPackageById(packageId) : undefined;
  const isNew = lpId === "new";
  const existing =
    !isNew && lpId
      ? lpId.startsWith(INSTITUTE_LP_PREFIX) && packageId
        ? getOwnLessonById(T, packageId, lpId)
        : getLessonPlanById(lpId)
      : undefined;

  const isTeacherOwned = isNew || (!!existing && existing.id.startsWith(INSTITUTE_LP_PREFIX));
  const isShared = !!existing && !isTeacherOwned;

  const gradeId = existing?.gradeId ?? searchParams.get("grade") ?? "";
  const subjectId = existing?.subjectId ?? searchParams.get("subject") ?? "";
  const chapterId = existing?.chapterId ?? searchParams.get("chapter") ?? "";

  const subjectName = getSubjectById(subjectId)?.name ?? "Subject";
  const sourceName = useMemo(() => {
    if (!pkg) return "";
    return pkg.sourceType === "curriculum"
      ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
      : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;
  }, [pkg]);
  const chapterName = useMemo(() => {
    if (!pkg) return "";
    const list = getChaptersForScope(pkg.sourceType, pkg.sourceId, gradeId, subjectId);
    return list.find((c) => c.id === chapterId)?.name ?? "Chapter";
  }, [pkg, gradeId, subjectId, chapterId]);
  const pathLabel = useMemo(() => {
    const cls = GRADE_LABEL[gradeId] ?? gradeId;
    return [sourceName, cls, subjectName, chapterName].filter(Boolean).join(" › ");
  }, [sourceName, gradeId, subjectName, chapterName]);

  const backToLibrary = () => navigate("/teacher/lesson-plans");
  const present = (id: string) =>
    navigate(`/teacher/lesson-plans/library/pkg/${packageId}/present/${id}`);

  if (!pkg) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-14 flex items-center gap-3 px-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={backToLibrary}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-sm font-semibold">Lesson plan not found</h1>
        </header>
      </div>
    );
  }

  if (isShared && existing) {
    return (
      <SharedLessonView
        packageId={pkg.id}
        sourceName={sourceName}
        lesson={existing}
        subjectName={subjectName}
        chapterName={chapterName}
        pathLabel={pathLabel}
        onBack={backToLibrary}
        onPresent={() => present(existing.id)}
      />
    );
  }

  return (
    <OwnLessonComposer
      packageId={pkg.id}
      sourceName={sourceName}
      existing={existing as PackageLessonPlan | undefined}
      isNew={isNew}
      gradeId={gradeId}
      subjectId={subjectId}
      chapterId={chapterId}
      subjectName={subjectName}
      chapterName={chapterName}
      pathLabel={pathLabel}
      onBack={backToLibrary}
      onPresent={existing ? () => present(existing.id) : undefined}
    />
  );
};

export default TeacherPackageLessonView;

// ---------------------------------------------------------------------------
// SHARED lesson — read-only base + teacher's own added blocks
// ---------------------------------------------------------------------------
interface SharedLessonViewProps {
  packageId: string;
  sourceName: string;
  lesson: PackageLessonPlan;
  subjectName: string;
  chapterName: string;
  pathLabel: string;
  onBack: () => void;
  onPresent: () => void;
}

const SharedLessonView = ({
  packageId,
  sourceName,
  lesson,
  subjectName,
  chapterName,
  pathLabel,
  onBack,
  onPresent,
}: SharedLessonViewProps) => {
  const { toast } = useToast();
  const lessonId = lesson.id;
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [showContentSheet, setShowContentSheet] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  const masterBlocks = lesson.blocks;
  const masterIds = useMemo(() => new Set(masterBlocks.map((b) => b.id)), [masterBlocks]);
  const additions = getLessonAdditions(T, packageId, lessonId);
  const addedIds = useMemo(() => new Set(additions.map((b) => b.id)), [additions]);

  const orderOverride = getOrder(T, packageId, { kind: "block", lessonId });
  const blocks = applyOrder([...masterBlocks, ...additions], orderOverride);
  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);
  const hasOverrides =
    hasLessonAdditions(T, packageId, lessonId) ||
    (!!orderOverride && orderOverride.length > 0);

  const handleReorder = (next: LessonPlanBlock[]) => {
    setOrder(T, packageId, { kind: "block", lessonId }, next.map((b) => b.id));
    refresh();
  };
  const handleDeleteBlock = (blockId: string) => {
    if (masterIds.has(blockId)) return;
    removeLessonBlock(T, packageId, lessonId, blockId);
    refresh();
  };
  const handleAttachContent = (items: ContentItem[]) => {
    const now = Date.now();
    const newBlocks: LessonPlanBlock[] = items.map((item, i) => {
      const url = item.description?.startsWith("http") ? item.description : "";
      return {
        id: `tch-block-${now}-${i}`,
        type: "explain",
        title: item.title,
        content: item.description,
        source: "library",
        sourceId: item.id,
        sourceType: item.type,
        attachmentUrl: url || undefined,
        embedUrl: url || undefined,
        linkType: url ? detectLinkType(url) : undefined,
        duration: 10,
      };
    });
    addLessonBlocks(T, packageId, lessonId, newBlocks);
    toast({
      title: "Added to your copy",
      description: `${items.length} item${items.length === 1 ? "" : "s"} added. The original stays intact.`,
    });
    refresh();
  };
  const handleAddQuiz = (block: Omit<LessonPlanBlock, "id">) => {
    addLessonBlocks(T, packageId, lessonId, [{ ...block, id: `tch-block-${Date.now()}` }]);
    refresh();
  };
  const handleReset = () => {
    clearLessonAdditions(T, packageId, lessonId);
    clearOrder(T, packageId, { kind: "block", lessonId });
    toast({ title: "Restored", description: "Reverted to the original lesson." });
    refresh();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-6">
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="truncate">{sourceName}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{subjectName}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{chapterName}</span>
          </p>
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight">
            {lesson.title}
          </h1>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex gap-1">
          <Lock className="w-3 h-3" /> Shared
        </Badge>
        <Button size="sm" className="gap-1.5 gradient-button" onClick={onPresent}>
          <Play className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Present</span>
        </Button>
      </header>

      {hasOverrides && (
        <div className="px-4 md:px-6 py-2 border-b bg-muted/30 flex items-center justify-end">
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset to original
          </Button>
        </div>
      )}

      <div className="px-4 md:px-6 py-2 border-b bg-background text-[11px] text-muted-foreground truncate">
        {pathLabel}
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto px-4 md:px-6 py-4 pb-24">
          <PackageWorkspaceToolbar
            onAddContent={() => setShowContentSheet(true)}
            onAddQuiz={() => setShowQuizDialog(true)}
          />
          <WorkspaceCanvas
            blocks={blocks}
            onReorder={handleReorder}
            onEditBlock={() => {}}
            onDeleteBlock={handleDeleteBlock}
            onAddBetween={() => {}}
            mode="packages"
            lockedBlockIds={masterIds}
            blockTag={(id) =>
              masterIds.has(id) ? "Shared" : addedIds.has(id) ? "You" : undefined
            }
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 sm:relative bg-white/95 backdrop-blur-sm border-t p-3 z-20">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{totalDuration}</span> min ·{" "}
            <span className="font-medium text-foreground">{blocks.length}</span> block
            {blocks.length === 1 ? "" : "s"}
          </div>
          <Button size="sm" className="h-10 px-5 gradient-button" onClick={onBack}>
            Done
          </Button>
        </div>
      </div>

      <ChapterContentSheet
        open={showContentSheet}
        onOpenChange={setShowContentSheet}
        subjectName={subjectName}
        chapterName={chapterName}
        pathLabel={pathLabel}
        onAttach={handleAttachContent}
      />
      <QuizDialog
        open={showQuizDialog}
        onOpenChange={setShowQuizDialog}
        onAddBlock={handleAddQuiz}
        chapter={chapterName}
        subject={subjectName}
        chapterId={lesson.chapterId}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// TEACHER-OWNED lesson — full composer (create / edit own content)
// ---------------------------------------------------------------------------
interface OwnLessonComposerProps {
  packageId: string;
  sourceName: string;
  existing: PackageLessonPlan | undefined;
  isNew: boolean;
  gradeId: string;
  subjectId: string;
  chapterId: string;
  subjectName: string;
  chapterName: string;
  pathLabel: string;
  onBack: () => void;
  onPresent?: () => void;
}

const OwnLessonComposer = ({
  packageId,
  sourceName,
  existing,
  isNew,
  gradeId,
  subjectId,
  chapterId,
  subjectName,
  chapterName,
  pathLabel,
  onBack,
  onPresent,
}: OwnLessonComposerProps) => {
  const { toast } = useToast();
  const [planTitle, setPlanTitle] = useState(existing?.title ?? "");
  const [blocks, setBlocks] = useState<LessonPlanBlock[]>(existing?.blocks ?? []);
  const [showContentSheet, setShowContentSheet] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);

  const handleAddBlock = useCallback((block: Omit<LessonPlanBlock, "id">) => {
    setBlocks((prev) => [...prev, { ...block, id: `block-${Date.now()}` }]);
  }, []);
  const handleDeleteBlock = (blockId: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  const handleReorderBlocks = (next: LessonPlanBlock[]) => setBlocks(next);

  const handleAttachContent = (items: ContentItem[]) => {
    const now = Date.now();
    const newBlocks: LessonPlanBlock[] = items.map((item, i) => {
      const url = item.description?.startsWith("http") ? item.description : "";
      return {
        id: `block-${now}-${i}`,
        type: "explain",
        title: item.title,
        content: item.description,
        source: "library",
        sourceId: item.id,
        sourceType: item.type,
        attachmentUrl: url || undefined,
        embedUrl: url || undefined,
        linkType: url ? detectLinkType(url) : undefined,
        duration: 10,
      };
    });
    setBlocks((prev) => [...prev, ...newBlocks]);
    toast({
      title: "Attached",
      description: `${items.length} item${items.length === 1 ? "" : "s"} added to lesson.`,
    });
  };

  const handleSave = async () => {
    if (!planTitle.trim()) {
      toast({ title: "Title required", description: "Give the lesson a name first.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const now = new Date().toISOString();
    const finalId = existing?.id ?? `${INSTITUTE_LP_PREFIX}${packageId}-${Date.now()}`;
    const order = existing?.order ?? nextOwnLessonOrder(T, packageId, chapterId);
    upsertOwnLesson(T, packageId, {
      id: finalId,
      packageId,
      gradeId,
      subjectId,
      chapterId,
      order,
      title: planTitle.trim(),
      topics: existing?.topics ?? [],
      blocks,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    toast({ title: "Saved", description: "Your lesson plan was saved." });
    onBack();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-6">
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="truncate">{sourceName}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{subjectName}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{chapterName}</span>
          </p>
          <div className="group relative flex items-center gap-1.5">
            <Input
              ref={titleRef}
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder={isNew ? "Name this lesson plan…" : "Lesson title"}
              aria-label="Lesson plan title"
              className={cn(
                "h-8 px-2 -ml-2 text-sm md:text-base font-semibold rounded-md transition-colors",
                "border border-dashed border-muted-foreground/40 bg-transparent",
                "hover:border-primary/50 hover:bg-muted/30",
                "focus-visible:border-primary focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30",
                "placeholder:text-muted-foreground/70 placeholder:italic",
              )}
            />
            <Pencil className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 group-focus-within:opacity-0 transition-opacity pointer-events-none" />
          </div>
        </div>
        {onPresent && blocks.length > 0 && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onPresent}>
            <Play className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Present</span>
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-1.5 gradient-button"
        >
          <Save className="w-4 h-4" />
          <span className="hidden md:inline">{isSaving ? "Saving…" : "Save"}</span>
        </Button>
      </header>

      <div className="px-4 md:px-6 py-2 border-b bg-muted/20 text-[11px] text-muted-foreground truncate">
        {pathLabel}
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto px-4 md:px-6 py-4 pb-24">
          <PackageWorkspaceToolbar
            onAddContent={() => setShowContentSheet(true)}
            onAddQuiz={() => setShowQuizDialog(true)}
          />
          <WorkspaceCanvas
            blocks={blocks}
            onReorder={handleReorderBlocks}
            onEditBlock={() => {}}
            onDeleteBlock={handleDeleteBlock}
            onAddBetween={() => {}}
            mode="packages"
          />
          <WorkspaceFooter
            totalDuration={totalDuration}
            blockCount={blocks.length}
            isSaving={isSaving}
            onSaveDraft={handleSave}
            onPublish={handleSave}
          />
        </div>
      </main>

      <ChapterContentSheet
        open={showContentSheet}
        onOpenChange={setShowContentSheet}
        subjectName={subjectName}
        chapterName={chapterName}
        pathLabel={pathLabel}
        onAttach={handleAttachContent}
      />
      <QuizDialog
        open={showQuizDialog}
        onOpenChange={setShowQuizDialog}
        onAddBlock={handleAddBlock}
        chapter={chapterName}
        subject={subjectName}
        chapterId={chapterId}
      />
    </div>
  );
};