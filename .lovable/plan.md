# Lesson Packages — SuperAdmin Phased Implementation Plan

Six small phases. Each phase is independently demoable and leaves the app in a working state. UI quality is treated as a first-class deliverable in every phase — not deferred to a "polish" phase at the end.

---

## UI principles applied to every phase

These are non-negotiable while building each screen:

- **No forced scroll, no forced compactness.** Use proportionate space: header chrome stays around **15–20%** of viewport height, primary content gets the rest. Cards size to content, not to fill.
- **Vertical scroll only inside designated regions** (e.g. chapter list, lesson list) — never the whole page bouncing.
- **No horizontal scroll**, ever. Wide content uses tabs, accordions, or column collapse at `lg` / `md` breakpoints.
- **Density by zone**: chrome (header/tabs/toolbar) = tight; canvas (editor/wizard body) = breathing room.
- **Mobile-first audit at 320px** after each phase — even though SuperAdmin is desktop-led, the layout must not break.
- **Reuse the Sophisticated Warmth tokens** from `index.css`. No raw colors.
- **Plus Jakarta Sans**, 44px+ touch targets, semantic shadcn components only.

---

## Phase 1 — Foundation (data + routing + empty shell)

**Goal:** "Packages" appears in the SuperAdmin sidebar and opens to a clean empty state. Nothing else.

Scope:

- `src/types/packages.ts` — `Package`, `PackageLessonPlan`, `PackageAttachment` types.
- `src/data/packages/` — `mockPackages.ts` with 2–3 seed packages, `helpers.ts` (getters/setters in-memory).
- Route registration in `SuperAdminRoutes.tsx`:
  - `/superadmin/packages` → list page (empty state for now)
  - `/superadmin/packages/new` → wizard placeholder
  - `/superadmin/packages/:id` → editor placeholder
- Sidebar entry in `Sidebar.tsx` with `Package` icon (lucide), placed under "Master Data".

UI deliverables:

- Empty state page with a centered illustration block, one-line value prop, single `[+ Create your first package]` CTA. No filters, no chrome bloat.
- Page header is a thin breadcrumb + title row (~64px), not a hero.

**Demo bar:** Click sidebar → land on Packages → see empty state → buttons route correctly.

---

## Phase 2 — List view (two-pane browser)

**Goal:** Browse existing packages by curriculum/course source.

Scope:

- `PackageSourceTree.tsx` (left pane, ~260px): collapsible tree, two roots — Curriculums, Courses. Counts on the right.
- `PackageCard.tsx` (right pane): one card per package showing name, source chip, shape summary (`2 grades · 4 subjects`), counts (`28 lessons · 8 tests`), status pill.
- Right pane uses `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3` so cards fill width without horizontal scroll and without becoming oversized at xl.

UI guardrails:

- Cards: **~180px tall**, not 300+. Information-dense without feeling cramped.
- Left tree collapses to icons below `md`; on mobile becomes a top dropdown selector.
- The `[+ New Package]` CTA is a **floating action button** at bottom-right on mobile, top-right in desktop header — never duplicated.

**Demo bar:** Pick "CBSE" in the tree → only CBSE packages show on the right → click a card → routes to editor (still placeholder).

---

## Phase 3 — Create wizard (3 steps)

**Goal:** Admin can create a package end-to-end and land in the (still-empty) editor.

Scope:

- `CreatePackage.tsx` orchestrator with a slim step indicator (~56px tall, dots + labels, no giant stepper bar).
- `StepIdentity.tsx` — name, description, source-type radio, source picker.
- `StepShape.tsx` — grades multi-select; for each picked grade, inline subjects multi-select shown as a chip row. One row per grade keeps it scannable without scroll for up to ~6 grades.
- `StepInclusions.tsx` — three toggle cards (Chapter Tests / Grand Tests / PYPs), each with one-sentence helper text.

UI guardrails:

- Wizard is **a centered column max-w-2xl** so form fields don't sprawl on widescreen.
- "Next" stays sticky at the bottom of the viewport on mobile; inline on desktop.
- No step lets the form exceed viewport height for the common case (≤ 6 grades); only Step 2 may scroll inside its grade list region if many grades selected.

**Demo bar:** Run the wizard → finish → land in editor with the chosen shape persisted in mock data.

---

## Phase 4 — Editor shell (browse-only, no composer yet)

**Goal:** The grade/subject/chapter browser that becomes the daily workhorse, read-only.

Scope:

- `PackageEditor.tsx` shell:
  - **Top bar** (~56px): package name, status pill, `[Settings]` `[Publish]` buttons.
  - **Grade switcher** (~48px): pill row of grades from the package shape.
  - **Subject tabs** (~44px): horizontal scroll-snap row only if subjects > 5, otherwise even spread.
  - **Chapter accordion** (the canvas): chapters from master data scoped to active `Curriculum/Course × Grade × Subject`. Each chapter row shows lesson count + test count. Expanded body shows placeholder rows for lessons / attachments with "+ Add lesson plan" / "+ Attach test" buttons (disabled this phase).

