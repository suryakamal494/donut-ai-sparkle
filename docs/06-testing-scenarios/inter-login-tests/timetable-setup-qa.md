# Timetable Setup QA

> This document is for testers validating timetable configuration before any workspace scheduling begins. It covers working days, period structure, breaks, period types, holidays, teacher loads, exam blocks, constraints, and facilities.

---

## Before You Begin

Prepare a test institute with multiple teachers, batches, curriculums/courses, holidays, exam blocks, and at least one facility. Setup QA should confirm that configuration changes are saved correctly and that existing timetable entries are never silently deleted when setup changes happen mid-year.

### Setup Terms

| Term | What It Means |
|------|---------------|
| Working Day | A day on which classes can normally be scheduled. |
| Period | A schedulable teaching slot within a working day. |
| Break | A non-teaching interval between periods. |
| Time Mapping | Start/end clock time attached to each period. |
| Period Type | Special slot type such as Lab, Library, Sports, or regular teaching. |
| Teacher Load | Expected or allowed weekly periods for a teacher. |
| Hard Constraint | A rule that must block assignment when violated. |
| Soft Constraint | A preference that can warn but may allow assignment. |
| Facility | Room or resource required for a class, such as Physics Lab. |
| Exam Block | Date or period range reserved for exams. |

---

## Setup Validation Principle

Setup changes must not silently destroy timetable data. If a change affects existing entries, the platform should block the change, warn the admin, or clearly mark affected entries for resolution.

---

## Test Scenarios

Each scenario below describes a setup situation and the expected platform behavior.
### A. Period Structure Scenarios

**TT-SETUP-A1 — First-Time Period Setup**
An institute configures Monday to Saturday as working days with 8 periods per day. Workspace and View Timetable should both render exactly those working days and exactly 8 periods, with no extra Sunday or hidden period rows.

**TT-SETUP-A2 — Toggle Working Day Off After Entries Exist**
After Saturday classes are created, the admin removes Saturday from working days. The platform should not silently lose Saturday entries. It should either block the change, warn that existing entries are affected, or clearly mark those entries as invalid until resolved.

**TT-SETUP-A3 — Add New Working Day Mid-Year**
An institute that previously used Monday-Friday adds Saturday. Workspace should allow Saturday scheduling only after saving setup. Existing Monday-Friday entries should remain untouched.

**TT-SETUP-A4 — Reduce Periods Per Day Mid-Year**
A timetable has entries in Period 8. Admin changes periods per day from 8 to 7. Period 8 entries should become flagged/orphaned or require resolution. They should not disappear silently and should not be copied into future weeks without warning.

**TT-SETUP-A5 — Increase Periods Per Day Mid-Year**
Admin changes periods from 7 to 9. Workspace should show new empty P8/P9 cells. Existing entries should remain in their original periods and teacher load should not change until new assignments are made.

**TT-SETUP-A6 — Toggle Time Mapping Display**
Admin turns time mapping off. View Timetable should show period labels without clock times. Turning it back on should restore clock times consistently across Setup, Workspace, and View Timetable.

**TT-SETUP-A7 — Invalid Time Mapping Order**
Admin edits a period so the end time is before the start time, or overlapping with another period. The platform should prevent saving or show a validation error. If it allows the change, QA should flag it.

**TT-SETUP-A8 — Generate Time Slots After Break Edits**
Admin edits breaks and then generates time mappings. Generated period times should include break durations correctly, remain sequential, and not overlap.

---

---

### B. Break Scenarios

**TT-SETUP-B1 — Add One Break**
Admin adds a short break after P2. Workspace and View Timetable should display the break between P2 and P3 and should not allow class assignment inside the break row.

**TT-SETUP-B2 — Add Multiple Breaks in Correct Order**
Admin adds short break, lunch break, and snacks break. Break rows should display in chronological period order, even if they were created in a different order.

**TT-SETUP-B3 — Maximum Break Limit**
Admin attempts to add more than the allowed number of breaks. The platform should block the extra break and show a clear error.

**TT-SETUP-B4 — Move Lunch Break After Timetable Creation**
Lunch is moved from after P4 to after P5 after entries already exist. Period assignments should remain attached to period numbers. Only the break placement and time mapping should change.

**TT-SETUP-B5 — Delete Break Mid-Year**
Admin deletes a break after timetable is built. Time mapping should be regenerated or clearly flagged as needing update. Regular period assignments should not be deleted.

**TT-SETUP-B6 — Break Placed Beyond Available Periods**
Admin tries to set a break after a period number that no longer exists after period count reduction. Platform should block or correct this configuration.

---

---

### C. Period Type Scenarios

**TT-SETUP-C1 — Create Lab Period Type**
Admin creates a Lab period type requiring a teacher and facility. Assignment should require a valid teacher and should show facility options where applicable.

**TT-SETUP-C2 — Create Library Period Type Without Teacher Requirement**
Admin creates Library as a no-teacher period type. Platform should define whether it can be assigned without teacher. If teacher is still required, UI should not imply otherwise.

**TT-SETUP-C3 — Double Period Type**
Admin marks a period type as double-period. Workspace should either reserve two adjacent slots or prevent selection until two valid slots are available.

**TT-SETUP-C4 — Edit Existing Period Type Name/Color**
Admin edits a period type used in existing timetable entries. Existing entries should update display metadata but should not lose their assignment.

**TT-SETUP-C5 — Delete Used Period Type**
Admin deletes or disables a period type already used in the timetable. Platform should prevent deletion or flag affected entries.

---

---

### D. Holiday Scenarios

**TT-SETUP-D1 — Add Holiday Before Building Timetable**
Admin adds a holiday before assigning classes. Workspace and View Timetable should show that date as blocked/holiday and should not require substitution coverage.

