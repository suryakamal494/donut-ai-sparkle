## Goal
Verify the RiTX module works end-to-end after the recent path/route refactor — no build errors, all portals reachable, no runtime errors.

## Verification steps

1. **Build check** — run `bunx tsgo --noEmit` and confirm zero errors (already clean after the last fix, re-verify).
2. **Dev-server logs** — read `/tmp/sandbox-state.db` daemon logs for Vite HMR errors or failed transforms.
3. **Playwright smoke test** (headless Chromium against `http://localhost:8080`):
   - `/` → RiTX Landing renders with CTAs
   - `/login` → login page
   - `/team/register` → team registration form
   - `/admin` → admin dashboard + sidebar nav
   - `/admin/registrations`, `/admin/submissions`, `/admin/rubrics`, `/admin/judge-assignments`, `/admin/results` → each loads without error
   - `/team` → team home; `/team/submissions`, `/team/results`
   - `/staff` → staff home; `/staff/judge` → assigned list; click a team → `/staff/judge/:teamId` scoresheet loads
   - Capture a screenshot per route, tail console for errors.
4. **Report** — one concise summary: what works, any broken route with the failing selector/error, and the exact fix scope if something is off.

No code changes in this pass — pure verification. If something breaks, I'll return with a targeted fix plan.
