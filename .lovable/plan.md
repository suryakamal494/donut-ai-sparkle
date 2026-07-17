# Make RiTX the only reachable module

Goal: opening `/` lands on the RiTX landing page, and no other portal (SuperAdmin, Institute, Teacher, Student, Docs) loads code, chunks, or mock data at runtime. All source files stay on disk so shared UI/hooks/utils remain intact and any of it can be re-enabled by reverting one file.

## What changes

**Single file edit: `src/App.tsx`**

1. Remove the `lazy(() => import(...))` declarations for `SuperAdminRoutes`, `InstituteRoutes`, `TeacherRoutes`, `StudentRoutes`, `DocsRoutes`.
2. Remove the matching `<Route path="/superadmin/*">`, `/institute/*`, `/teacher/*`, `/student/*`, `/docs/*` entries.
3. Delete the `preloadModules()` function and the `useEffect` that calls it (currently warms the Institute chunk 1.5s after mount).
4. Remove the eager `import Landing from "./pages/Landing"` (the old portal-picker) and the `<Route path="/" element={<Landing />} />`.
5. Make `/` render the RiTX module directly:
   - Keep `RitxRoutes` as the only lazy module.
   - Route config becomes:
     - `/*` → `<ModuleBoundary><RitxRoutes /></ModuleBoundary>`
   - `RitxRoutes` already has an `index` route that renders `pages/ritx/Landing.tsx`, so `/` will show the RiTX landing, `/login`, `/admin/*`, `/team/*`, `/staff/*` all continue to work exactly as today (paths shift from `/ritx/...` to `/...`).
6. Keep `NotFound`, `ScrollToTop`, `Toaster`, `Sonner`, `TooltipProvider`, `QueryClientProvider` unchanged.

**Internal link rewrite inside RiTX**

Because the module now mounts at `/` instead of `/ritx`, every hardcoded `/ritx/...` string inside RiTX pages needs to become the corresponding `/...` path (e.g. `navigate("/ritx/login")` → `navigate("/login")`, `<NavLink to="/ritx/admin/...">` → `to="/admin/..."`). Scope of touch:
- `src/components/ritx/shared/RitxShell.tsx` (sign-out nav)
- `src/pages/ritx/Landing.tsx` (CTAs)
- `src/pages/ritx/Login.tsx`
- `src/pages/ritx/admin/Layout.tsx` (nav array)
- `src/pages/ritx/team/Layout.tsx`
- `src/pages/ritx/staff/Layout.tsx`
- Any other `/ritx/` string found via ripgrep before edits.

No component logic, styling, or mock data changes.

## What stays on disk (untouched)

- `src/pages/{superadmin,institute,teacher,student,docs}/**`
- `src/routes/{SuperAdminRoutes,InstituteRoutes,TeacherRoutes,StudentRoutes,DocsRoutes}.tsx`
- `src/data/**` for those modules (teacher/student/institute mock data)
- All shared primitives in `src/components/ui/*`, `src/hooks/*`, `src/lib/*` — RiTX depends on many of these.

Because nothing imports the removed route files anymore, Vite's tree-shaker drops them from the production bundle automatically. No chunk is fetched, no mock data is parsed, no preload timer runs.

## Why this is the right trade-off

- **Speed:** identical to physically deleting the folders — unreferenced lazy chunks are never emitted into the served bundle, and the 1.5s Institute preload is gone. Files sitting on disk cost zero runtime.
- **Safety:** shared components stay wired; a stray import from RiTX into a shared util can't break. Reverting is one file.
- **Reversible:** re-enabling any portal later is just restoring its lazy import + `<Route>` line.

## Verification after build mode

1. `rg "/ritx" src` returns no hits.
2. Preview `/` shows the RiTX landing (not the old portal picker).
3. `/admin`, `/team`, `/staff/judge` load their RiTX pages.
4. `/institute`, `/teacher`, `/student`, `/superadmin`, `/docs` render `NotFound`.
5. Build output shows no `SuperAdminRoutes`/`InstituteRoutes`/etc. chunks.
