import icorgAsset from "@/assets/logo-icorg.png.asset.json";
import donutaiAsset from "@/assets/logo-donutai.png.asset.json";

// Sitewide footer: "Organised by ICORG" (left) + "Powered by theDonutAI" (right).
export function AppFooter() {
  return (
    <footer className="mt-10 border-t border-orange-100/70 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest text-[10px] font-medium">Organised by</span>
          <img src={icorgAsset.url} alt="ICORG" className="h-4 w-auto object-contain" loading="lazy" />
        </div>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest text-[10px] font-medium">Powered by</span>
          <img src={donutaiAsset.url} alt="theDonutAI" className="h-4 w-auto object-contain" loading="lazy" />
        </div>
      </div>
    </footer>
  );
}