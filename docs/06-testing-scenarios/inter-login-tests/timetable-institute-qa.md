# Institute Timetable QA — Setup, Workspace, Review & Substitution Testing

> This guide explains how the Institute Timetable module should be tested end-to-end. Read it before executing scenarios: timetable bugs usually happen when setup rules, teacher-batch scope, workspace edits, copied weeks, uploads, holidays, exam blocks, and substitutions interact with each other.

---

## Before You Begin

> **New to the timetable module?** Start here. This section defines the vocabulary, page locations, and minimum test data needed before testing. The scenarios are written as real situations rather than only button-by-button scripts, so QA testers should understand the model first and then verify the platform behavior through the UI.

### Domain Glossary

| Term | What It Means | Example |
|------|---------------|---------|
| **Timetable Setup** | The configuration layer that defines working days, periods, breaks, teacher load, exam blocks, constraints, and facilities before building the timetable. | 6 working days, 8 periods/day, lunch after Period 4 |
| **Working Day** | A day on which classes can normally be scheduled. | Monday to Saturday |
| **Period** | A schedulable teaching slot within a working day. | Monday Period 2 |
| **Break** | A non-teaching interval inserted between periods. Breaks should display in timetable views but should not behave like assignable periods. | Short Break after P2, Lunch after P4 |
| **Time Mapping** | Optional start/end clock time attached to each period. | P1 = 08:00–08:45 |
| **Period Type** | A classification for special slots such as Lab, Library, Sports, or regular teaching. | Physics Lab requiring a facility |
| **Teacher Load** | The expected or allowed number of weekly periods for a teacher. | Teacher allowed 26 periods/week |
| **Remaining Periods** | Teacher load minus assigned periods. This should decrease when periods are assigned and recover when periods are removed. | 26 allowed, 18 assigned, 8 left |
| **Teacher Constraint** | A rule or preference controlling when a teacher can be scheduled. | Not available on Saturday, max 5 periods/day |
| **Hard Constraint** | A rule that must block assignment when violated. | Teacher unavailable on Wednesday P3 |
| **Soft Constraint** | A preference that can warn but may allow assignment. | Avoid first period |
| **Facility** | A room or resource that may be required for a period. | Physics Lab, Computer Lab, Library |
| **Batch Mode** | Workspace mode where the admin builds the timetable for one batch and chooses from teachers assigned to that batch. | Class 10-A timetable grid |
| **Teacher Mode** | Workspace mode where the admin builds a teacher's timetable and chooses from that teacher's allowed batches. | Dr. Kumar weekly grid |
| **Teacher-Batch Assignment** | The relationship that says a teacher is allowed to teach a subject for a specific batch. | Dr. Kumar teaches Physics for Class 10-A |
| **Curriculum/Course Scope** | The curriculum or course ownership attached to a batch, subject, and teacher. A subject name match alone is not enough. | CBSE Physics is different from JEE Physics |
| **Conflict** | A schedule violation detected by the workspace. | Same teacher assigned to two batches at Monday P1 |
| **Exam Block** | A date or period range reserved for exams where regular timetable slots should be blocked or visibly marked. | Mid-Term Exam on Friday P1–P4 |
| **Upload/Embed** | Flow where an image/screenshot of an existing timetable is parsed, validated, edited, then embedded into Workspace. | Uploaded paper timetable for Class 10-A |
| **Copy Week** | Function that copies a source week timetable to one or more future weeks, optionally skipping holidays or exam periods. | Copy current week to next 4 weeks |
| **Substitution** | Temporary replacement assignment when a scheduled teacher is absent. | Mrs. Sharma covers Dr. Kumar's Monday P2 class |

### Where to Find Things in the UI

| Feature | Portal | Navigation Path |
|---------|--------|-----------------|
| Timetable Setup | Institute Admin | Sidebar → Timetable → Setup |
| Timetable Workspace | Institute Admin | Sidebar → Timetable → Workspace |
| Upload Existing Timetable | Institute Admin | Timetable Workspace → Upload |
| View / Review Timetable | Institute Admin | Sidebar → Timetable → View Timetable |
| Substitution Management | Institute Admin | Sidebar → Timetable → Substitution |
| Batch Management | Institute Admin | Sidebar → Batches |
| Teacher Management | Institute Admin | Sidebar → Teachers |
| Master Data Scope | Institute Admin | Sidebar → Master Data |
| Teacher Schedule | Teacher | Sidebar → Schedule |
| Student Schedule | Student | Dashboard / Timetable |

### Prerequisites for Testing

Before executing these scenarios, prepare a test institute with enough variety to expose edge cases:

1. **At least 10 teachers**, including teachers with different subjects, different loads, and different working days.
2. **At least 5 batches**, including batches from different curriculums/courses and different subject combinations.
3. **At least 2 curriculums/courses** assigned to the institute, such as CBSE and JEE Mains.
4. **Overlapping subject names across different scopes**, such as CBSE Physics and JEE Physics, so testers can catch scope leakage.
5. **Teacher-batch mappings**, including:
   - teacher assigned to one batch only,
   - teacher assigned to multiple batches,
   - teacher assigned to same subject across different batches,
   - teacher with subject match but not assigned to a batch,
   - teacher with batch assignment but wrong curriculum/course.
