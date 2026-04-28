# Timetable Workspace QA

> This document is for testers validating timetable creation, editing, conflict detection, copy week, save/publish behavior, and review/export views. It starts scenario lettering from A so this page can be assigned independently.

---

## Before You Begin

Use a test institute where setup is already configured and teacher-batch-subject mappings exist across multiple curriculums/courses. Include at least one teacher assigned to multiple batches, one teacher with limited working days, one overloaded teacher case, holidays, exam blocks, and existing timetable entries.

---

## The Timetable Golden Rule

A workspace entry is valid only if teacher, batch, subject, curriculum/course, day, period, load, constraints, facility, holiday, and exam-block rules all agree.

```text
Teacher can be assigned to a timetable slot only when:
  1. Teacher is assigned to the selected batch
  2. Teacher owns the selected subject
  3. Teacher and batch share the same curriculum/course for that subject
  4. Teacher works on that day
  5. Teacher is not already busy at the same day and period
  6. Batch is not already busy at the same day and period
  7. Teacher load and daily constraints are respected
  8. Facility, if selected, is available and valid for the batch/class
  9. Slot is not blocked by holiday or exam schedule
```

---

## Test Scenarios

Each scenario below describes a workspace or review situation and the expected platform behavior.
### A. Teacher Mode Scenarios

**TT-WORKSPACE-A1 — Teacher Mode Shows Allowed Batches Only**
Select a teacher assigned to Class 10-A Physics and Class 10-B Physics. Assignment dialog should show only those batches, not every batch that has Physics.

**TT-WORKSPACE-A2 — Teacher With One Allowed Batch Drag-Drop**
Drag a teacher who has only one allowed batch to an empty slot. Platform may assign directly, and the subject should come from the teacher-batch mapping.

**TT-WORKSPACE-A3 — Teacher With Multiple Allowed Batches Drag-Drop**
Drag a teacher assigned to multiple batches. Batch picker should open. Each batch option should show the subject that teacher teaches for that batch.

**TT-WORKSPACE-A4 — Select Batch Already Busy**
In Teacher Mode, select a batch that already has a class at the same period. That batch should be disabled or assignment should be blocked with a batch conflict message.

**TT-WORKSPACE-A5 — Teacher Already Busy**
Assign the same teacher to two different batches at the same day and period. Platform should block it or conflict panel should show teacher clash as an error.

**TT-WORKSPACE-A6 — Teacher Non-Working Day**
Drag a teacher to a day not included in their working days. Platform should reject the assignment with a clear message.

**TT-WORKSPACE-A7 — Teacher Subject Auto-Mapping**
When teacher is assigned to different subjects for different batches, selecting each batch should auto-map the correct subject. Admin should not be able to choose an arbitrary subject outside that teacher-batch relationship.

**TT-WORKSPACE-A8 — Teacher Curriculum Scope**
A teacher assigned to CBSE Physics should not be assignable to a JEE Physics batch unless explicitly assigned to that JEE batch/course. Same subject name must not bypass curriculum/course scope.

---

---

### B. Batch Mode Scenarios

**TT-WORKSPACE-B1 — Batch Mode Shows Assigned Teachers Only**
Select Class 10-A. The teacher dropdown should show only teachers assigned to that batch and available on that day.

**TT-WORKSPACE-B2 — Same Subject But Teacher Not Assigned**
A Physics teacher exists but is not assigned to Class 10-A. That teacher should not appear in the Class 10-A teacher dropdown.

**TT-WORKSPACE-B3 — Teacher Assigned to Batch But Different Subject**
If a teacher is assigned to the batch for Chemistry only, selecting that teacher should auto-fill Chemistry and should not allow Physics for the same assignment.

**TT-WORKSPACE-B4 — Teacher Assigned to Subject But Wrong Curriculum**
A teacher assigned to JEE Physics should not appear for CBSE Physics batch unless teacher has CBSE assignment too.

**TT-WORKSPACE-B5 — Batch Already Has Class**
Assign Mathematics to Class 10-A Monday P1. Attempt to assign Physics to Class 10-A Monday P1. Platform should block or show batch clash.

