# Teacher → Lesson Plans — Responsiveness Audit & Fix Plan

## How I tested
Inspected the live preview at 320, 375 (phone), and requested 768 / 834 / 1280 (tablet/desktop) on these screens: **Lesson Plans hub** (`TeacherLessonPlans`), **My Plans** (`MyLessonPlansRollup`), and a **Shared lesson detail** (`TeacherPackageLessonView`). Cross-checked against the source components.

> ⚠️ Testing caveat: above ~768px the in-editor preview kept rendering the app at a fixed ~360px-wide mobile shell with the right side blank, even when the viewport was set to 768/834/1280. This is a **preview-tool emulation limit**, not necessarily an app bug — your real browser at 1106px (and the code's `md:`/`lg:` breakpoints + sidebar) indicate desktop renders normally. So tablet/desktop items below are **code-review findings to confirm with the device toggle**, while phone findings are **visually verified**.

---

## Bugs & issues found

### A. Verified on phone (320–375px)
1. **Horizontal clipping at 320px on the lesson-detail + global header.** In the lesson workspace header (`TeacherPackageLessonView` SharedLessonView / OwnLessonComposer) the **Present** button is clipped at the right edge; the global header **avatar** (`TeacherLayout`) is also clipped. The breadcrumb row + always-on action button + header controls don't leave room at the 320 floor. Ref: `TeacherPackageLessonView.tsx` header (`h-14 … px-3`, Present button); `TeacherLayout.tsx` header (`px-4`, profile button `pr-2`).
2. **Floating Copilot button overlaps interactive content.** On **My Plans** and the chapter **Lesson Plans** list, the fixed Copilot FAB sits on top of the last card's **Present/Open** buttons and lesson rows. Containers only reserve space for the bottom nav (`pb-20`), not the FAB. Ref: `CopilotLauncher` (fixed), `TeacherLessonPlans.tsx` (`pb-20 md:pb-6`), `MyLessonPlansRollup.tsx` card grid (no bottom clearance).
3. **Cramped filter row with prominent scrollbars.** The Class dropdown + divider + `SubjectTabs` (horizontal-scroll) and the source-chip row both show visible scrollbars and feel tight under ~360px. Functional but unpolished. Ref: `TeacherLessonPlans.tsx` filter row + `SubjectTabs`.

### B. Code-review findings to confirm at 768 / 1024 / 1280 (via device toggle)
4. **Two-pane library fit.** The library card is `h-[calc(100vh-10.5rem)] min-h-[480px]` with `md:grid-cols-[280px_1fr]` and an inner scroll. Confirm no double scrollbars and that the rail + detail both scroll independently with the auto-collapsed sidebar (`ml-20`).
5. **Lesson-detail full-bleed + fixed footer.** SharedLessonView/OwnLessonComposer use `-m-4 md:-m-6` breakout, `h-[calc(100vh-3.5rem)]`, and a `fixed bottom-16 md:bottom-0` action bar. Confirm the footer doesn't overlap the last block and there's no double scroll on short/tablet viewports.
6. **Breakpoint boundary.** `useIsMobile` flips at 768 and Tailwind `md` is 768 — aligned, so no dead-zone in theory; still verify the exact 768/820 widths render the desktop shell (sidebar, no bottom nav) and not a stuck mobile shell.

### C. Looks good (no change)
- My Plans cards (compact-footer redesign), source/My-Plans chip switching, and the mobile chapter `Sheet` all render cleanly on phone.

---

## Phased implementation plan

### Phase 1 — Verify the true tablet/desktop state (no code yet)
- Open the app in a real browser / the preview **device toggle** at 768, 1024, 1280. Confirm or rule out items #4–#6. This decides how much of Phase 3 is needed and avoids "fixing" preview-only artifacts.

### Phase 2 — Phone fixes (high confidence, visually verified)
- **#1 Header clipping:** make header rows fully shrink-safe at 320 — keep breadcrumb `flex-1 min-w-0 truncate`, reduce header horizontal padding at the xs step, ensure the Present button is icon-only and `shrink-0` below `sm`, and tighten global header gaps/avatar so nothing clips at 320. Re-test at 320/360.
- **#2 FAB collision:** add bottom clearance so the Copilot FAB never covers actions — increase bottom padding on the hub, My Plans grid, and lesson list (account for bottom nav **and** FAB), or lift the FAB above the bottom nav on mobile. Verify last card's Present/Open are tappable.
- **#3 Filter row polish:** tidy the scroll affordance (consistent `no-scrollbar` + edge fade or wrap) for the source chips and subject tabs at narrow widths.

### Phase 3 — Tablet/desktop fixes (only what Phase 1 confirms)
- Address any confirmed issues from #4–#6 (double scrollbars, fixed-footer overlap, two-pane fit, breakpoint shell). Likely small height/scroll-container and z-index/padding adjustments; no structural rewrite expected.

### Phase 4 — Regression sweep
- Re-test all five lesson-plan screens (hub library, My Plans, shared lesson, own-lesson composer, presentation mode) at 320 / 375 / 768 / 1024 / 1280, in both Library and My Plans tabs, confirming: no horizontal overflow, 44px+ touch targets, no FAB/footer overlap, independent scrolls, and consistent headers.

---

## Scope note
All fixes are **frontend/presentation only** (Tailwind classes, padding, scroll containers, z-index, header layout). No data-layer, routing, or business-logic changes. Mobile-first per project standards (320px floor, 44px targets).

---

## Resolution log (completed)
- **Phase 2 (phone):** header shrink-safe at 320, Copilot FAB hidden on lesson sub-routes, bottom clearance on hub/My Plans/lesson list. ✅
- **Phase 1 + 3 (tablet/desktop, verified live):** Confirmed the 768–1023px band cramped the two-pane library (lesson titles collapsed to "Phy…"). Fixed by deferring the two-pane to `lg` — tablets now use the comfortable single-column + chapter sheet; desktop (≥1024) keeps the two-pane. Shared lesson detail header + fixed footer verified clean at 768 (no clipping/overlap). ✅
- **My Plans FAB clearance:** rollup grid now reserves `pb-20` at all widths (FAB shows on the hub at every breakpoint). ✅
- **Phase 4 regression:** hub library, My Plans, and shared lesson detail verified at 768 / 1280; phone fixes verified earlier at 320/360. ✅
