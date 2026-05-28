# Lesson Packages QA — SuperAdmin Authoring, Editor & Lesson Composer

> This guide walks a tester through the SuperAdmin **Lesson Packages** module end-to-end. Read the orientation sections first — once you understand what a Package is, how its "shape" works, and where bugs are most likely to surface, the scenario tables will feel obvious. The emphasis here is **edge cases**: previews, lesson blocks, long content, narrow viewports, lifecycle transitions, and stale state — the places where bugs slip past happy-path smoke tests.

---

## Before You Begin

> **New to the Packages module?** Read this section first. It defines the domain terms used throughout, and tells you exactly where each surface lives in the UI. If you already authored a package end-to-end, skip to "How a Package is Structured".

### Domain Glossary

| Term | What It Means | Example |
|------|---------------|---------|
| **Package** | A SuperAdmin-authored bundle of lesson plans plus optional tests, scoped to one curriculum **or** one course and a chosen set of grades and subjects. Think of it as a "ready-to-teach kit" institutes can later subscribe to. | "CBSE Comprehensive Foundation Pack", "JEE Mains Accelerator" |
| **Source Type** | Whether the package is scoped to a **Curriculum** (e.g., CBSE) or a **Course** (e.g., JEE Mains). A package has exactly one source — you cannot mix. | Curriculum → CBSE · Course → JEE Mains |
| **Shape** | The matrix of grades × subjects the package covers. Each row is one grade plus the list of subjects included in that grade. Different grades can have different subject sets. | Class 6 → [Maths, Science, English] · Class 11 → [Physics, Chemistry] |
| **Cell** | A single (grade, subject) intersection within the shape. Every chapter, lesson plan and chapter test lives inside one cell. | "Class 11 → Physics" is one cell |
| **Inclusions** | Four toggles on the package that decide which assessment slots the editor exposes: Lesson Plans, Chapter Tests, Grand Tests, Previous Year Papers. Toggling one off hides its UI without deleting saved data. | A package with only `lessonPlans: true` shows no test panes |
| **Lesson Plan** | An ordered set of teaching blocks for one chapter inside one cell. Authored in the Lesson Composer at `/packages/:id/lesson/:lpId`. | "Laws of Motion — Worked Examples" |
| **Lesson Block** | An atomic step inside a lesson plan. One of four types: **Explain** (slides / PDF / notes), **Demonstrate** (video), **Quiz** (in-class pulse check), **Homework** (take-home practice). | A YouTube embed block with `linkType: youtube` |
| **Attachment** | A reference to an existing exam, attached to a chapter (chapter test, PYP) or to the whole package (grand test). Attachments don't duplicate the exam — they point at `teacherExams[i].id`. | Chapter Test → Exam #E-204 |
| **Chapter Test** | A test attached to one specific chapter inside one cell. Visible only when `inclusions.chapterTests = true`. | One per chapter, optional |
| **Grand Test** | A package-level test (no chapter), shown in its own pane. Visible only when `inclusions.grandTests = true`. | "JEE Full Mock 1" |
| **PYP** | Previous Year Paper, attached at chapter level, only shown when `inclusions.previousYearPapers = true`. | "JEE 2023 Paper" attached to "Electrostatics" |
| **Status** | `draft`, `published`, or `archived`. Published packages show a green check icon (no redundant text pill). Archived packages live in the archived tab and are read-only. | A draft package can be edited freely |

### Where to Find Things in the UI

| Surface | Route | What lives there |
|---------|-------|------------------|
| Packages list | `/superadmin/packages` | All packages, source-tree filter, status filter, archived toggle |
| Create wizard | `/superadmin/packages/new` | Multi-step package creation (name, source, shape, inclusions) |
| Package editor | `/superadmin/packages/:id` | Header (name, class dropdown, publish, settings), subject tabs, chapter rail, chapter detail pane, grand tests pane |
| Lesson composer | `/superadmin/packages/:id/lesson/:lpId` | Block canvas, block dialogs (Explain/Demonstrate/Quiz/Homework), preview, toolbar |
| Settings sheet | Editor → ⚙ icon | Edit name, description, inclusions, shape |
| Attach test sheet | Chapter detail or Grand Tests pane → "Attach" | Picker over `teacherExams`, filtered by subject |

### Prerequisites for Testing

Before running any scenario you should have:

1. A SuperAdmin account at `/superadmin/packages`.
2. The two pre-seeded packages from `mockPackages.ts`:
   - **CBSE Comprehensive Foundation Pack** — `published`, curriculum source, 4 grades, includes a Class 6 row with **7 subjects** (the stress-test cell) and a Class 7 row with **8 subjects**.
   - **JEE Mains Accelerator** — `draft`, course source, PYPs enabled.
3. The ability to create a third package on the fly for negative tests (empty shape, very long name, single grade).
4. At least one archived package (archive one of the above to populate the archived view).
5. A browser DevTools window — many edge cases (route refresh, narrow viewport, console errors) need it.

---

## How a Package is Structured

Every Package is a tree, and every bug in this module is ultimately a violation of that tree. Keep this diagram in mind while testing:

```text
PACKAGE  (Curriculum  OR  Course as source — never both)
  │
  ├── SHAPE: list of (grade × [subjects])         ← edited in Create wizard / Settings
  │     │
  │     └── CELL = one (grade, subject) pair
  │           │
  │           ├── CHAPTER  (pulled from masterData via getChaptersForScope)
  │           │     ├── LESSON PLAN (ordered)
  │           │     │     └── BLOCKS: Explain | Demonstrate | Quiz | Homework
  │           │     ├── CHAPTER TEST attachment   (if inclusions.chapterTests)
  │           │     └── PYP attachment            (if inclusions.previousYearPapers)
  │           │
  │           └── (no other cell-level entities)
  │
  └── GRAND TESTS  (package-level, no chapter)    (if inclusions.grandTests)
```

### The Golden Rules

1. **Source decides chapters.** A curriculum package shows chapters from that curriculum's class+subject. A course package shows course-owned chapters **plus** mapped curriculum chapters for the same subject. Never the other way around.
2. **Inclusions gate UI, not data.** Turning a toggle off hides the pane but does not delete previously saved lessons / attachments. Turning it back on must restore them intact.
3. **A subject only exists inside the grades that list it.** Switching grade must reset the subject tab to the first subject of the new grade's shape.
4. **Archived = read-only.** No create, edit, attach, publish or delete actions inside an archived package.
5. **Published ≠ frozen.** Published packages can still be edited in Phase 1 (no downstream consumers yet) — verify the badge stays green but nothing else changes silently.

---

## PKG-LIST — List, Filters & Source Tree

The list view is the entry point. Most reported bugs here are filter-combinations that quietly hide everything, or counts on `PackageCard` going stale after an edit in another tab.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-LIST-001 | Default view excludes archived | Open `/superadmin/packages` with one archived package in the store | Card grid shows only draft + published; archived count is hidden from totals |
| PKG-LIST-002 | Archived toggle swap | Click the Archive button in the toolbar | Grid now shows **only** archived packages; status filter is hidden or disabled |
| PKG-LIST-003 | Source-tree filter — curriculum | In the source tree pick "CBSE" | Only packages with `sourceType=curriculum` AND `sourceId=cbse` remain |
| PKG-LIST-004 | Source-tree filter — course | Pick "JEE Mains" in the course branch | Only `sourceType=course, sourceId=jee-mains` remain |
| PKG-LIST-005 | Status filter combines with source | Pick CBSE + status `draft` | Both filters AND together; show empty state if intersection is empty |
| PKG-LIST-006 | Empty state copy | Pick a curriculum that has zero packages | Friendly empty state with a clear "Create package" CTA — no broken grid skeleton |
| PKG-LIST-007 | Counts on `PackageCard` | Open editor, add a lesson plan, return to list | Lesson count on the card increments; tests/grand/pyp counts likewise |
| PKG-LIST-008 | Deep-link with invalid `:id` | Manually visit `/superadmin/packages/does-not-exist` | Graceful "Package not found" fallback, **not** a blank page or runtime error |

---

## PKG-CREATE — Create Wizard

The wizard generates a kebab-case ID from the name and validates the shape. The riskiest area is the source-type switch, which must reset stale shape state.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-CREATE-001 | Required-name validation | Leave name empty, try to advance | Cannot proceed; clear inline error |
| PKG-CREATE-002 | Kebab-case ID generation | Enter `My New CBSE Pack!!` as name | Generated ID = `my-new-cbse-pack`; punctuation stripped, spaces → hyphens |
| PKG-CREATE-003 | Duplicate slug collision | Create a second package with the same name | Either disambiguates (e.g. `-2`) or blocks with a clear message — never silently overwrites the first |
| PKG-CREATE-004 | Source-type switch resets selection | Pick Curriculum → CBSE, then flip to Course | Selected source clears; the previously chosen CBSE is not carried over into the course dropdown |
| PKG-CREATE-005 | Empty-shape validation | Try to finish with zero grades selected | Cannot submit; error explains at least one grade is required |
| PKG-CREATE-006 | Grade with zero subjects | Add Class 11 but uncheck every subject in that row | Cannot submit; row is highlighted |
| PKG-CREATE-007 | Inclusions persist | Toggle off "Previous Year Papers", finish wizard, open editor | PYP pane is hidden; reopen Settings — toggle still off |
| PKG-CREATE-008 | Cancel mid-wizard | Fill name + source, click back/cancel | Nothing is persisted; list view does not show the package |

