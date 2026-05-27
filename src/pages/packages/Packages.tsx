import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package as PackageIcon, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getAllPackages } from "@/data/packages";
import PackageSourceTree, {
  type SourceSelection,
} from "@/components/packages/PackageSourceTree";
import PackageCard from "@/components/packages/PackageCard";
import { curriculums, courses } from "@/data/masterData";

const Packages = () => {
  const navigate = useNavigate();
  const allPackages = useMemo(
    () => getAllPackages().filter((p) => p.status !== "archived"),
    [],
  );
  const [selection, setSelection] = useState<SourceSelection>({ kind: "all" });

  const visiblePackages = useMemo(() => {
    if (selection.kind === "all") return allPackages;
    return allPackages.filter(
      (p) => p.sourceType === selection.type && p.sourceId === selection.id,
    );
  }, [allPackages, selection]);

  const selectionLabel =
    selection.kind === "all"
      ? "All packages"
      : selection.type === "curriculum"
        ? curriculums.find((c) => c.id === selection.id)?.name ?? "Curriculum"
        : courses.find((c) => c.id === selection.id)?.name ?? "Course";

  return (
    <div className="flex flex-col h-full">
      {/* Thin header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b bg-background">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile tree trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <PackageSourceTree
                packages={allPackages}
                selection={selection}
                onChange={setSelection}
              />
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">
              {selectionLabel}
            </p>
            <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
              Packages
            </h1>
          </div>
        </div>
        <Button
          onClick={() => navigate("/superadmin/packages/new")}
          className="gap-2 hidden sm:inline-flex"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
          }}
        >
          <Plus className="w-4 h-4" />
          New Package
        </Button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left tree — desktop only */}
        <aside className="hidden md:block w-64 border-r bg-background/40 overflow-y-auto">
          <PackageSourceTree
            packages={allPackages}
            selection={selection}
            onChange={setSelection}
          />
        </aside>

        {/* Right pane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {visiblePackages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-md text-center">
                <div
                  className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(30 60% 95%) 0%, hsl(330 60% 96%) 100%)",
                  }}
                >
                  <PackageIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  No packages here yet
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {selection.kind === "all"
                    ? "Create a package to bundle lesson plans and tests for institutes."
                    : `No packages under ${selectionLabel} yet. Create one to get started.`}
                </p>
                <Button
                  onClick={() => navigate("/superadmin/packages/new")}
                  className="gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create package
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {visiblePackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={() => navigate("/superadmin/packages/new")}
        className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl gap-0 p-0"
        style={{
          background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
        }}
        aria-label="Create package"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Packages;