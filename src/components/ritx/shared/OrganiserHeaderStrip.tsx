import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ritxAsset from "@/assets/logo-ritx.png.asset.json";
import paniitAsset from "@/assets/logo-paniit.png.asset.json";
import iithAsset from "@/assets/logo-iith.png.asset.json";

interface Props {
  variant?: "strip" | "hero";
  showSignout?: boolean;
}

// Slim organiser lockup that mounts on every RiTX page (top of the main content column).
// `hero` variant is larger for Login/Register.
export function OrganiserHeaderStrip({ variant = "strip", showSignout = false }: Props) {
  const navigate = useNavigate();
  const isHero = variant === "hero";
  const h = isHero ? "h-14 md:h-16" : "h-9 md:h-10";
  return (
    <div
      className={
        "w-full border-b border-orange-100/70 bg-gradient-to-r from-amber-50/90 via-white/60 to-orange-50/70 backdrop-blur-sm"
      }
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center justify-center md:justify-start gap-4 md:gap-8">
          <img src={paniitAsset.url} alt="PanIIT Alumni India" className={`${h} w-auto object-contain`} loading="lazy" />
          <div className="hidden sm:block w-px h-6 bg-orange-200/70" aria-hidden />
          <img src={iithAsset.url} alt="IIT Hyderabad" className={`${h} w-auto object-contain`} loading="lazy" />
          <div className="hidden sm:block w-px h-6 bg-orange-200/70" aria-hidden />
          <img src={ritxAsset.url} alt="RiTX" className={`${h} w-auto object-contain`} loading="lazy" />
        </div>
        {showSignout && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/80"
            onClick={() => navigate("/login")}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        )}
      </div>
    </div>
  );
}
