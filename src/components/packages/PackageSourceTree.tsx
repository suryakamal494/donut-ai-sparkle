import { useState } from "react";
import { ChevronDown, ChevronRight, FolderTree, GraduationCap, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { curriculums, courses } from "@/data/masterData";
import type { Package, PackageSourceType } from "@/types/packages";

export type SourceSelection =
  | { kind: "all" }
  | { kind: "source"; type: PackageSourceType; id: string };

interface Props {
  packages: Package[];
  selection: SourceSelection;
  onChange: (selection: SourceSelection) => void;
}

const PackageSourceTree = ({ packages, selection, onChange }: Props) => {
  const [openCurriculum, setOpenCurriculum] = useState(true);
  const [openCourses, setOpenCourses] = useState(true);

  const countFor = (type: PackageSourceType, id: string) =>
    packages.filter((p) => p.sourceType === type && p.sourceId === id).length;

  const isActive = (type: PackageSourceType, id: string) =>
    selection.kind === "source" && selection.type === type && selection.id === id;

  return (
    <nav className="flex flex-col gap-1 p-3 text-sm">
      <button
        onClick={() => onChange({ kind: "all" })}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors",
          selection.kind === "all"
            ? "bg-primary/10 text-primary"
            : "text-foreground/80 hover:bg-muted",
        )}
      >
        <Layers className="w-4 h-4" />
        <span className="flex-1 text-left">All packages</span>
        <span className="text-xs text-muted-foreground">{packages.length}</span>
      </button>

      {/* Curriculums group */}
      <div className="mt-2">
        <button
          onClick={() => setOpenCurriculum((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {openCurriculum ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <FolderTree className="w-3.5 h-3.5" />
          <span>Curriculums</span>
        </button>
        {openCurriculum && (
          <div className="mt-1 space-y-0.5">
            {curriculums.filter((c) => c.isActive).map((c) => {
              const count = countFor("curriculum", c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onChange({ kind: "source", type: "curriculum", id: c.id })}
                  className={cn(
                    "w-full flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg transition-colors",
                    isActive("curriculum", c.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Courses group */}
      <div className="mt-2">
        <button
          onClick={() => setOpenCourses((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {openCourses ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Courses</span>
        </button>
        {openCourses && (
          <div className="mt-1 space-y-0.5">
            {courses.filter((c) => c.isActive).map((c) => {
              const count = countFor("course", c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onChange({ kind: "source", type: "course", id: c.id })}
                  className={cn(
                    "w-full flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg transition-colors",
                    isActive("course", c.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default PackageSourceTree;