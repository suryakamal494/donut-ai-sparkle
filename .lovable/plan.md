## What's wrong

### 1. The lag / "cursor not working" / can't select multiple items (the real bug)

The slowness is **not** the network or the backend — it's a broken DOM structure in the "Add content" panel (`ChapterContentSheet.tsx`).

Each content row in the library list is built as a `<button>` that **contains other buttons inside it**:
- a checkbox (which is itself a button), and
- a "Preview" button.

Nested buttons are invalid HTML. React detects this on every render and prints a `validateDOMNesting: <button> cannot appear as a descendant of <button>` warning (this exact error is in your console right now). The library renders ~15+ items, and every keystroke in search or every item you select re-renders the whole list, so React floods the console with warnings each time. That warning spam is what freezes the panel, makes the cursor feel dead, and makes selecting a second item take forever.

**Fix:** restructure each row so it's a normal container (`div`) with the checkbox and preview as proper siblings — no button inside a button. This removes the warning storm and the list becomes instantly responsive (typing, selecting multiple items, attaching). Same fix keeps the click-to-select and Preview behaviors identical, just with valid markup.

### 2. Remove the "Shared by Donut…" line

In the shared lesson view (`InstitutePackageLessonView.tsx`), delete the sentence:
> "Shared by Donut. You can add your own content & quizzes on top — the original stays intact and can't be deleted."

Keep the thin bar but show only the **Reset to original** button (when overrides exist). The "Shared" lock badge in the header stays.

### 3. Show the institute name instead of "Added by your institute"

The block badge currently reads "Added by your institute". Change it to the institute's name. There's no bound institute identity in the mock layer today, so I'll add a `CURRENT_INSTITUTE_NAME` constant next to the existing `CURRENT_INSTITUTE_ID = "inst-1"` and use it as the badge label (e.g. blocks added by the institute show that name). The "Shared" badge on master blocks is unchanged.

## Files touched

- `src/components/packages/editor/ChapterContentSheet.tsx` — replace the nested-button row markup with a valid `div`-based row (checkbox + preview as siblings); fixes the performance/responsiveness issue.
- `src/pages/institute/packages/InstitutePackageLessonView.tsx` — remove the "Shared by Donut…" sentence (keep Reset to original); add `CURRENT_INSTITUTE_NAME` and use it for the "Added by…" badge label.

## Out of scope / unchanged

- The read-only "use, don't delete" model, reorder, and reset logic stay exactly as they are.
- No backend/data changes; the content library mock generator is untouched.
- Heavy external preview iframes only load when you open Preview (already on-demand) — not part of the lag.
