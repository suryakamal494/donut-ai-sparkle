## Recommended solution

The issue is real: the current Library dialog uses three full-width filter rows under the search bar, so the filter area consumes too much vertical space. The best fix is not to remove filters, but to change their layout based on screen size.

## Proposed UX

```text
Desktop / tablet wide
+--------------------------------------------------+
| Header: Copilot Library                     X    |
+----------------------+---------------------------+
| Filters sidebar      | Search + content grid     |
| - Subject            | 23 items                  |
| - Type               | TODAY                     |
| - Time               | [cards][cards][cards]     |
|                      | THIS WEEK                 |
|                      | [cards][cards][cards]     |
+----------------------+---------------------------+

Mobile / narrow tablet
+--------------------------------------------------+
| Header: Copilot Library                     X    |
| Search                                           |
| Filter button + active filter chips              |
+--------------------------------------------------+
| Content cards                                    |
+--------------------------------------------------+
| Bottom sheet filters only when user taps Filter  |
+--------------------------------------------------+
```

## What will change

1. **Move filters out of the top stack on desktop/tablet**
   - Add a compact left filter rail inside the Library dialog.
   - Keep filters visible, but vertical on the side so content gets much more height.
   - Search stays at the top of the content area because it is frequently used.

2. **Use a mobile-first filter drawer on small screens**
   - Replace the three chip rows with a single compact row:
     - `Filters` button
     - active filter summary chips, e.g. `Physics`, `PPT`, `This Week`
   - Tapping `Filters` opens a bottom sheet/drawer with Subject, Type, and Time filters.

3. **Make the content area the priority**
   - The card grid/list becomes the main scroll region.
   - Filters should not scroll with the content on desktop.
   - Header/search remain compact and fixed enough to keep context without eating space.

4. **Improve filter density**
   - Use smaller section labels: `Subject`, `Type`, `Date`.
   - Use tighter pill spacing and wrap inside the sidebar, not across the full page.
   - Add a clear `Reset filters` action only when filters are active.

5. **Keep behavior unchanged**
   - `View all` remains global.
   - Search, subject, type, and time filters continue working exactly as they do now.
   - Clicking an artifact still opens its linked thread/artifact.
   - Clicking resources still opens the resource viewer.

## Technical changes

- Update `src/components/student/copilot/CopilotLibraryDialog.tsx`.
- Add responsive layout using semantic Tailwind tokens only.
- Use existing UI primitives where possible:
  - `Dialog` for the full Library browser.
  - `Sheet` or an in-dialog collapsible panel for mobile filters.
  - Existing `FilterChip`, `ArtifactCard`, and `CopilotResourceCard` patterns.
- Preserve current filtering logic; only restructure the presentation.

## Result

The Library will feel like a real browser:

- Desktop/tablet: filters are always accessible on the side, content gets most of the vertical space.
- Mobile: filters are hidden behind a clear button, content gets the full screen.
- The student can browse many artifacts without the filter UI dominating the page.