import { useMemo } from "react";
import { Package as PackageIcon } from "lucide-react";
import PackageCard from "@/components/packages/PackageCard";
import { getPackagesForInstitute } from "@/data/institute/institutePackages";
import { batches } from "@/data/instituteData";

// TODO: replace with real auth context once available
const CURRENT_INSTITUTE_ID = "inst-1";

const InstitutePackages = () => {
  const packages = useMemo(
    () => getPackagesForInstitute(CURRENT_INSTITUTE_ID),
    [],
  );
  const totalBatches = batches.length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <PackageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Packages</h1>
            <p className="text-sm text-muted-foreground">
              Lesson packs your SuperAdmin has assigned to this institute. Open any pack to
              preview content, reorder for your institute, and assign to batches.
            </p>
          </div>
        </div>
      </header>

      {packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <PackageIcon className="w-8 h-8 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No packages assigned yet
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Once your SuperAdmin assigns lesson packages to this institute, they'll show up
            here so you can review them and roll them out to your batches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              mode="institute"
              instituteId={CURRENT_INSTITUTE_ID}
              totalBatches={totalBatches}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutePackages;