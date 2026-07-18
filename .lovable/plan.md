## Goal
Stop blocking students at the Join/Create screen. After login, land them directly on the Team Home. If they aren't in a workspace yet, show the Create/Join panel as the hero section of that home — inside the normal shell, with nav visible — so they feel "inside the platform".

Frontend only. No backend, no schema, no auth changes. All state stays in the existing `workspaceState.ts` mock (localStorage + in-memory).

## Changes

1. **`src/routes/RitxRoutes.tsx`**
   - Remove the standalone `/team/join` route (or keep it as a redirect to `/team`) so login always lands on `/team`.
   - Ensure post-login redirect in `Login.tsx` goes to `/team` (not `/team/join`).

2. **`src/pages/ritx/team/Layout.tsx`**
   - Remove the current "redirect to /team/join if no workspace" guard. Always render the shell (sidebar + header) even without a workspace, so students see they're inside the platform.
   - Nav items that need a workspace (Submissions, Results, Members, Resources) stay visible but route to Home when clicked without a workspace — or show a subtle "join a team first" hint. Simplest: keep them clickable; each of those pages already reads `getCurrentWorkspace()` and can show an inline empty state.

3. **New: `src/components/ritx/team/WorkspaceOnboardingHero.tsx`**
   - Extract the Create/Join UI currently in `JoinOrCreate.tsx` into a reusable hero component (same two coral/teal cards, same dialog, same invite-code input, same `createWorkspace` / `joinByCode` calls).
   - No standalone page chrome — just the two cards + helper text, styled to sit inside the Team Home.

4. **`src/pages/ritx/team/Home.tsx`**
   - At the top, branch on `getCurrentWorkspace()`:
     - **No workspace:** render a warm welcome banner (`Hi {firstName} — let's get your team set up`) followed by `<WorkspaceOnboardingHero />`. Hide track/members/deadline cards that assume a workspace.
     - **Has workspace:** render today's existing Team Home (track picker, members, deadlines, edit history, etc.) unchanged.

5. **`src/pages/ritx/team/JoinOrCreate.tsx`**
   - Delete (or reduce to a thin re-export of the hero for backwards compat). Route removed in step 1.

6. **Empty-state polish on gated inner pages** (Submissions, Results, Members, Resources)
   - If `getCurrentWorkspace()` is null, render a small inline card: "Join or create a workspace to unlock this" with a button that scrolls/links back to `/team`. No new logic, just replaces the current implicit redirect.

## Out of scope
- No backend, no Supabase tables, no auth provider changes.
- Paywall behavior (`PaywallGate`) unchanged — still gates Submissions/Results once a workspace exists.
- Visual language (coral/teal, rounded-2xl, amber gradient) unchanged.

## Verification
Per your standing preference: ship without a verification pass.