6. **Configured holidays**, including at least one holiday in a target copy week.
7. **Configured exam blocks**, including one all-batch block and one batch-specific block.
8. **At least one facility**, such as a Lab, with class restrictions and period availability.
9. **Existing timetable entries**, so testers can verify edit, copy, conflict, upload, and substitution behavior.
10. **Teacher/student downstream accounts**, if testing propagation after publish.

---

## How Timetable Links Everything Together

Timetable is not an isolated grid. It is the operational schedule layer that consumes setup rules and teacher-batch scope, then feeds review, substitution, teacher schedule, student schedule, lesson planning, and academic progress.

```text
Institute Timetable Setup
  ├── Working days
  ├── Period count and time mapping
  ├── Breaks
  ├── Period types
  ├── Holidays
  ├── Teacher loads
  ├── Exam blocks
  ├── Teacher constraints
  └── Facilities
        │
        ▼
Timetable Workspace
  ├── Teacher Mode
  ├── Batch Mode
  ├── Drag/drop assignment
  ├── Assignment dialog
  ├── Upload/Embed
  ├── Copy Week
  ├── Conflict panel
  └── Save/Publish
        │
        ▼
View / Review Timetable
  ├── Weekly view
  ├── Monthly view
  ├── Batch filter
  ├── Teacher filter
  ├── Holiday display
  └── Exam-block display
        │
        ▼
Substitution Management
  ├── Teacher absence
  ├── Coverage needed
  ├── Substitute assignment
  └── Downstream teacher/student visibility
```

### The Timetable Golden Rule

**A timetable entry is valid only if teacher, batch, subject, curriculum/course, day, period, load, constraints, facility, holiday, and exam-block rules all agree.**

The most important validation is not only “is this slot empty?” It is:

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

If any dropdown or upload flow allows only a subject-name match but ignores curriculum/course or batch assignment, QA should mark it as a critical scope bug.

---

## What Happens When Edits Are Made Mid-Year

Timetable testing must include mid-year changes because real institutes change schedules after classes have already started.

```text
EDIT: Reduce periods per day from 8 to 7
  │
  ├── Existing Period 8 entries should not silently disappear
  ├── Workspace should warn or require migration before saving
  ├── View Timetable should not show orphaned periods incorrectly
  └── Copy Week should not copy invalid period entries without warning

EDIT: Remove Saturday from working days
  │
  ├── Saturday slots should become blocked or flagged
  ├── Existing Saturday entries should be visible as affected entries
  ├── Teachers/students should not see Saturday as a regular class day after publish
  └── Academic planning calculations should update if connected

EDIT: Change teacher load from 26 to 20 periods/week
  │
  ├── Teacher may become overloaded
  ├── Conflict panel should show overload warning
  ├── New assignments should respect the updated limit
  └── Existing entries should not be silently deleted

EDIT: Remove teacher from a batch
  │
  ├── Existing timetable entries for that teacher-batch relationship should be flagged
  ├── Teacher should no longer appear in Batch Mode for that batch
  ├── Teacher Mode should no longer show that batch as assignable
  └── Upload/Embed should reject that teacher for that batch

EDIT: Add holiday or exam block after timetable is published
  │
  ├── Affected slots should show as blocked in Review Timetable
  ├── Workspace should identify affected classes
  ├── Copy Week should skip blocked slots when configured
  └── Substitution should not ask for coverage on a holiday
```

---

## Test Scenarios

Each scenario below describes a situation and the expected platform behavior. QA testers may choose exact data values, but the same business rule must hold regardless of sequence.

---

### A. Setup — Period Structure Scenarios

**TT-I-A1 — First-Time Period Setup**
An institute configures Monday to Saturday as working days with 8 periods per day. Workspace and View Timetable should both render exactly those working days and exactly 8 periods, with no extra Sunday or hidden period rows.

**TT-I-A2 — Toggle Working Day Off After Entries Exist**
After Saturday classes are created, the admin removes Saturday from working days. The platform should not silently lose Saturday entries. It should either block the change, warn that existing entries are affected, or clearly mark those entries as invalid until resolved.

**TT-I-A3 — Add New Working Day Mid-Year**
An institute that previously used Monday-Friday adds Saturday. Workspace should allow Saturday scheduling only after saving setup. Existing Monday-Friday entries should remain untouched.

**TT-I-A4 — Reduce Periods Per Day Mid-Year**
A timetable has entries in Period 8. Admin changes periods per day from 8 to 7. Period 8 entries should become flagged/orphaned or require resolution. They should not disappear silently and should not be copied into future weeks without warning.

**TT-I-A5 — Increase Periods Per Day Mid-Year**
Admin changes periods from 7 to 9. Workspace should show new empty P8/P9 cells. Existing entries should remain in their original periods and teacher load should not change until new assignments are made.

**TT-I-A6 — Toggle Time Mapping Display**
Admin turns time mapping off. View Timetable should show period labels without clock times. Turning it back on should restore clock times consistently across Setup, Workspace, and View Timetable.

**TT-I-A7 — Invalid Time Mapping Order**
Admin edits a period so the end time is before the start time, or overlapping with another period. The platform should prevent saving or show a validation error. If it allows the change, QA should flag it.

**TT-I-A8 — Generate Time Slots After Break Edits**
Admin edits breaks and then generates time mappings. Generated period times should include break durations correctly, remain sequential, and not overlap.

---

### B. Setup — Break Scenarios

