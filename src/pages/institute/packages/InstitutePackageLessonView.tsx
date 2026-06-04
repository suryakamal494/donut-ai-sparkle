import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight, Pencil, Lock, RotateCcw, Clock } from "lucide-react";
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
import {
  getPackageById,
  getLessonPlanById,
  upsertLessonPlan,
  getLessonPlansForChapter,
} from "@/data/packages";
import { getSubjectById, curriculums, courses } from "@/data/masterData";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";
import { PackageWorkspaceToolbar } from "@/components/packages/editor/PackageWorkspaceToolbar";
import { ChapterContentSheet } from "@/components/packages/editor/ChapterContentSheet";
import type { ContentItem } from "@/data/contentLibraryData";
import {
  getLessonAdditions,
  addLessonBlocks,
  removeLessonBlock,
  clearLessonAdditions,
  hasLessonAdditions,
} from "@/data/institute/institutePackageLessonAdditions";
import { getOrder, setOrder, clearOrder, applyOrder } from "@/data/institute/institutePackageOrders";

const CURRENT_INSTITUTE_ID = "inst-1";

const GRADE_LABEL: Record<string, string> = {
  "class-6": "Class 6",
  "class-7": "Class 7",
  "class-8": "Class 8",
  "class-9": "Class 9",
  "class-10": "Class 10",
  "class-11": "Class 11",
  "class-12": "Class 12",
};

/** Lesson plans authored by the institute itself carry this id prefix. */
const INSTITUTE_LP_PREFIX = "inst-lp-";

const InstitutePackageLessonView = () => {
  const navigate = useNavigate();
  const { packageId, lpId } = useParams<{ packageId: string; lpId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const pkg = packageId ? getPackageById(packageId) : undefined;
  const isNew = lpId === "new";
  const existing = !isNew && lpId ? getLessonPlanById(lpId) : undefined;

  // Institute-authored lessons are fully editable; SuperAdmin-authored
  // lessons are a read-only base the institute can layer onto.
  const isInstituteOwned = isNew || (!!existing && existing.id.startsWith(INSTITUTE_LP_PREFIX));
  const isShared = !!existing && !isInstituteOwned;

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

  const backToPackage = () => navigate(`/institute/packages/${packageId}`);

  if (!pkg) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-14 flex items-center gap-3 px-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => navigate("/institute/packages")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-sm font-semibold">Package not found</h1>
        </header>
      </div>
    );
  }

  if (isShared && existing) {
    return (
      <SharedLessonView
        packageId={pkg.id}
        packageName={pkg.name}
        lesson={existing}
        subjectName={subjectName}
        chapterName={chapterName}
        pathLabel={pathLabel}
        onBack={backToPackage}
      />
    );
  }

  return (
    <OwnLessonComposer
      packageId={pkg.id}
      packageName={pkg.name}
      existing={existing}
      isNew={isNew}
      gradeId={gradeId}
      subjectId={subjectId}
      chapterId={chapterId}
      subjectName={subjectName}
      chapterName={chapterName}
      pathLabel={pathLabel}
      onBack={backToPackage}
    />
  );
};

export default InstitutePackageLessonView;

// ---------------------------------------------------------------------------
// SHARED (SuperAdmin-authored) lesson — read-only base + institute additions
// ---------------------------------------------------------------------------

interface SharedLessonViewProps {
  packageId: string;
  packageName: string;
  lesson: ReturnType<typeof getLessonPlanById> & {};
  subjectName: string;
  chapterName: string;
  pathLabel: string;
  onBack: () => void;
}

