
# RiTX Young Innovators Challenge — UI Build Plan
UI-only, mock data, composed from existing donut components. New `/ritx/*` module, zero impact on the four existing portals.

## Corrections applied from your feedback

1. **3 login types only:** Admin, Team (shared by team members), Staff.
   - "Staff" is one login row created by Admin with two toggles: **Mentor access** and **Judge access**. Enable one, the other, or both.
   - On login, the Staff shell shows Mentor tools, Judge tools, or both tabs depending on flags.
2. **Rubric builder ≠ question builder.** Rubric is a per-submission scoring sheet: 6 fixed criteria (editable label + weight in Admin setup), judge enters a mark per criterion, weighted total auto-computed and shown against Team ID. No stepper/wizard.
3. **Admin judging dashboard** shows per-team rubric aggregation (each judge's marks side-by-side + consolidated total), per-judge progress bars, per-stage pending counts. Multi-judge automatically pivots the table to N columns.

## Roles & login model

| Login | Who creates | Sees |
|---|---|---|
| Admin | Seeded | Everything |
| Team | Self-registers (or admin bulk-imports) | Their team only |
| Staff (Mentor and/or Judge) | Admin invites, ticks access flags | Mentor panel and/or Judge blind panel based on flags |

Single `/ritx/login` screen. Role determined by the account, not chosen at login. Staff with both flags gets a top-tab switcher inside the shell.

## Reuse map (what already exists → what we compose)

Every screen composes from `src/components/ui/*`, `src/components/shared/*`, and portal patterns already in the repo. New RiTX files are thin.

| RiTX need | Reused | New (thin) |
|---|---|---|
| Login shell | `pages/Login.tsx` styling, `Input`, `Button` | Route + mock auth |
| Public landing | `pages/Landing.tsx` pattern, `stats-card` | RiTX content |
| Admin layout | Institute sidebar (`SidebarProvider`, collapsible), `PageHeader` | `RitxAdminLayout` |
| Staff layout | `StudentLayout` shell + tabs when dual role | `RitxStaffLayout` |
| Team layout | `StudentLayout` shell | `RitxTeamLayout` |
| Admin dashboards | `stats-card`, `chart.tsx` (Recharts), `virtualized-table` | Data wiring |
| Registrations table + Excel export | `virtualized-table`, `lib/exportReport.ts` | Column config |
| Bulk import | Institute `pages/institute/students/` bulk import UI | Point at RiTX schema |
| Competition config | Institute MasterData/Parameters forms, `Form`, `Select`, `Switch`, `Calendar` | Composition |
| Access Status badges | `ui/status-badge.tsx` | 5 variants |
| Team registration wizard | Institute `AddStudent` multi-step pattern, `input-otp` for email verify | Field list per spec §8 |
| Members + consent tracker | `responsive-dialog`, `checkbox`, `status-badge`, `input-otp` (parent OTP mock) | `ConsentTracker` |
| Resources (theme-wise) | `student/subjects/*` card grid, `student/content-viewer/*` | Data swap |
| Team calendar | `ui/calendar` + `StudentWeekNavigator` + `TimetableDayCard` | Webinar cell variant |
| Webinar create | `CreateAssessmentDialog` shape | `WebinarDialog` (title, mentor, URL, time) |
| Join-link countdown | Existing badge patterns | Countdown util |
| Submission form-builder (admin) | `Form` + drag-order pattern from `institute/exams-new` step components | `FieldRow` primitives |
| Team submission form | `student/tests/*` player state, `useTestSessionPersistence` reference for edit-lock | Lock indicator |
| Blind judge submission view | `student/ContentViewer` layout, identity stripped | `TeamIdChip` component |
| **Rubric scoring sheet (Judge)** | `ui/input`, `ui/slider`, `ui/textarea`, `Card` | `RubricSheet` — 6 rows, weighted total auto-calc |
| **Rubric aggregation (Admin)** | `ui/table`, `virtualized-table`, `PermissionSection` layout, `chart` | `RubricMatrix` — pivots N judges |
| Judge assignment (1/2/3) | `roles/ScopeSelector`, `AssignBatchesDialog` pattern | `JudgeAssignmentMatrix` |
| Publish results | `AlertDialog` + institute reports publish patterns | Wire mock |
| Mentor resources upload | `content` library components | Trim to upload + list |
| WhatsApp notification screens | `useWhatsAppWallet`, `institute/communications/*` | Direct reuse |
| Toasts, skeletons, errors | `sonner`, `page-skeleton`, `lazy-error-boundary` | Direct reuse |

## Rubric — exact spec

- **Admin setup (one time):** 6 criteria rows with label + weight (%). Total weight must equal 100. Default labels from spec §7 Phase 3: Problem relevance, Investigation & evidence, Scientific reasoning, Originality, Feasibility & impact, Policy/SDG/ethics/communication.
- **Judge scoring sheet (per submission):** table of 6 rows, each with a 0–10 numeric input (or slider), optional comment. Weighted total = Σ(score × weight/10) auto-shown at bottom. Decision radio (select / reject / review) + overall comment. Save = draft, Submit = final.
- **Admin rubric matrix (per team):**

  ```text
  Team ID  Criterion       J1   J2   J3   Avg
  R-0421   Problem rel.    8    7    9    8.0
  R-0421   Investigation   7    6    8    7.0
  ...
  R-0421   Weighted Total  76   72   81   76.3
  ```

  When Admin sets 1/2/3 judges per submission, columns auto-adjust. Row highlight if judge variance > threshold (e.g. >2 pts) to flag review.
- **Admin judging progress:** stats cards (Assigned / Reviewed / Pending / Completed) + per-judge progress bars (`Progress` component) + per-stage pending count.

## Module structure

```text
src/pages/ritx/
├── Landing.tsx
├── Login.tsx
├── admin/
│   ├── Dashboard.tsx           registration + submission + judging stats
│   ├── CompetitionSetup.tsx    mode, fee, tracks, sub-themes, dates
│   ├── Registrations.tsx       table + bulk import + export
│   ├── Staff.tsx               invite Mentor/Judge accounts w/ access flags
│   ├── SubmissionFormBuilder.tsx
│   ├── Submissions.tsx         tracking per stage
│   ├── RubricSetup.tsx         6 criteria + weights
│   ├── JudgeAssignment.tsx     1/2/3 judges per submission
│   ├── JudgingProgress.tsx     per-judge + per-team matrix
│   └── PublishResults.tsx
├── team/
│   ├── Register.tsx
│   ├── Home.tsx                calendar + upcoming
│   ├── Members.tsx             list + consent tracker
│   ├── Resources.tsx           theme-wise
│   ├── Submissions.tsx         progress + final stages
│   └── History.tsx             past submissions
└── staff/
    ├── Home.tsx                tabs when dual role
    ├── mentor/
    │   ├── Sessions.tsx
    │   └── Resources.tsx
    └── judge/
        ├── AssignedList.tsx    blind list
        └── ScoreSheet.tsx      rubric sheet per submission

src/components/ritx/
├── shared/                     TeamIdChip, RoleBadge, RitxHeader
├── admin/                      RubricMatrix, JudgeAssignmentMatrix, RegistrationsTable, StaffInviteDialog
├── team/                       RegistrationWizard, ConsentTracker, SubmissionForm
└── staff/                      RubricSheet, WebinarDialog, ResourceUploader, BlindSubmissionView

src/data/ritx/                  mock competition, teams, submissions, rubric, judges
src/routes/RitxRoutes.tsx       lazy-loaded, mounted at /ritx/*
```

Added as a 5th lazy module in `App.tsx` — no change to existing four.

## Phased delivery (5 phases, no UI compromise)

Each phase is a shippable slice. You preview and sign off before the next.

**Phase 0 — Foundation & Registration** (matches spec Phase 0)
- `/ritx` landing (public, no login): brief, 3 tracks, rules, FAQ, timeline
- `/ritx/login` + mock auth for 3 roles
- Admin layout, Team layout, Staff layout shells
- `admin/CompetitionSetup` — mode (Free/Paid/Sponsored/Invite), fee, team size, tracks, sub-themes with "Other", dates
- `admin/Registrations` — table, filters, bulk import, Excel export
- `admin/Dashboard` — Phase-0 stat cards only (registrations, schools, activation, mode split)
- `team/Register` — wizard with email OTP verification
- `team/Members` — add members + `ConsentTracker` (per-member parent OTP mock, signed-form upload fallback)
- `team/Home` — empty calendar placeholder using student timetable shell
- Access Status badges wired everywhere

**Phase 1 — Resources, Sessions, Staff, Notifications**
- `admin/Staff` — invite dialog with **Mentor** and **Judge** access checkboxes (this is the "single staff login" mechanism)
- `staff/Home` — top-tab switcher visible only when both flags set
- `staff/mentor/Resources` — upload theme-wise materials
- `staff/mentor/Sessions` — create webinar (title, mentor, URL, date/time)
- `team/Resources` — theme-wise cards (reuses subject grid)
- `team/Home` — populated calendar with countdown → Join button 10 min before
- WhatsApp notification composer + template list (UI only, reuses institute comms)
- Payment gateway config screen (UI only, reuses form patterns)

**Phase 2 — Submission Form Builder & Submissions**
- `admin/SubmissionFormBuilder` — drag-order field rows (short text, long text, single select, multi select, video URL with validator, file link). Two form variants (Challenges 1&2 vs Open Arena)
- `admin/Submissions` — per-team stage tracker (Progress / Final / Locked), search, filters
- `team/Submissions` — progress + final stages, autosave, edit-lock badge, submit button disabled until all consents confirmed
- `team/History` — read-only past submissions

**Phase 3 — Rubric, Judging, Publish** (the "no compromise" phase)
- `admin/RubricSetup` — 6 criteria rows with label + weight sliders, live weight-total validator
- `admin/JudgeAssignment` — matrix picking 1/2/3 judges per team, "assigned only vs all" toggle per judge, auto-balancer helper
- `staff/judge/AssignedList` — blind cards (TeamIdChip + title + theme only)
- `staff/judge/ScoreSheet` — 6-row rubric sheet with per-criterion input + comment, weighted total auto-calc, decision radio, draft/submit
- `admin/JudgingProgress` — per-judge progress bars + per-team **RubricMatrix** (auto-pivots to N judges, variance highlighting)
- `admin/PublishResults` — confirm dialog, publish flag, results become visible on team dashboard, judge comments flow back anonymised

**Phase 4 — Polish & Deferred**
- Certificate template preview (UI only)
- Advanced analytics tab (charts on registrations, submissions, judging distributions)
- Mobile refinement pass across all screens (320px audit)
- Empty states, loading skeletons, error boundaries everywhere

## UI quality guardrails

- Every table/filter matches existing donut density (padding, hover, sticky headers)
- All colors via existing tokens in `index.css` — no hardcoded hex
- Mobile-first: bottom nav on Team + Staff shells, sidebar on Admin
- Blind-view rule enforced by a `<BlindBoundary>` wrapper — any prop containing name/school/mobile is filtered in Judge routes
- `TeamIdChip` used everywhere a team is referenced in Judge/Public contexts
- Consent-complete precondition rendered as a persistent banner on team submission page until satisfied

## Out of scope (per your direction)

- No backend, no Supabase tables, no edge functions — all mock data in `src/data/ritx/`
- No changes to existing four portals or their components
- No net-new design system, no new primitive components

## Deliverable of Phase 0 (first checkpoint)

Login → Landing → Admin sets up competition → Team registers → adds members with parent consent → sees a team dashboard with empty calendar. Admin sees registrations table with bulk import + export. End-to-end clickable with mock data.

---

Ready to switch to build mode and start Phase 0 on your approval.
