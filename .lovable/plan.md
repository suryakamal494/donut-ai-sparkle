
## Goal

Two additions to the RiTX UI, kept mock-only so the dev team wires the real backend later:

1. **Paid vs Free gating** — if the competition is paid, submissions and results stay locked until the team lead pays. If free, everything is open.
2. **Workspace model** — individual student logins that share one team Workspace. Lead creates it, invites 2–3 members with a short code they paste in. Submissions/resources/results are shared; certificates list every member; edits are attributed per user.

No change to the existing components (RitxShell, Team layout, Submission stage forms, Certificate, Resources) — we add small wrappers and one new dialog. This avoids any architectural rewrite.

## Feasibility summary

Everything below is UI + local mock state. The current app already treats "team" as the entity that owns submissions, so we just:
- Rename what a team is (a Workspace with N member users) in mock data.
- Add a `paid: boolean` flag on the competition + `workspace.paidAt` timestamp.
- Add a `PaywallGate` wrapper around the two screens that must lock (Submission, Result).
- Add an invite-code join screen.
- Add a lightweight "edited by" stamp on submission autosave.

No routing overhaul, no new auth system in the UI, no email/WhatsApp plumbing.

## Phase A — Paid vs Free gating

**Data (`src/data/ritx/mockData.ts`)**
- Add `competition.pricing: { mode: "free" | "paid"; amount: number; currency: "INR" }`.
- Add `workspace.paidAt: string | null` and `workspace.paidBy: userId | null`.
- Admin toggle in mock data so we can demo both modes.

**New component `PaywallGate.tsx`** (shared)
- Props: `children`, `feature: "submission" | "result"`.
- Reads `competition.pricing.mode` and `workspace.paidAt`.
- If `free` OR already paid → render children.
- Else → render a warm-styled lock card: "Payment required to start your submission" with amount, a **Pay ₹X and unlock** button (mock — flips `paidAt` and shows a success toast), and a "Only the team lead can pay" note for non-lead members (their button is disabled with tooltip).

**Where it wraps**
- `team/Submission.tsx` (stage picker) — gate the stage cards, keep header/brochure visible.
- `team/SubmissionStage.tsx` — safety net gate.
- `team/Result.tsx` — gate the result + certificate.
- **Not gated:** Home, Resources, Webinars, brochure/theme selector, Track & Theme card. These stay visible for free-tier browsing.

**Home page nudge**
- When paid mode + unpaid, add a coral banner above the Track & Theme card: "Complete payment to unlock submissions." Single CTA opens the same Pay dialog.

**Admin side**
- In `admin/Dashboard.tsx` add a small "Pricing" chip (Free / Paid ₹X) that opens a dialog to switch mode and set amount. Mock only.
- In `admin/Registrations.tsx` (or wherever teams list lives) add a `Payment` column: Paid ✓ / Pending / Free.

## Phase B — Workspace + individual logins

**Mental model**
- A **Workspace** = what today's mock calls a Team. Owns submission, track selection, payment, result.
- A **Member** = a user account (email + name + class). Belongs to at most one Workspace.
- **Roles inside workspace:** `lead` (creator, can pay + invite + remove) and `member` (can view/edit submissions).

**Data changes (`mockData.ts`)**
- Add `users: Array<{ id, name, email, class }>`.
- Change `team` → `workspace` with: `id, name, code (6-char), leadUserId, memberIds[], maxMembers: 4, paidAt, trackId, subTheme`.
- Add helper `getCurrentUser()` reading from localStorage (mock login).
- Add helper `getWorkspaceForUser(userId)`.
- Seed 2–3 sample workspaces so demos work.

**Login (`team/Login.tsx` — existing)**
- Change from "team login" to individual login: name + email + class (mock, no password). On submit stores the user in localStorage and routes to a **Post-login switchboard**.

**New page `team/JoinOrCreate.tsx`** (post-login switchboard)
- Two cards side by side:
  - **Create a workspace** → opens dialog: workspace name → creates workspace with this user as `lead`, generates a 6-char code, routes to Home.
  - **Join a workspace** → single input for the 6-char code. Paste + Enter joins immediately if: code is valid, workspace has <4 members, and user isn't already in another workspace. Errors surface inline.