**TT-I-B1 — Add One Break**
Admin adds a short break after P2. Workspace and View Timetable should display the break between P2 and P3 and should not allow class assignment inside the break row.

**TT-I-B2 — Add Multiple Breaks in Correct Order**
Admin adds short break, lunch break, and snacks break. Break rows should display in chronological period order, even if they were created in a different order.

**TT-I-B3 — Maximum Break Limit**
Admin attempts to add more than the allowed number of breaks. The platform should block the extra break and show a clear error.

**TT-I-B4 — Move Lunch Break After Timetable Creation**
Lunch is moved from after P4 to after P5 after entries already exist. Period assignments should remain attached to period numbers. Only the break placement and time mapping should change.

**TT-I-B5 — Delete Break Mid-Year**
Admin deletes a break after timetable is built. Time mapping should be regenerated or clearly flagged as needing update. Regular period assignments should not be deleted.

**TT-I-B6 — Break Placed Beyond Available Periods**
Admin tries to set a break after a period number that no longer exists after period count reduction. Platform should block or correct this configuration.

---

### C. Setup — Period Type Scenarios

**TT-I-C1 — Create Lab Period Type**
Admin creates a Lab period type requiring a teacher and facility. Assignment should require a valid teacher and should show facility options where applicable.

**TT-I-C2 — Create Library Period Type Without Teacher Requirement**
Admin creates Library as a no-teacher period type. Platform should define whether it can be assigned without teacher. If teacher is still required, UI should not imply otherwise.

**TT-I-C3 — Double Period Type**
Admin marks a period type as double-period. Workspace should either reserve two adjacent slots or prevent selection until two valid slots are available.

**TT-I-C4 — Edit Existing Period Type Name/Color**
Admin edits a period type used in existing timetable entries. Existing entries should update display metadata but should not lose their assignment.

**TT-I-C5 — Delete Used Period Type**
Admin deletes or disables a period type already used in the timetable. Platform should prevent deletion or flag affected entries.

---

### D. Setup — Holiday Scenarios

**TT-I-D1 — Add Holiday Before Building Timetable**
Admin adds a holiday before assigning classes. Workspace and View Timetable should show that date as blocked/holiday and should not require substitution coverage.

**TT-I-D2 — Add Holiday After Classes Exist**
Admin adds a holiday on a date that already has classes. Existing entries should be visibly affected. They should not disappear, but View Timetable should show the holiday state clearly.

**TT-I-D3 — Holiday in Copy Target Week**
Admin copies a week into a target week containing a holiday while “skip holidays” is enabled. Entries for the holiday date should not be copied, while other days should copy normally.

**TT-I-D4 — Copy Week Without Skipping Holidays**
Admin disables “skip holidays” and copies into a week with a holiday. The platform should either allow with warning or block with explanation. It should not silently create hidden classes on a holiday.

**TT-I-D5 — Holiday Calendar Display in Substitution**
Selecting a holiday in Substitution Management should show no coverage needed, even if the same weekday normally has timetable entries.

**TT-I-D6 — Overlapping Holiday and Exam Block**
Admin configures a holiday and exam block on the same date. The platform should display a clear priority or prevent overlap. QA should verify the cell does not show contradictory states.

---

### E. Setup — Teacher Load Scenarios

**TT-I-E1 — Remaining Period Count Decreases**
A teacher has 26 weekly periods allowed and 18 assigned. Assign one new period in Workspace. The UI should show 7 remaining, not 8. Removing that entry should restore the count.

**TT-I-E2 — Weekly Load Limit Reached**
Set a teacher’s weekly load to 10 and assign 10 periods. Attempt the 11th period. Platform should block or show overload warning according to business rule. If it allows assignment, Conflict Panel must show overload.

**TT-I-E3 — Load Reduced After Assignments**
Teacher has 24 assigned periods. Admin reduces weekly load to 20. Existing entries should remain but teacher should be marked overloaded. New assignments should be blocked or warned.

**TT-I-E4 — Load Increased After Overload**
Teacher is overloaded at 26/24. Admin increases limit to 28. Overload warning should disappear after setup is saved and workspace recalculates.

**TT-I-E5 — Copy Week Affects Load**
Copying a teacher’s week should not incorrectly count copied entries into the source week load display if load is meant per week. If load is global across all copied weeks, the UI must clearly state that.

**TT-I-E6 — Teacher Load and Subject Scope Together**
A teacher may have remaining periods but should still not appear for a batch where they are not assigned. Remaining capacity must not override teacher-batch-scope validation.

---

### F. Setup — Exam Schedule Scenarios

**TT-I-F1 — Create All-Batch Exam Block**
Admin creates an exam block for all batches. View Timetable should show blocked cells for all batches in the affected periods/dates.

**TT-I-F2 — Create Batch-Specific Exam Block**
Admin creates an exam block only for Class 10-A. View Timetable filtered to Class 10-A should show the block. Other batches should remain schedulable unless separately blocked.

**TT-I-F3 — Workspace Assignment During Exam Block**
Admin attempts to assign a regular class to a blocked exam slot. Platform should prevent assignment or show a strong warning before allowing override.

**TT-I-F4 — Copy Week Skips Exam Periods**
Admin copies a week into a week containing exam periods with “skip exam periods” enabled. Entries should not be copied into exam-blocked slots.

**TT-I-F5 — Exam Block After Published Timetable**
Admin publishes timetable, then adds an exam block over existing regular classes. View Timetable should clearly show the exam block priority and identify affected regular classes if such review exists.

