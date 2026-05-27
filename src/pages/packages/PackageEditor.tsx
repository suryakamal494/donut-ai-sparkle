import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPackageById } from "@/data/packages";

/** Phase 1 placeholder — full editor arrives in Phase 4. */
const PackageEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pkg = id ? getPackageById(id) : undefined;

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
        <div>
          <p className="text-xs text-muted-foreground font-medium">Packages</p>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {pkg?.name ?? "Package not found"}
          </h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          Editor arrives in Phase 4.
        </p>
      </div>
    </div>
  );
};

export default PackageEditor;