UI guardrails:

- Three header strips together stay **under 160px** total so the chapter canvas owns ≥ 75% of the viewport.
- Accordion bodies expand inline; only the chapter list region scrolls vertically when content overflows.
- At `< md`, grade switcher becomes a select; subject tabs stay (they're the primary navigation).

**Demo bar:** Switch grade → switch subject → expand a chapter → see its (empty) lesson slots.

---

## Phase 5 — Lesson composer + attach pickers (the heavy phase)

**Goal:** Actually add lesson plans and attach tests. This is where the package becomes useful.

Scope split into two sub-deliverables so the phase stays demoable mid-way:

**5a — Attach pickers (lighter, ship first):**
- `AttachTestSheet.tsx` — right-side sheet listing existing exams from the Exam module, filtered to active subject. Search + type filter (Chapter Test / Grand Test / PYP). Multi-select with `[Attach N]` action.
- Wire "+ Attach test" / "+ Attach grand test" / "+ Attach PYP" buttons.
- Show attached items in the chapter accordion with a `⋯` menu (Remove, Reorder).

**5b — Lesson composer (the big one):**
- `PackageLessonComposer.tsx` — thin wrapper at `/superadmin/packages/:id/lesson/:lpId` that mounts the existing teacher workspace (`WorkspaceCanvas`, `BlockDialog`, `ContentLibrarySheet`, `QuestionBankSheet`, `HomeworkBlockDialog`, `AIAssistDialog`) in a new `mode: 'package'` configuration.
- Context bar shows `Package › Grade › Subject › Chapter` instead of `Batch › Date`.
- Strip out batch-only affordances (Start Class, scheduled date).
- Save writes to `PackageLessonPlan` in mock data.
- Add `dnd-kit` sortable on lessons within a chapter and chapters within a subject.

UI guardrails:

- The composer reuses the existing teacher workspace layout untouched — no re-skinning, no shrinking. Consistency across roles is more valuable than custom chrome here.
- Sheet pickers cap at **560px width on desktop**, full-width on mobile, with the action bar pinned to the bottom so the list region is the only scroll zone.

**Demo bar (5a):** Attach a chapter test, a grand test, and a PYP. **Demo bar (5b):** Create a lesson with explain/quiz/homework blocks, reorder lessons, save and reopen.

---

## Phase 6 — Settings, publish, archive

**Goal:** Lifecycle controls — close out the SuperAdmin scope.

Scope:

- `PackageSettings.tsx` side sheet from `[Settings]` button:
  - Rename, description edit
  - Add/remove grades (guard: confirmation if lessons exist under it)
  - Add/remove subjects per grade (same guard)
  - Toggle Chapter Tests / Grand Tests / PYP inclusion
  - Archive (soft) — moves out of default list view
- Publish flow:
  - `[Publish]` button disabled until ≥ 1 lesson plan exists; tooltip explains why.
  - On publish: confirmation dialog, status flips to `Published`.
- List view gets a `[Show archived]` toggle and a `Status: Draft / Published / All` segmented control in the header (kept thin — ~40px row).

UI guardrails:

- Settings sheet is **single-column**, sections separated by labeled dividers — not nested tabs. Nesting tabs in a sheet creates the cramped feel you flagged.
- Destructive actions (archive, remove grade) use the destructive button variant + confirm dialog.

**Demo bar:** Open settings → toggle inclusions, archive a package, publish another → confirm it surfaces under the new filters.

---

## Phase summary table

```text
Phase  Name                          Approx. effort   Demoable result
1      Foundation                    Small            Sidebar entry + empty Packages page
2      List view                     Small-Medium     Two-pane browse of seed packages
3      Create wizard                 Medium           End-to-end package creation
4      Editor shell (read-only)      Medium           Grade/subject/chapter browser
5a     Attach pickers                Small            Tests/grand tests attached
5b     Lesson composer (reuse)       Large            Full lesson authoring inside packages
6      Settings, publish, archive    Small-Medium     Lifecycle complete
```

After Phase 6, SuperAdmin is feature-complete and we can move to the Institute panel (out of scope here).

---

## What stays out across all phases

- Institute / Teacher / Student panel surfaces.
- Custom-course auto-assembled virtual packages.
- Versioning, diffs, change notifications.
- Supabase persistence (mock-only this scope).
- Bulk operations (bulk duplicate packages, bulk reassign lessons).

---

**Confirm phase ordering or call out anything you'd resequence, and I'll start Phase 1.**
