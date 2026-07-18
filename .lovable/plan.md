## Goals

1. Replace the wall of orange progress bars on the Admin Dashboard "Judging progress" card with a calmer, information-dense UI.
2. Rework Judge Assignments so judges are assigned to **themes (tracks / sub-themes)**, not to individual teams. Team-level judge lists are then derived from the theme mapping.

Everything stays UI-only (mock data). No backend.

---

## 1. Judging progress card — visual redesign

File: `src/pages/ritx/admin/Dashboard.tsx` (extract into `src/components/ritx/admin/JudgingProgressCard.tsx`).

New layout inside the same card:

- **Header row** — title + "41/72 scored across 7 judges" (kept).
- **Summary strip** (replaces the big orange bar): 4 compact stat pills
  - Fully scored teams · Partially scored · Not started · Avg. turnaround
  - Neutral surface, single small colored dot per pill (emerald / amber / slate / primary) — no long bars.
- **Progress by theme** (new primary view, since assignments become theme-wise):
  - One row per track / sub-theme with: theme name, `scored / total` count, and a **segmented mini-meter** (e.g. 10 small squares) filled emerald for scored, amber for in-progress, muted for pending. Much lower visual weight than a full-width orange bar.
- **Team drill-down** (collapsed by default, "Show teams" toggle):
  - Compact table: Team code · Theme · Judges done (e.g. `2/2` chip, colored only when complete/late) · Status dot.
  - No per-row progress bars. Rows use zebra striping + one status dot; orange is used only as an accent for "at risk / late", not as the default fill.
- Palette shift: default state uses neutral slate/stone; primary orange reserved for the single hero metric and CTA. Emerald = done, amber = in progress, rose = overdue.

Result: same information, ~1/3 the orange, scannable at a glance.

## 2. Judge assignments — theme-wise instead of team-wise

### Data model (`src/data/ritx/rubricData.ts`)

- Add `ThemeAssignment { id, trackId, subTheme?, judgeIds: string[] }`.
- Keep existing `JudgeAssignment` type but stop seeding it directly. Derive per-team assignments from theme assignments:
  ```
  assignmentsForTeam(teamId) =
    themeAssignments matching team.trackId (+ subTheme if set)
      .flatMap(judgeIds)
      .map(judgeId => existing scored record if any, else { status: "pending" })
  ```
- Seed `mockThemeAssignments` for the 3 tracks × their sub-themes with 2–3 judges each.
- Persist mock score/comment state in a keyed map `{teamId+judgeId → {score, criterionScores, comment, status}}` so existing scoring mock data still surfaces through the derived lookup.

### Admin page (`src/pages/ritx/admin/JudgeAssignments.tsx`) — full rewrite

Replace the team × judge matrix with a **theme-centric** view:

- Left column: list of themes (Track → Sub-theme tree, collapsible).
- Right column: for the selected theme
  - Assigned judges as chips with remove (×).
  - "Add judge" combobox listing staff with `judgeAccess`.
  - Small stats: `# teams in this theme`, `# scored / total judge-team pairs`.
- Bulk action: "Copy judges from…" another theme.
- Remove all team-row UI, remove per-team judge pickers.

### Downstream consumers (no behavior change, just consume derived data)

- `AdminScoreRecap.tsx`, `SubmissionViewer.tsx`, staff `AssignedList.tsx`, `ScoreSheet.tsx`, dashboard stats, `resultsData.ts` — all already call `assignmentsForTeam(teamId)` / iterate `mockAssignments`. Update them to use the new derived helpers:
  - `assignmentsForTeam(teamId)` — keep signature, new implementation.
  - `allAssignments()` — replaces direct `mockAssignments` imports (used by dashboard + results).
- Staff "Assigned to me" list becomes: teams whose theme includes the current judge.

### Copy changes

- "Judge assignments" page subtitle → "Assign judges to themes. Every team in a theme is automatically reviewed by its assigned judges."
- Dashboard card: "Judging progress" stays; add small caption "Judges are assigned by theme."

---

## Out of scope

- No changes to rubric weights, scoring UI, or results math.
- No backend / persistence work.
- No changes to team registration or submission flows.

## Technical notes (for devs)

- Derivation must stay pure and memoized where used in tables to avoid re-computing per row.
- Keep `JudgeAssignment` type exported so existing components compile unchanged.
- New card component keeps the same outer `<Card>` padding so dashboard grid spacing is unaffected.