const SharedLessonView = ({
  packageId,
  packageName,
  lesson,
  subjectName,
  chapterName,
  pathLabel,
  onBack,
}: SharedLessonViewProps) => {
  const { toast } = useToast();
  const lessonId = lesson!.id;
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [showContentSheet, setShowContentSheet] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  const masterBlocks = lesson!.blocks;
  const masterIds = useMemo(() => new Set(masterBlocks.map((b) => b.id)), [masterBlocks]);
  const additions = getLessonAdditions(CURRENT_INSTITUTE_ID, packageId, lessonId);
  const addedIds = useMemo(() => new Set(additions.map((b) => b.id)), [additions]);

  const orderOverride = getOrder(CURRENT_INSTITUTE_ID, packageId, {
    kind: "block",
    lessonId,
  });
  const blocks = applyOrder([...masterBlocks, ...additions], orderOverride);
  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);
  const hasOverrides =
    hasLessonAdditions(CURRENT_INSTITUTE_ID, packageId, lessonId) ||
    (!!orderOverride && orderOverride.length > 0);

  const handleReorder = (next: LessonPlanBlock[]) => {
    setOrder(CURRENT_INSTITUTE_ID, packageId, { kind: "block", lessonId }, next.map((b) => b.id));
    refresh();
  };

  const handleDeleteBlock = (blockId: string) => {
    if (masterIds.has(blockId)) return; // never delete shared base content
    removeLessonBlock(CURRENT_INSTITUTE_ID, packageId, lessonId, blockId);
    refresh();
  };

  const handleAttachContent = (items: ContentItem[]) => {
    const now = Date.now();
    const newBlocks: LessonPlanBlock[] = items.map((item, i) => {
      const url = item.description?.startsWith("http") ? item.description : "";
      return {
        id: `inst-block-${now}-${i}`,
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
    addLessonBlocks(CURRENT_INSTITUTE_ID, packageId, lessonId, newBlocks);
    toast({
      title: "Added to your copy",
      description: `${items.length} item${items.length === 1 ? "" : "s"} added. The original stays intact.`,
    });
    refresh();
  };

  const handleAddQuiz = (block: Omit<LessonPlanBlock, "id">) => {
    addLessonBlocks(CURRENT_INSTITUTE_ID, packageId, lessonId, [
      { ...block, id: `inst-block-${Date.now()}` },
    ]);
    refresh();
  };

  const handleReset = () => {
    clearLessonAdditions(CURRENT_INSTITUTE_ID, packageId, lessonId);
    clearOrder(CURRENT_INSTITUTE_ID, packageId, { kind: "block", lessonId });
    toast({ title: "Restored", description: "Reverted to the original shared lesson." });
    refresh();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="truncate">{packageName}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{subjectName}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{chapterName}</span>
          </p>
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight">
            {lesson!.title}
          </h1>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex gap-1">
          <Lock className="w-3 h-3" /> Shared
        </Badge>
      </header>

      {/* Banner explaining the use-don't-delete model */}
      <div className="px-4 md:px-6 py-2.5 border-b bg-muted/30 flex items-start sm:items-center gap-2 flex-wrap">
        <p className="text-[11px] sm:text-xs text-muted-foreground flex-1 min-w-0">
          <span className="font-semibold text-foreground">Shared by Donut.</span>{" "}
          You can add your own content & quizzes on top — the original stays intact and can't be deleted.
        </p>
        {hasOverrides && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to original
          </Button>
        )}
      </div>

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
              masterIds.has(id)
                ? "Shared"
                : addedIds.has(id)
                  ? "Added by your institute"
                  : undefined
            }
          />

          <WorkspaceFooter
            totalDuration={totalDuration}
            blockCount={blocks.length}
            isSaving={false}
            onSaveDraft={onBack}
            onPublish={onBack}
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
        onAddBlock={handleAddQuiz}
        chapter={chapterName}
        subject={subjectName}
        chapterId={lesson!.chapterId}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// INSTITUTE-OWNED lesson — full composer (create / edit own content)
// ---------------------------------------------------------------------------

interface OwnLessonComposerProps {
  packageId: string;
  packageName: string;
  existing: ReturnType<typeof getLessonPlanById>;
  isNew: boolean;
  gradeId: string;
  subjectId: string;
  chapterId: string;
  subjectName: string;
  chapterName: string;
  pathLabel: string;
  onBack: () => void;
}

const OwnLessonComposer = ({
  packageId,
  packageName,
  existing,
  isNew,
  gradeId,
  subjectId,
  chapterId,
  subjectName,
  chapterName,
  pathLabel,
  onBack,
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
    const finalId = existing?.id ?? `inst-lp-${packageId}-${Date.now()}`;
    const order = existing?.order ?? getLessonPlansForChapter(packageId, chapterId).length;
    upsertLessonPlan({
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
    toast({ title: "Saved", description: "Your lesson plan was saved to this package." });
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="truncate">{packageName}</span>
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
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-1.5"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)" }}
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