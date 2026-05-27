
## What I understood

You're inside `/superadmin/packages/:id/lesson/new?grade&subject&chapter`. At this point Curriculum → Class → Subject → Chapter are already locked by the URL, so the composer should not behave like the teacher workspace (which builds plans from scratch with 4 block types).

For SuperAdmin Packages the job is **assembly, not authoring**:
- Content already exists in the library (PPTs, PDFs, videos, animations, images).
- A package lesson plan is just an **ordered list of references** to that content, optionally with one or more Quiz blocks attached.
- The picker must be **scoped** to the current chapter — not the whole library — and there must be a tiny "quick add" path so the admin doesn't have to bounce to Content Library, upload, come back.

### Your two points — are they valid?

1. **Remove Homework + Demonstrate, keep only Quiz, drop Explain too; merge everything into one "Add Content" affordance.** ✅ Valid. Inside Packages the distinction between Explain/Demonstrate is teacher-pedagogy and doesn't carry weight for an admin assembling reusable content. One generic "Content" item (typed by what it actually is — PPT / PDF / Video / Animation / Image) + "Quiz" is enough.
2. **Picker should be chapter-scoped, with inline "quick add new content" without leaving the page.** ✅ Valid and correct. Anything else creates friction at scale (180+ lesson plans).

### One suggestion I'd add

Keep the **block model** (`LessonPlanBlock`) as-is in the underlying type, but in the Packages composer collapse the toolbar to **two actions only**:
- **+ Add content** → opens a chapter-scoped sheet
- **+ Add quiz** → opens existing QuizDialog

The sheet has two tabs:
- **Library** — only items where `subject == currentSubject && chapter == currentChapter` (filtered out of `mockContentLibrary`). Multi-select + Add.
- **Quick add** — title + type (PPT/PDF/Video/Animation/Image) + URL/file. Saves to the library tagged with the locked curriculum/subject/chapter, then immediately attaches to the lesson. No navigation away.

This way the admin never has to "create new content" as a separate trip, and the path (CBSE → Math → Knowing Our Numbers) is pre-filled and non-editable in the quick-add form.

---

## Implementation plan

### 1. New chapter-scoped content sheet
`src/components/packages/editor/ChapterContentSheet.tsx`
- Props: `open`, `onOpenChange`, `subjectName`, `chapterName`, `curriculumOrCourse`, `onAttach(items)`.
- Tabs: **Library** | **Quick add**.
- **Library tab**: search + type filter (All / PPT / PDF / Video / Animation / Image), list filtered by `subject` + `chapter` from `mockContentLibrary`. Checkbox multi-select. "Add N items" footer button.
- **Quick add tab**: shows the locked path as a read-only breadcrumb chip (e.g. `CBSE › Mathematics › Class 6 › Knowing Our Numbers`). Fields: Title, Type (segmented), URL (or "paste link / upload" — for now URL field is fine since everything is mock). Submit → pushes a new ContentItem into the in-memory library and attaches.

### 2. New helper for chapter-scoped library
`src/data/contentLibraryHelpers.ts` (new)
- `getContentForChapter(subjectName, chapterName)` — returns filtered items.
- `addContentToLibrary(item)` — mutates the in-memory array (consistent with how other mock stores work).

### 3. Simplified composer toolbar (Packages only)
Create `src/components/packages/editor/PackageWorkspaceToolbar.tsx` — do **not** reuse `WorkspaceToolbar` (which has 4 block types and AI assist tied to teacher flows).
- Two big primary buttons: **+ Add content** and **+ Add quiz**.
- Removes Explain / Demonstrate / Homework / AI Assist.

### 4. Update `PackageLessonComposer.tsx`
- Replace `<WorkspaceToolbar … />` with `<PackageWorkspaceToolbar … />`.
- Wire **Add content** → opens new `ChapterContentSheet`. On attach, each picked/created item becomes one block of type `explain` under the hood (kept for type compatibility) but rendered generically — `title`, `attachmentUrl`/`embedUrl`, `linkType` derived from item type.
- Wire **Add quiz** → existing `QuizDialog` flow (already in `lesson-workspace`).
- Remove AI dialog wiring; keep header (breadcrumb + title + Save) and canvas as-is.
- Keep block reordering, delete, and add-between (between-block + menu shows only the two options).

### 5. Update `WorkspaceCanvas` "add between" menu (Packages-only path)
Two options: Add content / Add quiz. Easiest path: pass a `mode="packages"` prop to `WorkspaceCanvas` to restrict the menu — small, scoped change, doesn't affect teacher flow.

### 6. Block rendering
`WorkspaceBlock` already renders attachments/links/quizzes generically based on `attachmentUrl`/`embedUrl`/`questions`, so no changes needed there.

---

## Technical notes

- No schema changes. `LessonPlanBlock.type` stays as `'explain' | 'demonstrate' | 'quiz' | 'homework'` because teacher workspace still uses all four; the Packages composer just never produces `demonstrate`/`homework` and tags every library/quick-add item as `explain` with `source: 'library'`.
- `mockContentLibrary` is mutated in-memory; no Supabase work in this phase.
- The Packages composer becomes a true *assembly* surface; teacher lesson workspace is untouched.
- File touch list: 1 new sheet, 1 new helpers file, 1 new toolbar, edits to `PackageLessonComposer.tsx` and `WorkspaceCanvas.tsx`.

---

## Open question

For **Quick add**, do you want a real file-upload affordance now (we'd stub it as a fake URL), or is a single "URL / link" field enough for mock parity? My recommendation: URL field only for now — matches how the rest of the mock content layer works and keeps the sheet light.
