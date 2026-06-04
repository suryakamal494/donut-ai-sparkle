# Institute Packages — UI Audit & Phased Fix Plan

I audited the institute (institute panel) Packages module on desktop (1280), tablet (≥768), phone (390px) and small phone (320px), and reviewed the code. Findings below, then a phase-wise plan.

## Audit findings

### 🔴 Critical — chapters are unreachable on mobile
On the package detail "Content" tab, the Chapter Index rail is `hidden md:block` (only shows ≥768px). On phones the page jumps straight into Chapter 01 and there is **no way to switch chapters at all** — every phone user is stuck on the first chapter. This is the biggest breakage. (Desktop/tablet 3‑pane works correctly.)

### 🟠 High — lesson/chapter titles become unreadable on narrow screens
Lesson rows and chapter rows use single‑line `truncate`. On 320–390px every lesson collapses to the identical string "Knowing Our Nu…", so they're impossible to tell apart. Per your guidance, the fix is to redesign for mobile (keep the font, allow a 2‑line wrap) rather than shrink text.

### 🟠 High — initial load is slow / long skeleton
The detail page shows a lengthy loading skeleton and feels sluggish. Causes: heavy synchronous mock-data work and derived lists (e.g. `railItems` recomputes `getLessonPlansForChapter` for every chapter on every render; chapter/lesson lookups aren't memoized). This recompute storm also makes interactions (tab/subject switches) feel laggy.

### 🟡 Medium
- **Add content / Add quiz toolbar** (lesson view): the descriptive subtitle is clipped on phones ("…generate with AI" cut off). The 2‑column card layout is too tight under ~360px.
- **Shared lesson footer**: the fixed bottom bar overlaps the last block on phones; bottom padding doesn't fully clear it.
- **Chapter detail header**: chapter name uses `truncate`; should wrap on mobile so the full name is visible.

### ⚪ Low
- "Read-only" / "Shared" badges are hidden on phones (`sm:inline-flex`), so the use‑don't‑delete model isn't signalled on mobile.
- React Router v7 future‑flag warnings in console (cosmetic only).

## Phased implementation plan

### Phase 1 — Restore mobile chapter navigation (critical)
- Add a mobile-only chapter selector to the Content tab so all chapters are reachable < 768px. Approach: a compact "Chapter Index" trigger button (shows current chapter + count) that opens a bottom sheet / drawer listing all chapters, reusing the existing `ChapterRail` rows (selection + reorder grip). Selecting a chapter closes the sheet and updates the detail pane.
- Keep the existing desktop/tablet rail unchanged.

### Phase 2 — Mobile readability redesign (high)
- Lesson rows (`ChapterDetailPane` static + sortable) and chapter rows (`ChapterRail` `RowBody`): replace single-line `truncate` with a 2‑line clamp on mobile, same font size; keep truncate on desktop where space is tight.
- Chapter detail header title: allow wrap on mobile instead of `truncate`.
- `PackageWorkspaceToolbar`: stack to a single column under ~360px (or hide subtitle on xs) so labels never clip.

### Phase 3 — Performance & loading (high)
- Memoize derived data in `InstitutePackageDetail` (`railItems`, chapter/lesson lookups, batch lists) so they don't recompute every render.
- Verify the load skeleton resolves quickly after memoization; if mock generation is the bottleneck, cache the generated package data.
- Re-measure interaction latency (tab/subject/chapter switch) on mobile.

### Phase 4 — Polish & QA
- Fix shared-lesson fixed-footer overlap (correct bottom padding).
- Surface the "Read-only / Shared" context on mobile (small inline label).
- Full QA pass at 320 / 375 / 390 / 768 / 1280 across: package detail Content + Batches tabs, shared lesson view, own-lesson composer, Add content sheet, reorder (drag) on touch.

## Technical notes (files in scope)
- `src/pages/institute/packages/InstitutePackageDetail.tsx` — mobile chapter selector, memoization, header wrap.
- `src/components/packages/editor/ChapterRail.tsx` — reuse rows in mobile sheet; 2‑line clamp.
- `src/components/packages/editor/ChapterDetailPane.tsx` — lesson title clamp, header wrap.
- `src/components/packages/editor/PackageWorkspaceToolbar.tsx` — responsive stacking.
- `src/pages/institute/packages/InstitutePackageLessonView.tsx` — footer padding, mobile badge.

No backend/data-model changes; this is frontend/presentation only. The read-only "use, don't delete" content model stays exactly as-is.