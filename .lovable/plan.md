# Class dropdown beside title; subjects stay as chips

Agreed — combining class + subject pills on one row gets cramped fast (5 classes × 7 subjects = 12 chips fighting for one row). Cleaner split:

- **Class** → compact dropdown right next to the package title in the header (low-frequency switch, one item visible at a time).
- **Subjects** → keep the pill row (high-frequency, scan-all-at-once).

## Proposed header layout

```text
← │ Curriculum · CBSE                                  [PUBLISHED]  [⚙ Settings]
    CBSE Comprehensive Foundation Pack  [Class 6 ▾]
    5/14 chapters · 150 plans · 200 blocks · 8 tests
─────────────────────────────────────────────────────────────────────
Mathematics · Physics · Chemistry · Biology · Hindi · English · Geography
```

### Class dropdown

- Inline-block trigger sitting **immediately after the title** on the same line (not in the right cluster). Style: a small subtle button — `Class 6 ▾` with `text-sm font-medium`, muted border, `h-7`.
- Click opens a shadcn `DropdownMenu` listing all `gradeIds` with the active one checked. Handles any number of classes (5, 10, doesn't matter) — no horizontal scroll, no overflow problems.
- Tap target ≥32px (still acceptable inline); on mobile renders the same way since the trigger is small and the menu uses the bottom-sheet via Radix portal.

### Title

- Stop truncating prematurely. Title gets the full remaining width on the line minus the small dropdown trigger. Use `min-w-0` + `truncate` on the title and let the dropdown sit beside it with `shrink-0`. Long names truncate gracefully but no longer compete with multiple pills.

### Published button redundancy

When `pkg.status === "published"`:
- Show the green `PUBLISHED` pill (status indicator) — keep.
- **Hide the gradient `Published` button** — it's the same word twice.

When `pkg.status === "draft"`:
- Hide the `DRAFT` pill.
- Show the gradient `Publish` button (the actionable verb).

When `pkg.status === "archived"`:
- Show muted `ARCHIVED` pill only.

### Mobile (<sm)

- Same layout, just stacks: title + dropdown on one line, breadcrumb above, metrics below. The dropdown's compact trigger fits even at 320px.
- The current mobile-only `GradeSwitcher` row (added in the last change) gets **removed** — the dropdown replaces it entirely on all viewports.

## Files to touch

- `src/pages/packages/PackageEditor.tsx`
  - Replace inline `<GradeSwitcher variant="compact" />` in header right cluster with a new compact dropdown placed next to the title.
  - Remove the `sm:hidden` mobile `GradeSwitcher` row.
  - Gate `<PUBLISHED>` pill and `<Publish>` button on `pkg.status`.
- `src/components/packages/editor/GradeSwitcher.tsx`
  - Add a `variant: "dropdown"` rendering using shadcn `DropdownMenu` with `DropdownMenuCheckboxItem`s. Keep existing `"row"` and `"compact"` variants for any other callers.

## What stays the same

Metrics line, subject tabs row, master-detail body, settings sheet, publish dialog, mobile chapter rail sheet.
