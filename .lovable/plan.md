Here is what I understood and the best implementation path.

Current issue:
- The Library is just a list of generated study materials.
- The exam target exists as a `target_tracker` library item, but it is not pinned globally.
- Study plans are separate `study_plan` items, so the target, weekly plan, and continuation thread are not strongly connected in the UI.
- Active sessions are inflated. I checked the backend: there are currently more active threads than the screenshot shows, including empty “New chat” rows, old duplicate roadmap threads, and older mock/demo threads. That is why the sidebar looks noisy.

Recommended model:

```text
Pinned Target
  -> linked target thread
  -> linked target_tracker library item
  -> linked weekly study_plan library item(s)
  -> pending task opens same continuation thread
```

So the target becomes the permanent “exam home”, and weekly plans become children of that target instead of unrelated charts.

Plan:

1. Add a pinned target card at the top of Library
- Show the highest-priority active `target_tracker` item above the normal Library list.
- Use school-friendly language like:
  - “Pinned Target”
  - “JEE Main — Target 250”
  - “180 → 250”
- Keep it visible even when the Library is filtered by routine, as long as it matches the selected subject or is an all-subject exam target.
- Match the compact visual direction from your reference screenshot.

2. Make clicking the pinned target resume its continuation thread
- If the target tracker has `thread_id`, clicking the pinned card will switch the active chat to that thread and load its messages.
- This avoids creating a new chat.
- If the target’s thread is missing, the fallback will be to open the target tracker detail in Library, not create a duplicate.

3. Link target trackers and weekly plans through metadata
- Use the existing thread and artifact structure first, without overbuilding a new workflow.
- For targets:
  - thread tool: `exam`
  - scope key: `exam:<exam-id>`
  - artifact type: `target_tracker`
- For weekly plans generated from that target:
  - thread tool: `plan`
  - scope key should include the exam id and week, e.g. `plan:exam:<exam-id>:<week>`
  - artifact content should include `parent_target_thread_id`, `parent_target_artifact_id`, and `exam_id`.
- This allows Library to show: target first, then related weekly plans underneath or in normal chronological order.

4. When a student starts a pending task, continue the correct thread
- For a study plan task, if the plan has a parent target thread, send the task into that thread or the plan’s own linked thread depending on intent:
  - “Start today’s plan/task” continues the plan thread.
  - Clicking the pinned target continues the target thread.
- This keeps the student’s journey connected and prevents “New Study roadmap chat” duplicates.

5. Clean up the inflated Active sessions
- Add a one-time cleanup step for student copilot demo/mock clutter:
  - archive empty active threads with zero messages and zero library items,
  - archive duplicate roadmap threads caused by the previous `[object Object]` bug,
  - archive duplicate “Teach me about: Revise distance...” roadmap threads where they are not the canonical artifact-linked thread,
  - keep meaningful sessions with real messages/library items.
- Stop the mock seeder from repeatedly reshaping old seeded rows in a way that keeps demo sessions fresh.
- Keep only a small, realistic demo set active: target, current weekly plan, one practice session, and one recent doubt.

6. UI refinements after cleanup
- Active should show only genuinely ongoing sessions.
- Recent/Archived can keep older meaningful history, but no empty generated clutter.
- Library should show the pinned target first, then the filtered study materials below.

Technical changes I will make after approval:
- Update `StudentArtifactPane.tsx` to render a pinned target card and accept a thread-selection callback.
- Update `StudentCopilotPage.tsx` to handle “open target thread” without routing through new-chat logic.
- Add safe helpers to identify the current pinned target and related study plans.
- Update target/study plan metadata handling where new library items are created.
- Add a cleanup path for existing bad/empty duplicate student copilot rows.
- Run build verification and preview-check the student copilot layout.