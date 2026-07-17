
## 1. Drop the "Blind" wording in the staff/judge panel

Any judge-facing surface that currently says "Blind evaluation", "Blind queue", "Blind scoring" etc. becomes plain "Judging" / "Scoring". The judge continues to see the full submission — no data is hidden.

Files touched:
- `src/pages/ritx/staff/judge/AssignedList.tsx` — page title/description → "Judging queue".
- `src/pages/ritx/staff/judge/ScoreSheet.tsx` — top bar chip "Blind evaluation" → "Judging".
- `src/pages/ritx/staff/Layout.tsx` and `src/pages/ritx/staff/Home.tsx` — nav label / card copy.
- `src/components/ritx/judging/SubmissionViewer.tsx` — remove any "blind" banners/tooltips.
- `src/pages/ritx/admin/JudgeAssignments.tsx` — copy update (matrix still exists, just no "blind" adjective).

No route or component renames — only user-visible strings.

## 2. Fix "can't get into student panel from login"

Root cause (unconfirmed until reproduced but consistent with the code): `RitxLogin` requires **Name + Email + Class** for the Student role and silently no-ops on submit when any field is empty — so clicking Sign in appears to do nothing.

Fixes in `src/pages/ritx/Login.tsx`:
- Show inline validation + a toast when a required field is missing (so the failure is visible).
- Prefill sensible demo values when the form is empty and the user hits Continue (Name = "Demo Student", Email = `demo.student@ritx.test`, Class = 9) so the flow always reaches `/team/join` or `/team`.
- Add a small "Continue as demo student" quick-link under the Student form for one-click access.

After sign-in, keep the existing `getWorkspaceForUser` → `/team` vs `/team/join` routing untouched.

## 3. Fractional judging scores (6.25, 6.5, 7.25, …)

The current 0–10 chip strip in `src/components/ritx/judging/ScoringPanel.tsx` only allows integers. Replace it with a **0.25-step slider + numeric input** per criterion:

- Slider: min 0, max `criterion.maxScore` (10), step **0.25**, with tick marks at every whole number.
- A compact numeric input next to the slider accepts direct typing (0.00–10.00, snapped to 0.25).
- Selected value badge shows two-decimals when needed ("7.25", else "7").
- Weighted total keeps the existing formula — it already tolerates floats.

Storage stays a number in `criterionScores`; no data-model change.

Also update `AdminScoreRecap` and any read-only display to render `toFixed(2)` when the value isn't a whole number.

## 4. Redesign Admin "Submissions & judging" like the Evalato reference

Goal: turn the current dense table into a clean, filter-forward "Entries"-style list that stays scalable to hundreds of teams.

Changes to `src/pages/ritx/admin/Submissions.tsx`:

- **Top bar of chip filters** (like Set Status / Set Rounds / Set Tags):
  - Status chip (Submitted / In progress / Not started / Returned / Locked)
  - Track chip
  - Judging chip (Awaiting / Partial / Complete / Conflict)
  - Search box on the right
  - Bulk-select checkbox column with "Set status ▾ · Assign judges ▾" bulk actions
- **Table columns** (Evalato-style, comfortable row height, avatar-style team icon):
  - ☐ · Team (avatar chip + team name + `RITX-2026-xxxx` code muted)
  - Track / Sub-theme
  - Stage badge
  - Judges (compact "3/3 scored" with tiny avatars + status dot)
  - Avg score (large, tabular)
  - Score spread (min–max, flags outliers ≥ 1.5)
  - Actions (Review • ⋮)
- **Per-judge drill-down**: expanding a row (or the Review side-sheet) shows a small table of every judge who scored this team with their individual weighted score, spread from mean, submitted-on, and comment preview. Admin cannot edit — read-only as today.
- **Column visibility toggle** so admins can hide Team Name if they want a more anonymous view (addresses "name may not be necessary").
- Keep pagination + empty state; drop the four summary Cards into a single slim strip above the filter bar so the table gets more vertical space.

No changes to underlying data models (`mockTeamSubmissions`, `judgingSummaryForTeam`) — this is purely a presentation refactor.

## Out of scope

- No backend / persistence changes.
- No new routes.
- Judge scoring math and rubric weights unchanged.

## Technical notes

- Slider uses the existing `@/components/ui/slider` (Radix). Step `0.25`, with a paired `Input type="number" step="0.25" min="0" max="10"` that writes back into the same state.
- Snap helper: `Math.round(v * 4) / 4`.
- Avatars: derive initials + a stable colour from `team.teamCode` (deterministic hash) to match the Evalato look without needing images.
- Column visibility: local `useState<Record<col, boolean>>` + a small dropdown; no persistence needed for the UI pass.
