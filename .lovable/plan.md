## Goal

Replace the current vertical accordion in the Package Editor with the master-detail layout you picked. The top Class chips and Subject tabs stay exactly as they are — only the area below changes.

## What changes

```text
┌────────────────────────────────────────────────────────────────┐
│  Back  ·  CBSE Comprehensive Foundation Pack   [Settings][Pub] │
├────────────────────────────────────────────────────────────────┤
│  [Class 6] [Class 7] [Class 11] [Class 12]                     │  ← unchanged
│  Mathematics  Physics  Chemistry  Biology  …                   │  ← unchanged
├────────────────────────────────────────────────────────────────┤
│  Summary strip: 14/20 Chapters · 84 Lessons · 42h · 18 Tests   │  ← NEW
├──────────────────┬─────────────────────────────────────────────┤
│ CHAPTER INDEX    │  CH-01 · Knowing Our Numbers                │
│ ┌──────────────┐ │  5 plans · 40 blocks · 1 chapter test       │
│ │1. Knowing…  ●│ │                       [+ Lesson] [+ Test]   │
│ │  ▓▓▓▓░ 65%   │ │  ┌─────────────────────────────────────┐    │
│ └──────────────┘ │  │ 01  Introduction & Hook             │    │
│ 2. Whole Nums    │  │     8 blocks · ~15 min  [Preview]▶  │    │
│ 3. Playing w/ N. │  ├─────────────────────────────────────┤    │
│ …                │  │ 02  Core Concepts                   │    │
│ ── Global ──     │  │     12 blocks · ~45 min             │    │
│ ◎ Grand Tests    │  └─────────────────────────────────────┘    │
│                  │  ┌── Chapter Test (indigo) ────────────┐    │
│                  │  │ Laws of Motion – Unit Test          │    │
│                  │  └─────────────────────────────────────┘    │
└──────────────────┴─────────────────────────────────────────────┘
```

### Left rail — Chapter Index
- One row per chapter: number + title, right-aligned counter (lessons/total or just lesson count), thin progress bar under the title showing population (lessons present ÷ expected lessons).
- Active chapter highlighted with the orange selection card from the mockup; empty chapters dimmed.
- Pinned section header "Global" with a single entry "Grand Tests" (icon + label) that swaps the right pane to the Grand Tests view.
- Scrolls independently; rail width ~300px on desktop, collapses to a top dropdown on mobile/tablet.

### Right pane — Chapter detail
- Header block: chapter tag + title + meta dots (plans, blocks, chapter test status) + actions (`Add lesson plan`, `Attach chapter test`).
- Lesson plan list: clean rows in a single card stack, numbered tile on the left, title + small "N blocks · ~Xm" line, hover reveals `Preview` + `Edit plan`. Clicking the row still navigates to the existing lesson composer route (no change there).
- Chapter test rendered as a distinct indigo dashed-border card under the lesson list (clearly different from lesson rows).
- Empty state when chapter has no lessons: single primary "Add the first lesson plan" CTA + secondary "Attach chapter test".

### Right pane — Grand Tests view
- Same right-pane shell, but the body lists Grand Tests as indigo cards and shows the `Attach grand test` action in the header. No "lesson plans" section here.

### Summary strip (above the split)
- Compact dark bar: `Chapters X/Y`, `Total lessons`, `Content volume` (sum of estimated minutes), `Tests`. Pure read-out from existing data — no new persistence.

## Technical plan

New components under `src/components/packages/editor/`:
- `PackageSummaryStrip.tsx` — reads the same chapter list + lessons/tests already loaded and shows the 4 stats.
- `ChapterRail.tsx` — replaces the vertical-list role of `ChapterAccordion`. Pure presentational + `selectedId`/`onSelect`. Includes the "Grand Tests" entry.
- `ChapterDetailPane.tsx` — header, lesson-plan list, chapter-test card, empty state. Reuses existing handlers from `PackageEditor.tsx` (add lesson plan, attach test, open composer).
- `GrandTestsPane.tsx` — extracted from the current bottom Grand Tests block in `PackageEditor.tsx`; opens `AttachTestSheet` in grand mode.

Edits:
- `src/pages/packages/PackageEditor.tsx`: stop rendering `ChapterAccordion` + bottom Grand Tests section. Add `selectedChapterId` state (default = first chapter) and a `view: "chapter" | "grand"` toggle driven by the rail. Layout becomes `grid grid-cols-[300px_1fr]` (md+) with a `Sheet`-based rail on small screens.
- `ChapterAccordion.tsx`: keep file for now but unused; can be deleted in a follow-up once the new layout is verified.
- Mobile/tablet (<768px): rail becomes a top "Chapter ▾" dropdown button that opens the same list in a Sheet. Right pane is full width. Summary strip wraps to 2×2.

No changes to: data layer (`@/data/packages`), routing, `AttachTestSheet`, `PackageSettingsSheet`, lesson composer page, sidebar, header, class chips, or subject tabs.

## Out of scope
- No new fields persisted (status badges, complexity dots, avatars, "last synced" shown in the mockup are decorative — we will show only what real data already supports: title, lesson count, block count, test count, estimated minutes if available; we will not invent statuses).
- No backend / schema changes.
- Other package routes (`/packages`, `/packages/new`, lesson composer) are untouched.
