
## Goal

Right now both seeded packages are essentially empty (`mockPackageLessonPlans = []`, `mockPackageAttachments = []`). Every chapter accordion shows "Nothing added yet", so we cannot judge whether the editor handles real volume — 5+ chapters, 4–5 lesson plans each, chapter tests, PYPs, grand tests. This plan seeds rich, repeated mock data, then audits what the UI does at that volume and lists the fixes worth making.

## 1. Mock data — what we seed

We add two fully-populated packages. Content is intentionally repeated (same PPT/PDF/video URLs reused across blocks) — the point is volume, not uniqueness.

### Package A — "CBSE Foundation Pack" (curriculum: cbse)
- **Shape**: Class 6 + Class 7, subjects Mathematics, Science, English, Social Science (4 subjects × 2 grades = 8 grade-subject cells).
- **Inclusions**: chapterTests ✅, grandTests ✅, PYPs ❌.
- **Depth per cell**:
  - Pick first **5 chapters** per (grade, subject) from `allCBSEChapters` (Math chapters already exist; Science/English/SST will use whatever exists in `cbseMasterData`; if a subject has < 5 chapters we just take what's there — no new master data is invented).
  - Each chapter gets **4–5 lesson plans** (e.g. "Introduction", "Core Concepts", "Worked Examples", "Practice", "Recap").
  - Each lesson plan has **6–10 blocks** mixing all four block types (`explain`, `demonstrate`, `quiz`, `homework`) with repeating dummy YouTube/Google Slides/PDF URLs.
  - Each chapter gets **1 chapter-test attachment** (reusing existing `teacherExams` ids in round-robin).
- **Grand tests**: 3 package-level grand tests.
- **Expected totals**: ~8 cells × 5 chapters × 4.5 lessons ≈ **180 lesson plans**, ~40 chapter tests, 3 grand tests.

### Package B — "JEE Mains Accelerator" (course: jee-mains)
- **Shape**: Class 11 + Class 12, subjects Physics, Chemistry, Mathematics.
- **Inclusions**: chapterTests ✅, grandTests ✅, PYPs ✅.
- **Depth per cell**: 5 chapters, **5 lesson plans** each (slightly heavier — competitive prep), 8–12 blocks per lesson, heavier on `demonstrate` (solved problems) and `quiz` blocks.
- **Per chapter**: 1 chapter test + 1 PYP attachment.
- **Grand tests**: 5 package-level mock tests ("Full Mock 1" … "Full Mock 5").
- **Expected totals**: 6 cells × 5 chapters × 5 lessons = **150 lesson plans**, 30 chapter tests, 30 PYPs, 5 grand tests.

### Implementation
- New file: `src/data/packages/mockSeedGenerator.ts` — pure functions that build `PackageLessonPlan[]` and `PackageAttachment[]` from a config (grade, subject, chapters list, lessons-per-chapter, blocks-per-lesson). Deterministic ids (`pkg-{packageId}-lp-{gradeId}-{subjectId}-{chapterId}-{n}`), deterministic order. No `Math.random` — use index-driven cycling so re-renders stay stable (per project memory rule on data stability).
- Update `src/data/packages/mockPackages.ts`:
  - Replace the two existing demo packages with Package A & B above (keep the third "Physics Accelerator" or remove — TBD: remove to avoid duplicate JEE pack).
  - Populate `mockPackageLessonPlans` and `mockPackageAttachments` via the generator at module load.
- Reuse `teacherExams` for attachment `examId`s (round-robin) so the editor's name lookup keeps working.
- Block content reuses a small URL pool:
  - PPT: 1 Google Slides URL repeated
  - PDF: 1 PDF URL repeated
  - Video: 2 YouTube URLs repeated
  - Quiz: text-only block with sample question text
  - Homework: text-only

No new master data is created — we only consume `allCBSEChapters`, `courseOwnedChapters`, and existing `teacherExams`.

## 2. UI audit — what we expect to break and what we'll fix

Once seeded, here is what the current editor will likely struggle with. We confirm each by loading the seeded packages, then fix in this same pass:

| Surface | Likely issue at scale | Proposed fix |
|---|---|---|
| `Packages.tsx` list card | `summarizeCounts` returns raw lessons + tests numbers; with 180 lessons the card looks fine but no breakdown | Show "180 lessons · 40 tests · 3 grand · 0 PYPs" small line |
| `ChapterAccordion` (open chapter with 5 lessons + 1 test) | Fine for 5, but if all chapters were opened it'd be a long page | Keep single-open behavior (already correct); add "Expand all / Collapse all" toggle |
| Chapter row | Only shows `lessons.length` and `attachments.length` icons | Add a small chip showing block count total (`Σ blocks`) so the density is visible |
| Lesson row inside accordion | Shows "X blocks" — but with 10 blocks the lesson title can be cramped on narrow viewports (we're at 1046px so fine; on tablet it will wrap) | Move block count to a chip on second line under 640px |
| `GrandTestsSection` | Renders a flat `<ul>`; 5 items ok, but no grouping by subject/grade | Group grand tests by subject when > 3 items |
| `AttachTestSheet` | Lists all `teacherExams` filtered by subject; ours are ~10 so fine | No change |
| `SubjectTabs` (Package A has 4 subjects per grade) | Currently horizontal tabs — at 320px width 4 subject names overflow | Add horizontal scroll-snap + chevron affordance |
| `GradeSwitcher` (2 grades only) | Fine | No change |
| `PackageEditor` header | Title + status + Settings + Publish — at 360px the publish label collapses to icon already; status pill hidden under `sm` | Keep as-is |
| Performance | All helpers do array `filter` on every render; with 180 lessons × 5 re-renders this is still trivial | Defer — no change now |

We will **not** rebuild any flows, only the small affordances above. If the audit surfaces something worse than expected we'll flag it before changing more.

## 3. Deliverables

1. `src/data/packages/mockSeedGenerator.ts` — generator helpers (new).
2. `src/data/packages/mockPackages.ts` — rewritten with the two rich packages and seeded arrays.
3. `src/components/packages/PackageCard.tsx` — richer count line.
4. `src/components/packages/editor/ChapterAccordion.tsx` — block-count chip + "Expand all / Collapse all" toggle (toggle lives in `PackageEditor` toolbar).
5. `src/components/packages/editor/SubjectTabs.tsx` — horizontal scroll-snap on narrow widths.
6. `src/pages/packages/PackageEditor.tsx` — wire the expand/collapse toggle; group grand tests by subject when > 3.

No backend, no route changes, no new pages. No changes to lesson composer, settings sheet, or attach-test sheet behavior.

## 4. Open questions before I build

1. **Third existing package** (`jee-mains-physics-accelerator`) — keep it as a small "skinny" example, or remove since Package B covers JEE Mains more deeply?
2. **Lesson plans per chapter** — confirm 4–5 (CBSE) / 5 (JEE) is the right target, or go denser (e.g. 8) to truly stress the accordion?
3. **Should Package A also include PYPs** so we can see the PYP attachment UI populated, even though CBSE foundation doesn't usually carry PYPs?
