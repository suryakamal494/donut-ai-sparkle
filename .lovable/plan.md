# Plan — RiTX Handoff Map (single document for Claude)

Produce **one** Markdown file at the repo root:

```
RITX_UI_MAP.md
```

No code changes. No refactors. Read-only exploration of the RiTX tree, then write the doc.

## Document structure

1. **Overview** — What RiTX is (frontend-only UI over mock data), the 3 login roles, tech stack in one line, and how to read this document.
2. **Route tree (top-level map)** — ASCII tree of every route mounted in `src/routes/RitxRoutes.tsx`, grouped by role, showing URL → page file.
   ```text
   /
   ├── /                         Login.tsx
   ├── /team/register            team/Register.tsx
   ├── /admin/*                  admin/Layout.tsx (shell)
   │   ├── /admin                Dashboard.tsx
   │   ├── /admin/setup          CompetitionSetup.tsx
   │   └── …
   ├── /team/*                   team/Layout.tsx (shell)
   │   └── …
   └── /staff/*                  staff/Layout.tsx (shell)
       └── …
   ```
3. **Shared component catalog** — one row per component in `src/components/ritx/**` with: purpose, props summary, and which pages consume it. Covers `RitxShell`, `PayDialog`, `PaywallGate`, `DeadlineTimer`, `AccessBadge`, `ResourcePreviewDialog`, `DataTablePagination`, `WorkspaceOnboardingHero`, `JudgingProgressCard`, `ScoringPanel`, `SubmissionViewer`, `AdminScoreRecap`.
4. **Mock data stores** — one row per file in `src/data/ritx/**` (`mockData`, `submissionData`, `rubricData`, `resultsData`, `staffData`, `workspaceState`) with: what it holds, which pages read it, which pages write it (e.g. scores flow, workspace flow, payment flow).
5. **Per-page detail** — for every page file, a short block:
   - **Route** and **file path**
   - **Purpose** (plain English)
   - **Key UI blocks / components used**
   - **Data read from** / **data written to**
   - **Outgoing links** (which buttons/links go where — e.g. "Start → `/team/submissions/:stageId`")
   - **Gating rules** (paywall, stage window, role access, judge scope)
6. **End-to-end user flows** — click-by-click walkthroughs, one per role:
   - **Student/Team flow**: Login → Team Home → Create Workspace (PayDialog → name dialog) → Members & consent → Resources → Submissions list → Progress stage form → Final stage form → Results.
   - **Admin flow**: Login → Dashboard → Setup → Registrations → Staff → Submission forms → Rubrics → Judge assignments (theme + sub-theme scope) → Submissions (read-only recap) → Results → Announcements / Payment / WhatsApp.
   - **Staff flow**: Login → Overview → (Mentor: Resources / Sessions) and/or (Judge: Assigned list → ScoreSheet with SubmissionViewer + ScoringPanel).
7. **Cross-cutting rules** — one section listing the invariants: frontend-only (no backend), payment gates before workspace creation and before submissions, judge assignments are theme- or sub-theme-scoped (not team-wise), scoring uses 0.25-step sliders, admin cannot edit scores, "Blind" terminology removed.
8. **Where flows start and end** — quick index: entry point (`/` Login) and terminal screens (Results, Certificate preview, closed submission draft view).

## Method

- Read every file under `src/pages/ritx/**`, `src/components/ritx/**`, `src/data/ritx/**`, and `src/routes/RitxRoutes.tsx` to extract accurate routes, imports, `<Link>`/`navigate()` targets, and data reads/writes.
- Use only what the code actually shows — no invented functionality.
- Batch reads in parallel.

## Deliverable

A single `RITX_UI_MAP.md` (target ~800–1200 lines) at the repo root. No other files changed.
