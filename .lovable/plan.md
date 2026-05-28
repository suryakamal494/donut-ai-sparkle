# Compact the Package Editor header

## Problem

Today the editor stacks 4 horizontal bars before content:

```text
Row 1  Header           ~64px   back · title · status · Settings · Published
Row 2  Class chips      ~56px   Class 6 / 7 / 11 / 12
Row 3  Subject tabs     ~48px   Mathematics · Physics · …
Row 4  Summary strip    ~48px   Chapters 5/14 · Lessons 150 · Blocks 200 · Tests 8
                       ─────
                       ~216px (≈32% of a 672px viewport, ≈40% with browser chrome)
```

Chapter 01 content only starts at ~y=410. The chapter rail is fine, but the right pane is starved.

## Goal

Collapse to **2 rows** of chrome (~104px total) without losing any function. Everything currently in those 4 bars stays accessible — just denser, smarter placement.

## Proposed layout

```text
Row 1  Unified header              ~56px
       ← │ Curriculum · CBSE                                       [Class 6 ▾] [⚙] [Published]
           CBSE Comprehensive Foundation Pack
           5/14 chapters · 150 plans · 200 blocks · 8 tests   ← metrics as a small muted line

Row 2  Subject tabs                ~48px
       Mathematics · Physics · Chemistry · Biology · Hindi · English · Geography
       ─────────────────────────────────────────────────────────────────────────
Body   Chapter Rail │ Chapter Detail Pane            ← starts at ~104px instead of ~216px
```

### Changes per row

1. **Header (`PackageEditor.tsx` header)**
   - Keep back arrow, breadcrumb (`Curriculum · CBSE`), title, status pill, Settings, Published.
   - Move the **Class switcher into the header right side** as a compact `Select` / dropdown (`Class 6 ▾`). On ≥lg screens it can render as a small segmented control if there are ≤4 classes; otherwise it collapses to a dropdown. This kills Row 2 entirely.
   - Replace the standalone **summary strip** with a single muted metrics line directly under the title: `5/14 chapters · 150 lesson plans · 200 blocks · 8 tests`. Same data, ~20px instead of 48px, and visually anchored to the package it describes.
   - Delete `PackageSummaryStrip.tsx` usage from the editor (keep the file for now in case we want it elsewhere, or remove if unused — confirm during build).

2. **Subject tabs (`SubjectTabs.tsx`)**
   - Keep as-is — this is the most frequently used switcher and deserves its own row.
   - Reduce vertical padding from `py-2` to `py-1.5` and tighten chip height from `py-1.5` → `py-1` to shave ~8px.

3. **No change to chapter rail / detail pane** — they just get more height.

### Responsive behavior

- **≥1024px (desktop):** class switcher as segmented pills inline in header right cluster.
- **640–1023px (tablet):** class switcher collapses to a `Select` dropdown next to Settings.
- **<640px (mobile):** existing mobile sheet pattern stays; class switcher renders as a dropdown in the header. Metrics line wraps or truncates to `5/14 ch · 150 plans · 8 tests`.

### Files to touch

- `src/pages/packages/PackageEditor.tsx` — restructure header JSX, drop `<PackageSummaryStrip>` and the standalone class-chip row, render new inline metrics + class control.
- `src/components/packages/editor/GradeSwitcher.tsx` — add a `variant: "pills" | "dropdown"` prop (or a new compact rendering) so it can live inside the header.
- `src/components/packages/editor/SubjectTabs.tsx` — small padding tweak only.
- `src/components/packages/editor/PackageSummaryStrip.tsx` — stop rendering in editor; keep the file (unused) or delete based on usage check.

### What stays exactly the same

- All data, routes, IDs, mock seeding, chapter rail, detail pane, attach-test, settings sheet, lesson composer.
- Status pill, Settings button, Published action — same components, same behavior, just in a tighter row.
- Mobile sheet for chapter rail.

## Outcome

- Body content starts at ~y=104 instead of ~y=216 → roughly **+110px (~16% of viewport)** returned to the chapter detail pane.
- One less horizontal divider, less visual noise.
- Class + subject hierarchy is preserved (class is the "outer" filter, lives in header; subject is the "inner" filter, lives in its own row).

## Open question

Do you want the **metrics line** (`5/14 chapters · 150 plans · 200 blocks · 8 tests`) under the title, or tucked behind a small `i` icon/tooltip near the title so the header is even cleaner? Default in this plan: visible under the title (still saves ~28px vs current strip).
