# Refresh RiTX UI to match student-portal polish

## Why the current RiTX feels dull
Comparing screenshots 1–3 (student) vs 4 (RiTX Team):

1. **Cold surface color.** RiTX shell uses `bg-muted/30` (flat grey) as the app background. Student portal uses warm cream + soft gradients (`from-amber-50 via-orange-50/80 to-white`) which reads as premium and inviting.
2. **Sidebar is flat + grey.** Student sidebar is a full-height warm gradient with a glass profile card, gradient-filled active pill (`from-donut-coral to-donut-orange` + coral shadow), rounded-xl items, and a branded logo header. RiTX sidebar is white with a small purple square, thin text links, no profile card, no shadow, no gradient active state.
3. **Cards are outline-only.** RiTX cards use default shadcn `Card` (1px border, no shadow, sharp corners). Student cards use `rounded-2xl`, subtle shadow, soft tinted backgrounds, and colored left accents / gradient icon tiles.
4. **Icon tiles lack color system.** Student uses per-subject colored gradient squares (blue Math, teal Physics, purple Chemistry). RiTX uses uniform `bg-primary/10` circles — monotone.
5. **Typography hierarchy is thin.** Student pages open with a large greeting + supportive subtitle + a hero stat chip (streak). RiTX pages open with a small PageHeader and a chip row, no hero moment.
6. **Buttons/badges lack warmth.** RiTX "Join" button is flat coral; disabled state washes to pale pink with no visual grouping. Student CTAs are gradient (`from-donut-coral to-donut-orange`) with soft glow shadow.
7. **No ambient depth.** Student pages have subtle background patterns (SubjectBackgroundPattern SVG), gradient hero banner behind the subject title. RiTX has none — everything sits on flat grey.
8. **Spacing is dense.** RiTX uses `space-y-4` / `gap-3` and `p-4` cards. Student uses `space-y-5/6`, `p-5/6`, larger rounded-2xl — feels less cramped.

## What to change (scope: RiTX only, do not touch student/teacher/institute)

### 1. Shell + background
`src/components/ritx/shared/RitxShell.tsx`
- Replace `bg-muted/30` with warm gradient: `bg-gradient-to-b from-amber-50 via-orange-50/40 to-white`.
- Sidebar: switch to student-style warm gradient panel, add coral-tinted border + shadow, replace the fuchsia→indigo logo tile with the DonutLogo + "RiTX" wordmark using `gradient-text`, add a small role card (Team/Admin/Staff + team code chip) mirroring the student profile card.
- Active nav item: `bg-gradient-to-r from-donut-coral to-donut-orange text-white shadow-md shadow-donut-coral/30 rounded-xl`. Inactive: `hover:bg-white/70`.
- Mobile top bar: same warm treatment.

### 2. Card system
Introduce a shared `RitxCard` wrapper (or extend usage in place) that applies:
- `rounded-2xl border border-orange-100/60 bg-white shadow-sm shadow-orange-100/30`
- Hover: `hover:shadow-md hover:-translate-y-0.5 transition`
- Section headers get a small colored icon tile (`w-10 h-10 rounded-xl bg-gradient-to-br from-<track>-400 to-<track>-500`) using per-track colors (Science = teal/cyan, Innovator = amber/orange, Open Arena = violet/fuchsia, matching existing `roleColor`).

### 3. Team Home hero (screenshot 4)
`src/pages/ritx/team/Home.tsx`
- Replace PageHeader with a hero banner: gradient background (`from-orange-50 to-white`), large team name, team code + status chips, small illustrative pattern on the right (reuse `SubjectBackgroundPattern` style or a lightweight SVG).
- The three summary tiles (Track / Deadline / Members) become gradient-iconed cards with the new card system; deadline gets a countdown pill.
- Consent-pending banner: keep amber palette but upgrade to `rounded-2xl`, add soft amber glow shadow.
- Session cards: rounded-2xl, colored gradient icon tile per session type (mentor = coral, workshop = violet, office hours = teal), "Join" CTA becomes gradient coral→orange with glow.

### 4. Admin + Staff consoles
Apply the same shell/card/hero patterns to:
- `src/pages/ritx/admin/*` (Dashboard, Registrations, Submissions, Rubrics, JudgeAssignments, Results, Staff, Setup)
- `src/pages/ritx/staff/Home.tsx`, `staff/judge/AssignedList.tsx`, `staff/judge/ScoreSheet.tsx`
- Judging components (`AdminScoreRecap`, `ScoringPanel`, `SubmissionViewer`) — swap flat headers for warm tinted headers, keep functional layout intact.

### 5. Landing + Login
`src/pages/ritx/Landing.tsx`, `src/pages/ritx/Login.tsx`
- Keep the tri-role structure but re-skin: warm cream background instead of fuchsia/indigo/cyan wash; role cards get gradient icon tiles + rounded-2xl + hover lift; primary CTAs use donut-coral→orange gradient.

### 6. Design tokens (additive, no breaking changes)
`src/index.css` — add RiTX-specific accents so we don't hardcode:
- `--ritx-surface: warm cream gradient stops`
- `--ritx-card-border`, `--ritx-card-shadow`
- Track accent hues: `--ritx-science`, `--ritx-innovator`, `--ritx-open` (teal, amber, violet)
Wire these into `tailwind.config.ts` under a `ritx` namespace.

### 7. Preserved behavior
- All existing routes, data hooks, mock data, judging logic, and component APIs stay unchanged.
- Only presentation layer (className, wrappers, small hero blocks) is touched.
- No changes to student / teacher / institute / superadmin surfaces.

## Technical notes
- No new deps.
- Rollout order: shell → shared card/hero primitives → Team pages → Admin pages → Staff pages → Landing/Login. Each step is independently shippable and typechecks cleanly.
- Verification after each step: `bunx tsgo --noEmit` + Playwright screenshot of `/team`, `/admin`, `/staff` to confirm the warm treatment matches the student portal density and hierarchy.

## Out of scope
- Restructuring RiTX information architecture, nav items, or data models.
- Dark mode (student portal is light-only per project memory; RiTX will follow suit).
- Motion beyond the existing `animate-fade-in` + hover lift.
