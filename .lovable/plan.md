## Problem

Right now the paywall leaks in two places:

1. `PaywallGate` in `src/components/ritx/shared/PaywallGate.tsx` has an early bailout:
   ```ts
   if (!ws || !user) return <>{children}</>; // don't gate if data isn't loaded yet
   ```
   So a logged-in student **without a workspace** (i.e. hasn't paid to create one) opens `/team/submissions` and sees the full submissions page, not the paywall.

2. The submissions page then lets them click into a stage form because `SubmissionStage` doesn't gate at all — only the index page wraps in `PaywallGate`.

3. There's no single source of truth for "this user has paid". Payment state lives in two disconnected places: `workspace.paidAt` (post-creation) and `prepaidUserIds` Set (pre-creation). The Submissions page only checks the workspace flag.

## Fix (UI-only, no backend)

### 1. Unify "has this user paid" in `src/data/ritx/workspaceState.ts`
Add a small helper:
```ts
export function hasUserPaid(user: RitxUser | null, ws: Workspace | null): boolean {
  if (pricing.mode === "free") return true;
  if (!user) return false;
  if (ws?.paidAt) return true;          // paid inside a workspace
  return hasPrepaidCredit(user.id);      // paid before creating one
}
```
No behaviour change to existing `isUnlocked` — just a new user-level check.

### 2. Rewrite `PaywallGate` to gate on the user, not just the workspace
- Remove the `if (!ws || !user) return children` bailout.
- Show the paywall when `!hasUserPaid(user, ws)`.
- Two copy variants:
  - **No workspace yet** → "Complete the ₹499 team fee to create your workspace and start your submission." Button opens `PayDialog` in `pre-create` mode; on success, redirect the user to `/team` so they can create/join the workspace.
  - **Workspace exists, unpaid** → current copy, `workspace-unlock` mode (unchanged).
- After payment succeeds in either mode, the gate re-renders and shows the real children (submissions list, etc.).

### 3. Gate the stage editor too
Wrap the whole `SubmissionStage.tsx` render in `<PaywallGate feature="submission">` so deep-linking to `/team/submissions/progress` can't bypass the paywall either.

### 4. Team Home already handles the create/join flow; no change needed there — `WorkspaceOnboardingHero` already triggers `PayDialog` in `pre-create` mode before letting them create a workspace. The fix above makes Submissions consistent with it.

### Result
- No payment, no workspace → Home shows Create/Join with pay-first dialog; Submissions shows the paywall (not the form).
- Pay on Home → prepaid credit granted → Submissions unlocks immediately (via `hasPrepaidCredit`), and creating the workspace consumes the credit and marks it paid.
- Pay on Submissions → same prepaid credit path → user can go back to Home and create the workspace without paying again.
- Pay inside an existing workspace → `workspace.paidAt` set → both stay unlocked.

## Files touched
- `src/data/ritx/workspaceState.ts` — add `hasUserPaid` helper.
- `src/components/ritx/shared/PaywallGate.tsx` — gate on user, add pre-create variant, drop the early bailout.
- `src/pages/ritx/team/SubmissionStage.tsx` — wrap render in `PaywallGate`.

No backend, no data-model changes, no other pages touched.
