import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, MoreHorizontal, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { curriculums, courses } from "@/data/masterData";
import { summarizeShape, summarizeCounts } from "@/data/packages";
import type { Package } from "@/types/packages";
import { countBoundBatches } from "@/data/institute/institutePackageBatches";

const statusStyles: Record<Package["status"], string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200",
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  archived: "bg-muted text-muted-foreground border-border",
};

interface Props {
  pkg: Package;
  mode?: "superadmin" | "institute";
  instituteId?: string;
  totalBatches?: number;
}

const PackageCard = ({ pkg, mode = "superadmin", instituteId, totalBatches }: Props) => {
  const navigate = useNavigate();
  const source =
    pkg.sourceType === "curriculum"
      ? curriculums.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId
      : courses.find((c) => c.id === pkg.sourceId)?.name ?? pkg.sourceId;
  const counts = summarizeCounts(pkg);
  const boundBatches =
    mode === "institute" && instituteId
      ? countBoundBatches(instituteId, pkg.id)
      : 0;

  const targetHref =
    mode === "institute"
      ? `/institute/packages/${pkg.id}`
      : `/superadmin/packages/${pkg.id}`;

  return (
    <button
      onClick={() => navigate(targetHref)}
      className="group text-left rounded-2xl border bg-card p-4 flex flex-col gap-3 transition-all hover:border-primary/40 hover:shadow-md"
    >
      {/* Header row: source chip + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-foreground/80">
          {pkg.sourceType === "curriculum" ? "Curriculum" : "Course"} · {source}
        </span>
        {mode === "superadmin" && (
          <span
            className={cn(
              "inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide",
              statusStyles[pkg.status],
            )}
          >
            {pkg.status}
          </span>
        )}
      </div>

      {/* Title + shape */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
          {pkg.name}
        </h3>
        <p className="text-xs text-muted-foreground">{summarizeShape(pkg)}</p>
      </div>

      {/* Footer counts */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/60 gap-2">
        <div className="flex items-center gap-x-3 gap-y-1 text-xs text-muted-foreground flex-wrap min-w-0">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {counts.lessons} lesson{counts.lessons === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            {counts.tests} test{counts.tests === 1 ? "" : "s"}
          </span>
          {counts.grand > 0 && (
            <span className="inline-flex items-center gap-1 text-violet-700">
              · {counts.grand} grand
            </span>
          )}
          {counts.pyp > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-700">
              · {counts.pyp} PYP
            </span>
          )}
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      {mode === "institute" && (
        <div className="flex items-center gap-1.5 -mt-1 text-[11px] font-medium text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {boundBatches === 0 ? (
            <span className="text-amber-700">Not assigned to any batch yet</span>
          ) : (
            <span>
              Assigned to{" "}
              <span className="font-semibold text-foreground">{boundBatches}</span>
              {typeof totalBatches === "number" ? ` of ${totalBatches}` : ""} batch
              {boundBatches === 1 ? "" : "es"}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default PackageCard;