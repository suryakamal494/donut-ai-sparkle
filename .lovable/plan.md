# Plan: Privacy-first registration + dashboard theme selection

## 1. Slim the registration form (`src/pages/ritx/team/Register.tsx`)

Remove all track/sub-theme fields from registration. Registration collects only what's needed to create the team account:

**Kept fields (single step):**
- Team name
- Team lead name
- School
- Class / grade (dropdown: 6-12)
- State (dropdown)
- City
- Team lead email (for OTP)

**Removed fields:** Track, Sub-theme, full address, anything beyond the above.

**Wizard:** collapse from 3 steps → 2 steps (Details → OTP verify). On success, land the user on `/team` with a banner: "Pick your track & theme to unlock resources and submissions."

## 2. Add track/theme selection to the Team dashboard

New card on `src/pages/ritx/team/Home.tsx`, placed above "Upcoming sessions":

**Track & Theme card** with three selectors:
- **Track** (main): Science Investigator · Innovator Challenge · Open Arena
- **Sub-theme / Challenge theme:** dependent list based on Track (from existing `mockCompetition.tracks[].subThemes`)
- **Save** button → toasts "Theme updated"

Current values from mockData:
- Science Investigator → Health & Wellbeing, Environment, Energy, Food & Agriculture, Other
- Innovator Challenge → Assistive Tech, Climate Tech, EdTech, Rural Solutions, Other
- Open Arena → SDG 3, SDG 4, SDG 7, SDG 11, SDG 13, Other

**Edit-lock rule:** selectors are enabled only while `now < competition.submissionDeadline`. After deadline the card renders read-only with a "Locked after submission deadline" chip. Uses existing `timeToDeadline`-style logic against `mockCompetition.submissionDeadline`.

**First-time state:** if track is unset, card shows a soft coral "Pick your track" prompt and the sidebar entries for Resources / Submissions show a "Select track first" tooltip on hover but remain visible.

If the actual RiTX brief you referenced has a richer theme/sub-theme list than the three currently in `mockData.ts`, share it and I'll swap the arrays in — the UI is data-driven, no component changes needed.

## 3. Data model tweaks (`src/data/ritx/mockData.ts`)

- `Team` already has `trackId` + `subTheme` — make them optional (`trackId?: string; subTheme?: string;`).
- Team `t1` (Curious Cosmos, the logged-in mock team) keeps its current track so existing screens still render populated; other teams unchanged.
- Add `updateTeamTrack(teamId, trackId, subTheme)` helper that mutates the module-level array (same pattern used for `stageForms`).

## 4. Downstream screens that read `team.trackId`

Verify they gracefully handle an unset track:
- `team/Resources.tsx` — if no track, show empty state "Pick a track to see resources"
- `team/Submission.tsx` / `SubmissionStage.tsx` — if no track, disable submission with same prompt
- Admin `Registrations.tsx` table — Track column shows "—" when unset

No changes needed in judge/admin flows beyond null-safe rendering.

## 5. Out of scope

- Submission form itself stays as the admin-configured staged form (that structure is set by the institute admin, not something the student fills at registration).
- No new DPDP/consent copy changes beyond keeping the existing consent banner — the privacy improvement here is *collecting less data*, which is the right primary control.

## Files touched

- `src/pages/ritx/team/Register.tsx` — rewrite as 2-step minimal form
- `src/pages/ritx/team/Home.tsx` — add Track & Theme card
- `src/data/ritx/mockData.ts` — optional trackId/subTheme + updater helper
- `src/pages/ritx/team/Resources.tsx`, `Submission.tsx`, `SubmissionStage.tsx` — null-safe empty states
- `src/pages/ritx/admin/Registrations.tsx` — render "—" for missing track
