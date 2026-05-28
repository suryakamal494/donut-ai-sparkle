import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  WorkspaceCanvas,
  WorkspaceFooter,
  QuizDialog,
  detectLinkType,
  type LessonPlanBlock,
  type BlockType,
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

const GRADE_LABEL: Record<string, string> = {
  "class-6": "Class 6",
  "class-7": "Class 7",
  "class-8": "Class 8",
  "class-9": "Class 9",
  "class-10": "Class 10",
  "class-11": "Class 11",
  "class-12": "Class 12",
};

const PackageLessonComposer = () => {
  const navigate = useNavigate();
  const { id, lpId } = useParams<{ id: string; lpId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const pkg = id ? getPackageById(id) : undefined;
  const isNew = lpId === "new";
  const existing = !isNew && lpId ? getLessonPlanById(lpId) : undefined;

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

  const [planTitle, setPlanTitle] = useState(existing?.title ?? "");
  const [blocks, setBlocks] = useState<LessonPlanBlock[]>(existing?.blocks ?? []);
  const [showContentSheet, setShowContentSheet] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus the title input on new plans so it's obvious it's editable.
  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  if (!pkg) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-14 flex items-center gap-3 px-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => navigate("/superadmin/packages")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-sm font-semibold">Package not found</h1>
        </header>
      </div>
    );
  }

  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);

  const handleAddBlock = useCallback((block: Omit<LessonPlanBlock, "id">) => {
    setBlocks((prev) => [...prev, { ...block, id: `block-${Date.now()}` }]);
  }, []);

  const handleEditBlock = (block: LessonPlanBlock) =>
    toast({ title: "Edit Block", description: `Editing: ${block.title}` });
  const handleDeleteBlock = (blockId: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  const handleReorderBlocks = (next: LessonPlanBlock[]) => setBlocks(next);
  // Packages composer has no "insert between" affordance — toolbar appends only.
  const handleAddBetween = (_index: number, _type: BlockType) => {};

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
    const finalId = existing?.id ?? `${pkg.id}-lp-${Date.now()}`;
    const order =
      existing?.order ??
      getLessonPlansForChapter(pkg.id, chapterId).length;
    upsertLessonPlan({
      id: finalId,
      packageId: pkg.id,
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
    toast({ title: "Saved", description: "Lesson plan saved to package." });
    navigate(`/superadmin/packages/${pkg.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/superadmin/packages/${pkg.id}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="truncate">{pkg.name}</span>
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

      {/* Context chip row */}
      <div className="px-4 md:px-6 py-2 border-b bg-muted/20 text-[11px] text-muted-foreground truncate">
        {pathLabel}
      </div>

      {/* Composer body */}
      <main className="flex-1 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto px-4 md:px-6 py-4 pb-24">
          <PackageWorkspaceToolbar
            onAddContent={() => setShowContentSheet(true)}
            onAddQuiz={() => setShowQuizDialog(true)}
          />

          <WorkspaceCanvas
            blocks={blocks}
            onReorder={handleReorderBlocks}
            onEditBlock={handleEditBlock}
            onDeleteBlock={handleDeleteBlock}
            onAddBetween={handleAddBetween}
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

export default PackageLessonComposer;