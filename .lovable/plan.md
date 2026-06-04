## Goal

Redesign the "My Plans" lesson-plan cards to be more compact and less bulky, per the user's selected "Compact footer" direction.

## What the user sees

- The card body stays clean: source pill (CBSE / IIT-JEE Mains), bold lesson title, "Class 11 · Physics" meta, and "Ch: <chapter>" with a teal accent label.
- The oversized "Open" and "Present" buttons are replaced with a **compact split footer**: two text+icon buttons sit side-by-side at the bottom of the card, separated by a subtle vertical divider, each with a light hover state. The footer uses less vertical space than the previous stacked button row.
- Cards are slightly more compact overall: tighter padding, smaller typography scale for metadata, and a bordered footer instead of a padded button row.

```text
┌──────────────────────────────┐
│ 🎓 CBSE                      │
│ Newton's Laws — Recap        │
│ Class 11 · Physics           │
│ Ch: Physical World           │
│──────────────────────────────│
│  ✎ Open    │  🖥 Present    │
└──────────────────────────────┘
```

## Implementation

### `src/pages/teacher/MyLessonPlansRollup.tsx` — rewrite the card grid

Replace the current card markup (the `grid` wrapper and each card's body + button row) with:

- **Card wrapper**: `rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow` (removes `p-4 flex flex-col gap-3`, adds `overflow-hidden` for the footer).
- **Card body**: `p-5 pb-4` containing the source pill, title, class·subject line, and "Ch:" line with a teal accent on the "Ch:" prefix.
- **Source pill**: Refined to `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border` with the same curriculum/course color classes.
- **Title**: `text-base font-bold text-foreground leading-tight mb-1`.
- **Meta**: `text-sm text-muted-foreground font-medium` for class·subject; `text-sm` for the chapter line.
- **Footer actions**: A `flex border-t border-border/40` row with two plain `<button>` elements (not Shadcn `Button`):
  - **Open**: `flex-1 flex items-center justify-center gap-2 py-3 px-4 text-muted-foreground hover:bg-muted border-r border-border/40 group text-sm font-semibold`. Icon is `PencilLine` with `group-hover:text-primary`.
  - **Present**: `flex-1 flex items-center justify-center gap-2 py-3 px-4 text-primary hover:bg-primary/5 group text-sm font-semibold`. Icon is `Presentation` in `text-primary`.

No changes to the filter bar, search, empty states, or data layer. The only code touched is the card rendering block inside the grid.

## Technical notes

- Uses existing project Tailwind tokens (`bg-card`, `text-primary`, `border-border/40`, `text-muted-foreground`, `text-accent`, etc.) plus one Tailwind standard utility (`text-teal-600`) for the small "Ch:" accent label.
- No new dependencies.
- `navigate()` calls remain unchanged; all routing intact.