**TT-I-F6 — Exam Block Removed**
Admin removes the exam block. Regular classes should reappear if they were never deleted, or the system should clearly require re-scheduling if they were removed.

---

### G. Setup — Advanced Constraints & Facilities Scenarios

**TT-I-G1 — Hard Unavailable Day Constraint**
Teacher is marked unavailable on Wednesday with hard constraint. Assigning that teacher on Wednesday should be blocked.

**TT-I-G2 — Soft Avoid First Period Constraint**
Teacher prefers to avoid P1 as a soft constraint. Assigning P1 should show a warning but may allow assignment if business rules permit.

**TT-I-G3 — Max Periods Per Day**
Teacher has max 5 periods/day. After 5 periods are assigned on Monday, assigning the 6th Monday period should be blocked or flagged based on constraint level.

**TT-I-G4 — Time Window Constraint**
Teacher is available only P2-P6. Attempting P1 or P7 should show a constraint warning/block.

**TT-I-G5 — Facility Conflict**
Two batches require the same Physics Lab at Monday P3. The second assignment should be blocked or facility should be disabled with conflict indicator.

**TT-I-G6 — Facility Class Restriction**
A facility is allowed only for Class 11/12. It should not appear or should be disabled for Class 8/9/10 batches.

**TT-I-G7 — Facility Availability Window**
A facility available only on Tuesday P1-P4 should not be assignable on Friday P6.

**TT-I-G8 — Facility Removed After Assignment**
If a facility used in existing timetable is disabled or removed, affected timetable entries should be flagged rather than silently losing facility context.

---

### H. Workspace — Teacher Mode Scenarios

**TT-I-H1 — Teacher Mode Shows Allowed Batches Only**
Select a teacher assigned to Class 10-A Physics and Class 10-B Physics. Assignment dialog should show only those batches, not every batch that has Physics.

**TT-I-H2 — Teacher With One Allowed Batch Drag-Drop**
Drag a teacher who has only one allowed batch to an empty slot. Platform may assign directly, and the subject should come from the teacher-batch mapping.

**TT-I-H3 — Teacher With Multiple Allowed Batches Drag-Drop**
Drag a teacher assigned to multiple batches. Batch picker should open. Each batch option should show the subject that teacher teaches for that batch.

**TT-I-H4 — Select Batch Already Busy**
In Teacher Mode, select a batch that already has a class at the same period. That batch should be disabled or assignment should be blocked with a batch conflict message.

**TT-I-H5 — Teacher Already Busy**
Assign the same teacher to two different batches at the same day and period. Platform should block it or conflict panel should show teacher clash as an error.

**TT-I-H6 — Teacher Non-Working Day**
Drag a teacher to a day not included in their working days. Platform should reject the assignment with a clear message.

**TT-I-H7 — Teacher Subject Auto-Mapping**
When teacher is assigned to different subjects for different batches, selecting each batch should auto-map the correct subject. Admin should not be able to choose an arbitrary subject outside that teacher-batch relationship.

**TT-I-H8 — Teacher Curriculum Scope**
A teacher assigned to CBSE Physics should not be assignable to a JEE Physics batch unless explicitly assigned to that JEE batch/course. Same subject name must not bypass curriculum/course scope.

---

### I. Workspace — Batch Mode Scenarios

**TT-I-I1 — Batch Mode Shows Assigned Teachers Only**
Select Class 10-A. The teacher dropdown should show only teachers assigned to that batch and available on that day.

**TT-I-I2 — Same Subject But Teacher Not Assigned**
A Physics teacher exists but is not assigned to Class 10-A. That teacher should not appear in the Class 10-A teacher dropdown.

**TT-I-I3 — Teacher Assigned to Batch But Different Subject**
If a teacher is assigned to the batch for Chemistry only, selecting that teacher should auto-fill Chemistry and should not allow Physics for the same assignment.

**TT-I-I4 — Teacher Assigned to Subject But Wrong Curriculum**
A teacher assigned to JEE Physics should not appear for CBSE Physics batch unless teacher has CBSE assignment too.

**TT-I-I5 — Batch Already Has Class**
Assign Mathematics to Class 10-A Monday P1. Attempt to assign Physics to Class 10-A Monday P1. Platform should block or show batch clash.

**TT-I-I6 — Teacher Busy in Another Batch**
A teacher is already teaching Class 10-B Monday P2. In Class 10-A Batch Mode, that teacher should be disabled or blocked for Monday P2.

**TT-I-I7 — No Teachers Available**
Select a batch/day where no assigned teacher works. UI should show a clear empty state, not an empty dropdown that looks broken.

**TT-I-I8 — Batch Selection Change**
Switch from one batch to another after assignments. Grid should refresh correctly and should not show stale entries from the previous batch.

---

### J. Workspace — Conflict Detection Scenarios

**TT-I-J1 — Teacher Clash**
Create or simulate the same teacher assigned to two batches at the same day and period. Conflict panel should show teacher clash with error severity.

**TT-I-J2 — Batch Clash**
Create or simulate the same batch assigned to two teachers/classes at the same day and period. Conflict panel should show batch clash.

**TT-I-J3 — Teacher Overload**
Assign more periods than the teacher’s weekly limit. Conflict panel should show overload with teacher name and assigned/allowed count.

