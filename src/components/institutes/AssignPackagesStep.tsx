import { useMemo, useState } from "react";
import { Search, Package as PackageIcon, BookOpen, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { curriculums, courses } from "@/data/masterData";
import { getEligiblePackagesForAssignment, summarizeShape, summarizeCounts } from "@/data/packages";
import type { Package } from "@/types/packages";

interface Props {
  selectedCurriculums: string[];
  selectedCourses: string[];
  selectedPackages: string[];
  onToggle: (packageId: string) => void;
}

const sourceName = (pkg: Package) =>
  pkg.sourceType === "curriculum"
    ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
    : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;

const AssignPackagesStep = ({
  selectedCurriculums,
  selectedCourses,
  selectedPackages,
  onToggle,
}: Props) => {
  const [search, setSearch] = useState("");

  const eligible = useMemo(
    () => getEligiblePackagesForAssignment(selectedCurriculums, selectedCourses),
    [selectedCurriculums, selectedCourses],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        sourceName(p).toLowerCase().includes(q),
    );
  }, [eligible, search]);

  // Group by source for visual clarity
  const grouped = useMemo(() => {
    const map = new Map<string, Package[]>();
    for (const p of filtered) {
      const label = `${p.sourceType === "curriculum" ? "Curriculum" : "Course"} · ${sourceName(p)}`;
      const arr = map.get(label) ?? [];
      arr.push(p);
      map.set(label, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (eligible.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        <PackageIcon className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="font-medium text-foreground">No packages available</p>
        <p className="mt-1 text-xs">
          Pick one or more curriculums or courses in step 1 to see matching packages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PackageIcon className="w-4 h-4 text-primary" />
          <h4 className="font-medium">Packages</h4>
          <Badge variant="outline">{selectedPackages.length} selected</Badge>
        </div>
        <div className="relative w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search packages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <ScrollArea className="h-[320px] pr-2">
        <div className="space-y-5">
          {grouped.map(([groupLabel, pkgs]) => (
            <div key={groupLabel} className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                {groupLabel}
              </p>
              <div className="space-y-2">
                {pkgs.map((pkg) => {
                  const checked = selectedPackages.includes(pkg.id);
                  const counts = summarizeCounts(pkg);
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => onToggle(pkg.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => onToggle(pkg.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {summarizeShape(pkg)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {counts.lessons} lesson{counts.lessons === 1 ? "" : "s"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" />
                            {counts.tests + counts.grand + counts.pyp} test
                            {counts.tests + counts.grand + counts.pyp === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AssignPackagesStep;