# Lesson Packages QA — SuperAdmin Authoring, Editor & Lesson Composer

> A step-by-step testing guide for the SuperAdmin **Lesson Packages** module. Written for interns and first-time testers — every scenario tells you *why* the test matters, *exactly* what to click, *what* to look for on screen, and *how serious* a failure would be. Read "Before You Begin" once; after that you can jump straight to any group (PKG-LIST, PKG-CREATE, etc.) and test it in isolation.

---

## 1. Before You Begin

### 1a. Who this guide is for

You. Specifically: someone who has never authored a Lesson Package before and needs to verify the module works end-to-end. You do **not** need to know React, TypeScript or how the data is stored. You only need a browser, a SuperAdmin login, and patience to follow the steps in order.

If you already know the module inside-out, you can skim the glossary and jump to the scenario groups. If a term in any test ever feels unclear, come back to section 1d.

### 1b. How to read a scenario

Every scenario in this document follows the **same six-part pattern**. Once you learn the pattern, every test reads the same way:

1. **Why this matters** — one sentence telling you what a real author or institute would suffer if this broke. This is the "stakes" line. Don't skip it; it tells you whether to be picky or relaxed.
2. **Setup** — the exact preconditions. Which package to open, which viewport size, which toggles need to be on/off. If the setup is wrong, the test result is meaningless.
3. **Steps** — numbered, click-by-click instructions. Button labels and routes are quoted exactly as they appear in the UI.
4. **What to look for** — the observable signals: header text, the toast that pops up at the bottom, the URL in the address bar, whether the browser console (F12 → Console) stays clean.
5. **Pass example / Bug example** — a concrete description of "looks like this = working" and "looks like this = broken". When in doubt, compare what you see against these two lines.
6. **Severity if it fails** — how bad it is, using the legend in section 1c. File the bug at that severity.

### 1c. Severity legend

| Level | Meaning | Example |
|-------|---------|---------|
| **P0** | Blocks the release. Data is wrong, lost, or hidden in a way that an author would never notice. Stop testing and report immediately. | Switching to Class 11 still shows Class 6 chapters in the rail. |
| **P1** | Module ship-blocker. The feature visibly misbehaves on a common workflow; an author would notice but might struggle to work around it. | Save toast says "Saved" but the lesson plan is missing after refresh. |
| **P2** | Polish. The feature works, but it looks wrong or feels janky. | A long package name overflows the header by 4 px on a 320 px viewport. |

If you can't decide between two levels, pick the higher one and add a note in the bug ticket.

### 1d. Domain Glossary

| Term | What it means in plain English |
|------|--------------------------------|
| **Package** | A ready-to-teach kit a SuperAdmin builds: lessons + optional tests, scoped to one curriculum **or** one course, and a chosen set of grades and subjects. Institutes will later subscribe to these kits. Example: "CBSE Comprehensive Foundation Pack". |
| **Source Type** | Whether the package is tied to a **Curriculum** (like CBSE) or to a **Course** (like JEE Mains). Exactly one. A package can never mix the two. |
| **Shape** | The grid of (grade × subjects) the package covers. Each row is one grade, with the subjects included in that grade. Different grades inside the same package can have different subjects. |
| **Cell** | One (grade, subject) intersection in the shape. Example: "Class 11 → Physics" is one cell. Every chapter, lesson plan and chapter test belongs to exactly one cell. |
| **Inclusions** | Four on/off toggles in Settings that decide which slots the editor shows: Lesson Plans, Chapter Tests, Grand Tests, Previous Year Papers. Toggling one off hides the slot but does **not** delete the data behind it. |
| **Lesson Plan** | An ordered set of teaching blocks for one chapter inside one cell. Authored in the Lesson Composer (URL: `/superadmin/packages/:id/lesson/:lpId`). |
| **Lesson Block** | One step inside a lesson plan. Four types: **Explain** (slides/PDF/notes), **Demonstrate** (video), **Quiz** (in-class check), **Homework** (take-home). |
| **Attachment** | A reference to an existing exam, attached either to a chapter (Chapter Test or PYP) or to the whole package (Grand Test). It points at an exam; it does not duplicate the exam. |
| **Chapter Test** | A test linked to one chapter inside one cell. Shown only when `Chapter Tests` inclusion is on. |
| **Grand Test** | A package-level test, no chapter. Shown only when `Grand Tests` inclusion is on. |
| **PYP** | Previous Year Paper, linked to a chapter. Shown only when `Previous Year Papers` inclusion is on. |
| **Status** | One of `draft`, `published`, `archived`. Published packages show a small green check icon in the header (no separate badge). Archived packages live in their own tab and are read-only. |

### 1e. Where to find things in the UI

| Surface | Route | What lives there |
|---------|-------|------------------|
| Packages list | `/superadmin/packages` | All packages, source-tree filter on the left, status filter row, Archived toggle |
| Create wizard | `/superadmin/packages/new` | Multi-step package creation (name → source → shape → inclusions) |
| Package editor | `/superadmin/packages/:id` | Header with name, class dropdown, ⚙ Settings, Publish; subject chip row; chapter rail on the left; chapter detail pane in the middle; Grand Tests pane (if enabled) |
| Lesson composer | `/superadmin/packages/:id/lesson/:lpId` | Block canvas, toolbar (Add Content / Add Quiz), block dialogs, footer with totals, Save button |
| Settings sheet | Editor → ⚙ icon top right | Edit name, description, inclusions, and shape |
| Attach test sheet | Chapter detail or Grand Tests pane → "Attach" | Picker that lists exams from `teacherExams`, pre-filtered by the cell's subject |

### 1f. Prerequisites for testing

Before running any scenario you should have:

1. **A SuperAdmin account** that lands you at `/superadmin/packages` on login. Without this you cannot reach any of the surfaces.
2. **Two pre-seeded packages** loaded from `mockPackages.ts`:
   - **CBSE Comprehensive Foundation Pack** — `published`, curriculum source = CBSE, covers Class 6, 7, 11, 12; Class 6 has **7 subjects** and Class 7 has **8 subjects** (these two rows are the stress-test cells for horizontal scroll).
   - **JEE Mains Accelerator** — `draft`, course source = JEE Mains, Previous Year Papers inclusion is on.
   You need both because some scenarios specifically exercise the curriculum side and others the course side.
3. **The ability to create extra packages on the fly.** Some negative tests (empty shape, very long name, etc.) need a throwaway package.
4. **At least one archived package.** If none exists, archive one of the seeded packages first — you cannot test the archived view without data in it.
5. **Browser DevTools open** (F12 → Console + Network). Many scenarios in PKG-EDGE rely on watching the console for silent errors. If you have never opened DevTools, do this now: Right-click anywhere on the page → "Inspect" → switch to the "Console" tab.

---

## 2. How a Package is Structured

Every Package is a tree. Every bug in this module is, in the end, a violation of that tree. Keep this picture in your head while testing:

```text
PACKAGE  (Curriculum  OR  Course as source — never both)
  │
  ├── SHAPE: list of (grade × [subjects])         ← edited in Create wizard / Settings
  │     │
  │     └── CELL = one (grade, subject) pair
  │           │
  │           ├── CHAPTER  (pulled from masterData via getChaptersForScope)
  │           │     ├── LESSON PLAN (ordered list)
  │           │     │     └── BLOCKS: Explain | Demonstrate | Quiz | Homework
  │           │     ├── CHAPTER TEST attachment   (if inclusion is on)
  │           │     └── PYP attachment            (if inclusion is on)
  │           │
  │           └── (no other cell-level entities)
  │
  └── GRAND TESTS  (package-level, no chapter)    (if inclusion is on)
```

### Read the diagram like a tester

- **Top of the tree (Package + Source).** A bug here is a metadata bug: wrong source label on the card, wrong source name in the editor breadcrumb. Usually P1 or P2 unless the source itself disappears.
- **Shape level.** Bugs here are the worst: a wrong cell means an author silently edits the wrong grade or subject. Almost always P0.
- **Chapter level.** Chapters are not stored on the package — they are resolved live from master data. The classic bug is "course package missing course-owned chapters" or "curriculum package showing course-only chapters". P0.
- **Lesson plan / block level.** Bugs here usually surface as preview problems: a YouTube link rendering as raw text, a PDF iframe blank, a quiz block losing its questions. Usually P1.
- **Attachment level.** Bugs here look like missing tests or duplicated attachments. P1.
- **Grand Tests.** They sit beside the chapter tree, not inside it. A grand test that ends up tied to a chapter is a P0 data bug.

### The five golden rules

1. **Source decides chapters.** A curriculum package shows chapters from that curriculum's (class, subject). A course package shows course-owned chapters **plus** mapped curriculum chapters for the same subject. Never the reverse.
2. **Inclusions hide UI; they do not delete data.** Turning a toggle off must hide the pane. Turning it back on must restore all previously saved data intact.
3. **A subject only exists inside the grades that list it.** Switching grade must reset the subject chip to the first subject of the new grade's shape.
4. **Archived = read-only.** No create, edit, attach, publish or delete actions inside an archived package.
5. **Published is not frozen in Phase 1.** Published packages can still be edited (no downstream consumers yet) — verify the green check stays, but nothing else should change silently.