**TT-SETUP-D2 — Add Holiday After Classes Exist**
Admin adds a holiday on a date that already has classes. Existing entries should be visibly affected. They should not disappear, but View Timetable should show the holiday state clearly.

**TT-SETUP-D3 — Holiday in Copy Target Week**
Admin copies a week into a target week containing a holiday while “skip holidays” is enabled. Entries for the holiday date should not be copied, while other days should copy normally.

**TT-SETUP-D4 — Copy Week Without Skipping Holidays**
Admin disables “skip holidays” and copies into a week with a holiday. The platform should either allow with warning or block with explanation. It should not silently create hidden classes on a holiday.

**TT-SETUP-D5 — Holiday Calendar Display in Substitution**
Selecting a holiday in Substitution Management should show no coverage needed, even if the same weekday normally has timetable entries.

**TT-SETUP-D6 — Overlapping Holiday and Exam Block**
Admin configures a holiday and exam block on the same date. The platform should display a clear priority or prevent overlap. QA should verify the cell does not show contradictory states.

---

---

### E. Teacher Load Scenarios

**TT-SETUP-E1 — Remaining Period Count Decreases**
A teacher has 26 weekly periods allowed and 18 assigned. Assign one new period in Workspace. The UI should show 7 remaining, not 8. Removing that entry should restore the count.

**TT-SETUP-E2 — Weekly Load Limit Reached**
Set a teacher’s weekly load to 10 and assign 10 periods. Attempt the 11th period. Platform should block or show overload warning according to business rule. If it allows assignment, Conflict Panel must show overload.

**TT-SETUP-E3 — Load Reduced After Assignments**
Teacher has 24 assigned periods. Admin reduces weekly load to 20. Existing entries should remain but teacher should be marked overloaded. New assignments should be blocked or warned.

**TT-SETUP-E4 — Load Increased After Overload**
Teacher is overloaded at 26/24. Admin increases limit to 28. Overload warning should disappear after setup is saved and workspace recalculates.

**TT-SETUP-E5 — Copy Week Affects Load**
Copying a teacher’s week should not incorrectly count copied entries into the source week load display if load is meant per week. If load is global across all copied weeks, the UI must clearly state that.

**TT-SETUP-E6 — Teacher Load and Subject Scope Together**
A teacher may have remaining periods but should still not appear for a batch where they are not assigned. Remaining capacity must not override teacher-batch-scope validation.

---

---

### F. Exam Schedule Scenarios

**TT-SETUP-F1 — Create All-Batch Exam Block**
Admin creates an exam block for all batches. View Timetable should show blocked cells for all batches in the affected periods/dates.

**TT-SETUP-F2 — Create Batch-Specific Exam Block**
Admin creates an exam block only for Class 10-A. View Timetable filtered to Class 10-A should show the block. Other batches should remain schedulable unless separately blocked.

**TT-SETUP-F3 — Workspace Assignment During Exam Block**
Admin attempts to assign a regular class to a blocked exam slot. Platform should prevent assignment or show a strong warning before allowing override.

**TT-SETUP-F4 — Copy Week Skips Exam Periods**
Admin copies a week into a week containing exam periods with “skip exam periods” enabled. Entries should not be copied into exam-blocked slots.

**TT-SETUP-F5 — Exam Block After Published Timetable**
Admin publishes timetable, then adds an exam block over existing regular classes. View Timetable should clearly show the exam block priority and identify affected regular classes if such review exists.

**TT-SETUP-F6 — Exam Block Removed**
Admin removes the exam block. Regular classes should reappear if they were never deleted, or the system should clearly require re-scheduling if they were removed.

---

---

### G. Advanced Constraints & Facilities Scenarios

**TT-SETUP-G1 — Hard Unavailable Day Constraint**
Teacher is marked unavailable on Wednesday with hard constraint. Assigning that teacher on Wednesday should be blocked.

**TT-SETUP-G2 — Soft Avoid First Period Constraint**
Teacher prefers to avoid P1 as a soft constraint. Assigning P1 should show a warning but may allow assignment if business rules permit.

**TT-SETUP-G3 — Max Periods Per Day**
Teacher has max 5 periods/day. After 5 periods are assigned on Monday, assigning the 6th Monday period should be blocked or flagged based on constraint level.

**TT-SETUP-G4 — Time Window Constraint**
Teacher is available only P2-P6. Attempting P1 or P7 should show a constraint warning/block.

**TT-SETUP-G5 — Facility Conflict**
Two batches require the same Physics Lab at Monday P3. The second assignment should be blocked or facility should be disabled with conflict indicator.

**TT-SETUP-G6 — Facility Class Restriction**
A facility is allowed only for Class 11/12. It should not appear or should be disabled for Class 8/9/10 batches.

**TT-SETUP-G7 — Facility Availability Window**
A facility available only on Tuesday P1-P4 should not be assignable on Friday P6.

**TT-SETUP-G8 — Facility Removed After Assignment**
If a facility used in existing timetable is disabled or removed, affected timetable entries should be flagged rather than silently losing facility context.

---

---

## Critical Bugs QA Must Flag Immediately

1. Setup changes silently delete or hide existing timetable entries.
2. Working-day changes do not reflect in Workspace or View Timetable.
3. Break rows become assignable class slots.
4. Invalid time mappings can be saved without warning.
5. Teacher remaining-period count does not update after load changes.
6. Overload is not shown when assigned periods exceed weekly load.
7. Holiday or exam-blocked slots still accept regular assignment without warning.
8. Facility conflicts or facility restrictions are ignored.

---

## Suggested Execution Order

1. Period structure
2. Breaks
3. Period types
4. Holidays
5. Teacher loads
6. Exam blocks
7. Constraints and facilities

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
