# Package Flow — Cross-Login

> How SuperAdmin-authored packages reach an institute, get reorganised locally, and bind to batches.

---

## Flow Diagram

```text
┌──────────────────────────────────────────────────────────────────────┐
│                          PACKAGE FLOW                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  SUPERADMIN                                                           │
│  ──────────                                                           │
│  1. Authors Package P (status: draft → published)                     │
│     - sourceType: curriculum | course                                 │
│     - shape: [{ gradeId, subjectIds[] }, ...]                         │
│     - inclusions: lessonPlans / chapterTests / grandTests / PYPs      │
│                                                                       │
│  2. Institutes → Assign Curriculums & Courses dialog                  │
│     Step 1: pick curriculums + courses                                │
│     Step 2: pick eligible packages (sourceId matches Step 1)          │
│     Save → assignPackagesToInstitute(instituteId, [packageIds])       │
│                                    │                                  │
│                                    ▼                                  │
│  INSTITUTE                                                            │
│  ─────────                                                            │
│  3. /institute/packages → list of assigned packages                   │
│     (card shows source, shape summary, lesson/test counts,            │
│      "Assigned to X of Y batches")                                    │
│                                                                       │
│  4. Open detail → two tabs                                            │
│     • Content — read-only preview + INLINE drag-to-reorder            │
│       (grip handle on chapter rail rows and lesson rows;              │
│        override saved to institutePackageOrders; SA untouched)        │
│     • Batches — toggle batches per grade row                          │
│       Save → setBatchesForPackage(...)                                │
│                                    │                                  │
│                                    ▼                                  │
│  BATCH (binding stored)                                               │
│  ──────                                                               │
│  5. getPackagesForBatch(instituteId, batchId) returns bound packages. │
│     Contract that future teacher/student panels will read from.       │
│                                                                       │
│  TEACHER / STUDENT (future)                                           │
│  ─────────────────────────                                            │
│  6. Out of scope this build — surfacing UI to come later.             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Stage-by-stage contract

### Stage 1 — SA assigns

| Input | Source | Result |
|-------|--------|--------|
| `instituteId` | SA institutes page | — |
| `curriculumIds` + `courseIds` | Step 1 of dialog | — |
| `packageIds` | Step 2 of dialog (filtered by `getEligiblePackagesForAssignment`) | `assignments[instituteId] = Set(packageIds)` |

Only `status === "published"` packages whose `sourceId` is in the Step 1 selection are eligible.

### Stage 2 — Institute reorganises

| Action | Store updated | SA impact |
|--------|---------------|-----------|
| Move chapter within (grade, subject) | `institutePackageOrders` (`ch` scope) | None |
| Move lesson within chapter | `institutePackageOrders` (`lp` scope) | None |
| Move block within lesson | `institutePackageOrders` (`bk` scope) | None |
| Reset scope | Override cleared | Falls back to SA order |

Read precedence: institute override → SA `order` → array index.

### Stage 3 — Institute binds to batches

| Action | Store | Notes |
|--------|-------|-------|
| Toggle a batch chip | `institutePackageBatches` | One package may bind to N batches; one batch may receive N packages |
| Save | `setBatchesForPackage(instituteId, packageId, batchIds[])` | No exclusivity enforced this build |

`countBoundBatches(instituteId, packageId)` powers the list-card footer.

### Stage 4 — Downstream read (future)

`getPackagesForBatch(instituteId, batchId): Package[]` is the contract teacher and student modules will consume in a later phase. It is already correct from this build's bindings.

---

## Mutation guarantees

| Layer | Mutates SA data? | Mutates other institutes? |
|-------|------------------|--------------------------|
| Step 2 assignment | No | No |
| Institute reorder | No | No |
| Batch binding | No | No |

Every per-institute action is scoped by `instituteId` in the store key.

---

## Out of scope (explicit)

- Teacher- and student-facing rendering of bound packages.
- Per-subject conflict resolution across multiple packages for the same batch.
- Per-grade masking inside a package.
- Hiding lessons/blocks (reorder only).
- DB persistence.

---

## Related

- [Institute → Packages](../02-institute/packages.md)
- [Curriculum & Course Flow](./curriculum-course-flow.md)
- [Inter-Login Tests — Packages QA](../06-testing-scenarios/inter-login-tests/packages-qa.md)