# RiTX UI Map — Handoff Document

> A single, code-free tree map of the RiTX Young Innovators Challenge frontend.
> Read this end-to-end to know **every page**, **every shared component**, **every mock-data store**, **who links to what**, and **which rules gate each flow**. No backend exists — everything is React + Vite + Tailwind + shadcn on top of in-memory mock data.

---

## 0. Overview

- **Product:** RiTX Young Innovators Challenge — a 3-role competition platform (Admin / Team / Staff).
- **Scope:** UI only. All data is mock (`src/data/ritx/*`). No API, no auth, no persistence beyond a small `localStorage` shim in `workspaceState.ts`.
- **Tech:** React 18 · TypeScript · Vite · Tailwind · shadcn/ui · React Router v6. Router is mounted in `src/App.tsx` and delegates everything under `/*` to `src/routes/RitxRoutes.tsx`.
- **Entry:** `/` renders the **Login** page. There is no landing/marketing page.
- **Roles:**
  - **Admin** — organiser console at `/admin/*`
  - **Team (Student)** — team workspace at `/team/*`
  - **Staff (Mentor and/or Judge)** — combined portal at `/staff/*`, tabs visible per access flag
- **How to read this doc:**
  - §1 route tree · §2 shared components · §3 mock data stores · §4 per-page detail · §5 end-to-end flows · §6 invariants · §7 start/end index.

---

## 1. Route tree

```text
/                                             src/pages/ritx/Login.tsx
/login                                        -> redirect to /
/team/register                                src/pages/ritx/team/Register.tsx
/team/join                                    -> redirect to /team

/admin/*                                      src/pages/ritx/admin/Layout.tsx        (RitxShell wrapper)
├── /admin                                    admin/Dashboard.tsx
├── /admin/setup                              admin/CompetitionSetup.tsx
├── /admin/registrations                      admin/Registrations.tsx
├── /admin/staff                              admin/Staff.tsx
├── /admin/submission-forms                   admin/SubmissionForms.tsx
├── /admin/submissions                        admin/Submissions.tsx
├── /admin/rubrics                            admin/Rubrics.tsx
├── /admin/judge-assignments                  admin/JudgeAssignments.tsx
├── /admin/results                            admin/Results.tsx
├── /admin/announcements                      admin/Announcements.tsx
├── /admin/communications                     admin/Communications.tsx        (WhatsApp)
└── /admin/payment                            admin/Payment.tsx

/team/*                                       src/pages/ritx/team/Layout.tsx         (RitxShell wrapper)
├── /team                                     team/Home.tsx
├── /team/members                             team/Members.tsx
├── /team/resources                           team/Resources.tsx
├── /team/submissions                         team/Submission.tsx            (stage picker)
├── /team/submissions/:stageId                team/SubmissionStage.tsx       (:stageId = "progress" | "final")
└── /team/results                             team/Results.tsx

/staff/*                                      src/pages/ritx/staff/Layout.tsx        (custom shell, mentor/judge tabs)
├── /staff                                    staff/Home.tsx
├── /staff/mentor/resources                   staff/mentor/Resources.tsx     (if mentorAccess)
├── /staff/mentor/sessions                    staff/mentor/Sessions.tsx      (if mentorAccess)
├── /staff/judge                              staff/judge/AssignedList.tsx   (if judgeAccess)
└── /staff/judge/:teamId                      staff/judge/ScoreSheet.tsx

*                                             -> redirect to /
```

App wiring: `src/App.tsx` → `src/routes/RitxRoutes.tsx`. `src/main.tsx` mounts `<App/>`. `NotFound` exists but the catch-all inside RitxRoutes redirects to `/` first.

---

## 2. Shared component catalog

All under `src/components/ritx/`.

