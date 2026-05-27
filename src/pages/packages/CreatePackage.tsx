import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Phase 1 placeholder — the 3-step wizard lands here in Phase 3. */
const CreatePackage = () => {
  const navigate = useNavigate();

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
            New Package
          </h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          Wizard arrives in Phase 3.
        </p>
      </div>
    </div>
  );
};

export default CreatePackage;