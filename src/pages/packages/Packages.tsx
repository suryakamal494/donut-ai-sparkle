import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package as PackageIcon, Plus, Menu, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getAllPackages } from "@/data/packages";
import PackageSourceTree, {
  type SourceSelection,
} from "@/components/packages/PackageSourceTree";
import PackageCard from "@/components/packages/PackageCard";
import { curriculums, courses } from "@/data/masterData";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "draft" | "published";

const Packages = () => {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selection, setSelection] = useState<SourceSelection>({ kind: "all" });

  const allPackages = useMemo(
    () =>
      showArchived
        ? getAllPackages().filter((p) => p.status === "archived")
        : getAllPackages().filter((p) => p.status !== "archived"),
    [showArchived],
  );

  const visiblePackages = useMemo(() => {
    let list = allPackages;
    if (selection.kind !== "all") {
      list = list.filter(
        (p) => p.sourceType === selection.type && p.sourceId === selection.id,
      );
    }
    if (!showArchived && statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [allPackages, selection, statusFilter, showArchived]);

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
              {showArchived ? "Archived packages" : "Packages"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 hidden sm:inline-flex"
            onClick={() => setShowArchived((v) => !v)}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "Active" : "Archived"}
          </Button>
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
        </div>
      </header>

      {!showArchived && (
        <div className="px-4 md:px-6 h-10 border-b bg-background/60 flex items-center gap-1">
          {(["all", "draft", "published"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 h-7 rounded-full text-xs font-medium capitalize transition-colors",
                statusFilter === s
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      )}

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