**TT-WORKSPACE-B6 — Teacher Busy in Another Batch**
A teacher is already teaching Class 10-B Monday P2. In Class 10-A Batch Mode, that teacher should be disabled or blocked for Monday P2.

**TT-WORKSPACE-B7 — No Teachers Available**
Select a batch/day where no assigned teacher works. UI should show a clear empty state, not an empty dropdown that looks broken.

**TT-WORKSPACE-B8 — Batch Selection Change**
Switch from one batch to another after assignments. Grid should refresh correctly and should not show stale entries from the previous batch.

---

---

### C. Conflict Detection Scenarios

**TT-WORKSPACE-C1 — Teacher Clash**
Create or simulate the same teacher assigned to two batches at the same day and period. Conflict panel should show teacher clash with error severity.

**TT-WORKSPACE-C2 — Batch Clash**
Create or simulate the same batch assigned to two teachers/classes at the same day and period. Conflict panel should show batch clash.

**TT-WORKSPACE-C3 — Teacher Overload**
Assign more periods than the teacher’s weekly limit. Conflict panel should show overload with teacher name and assigned/allowed count.

**TT-WORKSPACE-C4 — Conflict Count Accuracy**
Create one teacher clash and one batch clash. The toolbar conflict count should match the number of unique conflict groups, not duplicate every affected entry incorrectly.

**TT-WORKSPACE-C5 — Conflict Navigation**
Click a conflict from the panel. Workspace should switch to the relevant teacher or batch and navigate/open the affected slot.

**TT-WORKSPACE-C6 — Resolve Conflict by Removing Entry**
Remove one conflicting entry. Conflict panel should update immediately and remove the resolved conflict.

**TT-WORKSPACE-C7 — Resolve Conflict by Moving Entry**
Move one conflicting entry to a free slot. Conflict panel should update and no new conflict should be introduced.

**TT-WORKSPACE-C8 — Facility Conflict Included**
If two entries use the same facility at the same time, platform should show facility conflict where implemented. If not shown, QA should flag gap.

**TT-WORKSPACE-C9 — Constraint Violation Included**
Hard and soft constraint violations should be visible either at assignment time or in summary. Hidden violations should be flagged.

---

---

### D. Edit, Move, Undo/Redo Scenarios

**TT-WORKSPACE-D1 — Click Existing Entry**
Click an existing timetable entry. Dialog should show current subject, teacher, batch, and period details.

**TT-WORKSPACE-D2 — Remove Existing Entry**
Remove an entry from dialog. Grid should clear the slot, teacher remaining count should update, and undo should become available.

**TT-WORKSPACE-D3 — Move Entry to Empty Slot**
Drag an existing entry to an empty valid slot. Entry should move and preserve teacher, batch, subject, and facility metadata.

**TT-WORKSPACE-D4 — Move Entry to Occupied Slot**
Attempt to move an entry to a slot already occupied for that teacher or batch. Platform should block with slot occupied/conflict message.

**TT-WORKSPACE-D5 — Move Entry to Non-Working Day**
Move a teacher’s entry to a day they do not work. Platform should block the move.

**TT-WORKSPACE-D6 — Undo Assignment**
Create an entry, then click undo. Entry should be removed and all counts/conflicts should recalculate.

**TT-WORKSPACE-D7 — Redo Assignment**
After undo, click redo. Entry should return to same day/period with same metadata.

**TT-WORKSPACE-D8 — Undo After Copy Week**
If copy week creates many entries, undo should either reverse the copy as a grouped action or clearly reverse one entry at a time. It should not create partial inconsistent state without indication.

**TT-WORKSPACE-D9 — Edit After Publish**
Edit a published week. The platform should indicate whether changes are draft until republished or immediately live.

---

---

### E. Copy Week Scenarios

**TT-WORKSPACE-E1 — Copy Current Batch Week**
In Batch Mode, copy the selected batch’s source week to the next week. Only that batch’s entries should copy.

**TT-WORKSPACE-E2 — Copy Current Teacher Week**
In Teacher Mode, copy the selected teacher’s source week. Only that teacher’s entries should copy.