---

## PKG-LIST — List view, filters & source tree

**What this group covers.** The entry page at `/superadmin/packages`. You'll test the source-tree filter on the left, the status filter row, the Archived toggle, the empty state, and the counts shown on each `PackageCard`. The single most common bug here is a combination of filters that quietly hides every package — a tester then thinks the data is gone when it is only filtered out.

### PKG-LIST-001 — Default view excludes archived packages

**Why this matters:** Authors should see only "live" work on landing. If archived packages leak into the default view, the list balloons and authors waste time scrolling past dead work.

**Setup:** At least one package with status `archived` must exist. If none, archive the JEE pack first using PKG-LIFE-003 below.

**Steps:**
1. Open `/superadmin/packages`.
2. Look at the grid of package cards in the right pane.
3. Look at the toolbar at the top-right; the toggle should read **"Archived"** (meaning "click to switch to archived view").

**What to look for:**
- The grid lists only packages whose status is `draft` or `published`.
- No card with a faded look or "Archived" label is visible.
- The source-tree counts on the left do **not** include archived packages in their totals.

**Pass example:** 2 cards visible (CBSE Foundation + JEE Accelerator), zero archived cards mixed in.
**Bug example:** Archived JEE pack still shows in the grid alongside the live packages.

**Severity if it fails:** P1 — visibility bug, fixable by filtering, but it confuses every author who opens the page.

### PKG-LIST-002 — Archived toggle swaps the view

**Why this matters:** Archive is a soft-delete. Authors need to find, audit and sometimes restore archived packages. The toggle is the only way to reach them.

**Setup:** Same as PKG-LIST-001.

**Steps:**
1. From the default view, click the **"Archived"** button at the top-right of the toolbar.
2. Observe the grid.
3. Click the button again (it should now read **"Active"**).

**What to look for:**
- After the first click: the grid shows only archived packages. The header title changes to "Archived packages".
- The status filter row at the top (`All / Draft / Published`) is hidden or disabled in archived view (you cannot filter archived by draft/published).
- After the second click: you return to the default view, with the same packages and the same filter state you had before.

**Pass example:** Click → archived JEE shows alone → click again → JEE is back among the live cards.
**Bug example:** Toggle does nothing, or status filter row stays visible and silently filters out everything.

**Severity if it fails:** P1 — archived work becomes unreachable.

### PKG-LIST-003 — Source-tree filter, curriculum branch

**Why this matters:** The source tree is the primary navigation for authors with many packages. A broken filter means they cannot find their own work.

**Setup:** Default view, at least one CBSE-sourced package exists (the CBSE Foundation pack).

**Steps:**
1. In the left source tree, expand the "Curriculums" branch.
2. Click "CBSE".

**What to look for:**
- The header subtitle (small text above the title) changes to "CBSE".
- The grid filters to only packages where source = Curriculum AND sourceId = CBSE.
- The active node in the tree is visually highlighted.

**Pass example:** Only the CBSE Foundation card remains in the grid.
**Bug example:** Grid stays the same, or shows JEE (a course package) under the CBSE branch.

**Severity if it fails:** P0 — wrong source means authors edit the wrong package.

### PKG-LIST-004 — Source-tree filter, course branch

**Why this matters:** Same reason as PKG-LIST-003, but for the course side. Curriculum and course filters share code, so a bug usually appears on both — but you must check both to be sure.

**Setup:** JEE Accelerator package exists.

**Steps:**
1. Expand the "Courses" branch in the source tree.
2. Click "JEE Mains".

**What to look for:**
- Header subtitle = "JEE Mains".
- Only packages with sourceType=course and sourceId=jee-mains remain.
- No CBSE package leaks in.

**Pass example:** JEE Accelerator card alone in the grid.
**Bug example:** CBSE Foundation visible under the JEE node.

**Severity if it fails:** P0 — same as PKG-LIST-003.

### PKG-LIST-005 — Source filter AND status filter combine

**Why this matters:** Authors often want to see "all CBSE drafts" or "all JEE published" at once. The two filters must intersect, not override each other.

**Setup:** A CBSE published pack and a CBSE draft pack exist. If only one exists, create a second CBSE draft via the wizard (PKG-CREATE-001 covers the steps).

**Steps:**
1. Click "CBSE" in the source tree.
2. Click the "Draft" pill in the status filter row.

**What to look for:**
- The grid shows only packages where source=CBSE AND status=draft.
- If no package matches, the empty state appears (not a stale list from a previous filter).

**Pass example:** Only the CBSE draft is visible; the published CBSE pack is hidden.
**Bug example:** Both CBSE packages still show, or the grid goes blank but no empty state appears.

**Severity if it fails:** P1.

### PKG-LIST-006 — Empty state copy

**Why this matters:** New customers will see this screen most often. A broken empty state looks like a crash.

**Setup:** Pick a curriculum/course node that has zero packages, or filter to a draft+published combination with no matches.

**Steps:**
1. Trigger the empty state via any combination above.

**What to look for:**
- A friendly icon, headline ("No packages here yet"), short helper text, and a clear "Create package" button.
- No skeleton loader stuck on screen, no empty grid lines.

**Pass example:** Clean empty card with a working CTA button.
**Bug example:** Blank white area, or a skeleton placeholder that never resolves.

**Severity if it fails:** P2 — visual; P1 if the CTA is missing or broken.

### PKG-LIST-007 — `PackageCard` counts stay live

**Why this matters:** The little count chips on each card ("12 lessons · 4 tests · 1 grand · 2 pyp") are the only quick summary authors get. If they go stale, authors trust them and miss missing content.

**Setup:** Note the lesson count on the CBSE Foundation card before starting.

**Steps:**
1. Open the CBSE Foundation editor.
2. Navigate to any chapter and add a new lesson plan (see PKG-LSN-001).
3. Save the lesson plan and click the back arrow until you reach the list.

**What to look for:**
- The lesson count on the CBSE Foundation card has increased by 1.
- Counts for `tests`, `grand`, `pyp` are unchanged.

**Pass example:** Before = 12 lessons, after = 13 lessons.
**Bug example:** Card still shows 12 even after a hard refresh.

**Severity if it fails:** P1 — gives authors a false summary.

### PKG-LIST-008 — Deep link with an invalid `:id`

**Why this matters:** Stale bookmarks, shared links, copy-paste errors all happen. The app must degrade gracefully, never crash.

**Setup:** None.

**Steps:**
1. Manually type `/superadmin/packages/does-not-exist-12345` into the address bar.
2. Press Enter.

**What to look for:**
- A graceful "Package not found" screen with a button or breadcrumb back to the list.
- The browser console (DevTools → Console) stays clean — no red errors.

**Pass example:** "Package not found" screen renders.
**Bug example:** White screen, infinite spinner, or a red `TypeError` in the console.

**Severity if it fails:** P1.

---

## PKG-CREATE — Create wizard

**What this group covers.** The multi-step package creation flow at `/superadmin/packages/new`. You'll test name → source → shape → inclusions and the validation between steps. The riskiest part is the source-type switch: it must reset any stale state from the previous selection.

### PKG-CREATE-001 — Required name validation

**Why this matters:** A package without a name is unfindable in the list.

**Setup:** None.

**Steps:**
1. Open `/superadmin/packages/new`.
2. Leave the name field empty.
3. Click "Next" (or whichever button advances to the next step).

**What to look for:**
- The wizard does not advance.
- An inline error appears next to the name field, e.g. "Name is required".
- The Next button is disabled or shows the error on click.

**Pass example:** Cannot proceed; clear inline error.
**Bug example:** Wizard advances with an empty name, or the next step crashes.

**Severity if it fails:** P1.

### PKG-CREATE-002 — Kebab-case ID generation

**Why this matters:** URLs in this app are kebab-case (see core memory). A name like "My New CBSE Pack!!" must become a clean URL slug.

**Setup:** None.

**Steps:**
1. Open the wizard.
2. Type `My New CBSE Pack!!` into the name field.
3. Watch the preview of the generated ID (usually shown below the name field, or appears in the URL after finishing).

**What to look for:**
- The slug is `my-new-cbse-pack`. Spaces → hyphens, punctuation stripped, all lowercase.

**Pass example:** Generated ID = `my-new-cbse-pack`.
**Bug example:** ID = `My_New_CBSE_Pack!!` or contains `!!` or upper-case letters.

**Severity if it fails:** P1 — breaks routing and the kebab-case convention.

### PKG-CREATE-003 — Duplicate name collision

**Why this matters:** If two packages can share an ID, the second one silently overwrites the first. Catastrophic data loss.

**Setup:** A package with a known name (e.g. "Test Pack") already exists. If not, create one first.

**Steps:**
1. Start a new wizard.
2. Type the exact same name.
3. Try to finish the wizard.

**What to look for:**
- Either the wizard auto-disambiguates the slug (e.g. `test-pack-2`) and tells you so, OR it blocks with a clear "A package with this name already exists" message.
- The original package is **untouched** afterwards. Verify by opening it.

