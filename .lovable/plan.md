## Why the library disappeared

The last change made the right pane strictly depend on `artifact.thread_id === currentThread.id`. That is correct for a thread-specific pane, but it exposed two gaps:

1. Some existing/mock artifacts/resources are not linked to the currently selected thread, so the right pane becomes empty.
2. `View all` was also changed to thread-only, but your intended behavior is different: it should show the full library/all charts, not just the current thread.
3. Quick tools may create/select a new empty thread, but because no artifact exists yet in that thread, the right pane shows zero until the student sends a message and the Copilot creates an output.

## Proposed behavior

```text
Left rail
- Shows latest/recent threads so the student can access created sessions.
- Quick tools create/open the correct tool thread and make it visibly active.

Right pane
- Thread workspace only.
- Shows artifacts/resources linked to the currently opened chat thread.
- If no artifact exists in that thread yet, show a helpful empty state with guidance, not a broken zero-state.

View all
- Global library browser.
- Shows all artifacts/resources/charts across threads, with filters.
- Clicking an item opens/selects its linked thread, then opens the artifact/resource.
```

## Implementation plan

1. **Restore `View all` as global library**
   - Remove the `currentThreadId` restriction from `CopilotLibraryDialog`.
   - Keep subject/type/time/search filters.
   - The dialog count should represent all matching library items, not only current-thread items.

2. **Keep the right pane thread-scoped, but make it understandable**
   - Keep `StudentArtifactPane` filtered to the current thread.
   - Change the header/subtext to say something like `Thread library` / `Outputs from this chat`.
   - Empty state should explain: `No outputs in this thread yet. Ask Copilot to create practice, a target, or a study plan.`
   - If no thread is selected, show `Select a thread to view its outputs`.

3. **Fix resource linking fallback without polluting the thread pane**
   - The right pane will show only resources with `resource.thread_id === currentThread.id` or resources linked to an artifact in that thread via `resource.artifact_id`.
   - The full Library dialog remains global, so unlinked/general resources are still accessible through `View all`.

4. **Make latest thread access clearer**
   - Ensure the left rail always exposes latest threads under Recent/Active.
   - If a subject filter hides everything, show a clearer filtered empty state and allow `All` to bring everything back.
   - Keep Quick Tools at the bottom, but when clicked, the newly created thread should become active immediately.

5. **Clarify Quick Tools UX**
   - Quick Tools should not be expected to instantly show artifacts unless a generated output exists.
   - After clicking Practice/Exam Target/etc., the chat should open a focused empty thread with starter chips/prompts, and the right pane should say outputs will appear after Copilot creates them.

6. **Verification**
   - Build the app.
   - Check that:
     - selecting a thread changes the right pane to that thread’s outputs only;
     - `View all` shows all charts/artifacts/resources;
     - clicking an artifact in `View all` opens its owning thread;
     - Quick Tools create/select a thread and do not look unresponsive;
     - subject filters still behave consistently.