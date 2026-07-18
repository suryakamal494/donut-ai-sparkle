// Login-only sponsor placeholder strip. Three clickable tiles that open '#'
// until real sponsor URLs are configured.
const SLOTS = [1, 2, 3];

export function SponsorStrip() {
  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
        Sponsored by
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((n) => (
          <a
            key={n}
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label={`Sponsor ${n} — link coming soon`}
            className="h-14 rounded-xl border border-dashed border-orange-200 bg-white/70 hover:bg-white hover:border-donut-coral/50 transition-all flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Sponsor logo
          </a>
        ))}
      </div>
    </div>
  );
}