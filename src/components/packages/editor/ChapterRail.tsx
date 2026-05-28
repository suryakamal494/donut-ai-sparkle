import { cn } from "@/lib/utils";
import { ClipboardCheck, GripVertical, RotateCcw } from "lucide-react";
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

export interface ChapterRailItem extends EditorChapter {
  lessonCount: number;
  testCount: number;
}

interface Props {
  items: ChapterRailItem[];
  selected: { kind: "chapter"; id: string } | { kind: "grand" };
  onSelectChapter: (id: string) => void;
  onSelectGrand: () => void;
  grandTestsEnabled: boolean;
  grandTestCount: number;
  /**
   * When true, chapter rows become drag-and-drop sortable with a visible grip handle.
   * Used by the institute package detail view to let admins reorder chapters
   * locally without leaving the Content tab.
   */
  reorderable?: boolean;
  onReorder?: (orderedIds: string[]) => void;
  isCustomOrdered?: boolean;
  onResetOrder?: () => void;
}

const ChapterRail = ({
  items,
  selected,
  onSelectChapter,
  onSelectGrand,
  grandTestsEnabled,
  grandTestCount,
  reorderable = false,
  onReorder,
  isCustomOrdered = false,
  onResetOrder,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    onReorder(next.map((c) => c.id));
  };

  return (
    <nav className="h-full overflow-y-auto bg-muted/20 border-r">
      <div className="px-3 pt-4 pb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Chapter Index
        </span>
        {reorderable && isCustomOrdered && onResetOrder && (
          <button
            type="button"
            onClick={onResetOrder}
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>
      {reorderable && (
        <p className="px-3 pb-2 text-[10px] text-muted-foreground leading-snug">
          Drag <GripVertical className="inline w-3 h-3 align-text-bottom" /> to reorder for this institute. SuperAdmin's order stays untouched.
        </p>
      )}
      {items.length === 0 ? (
        <ul className="px-2 pb-2">
          <li className="px-3 py-4 text-xs text-muted-foreground">
            No chapters in master data.
          </li>
        </ul>
      ) : reorderable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="px-2 pb-2 space-y-1">
              {items.map((c, idx) => (
                <SortableChapterRow
                  key={c.id}
                  chapter={c}
                  index={idx}
                  isActive={selected.kind === "chapter" && selected.id === c.id}
                  onSelect={() => onSelectChapter(c.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="px-2 pb-2 space-y-1">
          {items.map((c, idx) => {
            const isActive = selected.kind === "chapter" && selected.id === c.id;
            return (
              <ChapterRow
                key={c.id}
                chapter={c}
                index={idx}
                isActive={isActive}
                onSelect={() => onSelectChapter(c.id)}
              />
            );
          })}
        </ul>
      )}

      {grandTestsEnabled && (
        <>
          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground border-t mt-2">
            Global
          </div>
          <div className="px-2 pb-4">
            <button
              onClick={onSelectGrand}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 border transition-all min-h-[44px]",
                selected.kind === "grand"
                  ? "bg-background border-violet-300 shadow-sm"
                  : "border-transparent hover:bg-background hover:border-border",
              )}
            >
              <ClipboardCheck className="w-4 h-4 text-violet-600 shrink-0" />
              <span className="flex-1 text-left text-sm font-semibold text-foreground/80">
                Grand Tests
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  grandTestCount > 0
                    ? "bg-violet-100 text-violet-700"
                    : "text-muted-foreground/60",
                )}
              >
                {grandTestCount}
              </span>
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default ChapterRail;

// ---------------------------------------------------------------------------
// Row components
// ---------------------------------------------------------------------------

interface RowProps {
  chapter: ChapterRailItem;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

const ChapterRow = ({ chapter, index, isActive }: RowProps & { onSelect: () => void }) => {
  const dim = chapter.lessonCount === 0 && chapter.testCount === 0;
  return (
    <li>
      <button
        onClick={() => (arguments as any)} // unused
        className="hidden"
      />
      <ChapterRowInner chapter={chapter} index={index} isActive={isActive} dim={dim} onSelect={() => undefined} />
    </li>
  );
};