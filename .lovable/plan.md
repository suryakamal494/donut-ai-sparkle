## RiTX Audit & Cleanup Plan

Typecheck already passes and no code imports legacy modules. The remaining work is residual cleanup, metadata, and a runtime smoke pass across every RiTX route to catch bugs the compiler can't see.

### 1. Delete non-RiTX residuals

These aren't imported anywhere but still ship with the repo (confusing when handed to the dev team):

- `docs/` — entire folder is legacy (superadmin/institute/teacher/student docs). Keep only a new `docs/ritx/README.md` stub pointing at RiTX.
- `remotion/` — wrong-answer video generator for the old question module.
- `supabase/functions/` — 9 edge functions (analyze-batch-report, assessment-ai, student-copilot-chat, etc.), none used by RiTX.
- `.lovable/memory/features/institute-panel/`, `.lovable/memory/features/student-copilot-architecture.md` — legacy feature memories.
- `src/pages/ritx/Landing.tsx` — unused (Login is the index route).
- Legacy memory entries in `mem://index.md` (Institute Portal, Teacher Portal, Student Portal, Exams & Access, SuperAdmin sections) — trim to RiTX-only.

Kept intentionally: `src/components/ui/*` (shadcn primitives used by RiTX), `src/integrations/supabase/*` (auto-generated), shared hooks/utils.

### 2. Fix app metadata

`index.html` still says `theDonutAI` / "Intelligence Layer for Schools". Update:

- `<title>` → "RiTX Young Innovators Challenge"
- `<meta name="description">`, `og:title`, `og:description`, `twitter:*` → RiTX copy
- Remove stale `og:image` pointing to the old preview screenshot (let hosting inject).

### 3. Route + interaction smoke test (Playwright)

Run headless Chromium against `localhost:8080` and screenshot every RiTX route to catch runtime errors, missing states, and broken links. Coverage:

```text
/                              Login
/team/register                 Team registration wizard
/team                          Team home (empty + joined workspace variants)
/team/members
/team/resources
/team/submissions
/team/submissions/progress     Stage form with countdown
/team/submissions/final
/team/results
/admin                         Admin dashboard
/admin/setup
/admin/registrations
/admin/staff
/admin/communications
/admin/payment
/admin/submission-forms
/admin/submissions             Entries list + expandable per-judge
/admin/rubrics
/admin/judge-assignments
/admin/results
/admin/announcements
/staff                         Staff home
/staff/mentor/resources
/staff/mentor/sessions
/staff/judge                   Assigned list
/staff/judge/<teamId>          Score sheet with slider panel
```

For each route: capture console errors, capture screenshot, note any blank screen / thrown error / broken empty state.

### 4. Fix bugs found in step 3

Only bugs surfaced by the smoke test get patched — no speculative changes. Typical categories to expect and fix in-place:

- Null-guard gaps when no workspace/team is selected.
- Broken links after the earlier route flattening (any `/ritx/*` leftovers).
- Empty-state regressions on pages that expect seeded mock data.
- Slider / form validation edge cases in the scoring panel.

### 5. Verify

- `bunx tsgo --noEmit` — must stay clean.
- Re-run Playwright smoke pass; confirm zero console errors across all routes.
- Report back with: files deleted, bugs found + fixed, and any residual issues that need a product decision.

### Out of scope

No new features, no visual redesign, no backend work. UI-only, RiTX-only.
