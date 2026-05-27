import { useNavigate } from "react-router-dom";
import { Package as PackageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Phase 1: Empty-state shell for the Packages list.
 * Subsequent phases swap this body for the two-pane browser.
 */
const Packages = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Thin header — breadcrumb + title, ~64px */}
      <header className="h-16 flex items-center justify-between px-6 border-b bg-background">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Master Data</p>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            Packages
          </h1>
        </div>
        <Button
          onClick={() => navigate("/superadmin/packages/new")}
          className="gap-2"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
          }}
        >
          <Plus className="w-4 h-4" />
          New Package
        </Button>
      </header>

      {/* Empty state — centered, generous but not wasteful */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(30 60% 95%) 0%, hsl(330 60% 96%) 100%)",
            }}
          >
            <PackageIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No packages yet
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Packages bundle lesson plans, chapter tests, and grand tests for a
            curriculum or course. Create one to start authoring content for
            institutes.
          </p>
          <Button
            onClick={() => navigate("/superadmin/packages/new")}
            size="lg"
            className="gap-2"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
            }}
          >
            <Plus className="w-4 h-4" />
            Create your first package
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Packages;