import { useState, useEffect } from "react";
import { Trash2, Archive, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Package } from "@/types/packages";
import {
  upsertPackage,
  archivePackage,
  getLessonPlansForPackage,
} from "@/data/packages";
import { getClassName, subjects as allSubjects } from "@/data/masterData";

const ALL_GRADES = ["class-6","class-7","class-8","class-9","class-10","class-11","class-12"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: Package;
  onChange: () => void;
  onArchived: () => void;
}

const PackageSettingsSheet = ({ open, onOpenChange, pkg, onChange, onArchived }: Props) => {
  const [name, setName] = useState(pkg.name);
  const [description, setDescription] = useState(pkg.description ?? "");
  const [shape, setShape] = useState(pkg.shape);
  const [inclusions, setInclusions] = useState(pkg.inclusions);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [removeGuard, setRemoveGuard] = useState<{
    type: "grade" | "subject";
    gradeId: string;
    subjectId?: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setName(pkg.name);
      setDescription(pkg.description ?? "");
      setShape(pkg.shape);
      setInclusions(pkg.inclusions);
    }
  }, [open, pkg]);

  const persist = (next: Partial<Package>) => {
    upsertPackage({
      ...pkg,
      name,
      description,
      shape,
      inclusions,
      updatedAt: new Date().toISOString(),
      ...next,
    });
    onChange();
  };

  const lessonsFor = (gradeId: string, subjectId?: string) =>
    getLessonPlansForPackage(pkg.id).filter(
      (lp) =>
        lp.gradeId === gradeId &&
        (subjectId ? lp.subjectId === subjectId : true),
    ).length;

  const toggleGrade = (g: string) => {
    const exists = shape.find((s) => s.gradeId === g);
    if (exists) {
      const count = lessonsFor(g);
      if (count > 0) {
        setRemoveGuard({ type: "grade", gradeId: g, count });
        return;
      }
      setShape((prev) => prev.filter((s) => s.gradeId !== g));
    } else {
      setShape((prev) => [...prev, { gradeId: g, subjectIds: [] }]);
    }
  };

  const toggleSubject = (gradeId: string, subjectId: string) => {
    const row = shape.find((s) => s.gradeId === gradeId);
    if (!row) return;
    const has = row.subjectIds.includes(subjectId);
    if (has) {
      const count = lessonsFor(gradeId, subjectId);
      if (count > 0) {
        setRemoveGuard({ type: "subject", gradeId, subjectId, count });
        return;
      }
    }
    setShape((prev) =>
      prev.map((s) =>
        s.gradeId === gradeId
          ? {
              ...s,
              subjectIds: has
                ? s.subjectIds.filter((id) => id !== subjectId)
                : [...s.subjectIds, subjectId],
            }
          : s,
      ),
    );
  };

  const confirmRemoval = () => {
    if (!removeGuard) return;
    if (removeGuard.type === "grade") {
      setShape((prev) => prev.filter((s) => s.gradeId !== removeGuard.gradeId));
    } else {
      setShape((prev) =>
        prev.map((s) =>
          s.gradeId === removeGuard.gradeId
            ? {
                ...s,
                subjectIds: s.subjectIds.filter((id) => id !== removeGuard.subjectId),
              }
            : s,
        ),
      );
    }
    setRemoveGuard(null);
  };

  const handleSave = () => {
    persist({});
    onOpenChange(false);
  };

  const handleArchive = () => {
    archivePackage(pkg.id);
    setConfirmArchive(false);
    onOpenChange(false);
    onArchived();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b">
            <SheetTitle className="text-base">Package settings</SheetTitle>
            <SheetDescription className="text-xs">
              Edit identity, shape, and inclusions for this package.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {/* Identity */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Identity
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-name" className="text-xs">Name</Label>
                <Input id="pkg-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-desc" className="text-xs">Description</Label>
                <Textarea
                  id="pkg-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </section>

            {/* Shape */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Grades & subjects
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {ALL_GRADES.map((g) => {
                  const active = shape.some((s) => s.gradeId === g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGrade(g)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground hover:bg-muted border-border",
                      )}
                    >
                      {getClassName(g)}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3 pt-1">
                {shape.map((row) => (
                  <div key={row.gradeId} className="rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      {getClassName(row.gradeId)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allSubjects.map((s) => {
                        const active = row.subjectIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleSubject(row.gradeId, s.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                              active
                                ? "bg-primary/15 text-primary border-primary/30"
                                : "bg-background text-muted-foreground hover:bg-muted border-border",
                            )}
                          >
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Inclusions */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Inclusions
              </h3>
              {[
                { key: "lessonPlans", label: "Lesson Plans (Content)", hint: "Author lesson plans with videos, PDFs, slides, and quizzes per chapter." },
                { key: "chapterTests", label: "Chapter Tests", hint: "Attach quick chapter assessments per chapter." },
                { key: "grandTests", label: "Grand Tests", hint: "Package-wide tests not tied to a chapter." },
                { key: "previousYearPapers", label: "Previous Year Papers", hint: "Attach PYPs from the exam library." },
              ].map((row) => (
                <div key={row.key} className="flex items-start justify-between gap-3 py-1">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{row.label}</p>
                    <p className="text-[11px] text-muted-foreground">{row.hint}</p>
                  </div>
                  <Switch
                    checked={(inclusions as any)[row.key]}
                    onCheckedChange={(v) => {
                      const next = { ...inclusions, [row.key]: v };
                      if (!next.lessonPlans && !next.chapterTests && !next.grandTests && !next.previousYearPapers) {
                        return; // require at least one
                      }
                      setInclusions(next);
                    }}
                  />
                </div>
              ))}
            </section>

            {/* Danger zone */}
            <section className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-destructive">
                Danger zone
              </h3>
              <Button
                variant="outline"
                className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={() => setConfirmArchive(true)}
              >
                <Archive className="w-4 h-4" />
                Archive package
              </Button>
            </section>
          </div>

          <div className="border-t px-5 py-3 flex items-center justify-end gap-2 bg-background">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              style={{ background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)" }}
            >
              Save changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove guard */}
      <AlertDialog open={!!removeGuard} onOpenChange={(o) => !o && setRemoveGuard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Remove {removeGuard?.type}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeGuard?.count} lesson plan
              {removeGuard?.count === 1 ? "" : "s"} live under this{" "}
              {removeGuard?.type}. They will be hidden from the editor but kept
              in storage. You can re-add the {removeGuard?.type} later to
              restore access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoval}>Remove anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive confirm */}
      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Archive this package?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden from the default list. You can restore it from
              the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PackageSettingsSheet;