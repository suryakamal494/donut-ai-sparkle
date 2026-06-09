## Redesign Automated Alerts — clean segmented view with on-demand preview

Rework the **Automated Alerts** tab (`AutomatedAlertsTab.tsx`) to match the teacher `NotificationPreferences` pattern: clear segments, compact scannable rows, and previews hidden behind a per-row "Preview" toggle. No data/business-logic changes — toggles, persistence, and the two segments (Teachers, Students) stay the same.

### Problem with current UI
- Each alert always renders a full WhatsApp preview bubble → giant cards, one long noisy scroll.
- Two side-by-side columns of unequal height fall out of alignment, so it doesn't read as two clean groups.
- The always-on previews bury the toggle and the segment it belongs to.

### New layout (mirrors teacher notifications)

```text
┌─ 🎓 Teachers ······························ 4/6 on · [Enable all] ┐
│  Substitution Assigned                              [Preview ▸]  ●ON │
│  When a teacher is assigned to cover another class.                  │
│ ───────────────────────────────────────────────────────────────────│
│  Today's Schedule                                   [Preview ▸]  ●ON │
│  A morning summary of the teacher's periods.                        │
│  ... (rows continue, divider between each)                          │
└─────────────────────────────────────────────────────────────────────┘

┌─ 👪 Students ······························ 2/3 on · [Enable all] ┐
│  Exam Reports                                       [Preview ▸]  ●ON │
│  Sent to the parent once a student's exam is graded.                │
│ ───────────────────────────────────────────────────────────────────│
│  Exam Timetable                                     [Preview ▾]  ●ON │
│  When an upcoming exam schedule is published.                        │
│    ┌─────────────────────────────────────────────┐  ← expanded only │
│    │ WhatsApp preview bubble (MessagePreview)     │    when clicked   │
│    └─────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

- **Two segment cards, stacked vertically** (not two misaligned columns) — each clearly headed **Teachers** / **Students** with its icon, an `N/total on` badge, and an **Enable all / Disable all** button. Same header style as the teacher `CategorySection`.
- **Compact rows**: each alert is one tight row — title + one-line description on the left, a **Preview** button and the **Switch** on the right, with a divider between rows (like teacher `PreferenceItem`).
- **Preview is hidden by default**. A small "Preview" button (chevron) per row toggles the `MessagePreview` bubble open/closed inline. Collapsed by default so the list stays short and scannable.
- Disabled rows dim slightly so on/off is obvious at a glance.
- Mobile-first: single column, full-width rows, 44px+ touch targets; the preview expands in place.

### Out of scope (unchanged)
- The Teachers/Students segments and their alert items, toggle state, `localStorage` persistence, Overview, Broadcast, History, wallet.

### Technical notes
- Rewrite **`src/pages/institute/communications/AutomatedAlertsTab.tsx`**:
  - Keep `loadToggles` / persistence / `grouped` / `handleToggle` / `handleSetAll` logic as-is.
  - Replace each `AudienceGroup` card's row markup: drop the always-rendered `<MessagePreview>`; render a compact row instead.
  - Add per-row local open state (a `Set<string>` of expanded alert ids) and a **Preview** toggle button (chevron icon) that conditionally renders `<MessagePreview compact>` below the row when open.
  - Reuse the existing `Collapsible`/header look from teacher `NotificationPreferences` for the segment header (icon chip, count badge, Enable/Disable all).
- `MessagePreview.tsx` stays as-is (just rendered on demand).
- Update the feature memory note: previews are now expand-on-demand via a Preview button, not always-visible.