import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { teacherLessonPlans, type LessonPlan } from "@/data/teacherData";
import { PageHeader } from "@/components/ui/page-header";
import { LessonPlanCard } from "@/components/teacher/LessonPlanCard";
import { toast } from "sonner";

// Extract unique chapters from lesson plans
const getUniqueChapters = (plans: LessonPlan[]) => {
  const chapters = [...new Set(plans.map(p => p.chapter))];
  return chapters.sort();
};

// Extract unique batches from lesson plans
const getUniqueBatches = (plans: LessonPlan[]) => {
  const batches = [...new Map(plans.map(p => [p.batchId, { id: p.batchId, name: p.batchName }])).values()];
  return batches;
};

interface LessonPlansProps {
  /** When embedded inside the Lesson Plans hub tab, hide the duplicate page header. */
  embedded?: boolean;
}

const LessonPlans = ({ embedded = false }: LessonPlansProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");

  const chapters = useMemo(() => getUniqueChapters(teacherLessonPlans), []);
  const batches = useMemo(() => getUniqueBatches(teacherLessonPlans), []);

  const filteredPlans = useMemo(() => {
    return teacherLessonPlans.filter((plan) => {
      const matchesSearch = 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        plan.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChapter = chapterFilter === "all" || plan.chapter === chapterFilter;
      const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
      const matchesBatch = batchFilter === "all" || plan.batchId === batchFilter;
      return matchesSearch && matchesChapter && matchesStatus && matchesBatch;
    });
  }, [searchQuery, chapterFilter, statusFilter, batchFilter]);

  // Stats calculations
  const stats = useMemo(() => ({
    total: teacherLessonPlans.length,
    ready: teacherLessonPlans.filter(p => p.status === 'ready').length,
    draft: teacherLessonPlans.filter(p => p.status === 'draft').length,
    used: teacherLessonPlans.filter(p => p.status === 'used').length,
  }), []);

  const handleClone = (plan: LessonPlan) => {
    toast.success(`Cloned "${plan.title}" - Opening in editor...`);
    navigate(`/teacher/lesson-plans/new?cloneFrom=${plan.id}`);
  };

  const handleDelete = (plan: LessonPlan) => {
    toast.success(`Deleted "${plan.title}"`);
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6 max-w-6xl mx-auto", embedded ? "" : "pb-20 md:pb-6")}>
      {/* Header with Stats */}
      <div className="space-y-3">
        {!embedded && (
          <PageHeader
            title="My Lesson Plans"
            description="Create, manage and reuse your teaching plans"
            breadcrumbs={[
              { label: "Teacher", href: "/teacher" },
              { label: "Lesson Plans" },
            ]}
          />
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-muted/50 text-xs gap-1.5 py-1 px-2.5">
            <FileText className="w-3 h-3" />
            {stats.total} Plans
          </Badge>
          <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50/50 text-xs gap-1.5 py-1 px-2.5">
            <CheckCircle2 className="w-3 h-3" />
            {stats.ready} Ready
          </Badge>
          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50/50 text-xs gap-1.5 py-1 px-2.5">
            <AlertCircle className="w-3 h-3" />
            {stats.draft} Drafts
          </Badge>
          {stats.used > 0 && (
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50/50 text-xs gap-1.5 py-1 px-2.5">
              <BookOpen className="w-3 h-3" />
              {stats.used} Used
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plans, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="w-[140px] sm:w-[160px] h-10 bg-white shrink-0">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {chapters.map(chapter => (
                  <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] sm:w-[120px] h-10 bg-white shrink-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[100px] sm:w-[120px] h-10 bg-white shrink-0">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map(batch => (
                  <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Create Button */}
          <Button 
            className="gradient-button gap-2 h-10 shrink-0"
            onClick={() => navigate("/teacher/lesson-plans/new")}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Plan</span>
          </Button>
        </div>
      </div>

      {/* Lesson Plans Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <LessonPlanCard 
            key={plan.id} 
            plan={plan}
            onClone={handleClone}
            onDelete={handleDelete}
          />
        ))}
        
        {/* Create New Plan Card - Always visible */}
        <Card 
          className="border-dashed border-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group min-h-[200px]"
          onClick={() => navigate("/teacher/lesson-plans/new")}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--donut-coral))] to-[hsl(var(--donut-pink))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Create New Plan</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Start from scratch or use AI
            </p>
            <div className="flex items-center gap-1 text-xs text-primary">
              <Sparkles className="w-3 h-3" />
              AI-powered assistance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No lesson plans found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or create a new plan
          </p>
          <Button 
            className="gradient-button gap-2"
            onClick={() => navigate("/teacher/lesson-plans/new")}
          >
            <Plus className="w-4 h-4" />
            Create New Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonPlans;
