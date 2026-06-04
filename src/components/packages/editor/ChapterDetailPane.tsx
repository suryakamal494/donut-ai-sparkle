import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, Plus, X, FileText, ChevronRight, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getLessonPlansForChapter,
  getAttachmentsForChapter,
  attachExamsToPackage,
  removeAttachment,
} from "@/data/packages";
import { teacherExams } from "@/data/teacher/exams";
import AttachTestSheet from "./AttachTestSheet";
import type { PackageAttachmentKind } from "@/types/packages";
import type { PackageLessonPlan } from "@/types/packages";
import type { InstituteOwnTest } from "@/data/institute/institutePackageOwnContent";
import type { EditorChapter } from "./packageChapterLookup";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  packageId: string;
  gradeId: string;
  subjectId: string;
  chapter: EditorChapter;
  chapterIndex: number;
  inclusionsEnabled: { lessons: boolean; tests: boolean; pyp: boolean };
  onChange: () => void;
  /**
   * When true, all create/edit/delete controls are hidden so the pane can
   * be reused in read-only contexts (e.g. institute view).
   */
  readOnly?: boolean;
  /**
   * Lets the host swap the navigation target for "open lesson" clicks.
   * Defaults to the SuperAdmin lesson composer.
   */
  lessonHrefBuilder?: (lessonId: string) => string;
  /**
   * Lets the host inject its own ordering for the lesson list (used by the
   * institute view to honour local reorder overrides).
   */
  lessonOrderOverride?: string[] | null;
  /**
   * Enables drag-and-drop reorder for the lesson plans list within this
   * chapter. Used by the institute view to let admins arrange teaching order
   * locally without leaving the Content tab.
   */
  lessonReorderable?: boolean;
  onLessonReorder?: (orderedIds: string[]) => void;
  onResetLessonOrder?: () => void;
  isLessonCustomOrdered?: boolean;
  /**
   * Institute "additive" mode. SuperAdmin lessons/tests stay read-only, but the
   * institute can add its OWN lessons/tests alongside them. When enabled the
   * Add controls are shown and own items get delete/remove affordances.
   */
  additive?: boolean;
  ownLessons?: PackageLessonPlan[];
  ownTests?: InstituteOwnTest[];
  onAddLesson?: () => void;
  onAttachOwnTest?: (examIds: string[]) => void;
  onDeleteOwnLesson?: (lessonId: string) => void;
  onRemoveOwnTest?: (testId: string) => void;
}

