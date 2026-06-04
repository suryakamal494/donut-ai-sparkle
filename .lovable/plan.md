# Institute lesson-plan view (use, don't delete)

## The problem

In the institute panel, opening a lesson plan inside a package currently navigates to `/superadmin/packages/:id/lesson/:lpId` — the SuperAdmin composer. That screen is built for **authoring**: it lets you delete blocks, save over the master, and is framed around "build this lesson." For an institute viewing a lesson plan that SuperAdmin shipped, that's wrong: they should be able to **use** it, **add** their own content/quiz on top, but never **delete or overwrite** the original.

## Recommended UX (my choice)

Treat a SuperAdmin lesson plan as a **locked base layer** the institute reads, plus an **institute layer** they can add to.

- The lesson opens **inside the institute panel** at a new institute route, so the sidebar stays collapsed and the breadcrumb/back goes to the institute package (not SuperAdmin).
- A clear header signal: a small banner/badge — "Shared by Donut · You can add your own content, the original stays intact." The Save button is replaced by an auto-saved "Your changes" indicator (institute edits are local overrides, not edits to the master).
- **Original blocks**: shown normally but **locked** — no delete (X) control, no overwrite. They can still be previewed.
- **Add content / Add quiz**: present in the toolbar exactly like today, but framed as "Add your content" — institute-added blocks get a subtle "Added by your institute" tag and **can** be removed (only the institute's own additions).
- **Reorder**: institute can reorder the combined list locally (we already store block-order overrides per institute); the master order is never touched.
- A **"Reset to original"** action clears the institute's additions + reorder for that lesson, falling back to SuperAdmin's version.
- For a lesson plan the **institute created itself** (not from SuperAdmin), it's their own content → full edit, including delete. Same composer UI as SuperAdmin.

This keeps one mental model ("the package is shared; you tailor it") and keeps complexity inside the package, as you wanted — no separate area.

## What gets built

### 1. New institute lesson route + page
- Route: `/institute/packages/:packageId/lesson/:lpId` in `InstituteRoutes.tsx` (the existing sidebar-collapse regex `/^\/institute\/packages\/[^/]+/` already covers it).
- New page `src/pages/institute/packages/InstitutePackageLessonView.tsx`, adapted from `PackageLessonComposer.tsx`, that:
  - Detects whether the lesson is SuperAdmin-authored (shared) or institute-created.
  - Renders the read-only base + institute additions, with back nav to `/institute/packages/:packageId`.

### 2. Point the institute package detail at the new route
- In `InstitutePackageDetail.tsx`, change `lessonHrefBuilder` from `/superadmin/packages/...` to `/institute/packages/${pkg.id}/lesson/${lessonId}`.
- "Add lesson plan" (institute creating its own) also points to the institute `.../lesson/new` route.

### 3. Institute additions store (local layer)
- New `src/data/institute/institutePackageLessonAdditions.ts`: keyed by `${instituteId}::${packageId}::${lessonId}`, holds the institute's extra blocks (content/quiz). Mirrors the existing override-store pattern; SuperAdmin master in `packages/helpers.ts` stays untouched.
- The view composes the displayed block list = `master blocks (locked)` + `institute additions (editable)`, then applies the existing block-order override from `institutePackageOrders.ts`.

### 4. Read-only-aware block UI
- Pass a per-block "locked" flag so `WorkspaceBlock` hides the delete control for master blocks while keeping it for institute additions. Add the small "Shared / Added by your institute" tag.

### 5. Docs
- Update `docs/02-institute/packages.md` and `docs/05-cross-login-flows/package-flow.md` to describe the use-don't-delete model and the new lesson route.

## Out of scope
- Editing the text/content *inside* a SuperAdmin-authored block (they add new blocks instead of mutating originals).
- Persisting beyond the in-memory mock stores (consistent with the current package mock layer).
- Teacher/student surfacing of institute additions.

## Technical notes
- `InstitutePackageLessonView` reuses `WorkspaceCanvas`, `PackageWorkspaceToolbar`, `ChapterContentSheet`, `QuizDialog` (same as the SuperAdmin composer) so the add-content/add-quiz flows are identical.
- "Locked" handling: extend `WorkspaceBlock`/`WorkspaceCanvas` with an optional `lockedBlockIds: Set<string>` (or a `locked` flag on the block view-model) to suppress delete; default behavior unchanged for the SuperAdmin composer.
- `CURRENT_INSTITUTE_ID = "inst-1"` constant reused from the package detail page.