---

## PKG-EDITOR-HEADER — Header, Class Dropdown & Publish

The header was redesigned to use a **class dropdown** (so 5+ grades don't cramp the toolbar) and a green check icon for published (no redundant "Published" pill or button). These changes introduced new edge cases:

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-HDR-001 | Long package name truncates | Edit name to 80+ characters, reopen editor | Name truncates with ellipsis, header doesn't wrap onto two lines or push the dropdown off-screen |
| PKG-HDR-002 | Single-grade package | Open a package with only one grade in its shape | Class dropdown collapses to inline label (no chevron) — clicking does nothing |
| PKG-HDR-003 | Class dropdown lists all shape grades | Open CBSE Foundation pack | Dropdown lists Class 6, 7, 11, 12 (in shape order); active grade has a check mark |
| PKG-HDR-004 | Switching class via dropdown | Pick Class 11 from the dropdown | Subject tabs reset to Physics; chapter rail reloads; URL grade param (if any) updates |
| PKG-HDR-005 | Published icon, no redundant pill | Open the published CBSE pack | Green `CheckCircle2` + "Published" text in header; no separate uppercase status pill; publish button is hidden or labeled "Re-publish" |
| PKG-HDR-006 | Draft → Publish flow | Open the JEE draft, click Publish, confirm in dialog | Status flips to published; icon turns green; `updatedAt` advances; toast confirms |
| PKG-HDR-007 | Publish dialog cancel | Click Publish, choose Cancel | Status stays `draft`; no toast; no state change |
| PKG-HDR-008 | Settings sheet opens & saves | Click ⚙, edit description, save | Sheet closes; header reflects nothing (description not in header); reopen to confirm persisted |

---

## PKG-SUBJECTS — Subject Tabs

Subject tabs are chips, not a dropdown. The stress case is the Class 6 row in the CBSE pack with **7 subjects** and the Class 7 row with **8 subjects** — both must scroll cleanly on a 320px viewport.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-SUB-001 | 7-subject row, 1186px viewport | Open CBSE pack → Class 6 | All 7 chips visible or horizontally scrollable; active chip is highlighted |
| PKG-SUB-002 | 8-subject row, 320px viewport | Resize to 320px, switch to Class 7 | Tabs scroll horizontally; active chip auto-scrolls into view; no vertical wrap |
| PKG-SUB-003 | Grade switch resets subject | On Class 6 (Maths active), switch to Class 11 | Subject tab resets to the first subject of Class 11's shape (Physics) — never falls back to an empty state |
| PKG-SUB-004 | Subject not in current grade is hidden | Class 11 shape = [Physics, Chemistry] | English chip does not appear, even though it exists in Class 6 |
| PKG-SUB-005 | Touch/keyboard tab navigation | Use Tab key and Arrow keys | Focus moves through chips; Enter activates; matches mouse behaviour |
| PKG-SUB-006 | Active chip persists on chapter selection | Pick a chapter, then re-render (open settings sheet) | Active subject chip is unchanged |
| PKG-SUB-007 | Subject removed via Settings | Open Settings, uncheck Chemistry from Class 11, save | Chemistry chip disappears immediately; if it was active, falls back to first remaining subject |

---

## PKG-CHAPTERS — Chapter Rail & Detail Pane

Chapters are not stored on the package — they're resolved from masterData via `getChaptersForScope(source, grade, subject)`. The classic bug is a course package missing its course-owned chapters, or a curriculum package showing course-only chapters.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-CHP-001 | Curriculum chapter list | Open CBSE pack → Class 11 → Physics | List matches CBSE Class 11 Physics chapters from masterData, ordered by `order` |
| PKG-CHP-002 | Course chapter list | Open JEE pack → Class 11 → Physics | List includes course-owned chapters **and** mapped CBSE chapters, in `order` |
| PKG-CHP-003 | Empty chapter list | Pick a cell whose source has zero chapters | Empty state with copy explaining no chapters in the source — not a broken rail |
| PKG-CHP-004 | Chapter selection loads detail pane | Click any chapter | Detail pane shows lesson plans + attachments for that chapter; previous chapter highlight is removed |
| PKG-CHP-005 | Mobile chapter sheet | At 375px, tap Menu | Chapter rail opens in a Sheet from the side; selecting a chapter closes the sheet |
| PKG-CHP-006 | Scroll position retained on grade switch | Scroll chapter rail halfway, switch grade, switch back | Scroll resets to top (expected for a fresh chapter list) — no jank or invisible scroll lock |
| PKG-CHP-007 | Course-only chapter labelled | Open JEE pack and find a course-owned chapter | Visually distinguishable from mapped chapters (badge, color, or section header) |

---

## PKG-LESSONS — Lesson Plan CRUD

Lesson plans are scoped to a single chapter inside a single cell. The riskiest area is the deep link `/packages/:id/lesson/:lpId` — refreshing or sharing this URL must continue to work.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-LSN-001 | Open composer from chapter | Click "Add lesson plan" or an existing lesson card | Navigates to `/superadmin/packages/:id/lesson/:lpId`; toolbar shows package + chapter context |
| PKG-LSN-002 | Refresh inside composer | Hit browser refresh on a deep lesson URL | Composer reloads with the same lesson + chapter context — not a redirect to the editor root |
| PKG-LSN-003 | Invalid `lpId` deep link | Visit `/superadmin/packages/<valid>/lesson/does-not-exist` | Graceful fallback (back to editor, or "Lesson not found") — no white screen |
| PKG-LSN-004 | Inline title edit | Click pencil, change title, blur | Title persists; chapter detail pane reflects new title after back-navigation |
| PKG-LSN-005 | Save indicator | Make a block edit, watch the Save button | Save button enables / shows "Saving…" / returns to idle; toast confirms |
| PKG-LSN-006 | Delete lesson updates chapter count | Delete a lesson from the chapter detail pane | Lesson disappears; chapter's lesson count and `PackageCard` lesson count both decrement |
| PKG-LSN-007 | Browser back from composer | Save, click back arrow | Returns to the same chapter detail with the active grade + subject preserved |
| PKG-LSN-008 | Unsaved-change warning | Edit a block, click back without saving | Either auto-saves or warns; never silently discards |

---

## PKG-BLOCKS — Lesson Blocks & Previews

Blocks are where previews actually render. Bugs here usually come from link-type detection getting the wrong embed mode, or from very long content overflowing the canvas. Test each of the four types end-to-end.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-BLK-001 | Add Explain block — Google Slides | Paste a `docs.google.com/presentation/...` URL | `linkType` auto-detected as `google-docs`; preview renders embedded slides iframe |
| PKG-BLK-002 | Add Explain block — PDF | Paste a `.pdf` URL | `linkType=iframe`; preview renders PDF in iframe; no JS error in console |
| PKG-BLK-003 | Add Demonstrate block — YouTube | Paste a YouTube watch URL | `linkType=youtube`; preview renders YouTube player (not raw URL); thumbnail visible |
| PKG-BLK-004 | Demonstrate block — invalid URL | Paste plain text "hello world" | Validation error; no preview attempted; block not saved |
| PKG-BLK-005 | Quiz block — opens dialog | Click "Add Quiz" → Quiz dialog opens | Question picker loads; selecting 3 questions and saving stores `questions: [q1,q2,q3]` on the block |
| PKG-BLK-006 | Quiz block — preview render | Open lesson with a quiz block | Preview shows question count + Start button; clicking opens the player as expected |
| PKG-BLK-007 | Homework block — practice source | Add Homework block, pick "practice" source | Block saves with `sourceType=practice`; preview shows take-home description and duration |
| PKG-BLK-008 | Reorder blocks | Drag block #3 above block #1 | New order persists on save and on refresh |
| PKG-BLK-009 | Delete block | Remove the middle block | Other blocks reindex; durations sum correctly |
| PKG-BLK-010 | 10+ blocks on one lesson | Add 12 blocks of mixed types | Canvas scrolls cleanly; no layout shift; save completes |
| PKG-BLK-011 | Very long block title | Set title to 200 characters | Truncates or wraps gracefully; does not break canvas grid |
| PKG-BLK-012 | Switch block source library ↔ custom | Toggle source dropdown on an Explain block | Form fields update; previous attachment URL is preserved if compatible, cleared otherwise — never half-stale |

---

## PKG-ATTACH-TESTS — Chapter Tests, Grand Tests & PYP

Attachments reference `teacherExams[i].id`. The picker (`AttachTestSheet`) must filter by subject, and inclusions toggles must hide/show panes without losing data.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-ATT-001 | Chapter Test pane hidden when toggle off | Settings → uncheck "Chapter Tests" | Chapter detail pane no longer shows the Chapter Test slot; existing attachments are preserved in the store |
| PKG-ATT-002 | Re-enable inclusion restores data | Toggle Chapter Tests back on | Previously attached chapter tests reappear, in their original order |
| PKG-ATT-003 | Attach test sheet filters by subject | Open Attach sheet on Physics chapter | Exam list contains only exams tagged to Physics (and to the package's curriculum/course) |
| PKG-ATT-004 | Duplicate attachment prevented | Try to attach the same exam twice to the same chapter | Second attachment is silently skipped or visibly disabled in the picker |
| PKG-ATT-005 | Remove attachment | Click remove on a chapter test | Attachment disappears; chapter count and `PackageCard` test count both decrement |
| PKG-ATT-006 | Grand Tests pane is package-level | Open Grand Tests pane | List spans the whole package; chapter context is absent in each row |
| PKG-ATT-007 | PYP visibility gated | Open CBSE pack (PYP off) | No PYP slot anywhere. Toggle on in Settings → PYP slot appears in chapter detail |
| PKG-ATT-008 | Attach across many chapters | Attach a test on 10 different chapters | All 10 attachments persist; switching cells doesn't drop any |

---

## PKG-LIFECYCLE — Draft, Publish, Archive, Restore

Lifecycle is small but high-impact: archived packages must be fully read-only, and the status filter on the list must always reflect reality.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-LIFE-001 | Publish from editor | Draft → Publish → confirm | Badge turns green; icon = `CheckCircle2`; `updatedAt` advances |
| PKG-LIFE-002 | Re-publish a published package | Click publish again on an already-published package | Either no-op (button hidden) or idempotent re-publish — never throws |
| PKG-LIFE-003 | Archive from list | List → card overflow menu → Archive | Card disappears from default view; appears in archived view |
| PKG-LIFE-004 | Restore from archived view | Archived view → Restore | Status returns to `draft` (not `published`, even if it was published before) |
| PKG-LIFE-005 | Editor on archived package | Open an archived package | All create / edit / attach / publish actions are disabled or hidden; clear "Archived — read-only" banner |
| PKG-LIFE-006 | Status filter respects archived toggle | In archived view, change status filter | Status filter is either hidden or limited to `archived` only — never silently filters out everything |
| PKG-LIFE-007 | Counts stay live | Archive a package with 50 lesson plans | List totals + source-tree counts update immediately; no stale numbers after refresh |

---

## PKG-RESPONSIVE — Mobile & Tablet

The module is SuperAdmin-only but the responsive bar still applies (320px minimum, 44px touch targets). The class dropdown was specifically added so 5+ grades don't cramp the toolbar — verify that fix holds.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-RSP-001 | Editor header at 320px | Resize to 320px, open CBSE pack | Name truncates with ellipsis; class dropdown stays inline; publish action is reachable (icon-only is fine) |
| PKG-RSP-002 | Subject tabs scroll at 320px | Open Class 7 (8 subjects) at 320px | Chips scroll horizontally; no horizontal overflow on the page itself |
| PKG-RSP-003 | Chapter rail collapses to sheet | At ≤ 768px, the rail is hidden | A `Menu` button opens the rail in a Sheet; selecting a chapter closes the sheet |
| PKG-RSP-004 | Lesson composer at 375px | Open a lesson on iPhone size | Block canvas fits; toolbar buttons are ≥ 44px; quiz/attach dialogs open as full-screen sheets |
| PKG-RSP-005 | Create wizard on tablet (768px) | Run the wizard at 768px | All steps fit without horizontal scroll; shape grid is usable with a finger |
| PKG-RSP-006 | Settings sheet on mobile | Open Settings at 375px | Sheet covers near-full height; form scrolls inside the sheet; Save sticks to bottom |
| PKG-RSP-007 | Long source name in header | Source = "Senior Secondary Certificate Examination Board" | Source chip on `PackageCard` truncates; tooltip on hover shows full name |

---

## PKG-EDGE — Edge & Failure Cases

These are the scenarios where bugs typically slip past the happy path. Test each one even if the rest of the module looks fine.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-EDGE-001 | Package with 0 grades | Force a package whose shape is empty (via DevTools or wizard skip) | Editor shows a "Configure shape" empty state; no crash, no broken header |
| PKG-EDGE-002 | Grade with 0 subjects | Edit shape so Class 12 has no subjects | Switching to Class 12 shows "No subjects in this grade"; subject tabs render nothing instead of throwing |
| PKG-EDGE-003 | Subject with 0 chapters | Open a cell whose source genuinely has no chapters | Chapter rail empty state; "Add lesson plan" actions are disabled or hidden |
| PKG-EDGE-004 | Very long package name | 120+ character name | Truncates in list card AND editor header; settings sheet still allows editing the full string |
| PKG-EDGE-005 | Stale `sourceId` | Manually remove a curriculum from masterData that a package references | Source chip falls back to the raw `sourceId` (not "undefined"); editor still opens; tester is warned |
| PKG-EDGE-006 | Unknown grade in shape | Force `gradeId: "class-99"` into a shape row | `getClassName` falls back to a readable label (e.g. `class-99`); class dropdown still renders |
| PKG-EDGE-007 | Back-navigation chain | List → editor → lesson composer → back, back, back | Lands cleanly on the list; no skipped step; active grade/subject preserved when re-entering the editor |
| PKG-EDGE-008 | Two tabs editing the same package | Open the same `:id` in two browser tabs, edit in tab A | In Phase 1 (in-memory store) state is per-tab — verify there is no console error, no merged state pollution |
| PKG-EDGE-009 | Inclusions toggle while data exists | Disable Lesson Plans inclusion on a package that has 150 lesson plans | Lesson UI hides; data is preserved (toggle back on → all 150 reappear in correct order) |
| PKG-EDGE-010 | Refresh on lesson composer with unsaved changes | Edit a block, refresh | Either browser prompts to discard or changes persist via autosave — never silently lost |
| PKG-EDGE-011 | Source switch in Settings | (If supported) change source type after creation | Either blocked with a clear message or fully resets shape + attachments — never produces orphaned data |
| PKG-EDGE-012 | Console quiet during full workflow | Open DevTools, run a full create → edit → publish flow | No `console.error`, no React key warnings, no missing-prop warnings |

---

## PKG-DATA — Mock Seed & Data Integrity (Dev-only)

Phase 1 uses `mockSeedGenerator.ts` to produce deterministic content. These tests catch regressions in the seed itself.

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| PKG-DATA-001 | Lesson plan count per cell | Open CBSE pack → Class 6 → Maths | Exactly `chaptersPerCell × lessonsPerChapter` = 5 × 5 = 25 lesson plans across the 5 chapters |
| PKG-DATA-002 | Deterministic order across refresh | Note lesson order, refresh the page | Same lesson IDs in the same order — no `Math.random()` drift |
| PKG-DATA-003 | Attachment IDs unique | In DevTools, dump `getAttachmentsForPackage(...)` | No duplicate `id` values across all attachments |
| PKG-DATA-004 | Lesson IDs unique across cells | Dump `getLessonPlansForPackage(...)` | No two lessons share an `id`, even across grades / subjects / chapters |
| PKG-DATA-005 | Grand tests are package-level only | Inspect grand-test attachments | All have `kind=grand-test` and `chapterId` is undefined |
| PKG-DATA-006 | Chapter test coverage | Inspect chapter-test attachments | Exactly one per chapter per cell when `attachChapterTest=true`; zero when false |
| PKG-DATA-007 | Archived package excluded from default count | Archive one package | Default list total drops by exactly 1; archived view total increases by 1 |

---

## Known Limitations & Out of Scope

- **SuperAdmin-only in Phase 1.** Packages do not yet propagate to Institute, Teacher, or Student portals — those cross-portal scenarios are explicitly out of scope here and will be added when subscription / assignment lands.
- **In-memory store.** Persistence lives in `src/data/packages/helpers.ts` (`let packages = [...]`). State resets on full page refresh **for any new packages you author** during a session; the two pre-seeded packages always come back. Plan testing around this: long edge-case flows should be re-verified after a planned refresh.
- **No auth-based gating yet.** Anyone with the SuperAdmin route can access; role-based hiding is out of scope.
- **Backend persistence, multi-user concurrency, and audit trail** are not implemented — concurrency bugs (PKG-EDGE-008) are informational only.

---

*Last updated: May 2026*