**Pass example:** New package created with slug `test-pack-2`; original `test-pack` opens unchanged.
**Bug example:** Original package's content is replaced by the new one's empty shape.

**Severity if it fails:** P0 — silent data loss.

### PKG-CREATE-004 — Source-type switch resets selection

**Why this matters:** If you pick Curriculum → CBSE then flip to Course, a leftover CBSE selection could confuse the course dropdown or, worse, save a package with a curriculum source but a course ID.

**Setup:** None.

**Steps:**
1. Start a new wizard, type a name.
2. Pick source type "Curriculum", then pick "CBSE".
3. Switch the source type radio to "Course".

**What to look for:**
- The dropdown that was showing curriculums now shows courses.
- It is empty (placeholder shown) — CBSE is not carried over.
- Picking a course works normally.

**Pass example:** Course dropdown is empty, prompts you to pick.
**Bug example:** Course dropdown shows "CBSE" or the package saves with `sourceType=course, sourceId=cbse`.

**Severity if it fails:** P0 — corrupt source.

### PKG-CREATE-005 — Empty shape validation

**Why this matters:** A shape with zero grades is a package that covers nothing.

**Setup:** None.

**Steps:**
1. Walk through the wizard to the Shape step.
2. Do not pick any grade.
3. Try to finish.

**What to look for:**
- The wizard does not submit.
- An error explains at least one grade is required.

**Pass example:** Inline error, Finish button disabled.
**Bug example:** Wizard submits and the editor opens to a broken empty header.

**Severity if it fails:** P1.

### PKG-CREATE-006 — Grade with zero subjects

**Why this matters:** A grade that has no subjects in its row is a useless row.

**Setup:** None.

**Steps:**
1. In the Shape step, add Class 11 to the shape.
2. Uncheck every subject in that row.
3. Try to finish.

**What to look for:**
- Wizard refuses to submit.
- The offending row is visually highlighted (red border or icon).

**Pass example:** Class 11 row is highlighted; error message names it.
**Bug example:** Wizard saves a row with `subjectIds: []` and the editor crashes when you select Class 11.

**Severity if it fails:** P1.

### PKG-CREATE-007 — Inclusions persist into the editor

**Why this matters:** If a toggle you set in the wizard is silently re-enabled in the editor, the package suddenly exposes UI that the author chose to hide.

**Setup:** None.

**Steps:**
1. Run the wizard end-to-end. In the Inclusions step, turn **off** "Previous Year Papers".
2. Finish; the editor opens.
3. Navigate to any chapter detail pane.
4. Open Settings (⚙ icon, top-right).

**What to look for:**
- The chapter detail pane has no "Previous Year Papers" slot.
- In Settings, the "Previous Year Papers" toggle is off.

**Pass example:** No PYP slot anywhere; toggle off in Settings.
**Bug example:** PYP slot shows in the chapter pane, or the Settings toggle is back on.

**Severity if it fails:** P1.

### PKG-CREATE-008 — Cancel mid-wizard does not persist

**Why this matters:** A draft saved without the user's consent pollutes the list and the source-tree counts.

**Setup:** None.

**Steps:**
1. Open the wizard, fill in name + source.
2. Close the wizard with the X / Cancel button (or browser back).
3. Return to `/superadmin/packages`.

**What to look for:**
- No new card in the grid.
- Source-tree counts unchanged.

**Pass example:** List looks identical to before opening the wizard.
**Bug example:** A half-built package shows in the list with no shape, no inclusions.

**Severity if it fails:** P1.

---

## PKG-HDR — Editor header, class dropdown & publish

**What this group covers.** The top bar of `/superadmin/packages/:id`. This includes the package name, the **class dropdown** (which replaced the old class chips so 5+ grades no longer cramp the toolbar), the green published icon, the ⚙ Settings sheet, and the Publish button. The class dropdown was a recent change — pay extra attention to PKG-HDR-002, 003 and 004.

### PKG-HDR-001 — Long package name truncates

**Why this matters:** A name that wraps the header onto two lines pushes the class dropdown and Publish button off-screen on small viewports.

**Setup:** Open Settings on any package and rename it to something 80+ characters long (e.g. "CBSE Comprehensive Foundation Pack For Class 6 To 12 With Full Assessment Bundle"). Save and reload.

**Steps:**
1. Reopen the editor.

**What to look for:**
- The name truncates with an ellipsis ("…").
- The header is still a single row at the current viewport.
- The class dropdown and Publish button are still visible.

**Pass example:** "CBSE Comprehensive Foundation Pack For Class 6 To…" with dropdown visible to the right.
**Bug example:** Name wraps, dropdown vanishes.

**Severity if it fails:** P2 on desktop, P1 if it pushes Publish off-screen on a 320 px viewport.

### PKG-HDR-002 — Single-grade package

**Why this matters:** A dropdown with one item is misleading. When the package only covers one grade, the dropdown should collapse to an inline label.

**Setup:** Create a throwaway package with only Class 11 in its shape.

**Steps:**
1. Open the editor.

**What to look for:**
- The header shows "Class 11" but with **no chevron / dropdown caret**.
- Clicking the label does nothing.

**Pass example:** Plain "Class 11" label, no dropdown affordance.
**Bug example:** Dropdown with only one item, looks broken when you open it.

**Severity if it fails:** P2.

### PKG-HDR-003 — Class dropdown lists every grade in the shape

**Why this matters:** A missing grade in the dropdown means an entire portion of the package is unreachable.

**Setup:** Open the CBSE Foundation pack (shape = Class 6, 7, 11, 12).

**Steps:**
1. Click the class label/pill in the header to open the dropdown.

**What to look for:**
- The dropdown lists Class 6, 7, 11, 12 — in shape order.
- The currently active grade has a check mark.

**Pass example:** Four items, current grade ticked.
**Bug example:** Dropdown only lists 6 and 7, or lists 6, 7, 11, 12, 13 (extra item).

**Severity if it fails:** P0 — unreachable cells.

### PKG-HDR-004 — Switching class via the dropdown

**Why this matters:** This is the central interaction the dropdown was built for. A stale subject or chapter after switching is the most damaging bug in the module: an author silently edits the wrong cell.

**Setup:** Open the CBSE Foundation pack. The header should show Class 6 as active on first load.

**Steps:**
1. Click the "Class 6" pill in the header — a dropdown opens listing Class 6, 7, 11, 12.
2. Click "Class 11".

**What to look for:**
- The pill now reads "Class 11" with a check mark next to it inside the open dropdown.
- The subject chip row directly below resets to the first subject of Class 11's shape — for the seeded pack this is "Physics".
- The chapter rail reloads with Class 11 Physics chapters (e.g. "Electrostatics"), not the Class 6 Maths chapters that were there before.
- The browser console stays clean (no red errors).

