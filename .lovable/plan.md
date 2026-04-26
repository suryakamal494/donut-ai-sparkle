I’ll update the student copilot UI based on the current screenshot and your notes.

Plan:

1. Make Active sessions collapsible again
- Keep the existing lifecycle accordion behavior, but make the Active header clearly clickable and ensure clicking it can collapse the section even when active threads exist.
- Preserve single-section behavior: Active, Recent, and Archived can still be opened/closed from the left rail.
- Make the collapsed/expanded arrow state more obvious on mobile/tablet and desktop.

2. Replace horizontal subject scrolling with wrapped subject chips
- Change the subject filter row from one-line horizontal scroll to a wrapping layout.
- Subjects will appear across multiple rows if needed instead of requiring sideways scrolling.
- Keep the selected subject visual state clear.
- This will be mobile/tablet-first, so chips remain easy to tap and do not crowd the left rail.

3. Apply subject filtering to Library items too
- Currently subject filtering is only applied to threads in `StudentLeftRail`.
- I’ll pass the selected subject into the right-side panel and filter the library list as well.
- Since library records do not have a dedicated `subject` column, I’ll infer subject safely from:
  - the linked thread’s subject,
  - `artifact.content.subject`,
  - `artifact.content.subjects`,
  - and, as fallback only, recognizable subject names in the title/content.
- This means when Physics is selected, both the session list and the Library panel will show Physics-related items only.

4. Rename “Artifacts” to “Library” in the student-facing UI
- Update the right panel heading from “Artifacts” to “Library”.
- Update empty-state copy from “No artifacts yet / Generated artifacts...” to school-friendly language such as “No library items yet / Saved study materials will appear here.”
- Update toggle accessibility/title labels from “artifact panel” to “library panel”.
- Keep internal variable/database names unchanged because they are technical implementation details.

5. Verify behavior
- Run a build/type check after changes.
- Check the affected student copilot layout at the current responsive size and ensure:
  - Active can be minimized,
  - subject chips wrap instead of scroll,
  - subject filter affects sessions and Library,
  - “Artifacts” no longer appears in student-facing labels for this panel.