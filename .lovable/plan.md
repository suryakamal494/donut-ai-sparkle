## What is happening right now

The Copilot currently has three separate ideas that are only partially connected:

1. **Active / Recent / Archived sessions**
   - These are chat threads.
   - Each thread has a routine/tool such as doubt, practice, exam prep, roadmap, or progress.
   - Selecting a thread loads its chat messages.

2. **Quick tools**
   - These are shortcuts to start a new tool-specific thread.
   - Example: Practice starts a practice thread; Study Roadmap starts a roadmap thread.
   - They do not currently show a clear explanation that they create or resume work connected to library items.

3. **Library**
   - These are saved Copilot outputs: concept explainers, study plans, target trackers, formula sheets, reports, etc.
   - Current right pane logic is too restrictive: when a thread is open, it tries to show only that thread’s library items, then also filters by the current tool type.
   - This explains why the Library can look empty even though database items exist.
   - Small practice artifacts are intentionally hidden from the Library because they render inline in chat, which is technically correct but confusing without a separate “resources/library” model.

## Recommended product logic

Use this mental model:

```text
Chat thread = the conversation / continuation path
Quick tools = ways to start or route the conversation
Library = saved outputs and learning resources connected to Copilot
Resource links = content suggestions inside chat messages
```

### Final behavior

- If **no thread is selected**, Library shows the student’s recent cross-Copilot library.
- If a **thread is selected**, the right pane prioritizes items linked to that thread, but still gives access to the wider Library through “View all”.
- If a **subject is selected**, both the right pane and full Library filter consistently by that subject.
- If a chat response mentions useful content, it shows a clickable **resource card** in the chat.
- Clicking a resource card opens the content in a viewer/dialog, not as inline chat clutter.
- The right pane stays lightweight: pinned target + top 10 recent/relevant items only.
- Full-scale browsing/search/filtering happens in a dedicated “View all Library” screen/dialog.

## Implementation plan

### 1. Fix the current empty Library issue

Update the right Library pane filtering so it does not over-filter by routine/tool.

Current problem:
- In an Exam Prep thread, only target/study-plan items appear.
- In a Progress thread, only mastery/progress items appear.
- In a thread with no matching saved outputs, the pane looks empty even if the student has a rich library.

New behavior:
- The right pane shows:
  1. pinned target if it matches the subject filter,
  2. items from the current thread first,
  3. then recent related/all items as fallback,
  4. max 10 visible items.
- Add a small label such as “Current session” and “Recent Library” so students understand why items appear.

### 2. Add “View all Library”

Create a full Library browser from the right pane.

Mobile/tablet-first behavior:
- On desktop: open as a large dialog/sheet from the Library pane.
- On tablet/mobile: open as a full-screen sheet.

The full Library browser will include:
- Search by title/topic/chapter/description.
- Subject filter.
- Type filter: Explainer, Solution, Formula, Practice, Plan, Target, Report, PPT, Video, Animation, PDF, Image.
- Time filter: Today, This week, Last month, All.
- Grouping by Today / This Week / Last Month / Older.
- Enough space for scalability testing.

Right pane will show only 10; full Library shows all matching items.

### 3. Add richer mock Library data

Add scalable mock data for development and QA:

- PPT artifacts/resources with slide preview data.
- Video resources.
- Animation/interactive resources.
- PDF/image resources.
- Existing Copilot-generated artifacts like explainers, study plans, targets, formula sheets, debriefs.

This should be seeded idempotently so mock rows do not keep duplicating.

Proposed content categories:
- Physics: Newton’s Laws PPT, Forces animation, Kinematics video, Projectile motion PDF.
- Chemistry: Acids/Bases animation, Periodic table image, Organic Chemistry PPT.
- Math: Trigonometry PPT, Integration PDF, Probability video.
- Biology: Cell Division animation/video, Photosynthesis visual notes.

### 4. Add content previews for PPT/video/animation inside Copilot

Add a Copilot-specific resource viewer/dialog.

For PPT:
- Show a condensed slide preview on the card.
- Clicking opens a modal with slide navigation: previous/next arrows, slide count, title, and content preview.
- Mock PPTs can be represented as slide JSON for now, so the UI can be polished without needing actual uploaded PPT files.

For video/animation:
- Show thumbnail/card with type badge.
- Clicking opens a modal player/iframe-style preview.
- If no real embed exists, use a clean mock preview state with title, duration, and learning objectives.

For PDF/image:
- Open in the same viewer with a readable preview state.

### 5. Add resource cards inside chat

When a relevant artifact/resource exists, the assistant message should show a clickable card beneath the chat bubble.

Example:
```text
Recommended resource
[PPT] Newton’s Laws: Action-Reaction Pairs
Open preview
```

Clicking opens the Copilot resource viewer, not the inline chat body.

Implementation options:
- Short term: detect resource references from artifact metadata/mock data and render cards under matching assistant messages.
- Better long term: store `resource_refs` in artifact/message metadata when the Copilot creates or recommends resources.

### 6. Make the relationship clear in the UI

Add small explanatory copy and labels:

- Quick tools: “Start focused work. Copilot will save useful outputs to Library.”
- Active sessions: “Continue conversations and plans.”
- Library: “Saved outputs and learning resources from Copilot.”
- Full Library: “Browse everything Copilot created or recommended.”

This will make the product logic understandable to school users.

## Recommended architecture

```text
student_copilot_threads
  owns conversation/session continuity

student_copilot_artifacts
  owns Copilot-generated outputs
  linked by thread_id, subject, type, created_at

Copilot resource model, initially mock/client-side
  owns PPT/video/PDF/animation resources
  linked to subject/chapter/topic/thread/artifact where possible

Chat resource cards
  reference either an artifact_id or resource_id
```

No database migration is required for the first polished mockup. We can implement the resource model client-side using mock data and artifact content metadata, then later promote it to backend tables if needed.

## Files likely to change

- `src/components/student/copilot/StudentArtifactPane.tsx`
  - Fix empty-state/filter logic.
  - Add top-10 right pane and View all entry point.

- `src/components/student/copilot/StudentCopilotPage.tsx`
  - Manage selected resource/library dialog state.
  - Pass resource open handlers to Library and chat.

- `src/components/student/copilot/ChatMessageList.tsx`
  - Render clickable recommended resource cards under assistant messages.

- `src/components/student/copilot/types.ts`
  - Add resource/library item types for PPT/video/PDF/animation/image.

- New Copilot components:
  - `CopilotLibraryDialog.tsx`
  - `CopilotResourceCard.tsx`
  - `CopilotResourceViewer.tsx`
  - `PptMiniPreview.tsx`

- `src/data/student/copilotMockData.ts` or a new `copilotResourceMockData.ts`
  - Add scalable mock resources and library test data.

- `src/components/student/copilot/seedCopilotData.ts`
  - Update mock seeding/versioning only if backend-backed artifact mock data is needed.

## Important recommendation

Do **not** send students to the existing admin/superadmin content library page. That page is for managing content, not consuming Copilot resources. Instead, create a **Copilot Library** browser that borrows preview behavior from the platform content library but is optimized for students.

## Expected result

The Copilot will feel like a coherent workspace:

- Sessions continue the student’s learning conversation.
- Quick tools start focused work.
- Library stores outputs/resources from those conversations.
- Chat can recommend platform content directly.
- The right pane stays clean and fast.
- The full Library handles scale, search, filters, and previews.