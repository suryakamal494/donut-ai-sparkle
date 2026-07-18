## What you're asking for

Right now the student can freely create a workspace on the Team Home, and payment (₹499) is only demanded later when they open Submissions — that's the lock screen in your screenshot. You want to flip that:

- On the Team Home, the hero with **Create workspace** and **Join with invite code** stays fully visible — nothing hidden or greyed out.
- **Join with invite code** stays free (joiners don't pay; the lead already did).
- **Create workspace** button is visible, but clicking it opens the **Pay ₹499** dialog first. Only after the mock payment succeeds does the "Name your team workspace" dialog appear and the workspace actually gets created.
- The existing submissions paywall stays in place too, as a safety net (and for teams seeded as unpaid in the demo data).

Payment stays a one-time, whole-team fee, paid by the lead — same amount, same PayDialog UI, just moved earlier in the flow.

## Implementation plan (UI only, no backend)

### 1. `src/components/ritx/team/WorkspaceOnboardingHero.tsx`
- Add a `PayDialog`-based gate around the create flow:
  - Clicking **Create workspace** no longer opens the "Name your team" dialog directly.
  - If `pricing.mode === "paid"` and the current user has no paid workspace yet, open a **payment-first** dialog explaining "Team registration fee ₹499 — required before creating a workspace."
  - On successful mock pay, immediately open the existing "Name your team workspace" dialog.
  - If `pricing.mode === "free"`, skip payment and open the name dialog as today.
- Add a small helper line under the Create card: "One-time ₹499 team fee is charged before the workspace is created." Keep the Join card unchanged with a subtle "Free for invited teammates" hint.

### 2. `src/data/ritx/workspaceState.ts`
- Add a lightweight **prepaid credit** concept so payment can happen before the workspace exists:
  - `hasPrepaidCredit(userId)` / `consumePrepaidCredit(userId)` / `grantPrepaidCredit(userId)` backed by an in-memory `Set<string>`.
  - Update `createWorkspace(name, leadUserId)`:
    - If `pricing.mode === "paid"` and no prepaid credit, throw a clear error ("Payment required before creating a workspace").
    - If prepaid credit exists, consume it and mark the new workspace `paidAt = now`, `paidBy = leadUserId`.
- No changes to `payForWorkspace` (still used by the existing submissions paywall for teams that were seeded unpaid).

### 3. `src/components/ritx/shared/PayDialog.tsx`
- Add an optional `mode: "workspace-unlock" | "pre-create"` prop (default keeps current behavior).
  - `pre-create` variant: title "Pay to create your workspace", removes the `workspace` prop requirement, calls `grantPrepaidCredit(user.id)` on success, and fires `onPaid()`.
  - `workspace-unlock` variant: unchanged (used by `PaywallGate` on Submissions/Results).

### 4. Team Home / other entry points
- No layout changes — the hero already renders when the user has no workspace. It will now show the same two cards, and the Create path routes through payment first.

### 5. Leave existing paywall intact
- `PaywallGate` on `/team/submissions` and `/team/results` stays as-is for the seeded unpaid demo workspace (`Curious Cosmos`) so you can still demo the "pay to unlock submissions" flow.

## Out of scope
- Admin `Payment` settings page, judge/admin portals, and rubric/scoring code are untouched.
- No real gateway integration — still mock-only, matching the "frontend only" constraint.

## Files touched
- `src/components/ritx/team/WorkspaceOnboardingHero.tsx` (flow change)
- `src/components/ritx/shared/PayDialog.tsx` (add `pre-create` mode)
- `src/data/ritx/workspaceState.ts` (prepaid credit helpers + guard in `createWorkspace`)
