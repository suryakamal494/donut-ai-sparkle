import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { curriculums, courses, subjects, getClassName } from "@/data/masterData";
import { upsertPackage } from "@/data/packages";
import type {
  Package,
  PackageInclusions,
  PackageShapeEntry,
  PackageSourceType,
} from "@/types/packages";

const ALL_CLASSES: string[] = [
  "class-6",
  "class-7",
  "class-8",
  "class-9",
  "class-10",
  "class-11",
  "class-12",
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `package-${Date.now()}`;

type StepKey = 1 | 2 | 3;

const STEPS: { key: StepKey; label: string }[] = [
  { key: 1, label: "Identity" },
  { key: 2, label: "Grades & Subjects" },
  { key: 3, label: "Inclusions" },
];

const CreatePackage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>(1);

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<PackageSourceType>("curriculum");
  const [sourceId, setSourceId] = useState("");

  // Step 2
  const [shape, setShape] = useState<PackageShapeEntry[]>([]);

  // Step 3
  const [inclusions, setInclusions] = useState<PackageInclusions>({
    chapterTests: true,
    grandTests: false,
    previousYearPapers: false,
  });

  const sourceOptions = useMemo(
    () =>
      sourceType === "curriculum"
        ? curriculums.filter((c) => c.isActive)
        : courses.filter((c) => c.isActive),
    [sourceType],
  );

  const toggleGrade = (gradeId: string) => {
    setShape((prev) =>
      prev.some((r) => r.gradeId === gradeId)
        ? prev.filter((r) => r.gradeId !== gradeId)
        : [...prev, { gradeId, subjectIds: [] }],
    );
  };

  const toggleSubject = (gradeId: string, subjectId: string) => {
    setShape((prev) =>
      prev.map((r) =>
        r.gradeId !== gradeId
          ? r
          : {
              ...r,
              subjectIds: r.subjectIds.includes(subjectId)
                ? r.subjectIds.filter((s) => s !== subjectId)
                : [...r.subjectIds, subjectId],
            },
      ),
    );
  };

  const step1Valid = name.trim().length >= 3 && sourceId.length > 0;
  const step2Valid =
    shape.length > 0 && shape.every((r) => r.subjectIds.length > 0);

  const canAdvance = step === 1 ? step1Valid : step === 2 ? step2Valid : true;

  const handleNext = () => {
    if (!canAdvance) return;
    if (step < 3) {
      setStep((s) => (s + 1) as StepKey);
      return;
    }
    // Finish: create + navigate to editor
    const id = slugify(name);
    const now = new Date().toISOString();
    const pkg: Package = {
      id,
      name: name.trim(),
      description: description.trim() || undefined,
      sourceType,
      sourceId,
      shape,
      inclusions,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    upsertPackage(pkg);
    navigate(`/superadmin/packages/${id}`);
  };

  const handleBack = () => {
    if (step === 1) navigate("/superadmin/packages");
    else setStep((s) => (s - 1) as StepKey);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 flex items-center gap-3 px-4 md:px-6 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium">Packages</p>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            New Package
          </h1>
        </div>
      </header>

      {/* Step indicator — slim */}
      <div className="border-b bg-background/60 px-4 md:px-6 py-3">
        <ol className="flex items-center gap-2 max-w-2xl mx-auto">
          {STEPS.map((s, idx) => {
            const done = step > s.key;
            const active = step === s.key;
            return (
              <li key={s.key} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors",
                    done && "bg-emerald-500 text-white",
                    active && "bg-primary text-primary-foreground",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : s.key}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border" />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-28 md:pb-6">
          {step === 1 && (
            <section className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pkg-name">Package name</Label>
                <Input
                  id="pkg-name"
                  placeholder="e.g. CBSE Class 7 Science Foundation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used in the list view and editor header.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pkg-desc">Description (optional)</Label>
                <Textarea
                  id="pkg-desc"
                  placeholder="One or two lines about what this pack covers."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <RadioGroup
                  value={sourceType}
                  onValueChange={(v) => {
                    setSourceType(v as PackageSourceType);
                    setSourceId("");
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  {(["curriculum", "course"] as PackageSourceType[]).map((t) => (
                    <Label
                      key={t}
                      htmlFor={`src-${t}`}
                      className={cn(
                        "flex items-center gap-2 border rounded-xl px-3 py-2.5 cursor-pointer transition-colors",
                        sourceType === t
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <RadioGroupItem id={`src-${t}`} value={t} />
                      <span className="capitalize text-sm font-medium">{t}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Pick a {sourceType}</Label>
                <Select value={sourceId} onValueChange={setSourceId}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${sourceType}…`} />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-1">
                  Pick the grades this package covers
                </h2>
                <p className="text-xs text-muted-foreground">
                  For each selected grade, pick at least one subject.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ALL_CLASSES.map((g) => {
                  const active = shape.some((r) => r.gradeId === g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGrade(g)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
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

              {shape.length > 0 && (
                <div className="space-y-3">
                  {shape.map((row) => (
                    <div
                      key={row.gradeId}
                      className="border rounded-xl p-3 space-y-2 bg-background"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {getClassName(row.gradeId)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {row.subjectIds.length} subject
                          {row.subjectIds.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {subjects.map((s) => {
                          const active = row.subjectIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              onClick={() => toggleSubject(row.gradeId, s.id)}
                              className={cn(
                                "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors",
                                active
                                  ? "bg-primary/10 text-primary border-primary/40"
                                  : "bg-background text-muted-foreground hover:text-foreground border-border",
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
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-1">
                  Which assessment slots should this package expose?
                </h2>
                <p className="text-xs text-muted-foreground">
                  You can attach actual tests later inside the editor.
                </p>
              </div>

              {[
                {
                  key: "chapterTests" as const,
                  title: "Chapter Tests",
                  helper:
                    "Per-chapter quick tests authored in the Exam module.",
                  icon: Layers,
                },
                {
                  key: "grandTests" as const,
                  title: "Grand Tests",
                  helper:
                    "Cross-chapter assessments for term reviews and mock cycles.",
                  icon: Sparkles,
                },
                {
                  key: "previousYearPapers" as const,
                  title: "Previous Year Papers",
                  helper:
                    "Past exam papers attached at the subject level.",
                  icon: Layers,
                },
              ].map(({ key, title, helper, icon: Icon }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{helper}</p>
                  </div>
                  <Switch
                    checked={inclusions[key]}
                    onCheckedChange={(v) =>
                      setInclusions((prev) => ({ ...prev, [key]: v }))
                    }
                  />
                </label>
              ))}
            </section>
          )}
        </div>
      </div>

      {/* Footer / actions */}
      <footer className="border-t bg-background px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={handleBack}>
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canAdvance}
          className="gap-2"
          style={
            canAdvance
              ? {
                  background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
                }
              : undefined
          }
        >
          {step === 3 ? "Create package" : "Continue"}
          {step < 3 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </footer>
    </div>
  );
};

export default CreatePackage;