**TT-I-J4 — Conflict Count Accuracy**
Create one teacher clash and one batch clash. The toolbar conflict count should match the number of unique conflict groups, not duplicate every affected entry incorrectly.

**TT-I-J5 — Conflict Navigation**
Click a conflict from the panel. Workspace should switch to the relevant teacher or batch and navigate/open the affected slot.

**TT-I-J6 — Resolve Conflict by Removing Entry**
Remove one conflicting entry. Conflict panel should update immediately and remove the resolved conflict.

**TT-I-J7 — Resolve Conflict by Moving Entry**
Move one conflicting entry to a free slot. Conflict panel should update and no new conflict should be introduced.

**TT-I-J8 — Facility Conflict Included**
If two entries use the same facility at the same time, platform should show facility conflict where implemented. If not shown, QA should flag gap.

**TT-I-J9 — Constraint Violation Included**
Hard and soft constraint violations should be visible either at assignment time or in summary. Hidden violations should be flagged.

---

### K. Workspace — Edit, Move, Undo/Redo Scenarios

**TT-I-K1 — Click Existing Entry**
Click an existing timetable entry. Dialog should show current subject, teacher, batch, and period details.

**TT-I-K2 — Remove Existing Entry**
Remove an entry from dialog. Grid should clear the slot, teacher remaining count should update, and undo should become available.

**TT-I-K3 — Move Entry to Empty Slot**
Drag an existing entry to an empty valid slot. Entry should move and preserve teacher, batch, subject, and facility metadata.

**TT-I-K4 — Move Entry to Occupied Slot**
Attempt to move an entry to a slot already occupied for that teacher or batch. Platform should block with slot occupied/conflict message.

**TT-I-K5 — Move Entry to Non-Working Day**
Move a teacher’s entry to a day they do not work. Platform should block the move.

**TT-I-K6 — Undo Assignment**
Create an entry, then click undo. Entry should be removed and all counts/conflicts should recalculate.

**TT-I-K7 — Redo Assignment**
After undo, click redo. Entry should return to same day/period with same metadata.

**TT-I-K8 — Undo After Copy Week**
If copy week creates many entries, undo should either reverse the copy as a grouped action or clearly reverse one entry at a time. It should not create partial inconsistent state without indication.

**TT-I-K9 — Edit After Publish**
Edit a published week. The platform should indicate whether changes are draft until republished or immediately live.

---

### L. Workspace — Copy Week Scenarios

**TT-I-L1 — Copy Current Batch Week**
In Batch Mode, copy the selected batch’s source week to the next week. Only that batch’s entries should copy.

**TT-I-L2 — Copy Current Teacher Week**
In Teacher Mode, copy the selected teacher’s source week. Only that teacher’s entries should copy.

**TT-I-L3 — Copy All Entries**
When no specific scope is intended, copy all source week entries. Every copied entry should preserve batch, teacher, subject, and facility.

**TT-I-L4 — Copy to Multiple Future Weeks**
Select multiple target weeks. Copied count should equal source valid entries multiplied by target weeks, minus skipped holidays/exam periods.

**TT-I-L5 — Copy With Holiday Skip Enabled**
Target week contains a holiday. Holiday-date entries should be skipped and copied count should reflect skipped entries.

**TT-I-L6 — Copy With Exam Skip Enabled**
Target week contains an exam block. Exam-blocked entries should be skipped.

**TT-I-L7 — Copy Into Occupied Week Without Overwrite**
Target week already has entries. If overwrite is off, platform should skip or warn about existing entries; it must not create duplicate clashes silently.

**TT-I-L8 — Copy Into Occupied Week With Overwrite**
If overwrite is enabled, existing target entries should be replaced only for matching copied slots. Non-matching target entries should remain.

**TT-I-L9 — Copy After Teacher Assignment Changed**
A teacher was removed from a batch after source week was created. Copying that week should flag invalid teacher-batch assignments instead of copying them as valid.

**TT-I-L10 — Copy After Period Structure Changed**
Source week has P8 entries but target setup has only 7 periods. Copy should block or flag invalid period entries.

---

### M. Workspace — Save, Draft & Publish Scenarios

**TT-I-M1 — Save Draft**
Admin saves a draft. UI should show draft status and should not necessarily expose changes downstream until publish, if draft/publish separation is implemented.

**TT-I-M2 — Publish Timetable**
Admin publishes a valid timetable. View Timetable should reflect the published entries for the selected week.

**TT-I-M3 — Publish With Conflicts**
Attempt publishing with teacher clash, batch clash, or overload. Platform should block publish or ask for explicit confirmation depending on severity.

**TT-I-M4 — Republish After Edit**
After publishing, edit one entry and republish. View Timetable and downstream teacher/student schedules should show the updated entry only after republish if publish gating exists.

**TT-I-M5 — Navigation After Save**
Saving from Setup should take the admin to Workspace without losing setup values. Returning to Setup should show saved configuration.

**TT-I-M6 — Refresh Persistence**
After saving/publishing, refresh the browser. Timetable entries, save status, and setup configuration should persist if backend persistence is expected.

---

### N. Upload — Prerequisite Scenarios

**TT-I-N1 — Batch Required Before Upload**
Open Upload Existing Timetable without selecting a batch. Upload area should be disabled or should prompt batch selection.

**TT-I-N2 — File Picker Upload**
Select a valid image through file picker. Preview should display and process button should enable.