| Component | File | Purpose | Consumed by |
|---|---|---|---|
| `RitxShell` | `shared/RitxShell.tsx` | Sidebar + mobile top-bar layout. Takes `role`, `nav[]`. Sign-out → `/login`. | `admin/Layout.tsx`, `team/Layout.tsx` |
| `AccessBadge`, `ConsentBadge`, `TeamIdChip` | `shared/AccessBadge.tsx` | Status pills + team-code chip. | Team Home, Team Submission, Admin Registrations, Admin Submissions, Judge AssignedList, Admin Results |
| `DataTablePagination` | `shared/DataTablePagination.tsx` | Reusable pagination footer. | Admin Registrations, Admin Submissions, Judge AssignedList, Admin Results |
| `DeadlineTimer` | `shared/DeadlineTimer.tsx` | Live countdown chip. Reads `StageForm.deadlineAt`. | Team Submission, Team SubmissionStage, Admin SubmissionForms |
| `PayDialog` | `shared/PayDialog.tsx` | ₹499 payment modal. `mode="workspace-unlock"` OR `mode="pre-create"`. Calls `payForWorkspace()` / `grantPrepaidCredit()`. | Team Home (unlock nudge), WorkspaceOnboardingHero (pre-create), PaywallGate (blocked feature) |
| `PaywallGate` | `shared/PaywallGate.tsx` | Wraps a feature; shows paywall CTA + `PayDialog` when workspace is unpaid. `feature = "submission" \| "result"`. | Team Submission, Team SubmissionStage, Team Results |
| `ResourcePreviewDialog` | `shared/ResourcePreviewDialog.tsx` | Inline PDF/image/video preview modal (replaces plain download). | Team Resources, Staff Mentor Resources |
| `WorkspaceOnboardingHero` | `team/WorkspaceOnboardingHero.tsx` | "Create workspace" + "Join with invite code" hero shown when signed-in student has no workspace. Create opens `PayDialog` first, then name dialog. | Team Home (when `getCurrentWorkspace()` is null) |
| `JudgingProgressCard` | `admin/JudgingProgressCard.tsx` | Theme-level judging progress: stat pills + segmented mini-meters (replaced old orange-bar wall). | Admin Dashboard |
| `SubmissionViewer` | `judging/SubmissionViewer.tsx` | Left pane: renders team's form values + attachments grouped by evidence criterion with inline preview. `mode = "judge" \| "admin"`. | Judge ScoreSheet (left pane), Admin Submissions (side sheet) |
| `ScoringPanel` | `judging/ScoringPanel.tsx` | Sticky right pane: 0.25-step sliders per rubric criterion, live weighted total, notes, submit. Writes via `updateAssignment()`. `compact` for mobile sheet. | Judge ScoreSheet |
| `AdminScoreRecap` | `judging/AdminScoreRecap.tsx` | Read-only recap of all judges' scores. **Admins cannot edit scores.** | Admin Submissions (expanded row / side sheet) |

---

## 3. Mock-data stores (`src/data/ritx/`)

| Store | Holds | Read by | Written by |
|---|---|---|---|
| `mockData.ts` | `mockCompetition` (name, mode, dates, tracks[]+subThemes), `mockTeams[]`, `registrationStats`, `CLASS_OPTIONS`, `INDIAN_STATES` | Nearly every page | Admin CompetitionSetup (local state), Admin Registrations (filter), `updateTeamTrack()` helper |
| `workspaceState.ts` | Current user, `workspaces[]`, `pricing` (₹499), invite codes, membership, prepaid credits. Persists via `localStorage`. | Login, Team Home, Team Results, PaywallGate, PayDialog, WorkspaceOnboardingHero | Login (`loginOrRegister`), Team Home (track/member ops), WorkspaceOnboardingHero (`createWorkspace`, `joinByCode`), PayDialog (`payForWorkspace`, `grantPrepaidCredit`, `consumePrepaidCredit`) |
| `submissionData.ts` | `stageForms[]` (per-track `progress`+`final` with sections+fields+deadlines), `EVIDENCE_CATEGORIES` (6 criteria + weights), `GOI_MISSIONS`, `SDG_OPTIONS`, `mockTeamSubmissions[]`, helpers (`stageWindowStatus`, `getStageForm`, `extendDeadline`, `updateStageForm`) | Team Submission, Team SubmissionStage, Admin SubmissionForms, Admin Submissions, SubmissionViewer, DeadlineTimer | Admin SubmissionForms (`updateStageForm`, `extendDeadline`), Admin Submissions (stage change local state) |
| `rubricData.ts` | `initialRubrics[]` (per-track criteria + weights), `mockThemeAssignments` (theme- and sub-theme-scoped judge lists), `mockAssignments` (derived judge↔team rows), persistent score store, helpers (`judgeIdsForTrack`, `assignmentsForJudge`, `assignmentsForTeam`, `judgingSummaryForTeam`, `setScopeJudges`, `updateAssignment`) | Admin Dashboard (via JudgingProgressCard), Admin Submissions, Admin JudgeAssignments, Admin Rubrics, Judge AssignedList, Judge ScoreSheet (`ScoringPanel`, `SubmissionViewer`), Admin Results | Admin Rubrics (local state), Admin JudgeAssignments (`setScopeJudges`), **ScoringPanel (`updateAssignment` — sole score writer)** |
| `resultsData.ts` | `initialResults[]` (computed from scores), `awardLabel`, `awardTone`, `mockAnnouncements[]` | Admin Results, Team Results, Admin Announcements | Admin Results (award / publish local state), Admin Announcements (append) |
| `staffData.ts` | `mockStaff[]` (with `mentorAccess`/`judgeAccess` flags — `s3` "Anita" has both = demo user), `mockResources[]`, `mockSessions[]`, `mockWaTemplates[]`, `waWallet` | Staff Layout (nav visibility), Staff Home, Staff Mentor Resources & Sessions, Team Resources & Home, Admin Staff, Admin Submissions (judge names), Admin JudgeAssignments (judge list), Admin Communications | Admin Staff (invite/toggle), Mentor Resources (upload/delete), Mentor Sessions (schedule), Admin Communications (send counters) |

