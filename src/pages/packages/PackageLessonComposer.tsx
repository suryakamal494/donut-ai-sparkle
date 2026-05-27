import { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  WorkspaceToolbar,
  WorkspaceCanvas,
  WorkspaceFooter,
  AIAssistDialog,
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

  const [planTitle, setPlanTitle] = useState(existing?.title ?? "");
  const [blocks, setBlocks] = useState<LessonPlanBlock[]>(existing?.blocks ?? []);
  const [topic, setTopic] = useState(existing?.topics?.[0] ?? "");
  const [activeBlockType, setActiveBlockType] = useState<BlockType | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setActiveBlockType(null);
  }, []);
  const handleBlockClick = (type: BlockType) =>
    setActiveBlockType(activeBlockType === type ? null : type);
  const handleEditBlock = (block: LessonPlanBlock) =>
    toast({ title: "Edit Block", description: `Editing: ${block.title}` });
  const handleDeleteBlock = (blockId: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  const handleReorderBlocks = (next: LessonPlanBlock[]) => setBlocks(next);
  const handleAddBetween = (index: number, type: BlockType) => {
    const newBlock: LessonPlanBlock = {
      id: `block-${Date.now()}`,
      type,
      title: "",
      source: "custom",
      duration: 10,
    };
    setBlocks((prev) => [...prev.slice(0, index), newBlock, ...prev.slice(index)]);
  };

  const handleAIGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("lesson-plan-ai", {
        body: { action: "generate_plan", topic, subject: subjectName, chapter: chapterName },
      });
      if (error) throw error;
      if (data?.data?.blocks) {
        const next: LessonPlanBlock[] = data.data.blocks.map((b: any, i: number) => ({
          id: `block-ai-${Date.now()}-${i}`,
          type: ["explain", "demonstrate", "quiz", "homework"].includes(b.type) ? b.type : "explain",
          title: b.title || "",
          content: b.content || "",
          duration: b.duration || 10,
          source: "ai" as const,
          aiGenerated: true,
        }));
        setBlocks(next);
        toast({ title: "Lesson Generated", description: `Created ${next.length} blocks` });
      }
    } catch (e: any) {
      toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
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
      topics: topic ? [topic] : existing?.topics ?? [],
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
          <Input
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder={isNew ? "Untitled lesson plan" : "Lesson title"}
            className="h-7 px-0 border-0 shadow-none text-sm md:text-base font-semibold focus-visible:ring-0"
          />
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
      <div className="px-4 md:px-6 py-2 border-b bg-muted/20 text-[11px] text-muted-foreground">
        {pkg.sourceType === "curriculum" ? "Curriculum" : "Course"}: {sourceName}
      </div>

      {/* Composer body */}
      <main className="flex-1 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto px-4 md:px-6 py-4 pb-24">
          <WorkspaceToolbar
            onBlockClick={handleBlockClick}
            onAIAssist={() => setShowAIDialog(true)}
            onAddBlock={handleAddBlock}
            isGenerating={isGenerating}
            activeBlock={activeBlockType}
            chapter={chapterName}
            subject={subjectName}
          />

          <WorkspaceCanvas
            blocks={blocks}
            onReorder={handleReorderBlocks}
            onEditBlock={handleEditBlock}
            onDeleteBlock={handleDeleteBlock}
            onAddBetween={handleAddBetween}
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

      <AIAssistDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        topic={topic}
        chapter={chapterName}
        subject={subjectName}
        onTopicChange={setTopic}
        onChapterChange={() => {}}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default PackageLessonComposer;