**TT-I-N3 — Drag and Drop Upload**
Drag a valid image into the upload area. Preview should display the same as file picker.

**TT-I-N4 — Unsupported File Type**
Upload an unsupported file type. Platform should reject it with a clear message.

**TT-I-N5 — Remove Uploaded Image**
After preview appears, remove it. Preview and parsed state should reset, and admin should be able to upload a different image.

**TT-I-N6 — Change Batch After Upload**
If admin changes selected batch after image upload or parse, validation should rerun. Parsed entries should not remain marked valid for the old batch.

---

### O. Upload — AI Parse & Manual Review Scenarios

**TT-I-O1 — Successful Parse**
Upload a clear timetable image and process it. Parsed grid should show days, periods, subjects, teachers, and confidence indicators.

**TT-I-O2 — Low Confidence Cell**
A parsed entry has confidence below threshold. It should be visually highlighted and listed as a review warning.

**TT-I-O3 — Edit Parsed Cell**
Edit subject and teacher in a parsed cell. Confidence should update to manual/verified state and validation should rerun.

**TT-I-O4 — Add Missing Cell**
Click an empty parsed grid cell and add a missing entry. It should be included in validation and embed count.

**TT-I-O5 — Remove Incorrect Cell**
Remove a wrong parsed entry. It should disappear from grid, validation, and embed payload.

**TT-I-O6 — Duplicate Parsed Slot**
Parsed data contains two entries for the same day/period. Validator should show duplicate slot warning and suggest removal.

**TT-I-O7 — Image Zoom Review**
Zoom in/out on original image. Parsed grid should remain usable and the original image should not distort the page layout.

---

### P. Upload — Validation Scenarios

**TT-I-P1 — Teacher Not Found**
Parsed teacher name does not match any teacher in the institute. Validator should show blocking error and prevent embed.

**TT-I-P2 — Teacher Exists But Not Assigned to Batch**
Parsed teacher exists but is not assigned to selected batch. Validator should show blocking error.

**TT-I-P3 — Subject Not in Batch**
Parsed subject is not part of the selected batch curriculum/course. Validator should show blocking error.

**TT-I-P4 — Teacher Assigned to Batch But Wrong Subject**
Teacher is assigned to selected batch for Chemistry, but uploaded entry says Physics. Platform should block or flag mismatch.

**TT-I-P5 — Curriculum/Course Mismatch**
Teacher teaches Physics in CBSE, but selected batch is JEE Physics. Same subject name should not pass validation unless teacher is assigned to that JEE batch/course.

**TT-I-P6 — Warnings Do Not Block Embed**
Low confidence warning with otherwise valid teacher/batch/subject should allow embed after review.

**TT-I-P7 — Blocking Errors Prevent Embed**
Any teacher-not-found, teacher-not-assigned, or subject-not-in-batch error should disable Embed to Timetable.

**TT-I-P8 — Validation Action Links**
If validator offers “Add Teacher” or “Manage Teachers,” link should navigate to correct page without losing the uploaded context unless intentionally reset.

---

### Q. Upload — Embed Conflict Scenarios

**TT-I-Q1 — Embed Into Empty Workspace**
Parsed valid entries are embedded into an empty selected batch/week. Workspace should open in Batch Mode with entries visible.

**TT-I-Q2 — Embed Into Occupied Slots**
Some parsed entries target slots already occupied in workspace. Platform should show conflict dialog before embedding.

**TT-I-Q3 — Skip Conflicts**
Choose Skip Conflicts. Non-conflicting parsed entries should embed; conflicting entries should not be added.

**TT-I-Q4 — Replace All**
Choose Replace All. Existing entries in conflicting slots should be replaced by parsed entries, not duplicated.

**TT-I-Q5 — Cancel Embed Conflict Dialog**
Cancel conflict dialog. No parsed entries should be embedded.

**TT-I-Q6 — Embedded Entries Trigger Normal Conflict Rules**
After embed, conflict panel should still detect teacher clashes, batch clashes, overloads, and facility conflicts.

**TT-I-Q7 — Embedded Teacher Name Matching**
If upload uses partial teacher names or spelling variations, matched teacher should be correct. Ambiguous matches should require manual review.

---

### R. View / Review Timetable — Weekly View Scenarios

**TT-I-R1 — Weekly View All Batches**
Open View Timetable in weekly mode with All Batches. Table should show entries across batches and include batch labels where needed.

**TT-I-R2 — Filter by Batch**
Select one batch. Weekly view should show only that batch’s entries.

**TT-I-R3 — Filter by Teacher**
Select one teacher. Weekly view should show only that teacher’s entries.

**TT-I-R4 — Combined Batch and Teacher Filters**
Apply both batch and teacher filters. Result should show only entries matching both filters, not either filter.

**TT-I-R5 — Break Rows Display**
Break rows configured in Setup should display between correct periods and should not contain class entries.

**TT-I-R6 — Holiday Display**
A holiday date should show holiday styling and should not show normal class cells as if school is open.

**TT-I-R7 — Exam Block Display**
Exam block should show label/type and blocked styling in affected cells.

**TT-I-R8 — Empty Cells**
Empty slots should display as empty/dash and should not look like loading or broken data.

**TT-I-R9 — Substituted Teacher Display**
If substitution exists, View Timetable should show substitute teacher instead of or alongside original teacher according to product rule.

---