**TT-WORKSPACE-E3 — Copy All Entries**
When no specific scope is intended, copy all source week entries. Every copied entry should preserve batch, teacher, subject, and facility.

**TT-WORKSPACE-E4 — Copy to Multiple Future Weeks**
Select multiple target weeks. Copied count should equal source valid entries multiplied by target weeks, minus skipped holidays/exam periods.

**TT-WORKSPACE-E5 — Copy With Holiday Skip Enabled**
Target week contains a holiday. Holiday-date entries should be skipped and copied count should reflect skipped entries.

**TT-WORKSPACE-E6 — Copy With Exam Skip Enabled**
Target week contains an exam block. Exam-blocked entries should be skipped.

**TT-WORKSPACE-E7 — Copy Into Occupied Week Without Overwrite**
Target week already has entries. If overwrite is off, platform should skip or warn about existing entries; it must not create duplicate clashes silently.

**TT-WORKSPACE-E8 — Copy Into Occupied Week With Overwrite**
If overwrite is enabled, existing target entries should be replaced only for matching copied slots. Non-matching target entries should remain.

**TT-WORKSPACE-E9 — Copy After Teacher Assignment Changed**
A teacher was removed from a batch after source week was created. Copying that week should flag invalid teacher-batch assignments instead of copying them as valid.

**TT-WORKSPACE-E10 — Copy After Period Structure Changed**
Source week has P8 entries but target setup has only 7 periods. Copy should block or flag invalid period entries.

---

---

### F. Save, Draft & Publish Scenarios

**TT-WORKSPACE-F1 — Save Draft**
Admin saves a draft. UI should show draft status and should not necessarily expose changes downstream until publish, if draft/publish separation is implemented.

**TT-WORKSPACE-F2 — Publish Timetable**
Admin publishes a valid timetable. View Timetable should reflect the published entries for the selected week.

**TT-WORKSPACE-F3 — Publish With Conflicts**
Attempt publishing with teacher clash, batch clash, or overload. Platform should block publish or ask for explicit confirmation depending on severity.

**TT-WORKSPACE-F4 — Republish After Edit**
After publishing, edit one entry and republish. View Timetable and downstream teacher/student schedules should show the updated entry only after republish if publish gating exists.

**TT-WORKSPACE-F5 — Navigation After Save**
Saving from Setup should take the admin to Workspace without losing setup values. Returning to Setup should show saved configuration.

**TT-WORKSPACE-F6 — Refresh Persistence**
After saving/publishing, refresh the browser. Timetable entries, save status, and setup configuration should persist if backend persistence is expected.

---

---

### G. View Timetable — Weekly View Scenarios

**TT-WORKSPACE-G1 — Weekly View All Batches**
Open View Timetable in weekly mode with All Batches. Table should show entries across batches and include batch labels where needed.

**TT-WORKSPACE-G2 — Filter by Batch**
Select one batch. Weekly view should show only that batch’s entries.

**TT-WORKSPACE-G3 — Filter by Teacher**
Select one teacher. Weekly view should show only that teacher’s entries.

**TT-WORKSPACE-G4 — Combined Batch and Teacher Filters**
Apply both batch and teacher filters. Result should show only entries matching both filters, not either filter.

**TT-WORKSPACE-G5 — Break Rows Display**
Break rows configured in Setup should display between correct periods and should not contain class entries.

**TT-WORKSPACE-G6 — Holiday Display**
A holiday date should show holiday styling and should not show normal class cells as if school is open.

**TT-WORKSPACE-G7 — Exam Block Display**
Exam block should show label/type and blocked styling in affected cells.

**TT-WORKSPACE-G8 — Empty Cells**
Empty slots should display as empty/dash and should not look like loading or broken data.

**TT-WORKSPACE-G9 — Substituted Teacher Display**
If substitution exists, View Timetable should show substitute teacher instead of or alongside original teacher according to product rule.

---

---

### H. View Timetable — Monthly View Scenarios

