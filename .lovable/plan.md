
# RiTX — Judging & submissions review overhaul (v2)

## What I'm changing my mind on

- **Dataset size:** 36 teams (12 per track) is enough to prove pagination, filters, and score aggregation without bloating the bundle. Pagination still ships (page size 10) so behaviour at scale is visible.
- **Layout:** rather than a rigid 3-pane split, I'll use a **two-pane workspace with a resizable divider** (`react-resizable-panels` is already in shadcn stack). Judges on smaller laptops can shrink the viewer; on tablets it collapses to tabs. Cleaner than a hard-coded 360px sidebar.
- **Scoring input:** drop sliders entirely. A **segmented 0–10 chip row** (11 tiny buttons) reads faster than a slider + number stepper and is much more compact. Keyboard `0–9` shortcuts jump between values.
- **Admin viewing:** no separate "Judging" page. I'll fold judge-progress columns into the existing **Submissions** table (that's the natural home) and reuse a single side-drawer viewer. One less place for admins to hunt.

---

## 1. Mock data (`src/data/ritx/`)

Deterministic seeded generator (mulberry32) — matches the project's stable-mock rule.

- **36 teams** across 3 tracks, codes `RITX-2026-0001…0036`, varied schools/cities/states, 2–4 members.
- **8 judges** (extend `staffData`) with 2 judges/team assignment matrix.
- **Submission answers** per team keyed by field id from `defaultFields(trackId)`:
  - Text/number/select answers generated from theme-appropriate snippets.
  - `file` fields → `{ url, name, mime }` pointing at a public sample PDF (`https://www.orimi.com/pdf-test.pdf`) or `/placeholder.svg`.
  - `video-url` fields → cycled YouTube IDs (a few TED-Ed shorts).
- **Assignment records** carry `criterionScores` and `comment` when `status === "scored"` so revise/view works.
- Stage mix: ~55% submitted/locked, ~25% in-progress, ~15% not-started, ~5% returned.

Files touched:
- `mockData.ts` — generator replaces the 3 hand-written teams (keeps `t1/t2/t3` as the first three IDs to avoid breaking existing pages).
- `submissionData.ts` — add `answers` on `TeamSubmissionRecord`, add generator.
- `rubricData.ts` — add `criterionScores`, `comment`, generator, helpers `assignmentsForJudge(id)`, `assignmentsForTeam(id)`, `judgeStatusForTeam(teamId)`.
- `staffData.ts` — expand to 8 judges.

## 2. Shared submission viewer

`src/components/ritx/judging/SubmissionViewer.tsx`

- Props: `teamId`, `mode: "judge" | "admin"`.
- Internal `Tabs`: **Overview · Form · Evidence** (Evidence merges documents + video — one place for "the stuff to grade").
  - Overview: team code, track, sub-theme, submission stage, submitted date, judge roster (names hidden in judge mode).
  - Form: `<dl>` of `label → answer` from `answers`, grouped, with helper text under each answer.
  - Evidence: renders each `file`/`video-url` field inline in order:
    - PDF → `<iframe src="…#toolbar=0&navpanes=0" class="w-full h-[65vh]">`
    - Image → `<img>` with `max-h-[60vh]`
    - Video → YouTube `<iframe>` or `<video controls>` for direct URLs
  - No download buttons anywhere.
- Own scroll container (`overflow-y-auto`) so the outer scoring pane never moves.

## 3. Judge queue — table (`AssignedList.tsx`)

- Replace card grid with `Table`:
  - Columns: `Team code · Track · Sub-theme · Submission stage · Your status · Your score · Action`.
  - Action label switches Start / Continue / View · revise; single route `/ritx/staff/judge/:teamId`.
- Filters: search (code), track select, status select.
- `DataTablePagination` (new shared component) — page size 10, shows "Showing 1–10 of 36".
- Header chips: assigned · scored · in-progress · pending.
- Blind-mode banner stays.

## 4. Judge scoresheet — resizable workspace (`ScoreSheet.tsx`)

Layout:

```text
┌────────────────────────────────────────────────────────────┐
│ ← Back · RITX-2026-0007 · Innovator · Blind mode           │
├──────────────────────────────────┬─────────────────────────┤
│ Overview | Form | Evidence       │  SCORING  (sticky)      │
│  ────────────────────────────    │  Weighted 7.4/10  4/5   │
│                                  │  ▓▓▓▓▓▓▓▓░░              │
│  (inline PDF, video, answers)    │                         │
│  scrolls independently           │  Scientific rigor 30%   │
│                                  │  0 1 2 3 4 5 6 7●8 9 10 │
│                                  │  Originality      20%   │
│                                  │  0 1 2 3 4 5●6 7 8 9 10 │
│                                  │  …                      │
│                                  │  Private note [textarea]│
│                                  │  [ Submit score ]       │
└──────────────────────────────────┴─────────────────────────┘
```

- `ResizablePanelGroup direction="horizontal"` with left default 62% (min 40%) and right 38% (min 320px).
- Right panel: `sticky top-0 h-[calc(100vh-var(--header))] overflow-y-auto` so it stays fixed while the viewer scrolls.
- **Compact chip scorer** per criterion — 11 buttons (`0`–`10`) in a single row, selected chip filled with primary. `~48px` row height total (label + chips). No sliders.
- Pre-fills `scores` and `comment` from the assignment when revisiting.
- Weighted total, progress, submit stay; submit disabled until every criterion scored.
- **Mobile / narrow (`<lg`):** panels collapse; a bottom `Sheet` triggered by a floating "Score submission" button holds the scoring form.

## 5. Admin — fold judging into Submissions

Instead of a new page, extend `admin/Submissions.tsx`:

- Add columns: `Judges (2/2 scored)`, `Avg score`, `Review`.
- Row `Review` button opens `SubmissionViewer` in a right-side `Sheet` (`w-[min(1000px,95vw)]`), admin mode. The sheet also renders a **read-only scoring recap** on the right: per-judge column, per-criterion rows, plus each judge's private comment (visible to admin only).
- Admin sees identities everywhere; judge names shown in the recap.
- Add pagination (page size 10).
- Filter chip: `Judging: awaiting | partial | complete | conflict` (derived from assignments).

`JudgeAssignments.tsx` stays for the matrix setup but gains:
- Sticky first column, sticky header (for 36×8 grid usability).
- Same `DataTablePagination` for the judge coverage list below.

## 6. Permissions

- `SubmissionViewer` never renders editable score inputs.
- Admin sheet displays "Scores are locked — only assigned judges can edit." banner.
- Judge sheet has no admin recap tab.

## 7. Pagination helper

`src/components/ritx/shared/DataTablePagination.tsx` — thin wrapper over shadcn `Pagination` with page-size select (10/25/50). Reused by Registrations, Submissions, Results leaderboard, judge queue.

---

## Technical notes

- No new deps — `react-resizable-panels` and all shadcn primitives already present.
- Deterministic PRNG (`mulberry32`) keeps mock stable across renders (project memory rule).
- PDF preview via `<iframe src="…#toolbar=0">`; video via YouTube `<iframe>` for URLs matching `youtube.com|youtu.be`, otherwise `<video controls>`.
- Existing routes unchanged for `staff/judge` and `staff/judge/:teamId`; no new admin route.

## Files

**New**
- `src/components/ritx/judging/SubmissionViewer.tsx`
- `src/components/ritx/judging/ScoringPanel.tsx` (chip scorer + submit, reused by desktop pane and mobile sheet)
- `src/components/ritx/judging/AdminScoreRecap.tsx`
- `src/components/ritx/shared/DataTablePagination.tsx`

**Edited**
- `src/data/ritx/mockData.ts`, `submissionData.ts`, `rubricData.ts`, `staffData.ts`
- `src/pages/ritx/staff/judge/AssignedList.tsx` — table + pagination
- `src/pages/ritx/staff/judge/ScoreSheet.tsx` — resizable 2-pane workspace
- `src/pages/ritx/admin/Submissions.tsx` — judging columns + review sheet + pagination
- `src/pages/ritx/admin/JudgeAssignments.tsx` — sticky headers + pagination
- `src/pages/ritx/admin/Registrations.tsx`, `Results.tsx` — pagination only

Approve to build.