- If the user is already in a workspace, this page auto-redirects to Home.

**Existing Home page updates**
- Replace the "Members" list mock with real workspace members from `workspace.memberIds`.
- Add a **Members & invite** card:
  - Lists members with role chips (Lead / Member) and "You" tag.
  - Shows the invite code in a large mono chip with a **Copy code** button.
  - Under it: "Share this code with up to 3 teammates. They sign up and paste it to join."
  - Lead-only: "Remove" icon on each member row (before submission deadline).
  - When full (4 members) the code chip switches to "Workspace full".

**Invite code UX (the "easiest way" per your answer)**
- 6 uppercase alphanumerics, no ambiguous chars (no 0/O/1/I). Generated at workspace creation.
- Copy button uses `navigator.clipboard`; toast confirms.
- Join input auto-uppercases and validates on paste.
- No email, no WhatsApp, no deep-link — pure paste-the-code.

**Guardrails (client-side mock checks)**
- One workspace per user: join button disabled with reason "You're already in workspace <name>".
- Max 4 members: 5th attempt shows "This workspace is full".
- Payment can only be initiated by the lead.
- After submission deadline the invite code is hidden and joining is blocked with "Registrations closed".

## Phase C — Shared work + attribution (small, no architectural pain)

**Shared** — no change needed, submission is already keyed by workspace/team id. All members read/write the same record.

**Attribution on submission autosave**
- Extend the existing autosave in `SubmissionStage.tsx` to append a lightweight entry to `workspace.editHistory[]`: `{ userId, userName, section, field, at }`.
- Add a small "Last edited by <Name> · 2m ago" line in the stage header.
- Add a collapsible **Edit history** panel (last 20 entries) at the bottom of the stage form. No diffing, no snapshots — just a log. This is what you asked for and it costs almost nothing.

**Certificates & result**
- `team/Result.tsx` and the certificate preview iterate `workspace.memberIds` and render one certificate card per member (same team score, individual name). Downloadable per-member is out of scope for this pass — just previewed.

## What we deliberately do NOT change (keeps architecture flat)

- No real auth, no Supabase, no RLS. All state stays in mock data + localStorage, as the rest of the RiTX UI already does.
- No payment provider integration. The Pay button just flips `paidAt`. Dev team wires Razorpay/Stripe later; the gate + button placement stay identical.
- No per-field locking or optimistic concurrency. Autosave + edit log is enough for the demo.
- Judge / Admin / Staff modules are untouched.

## Files touched (approximate)

- `src/data/ritx/mockData.ts` — pricing, workspace shape, users, invite code, editHistory helpers.
- `src/components/ritx/shared/PaywallGate.tsx` — **new**.
- `src/components/ritx/shared/PayDialog.tsx` — **new** (mock payment sheet).
- `src/pages/ritx/team/Login.tsx` — individual login fields.
- `src/pages/ritx/team/JoinOrCreate.tsx` — **new** switchboard.
- `src/pages/ritx/team/Home.tsx` — Members & invite card, pay-required banner.
- `src/pages/ritx/team/Submission.tsx` + `SubmissionStage.tsx` — wrap in `PaywallGate`, add "last edited by" + edit history panel.
- `src/pages/ritx/team/Result.tsx` — wrap in `PaywallGate`, render per-member certificates.
- `src/pages/ritx/admin/Dashboard.tsx` — Pricing chip + dialog.
- `src/pages/ritx/admin/Registrations.tsx` — Payment column.
- `src/routes/RitxRoutes.tsx` — add `/team/join` route for JoinOrCreate.

## Suggested build order

1. Data model + login/JoinOrCreate + Members & invite card on Home.
2. PaywallGate + PayDialog + Submission/Result wrappers + Home banner.
3. Admin pricing toggle + Registrations payment column.
4. Autosave attribution + edit history panel.

Each step is independently shippable; if you want to stop after step 1 you already have the workspace UX.
