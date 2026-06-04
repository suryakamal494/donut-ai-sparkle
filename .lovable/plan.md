## Goal

Stop the teacher Lesson Plans page from feeling crammed. Today ~5 stacked full-width bands (title+tagline, tabs, source pills, class row, subject row) eat the top 70% before any lesson content shows. We collapse the chrome so the **chapter index + lesson plans get ~70-80% of the height**.

## What changes (visual)

### 1. One unified top row (kill a whole band)
Merge the `Curriculum / My Plans` tabs and the separate source-pill row into a **single chip row**:

```text
[ CBSE ]  [ IIT-JEE Mains ]  [ My Plans ]
```

- Each source (curriculum/course) is a chip; "My Plans" is the last chip in the same row.
- Selecting CBSE or IIT-JEE shows that source's content; selecting "My Plans" shows the teacher's own plans.
- No more separate `Curriculum` vs source-pills double selection — one tap picks everything.
- The `Curriculum` label is renamed to `Course` where any label remains.
- Remove the `(CURRICULUM)` / `(COURSE)` suffix badges entirely — just `CBSE`, `IIT-JEE Mains`.

### 2. Slim the header
- Remove the tagline "Open the chapter you're teaching, present it on the board, or build your own."
- Shrink the "Lesson Plans" title into a compact inline header (smaller, less vertical padding). Breadcrumb stays minimal.

### 3. Two-row compact filter (only when a source is active)
Instead of class on its own band + subjects on another band, combine into a tight layout:

```text
Row A:  [ CBSE ] [ IIT-JEE Mains ] [ My Plans ]          (top chip row)
Row B:  Class [ Class 11 ▾ ]   |   Physics  Chemistry    (class dropdown + subject chips)
```

- Subject **chips stay** (good for navigation as the user wants), but sit inline next to the Class dropdown on the same row, horizontally scrollable when subjects are many — they wrap/scroll instead of taking a full band.
- This drops from ~3 filter bands to ~2 rows.

### 4. Give the panes the height back
- Container height changes from `h-[calc(100vh-15rem)]` to roughly `h-[calc(100vh-9rem)]` (exact value tuned after the header/filter shrink) so the chapter rail + lesson detail fill the majority of the viewport.
- Three-pane structure (chapter rail + detail) is kept — only the surrounding chrome shrinks.

### 5. Auto-collapse the left sidebar on this page
- When the route is `/teacher/lesson-plans*`, the teacher sidebar collapses to the narrow icon strip automatically, giving the panes more width.
- It remains manually re-openable via the existing toggle; leaving the page restores normal behavior.

## Technical notes

- **`src/pages/teacher/TeacherLessonPlans.tsx`**: replace the `Tabs` + source-pill block with a single chip row that drives both `tab` (`library` | `mine`) and `activeSourceId`. Selecting a source sets `tab="library"` + that source; "My Plans" sets `tab="mine"`. Remove the tagline from `PageHeader` (or swap to a compact custom header). Restructure the filter band into the two-row layout; bump the container height. Subject chips reuse `SubjectTabs` made horizontally scrollable.
- **`src/components/packages/editor/SubjectTabs.tsx`**: switch wrap to a single scrollable row (`overflow-x-auto no-scrollbar`) so many subjects/classes don't add height.
- **`src/components/layout/TeacherLayout.tsx`**: add a `useLocation` effect that sets `sidebarCollapsed` true when on `/teacher/lesson-plans`, without breaking the existing resize-based auto-collapse or the manual toggle.
- Mobile path (chapter sheet, bottom-nav padding) is preserved; the chip row scrolls horizontally on small screens.
- No data-layer or business-logic changes — purely layout/presentation.

## Out of scope
- Lesson composer / presentation viewer internals.
- Institute/SuperAdmin package views (shared components touched only in backward-compatible ways).