**Persistence:** only `workspaceState.ts` writes to `localStorage`. Everything else is React state that resets on refresh.

---

## 4. Per-page detail

Each block: **Route** · **File** · **Purpose** · **Components** · **Data** · **Outgoing links** · **Gates**.

### 4.1 Login  —  `/`  ·  `src/pages/ritx/Login.tsx`
- Role picker (Admin / Student / Mentor-Judge). Student form = name + email + class; others = email + password (presentational, no validation).
- Components: `DonutLogo`, `Card`, `Select`.
- Data: `CLASS_OPTIONS` (mockData); writes `loginOrRegister()` (workspaceState) for students.
- Outgoing: Admin → `/admin` · Student / "Continue as demo student" → `/team` · Mentor-Judge → `/staff` · "Register a team" → `/team/register`.
- Gates: none.

### 4.2 Team Register  —  `/team/register`  ·  `team/Register.tsx`
- 2-step wizard: team details → OTP verify (mock code `123456`).
- Data: `INDIAN_STATES`, `CLASS_OPTIONS`.
- Outgoing: OTP submit → `/team`. Track/theme chosen later on Team Home, not here.

### 4.3 Team Layout  —  `/team/*`  ·  `team/Layout.tsx`
- `RitxShell` nav: Home · Members & consent · Resources · Submissions · Results. Sign-out → `/login`.

### 4.4 Team Home  —  `/team`  ·  `team/Home.tsx`
- Two states:
  1. **No workspace** → hero + `WorkspaceOnboardingHero` (Create / Join). Create paywalled via `PayDialog` (`pre-create`).
  2. **Has workspace** → hero, payment nudge if unpaid, Members & invite card (copy code, lead can remove members), Track & theme selector, stat tiles, upcoming sessions list (`mockSessions`) with live countdown Join button.
- Components: `WorkspaceOnboardingHero`, `PayDialog`, `AccessBadge`, `TeamIdChip`.
- Data: `getCurrentUser`, `getCurrentWorkspace`, `getMembers`, `isLead`, `isUnlocked`, `pricing`, `updateWorkspaceTrack`, `removeMember`, `mockCompetition.tracks`, `mockSessions`.
- Gates: create workspace requires payment; track/theme editing locks after `mockCompetition.submissionDeadline`; member remove visible only to lead.

### 4.5 Team Members & Consent  —  `/team/members`  ·  `team/Members.tsx`
- Roster of `mockTeams[0].members`; add member, send/resend parent consent (mock), remove.
- Component: `ConsentBadge`. No paywall (roster is pre-submission work).

### 4.6 Team Resources  —  `/team/resources`  ·  `team/Resources.tsx`
- Search + track filter over `mockResources`. Card grid.
- **Preview button opens `ResourcePreviewDialog`** (inline PDF/image/video). Download kept as secondary.
- Data: `mockResources`, `mockCompetition.tracks`, `mockTeams[0]`.

