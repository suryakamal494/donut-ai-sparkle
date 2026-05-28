## Goal

Create a tester-friendly QA document for the SuperAdmin **Packages** module, modelled on `curriculum-scope-qa.md`: narrative intro + domain glossary + grouped tables of test scenarios (≈6–8 per group) with a strong emphasis on edge cases (not just happy-path smoke checks).

## File to add

`docs/06-testing-scenarios/inter-login-tests/packages-qa.md`

(Also add a one-line link to it from `docs/06-testing-scenarios/README.md` under Intra-Login Tests — Packages is a SuperAdmin-only module today, so it lives there rather than in cross-portal flows.)

## Document structure

1. **Before You Begin** — glossary specific to Packages (Package, Source Type, Shape, Inclusions, Lesson Plan, Attachment, Chapter Test, Grand Test, PYP, Draft/Published/Archived, Cell = grade×subject) and "Where to find it" navigation (`/superadmin/packages`, `…/new`, `…/:id`, `…/:id/lesson/:lpId`).
2. **How a Package is Structured** — short ASCII diagram of Source → Shape (grades × subjects) → Chapter → Lesson Plans + Attachments, plus package-level Grand Tests.
3. **Prerequisites for Testing** — SA account, at least one curriculum (CBSE) + one course (JEE Mains) seeded, a draft package, a published package, an archived package, and an empty-shape package for negative cases.
4. **Test scenario groups** (each a table: Test ID · Test Case · Steps · Expected Result), targeting ~6–8 rows each:

   - **PKG-LIST** — List & filters
     Archived toggle, source-tree filter (curriculum vs course), status filter (all/draft/published), empty state, counts on `PackageCard`, deep link to a single package, behaviour when source has zero packages.
   - **PKG-CREATE** — Create wizard
     Source type switch resets selection, kebab-case ID generation from name, duplicate-name slug collision, required fields, at-least-one-grade and at-least-one-subject-per-grade validation, inclusions toggles persist, cancel mid-wizard, navigate back without saving.
   - **PKG-EDITOR-HEADER** — Editor header & class dropdown
     Long package name truncation, class dropdown shows all shape grades with check mark on active, single-grade falls back to inline label, published icon shown without redundant pill, settings sheet opens, breadcrumb back to list, refresh on `/packages/:id` keeps active grade.
   - **PKG-SUBJECTS** — Subject tabs
     Cycling through 7–8 subjects on one grade, horizontal scroll on narrow widths (320–375px), keyboard/touch tab change, switching grade resets subject to first valid one, subject hidden if not in the active grade's shape.
   - **PKG-CHAPTERS** — Chapter rail & content sheet
     Chapter list matches `getChaptersForScope(source, grade, subject)`, course-owned vs mapped chapters both visible for course packages, empty chapter list for a grade with no chapters in source, selecting chapter loads detail pane, mobile sheet open/close, scroll position retained on grade switch.
   - **PKG-LESSONS** — Lesson plan CRUD via composer
     Opening composer from chapter detail, autosave/save indicator, editing title inline, reordering lessons, deleting a lesson updates count on chapter, navigating away with unsaved changes warning, deep-link to `/packages/:id/lesson/:lpId` for an unknown `lpId` shows fallback.
   - **PKG-BLOCKS** — Lesson blocks (Explain / Demonstrate / Quiz / Homework)
     Add each block type, link auto-detection (YouTube / Google Docs / generic iframe / PDF), preview render for each (video player, slides iframe, PDF, quiz dialog), reorder via drag, delete block, very long content / very long titles, attaching 10+ blocks to one lesson, switching block source between library and custom, opening Quiz dialog and selecting questions.
   - **PKG-ATTACH-TESTS** — Chapter tests, Grand tests & PYP
     Inclusions toggle hides/shows the relevant pane, AttachTestSheet filters exams by curriculum/subject, attaching duplicates is prevented, removing an attachment, Grand Tests appear under package-level pane (no chapter), PYP only visible when `inclusions.previousYearPapers = true`, attachment counts on `PackageCard` update.
   - **PKG-LIFECYCLE** — Draft / Publish / Archive / Restore
     Publish from editor updates badge + icon, publish confirm dialog cancel keeps draft, archive from list moves card to archived view, restore returns to draft (not published), archived package read-only in editor, status filter respects current view.
   - **PKG-RESPONSIVE** — Mobile/tab UI (320, 375, 768, 1024)
     Header doesn't clip name, class dropdown opens above keyboard, subject tabs swipeable, chapter rail collapses into sheet via `Menu`, lesson composer toolbar reachable, no horizontal overflow at 320px.
   - **PKG-EDGE** — Edge & failure cases
     Package with 0 grades, grade with 0 subjects, subject with 0 chapters in source, very long names (80+ chars), 8+ subjects in one grade (chip cramp test now solved by dropdown for grades — verify subjects still scroll), source curriculum/course later removed/renamed (stale `sourceId`), `getClassName` returns fallback for unknown grade id, deep-link with invalid `:id` → not-found, refresh inside lesson composer preserves route, browser back from composer returns to correct chapter.
   - **PKG-DATA-INTEGRITY** — Mock seed sanity (dev-only)
     Lesson plan counts match `chaptersPerCell × lessonsPerChapter` per cell, deterministic order across refreshes, attachment IDs unique, no duplicate lesson IDs, archived package excluded from default list count.

5. **Known Limitations / Out of Scope** — note that Packages is SuperAdmin-only in Phase 1, no backend persistence yet (in-memory store via `helpers.ts`), no propagation to Institute/Teacher/Student portals to test.

## Style rules

- Match `curriculum-scope-qa.md` tone: prose intro, then markdown tables.
- Test IDs use `PKG-<GROUP>-NNN` (e.g. `PKG-CREATE-003`).
- No emojis. Plain markdown. ASCII diagram inside ```text fence.
- Steps column is action-only ("Open editor → switch grade → ..."); Expected Result is observable outcome.

## Deliverable

One new markdown file at `docs/06-testing-scenarios/inter-login-tests/packages-qa.md` (~400–500 lines) plus a one-line link entry in `docs/06-testing-scenarios/README.md`. No code changes.