const ChapterDetailPane = ({
  packageId,
  gradeId,
  subjectId,
  chapter,
  chapterIndex,
  inclusionsEnabled,
  onChange,
  readOnly = false,
  lessonHrefBuilder,
  lessonOrderOverride,
  lessonReorderable = false,
  onLessonReorder,
  onResetLessonOrder,
  isLessonCustomOrdered = false,
  additive = false,
  ownLessons = [],
  ownTests = [],
  onAddLesson,
  onAttachOwnTest,
  onDeleteOwnLesson,
  onRemoveOwnTest,
}: Props) => {
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<PackageAttachmentKind | null>(null);

  const baseLessons = inclusionsEnabled.lessons
    ? getLessonPlansForChapter(packageId, chapter.id)
    : [];
  // In additive mode the institute's own lessons sit alongside SA's.
  const rawLessons = additive ? [...baseLessons, ...ownLessons] : baseLessons;
  const ownLessonIds = new Set(ownLessons.map((l) => l.id));
  const lessons = (() => {
    if (!lessonOrderOverride || lessonOrderOverride.length === 0) return rawLessons;
    const byId = new Map(rawLessons.map((l) => [l.id, l]));
    const out: typeof rawLessons = [];
    for (const id of lessonOrderOverride) {
      const l = byId.get(id);
      if (l) {
        out.push(l);
        byId.delete(id);
      }
    }
    for (const remaining of rawLessons) {
      if (byId.has(remaining.id)) out.push(remaining);
    }
    return out;
  })();
  const attachments = getAttachmentsForChapter(packageId, chapter.id);
  const testAttachments = attachments.filter((a) => a.kind !== "grand-test");
  const totalTestCount = testAttachments.length + (additive ? ownTests.length : 0);
  const blockCount = lessons.reduce((s, lp) => s + lp.blocks.length, 0);
  const examName = (id: string) =>
    teacherExams.find((e) => e.id === id)?.name ?? id;

  // What add/delete controls are available.
  const showLessonAdd = inclusionsEnabled.lessons && (additive || !readOnly);
  const showTestAdd = additive || (!readOnly && inclusionsEnabled.tests);
  const showPypAdd = !readOnly && !additive && inclusionsEnabled.pyp;
  const hasAnyAdd = showLessonAdd || showTestAdd || showPypAdd;

  const openLesson = (lessonId: string) =>
    navigate(
      lessonHrefBuilder
        ? lessonHrefBuilder(lessonId)
        : `/superadmin/packages/${packageId}/lesson/${lessonId}`,
    );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onLessonReorder) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(lessons, oldIndex, newIndex);
    onLessonReorder(next.map((l) => l.id));
  };

  const addLesson = () => {
    if (additive) {
      onAddLesson?.();
      return;
    }
    navigate(
      `/superadmin/packages/${packageId}/lesson/new?grade=${gradeId}&subject=${subjectId}&chapter=${chapter.id}`,
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 border-b">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            Chapter {String(chapterIndex + 1).padStart(2, "0")}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight break-words md:truncate">
            {chapter.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              {lessons.length} lesson plan{lessons.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              {blockCount} block{blockCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  totalTestCount > 0 ? "bg-emerald-500" : "bg-muted-foreground/40",
                )}
              />
              {totalTestCount} test{totalTestCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        {hasAnyAdd && (
        <div className="flex flex-wrap gap-2">
          {showLessonAdd && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addLesson}>
              <Plus className="w-3.5 h-3.5" /> Add lesson plan
            </Button>
          )}
          {showTestAdd && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setSheet("chapter-test")}
            >
              <Plus className="w-3.5 h-3.5" /> Attach test
            </Button>
          )}
          {showPypAdd && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setSheet("pyp")}
            >
              <Plus className="w-3.5 h-3.5" /> Attach PYP
            </Button>
          )}
        </div>
        )}
      </div>

      {/* Empty state */}
      {lessons.length === 0 && totalTestCount === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            Nothing in this chapter yet
          </p>
          {hasAnyAdd && (
            <>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
            Add a lesson plan to start building content, or attach a chapter test for assessment.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {showLessonAdd && (
              <Button size="sm" className="gap-1.5" onClick={addLesson}>
                <Plus className="w-3.5 h-3.5" /> Add the first lesson plan
              </Button>
            )}
            {showTestAdd && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setSheet("chapter-test")}
              >
                <Plus className="w-3.5 h-3.5" /> Attach a test
              </Button>
            )}
          </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Lesson plans */}
          {lessons.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-1 mb-2 gap-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Lesson plans
                </div>
                {lessonReorderable && isLessonCustomOrdered && onResetLessonOrder && (
                  <button
                    type="button"
                    onClick={onResetLessonOrder}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset order
                  </button>
                )}
              </div>
              {lessonReorderable && (
                <p className="px-1 mb-2 text-[11px] text-muted-foreground">
                  Drag <GripVertical className="inline w-3 h-3 align-text-bottom" /> to reorder lesson plans for this institute.
                </p>
              )}
              {lessonReorderable ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
                  <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {lessons.map((lp, i) => (
                        <SortableLessonRow
                          key={lp.id}
                          id={lp.id}
                          index={i}
                          title={lp.title}
                          blockCount={lp.blocks.length}
                          onOpen={() => openLesson(lp.id)}
                          owned={additive && ownLessonIds.has(lp.id)}
                          onDelete={
                            additive && ownLessonIds.has(lp.id) && onDeleteOwnLesson
                              ? () => onDeleteOwnLesson(lp.id)
                              : undefined
                          }
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : (
                <ul className="space-y-2">
                  {lessons.map((lp, i) => (
                    <li key={lp.id}>
                      <button
                        onClick={() => openLesson(lp.id)}
                        className="group w-full flex items-center gap-4 px-3 sm:px-4 py-3 rounded-xl border bg-background hover:border-primary/40 hover:shadow-sm transition-all text-left min-h-[64px]"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-2 sm:truncate">
                            {lp.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {lp.blocks.length} block{lp.blocks.length === 1 ? "" : "s"}
                            {lp.blocks.length > 0 && (
                              <> · ~{Math.max(5, lp.blocks.length * 5)} min</>
                            )}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tests */}
          {totalTestCount > 0 && (
            <div className="mt-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                Chapter tests
              </div>
              <ul className="space-y-2">
                {testAttachments.map((a) => (
                  <li
                    key={a.id}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40"
                  >
                    <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-violet-900 truncate">
                        {examName(a.examId)}
                      </p>
                      <p className="text-[11px] text-violet-700 font-medium">
                        {a.kind === "pyp" ? "Previous Year Paper" : "Chapter test"}
                      </p>
                    </div>
                    {!readOnly && !additive && (
                    <button
                      onClick={() => {
                        removeAttachment(a.id);
                        onChange();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded hover:bg-violet-100"
                      aria-label="Remove test"
                    >
                      <X className="w-3.5 h-3.5 text-violet-700" />
                    </button>
                    )}
                    {additive && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-violet-700/80 bg-violet-100 px-1.5 py-0.5 rounded">
                        Shared
                      </span>
                    )}
                  </li>
                ))}
                {additive &&
                  ownTests.map((t) => (
                    <li
                      key={t.id}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl border bg-background"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {examName(t.examId)}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Chapter test
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Yours
                      </span>
                      {onRemoveOwnTest && (
                        <button
                          onClick={() => {
                            onRemoveOwnTest(t.id);
                            onChange();
                          }}
                          className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded hover:bg-muted"
                          aria-label="Remove your test"
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}

      {sheet && (
        <AttachTestSheet
          open={!!sheet}
          onOpenChange={(o) => !o && setSheet(null)}
          kind={sheet}
          subjectId={subjectId}
          excludeExamIds={[
            ...getAttachmentsForChapter(packageId, chapter.id)
              .filter((a) => a.kind === sheet)
              .map((a) => a.examId),
            ...(additive ? ownTests.map((t) => t.examId) : []),
          ]}
          onAttach={(ids) => {
            if (additive && onAttachOwnTest) {
              onAttachOwnTest(ids);
            } else {
              attachExamsToPackage(packageId, ids, {
                kind: sheet,
                gradeId,
                subjectId,
                chapterId: chapter.id,
              });
            }
            onChange();
          }}
        />
      )}
    </div>
  );
};

export default ChapterDetailPane;

// ---------------------------------------------------------------------------

interface SortableLessonRowProps {
  id: string;
  index: number;
  title: string;
  blockCount: number;
  onOpen: () => void;
}

const SortableLessonRow = ({ id, index, title, blockCount, onOpen }: SortableLessonRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 sm:gap-2 rounded-xl border bg-background hover:border-primary/40 hover:shadow-sm transition-all min-h-[64px]",
        isDragging && "opacity-60 shadow-lg ring-1 ring-primary/30 z-10 relative",
      )}
    >
      <button
        type="button"
        className="shrink-0 h-12 w-8 ml-1 flex items-center justify-center text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label={`Drag to reorder ${title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 pr-3 sm:pr-4 py-3 text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground line-clamp-2 sm:truncate">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {blockCount} block{blockCount === 1 ? "" : "s"}
            {blockCount > 0 && <> · ~{Math.max(5, blockCount * 5)} min</>}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary shrink-0" />
      </button>
    </li>
  );
};