### 4.7 Team Submissions (stage picker)  —  `/team/submissions`  ·  `team/Submission.tsx`
- Two cards — Progress and Final. Each shows `DeadlineTimer`, section count, completion %, Start/Continue/View button.
- Outgoing: card CTA → `/team/submissions/progress` or `/team/submissions/final`.
- Gates: wrapped in `PaywallGate feature="submission"`; Final disabled while Progress is open; both disabled before `openAt`, become "View draft" after deadline.

### 4.8 Team Submission Stage  —  `/team/submissions/:stageId`  ·  `team/SubmissionStage.tsx`
- Tabbed form (one tab per `FormSection`). Fields via `FieldRenderer`: short-text, long-text, number, url, select, multi-select, file, video-url with per-field validation.
- Sections may embed:
  - **Multi-attachment uploader (`AttachmentsBlock`)** — each entry tagged to one of the 6 `EVIDENCE_CATEGORIES` (Problem relevance 15% · Investigation & evidence 25% · Scientific reasoning 20% · Originality 15% · Feasibility & impact 15% · Policy/SDG/ethics 10%). Grouped-by-criterion view default.
  - **Pitch deck + demo URL (`DeckBlock`)**.
- Sticky top bar: back, stage label, track badge, `DeadlineTimer`, progress meter, Save draft, Submit.
- Outgoing: Back → `/team/submissions`.
- Gates: `PaywallGate feature="submission"`; window must be `open` AND `stage.editable === true` — otherwise all inputs locked.

### 4.9 Team Results  —  `/team/results`  ·  `team/Results.tsx`
- Rank card + per-member certificate previews + judge scores (anonymous).
- Wrapped in `PaywallGate feature="result"`.
- Data: `initialResults`, `awardLabel`, `awardTone`, `mockTeams`, `mockCompetition`, `getCurrentWorkspace`, `getMembers`.

### 4.10 Admin Layout  —  `/admin/*`  ·  `admin/Layout.tsx`
- `RitxShell` with 12 nav items (see §1).

### 4.11 Admin Dashboard  —  `/admin`  ·  `admin/Dashboard.tsx`
- 4 stat cards (`registrationStats`) + `JudgingProgressCard` + By-mode / By-track breakdown cards.

### 4.12 Admin Competition Setup  —  `/admin/setup`  ·  `admin/CompetitionSetup.tsx`
- Edit `mockCompetition`: name, mode (`free`/`paid`/`sponsored`/`invite`), fee, team-size limits, 4 key dates, tracks & sub-themes (add/remove chips). Save is a toast.

### 4.13 Admin Registrations  —  `/admin/registrations`  ·  `admin/Registrations.tsx`
- Search + track filter + paginated table of `mockTeams` (team code, name, school/city, track/sub-theme, member count, status via `AccessBadge`). Import/Export are toasts.

### 4.14 Admin Staff (Mentors & Judges)  —  `/admin/staff`  ·  `admin/Staff.tsx`
- Table of `mockStaff` with `mentorAccess`/`judgeAccess` toggle checkboxes. Invite dialog. These flags drive what the staff shell shows.

### 4.15 Admin Submission Forms (builder)  —  `/admin/submission-forms`  ·  `admin/SubmissionForms.tsx`
- Nested tabs: Track → Stage (`progress`/`final`) → Section. `FieldEditor` per field (label, type, helper, required, min/max, options).
- Live team preview on the right.
- Deadline strip: open/deadline display, `DeadlineTimer`, **Extend +1d / +3d / +7d** popover (`extendDeadline`), "Teams can edit" switch (`stage.editable`).
- Writes propagate instantly to team side.

### 4.16 Admin Submissions (Evalato-style)  —  `/admin/submissions`  ·  `admin/Submissions.tsx`
- Summary strip (Submitted / In progress / Not started / Returned).
- Chip filter bar: search + Stage + Track + Judging-status filters, Columns menu (toggle visibility, anonymise team names), Export.
- Table row per team: checkbox, avatar+name+school (or anonymised code), Track/Sub-theme, Stage pill + progress bar + version, judge avatar stack with status dot, avg score, spread (highlight ≥1.5). Row expands to `AdminScoreRecap` (read-only). Eye icon opens side sheet with `SubmissionViewer` + `AdminScoreRecap`.
- Bulk stage change via multi-select.
- Data: `mockTeamSubmissions`, `mockTeams`, `mockStaff`, `judgingSummaryForTeam`, `assignmentsForTeam`, `stageLabel`, `stageTone`.