### S. View / Review Timetable — Monthly View Scenarios

**TT-I-S1 — Monthly Calendar Opens**
Switch to monthly view. Calendar should show current month with working days, non-working days, holidays, and current date clearly.

**TT-I-S2 — Month Navigation**
Navigate previous and next month. Display should update without losing selected filters.

**TT-I-S3 — Batch Filter in Monthly View**
Select a batch in monthly view. Daily counts/details should reflect only that batch.

**TT-I-S4 — Teacher Filter in Monthly View**
Select a teacher in monthly view. Calendar should reflect only that teacher’s scheduled classes.

**TT-I-S5 — Holiday in Monthly View**
Holiday should be marked in monthly calendar and not counted as normal working schedule.

**TT-I-S6 — Non-Working Day Display**
Sunday or removed working days should be visually distinct from regular working days.

---

### T. View / Review Timetable — Past, Current & Future Week Scenarios

**TT-I-T1 — Past Week Read-Only**
Navigate to a past week. Edit Week action should be hidden or disabled, and read-only indicator should be visible.

**TT-I-T2 — Current Week Editable**
Navigate to current week. Edit Week action should be available if user has permission.

**TT-I-T3 — Future Week Editable**
Navigate to future week. Edit Week action should be available and should open Workspace for that week.

**TT-I-T4 — Edit Week Navigation Context**
Click Edit Week from View Timetable. Workspace should open with the same week selected, not default to a different week.

**TT-I-T5 — Today Navigation**
Click Today. View should return to the current week/month and maintain reasonable default filters.

---

### U. View / Review Timetable — Export & Print Scenarios

**TT-I-U1 — Print All Batches Weekly View**
Click Export/Print with All Batches selected. Print output should include timetable title, date range, and visible entries.

**TT-I-U2 — Print Batch-Filtered View**
Apply a batch filter and print. Print header/content should reflect selected batch.

**TT-I-U3 — Print Teacher-Filtered View**
Apply a teacher filter and print. Output should not include unrelated teachers.

**TT-I-U4 — Print Holiday/Exam Week**
Print a week with holidays and exam blocks. Blocked states should be readable in print.

**TT-I-U5 — Responsive Review View**
Test View Timetable on tablet and mobile. Filters should remain usable and grid should scroll horizontally without clipping controls.

---

### V. Substitution — Absence Scenarios

**TT-I-V1 — Mark Full-Day Absence**
Select a teacher and mark full-day absent. All that teacher’s scheduled periods for the selected date should appear in Coverage Needed.

**TT-I-V2 — Mark Partial Absence**
Select partial absence and choose specific periods. Only those periods should appear in Coverage Needed.

**TT-I-V3 — Attempt Absence Without Teacher**
Open Mark Teacher Absent and submit without selecting a teacher. Platform should show error and not create absence.

**TT-I-V4 — Cancel Absence**
Cancel an existing absence. Coverage needed and any substitutions attached to that absence should be removed.

**TT-I-V5 — Multiple Teachers Absent Same Day**
Mark two teachers absent on same date. Coverage Needed should group/show all affected periods without mixing teacher names.

**TT-I-V6 — Absence on Holiday**
Select a holiday and mark a teacher absent. Platform should either prevent it or show no coverage needed because no regular classes are scheduled.

**TT-I-V7 — Absence for Teacher With No Classes That Day**
Mark absent a teacher who has no entries on that date/day. Absence should record, but Coverage Needed should remain empty.

---

### W. Substitution — Coverage Needed Scenarios

**TT-I-W1 — Affected Slots Are Accurate**
For a full-day absence, affected slots should match the teacher’s timetable entries for that weekday exactly.

**TT-I-W2 — Urgent Count Updates**
Uncovered affected slots should increase urgent count. Assigning substitutes should decrease urgent count.

**TT-I-W3 — Covered Count Updates**
After assigning substitutes, covered count should match number of covered periods.

**TT-I-W4 — Change Date**
Navigate to another date. Coverage Needed and absence list should refresh for that date only.

**TT-I-W5 — Calendar Absence Indicators**
Dates with absences should be visually marked in the calendar.

**TT-I-W6 — Holiday Coverage Empty State**
Holiday should show holiday message and no coverage needed.

---

### X. Substitution — Substitute Selection Scenarios

**TT-I-X1 — Exclude Original Teacher**
Original absent teacher should not appear as their own substitute.

**TT-I-X2 — Exclude Busy Teachers**
Teachers already scheduled in the same period should not appear as available substitutes.

**TT-I-X3 — Exclude Non-Working-Day Teachers**
Teacher who does not work on that weekday should not appear as substitute.

**TT-I-X4 — Subject Capability Check**
Ideally, substitute suggestions should prioritize or require teachers who can teach the subject/curriculum. If any unrelated teacher can be selected without warning, QA should flag product-rule gap.

**TT-I-X5 — Assign Substitute**
Select an available substitute. Coverage card should show “Covered by” and counts should update.

**TT-I-X6 — Change Substitute**
Change an assigned substitute. Old substitute should be replaced, not duplicated.

**TT-I-X7 — Remove Substitute**
Remove substitution. Slot should return to urgent/uncovered state.

**TT-I-X8 — Substitute Later Becomes Busy**
If substitute is assigned and then another timetable entry is added for that substitute in same slot, system should detect conflict.

---

### Y. Substitution — Cross-Impact Scenarios

