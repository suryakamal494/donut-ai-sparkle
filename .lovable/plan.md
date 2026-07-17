
# Codebase Health & Scalability Audit

## What I looked at
- 944 TS/TSX files, ~186K lines of source, `src/` = 7.1 MB
- 4 portals already: SuperAdmin, Institute, Teacher, Student (+ Docs)
- Largest area: `src/components/teacher` (1.1 MB), `src/data` (1.4 MB — all mock data bundled)
- Vite config is default (no chunking, no compression, no lazy tuning)
- Routing is already module-split via `React.lazy` in `App.tsx`

## Verdict
**The app will keep working when you add 3 more modules, but reload/HMR slowness will get significantly worse unless we fix a few structural issues first.** Nothing is broken — it's accumulated weight, not architectural rot.

---

## Why reload is slow today

1. **Mock data is huge and eagerly imported.** Files like `neetQuestions.ts` (3,130 lines), `questionsData.ts` (3,110), `academicScheduleData.ts` (1,911), `jeeAdvancedQuestions.ts` (1,762), `instituteData.ts` (1,435) get pulled into the module graph. Vite has to transform + hold all of them in memory on every HMR cycle.
2. **No manualChunks / code splitting inside modules.** Each portal is lazy at the route level, but within Teacher (1.1 MB) everything loads in one chunk. Same for the giant page files (`AddStudent.tsx` 1,066 lines, `CreateGrandTest.tsx` 750, `ViewTimetable.tsx` 700).
3. **Lots of heavy libs bundled together**: `fabric`, `html2canvas`, `jspdf`, `framer-motion`, `katex`, `@dnd-kit/*`, `embla`, `remotion`, full Radix set. Fine for prod, but Vite dev pre-bundles all of them.
4. **`lovable-tagger` runs in dev** — adds transform cost per file. Necessary for the editor, not removable.
5. **No `optimizeDeps.include` hints**, so cold starts re-discover deps.

## Will 3 more modules break support?
- **Runtime / prod:** No. Route-level lazy loading means each new module only loads when visited. Bundle size grows, but users pay only for what they open.
- **Dev experience:** Yes, it will degrade — HMR full-reloads already feel slow; adding 3 more modules of similar weight (~1 MB components + ~500 KB mock data each) would push `src/` past ~12 MB and file count past ~1,500. Vite handles this, but every reload gets noticeably slower.
- **Team velocity:** The real risk. Big shared files (`masterData.ts`, `instituteData.ts`) are already touched by multiple portals → merge conflicts and cross-module coupling will grow.

---

## Recommended cleanup before adding new modules

**Phase A — Quick wins (low risk, big HMR improvement)**
1. Move giant mock datasets (`neetQuestions`, `jeeAdvancedQuestions`, `questionsData`, `examQuestionsData`, `academicScheduleData`) behind **dynamic imports** — load only when the page that needs them mounts.
2. Add `build.rollupOptions.output.manualChunks` in `vite.config.ts` to split vendor bundles (`react`, `radix`, `fabric+html2canvas+jspdf`, `framer-motion`, `katex`).
3. Add `optimizeDeps.include` for the heavy libs so dev cold-start is stable.

**Phase B — Structural (before module #5)**
4. Enforce a **per-portal data folder** rule: `src/data/<portal>/…` with no cross-imports. Split `masterData.ts` and `instituteData.ts` by consumer.
5. Extract mock JSON out of `.ts` into `.json` files loaded lazily — Vite won't re-transform JSON on HMR.
6. Break up the 700+ line page files (`AddStudent`, `CreateGrandTest`, `ViewTimetable`, `SectionsStep`) into feature folders. Not for perf — for merge safety once new modules land.

**Phase C — Long-term**
7. Introduce a shared `@/features/*` layer for anything used by ≥2 portals (reports engine, curriculum tree, exam blocks) so new modules import from `features`, not from another portal.
8. Move mock data behind a thin service interface so swapping to Lovable Cloud later is a one-file change per feature.

---

## Suggested order
1. Confirm which 3 modules you plan to add (so we know what they'll touch).
2. Do **Phase A** (1–2 hours of edits, immediate reload speedup).
3. Do **Phase B** in parallel with building module #5.
4. Defer Phase C until modules #6–#7 are on the roadmap.

## Question for you before I start
Which 3 modules are you planning to add? (e.g., Parent portal, Accounts, Admissions, Library…) — that tells me whether Phase A alone is enough, or whether we should also split the shared data layer (Phase B step 4) up front.