**Pass example:** Header = Class 11, active chip = Physics, rail shows Physics chapters.
**Bug example:** Header switches to Class 11 but the chip row still shows "Maths" (Class 11 doesn't even include Maths).

**Severity if it fails:** P0 — stale cell after grade switch, every downstream edit is suspect.

### PKG-HDR-005 — Published icon, no redundant pill

**Why this matters:** The header was simplified to one green check icon. A leftover "Published" pill or "Publish" button on an already-published package adds noise and can confuse authors into clicking publish twice.

**Setup:** Open the CBSE Foundation pack (status = published).

**Steps:**
1. Look at the header.

**What to look for:**
- A small green `CheckCircle2` icon next to the package name (or in the toolbar area), often paired with the word "Published".
- **No** uppercase status pill (`PUBLISHED`).
- The Publish button is either hidden or relabeled (e.g. "Re-publish").

**Pass example:** Single green check; no redundant pill.
**Bug example:** Big "PUBLISHED" badge AND a green check AND an enabled "Publish" button.

**Severity if it fails:** P2 (visual noise) unless re-publish is destructive.

### PKG-HDR-006 — Draft → Publish flow

**Why this matters:** This is the only happy-path transition out of draft. A broken Publish leaves authors stuck.

**Setup:** Open the JEE Accelerator pack (status = draft).

**Steps:**
1. Click the Publish button in the header.
2. A confirmation dialog opens — read it; click "Confirm" / "Publish".

**What to look for:**
- Toast confirms "Package published" (or similar).
- The green check icon appears in the header.
- The list view, when you return, shows the package under "Published" status.

**Pass example:** Status flips immediately; toast visible; list reflects the change.
**Bug example:** Dialog closes silently, no status change, no toast.

**Severity if it fails:** P1.

### PKG-HDR-007 — Cancel from the Publish dialog

**Why this matters:** Authors must be able to back out.

**Setup:** A draft package open in the editor.

**Steps:**
1. Click Publish.
2. In the confirmation dialog, click "Cancel".

**What to look for:**
- Dialog closes; status stays `draft`.
- No toast appears.
- No state change anywhere on the page.

**Pass example:** Looks like nothing happened.
**Bug example:** Status flips to published anyway.

**Severity if it fails:** P0 — accidental publish.

### PKG-HDR-008 — Settings sheet opens and saves

**Why this matters:** Settings is the only place to edit name, description, inclusions and shape after creation. If save fails silently, every edit is lost.

**Setup:** Any package open in the editor.

**Steps:**
1. Click the ⚙ icon at the top-right.
2. The Settings sheet slides in from the right.
3. Change the description to "Test description 123".
4. Click Save.

**What to look for:**
- The sheet closes.
- A success toast appears.
- Reopen the sheet — the new description is still there.

**Pass example:** Description survives reopen.
**Bug example:** Sheet closes but the description reverts on reopen.

**Severity if it fails:** P1.

---

## PKG-SUBJECTS — Subject chips

**What this group covers.** The horizontal chip row below the header showing subjects for the active grade. The stress case is the Class 6 row in the CBSE pack with **7 subjects** and the Class 7 row with **8 subjects** — both must scroll cleanly even on a 320 px viewport. This is the row the user specifically asked to keep as chips (not a dropdown) because the class dropdown above already handles the cramping problem.

### PKG-SUB-001 — 7-subject row at the current desktop viewport

**Why this matters:** If chips overflow into a second row or push the chapter rail down, the editor layout breaks.

**Setup:** Open CBSE Foundation → Class 6 (7 subjects). Current viewport ~1127 px.

**Steps:**
1. Look at the chip row.

**What to look for:**
- All 7 chips fit horizontally OR are horizontally scrollable.
- The active chip is highlighted (background colour or border).
- No wrap onto a second line.

**Pass example:** Row scrolls horizontally if needed; active chip visible.
**Bug example:** Chips wrap to two rows or get clipped.

**Severity if it fails:** P1.

### PKG-SUB-002 — 8-subject row at 320 px

**Why this matters:** 320 px is the mobile-first minimum (core memory). The Class 7 row is the worst case.

**Setup:** Open Chrome DevTools → toggle device toolbar → set width = 320 px. Open CBSE Foundation → Class 7.

**Steps:**
1. Scroll the chip row horizontally with finger swipe (in device mode) or with the mouse wheel + shift.
2. Click the rightmost chip.

**What to look for:**
- Row scrolls smoothly.
- The page itself does not scroll horizontally (only the chip row).
- After clicking the rightmost chip, it scrolls into view and becomes active.

**Pass example:** Smooth scroll, page stays in place, active chip auto-scrolls in.
**Bug example:** Whole page scrolls horizontally; chips wrap vertically.

**Severity if it fails:** P1 — violates mobile-first standard.

### PKG-SUB-003 — Grade switch resets subject chip

**Why this matters:** Subjects are per-grade. A subject from the old grade still showing as active after a switch means the chapter rail below is loading data from a non-existent cell.

**Setup:** CBSE Foundation, Class 6 selected, Maths active.

**Steps:**
1. Switch to Class 11 via the dropdown.

**What to look for:**
- Active chip jumps to the first subject in Class 11's shape (Physics).
- The chapter rail reloads accordingly.

**Pass example:** Active = Physics, rail = Physics chapters.
**Bug example:** Active stays "Maths" but Class 11 has no Maths.

**Severity if it fails:** P0.

### PKG-SUB-004 — Subject from another grade is hidden

**Why this matters:** Confirms the chip row really filters by the active grade's shape, not by all subjects in the package.

**Setup:** CBSE Foundation, Class 11 (shape = Physics, Chemistry, Maths, Biology).

**Steps:**
1. Look at the chip row.

**What to look for:**
- English (which exists in Class 6's row but not Class 11's) is not in the chip row.

**Pass example:** No English chip on Class 11.
**Bug example:** English chip visible on Class 11, leads to an empty chapter rail.

**Severity if it fails:** P0.

### PKG-SUB-005 — Keyboard navigation

**Why this matters:** Accessibility. Authors with keyboards or screen readers must be able to switch subjects.

**Setup:** Editor open.

**Steps:**
1. Press Tab until focus lands on a chip.
2. Use Arrow Left / Right to move between chips.
3. Press Enter on a non-active chip.

**What to look for:**
- Focus ring visible on the chip.
- Arrow keys move focus.
- Enter activates the chip (same as a click).

**Pass example:** Behaves identically to mouse.
**Bug example:** No focus ring, or Enter does nothing.

**Severity if it fails:** P2 unless keyboard is the only input.

### PKG-SUB-006 — Active chip persists across in-page actions

**Why this matters:** Opening Settings or another modal should not reset the author's selection.

**Setup:** Editor open, any non-default subject active.

**Steps:**
1. Open the Settings sheet, close it without saving.
2. Click a chapter in the rail, then click another.

**What to look for:**
- Active chip is unchanged after closing Settings.
- Active chip is unchanged after chapter selection.

**Pass example:** Selection survives both actions.
**Bug example:** Active chip reverts to the first subject.

**Severity if it fails:** P2.

### PKG-SUB-007 — Subject removed via Settings disappears immediately

**Why this matters:** Settings is the only place to change shape after creation. The chip row must react live.

**Setup:** CBSE Foundation, Class 11 active, Chemistry active.

**Steps:**
1. Open Settings.
2. In the Shape section, uncheck Chemistry from Class 11.
3. Click Save.

**What to look for:**
- Sheet closes.
- Chemistry chip is gone.
- The active chip falls back to the first remaining subject (Physics).

**Pass example:** Chip gone, active = Physics, chapter rail reloads.
**Bug example:** Chemistry chip still visible until full page refresh.

**Severity if it fails:** P1.

---

## PKG-CHP — Chapter rail & content sheet

**What this group covers.** The chapter list on the left of the editor (or in a slide-in sheet on mobile) and the detail pane that opens when you click a chapter. Chapters are **resolved live** via `getChaptersForScope(source, grade, subject)` — they are not stored on the package. So the test is: does the list match what master data says for the active cell?

### PKG-CHP-001 — Curriculum chapter list matches master data

**Why this matters:** A curriculum package showing the wrong chapters poisons every lesson plan authored against them.

**Setup:** Open `/superadmin/master-data/curriculum` in a second tab, find CBSE Class 11 Physics, note the chapter names.

**Steps:**
1. In tab one, open CBSE Foundation → Class 11 → Physics.
2. Compare the chapter rail to your notes.

**What to look for:**
- Same chapters, same order (sorted by `order`).

**Pass example:** Exact match.
**Bug example:** Missing chapter, or chapters from CBSE Class 10 Physics shown by mistake.

**Severity if it fails:** P0.

### PKG-CHP-002 — Course chapter list includes mapped curriculum chapters

**Why this matters:** Course packages combine course-owned chapters **plus** the curriculum chapters mapped to the same subject. Authors expect both.

**Setup:** Open JEE Accelerator → Class 11 → Physics.

**Steps:**
1. Look at the chapter rail.

**What to look for:**
- Both course-owned chapters (typically marked or grouped) AND mapped curriculum chapters appear.
- Order follows the `order` field on each.

**Pass example:** Combined list visible.
**Bug example:** Only one of the two sets shows.

**Severity if it fails:** P0.

### PKG-CHP-003 — Empty chapter list

**Why this matters:** Authors will sometimes hit a cell with no chapters. The UI must explain why, not look broken.

**Setup:** Find a (grade, subject) combination in master data with zero chapters, or fake one by removing chapters in master data.

**Steps:**
1. Navigate to that cell.

**What to look for:**
- Empty-state copy explains "No chapters for this subject yet" or similar.
- No skeleton rows hanging.

**Pass example:** Friendly empty state.
**Bug example:** Blank rail with no message.

**Severity if it fails:** P2.

### PKG-CHP-004 — Chapter selection loads the detail pane

**Why this matters:** This is the main navigation inside the editor.

**Setup:** Any cell with at least 2 chapters.

**Steps:**
1. Click the first chapter.
2. Click the second chapter.

**What to look for:**
- Detail pane reloads with the selected chapter's lessons, chapter tests, PYP (if enabled).
- The previously selected chapter no longer looks active in the rail.

**Pass example:** Active highlight follows the click; pane reloads.
**Bug example:** Pane keeps showing chapter 1's lessons after clicking chapter 2.

**Severity if it fails:** P0.

### PKG-CHP-005 — Mobile chapter sheet

**Why this matters:** At ≤ 768 px the rail collapses into a slide-in sheet. If the sheet does not close on selection, the user cannot see the detail pane.

**Setup:** DevTools → 375 px viewport. Open any package.

**Steps:**
1. Click the Menu icon in the editor header.
2. The sheet slides in showing the chapter list.
3. Tap a chapter.

**What to look for:**
- Sheet closes automatically.
- Detail pane shows the selected chapter's data.

**Pass example:** Sheet closes; pane updates.
**Bug example:** Sheet stays open and covers the detail pane.

**Severity if it fails:** P1.

### PKG-CHP-006 — Scroll position resets on grade switch

**Why this matters:** Sticky scroll positions across two unrelated chapter lists confuse users and sometimes hide chapters off-screen.

**Setup:** A cell with enough chapters that the rail scrolls.

**Steps:**
1. Scroll the chapter rail halfway down.
2. Switch grade.
3. Switch back.

**What to look for:**
- Scroll resets to the top each time the chapter list changes.
- No "invisible scroll" where you have to scroll up to find the first chapter.

**Pass example:** Each new grade lands at the top of its rail.
**Bug example:** Rail looks empty because it is scrolled past the only entries.

**Severity if it fails:** P2.

### PKG-CHP-007 — Course-only chapters are visually distinguishable

**Why this matters:** Authors need to know whether a chapter belongs to the course (custom content) or comes from the mapped curriculum (shared content).

**Setup:** JEE Accelerator → Class 11 → Physics.

**Steps:**
1. Look for a course-owned chapter (e.g. one with a badge or under a section header).

**What to look for:**
- Some visual cue (badge, colour, section header) that separates course-owned from curriculum-mapped chapters.

**Pass example:** Clearly labelled.
**Bug example:** Indistinguishable; author can't tell what is custom.

**Severity if it fails:** P2.

---

## PKG-LSN — Lesson plan CRUD

**What this group covers.** Creating, opening, editing, saving, and deleting lesson plans inside the composer at `/superadmin/packages/:id/lesson/:lpId`. The riskiest area is the deep link: refreshing or sharing this URL must continue to land you in the same lesson with the same context preserved.

### PKG-LSN-001 — Open composer from a chapter

**Why this matters:** This is the entry into the composer.

**Setup:** A chapter selected in the editor.

**Steps:**
1. In the chapter detail pane, click "Add lesson plan" (or an existing lesson card to edit it).

**What to look for:**
- URL changes to `/superadmin/packages/<id>/lesson/<lpId>` (or `/lesson/new`).
- Top bar shows package name → subject → chapter breadcrumb.
- Title input is auto-focused on a new plan.

**Pass example:** Composer opens with correct context.
**Bug example:** Composer opens with wrong subject in breadcrumb.

**Severity if it fails:** P0 — wrong context = author writes for the wrong cell.

### PKG-LSN-002 — Browser refresh inside the composer

**Why this matters:** A composer that loses context on refresh breaks bookmarks and sharing.

**Setup:** Composer open on an existing lesson plan.

**Steps:**
1. Press Cmd/Ctrl + R (or F5) to refresh the page.

**What to look for:**
- The same lesson plan reloads with the same title, blocks and breadcrumb.
- You are not redirected to the editor root.

**Pass example:** Exact same view.
**Bug example:** Redirect to `/superadmin/packages/:id`, losing the lesson.

**Severity if it fails:** P1.

### PKG-LSN-003 — Invalid `:lpId` deep link

**Why this matters:** Stale links must not crash the app.

**Setup:** Note any valid package ID.

**Steps:**
1. Manually visit `/superadmin/packages/<valid-id>/lesson/does-not-exist-xyz`.

**What to look for:**
- Either a "Lesson not found" message, or a redirect back to the editor with the right package context.
- No white screen, no red console errors.

**Pass example:** Graceful fallback.
**Bug example:** Crash.

**Severity if it fails:** P1.

### PKG-LSN-004 — Inline title edit

**Why this matters:** The title is the only way authors recognise their lesson plans in lists.

**Setup:** Composer open on a new or existing lesson.

**Steps:**
1. Click the title input at the top.
2. Type a new title.
3. Click outside the input (blur), or press Enter.
4. Click Save.
5. Click the back arrow to return to the chapter detail pane.

**What to look for:**
- Title input shows the new value.
- After Save + back, the chapter detail pane shows the lesson with the new title.

**Pass example:** New title visible everywhere.
**Bug example:** Title reverts after blur, or chapter detail still shows the old title.

**Severity if it fails:** P1.

### PKG-LSN-005 — Save indicator

**Why this matters:** Without feedback, authors will click Save multiple times and create duplicates.

**Setup:** Composer with at least one block added.

**Steps:**
1. Click Save.

**What to look for:**
- Save button shows a "Saving…" state briefly.
- A toast appears: "Lesson plan saved".
- The Save button returns to its idle state.

**Pass example:** All three signals present.
**Bug example:** Button stays in "Saving…" forever, or no toast appears.

**Severity if it fails:** P1.

### PKG-LSN-006 — Delete lesson decrements counts

**Why this matters:** Deleted lessons must be removed from every count (chapter detail, card on list).

**Setup:** Note the lesson count on a chapter and on the parent `PackageCard`.

**Steps:**
1. From the chapter detail pane, delete a lesson plan.
2. Return to the package list.

**What to look for:**
- Chapter detail: lesson count down by 1.
- `PackageCard`: lesson count down by 1.

**Pass example:** Both counts decrement.
**Bug example:** Lesson gone but counts still show the old number.

**Severity if it fails:** P1.

### PKG-LSN-007 — Browser back preserves context

**Why this matters:** Authors often jump between composer and chapter detail dozens of times in a session.

**Setup:** Editor on Class 11 → Physics → "Electrostatics" chapter; open one of its lessons in the composer.

**Steps:**
1. Save and click the back arrow in the composer top bar.

**What to look for:**
- You land on the same chapter detail pane.
- The active grade is still Class 11, active subject still Physics, selected chapter still "Electrostatics".

**Pass example:** Same context preserved.
**Bug example:** Lands on Class 6 / first subject / no chapter selected.

**Severity if it fails:** P1.

### PKG-LSN-008 — Unsaved changes warning

**Why this matters:** Silently discarding edits is the worst kind of data loss.

**Setup:** Composer open.

**Steps:**
1. Edit a block (add, delete, or change content).
2. Without saving, click the back arrow.

**What to look for:**
- Either a confirmation dialog ("Discard unsaved changes?"), or an autosave that survives the back-navigation.
- Never silent loss.

**Pass example:** Either pattern is acceptable.
**Bug example:** Changes vanish with no warning.

**Severity if it fails:** P0 — silent data loss.

---

## PKG-BLK — Lesson blocks & previews

**What this group covers.** The block canvas inside the composer. Four block types (Explain, Demonstrate, Quiz, Homework), link-type detection (YouTube / Google Slides / PDF), previews, reorder, delete. Bugs here usually come from link detection picking the wrong embed mode or from very long content overflowing the canvas.

### PKG-BLK-001 — Add Explain block with Google Slides URL

**Why this matters:** Slides are the primary "lecture" content for most lessons.

**Setup:** Composer open. Have a Google Slides URL ready, e.g. `https://docs.google.com/presentation/d/.../edit`.

**Steps:**
1. Click the "Add Content" button in the toolbar.
2. Pick the Explain block type and paste the URL.
3. Save the block.

**What to look for:**
- `linkType` is auto-detected (no error about unsupported link).
- The block preview renders an embedded Slides iframe — you can see the actual slides.

**Pass example:** Slides visible in preview.
**Bug example:** Preview shows the raw URL as text, or a broken iframe with a CORS error in the console.

**Severity if it fails:** P1.

### PKG-BLK-002 — Add Explain block with a PDF URL

**Why this matters:** PDFs are the second most common Explain content.

**Setup:** A direct `.pdf` URL.

**Steps:**
1. Add Explain block, paste the URL, save.

**What to look for:**
- Preview shows the PDF in an iframe (Chrome's built-in PDF viewer).
- No console errors.

**Pass example:** PDF visible.
**Bug example:** Blank iframe, or download dialog instead of inline preview.

**Severity if it fails:** P1.

### PKG-BLK-003 — Add Demonstrate block with a YouTube URL

**Why this matters:** YouTube is the primary video source. Detection must pick `linkType=youtube` so the player renders correctly.

**Setup:** A YouTube watch URL, e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`.

**Steps:**
1. Add Demonstrate block, paste the URL, save.

**What to look for:**
- Preview shows the YouTube player with thumbnail and play button.
- Hovering displays the video title.

**Pass example:** Embedded YouTube player visible.
**Bug example:** Raw URL shown as text, no player.

**Severity if it fails:** P1.

### PKG-BLK-004 — Demonstrate block rejects invalid URLs

**Why this matters:** Garbage in, garbage out. Authors paste random strings; the form must catch them.

**Setup:** Composer open.

**Steps:**
1. Add Demonstrate block.
2. In the URL field, type `hello world`.
3. Try to save.

**What to look for:**
- Inline validation error.
- No preview attempted.
- Block is not saved.

**Pass example:** Error shown; save blocked.
**Bug example:** Block saves with `attachmentUrl: "hello world"` and the preview breaks.

**Severity if it fails:** P2.

### PKG-BLK-005 — Quiz block opens the picker dialog

**Why this matters:** The quiz block depends on existing questions from the bank. The picker must load and let you pick.

**Setup:** Composer open in a chapter that has questions in the question bank.

**Steps:**
1. Click "Add Quiz" in the toolbar.
2. The Quiz dialog opens.
3. Pick 3 questions and click Save.

**What to look for:**
- Dialog shows questions filtered to the current chapter.
- After save, a quiz block appears in the canvas showing "3 questions".

**Pass example:** Block saved with 3 questions.
**Bug example:** Dialog empty, or save creates a block with zero questions.

**Severity if it fails:** P1.

### PKG-BLK-006 — Quiz block preview renders

**Why this matters:** Authors review their quiz before publishing.

**Setup:** A lesson plan with at least one quiz block.

**Steps:**
1. Open the lesson.

**What to look for:**
- The quiz block preview shows the question count and a "Start" button.
- Clicking Start opens the quiz player (or whatever preview surface the composer provides).

**Pass example:** Preview functional.
**Bug example:** Blank block, or Start button does nothing.

**Severity if it fails:** P1.

### PKG-BLK-007 — Homework block with practice source

**Why this matters:** Homework blocks carry over to student portals later. Source metadata must be saved correctly.

**Setup:** Composer open.

**Steps:**
1. Add a Homework block.
2. Pick "practice" as the source.
3. Save.

**What to look for:**
- Block saved with the practice source type.
- Preview shows the take-home description and the estimated duration.

**Pass example:** All fields visible on the block card.
**Bug example:** Source field is empty after save.

**Severity if it fails:** P1.

### PKG-BLK-008 — Reorder blocks

**Why this matters:** Order is teaching order. A mis-reorder rearranges the lesson.

**Setup:** A lesson with at least 3 blocks.

**Steps:**
1. Drag block #3 above block #1.
2. Save.
3. Refresh the page.

**What to look for:**
- After drop: visible order is 3, 1, 2.
- After save + refresh: same order persists.

**Pass example:** Order survives refresh.
**Bug example:** Order reverts on refresh.

**Severity if it fails:** P1.

### PKG-BLK-009 — Delete a middle block

**Why this matters:** Indexes and the duration total must update.

**Setup:** A lesson with at least 3 blocks of varying durations.

**Steps:**
1. Delete the middle block.

**What to look for:**
- The other two blocks remain in order.
- The footer's "Total duration" decreases by the deleted block's duration.

**Pass example:** Math correct.
**Bug example:** Total duration unchanged.

**Severity if it fails:** P2.

### PKG-BLK-010 — Many blocks on one lesson

**Why this matters:** Composer must not blow up on realistic lesson sizes.

**Setup:** Composer open.

**Steps:**
1. Add 12 mixed-type blocks (a few of each type).
2. Save.

**What to look for:**
- Canvas scrolls cleanly; no layout shift as you scroll.
- Save completes within ~2 seconds.

**Pass example:** Smooth scroll and save.
**Bug example:** Canvas jitters; save takes 30 seconds; browser tab unresponsive.

**Severity if it fails:** P1.

### PKG-BLK-011 — Very long block title

**Why this matters:** Authors paste long sentences as titles.

**Setup:** A block being edited.

**Steps:**
1. Set the title to 200 characters of text.
2. Save.

**What to look for:**
- Title truncates or wraps cleanly inside the block card.
- The canvas grid is not broken.

**Pass example:** Title contained within the card.
**Bug example:** Title overflows and pushes neighbouring blocks.

**Severity if it fails:** P2.

### PKG-BLK-012 — Switch block source from library to custom

**Why this matters:** The source dropdown changes which form fields apply. Stale fields = corrupt data.

**Setup:** Explain block edited from a library source.

**Steps:**
1. Toggle the source dropdown to "custom".
2. Check the form fields.

**What to look for:**
- Fields update to the custom set.
- Previously entered attachment URL is preserved if it's still valid for the new source, otherwise cleared. Never half-stale.

**Pass example:** Clean transition.
**Bug example:** Block keeps the library `sourceId` AND a custom URL — confusion downstream.

**Severity if it fails:** P1.

---

## PKG-ATT — Chapter Tests, Grand Tests & PYP attachments

**What this group covers.** Attachments link existing exams to a chapter (Chapter Test, PYP) or to the whole package (Grand Test). The attach sheet must filter exams by subject; the inclusions toggles must hide panes without losing data; duplicates must be prevented.

### PKG-ATT-001 — Chapter Test pane hidden when inclusion is off

**Why this matters:** Inclusions are the author's way to declutter the editor. They must hide UI.

**Setup:** A package with at least one chapter test attached.

**Steps:**
1. Open Settings → uncheck "Chapter Tests" → Save.
2. Open any chapter detail pane.

**What to look for:**
- The Chapter Test slot no longer appears in the detail pane.
- Other slots (Lesson Plans, PYP if on, etc.) still appear.

**Pass example:** Slot gone; rest of pane intact.
**Bug example:** Slot still visible.

**Severity if it fails:** P1.

### PKG-ATT-002 — Re-enabling inclusion restores data

**Why this matters:** Toggles must hide, not delete.

**Setup:** Continue from PKG-ATT-001. Note which exams were attached before turning the toggle off.

**Steps:**
1. Reopen Settings → check "Chapter Tests" → Save.
2. Open the chapter detail pane.

**What to look for:**
- The same chapter tests reappear, in the same order.

**Pass example:** All attachments back, untouched.
**Bug example:** Attachments missing; the toggle effectively deleted them.

**Severity if it fails:** P0 — silent data loss.

### PKG-ATT-003 — Attach sheet filters by subject

**Why this matters:** Showing the full exam list (including other subjects) makes authors attach the wrong exam.

**Setup:** Open the chapter detail pane on a Physics chapter.

**Steps:**
1. Click "Attach" on the Chapter Test slot.

**What to look for:**
- The picker lists only exams tagged to Physics (and to the package's source curriculum/course).
- No Maths or Biology exams in the list.

**Pass example:** Only Physics exams visible.
**Bug example:** All subjects' exams visible.

**Severity if it fails:** P1.

### PKG-ATT-004 — Duplicate attachment prevented

**Why this matters:** Attaching the same exam twice creates phantom tests for students.

**Setup:** A chapter with at least one chapter test already attached.

**Steps:**
1. Open the Attach sheet for the same chapter.
2. Try to attach the same exam again.

**What to look for:**
- The exam appears disabled / greyed in the picker, OR the attach action silently skips it.
- After closing the sheet, the chapter still shows that exam only once.

**Pass example:** Exam appears once.
**Bug example:** Exam appears twice in the chapter.

**Severity if it fails:** P1.

### PKG-ATT-005 — Remove an attachment

**Why this matters:** Authors must be able to detach mistakes.

**Setup:** A chapter with at least one chapter test attached.

**Steps:**
1. Click the remove icon (trash / X) on the attachment row.
2. Confirm if asked.

**What to look for:**
- Attachment disappears from the pane.
- Chapter test count decreases by 1.
- `PackageCard` test count decreases by 1.

**Pass example:** Counts all consistent.
**Bug example:** Attachment gone but counts stale.

**Severity if it fails:** P2.

### PKG-ATT-006 — Grand Tests pane is package-level

**Why this matters:** Grand tests must not be tied to a chapter.

**Setup:** A package with Grand Tests inclusion on and at least one grand test attached.

**Steps:**
1. Open the Grand Tests pane (top-level pane in the editor, not inside any chapter).

**What to look for:**
- The list shows the grand test rows.
- Each row has no chapter context.

**Pass example:** Clean package-level list.
**Bug example:** A "Chapter: Electrostatics" label appears on a grand test row.

**Severity if it fails:** P0 — data shape violation.

### PKG-ATT-007 — PYP visibility gated by inclusion

**Why this matters:** Same as PKG-ATT-001 but for PYP.

**Setup:** CBSE Foundation (PYP off by default).

**Steps:**
1. Open any chapter detail pane → no PYP slot.
2. Open Settings → enable Previous Year Papers → Save.
3. Reopen the chapter detail pane.

**What to look for:**
- PYP slot now appears.

**Pass example:** Slot appears after enabling.
**Bug example:** Slot never appears, even after enabling and refresh.

**Severity if it fails:** P1.

### PKG-ATT-008 — Attach a test across many chapters

**Why this matters:** Bulk attachment workflows are common at the start of a new term.

**Setup:** A subject with at least 10 chapters.

**Steps:**
1. Attach a chapter test on each of 10 different chapters.
2. Switch between chapters.

**What to look for:**
- All 10 attachments persist, each on its own chapter.
- Switching does not drop any attachment.

**Pass example:** 10 chapters, 10 attachments, no losses.
**Bug example:** Chapter 4's attachment disappears after editing chapter 5.

**Severity if it fails:** P0.

---

## PKG-LIFE — Lifecycle: draft, publish, archive, restore

**What this group covers.** Status transitions. Small surface, high impact. Archived packages must be fully read-only; the status filter must always reflect reality.

### PKG-LIFE-001 — Publish from editor

**Why this matters:** Already covered as PKG-HDR-006 from the header angle. Here we verify the state stays consistent across the app.

**Setup:** A draft package open.

**Steps:**
1. Publish via the confirmation dialog.
2. Return to the list.

**What to look for:**
- Card moves from "Draft" filter to "Published" filter.
- `updatedAt` (visible on the card or in Settings) advances to now.
- Green check icon visible on the card.

**Pass example:** All three signals consistent.
**Bug example:** Card still appears under "Draft" filter.

**Severity if it fails:** P1.

### PKG-LIFE-002 — Re-publish an already-published package

**Why this matters:** Authors will click Publish twice. The second click must be idempotent.

**Setup:** A published package.

**Steps:**
1. If the Publish button is hidden, this scenario is N/A — note that.
2. If visible, click it. Confirm the dialog if any.

**What to look for:**
- No crash, no duplicate publish event in the console.
- Status stays published; `updatedAt` may or may not advance.

**Pass example:** Idempotent no-op.
**Bug example:** Throws an error or duplicates state.

**Severity if it fails:** P2.

### PKG-LIFE-003 — Archive from the list

**Why this matters:** Archive is the only soft-delete. Authors need it to clean up the list without losing data.

**Setup:** A live package visible in the default view.

**Steps:**
1. On the package card, open the overflow menu (⋯).
2. Click "Archive".

**What to look for:**
- Card disappears from the default view.
- Toggle to Archived view → the card is present there.

**Pass example:** Card moves from one view to the other.
**Bug example:** Card disappears completely, not visible in the archived view either.

**Severity if it fails:** P0.

### PKG-LIFE-004 — Restore from the archived view

**Why this matters:** Authors must be able to undo an archive.

**Setup:** An archived package.

**Steps:**
1. In the archived view, click Restore on the card.

**What to look for:**
- Card returns to the default view with status `draft` (not `published`, even if it was published before archiving).

**Pass example:** Status = draft after restore.
**Bug example:** Status flips back to published with no review by the author.

**Severity if it fails:** P1.

### PKG-LIFE-005 — Archived package is read-only in the editor

**Why this matters:** Archived data must be safe from edits.

**Setup:** An archived package.

**Steps:**
1. Open the editor for that package.

**What to look for:**
- A clear "Archived — read-only" banner at the top.
- All create/edit/attach/publish/delete buttons disabled or hidden.

**Pass example:** Banner visible; no enabled buttons.
**Bug example:** Author can still add a lesson plan.

**Severity if it fails:** P0.

### PKG-LIFE-006 — Status filter respects archived toggle

**Why this matters:** If status filter combines incorrectly with the archived view, the list goes blank.

**Setup:** Archived view.

**Steps:**
1. Try to change the status filter (`All / Draft / Published`).

**What to look for:**
- Status filter is hidden, disabled, or limited to "Archived" only.
- No combination produces a silently empty list.

**Pass example:** Filter row hidden in archived view.
**Bug example:** Picking "Draft" in archived view shows zero packages with no explanation.

**Severity if it fails:** P2.

### PKG-LIFE-007 — Counts stay live after archive

**Why this matters:** Stale counts give a wrong sense of how much content the catalogue holds.

**Setup:** A package with many lesson plans (CBSE Foundation works).

**Steps:**
1. Archive the package.
2. Look at the source-tree totals on the left of the list.

**What to look for:**
- Totals decrease immediately, no refresh required.
- Archived view total increases by 1.

**Pass example:** Live counts.
**Bug example:** Counts stuck until full refresh.

**Severity if it fails:** P2.

---

## PKG-RSP — Mobile & tablet responsive

**What this group covers.** Even though Packages is a SuperAdmin module, the project's mobile-first standard applies (320 px minimum, 44 px touch targets). The class dropdown was added specifically to stop the toolbar from cramping with 5+ grades — verify that fix holds.

### PKG-RSP-001 — Editor header at 320 px

**Why this matters:** The smallest supported viewport. If the header breaks here, every smaller device breaks.

**Setup:** DevTools → 320 px.

**Steps:**
1. Open the CBSE Foundation editor.

**What to look for:**
- Name truncates with an ellipsis.
- Class dropdown is still visible and tappable.
- Publish action is reachable (icon-only is fine).
- No horizontal page scroll.

**Pass example:** Header fits in one row, all actions reachable.
**Bug example:** Publish off-screen; horizontal page scroll.

**Severity if it fails:** P1.

### PKG-RSP-002 — Subject chips scroll at 320 px

**Why this matters:** Class 7 has 8 subjects. They must scroll, not wrap.

**Setup:** 320 px viewport, CBSE Foundation → Class 7.

**Steps:**
1. Swipe the chip row horizontally.

**What to look for:**
- Chips scroll inside the row.
- Page itself does not scroll horizontally.

**Pass example:** Smooth chip-only scroll.
**Bug example:** Whole page scrolls.

**Severity if it fails:** P1.

### PKG-RSP-003 — Chapter rail collapses into a sheet

**Why this matters:** Below 768 px, the rail must collapse or it eats half the screen.

**Setup:** 700 px viewport.

**Steps:**
1. Look for the rail.

**What to look for:**
- Rail is hidden.
- A Menu button is visible in the editor header.
- Tapping Menu opens the rail in a slide-in sheet.

**Pass example:** Sheet behaviour as described.
**Bug example:** Rail still squashed alongside the detail pane.

**Severity if it fails:** P1.

### PKG-RSP-004 — Lesson composer at 375 px

**Why this matters:** Authors review on phones during commute. Composer must be usable.

**Setup:** 375 px viewport, composer open.

**Steps:**
1. Scroll through the canvas; tap the toolbar buttons.

**What to look for:**
- Block cards fit the width.
- Toolbar buttons are at least 44 × 44 px.
- Quiz / Attach dialogs open as full-screen sheets.

**Pass example:** Comfortable to use with a thumb.
**Bug example:** Buttons too small to tap, dialogs cut off.

**Severity if it fails:** P1.

### PKG-RSP-005 — Create wizard on tablet (768 px)

**Why this matters:** Many SuperAdmins use iPads for review.

**Setup:** 768 px viewport.

**Steps:**
1. Run the wizard end-to-end.

**What to look for:**
- All steps fit without horizontal scroll.
- The shape grid (grade × subject checkboxes) is usable with a finger.

**Pass example:** Wizard completes cleanly.
**Bug example:** Shape grid cells overlap.

**Severity if it fails:** P1.

### PKG-RSP-006 — Settings sheet on mobile

**Why this matters:** Settings is long. Save must stay reachable.

**Setup:** 375 px, any package, Settings open.

**Steps:**
1. Scroll inside the sheet.

**What to look for:**
- Sheet covers near full height.
- Form scrolls inside the sheet (not the page).
- Save button sticks to the bottom and is always visible.

**Pass example:** Save always reachable.
**Bug example:** Save scrolls off-screen.

**Severity if it fails:** P1.

### PKG-RSP-007 — Long source name on the package card

**Why this matters:** Source labels can be very long (e.g. "Senior Secondary Certificate Examination Board").

**Setup:** A package with a long source name (or temporarily rename a curriculum in master data).

**Steps:**
1. Open the list.

**What to look for:**
- Source chip on the card truncates.
- Hovering shows the full name in a tooltip.

**Pass example:** Truncates + tooltip.
**Bug example:** Chip stretches the card layout.

**Severity if it fails:** P2.

---

## PKG-EDGE — Edge cases & failure modes

**What this group covers.** The scenarios where bugs slip past happy-path testing. Run every one of these even if everything else looked perfect. Many of them require DevTools.

### PKG-EDGE-001 — Package with zero grades

**Why this matters:** A degenerate shape must not crash the editor.

**Setup:** Force a package shape to be empty (DevTools console: edit the in-memory store, or skip shape selection in the wizard if possible).

**Steps:**
1. Open the editor.

**What to look for:**
- A "Configure shape" empty state.
- No broken header, no crash.

**Pass example:** Empty state with a CTA to open Settings.
**Bug example:** White screen or React error overlay.

**Severity if it fails:** P1.

### PKG-EDGE-002 — Grade with zero subjects

**Why this matters:** Same as PKG-EDGE-001 but at the grade level.

**Setup:** Edit shape: keep Class 12 in the shape but uncheck every subject.

**Steps:**
1. Switch to Class 12.

**What to look for:**
- "No subjects in this grade" empty state.
- Subject chip row renders nothing instead of throwing.

**Pass example:** Clean empty state.
**Bug example:** React error.

**Severity if it fails:** P1.

### PKG-EDGE-003 — Subject with zero chapters

**Why this matters:** Source might genuinely lack chapters for a cell.

**Setup:** Open a cell whose source has zero chapters.

**Steps:**
1. Look at the chapter rail.

**What to look for:**
- Empty state in the rail.
- "Add lesson plan" actions disabled or hidden (nothing to attach lessons to).

**Pass example:** Clear empty rail.
**Bug example:** "Add lesson plan" button visible and clickable but it crashes.

**Severity if it fails:** P1.

### PKG-EDGE-004 — Very long package name

**Why this matters:** Authors paste paragraphs into name fields.

**Setup:** Rename a package to 120+ characters.

**Steps:**
1. Reopen the list and the editor.

**What to look for:**
- Card truncates the name with ellipsis.
- Editor header truncates with ellipsis.
- Settings still allows you to view and edit the full string.

**Pass example:** Both surfaces truncate, edit works.
**Bug example:** Name overflows the card and breaks the grid.

**Severity if it fails:** P2.

### PKG-EDGE-005 — Stale `sourceId`

**Why this matters:** A curriculum removed from master data after a package was created leaves the package pointing at a ghost ID.

**Setup:** Open DevTools and remove a curriculum from master data (or rename its ID). Pick a curriculum that has a package attached.

**Steps:**
1. Open the affected package.

**What to look for:**
- Source chip falls back to the raw `sourceId` string (not "undefined" or a crash).
- Editor still opens.

**Pass example:** Graceful fallback.
**Bug example:** Header crashes.

**Severity if it fails:** P1.

### PKG-EDGE-006 — Unknown grade in shape

**Why this matters:** Same idea as PKG-EDGE-005, at the grade level.

**Setup:** DevTools: inject `gradeId: "class-99"` into a shape row.

**Steps:**
1. Open the editor.

**What to look for:**
- `getClassName` falls back to a readable label (e.g. `class-99`).
- Class dropdown still renders.

**Pass example:** No crash, label readable.
**Bug example:** "undefined" shown in dropdown.

**Severity if it fails:** P2.

### PKG-EDGE-007 — Long back-navigation chain

**Why this matters:** Authors chain List → editor → composer → back, back, back. The chain must unwind cleanly.

**Setup:** Composer open on a specific chapter's lesson.

**Steps:**
1. Click back (browser button) repeatedly until you reach the list.

**What to look for:**
- Each back lands one step up (composer → chapter detail → list).
- Active grade and subject are preserved when re-entering the editor.

**Pass example:** Clean unwind.
**Bug example:** A step is skipped, or the editor loses its active cell.

**Severity if it fails:** P2.

### PKG-EDGE-008 — Two tabs editing the same package

**Why this matters:** Phase 1 uses an in-memory store; concurrency is informational only.

**Setup:** Open the same `:id` in two browser tabs.

**Steps:**
1. Edit a lesson plan in tab A.
2. Check tab B.

**What to look for:**
- Tab B is not affected (state is per-tab).
- No console errors in either tab.

**Pass example:** Tabs are independent, no errors.
**Bug example:** Console errors about merged state.

**Severity if it fails:** P2 (informational in Phase 1).

### PKG-EDGE-009 — Toggling inclusion while data exists

**Why this matters:** Same as PKG-ATT-001/002 but at scale.

**Setup:** A package with 150 lesson plans across cells (the CBSE Foundation pack hits this with the seed).

**Steps:**
1. Open Settings → uncheck "Lesson Plans" → Save.
2. Browse any chapter — no lesson UI.
3. Reopen Settings → check "Lesson Plans" → Save.

**What to look for:**
- All 150 lesson plans reappear in correct order.

**Pass example:** No data loss.
**Bug example:** Some or all lessons missing on re-enable.

**Severity if it fails:** P0.

### PKG-EDGE-010 — Refresh composer with unsaved changes

**Why this matters:** Browser refresh is a common reflex.

**Setup:** Composer open with an unsaved edit.

**Steps:**
1. Press Cmd/Ctrl + R.

**What to look for:**
- Browser shows the "Leave site?" confirmation, OR the change persisted via autosave.
- Changes are never silently lost.

**Pass example:** Either pattern.
**Bug example:** Refresh discards silently.

**Severity if it fails:** P0.

### PKG-EDGE-011 — Source switch in Settings

**Why this matters:** If switching source is allowed mid-life, every chapter attached to the old source is orphaned.

**Setup:** Settings open on any package.

**Steps:**
1. Try to change the source type from Curriculum to Course (or vice versa).

**What to look for:**
- Either the change is blocked with a clear message ("Source cannot be changed after creation"), OR the change fully resets shape + attachments and warns the user.
- Never produces orphaned data.

**Pass example:** Blocked or fully reset.
**Bug example:** Source changes but chapters from the old source still appear.

**Severity if it fails:** P0.

### PKG-EDGE-012 — Console quiet during a full workflow

**Why this matters:** Console warnings are a leading indicator of latent bugs (missing keys, deprecated APIs).

**Setup:** DevTools → Console open with "Errors" and "Warnings" filters on.

**Steps:**
1. Run a full create → edit → attach → publish flow.

**What to look for:**
- Zero `console.error` calls.
- No React "each child should have a unique key" warnings.
- No "missing prop" warnings.

**Pass example:** Clean console.
**Bug example:** Red errors during navigation or save.

**Severity if it fails:** P1.

---

## PKG-DATA — Mock seed & data integrity (dev-only)

**What this group covers.** Phase 1 uses `mockSeedGenerator.ts` to produce deterministic content. These tests catch regressions in the seed itself. They require basic DevTools comfort — you'll be running small expressions in the Console.

### PKG-DATA-001 — Lesson plan count per cell

**Why this matters:** The seed promises a known shape per cell. Drift here means downstream tests are testing the wrong data.

**Setup:** Open the CBSE Foundation pack.

**Steps:**
1. Navigate to Class 6 → Maths.
2. Count lesson plans across the 5 chapters.

**What to look for:**
- Exactly `chaptersPerCell × lessonsPerChapter` = 5 × 5 = 25 lesson plans.

**Pass example:** 25 lessons.
**Bug example:** 23 lessons.

**Severity if it fails:** P2 (dev only).

### PKG-DATA-002 — Deterministic order across refresh

**Why this matters:** `Math.random()` drift in seed code breaks every other test (see core memory on deterministic mock data).

**Setup:** A cell with multiple lessons. Note the order of lesson IDs (visible in URL when you open each).

**Steps:**
1. Refresh the page (Cmd/Ctrl + R).
2. Re-check the order.

**What to look for:**
- Same IDs in the same order.

**Pass example:** Stable.
**Bug example:** Order shuffles each refresh.

**Severity if it fails:** P2 (dev), but indicates a real bug in seed code.

### PKG-DATA-003 — Attachment IDs are unique

**Why this matters:** Duplicate IDs cause React render bugs and data loss on save.

**Setup:** DevTools → Console.

**Steps:**
1. Run: `import('@/data/packages').then(m => { const a = m.getAttachmentsForPackage('cbse-comprehensive-foundation'); console.log(a.length, new Set(a.map(x => x.id)).size); })`.
2. Compare the two numbers logged.

**What to look for:**
- The two numbers are equal (no duplicates).

**Pass example:** Both numbers match.
**Bug example:** `120 vs 118` (two duplicate IDs).

**Severity if it fails:** P0.

### PKG-DATA-004 — Lesson IDs unique across cells

**Why this matters:** Same as PKG-DATA-003, for lesson plans.

**Setup:** DevTools → Console.

**Steps:**
1. Run: `import('@/data/packages').then(m => { const a = m.getLessonPlansForPackage('cbse-comprehensive-foundation'); console.log(a.length, new Set(a.map(x => x.id)).size); })`.

**What to look for:**
- Both numbers equal.

**Pass example:** Match.
**Bug example:** Mismatch.

**Severity if it fails:** P0.

### PKG-DATA-005 — Grand tests are package-level only

**Why this matters:** A grand test with a chapterId is a schema violation.

**Setup:** DevTools → Console.

**Steps:**
1. Run: `import('@/data/packages').then(m => { const a = m.getAttachmentsForPackage('cbse-comprehensive-foundation').filter(x => x.kind === 'grand-test'); console.log(a.every(x => !x.chapterId)); })`.

**What to look for:**
- Logs `true`.

**Pass example:** `true`.
**Bug example:** `false`.

**Severity if it fails:** P0.

### PKG-DATA-006 — Chapter test coverage matches the seed flag

**Why this matters:** The seed has an `attachChapterTest` flag; the count must match.

**Setup:** DevTools → Console.

**Steps:**
1. Inspect chapter-test attachments per cell vs the seed config.

**What to look for:**
- Exactly one chapter test per chapter per cell when `attachChapterTest=true`; zero when false.

**Pass example:** Counts match.
**Bug example:** Two chapter tests on the same chapter.

**Severity if it fails:** P1.

### PKG-DATA-007 — Archived package excluded from the default count

**Why this matters:** Final cross-check of list totals.

**Setup:** Note total package count in the default view.

**Steps:**
1. Archive one package.
2. Re-check total.

**What to look for:**
- Default total drops by exactly 1.
- Archived view total rises by 1.

**Pass example:** Both deltas equal 1.
**Bug example:** Default drops by 2 (or doesn't drop at all).

**Severity if it fails:** P2.

---

## Known Limitations & Out of Scope

- **SuperAdmin-only in Phase 1.** Packages do not yet propagate to Institute, Teacher or Student portals. Cross-portal scenarios are explicitly out of scope here and will be added when subscription / assignment lands.
- **In-memory store.** Persistence lives in `src/data/packages/helpers.ts` (a JavaScript `let` array). State resets on a full page refresh **for any new packages you author** during a session; the two pre-seeded packages always come back. Plan long edge-case flows around this — re-verify after a planned refresh.
- **No auth-based gating yet.** Anyone with the SuperAdmin route can access. Role-based hiding is out of scope.
- **Backend persistence, multi-user concurrency, audit trail.** Not implemented. Concurrency bugs (PKG-EDGE-008) are informational only.

---

*Last updated: May 2026*
