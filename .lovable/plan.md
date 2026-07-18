## Goal
Remove the public landing/homepage. Make the Login page the root entry, with a secondary "Register a team" link/icon below the sign-in form.

## Changes

1. **Routing (`src/routes/RitxRoutes.tsx`)**
   - Change root `/` to render `Login` instead of `Landing`.
   - Remove/retire the `Landing` route entry (also drop `/login` duplication or make it an alias/redirect to `/`).
   - Keep `/register` route intact for team registration.

2. **Login page (`src/pages/ritx/Login.tsx`)**
   - Keep existing 3-role login (Team / Mentor–Judge / Admin) and warm styling.
   - Below the sign-in card, add a subtle secondary CTA: small icon + "Register a team" link that routes to `/register`.
   - Remove any "Back to home" links pointing to the old landing.

3. **Landing cleanup**
   - Leave `src/pages/ritx/Landing.tsx` file in place but unreferenced (safe to delete later). No other pages import it.
   - Remove landing links from `RitxShell` header/footer if any point to `/`-as-landing.

## Out of scope
- No changes to Register flow, Team Home workspace hero, Admin/Judge portals, or design tokens.
- No backend work.