### 4.17 Admin Rubrics  —  `/admin/rubrics`  ·  `admin/Rubrics.tsx`
- Per-track editor: criteria (label, description, max score, weight%). Weight-total badge. "Distribute evenly" and "Publish" (blocked until weights = 100%).

### 4.18 Admin Judge Assignments (theme-scoped)  —  `/admin/judge-assignments`  ·  `admin/JudgeAssignments.tsx`
- **Theme-based, not team-based.** Left: theme list with counts. Right:
  - **Whole theme scope** — judges here review every team in the track.
  - **Sub-theme scopes** — extra judges for specific sub-themes; team's effective judges = union of whole-theme ∪ its sub-theme scope.
  - Add-sub-theme-scope selector for unused sub-themes.
  - "Teams in this theme" panel grouped by sub-theme, showing team codes + effective judge count.
- Writes: `setScopeJudges`. Persistent scores survive re-assignment.

### 4.19 Admin Results  —  `/admin/results`  ·  `admin/Results.tsx`
- Summary tiles (teams ranked, outliers ≥1.5 spread, published count, Publish All).
- Three sub-tabs:
  1. **Leaderboard** — paginated; "Reveal identities" toggle; export CSV (toast).
  2. **Moderation** — outliers list with per-judge scores; request third judge / accept average (toast).
  3. **Awards** — `Select` per team → Gold/Silver/Bronze/Finalist.

### 4.20 Admin Announcements  —  `/admin/announcements`  ·  `admin/Announcements.tsx`
- Composer: title, audience (all-teams / winners / finalists / staff), channels (WhatsApp / Email / In-app), optional schedule. History list.

### 4.21 Admin Communications (WhatsApp)  —  `/admin/communications`  ·  `admin/Communications.tsx`
- Wallet stats, `mockWaTemplates` list, composer with audience + body + merge tags. Send test / Broadcast (toast).

### 4.22 Admin Payment Gateway  —  `/admin/payment`  ·  `admin/Payment.tsx`
- Fee toggle, amount, GST, provider radio (Razorpay/Stripe/Cashfree), scholarship waiver switch, API-credentials inputs (test mode).

### 4.23 Staff Layout  —  `/staff/*`  ·  `staff/Layout.tsx`
- Custom shell (not `RitxShell`). Nav filtered by `currentStaff.mentorAccess` / `judgeAccess`. When both true, shows Mentor + Judge role chips. Demo current staff = `s3` "Anita Kaur" (both flags).

### 4.24 Staff Home  —  `/staff`  ·  `staff/Home.tsx`
- 3 stat cards + action cards per access flag. Outgoing: `/staff/mentor/resources`, `/staff/mentor/sessions`, `/staff/judge`.

### 4.25 Staff Mentor Resources  —  `/staff/mentor/resources`  ·  `staff/mentor/Resources.tsx`
- Card grid of `mockResources`. Upload dialog appends a resource. Preview via `ResourcePreviewDialog`.

### 4.26 Staff Mentor Sessions  —  `/staff/mentor/sessions`  ·  `staff/mentor/Sessions.tsx`
- List of `mockSessions` + schedule dialog. These sessions surface on Team Home with countdown + Join button.

### 4.27 Staff Judge — Assigned List  —  `/staff/judge`  ·  `staff/judge/AssignedList.tsx`
- Stat pills (Assigned / Scored / In progress / Pending). Filter bar (team code search, track, status). Table from `assignmentsForJudge(CURRENT_JUDGE_ID)`.
- Outgoing: row action → `/staff/judge/:teamId`.

### 4.28 Staff Judge — Score Sheet (2-pane workspace)  —  `/staff/judge/:teamId`  ·  `staff/judge/ScoreSheet.tsx`
- Desktop: horizontal `ResizablePanelGroup` — left ~62% `SubmissionViewer`, right ~38% sticky `ScoringPanel`.
- Mobile/tablet: full-width `SubmissionViewer` + floating "Score submission" FAB → bottom `Sheet` with compact `ScoringPanel`.
- Scoring: 0.25-step sliders (6.25, 6.5, 6.75…) per criterion; live weighted total; notes; Submit → `updateAssignment()` → back to `/staff/judge`.

---

## 5. End-to-end flows

### 5.1 Student / Team

