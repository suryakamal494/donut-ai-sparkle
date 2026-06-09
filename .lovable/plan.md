## WhatsApp Communications — audience refinements

Three focused, UI-only changes to the Communications hub. No backend, no new files.

### 1. Overview → "By audience" usage: Teachers + Parents only
- Remove the **Students** row from the usage breakdown.
- Re-normalize the two remaining shares so they total 100% (Parents ~78%, Teachers ~22%) instead of leaving an 8% gap.
- Per your note, students and parents are the same recipient — everything in **Usage** stays displayed as **Parents**.

### 2. Automated Alerts → two clearly separated segments
Restructure the toggle matrix into exactly two groups the institute manages independently:

```text
┌── Teachers ──────────────────────────┐
│  • Timetable updates                  │
│      (today's schedule, published/    │
│       changed timetable)              │
│  • Substitution assigned              │
│  • Exam updates                       │
│      (exam timetable, reports ready)  │
│  • Syllabus lag nudge                 │
└───────────────────────────────────────┘

┌── Students ──────────────────────────┐
│  • Exam reports (score after attempt) │
│  • Exam timetable                     │
│  • General announcements              │
└───────────────────────────────────────┘
```

- The **Teachers** segment keeps its current alert set (already matches: timetable, substitution, exam, syllabus lag).
- The **Students** segment replaces the old "Parents" group. It keeps only the three confirmed items. **Attendance, Holiday, and Schedule-change alerts are removed** (no attendance feature exists).
- Each row keeps its mandatory always-visible WhatsApp preview. Student previews still read "Dear Parent," because delivery goes to the parent's phone — only the segment is labelled **Students** so the institute can toggle teacher vs student alerts separately.
- Each segment keeps its independent "Enable all / Disable all" control and localStorage persistence.

### 3. Broadcast → remove the Students chip
- Drop **Students** from the audience chips; keep **Teachers** and **Parents** exactly as they work now.
- Recipient math, section selectors, and send flow are unchanged.

### Out of scope (unchanged)
- Wallet / recharge / GST, Auto-Pause banner, History audit log + frozen snapshots, recipient math, mobile responsiveness.

---

### Technical notes
- **`src/data/institute/whatsappComms.ts`** — rewrite `alertConfigRows`: keep the 6 teacher rows; replace the parents rows with 3 rows tagged `audience: "students"` (Exam reports, Exam timetable, General announcements). `audienceLabels.students = "Students"` already exists.
- **`src/pages/institute/communications/AutomatedAlertsTab.tsx`** — change the rendered `audiences` list from `["teachers","parents"]` to `["teachers","students"]`; the existing `BookUser` student icon is already mapped.
- **`src/pages/institute/communications/OverviewTab.tsx`** — drop the `students` entry from `byAudience` and reweight (`parents: 0.78`, `teachers: 0.22`).
- **`src/pages/institute/communications/BroadcastTab.tsx`** — remove the `students` entry from `audienceOptions`.
- Update the feature memory doc to reflect the Teachers/Students automated split and Parents-only usage/broadcast.