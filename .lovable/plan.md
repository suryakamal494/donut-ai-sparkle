## Focused Plan — Rewrite ONLY `timetable-workspace-qa.md` (revised)

Single file, ~60 scenarios across sections A–J. Other QA docs untouched.

---

## The new shape every scenario will follow

```
**[ID] — Self-Explanatory Title (8–14 words, plain English)**

*What this is:* One short sentence framing the situation in plain words.

*What to try:* 2–3 sentences describing the situation conceptually,
hinting at variations (different teachers, both modes, drag vs dialog,
refresh, after edits in master data) so the tester explores instead of
following one fixed path.

*Expected:* One clear sentence on what a passing test looks like.
```

**Three blocks only — `What this is`, `What to try`, `Expected`.** No "Background", no "Why it matters". Same shape applies to every section including Conflicts (C).

---

## What stays vs what changes

**Stays unchanged**
- Filename and frontend route
- All scenario IDs (`TT-WORKSPACE-A1` … `TT-WORKSPACE-J5`)
- Section letters and themes (A. Teacher Mode … J. Export & Print)
- "Before You Begin", "Golden Rule", "Critical Bugs", "Suggested Execution Order", "Related Documentation"
- No new scenarios added, none removed

**Changes**
- Every scenario title rewritten to be self-explanatory in plain English
- Every 1-line description expanded into the 3-block structure above

---

## Title rewrite samples

| ID | Old | New |
|---|---|---|
| A1 | Teacher Mode Shows Allowed Batches Only | Teacher Mode Should Only Offer Batches That Teacher Is Officially Assigned To |
| A2 | Teacher With One Allowed Batch Drag-Drop | Dragging A Single-Batch Teacher Should Skip The Batch Picker |
| A7 | Teacher Subject Auto-Mapping | Subject Should Auto-Fill From The Teacher–Batch Relationship, Not Be Free Choice |
| C1 | Teacher Clash | Same Teacher Cannot Be In Two Classrooms At The Same Time |
| C2 | Batch Clash | One Batch Cannot Have Two Different Classes Running Simultaneously |
| C3 | Teacher Overload | Teacher Should Not Exceed Their Weekly Period Limit |
| C4 | Conflict Count Accuracy | Conflict Badge Number Must Match The Real Problems In The Grid |
| E5 | Copy With Holiday Skip Enabled | Copying Into A Week With A Holiday Should Skip Holiday Dates |
| F3 | Publish With Conflicts | Publishing A Timetable That Still Has Conflicts Should Be Blocked Or Confirmed |
| I1 | Past Week Read-Only | Past Weeks Should Be Read-Only To Protect Historical Records |

---

## Description rewrite samples

### Regular scenario (TT-WORKSPACE-A2)

> *What this is:* When a teacher only teaches one batch in the whole institute, dragging them onto an empty slot should not bother the admin with a "pick a batch" popup — the system already knows where they belong.
>
> *What to try:* Find or create a teacher mapped to exactly one batch and one subject. Drag them into different empty slots across multiple days. Try with another such single-mapping teacher, and try again after editing that teacher's subject mapping in master data to confirm the mapping stays in sync.
>
> *Expected:* The slot fills directly with the correct teacher, batch, and auto-mapped subject. No batch picker appears.

### Conflict scenario (TT-WORKSPACE-C1)

> *What this is:* Forcing the same teacher into two parallel slots at the same day and period and watching whether the conflict engine catches it. A teacher cannot physically be in two classrooms at once, so the platform must flag this every time.
>
> *What to try:* Assign the teacher to Class 10-A Monday P3, then try to also assign them to Class 10-B Monday P3. Reproduce the same situation from Teacher Mode and from Batch Mode, via drag-drop and via the assignment dialog. Also try producing the clash by Copy Week into a slot where they're already booked.
>
> *Expected:* Either the second assignment is blocked outright, or it is allowed but the conflict panel immediately shows a clear "teacher clash" entry naming both batches, the teacher, and the period.

---

## Execution

- Single file edit: `docs/06-testing-scenarios/inter-login-tests/timetable-workspace-qa.md`
- No code changes, no navigation changes, no new files
- Markdown italics render cleanly in the existing `DocsViewer`
- File grows from ~360 lines to roughly ~600 lines

---

## Approval needed

Confirm and I will rewrite `timetable-workspace-qa.md` end-to-end in this 3-block format. After you review, we will move to the next document (Setup, Upload, or Substitution — your pick).