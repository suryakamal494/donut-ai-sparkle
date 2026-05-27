import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Plus, BookOpen, Play, HelpCircle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBlock } from "./WorkspaceBlock";
import { ContentPreviewDialog } from "./ContentPreviewDialog";
import { blockTypeConfig, type LessonPlanBlock, type BlockType } from "./types";
import { cn } from "@/lib/utils";

interface WorkspaceCanvasProps {
  blocks: LessonPlanBlock[];
  onReorder: (blocks: LessonPlanBlock[]) => void;
  onEditBlock: (block: LessonPlanBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBetween: (index: number, type: BlockType) => void;
  /**
   * "packages" mode hides the 4-block-type empty-state legend and the bottom
   * "Add Content" button (the SuperAdmin Packages composer renders its own
   * two-action toolbar above the canvas instead).
   */
  mode?: "teacher" | "packages";
}

export const WorkspaceCanvas = ({
  blocks,
  onReorder,
  onEditBlock,
  onDeleteBlock,
  onAddBetween,
  mode = "teacher",
}: WorkspaceCanvasProps) => {
  const [previewBlock, setPreviewBlock] = useState<LessonPlanBlock | null>(null);
  const [activeBlock, setActiveBlock] = useState<LessonPlanBlock | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const block = blocks.find((b) => b.id === event.active.id);
    setActiveBlock(block || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onReorder(newBlocks);
    }
  };

  // Empty State
  if (blocks.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-border/60 p-8 sm:p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-[hsl(var(--donut-pink))]/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start building your lesson
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "packages"
              ? "Use the buttons above to attach existing content or add a quiz. Drag to reorder."
              : "Use the toolbar above to add teaching blocks. Drag and drop to reorder."}
          </p>

          {mode === "teacher" && (
          <div className="grid grid-cols-2 gap-3 text-left">
            {(['explain', 'demonstrate', 'quiz', 'homework'] as BlockType[]).map((type) => {
              const config = blockTypeConfig[type];
              const Icon = type === 'explain' ? BookOpen 
                : type === 'demonstrate' ? Play 
                : type === 'quiz' ? HelpCircle 
                : ClipboardList;
              
              return (
                <div 
                  key={type}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg",
                    config.bgColor
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                    config.color
                  )}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {config.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={blocks.map(b => b.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <WorkspaceBlock
              key={block.id}
              block={block}
              index={index}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
              onPreview={(block) => setPreviewBlock(block)}
            />
          ))}
          
          {/* Single Add Content Button at Bottom (teacher mode only — packages has its own toolbar) */}
          {mode === "teacher" && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 gap-2 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                onClick={() => onAddBetween(blocks.length, 'explain')}
              >
                <Plus className="w-4 h-4" />
                Add Content
              </Button>
            </div>
          )}
        </div>

        {/* Content Preview Dialog */}
        <ContentPreviewDialog
          open={!!previewBlock}
          onOpenChange={(open) => !open && setPreviewBlock(null)}
          block={previewBlock}
        />
      </SortableContext>

      {/* Drag Overlay - shows a floating preview of the dragged block */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      }}>
        {activeBlock ? (
          <div className="opacity-95 shadow-2xl rounded-lg ring-2 ring-primary/30 rotate-[1deg]">
            <WorkspaceBlock
              block={activeBlock}
              index={blocks.findIndex(b => b.id === activeBlock.id)}
              onEdit={() => {}}
              onDelete={() => {}}
              onPreview={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
