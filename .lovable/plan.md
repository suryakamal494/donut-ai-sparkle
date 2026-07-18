## Goal

Add proper organiser branding to every RiTX page and a Sponsors block to Login only.

## Assets to create

1. **RiTX** — source from public site (ritx.in / PanIIT press pages), upload via `lovable-assets` → `src/assets/logo-ritx.png.asset.json`.
2. **PanIIT Alumni India** — source from panIIT.org, upload → `src/assets/logo-paniit.png.asset.json`.
3. **IIT Hyderabad** — source from iith.ac.in, upload → `src/assets/logo-iith.png.asset.json`.
4. **ICORG** — use the uploaded `Screenshot_2026-02-26_120259.png`; run `lovable-assets create --file /mnt/user-uploads/Screenshot_2026-02-26_120259.png --filename logo-icorg.png` → `src/assets/logo-icorg.png.asset.json`.
5. **theDonutAI** — generate a clean wordmark via `imagegen` (transparent PNG, monochrome "theDonutAI" with a small donut glyph) → `src/assets/logo-donutai.png.asset.json`.

If any public source fails (403, wrong file), fall back to a styled text wordmark for that specific logo and note it in the final reply so the user can drop in the real file.

## Components to add

1. **`src/components/ritx/shared/OrganiserHeaderStrip.tsx`** — slim horizontal strip (~44 px tall). Renders RiTX · PanIIT · IIT Hyderabad logos left-aligned, faint bottom border, cream background matching the warm theme. Responsive: on mobile shows only RiTX + a "+2" chip that reveals the others on tap.
2. **`src/components/ritx/shared/AppFooter.tsx`** — single-line footer: left "Organised by ICORG" (with small ICORG mark), right "Powered by theDonutAI" (with small mark). Muted colour, ~40 px tall, safe-area padding on mobile.
3. **`src/components/ritx/shared/SponsorStrip.tsx`** — Login-only. Small "Sponsored by" caption above three placeholder tiles (dashed border, "Sponsor logo" label). Each tile is an `<a href="#" target="_blank" rel="noreferrer">` wrapper so the click target already works; real URLs slot in later. Three-up on desktop, stacked on mobile.

## Wiring

- **`src/components/ritx/shared/RitxShell.tsx`** — inject `<OrganiserHeaderStrip />` above the existing top bar and `<AppFooter />` at the bottom of the main content column. Applies automatically to every Admin and Team page (they both wrap in `RitxShell`).
- **`src/pages/ritx/staff/Layout.tsx`** — Staff uses a custom shell; add the same strip + footer to keep coverage uniform.
- **`src/pages/ritx/Login.tsx`** — add `<OrganiserHeaderStrip />` at top, `<SponsorStrip />` below the login card, `<AppFooter />` at the bottom. Larger RiTX lockup already in the card stays as-is.
- **`src/pages/ritx/team/Register.tsx`** — same treatment as Login (header strip + footer, no sponsors).

## Layout & density notes

- Header strip and footer are intentionally thin (44 + 40 px) so the workspace UI doesn't lose vertical room.
- Sidebar `RitxShell` keeps its small RiTX mark unchanged — the strip lives in the main content column, so the sidebar isn't double-branded.
- All logos use the `.asset.json` `url` field via `import xAsset from "@/assets/x.png.asset.json"` — no binaries land in the repo.
- No new colours; uses existing warm tokens (`amber-50`, `donut-coral`, `muted-foreground`).

## Documentation

Append a short "Branding" section to `RITX_UI_MAP.md` §2 listing the three new shared components and where they mount, so the handoff doc stays accurate.

## Out of scope

- Real sponsor URLs (placeholder `#` links now, admin-editable list is a future request).
- Favicon changes.
- Any competition/business logic — this is purely branding.
