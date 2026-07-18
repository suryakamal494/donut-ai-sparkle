import icorgAsset from "@/assets/logo-icorg.png.asset.json";
import donutaiAsset from "@/assets/logo-donutai.png.asset.json";

// Sitewide footer: "Organised by ICORG" (left) + "Powered by theDonutAI" (right).
export function AppFooter() {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-orange-100/70 bg-white/95 backdrop-blur shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <span className="uppercase tracking-widest text-[10px] font-medium hidden sm:inline">Organised by</span>
          <img src={icorgAsset.url} alt="ICORG" className="h-7 md:h-8 w-auto object-contain" loading="lazy" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="uppercase tracking-widest text-[10px] font-medium hidden sm:inline">Powered by</span>
          <img src={donutaiAsset.url} alt="theDonutAI" className="h-7 md:h-8 w-auto object-contain" loading="lazy" />
        </div>
      </div>
    </footer>
  );
}