**TT-WORKSPACE-H1 — Monthly Calendar Opens**
Switch to monthly view. Calendar should show current month with working days, non-working days, holidays, and current date clearly.

**TT-WORKSPACE-H2 — Month Navigation**
Navigate previous and next month. Display should update without losing selected filters.

**TT-WORKSPACE-H3 — Batch Filter in Monthly View**
Select a batch in monthly view. Daily counts/details should reflect only that batch.

**TT-WORKSPACE-H4 — Teacher Filter in Monthly View**
Select a teacher in monthly view. Calendar should reflect only that teacher’s scheduled classes.

**TT-WORKSPACE-H5 — Holiday in Monthly View**
Holiday should be marked in monthly calendar and not counted as normal working schedule.

**TT-WORKSPACE-H6 — Non-Working Day Display**
Sunday or removed working days should be visually distinct from regular working days.

---

---

### I. View Timetable — Past, Current & Future Week Scenarios

**TT-WORKSPACE-I1 — Past Week Read-Only**
Navigate to a past week. Edit Week action should be hidden or disabled, and read-only indicator should be visible.

**TT-WORKSPACE-I2 — Current Week Editable**
Navigate to current week. Edit Week action should be available if user has permission.

**TT-WORKSPACE-I3 — Future Week Editable**
Navigate to future week. Edit Week action should be available and should open Workspace for that week.

**TT-WORKSPACE-I4 — Edit Week Navigation Context**
Click Edit Week from View Timetable. Workspace should open with the same week selected, not default to a different week.

**TT-WORKSPACE-I5 — Today Navigation**
Click Today. View should return to the current week/month and maintain reasonable default filters.

---

---

### J. View Timetable — Export & Print Scenarios

**TT-WORKSPACE-J1 — Print All Batches Weekly View**
Click Export/Print with All Batches selected. Print output should include timetable title, date range, and visible entries.

**TT-WORKSPACE-J2 — Print Batch-Filtered View**
Apply a batch filter and print. Print header/content should reflect selected batch.

**TT-WORKSPACE-J3 — Print Teacher-Filtered View**
Apply a teacher filter and print. Output should not include unrelated teachers.

**TT-WORKSPACE-J4 — Print Holiday/Exam Week**
Print a week with holidays and exam blocks. Blocked states should be readable in print.

**TT-WORKSPACE-J5 — Responsive Review View**
Test View Timetable on tablet and mobile. Filters should remain usable and grid should scroll horizontally without clipping controls.

---

---

## Critical Bugs QA Must Flag Immediately

1. Teacher appears for a batch they are not assigned to.
2. Teacher appears because subject name matches but curriculum/course does not match.
3. Batch accepts two classes in the same day and period.
4. Teacher accepts two classes in the same day and period.
5. Teacher remaining-period count does not change after assignment/removal.
6. Copy Week creates duplicates without conflict warning.
7. Copy Week ignores skip holiday or skip exam-period settings.
8. Published View Timetable differs from Workspace without a clear draft/publish reason.
9. Review/print output clips timetable data or omits selected filters.
10. Unauthorized users can access timetable setup, workspace, or review controls.

---

## Suggested Execution Order

1. Teacher Mode
2. Batch Mode
3. Conflict detection
4. Edit, move, undo/redo
5. Copy Week
6. Save, draft, publish
7. Weekly/monthly review views
8. Past/current/future navigation
9. Export and print

---
## Related Documentation

- [Timetable QA Master Index](./timetable-institute-qa.md)
- [Timetable Setup QA](./timetable-setup-qa.md)
- [Timetable Workspace QA](./timetable-workspace-qa.md)
- [Timetable Upload View QA](./timetable-upload-qa.md)
- [Timetable Substitution & Edge Cases QA](./timetable-substitution-edge-qa.md)
- [Timetable Setup](../../02-institute/timetable-setup.md)
- [Timetable Workspace](../../02-institute/timetable-workspace.md)
- [Timetable Substitution](../../02-institute/timetable-substitution.md)
- [Timetable Flow](../../05-cross-login-flows/timetable-flow.md)

---

*Last Updated: April 2026*
