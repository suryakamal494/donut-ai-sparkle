## Goal

Three focused UX fixes on the institute package detail page:

1. Auto-collapse the institute sidebar when a package is opened (mirror SuperAdmin behavior).
2. Replace up/down arrow reorder with real drag-and-drop using `@dnd-kit` (already installed).
3. Remove the standalone "Reorder" tab. Drag-reorder lives **inline inside the Content view** — chapters drag in the Chapter Index rail, lesson plans drag inside the chapter's lesson list.

---

## 1. Sidebar auto-collapse on package detail

**File:** `src/components/layout/InstituteLayout.tsx`

Mirror the pattern already used by `AdminLayout.tsx`:

```ts
const inPackageDetail = /^\/institute\/packages\/[^/]+/.test(location.pathname);
const [sidebarCollapsed, setSidebarCollapsed] = useState(inPackageDetail);
useEffect(() => { setSidebarCollapsed(inPackageDetail); }, [inPackageDetail]);
```

User can still toggle the chevron manually after auto-collapse.

---

## 2. Drag-and-drop chapter reorder in the Chapter Index (Content tab)

**Files:** `src/components/packages/editor/ChapterRail.tsx`, `src/pages/institute/packages/InstitutePackageDetail.tsx`

- Extend `ChapterRail` with optional props: `reorderable?: boolean`, `onReorder?: (orderedIds: string[]) => void`, `onResetOrder?: () => void`, `isCustomOrdered?: boolean`.
- When `reorderable`, wrap the list in `@dnd-kit` `DndContext` + `SortableContext` (vertical). Each chapter row gets a small `GripVertical` drag handle (visible on hover, always visible on touch) on the left.
- Default (`reorderable=false`) keeps existing SuperAdmin/teacher behavior untouched.
- Show a subtle "Custom order · Reset" link at the rail top when `isCustomOrdered` is true.

In `InstitutePackageDetail.tsx`:
- Pass `reorderable`, `isCustomOrdered`, `onReorder`, `onResetOrder` into `ChapterRail`.
- `onReorder(ids)` → `setOrder(institute, pkg, {kind:'chapter', gradeId, subjectId}, ids)`.

---

## 3. Drag-and-drop lesson reorder inside the chapter pane

**File:** `src/components/packages/editor/ChapterDetailPane.tsx`

- Add optional props: `lessonReorderable?: boolean`, `onLessonReorder?: (orderedIds: string[]) => void`, `onResetLessonOrder?: () => void`, `isLessonCustomOrdered?: boolean`.
- When enabled, the "Lesson plans" `<ul>` becomes a `DndContext`/`SortableContext`. Each lesson row gets a `GripVertical` handle on the left of the existing number badge. Clicking the row body still navigates to the lesson (drag handle has its own listener).
- "Reset lesson order" appears next to the "Lesson plans" section title only when there's an override.
- All other modes (SA, read-only without reorder) unchanged.

In `InstitutePackageDetail.tsx`, wire the same handlers using `setOrder/clearOrder` with the `lesson` scope keyed by `chapterId`.

---

## 4. Remove the Reorder tab

**File:** `src/pages/institute/packages/InstitutePackageDetail.tsx`

- Drop the `TabsTrigger value="reorder"` and `TabsContent value="reorder"` blocks entirely.
- `tab` state becomes `"content" | "batches"`; default `"content"`.
- Header sub-line "Reorder for this institute only · SuperAdmin order untouched" moves into a small one-liner under the Chapter Index title in the rail.
- Remove the now-unused `moveChapter` / `moveLesson` / `ArrowUp`/`ArrowDown` imports.

---

## 5. Docs touch-up

- `docs/02-institute/packages.md` — update the "Reorder semantics" section: reorder is inline in Content (drag handles on chapter rail and lesson list); no separate tab. Block-level reorder still occurs inside SA lesson composer (out of scope for institute in this build — same as today).
- `docs/05-cross-login-flows/package-flow.md` — change Stage 2 wording from "Reorder tab" to "drag handles in Content view".
- `docs/06-testing-scenarios/inter-login-tests/packages-qa.md` — update reorder QA steps to drag-and-drop on the Content tab.

---

## Out of scope (unchanged)

- Block-level reorder inside lesson plans for institute (still SA-only).
- Teacher/student surfacing.
- Batch assignment tab — no changes.
- Mobile chapter rail is currently `hidden md:block`; this build keeps that behavior. Drag works on touch via dnd-kit's `TouchSensor` when the rail is visible (tablet+).

---

## Technical notes

- Library: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (all already in `package.json`).
- Sensors: `PointerSensor` (activation distance 5px so simple clicks on chapter rows still select), `TouchSensor`, `KeyboardSensor` with `sortableKeyboardCoordinates` for accessibility.
- Drag handle is a separate element with `{...listeners}` so the row's click-to-select / click-to-open still works.
- Existing `applyOrder` / `setOrder` / `clearOrder` / store keys stay identical — only the UI affordance changes.
