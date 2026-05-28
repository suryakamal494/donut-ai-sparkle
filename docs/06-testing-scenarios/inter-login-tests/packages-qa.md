# Packages — Inter-Login QA

> Scenario-driven tests covering the SuperAdmin → Institute → Batch package flow. Narrative style — read each scenario top to bottom, do not treat as a checklist.

---

## Domain glossary (read this first)

- **Package** — SA-authored bundle of lesson plans + optional tests/PYPs, scoped to a curriculum or course and a shape of (grade, subjectIds[]).
- **Shape** — the (grade, subjects) matrix a package covers.
- **Eligibility** — a package is eligible for an institute only if `status === "published"` AND its `sourceId` matches one of the curriculums/courses selected in Step 1 of the assignment dialog.
- **Override** — a per-institute reorder of chapters / lessons / blocks. SA's master order is never touched.
- **Binding** — a `(instituteId, packageId, batchId)` row stored in `institutePackageBatches`.

Severity scheme used (matches existing inter-login QA docs):
- **Blocker** — feature unusable / data corruption.
- **High** — primary UX broken.
- **Medium** — secondary UX broken.
- **Low** — polish.

---

## Section A — SuperAdmin assignment dialog

### A1 · Step 2 lists only matching packages — High

Log in as SuperAdmin. Open Institutes → pick any institute → "Assign Curriculums & Courses". In Step 1, select **only CBSE** under curriculums and **no courses**. Move to Step 2.

Expect: Step 2 lists only packages with `sourceType === "curriculum"` AND `sourceId === "cbse"`, grouped under a "Curriculum · CBSE" header. JEE/NEET course packages must not appear. The empty-state copy renders only when no curriculum/course is selected.

### A2 · Eligibility narrows live as Step 1 changes — Medium

Still in the same dialog, go back to Step 1, add JEE under courses, return to Step 2. The list should now include both the CBSE curriculum group and a "Course · JEE" group. Deselect CBSE in Step 1 → return to Step 2 → only the JEE group remains.

### A3 · Draft packages are never eligible — Blocker

In a separate tab, mark one of the CBSE packages as `draft` via the SA packages page. Reopen the assignment dialog. The drafted package must disappear from Step 2 immediately (no stale list). Re-publish it → it reappears.

### A4 · Save persists assignment — High

Select two packages in Step 2, Save, close the dialog, reopen it for the same institute. Step 2's checkboxes should reflect the previously-saved selection. Deselecting and re-saving must remove the package from the institute (verified in section B).

### A5 · Search filters within Step 2 — Low

Type a package's name fragment in the Step 2 search. Only matching rows survive across groups. Clearing the field restores the full list. Source-name fragments (e.g. "JEE") also match.

---

## Section B — Institute Packages list

### B1 · List reflects SA assignments — Blocker

Switch to the Institute portal (same institute used above). Open "Packages" in the sidebar. Every package selected in A4 should appear as a card with source badge, shape summary, lesson/test counts, and an "Assigned to 0 of N batches" footer (no bindings yet).

### B2 · Unassigned institute shows empty state — Medium

Switch to an institute that has zero packages assigned. The Packages page must show the dashed empty-state card with the "No packages assigned yet" copy. No package card may render.

### B3 · SA assignment changes propagate — High

Back in SA, deselect one of the previously assigned packages in Step 2 → Save. Return to Institute → Packages. The removed package must disappear from the list within the same session. The remaining packages keep their state (reorder + bindings — see C, D).

---

## Section C — Institute reorder

### C1 · Chapter reorder persists in this institute — High

Open any package detail. On the Reorder tab, move a chapter from position 3 to position 1 within (Grade 10, Math). Close and reopen the same package: the new order survives. Open the same package from a different institute (assigned the same package) — the SA order must show, **not** institute 1's override.

### C2 · Lesson reorder is chapter-scoped — Medium

Within a chapter, move lesson L2 above L1. Open another chapter in the same package: its lesson order is untouched.

### C3 · Block reorder is lesson-scoped — Medium

Inside a lesson, move a content block up. Other lessons must keep their original block order.

### C4 · SA master order is immutable from institute view — Blocker

After C1, switch to the SA Packages editor for the same package. The chapter order seen there must be SA's original — no leakage from the institute's override.

### C5 · Reset clears override — High

Use "Reset order" on the (Grade 10, Math) chapter scope. The list snaps back to SA's order. Subsequent renders never re-apply the cleared override.

### C6 · SA item added after override — Medium

SA adds a new chapter (say, Ch99) to the package. Reload the institute's detail page: the institute's override survives for the IDs it knows; Ch99 is appended at the end in SA's order (no crash, no dropped IDs).

### C7 · SA item removed after override — Medium

SA deletes one of the chapters referenced by the institute's override. The institute's detail page must render without that chapter and without errors; remaining override IDs retain their relative order.

---

## Section D — Batch binding

### D1 · Grade rows only for institute batches — High

Open a package whose shape covers grades 9–12. The institute has batches in grades 10 and 11 only. The Batches tab must render rows for grades 10 and 11 only; grades 9 and 12 are not shown (since no batches exist there).

### D2 · Multi-select per grade row — High

On the grade-10 row, toggle two batches on, Save. Reopen: both chips are active. Toggle one off, Save, reopen: only the remaining chip is active.

### D3 · Binding is per (institute, package, batch) — High

Bind package P1 to batch B1. Switch to package P2 (same institute) and bind it to batch B1 as well. `getPackagesForBatch(instituteId, B1)` must return both P1 and P2. No exclusivity is enforced.

### D4 · Card footer count stays in sync — Medium

After D2, return to the Packages list. The card's "Assigned to X of Y batches" footer reflects the new count immediately, where Y = total institute batches across the package's grades.

### D5 · Different institutes are isolated — Blocker

In a second institute (also assigned the same package), the Batches tab must show only that institute's batches and start with zero bindings, regardless of institute 1's bindings.

### D6 · Removing the package clears nothing visually unsafe — Low

If SA removes the package from the institute (per B3), the package card disappears from the list. The bindings still exist in-memory; they become inaccessible from UI but `getPackagesForBatch` no longer returns the now-unassigned package (since `getPackageById` resolves but the institute can no longer reach the binding via the list).

---

## Section E — Cross-cutting

### E1 · Mobile layout 320 px — High

On a 320 px viewport, the institute Packages list collapses to one column. Tabs on the detail page remain reachable (no horizontal scroll). Batch chips wrap with 44 px minimum touch targets.

### E2 · No SA controls leak into institute mode — Blocker

On every reused component (`PackageCard`, `ChapterDetailPane`, etc.), the institute mode must not expose: create/edit/delete chips, publish/archive toolbar buttons, draft-status indicators. Only "View" CTA + reorder + batch controls appear.

### E3 · Sidebar entry is present — Medium

The institute sidebar lists "Packages" under the appropriate section. Clicking it routes to `/institute/packages`. Direct URL to `/institute/packages/<id>` for an assigned package loads the detail page; an unassigned ID gracefully redirects or 404s without crashing.

---

## Out of scope for this QA

- Teacher- and student-facing surfacing of bound packages (separate QA when those panels exist).
- Per-subject conflict resolution when two packages bind to the same batch + subject.
- DB persistence checks.
- Per-grade masking or per-lesson hiding inside a package.