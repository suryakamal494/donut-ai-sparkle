## Goal

Stop the `/institute/packages` page from being stuck on the loading skeleton by removing lazy loading for the Packages pages.

## Why it hangs today

In `src/routes/InstituteRoutes.tsx`, the three Packages pages are loaded with `React.lazy(() => import(...))` and wrapped in a `<Suspense>` that shows `<PageSkeleton />`. If that on-demand chunk is slow to download or fails (network hiccup, stale chunk after a deploy), the fallback skeleton stays on screen "forever" — which matches the screenshot.

## Change

In `src/routes/InstituteRoutes.tsx`:

1. Replace the three lazy declarations with normal top-level (eager) imports:
   - `InstitutePackagesPage` → `@/pages/institute/packages/InstitutePackages`
   - `InstitutePackageDetailPage` → `@/pages/institute/packages/InstitutePackageDetail`
   - `InstitutePackageLessonViewPage` → `@/pages/institute/packages/InstitutePackageLessonView`
2. In the three `packages` routes, drop the `<LazyPage>...</LazyPage>` wrapper and render the components directly (same pattern already used by the eager `InstituteDashboard`).

This means the Packages code ships in the main institute bundle and renders immediately — no Suspense skeleton, no separate chunk fetch to stall on.

## Scope / notes

- Only the Packages routes change. All other institute routes keep their existing lazy loading.
- No changes to page logic, data, or UI of the Packages pages themselves.
- Trade-off: the institute bundle grows slightly since Packages now loads up front, but it removes the indefinite-skeleton failure mode the user is hitting.

## Verification

- Confirm the build succeeds and `/institute/packages` renders content directly (no skeleton flash/hang).
