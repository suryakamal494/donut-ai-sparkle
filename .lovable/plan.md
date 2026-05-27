## Goal

Upgrade the **AI Generate** tab inside the existing **Add Quiz Block** popup (`src/components/teacher/lesson-workspace/QuizDialog.tsx`) so the entire flow — configure → generate → review → delete/regenerate → add to lesson — happens inside the same single dialog, without navigating away. Curriculum / class / chapter / subject already come from the lesson context, so we don't ask for them again.

## Single-popup, 3-step internal flow

The popup keeps the existing two top-tabs (Question Bank | AI Generate). Inside the AI Generate tab we switch between three internal "steps" (no extra dialogs / no route changes):

```text
[1 Configure] ──Generate──▶ [2 Generating…] ──▶ [3 Review]
       ▲                                              │
       └────── "Start over" ◀── "Regenerate all" ─────┘
```

### Step 1 — Configure (dynamic inputs)

Context chip at the top (read-only, from props): `Subject • Chapter`.

Inputs:
1. **Topics** — multi-select chips. Source: distinct `topic` values from `mockQuestions` filtered by current `chapter` (fallback: free-text "Add topic" input that pushes into the chip list). At least one topic required.
2. **Difficulty mix** — three counters (Easy / Medium / Hard) that sum to total. Default: balanced. Editing one rebalances the others; total stays in sync with the slider.
3. **Cognitive types** — multi-select chips from `CognitiveType` (`logical`, `analytical`, `conceptual`, `numerical`, `application`, `memory`). At least one required.
4. **Question type** — single select (reuse existing `QuestionType` list, default `mcq_single`).
5. **Number of questions** — `Slider` (shadcn) from 1–20, default 5, with a numeric badge that updates live. Replaces the current 4 fixed buttons (3/5/10/15).
6. **Specific requirements (prompt)** — `Textarea`, optional, placeholder: *"e.g. Focus on real-world application problems, avoid formula recall…"*.

Primary CTA: **Generate N questions** (disabled until topics ≥ 1 and cognitive types ≥ 1).

### Step 2 — Generating

Inline loader inside the same panel with a friendly status line ("Drafting N questions on {topics}…"). No dialog change. Simulated 1.2–1.8s delay (mock).

### Step 3 — Review (inside same popup)

Header row: `N questions generated` · small **Edit settings** link (goes back to Step 1 with values preserved).

For each generated question render a compact card (reuse the existing `QuestionItem` visual language) with:
- Checkbox (selected by default — only checked ones get added).
- Type badge, difficulty badge, cognitive-type badge, topic.
- Question text + options preview.
- Per-card action row: **Regenerate this** (spinner replaces card while mocked), **Delete**.

Bulk actions row at top of list: **Regenerate all**, **Deselect all / Select all**.

Sticky footer:
- Secondary: **Start over** (clears generated, returns to Step 1).
- Primary: **Add {selectedCount} to Quiz** (disabled if 0). On click, creates one quiz block with `source: 'ai'`, `aiGenerated: true`, `questions: selectedIds`, `duration: count * 2`, `content: prompt summary`, and closes the dialog (same exit path as today).

## Mock data behaviour

No backend wiring (mock only). Add a helper `generateMockAiQuestions(config)` in a new file `src/data/aiQuestionMock.ts` that:
- Picks `count` questions from `mockQuestions` matching chapter + topics + difficulty + type when possible.
- Falls back to cloning + lightly mutating IDs (`ai-q-<nanoid>`) to reach `count` deterministically.
- Tags each with the requested cognitive type (round-robins through selected ones).
- `regenerateOne(question)` returns a replacement using the same rules.

State is component-local — refreshing the page resets it (matches the rest of the mocked UI).

## Files

- **Edit** `src/components/teacher/lesson-workspace/QuizDialog.tsx`
  - Replace AI tab body with the 3-step flow.
  - Add internal state: `aiStep: 'configure' | 'generating' | 'review'`, `aiConfig`, `aiResults: Question[]`, `aiSelected: Set<string>`, per-card `regeneratingId`.
  - Reuse existing `QuestionItem` for the review list; add a thin wrapper that adds Regenerate/Delete buttons.
  - Keep Question Bank tab untouched.
- **Add** `src/data/aiQuestionMock.ts` — `generateMockAiQuestions`, `regenerateMockQuestion`, types for `AiGenerationConfig`.
- **No** route, no backend, no other files touched.

## Technical notes

- Reuse shadcn `Slider`, `Badge`, `Checkbox`, `Textarea`, `ScrollArea` — already in the project.
- Topics chip list: `Array.from(new Set(mockQuestions.filter(q => q.chapter === chapter).map(q => q.topic)))`; if empty, allow free-text only.
- Difficulty rebalance: editing one input clamps to `[0, total]`, distributes remainder to the other two proportionally; if all 0, default the slider value into Medium.
- Cognitive type chips driven from the existing `CognitiveType` union (hard-coded list of 6).
- Mobile (`useIsMobile`): same flow inside the existing `Drawer`. The configure form is already vertical, review list reuses `ScrollArea` with `h-[45vh]`.
- Accessibility: each step section gets a heading; primary CTAs keep `gradient-button` and `gap-2` styling consistent with current dialog.

## Out of scope

- Real AI calls (still mocked, matching the rest of the prototype).
- Persisting AI configs across sessions.
- Editing question text inline in the review step (only delete + regenerate, as requested).
- Changes to the Question Bank tab.
