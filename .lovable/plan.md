## Goal
Pin the "Organised by ICORG / Powered by theDonutAI" footer strip to the bottom of the viewport on every page (including Login and Register), and increase logo sizes for clear visibility.

## Changes

1. **`src/components/ritx/shared/AppFooter.tsx`**
   - Change from flow-layout footer to `fixed bottom-0 left-0 right-0 z-40` sticky strip with solid background, top border, and subtle shadow.
   - Increase logo heights (ICORG and theDonutAI) from current small size to ~28–32px so they read clearly.
   - Slightly increase strip padding to accommodate larger logos.

2. **Global bottom padding** so page content doesn't hide behind the sticky strip:
   - `src/components/ritx/shared/RitxShell.tsx` — add `pb-16` (or matching strip height) to the main content wrapper.
   - `src/pages/ritx/staff/Layout.tsx` — same bottom padding on its main wrapper.
   - `src/pages/ritx/Login.tsx` and `src/pages/ritx/team/Register.tsx` — add bottom padding to their outer containers so the sponsor strip / cards aren't overlapped.

3. **No changes** to `OrganiserHeaderStrip` or `SponsorStrip` — only the footer becomes sticky.

## Out of scope
- No changes to routing, data, or business logic.
- Header strip stays non-sticky (scrolls with page) unless you want that too.