**TT-I-Y1 — Substitution Appears in Review Timetable**
After assigning substitute, View Timetable should show substitute teacher for affected slot if substitution visibility is part of product behavior.

**TT-I-Y2 — Substitute Teacher Schedule**
The substitute teacher should see the substitution duty in their schedule if teacher downstream schedule is connected.

**TT-I-Y3 — Original Teacher Schedule**
Original teacher should see absence or removed duty for that period if teacher schedule is connected.

**TT-I-Y4 — Student Schedule Shows Substitute**
Students in affected batch should see substitute teacher name if student timetable is connected.

**TT-I-Y5 — Cancel Absence Propagates**
Cancelling absence should remove substitution from all downstream views.

**TT-I-Y6 — Notification Trigger**
If notifications exist, substitute and absent teacher should receive appropriate notifications when substitution is assigned or changed.

---

### Z. Edge Cases & Regression Risks

**TT-I-Z1 — Teacher Removed From Batch After Timetable Creation**
Remove a teacher-batch assignment after entries exist. Workspace should flag those entries and future assignments should not allow that teacher for the batch.

**TT-I-Z2 — Batch Curriculum Changed After Timetable Creation**
Change a batch from CBSE to ICSE/JEE after timetable exists. Entries whose teacher subject/curriculum no longer match should be flagged.

**TT-I-Z3 — Subject Removed From Batch**
Remove Physics from Class 10-A after Physics entries exist. Existing entries should be flagged and new Physics assignment should be blocked.

**TT-I-Z4 — Teacher Subject Changed**
Remove Mathematics from a teacher. Existing Math entries for that teacher should be flagged and new Math assignments should be blocked.

**TT-I-Z5 — Teacher Deleted or Deactivated**
Deactivate a teacher assigned in timetable. Existing entries should remain auditable but should be marked invalid/requires replacement.

**TT-I-Z6 — Batch Archived or Deactivated**
Archive a batch with timetable entries. It should no longer appear for new scheduling, but historical entries should not break review screens.

**TT-I-Z7 — Facility Deleted After Assignment**
Delete a facility used in timetable. Entries should show missing facility warning rather than broken blank data.

**TT-I-Z8 — Same Teacher Across Multiple Curriculums**
Teacher teaches CBSE Physics and JEE Physics. Assignment UI must distinguish scope and never merge them into one ambiguous Physics option.

**TT-I-Z9 — Same Subject Name Across Batches**
Two batches have Physics but different curriculums. Teacher assigned to one should not automatically become valid for the other.

**TT-I-Z10 — Long Teacher and Batch Names**
Use long teacher names and batch names. Workspace cards, dropdowns, Review Timetable, and print view should not overflow or overlap.

**TT-I-Z11 — Tablet and Mobile Workspace Behavior**
Workspace should remain usable or intentionally guide users to larger screens. Mobile warning should not block View Timetable access.

**TT-I-Z12 — Permission-Based Access**
A role without timetable setup permission should not see Setup actions. A role without workspace permission should not edit timetable. Unauthorized UI should be removed, not merely disabled.

---

## Critical Bugs QA Must Flag Immediately

QA should mark these as high/critical issues:

1. **Teacher appears for a batch they are not assigned to.**
2. **Teacher appears because subject name matches but curriculum/course does not match.**
3. **Batch accepts two classes in the same day and period.**
4. **Teacher accepts two classes in the same day and period.**
5. **Teacher remaining-period count does not change after assignment/removal.**
6. **Overload is not shown when assigned periods exceed weekly load.**
7. **Holiday or exam-blocked slot still accepts regular assignment without warning.**
8. **Copy Week creates duplicates without conflict warning.**
9. **Copy Week ignores skip holiday or skip exam-period settings.**
10. **Upload embeds teacher/batch/subject mismatches.**
11. **Upload validates only teacher name but ignores assigned batch and curriculum/course.**
12. **Substitution suggests the absent teacher as substitute.**
13. **Substitution suggests a teacher already busy in that period.**
14. **Substitution remains after absence is cancelled.**
15. **Published View Timetable differs from Workspace without a clear draft/publish reason.**
16. **Unauthorized users can access timetable setup, workspace, or substitution controls.**
17. **Mid-year setup changes silently delete or hide existing timetable entries.**
18. **Review/print output clips timetable data or omits selected filters.**

---

## Suggested Execution Order for QA

For best coverage, execute in this sequence:

1. **Setup configuration tests** — A to G
2. **Workspace core assignment tests** — H to K
3. **Copy Week and publish tests** — L to M
4. **Upload/Embed tests** — N to Q
5. **Review Timetable tests** — R to U
6. **Substitution tests** — V to Y
7. **Edge cases and regression tests** — Z
8. **Cross-portal propagation tests** — use [Timetable Cross-Portal Tests](./timetable-tests.md)

---

## Related Documentation

- [Timetable Setup](../../02-institute/timetable-setup.md)
- [Timetable Workspace](../../02-institute/timetable-workspace.md)
- [Timetable Substitution](../../02-institute/timetable-substitution.md)
- [Timetable Flow](../../05-cross-login-flows/timetable-flow.md)
- [Timetable Cross-Portal Tests](./timetable-tests.md)
- [Curriculum Scope QA](./curriculum-scope-qa.md)
- [Course Assignment QA](./course-assignment-scope-qa.md)

---

*Last Updated: April 2026*
