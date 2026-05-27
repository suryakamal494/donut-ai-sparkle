
## Audit findings (current dialog)

**Layout bugs (the worst pain in the screenshot)**
1. Dialog is `h-[85vh]` but the inner panel doesn't fill it — the footer sits mid-dialog and below it is a huge empty white area. Root cause: `TabsContent` from Radix is `display: block` by default and ignores `flex-1`; the `flex flex-col` only works after forcing `data-[state=active]:flex`. Same issue squashes the question list to ~1 row visible.
2. The question list ScrollArea has no min height — on short laptops (672px) it collapses to a strip; users see a half-row of cards behind the footer.
3. Header eats too much vertical space (title + subtitle + tabs + search + 2 filters + optional selection bar) leaving little for the list itself.

**Question Bank tab — UX issues**
- Two `Select` dropdowns for Type + Difficulty are slow; better as compact chip filters that fit one row.
- No "Select all visible" / "Clear filters" affordance.
- Cards repeat `subject › chapter` on every row even though context is fixed.
- Selection state is invisible once you scroll — no persistent selected count/preview.
- Footer CTA is full-width gradient even when disabled (looks like a "blocked" peach blob, as in the screenshot).

**AI Generate tab — UX issues**
- Configure step stacks 6 tall sections (topics popover + custom input + cognitive pills + question type + slider + difficulty mix + free-text prompt) before the Generate button — easy to miss; also caused the earlier "no button visible" bug.
- Topics has two inputs (popover + custom text + chips) that overlap in purpose.
- Difficulty mix numeric inputs fight the slider; rebalancing is jumpy.
- Question type dropdown exposes 9 formats; most quizzes use MCQ — should default and tuck the rest behind "More".
- Review step puts Regenerate + Delete on every card, doubling vertical noise.

**Cross-cutting**
- No quiz title or duration controls — auto-generated from count, can't edit.
- No way to mix Bank + AI questions into one quiz.
- Mobile drawer reuses dense desktop chrome; chips/buttons under 32px.
- File is 951 lines in one component — hard to maintain.

## Proposed fix (single-pane refinement, no redesign)

### A. Layout, once and for all
- Force active `TabsContent` to behave as a flex column: add `data-[state=active]:flex flex-col flex-1 min-h-0` and `data-[state=inactive]:hidden`.
- Give the dialog a deterministic 3-row grid inside: `Header (auto) / Body (1fr, min-h-0) / Footer (auto)`. Body owns its own scroll; footer is always pinned and visible.
- Drop `h-[85vh]` in favour of `h-[min(85vh,720px)]` so very tall screens don't create empty void, and short laptops still get a usable list.
- Mobile drawer mirrors the same 3-row grid at `h-[88vh]`.

### B. Compact header (both tabs)
- Merge title + dynamic subtitle into a single line: `Add Quiz · 12 in bank` / `Add Quiz · AI`.
- Replace 2 Select filters with a single chip row: `[All] [Easy] [Medium] [Hard]` + a small `Type ▾` popover trigger.
- Move search into the same row on ≥sm screens (icon + input grows). On mobile it stacks.

### C. Question Bank tab
- Sticky "selection bar" at the top of the list area: `N selected · Select all visible · Clear` — visible whether you've scrolled or not.
- Cards: drop the `subject › chapter` line (context is already fixed); keep ID, difficulty chip, type icon, 2-line text, options preview. Tighter padding (`p-2.5`), 44px min touch.
- Empty state and "loading more" placeholder.
- Footer button: ghost while 0 selected, gradient only when ≥1.

### D. AI Generate tab
- Collapse Configure into 2 visible groups + 1 "Advanced" disclosure:
  - **Visible**: Topics (single combobox with multi-select + free-add inline), Count (chips 3/5/10/15 + slider for custom).
  - **Visible**: Difficulty mix as a single segmented control showing `E / M / H` proportions (drag handles between segments) — no fighting numeric inputs.
  - **Advanced (collapsed)**: Cognitive types, Question type, Custom prompt.
- Sticky Generate button at the bottom — never scrolls away (the layout fix above guarantees this).
- Review step: one global action bar (`Regenerate all · Delete unselected · Keep N`) and per-card actions move into an overflow `⋯` menu so cards stay scannable.

### E. New: quiz meta + cross-source mix
- A small "Your quiz" summary strip above the footer showing `Title (editable) · N questions · ~Xm`. Title prefilled, duration auto but editable.
- A single internal selection set keyed by question id, so users can pick from Bank and from AI in the same session and add them together.

### F. File split (maintainability)
- Extract from `QuizDialog.tsx` into a folder:
  - `QuizDialog.tsx` (shell + layout + meta strip + footer)
  - `bank/QuestionBankPanel.tsx`
  - `bank/QuestionRow.tsx`
  - `ai/AiConfigurePanel.tsx`
  - `ai/AiReviewPanel.tsx`
  - `useQuizSelection.ts` (shared selection state)

## Technical details

- Tabs root: `className="flex flex-col flex-1 min-h-0"` (kept from last fix).
- TabsContent: `className="data-[state=active]:flex data-[state=inactive]:hidden flex-col flex-1 min-h-0 mt-0"` — this is the core layout fix.
- DialogContent: `className="sm:max-w-[640px] h-[min(85vh,720px)] p-0 grid grid-rows-[auto,1fr,auto] overflow-hidden"`. Body slot is `min-h-0 overflow-hidden flex flex-col` so the inner ScrollArea actually bounds.
- Mobile: `DrawerContent` uses the same 3-row grid; `max-h-[88vh]`.
- Chip filter row uses `ToggleGroup` (shadcn) for accessible single-select on difficulty.
- Difficulty segmented control: simple 3-segment div with drag handles using existing `useDrag` patterns or two range inputs styled as a stacked bar (no new deps).
- Advanced disclosure uses shadcn `Collapsible`.
- Selection state lifted into `useQuizSelection` returning `{selected, toggle, addMany, clear, count, items}` so Bank and AI share one source of truth.
- Sticky meta strip is part of the footer row (`grid-rows`) so it's never hidden by the scroll.

## Out of scope
- No backend changes (still mock data from `mockQuestions` / `aiQuestionMock`).
- No new colors/tokens — uses existing semantic tokens.
- No drag-to-reorder selected questions (can be a follow-up).
- No real AI calls.

## Files

- **Edit** `src/components/teacher/lesson-workspace/QuizDialog.tsx` (slimmed shell)
- **Add** `src/components/teacher/lesson-workspace/quiz/QuestionBankPanel.tsx`
- **Add** `src/components/teacher/lesson-workspace/quiz/QuestionRow.tsx`
- **Add** `src/components/teacher/lesson-workspace/quiz/AiConfigurePanel.tsx`
- **Add** `src/components/teacher/lesson-workspace/quiz/AiReviewPanel.tsx`
- **Add** `src/components/teacher/lesson-workspace/quiz/useQuizSelection.ts`
- No changes to `PackageLessonComposer.tsx` props (`chapter`, `subject`, `chapterId` still passed).
