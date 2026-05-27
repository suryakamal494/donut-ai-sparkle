import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings, CheckCircle2, ClipboardList, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPackageById,
  getGrandTestsForPackage,
  attachExamsToPackage,
  removeAttachment,
  getLessonPlansForPackage,
  publishPackage,
} from "@/data/packages";
import { curriculums, courses } from "@/data/masterData";
import { teacherExams } from "@/data/teacher/exams";
import GradeSwitcher from "@/components/packages/editor/GradeSwitcher";
import SubjectTabs from "@/components/packages/editor/SubjectTabs";
import ChapterAccordion from "@/components/packages/editor/ChapterAccordion";
import { getChaptersForScope } from "@/components/packages/editor/packageChapterLookup";
import AttachTestSheet from "@/components/packages/editor/AttachTestSheet";
import PackageSettingsSheet from "@/components/packages/editor/PackageSettingsSheet";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusStyles = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-muted text-muted-foreground",
} as const;

const PackageEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pkg = id ? getPackageById(id) : undefined;

  const gradeIds = useMemo(() => pkg?.shape.map((s) => s.gradeId) ?? [], [pkg]);
  const [activeGrade, setActiveGrade] = useState<string>(gradeIds[0] ?? "");

  const activeRow = useMemo(
    () => pkg?.shape.find((s) => s.gradeId === activeGrade),
    [pkg, activeGrade],
  );
  const [activeSubject, setActiveSubject] = useState<string>(
    activeRow?.subjectIds[0] ?? "",
  );
  const [grandSheetOpen, setGrandSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const { toast } = useToast();

  // When grade changes, snap subject to first available for that grade.
  useEffect(() => {
    if (!activeRow) return;
    if (!activeRow.subjectIds.includes(activeSubject)) {
      setActiveSubject(activeRow.subjectIds[0] ?? "");
    }
  }, [activeRow, activeSubject]);

  const chapters = useMemo(() => {
    if (!pkg || !activeGrade || !activeSubject) return [];
    return getChaptersForScope(
      pkg.sourceType,
      pkg.sourceId,
      activeGrade,
      activeSubject,
    );
  }, [pkg, activeGrade, activeSubject]);

  if (!pkg) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-16 flex items-center gap-3 px-6 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/superadmin/packages")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Package not found</h1>
        </header>
      </div>
    );
  }

  const sourceName =
    pkg.sourceType === "curriculum"
      ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
      : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;

  const lessonCount = getLessonPlansForPackage(pkg.id).length;
  const grandTestCount = getGrandTestsForPackage(pkg.id).length;
  const anyTestInclusion =
    pkg.inclusions.chapterTests ||
    pkg.inclusions.grandTests ||
    pkg.inclusions.previousYearPapers;
  const lessonsRequirementMet =
    !pkg.inclusions.lessonPlans || lessonCount > 0;
  const testsRequirementMet =
    !anyTestInclusion || grandTestCount > 0 || lessonCount > 0; /* chapter attachments hard to count cheaply; treat lessons OR grand as a proxy if tests-only flow not yet attached */
  const hasAnyInclusion = pkg.inclusions.lessonPlans || anyTestInclusion;
  const canPublish =
    hasAnyInclusion &&
    lessonsRequirementMet &&
    pkg.status !== "published";
  const publishBlockReason =
    pkg.status === "published"
      ? "Package is already published."
      : !hasAnyInclusion
      ? "Enable at least one inclusion in settings."
      : pkg.inclusions.lessonPlans
      ? "Add at least one lesson plan to publish."
      : "Attach at least one test to publish.";

  return (
    <div className="flex flex-col h-full">
      {/* Top bar — package name + status + actions */}
      <header className="h-14 flex items-center gap-2 px-3 md:px-6 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/superadmin/packages")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {pkg.sourceType === "curriculum" ? "Curriculum" : "Course"} · {sourceName}
          </p>
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate leading-tight">
            {pkg.name}
          </h1>
        </div>
        <span
          className={cn(
            "hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
            statusStyles[pkg.status],
          )}
        >
          {pkg.status}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">Settings</span>
        </Button>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  disabled={!canPublish}
                  onClick={() => setPublishOpen(true)}
                  className="gap-1.5"
                  style={{
                    background:
                      "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {pkg.status === "published" ? "Published" : "Publish"}
                  </span>
                </Button>
              </span>
            </TooltipTrigger>
            {!canPublish && (
              <TooltipContent side="bottom">{publishBlockReason}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </header>

      {/* Grade switcher */}
      <div className="border-b bg-background/60">
        <GradeSwitcher
          gradeIds={gradeIds}
          activeId={activeGrade}
          onChange={setActiveGrade}
        />
      </div>

      {/* Subject tabs */}
      <SubjectTabs
        subjectIds={activeRow?.subjectIds ?? []}
        activeId={activeSubject}
        onChange={setActiveSubject}
      />

      {/* Chapters canvas — owns the scroll */}
      <main className="flex-1 overflow-y-auto">
        <ChapterAccordion
          packageId={pkg.id}
          gradeId={activeGrade}
          subjectId={activeSubject}
          chapters={chapters}
          inclusionsEnabled={{
            lessons: pkg.inclusions.lessonPlans,
            tests: pkg.inclusions.chapterTests,
            grand: pkg.inclusions.grandTests,
            pyp: pkg.inclusions.previousYearPapers,
          }}
        />

        {pkg.inclusions.grandTests && (
          <GrandTestsSection
            packageId={pkg.id}
            gradeId={activeGrade}
            subjectId={activeSubject}
            onOpenSheet={() => setGrandSheetOpen(true)}
            onRemove={(id) => {
              removeAttachment(id);
              refresh();
            }}
          />
        )}
      </main>

      {pkg.inclusions.grandTests && (
        <AttachTestSheet
          open={grandSheetOpen}
          onOpenChange={setGrandSheetOpen}
          kind="grand-test"
          subjectId={activeSubject}
          excludeExamIds={getGrandTestsForPackage(pkg.id).map((a) => a.examId)}
          onAttach={(ids) => {
            attachExamsToPackage(pkg.id, ids, {
              kind: "grand-test",
              gradeId: activeGrade,
              subjectId: activeSubject,
            });
            refresh();
          }}
        />
      )}

      <PackageSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        pkg={pkg}
        onChange={refresh}
        onArchived={() => navigate("/superadmin/packages")}
      />

      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this package?</AlertDialogTitle>
            <AlertDialogDescription>
              Institutes on matching tiers will see this package immediately.
              You can still edit lessons and attachments after publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                publishPackage(pkg.id);
                setPublishOpen(false);
                refresh();
                toast({
                  title: "Published",
                  description: `${pkg.name} is now live.`,
                });
              }}
              style={{ background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)" }}
            >
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageEditor;

interface GrandTestsSectionProps {
  packageId: string;
  gradeId: string;
  subjectId: string;
  onOpenSheet: () => void;
  onRemove: (id: string) => void;
}

const GrandTestsSection = ({
  packageId,
  onOpenSheet,
  onRemove,
}: GrandTestsSectionProps) => {
  const items = getGrandTestsForPackage(packageId);
  const examName = (id: string) =>
    teacherExams.find((e) => e.id === id)?.name ?? id;
  return (
    <section className="border-t bg-muted/20 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Grand Tests</h2>
          <p className="text-xs text-muted-foreground">
            Package-wide assessments not tied to a specific chapter.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onOpenSheet}>
          <Plus className="w-3.5 h-3.5" /> Attach grand test
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No grand tests attached yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li
              key={a.id}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-background border text-sm"
            >
              <ClipboardList className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="flex-1 truncate">{examName(a.examId)}</span>
              <button
                onClick={() => onRemove(a.id)}
                className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-muted"
                aria-label="Remove grand test"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};