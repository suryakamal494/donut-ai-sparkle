import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Trash2, 
  Pencil,
  Eye,
  Clock,
  BookOpen,
  Play,
  HelpCircle,
  ClipboardList,
  Sparkles,
  FileText,
  Video,
  Image as ImageIcon,
  Timer,
  FolderOpen,
  Lock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { blockTypeConfig, type LessonPlanBlock } from "./types";

interface WorkspaceBlockProps {
  block: LessonPlanBlock;
  index: number;
  onEdit: (block: LessonPlanBlock) => void;
  onDelete: (blockId: string) => void;
  onPreview: (block: LessonPlanBlock) => void;
  /** When true, the block is shared/read-only: edit & delete are hidden. */
  locked?: boolean;
  /** Optional small badge text (e.g. "Shared" or "Added by your institute"). */
  tag?: string;
}

const iconMap = {
  explain: BookOpen,
  demonstrate: Play,
  quiz: HelpCircle,
  homework: ClipboardList,
};

const sourceIconMap = {
  presentation: FileText,
  video: Video,
  document: FileText,
  image: ImageIcon,
};

// Homework type configuration for visual indicators
type HomeworkType = 'practice' | 'test' | 'project';

const homeworkTypeConfig: Record<HomeworkType, { 
  label: string; 
  icon: typeof Pencil; 
  className: string;
}> = {
  practice: {
    label: 'Practice',
    icon: Pencil,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  test: {
    label: 'Test',
    icon: Timer,
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  project: {
    label: 'Project',
    icon: FolderOpen,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
};

export const WorkspaceBlock = ({ 
  block, 
  index, 
  onEdit, 
  onDelete,
  onPreview,
  locked = false,
  tag,
}: WorkspaceBlockProps) => {
  const config = blockTypeConfig[block.type];
  const Icon = iconMap[block.type];
  
  // Get homework type from sourceType field (set by HomeworkBlockDialog)
  const homeworkType = block.type === 'homework' && block.sourceType 
    ? homeworkTypeConfig[block.sourceType as HomeworkType] 
    : null;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.4 : 1,
  };

  const getSourceLabel = () => {
    if (block.source === 'library') return 'From Library';
    if (block.source === 'ai') return 'AI Generated';
    if (block.source === 'custom') return 'Custom Upload';
    return '';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group overflow-hidden",
        "bg-white border-l-4",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        isDragging && "shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-50",
        !isDragging && "hover:shadow-md",
        block.type === 'explain' && "border-l-[hsl(var(--donut-coral))]",
        block.type === 'demonstrate' && "border-l-[hsl(var(--donut-orange))]",
        block.type === 'quiz' && "border-l-[hsl(var(--donut-pink))]",
        block.type === 'homework' && "border-l-[hsl(var(--donut-purple))]"
      )}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {/* Drag Handle + Sequence */}
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground w-4 text-center">
            {index + 1}
          </span>
        </div>
        
        {/* Block Type Icon */}
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          config.color
        )}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] px-1.5 py-0.5 border-0",
                config.bgColor
              )}
            >
              {config.label}
            </Badge>
            
            {block.duration && block.duration > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {block.duration}m
              </Badge>
            )}
            
            {/* Homework Type Badge */}
            {homeworkType && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0.5 gap-0.5 font-medium",
                  homeworkType.className
                )}
              >
                <homeworkType.icon className="w-2.5 h-2.5" />
                {homeworkType.label}
              </Badge>
            )}
            
            {block.aiGenerated && (
              <Badge 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-0 gap-0.5"
              >
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </Badge>
            )}

            {tag && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0.5 gap-0.5 font-medium",
                  locked
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {locked && <Lock className="w-2.5 h-2.5" />}
                {tag}
              </Badge>
            )}
          </div>
          
          <h4 className="font-medium text-sm text-foreground mt-1 line-clamp-1">
            {block.title || "Untitled block"}
          </h4>
          
          {/* Source label - hide sourceType for homework since we show it as badge */}
          {block.source && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {getSourceLabel()}
              {block.sourceType && block.type !== 'homework' && ` • ${block.sourceType}`}
            </p>
          )}
          
          {block.type === 'quiz' && block.questions && block.questions.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {block.questions.length} question{block.questions.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {/* Actions - Always visible */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={() => onPreview(block)}
            title="Preview content"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {!locked && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={() => onEdit(block)}
                title="Edit block"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(block.id)}
                title="Delete block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
