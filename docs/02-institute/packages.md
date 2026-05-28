# Packages (Institute View)

> Lesson packages assigned by the SuperAdmin, reorganised locally by the institute and bound to its batches.

---

## What a package is

A **package** is a SuperAdmin-authored bundle of lesson plans plus optional chapter tests, grand tests, and previous year papers, scoped to either a curriculum (e.g. CBSE) or a course (e.g. JEE) and a chosen set of grades + subjects (the package's "shape").

The institute neither creates nor edits the package contents. Its job is to (1) preview, (2) optionally reorder for local teaching flow, and (3) decide which of its batches consume it.

---

## Visibility model

```text
SuperAdmin                Institute                       Batch
──────────                ─────────                       ─────
Authors Package P     →   P appears in Packages list  →   Institute toggles
(status = published)      when SA assigns it via          batches per grade.
                          "Assign Curriculums &           Bound batches gain
                          Courses → Step 2 Packages".     access (student/teacher
                                                          surfacing is a later phase).
```

Rules:
- Only `published` packages whose `sourceType` + `sourceId` match the institute's assigned curriculum/course list are eligible for assignment.
- The whole package goes — no per-grade or per-lesson masking. An institute that only teaches grades 11–12 simply ignores other grades on the package.
- A package may be assigned to many institutes; each institute holds its own reorder + batch-binding state.

---

## Routes

| Page | Route |
|------|-------|
| Packages list | `/institute/packages` |
| Package detail | `/institute/packages/:packageId` |

The detail page has three tabs:
- **Content** — read-only preview of chapters, lessons, and content blocks (reuses the SA editor in `mode="institute"`).
- **Reorder** — local drag/move controls (see below).
- **Batches** — assign the package to one or more batches per grade.

---

## Reorder semantics

The institute can reorder three scopes independently:

| Scope | Key |
|-------|-----|
| Chapters within a (grade, subject) | `${instituteId}::${packageId}::ch::${gradeId}::${subjectId}` |
| Lessons within a chapter | `${instituteId}::${packageId}::lp::${gradeId}::${subjectId}::${chapterId}` |
| Blocks within a lesson | `${instituteId}::${packageId}::bk::${lessonId}` |

Read precedence at render time:
1. Institute override (if set)
2. SA's `order` field
3. Array index fallback

If SA later adds or removes items, the override gracefully tolerates the change — known IDs follow the override, new IDs are appended in SA's order. A per-scope **Reset** action clears the override and falls back to SA's order.

**SA's master order is never mutated by an institute action.**

---

## Batch assignment (per package)

Lives inside the package detail page, "Batches" tab. The institute picks any subset of its batches per grade row that the package covers:

```text
Package: JEE Foundation 2025  (Class 9–12)

Class 9
  ☐ Batch A — Morning      ☐ Batch B — Evening
Class 10
  ☑ Batch C — Foundation A  ☑ Batch D — Foundation B
Class 11
  ☑ Batch E — Advanced      ☐ Batch F — Drop-out
Class 12
  ☐ Batch G — Repeaters
```

- Grade rows with no batches in the institute are skipped.
- A batch can be bound to multiple packages (different subjects covered by different packages). No exclusivity is enforced in this build; per-subject conflict resolution is deferred.
- The list card shows an "Assigned to X of Y batches" footer fed from the same store, so list and detail stay in sync.

---

## Data layer

| Store | File | Purpose |
|-------|------|---------|
| `institutePackages` | `src/data/institute/institutePackages.ts` | SA → institute assignment set |
| `institutePackageOrders` | `src/data/institute/institutePackageOrders.ts` | Local reorder overrides |
| `institutePackageBatches` | `src/data/institute/institutePackageBatches.ts` | Package → batch bindings |
| `getEligiblePackagesForAssignment` | `src/data/packages/helpers.ts` | Filters published packages by curriculum/course |

All three stores are in-memory mocks; DB persistence is a later phase.

---

## Out of scope (this build)

- Teacher- and student-facing surfacing of bound packages.
- Per-subject conflict resolution when two packages cover the same batch + subject.
- Per-grade or per-lesson masking inside a package.
- Hiding individual lessons or content blocks (only reorder).
- DB persistence.

---

## Related

- [SA → Institute → Batch package flow](../05-cross-login-flows/package-flow.md)
- [Inter-Login Tests — Packages QA](../06-testing-scenarios/inter-login-tests/packages-qa.md)