```text
/                  Login as Student   name+email+class -> loginOrRegister() -> /team
/team              (no workspace)     WorkspaceOnboardingHero
                                        |- Create workspace -> PayDialog (pre-create ₹499) -> name dialog -> createWorkspace()
                                        `- Join with invite code -> joinByCode()
/team              (has workspace)    pick track+sub-theme (updateWorkspaceTrack), copy invite code
/team/members                         add members, send parent consent
/team/resources                       search / filter / preview inline
/team/submissions  (PaywallGate)      pick Progress or Final
/team/submissions/progress            tabbed form, multi-category evidence, save draft / submit
/team/submissions/final               deck + demo URL + form (unlocks after Progress deadline)
/team/results      (PaywallGate)      rank + certificate previews + anonymous judge scores
```

### 5.2 Admin

```text
/                          Login as Admin -> /admin
/admin                     overview + JudgingProgressCard
/admin/setup               basics, dates, tracks & sub-themes
/admin/registrations       search/filter teams
/admin/staff               invite mentors/judges, toggle access
/admin/submission-forms    Track -> Stage -> Section builder + Extend deadline
/admin/rubrics             criteria + weights -> Publish
/admin/judge-assignments   assign judges at whole-theme and/or sub-theme scope
/admin/submissions         filter/anonymise/view; open row -> SubmissionViewer + AdminScoreRecap (read-only)
/admin/results             Leaderboard · Moderation · Awards -> Publish
/admin/announcements       compose per audience + channel
/admin/communications      WhatsApp templates + broadcast
/admin/payment             provider + fee + waivers
```

### 5.3 Staff (Mentor / Judge)

```text
/                                 Login as Mentor/Judge -> /staff
/staff                            stat cards + tools per access flag
  (mentorAccess) /staff/mentor/resources     upload/preview/delete
                 /staff/mentor/sessions      schedule webinars & office hours
  (judgeAccess)  /staff/judge                filter/search queue
                 /staff/judge/:teamId        SubmissionViewer + ScoringPanel (0.25 sliders) -> Submit -> back to queue
```

---

## 6. Cross-cutting rules & invariants

1. **Frontend only.** No backend, no API calls beyond in-memory helpers. Only `workspaceState.ts` persists (localStorage).
2. **Payment gates two things:**
   - Creating a workspace (₹499 via `PayDialog mode="pre-create"` inside `WorkspaceOnboardingHero`).
   - Accessing `/team/submissions*` and `/team/results` (`PaywallGate`).
   Resources, Members, and Home info remain open.
3. **Judge assignments are theme-scoped, never team-by-team.** A team's effective judges = whole-theme judges ∪ its sub-theme scope judges.
4. **Scoring is judge-only.** `ScoringPanel` (`updateAssignment`) is the sole writer to the score store. Admins see `AdminScoreRecap` — read-only.
5. **Score granularity:** 0.25-step sliders (never integer chips). Weighted total live.
6. **Stage windows** (`stageWindowStatus`): `upcoming` / `open` / `closed`. Final stage additionally disabled while Progress is `open`.
7. **Editing lock:** `stage.editable` (admin toggle) can freeze team edits even while the window is open.
8. **Evidence uploads:** multi-attachment; each tagged to one of the 6 selection-framework criteria with weights; grouped by criterion for the judge.
9. **"Blind" terminology removed** — sidebar simply says "Judging". Anonymisation is an optional column toggle on Admin Submissions and a "Reveal identities" toggle on Admin Results.
10. **Demo current users:** staff = `s3` Anita Kaur (both flags); team = `mockTeams[0]`; hard-coded `t2` (Neon Neurons) for Team Results.
11. **Sign-out** everywhere → `/login` (redirects to `/`).
12. **404s** never render — RiTX catch-all redirects to `/`.

---

## 7. Start / End index

- **Entry point:** `/` (Login).
- **Terminal screens:**
  - Team: `/team/results` (rank + certificate preview) — after payment.
  - Judge: `/staff/judge/:teamId` on Submit → returns to `/staff/judge`.
  - Admin: `/admin/results` → Publish → announcements fan out from `/admin/announcements`.
- **Stubs that only toast:** Import/Export on Registrations, CSV export on Results, WhatsApp broadcast, Announcement send, Payment gateway save, Certificate PDF download, session Join (opens external URL in a new tab).

---

*End of map. Every screen in the RiTX UI is accounted for above; if a component or route isn't listed here, it doesn't exist in the codebase yet.*
