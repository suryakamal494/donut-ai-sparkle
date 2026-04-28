# Timetable Substitution & Edge Cases QA

> This document is for testers validating substitution management and recreating high-risk timetable edge cases. It starts scenario lettering from A so substitution and regression testing can be assigned independently.

---

## Before You Begin

Use a published timetable with multiple teachers, multiple batches, holidays, exam blocks, and at least one teacher with no classes on a selected day. Prepare downstream teacher/student accounts if testing schedule propagation after substitution.

---

## Substitution Validation Principle

Substitution should only create coverage for real scheduled classes affected by an absence. The substitute must not be the absent teacher, must not already be busy in the same period, and should respect working-day and subject/curriculum capability rules where implemented.

---

## Test Scenarios

Each scenario below describes an absence, coverage, substitute selection, cross-impact, or regression recreation situation and the expected platform behavior.
### A. Absence Scenarios

**TT-SUB-A1 — Mark Full-Day Absence**
Select a teacher and mark full-day absent. All that teacher’s scheduled periods for the selected date should appear in Coverage Needed.

**TT-SUB-A2 — Mark Partial Absence**
Select partial absence and choose specific periods. Only those periods should appear in Coverage Needed.

**TT-SUB-A3 — Attempt Absence Without Teacher**
Open Mark Teacher Absent and submit without selecting a teacher. Platform should show error and not create absence.

**TT-SUB-A4 — Cancel Absence**
Cancel an existing absence. Coverage needed and any substitutions attached to that absence should be removed.

**TT-SUB-A5 — Multiple Teachers Absent Same Day**
Mark two teachers absent on same date. Coverage Needed should group/show all affected periods without mixing teacher names.

**TT-SUB-A6 — Absence on Holiday**
Select a holiday and mark a teacher absent. Platform should either prevent it or show no coverage needed because no regular classes are scheduled.

**TT-SUB-A7 — Absence for Teacher With No Classes That Day**
Mark absent a teacher who has no entries on that date/day. Absence should record, but Coverage Needed should remain empty.

---

---

### B. Coverage Needed Scenarios

**TT-SUB-B1 — Affected Slots Are Accurate**
For a full-day absence, affected slots should match the teacher’s timetable entries for that weekday exactly.

**TT-SUB-B2 — Urgent Count Updates**
Uncovered affected slots should increase urgent count. Assigning substitutes should decrease urgent count.

**TT-SUB-B3 — Covered Count Updates**
After assigning substitutes, covered count should match number of covered periods.

**TT-SUB-B4 — Change Date**
Navigate to another date. Coverage Needed and absence list should refresh for that date only.

**TT-SUB-B5 — Calendar Absence Indicators**
Dates with absences should be visually marked in the calendar.

**TT-SUB-B6 — Holiday Coverage Empty State**
Holiday should show holiday message and no coverage needed.

---

---

### C. Substitute Selection Scenarios

**TT-SUB-C1 — Exclude Original Teacher**
Original absent teacher should not appear as their own substitute.

**TT-SUB-C2 — Exclude Busy Teachers**
Teachers already scheduled in the same period should not appear as available substitutes.

**TT-SUB-C3 — Exclude Non-Working-Day Teachers**
Teacher who does not work on that weekday should not appear as substitute.

**TT-SUB-C4 — Subject Capability Check**
Ideally, substitute suggestions should prioritize or require teachers who can teach the subject/curriculum. If any unrelated teacher can be selected without warning, QA should flag product-rule gap.

**TT-SUB-C5 — Assign Substitute**
Select an available substitute. Coverage card should show “Covered by” and counts should update.

**TT-SUB-C6 — Change Substitute**
Change an assigned substitute. Old substitute should be replaced, not duplicated.

**TT-SUB-C7 — Remove Substitute**
Remove substitution. Slot should return to urgent/uncovered state.

**TT-SUB-C8 — Substitute Later Becomes Busy**
If substitute is assigned and then another timetable entry is added for that substitute in same slot, system should detect conflict.

---

---

### D. Cross-Impact Scenarios

**TT-SUB-D1 — Substitution Appears in Review Timetable**
After assigning substitute, View Timetable should show substitute teacher for affected slot if substitution visibility is part of product behavior.

**TT-SUB-D2 — Substitute Teacher Schedule**
The substitute teacher should see the substitution duty in their schedule if teacher downstream schedule is connected.

**TT-SUB-D3 — Original Teacher Schedule**
Original teacher should see absence or removed duty for that period if teacher schedule is connected.

**TT-SUB-D4 — Student Schedule Shows Substitute**
Students in affected batch should see substitute teacher name if student timetable is connected.

**TT-SUB-D5 — Cancel Absence Propagates**
Cancelling absence should remove substitution from all downstream views.

**TT-SUB-D6 — Notification Trigger**
If notifications exist, substitute and absent teacher should receive appropriate notifications when substitution is assigned or changed.

---

---

### E. Edge Cases & Regression Risks

**TT-SUB-E1 — Teacher Removed From Batch After Timetable Creation**
Remove a teacher-batch assignment after entries exist. Workspace should flag those entries and future assignments should not allow that teacher for the batch.

**TT-SUB-E2 — Batch Curriculum Changed After Timetable Creation**
Change a batch from CBSE to ICSE/JEE after timetable exists. Entries whose teacher subject/curriculum no longer match should be flagged.

**TT-SUB-E3 — Subject Removed From Batch**
Remove Physics from Class 10-A after Physics entries exist. Existing entries should be flagged and new Physics assignment should be blocked.

**TT-SUB-E4 — Teacher Subject Changed**
Remove Mathematics from a teacher. Existing Math entries for that teacher should be flagged and new Math assignments should be blocked.

**TT-SUB-E5 — Teacher Deleted or Deactivated**
Deactivate a teacher assigned in timetable. Existing entries should remain auditable but should be marked invalid/requires replacement.

**TT-SUB-E6 — Batch Archived or Deactivated**
Archive a batch with timetable entries. It should no longer appear for new scheduling, but historical entries should not break review screens.

**TT-SUB-E7 — Facility Deleted After Assignment**
Delete a facility used in timetable. Entries should show missing facility warning rather than broken blank data.

**TT-SUB-E8 — Same Teacher Across Multiple Curriculums**
Teacher teaches CBSE Physics and JEE Physics. Assignment UI must distinguish scope and never merge them into one ambiguous Physics option.

**TT-SUB-E9 — Same Subject Name Across Batches**
Two batches have Physics but different curriculums. Teacher assigned to one should not automatically become valid for the other.

**TT-SUB-E10 — Long Teacher and Batch Names**
Use long teacher names and batch names. Workspace cards, dropdowns, Review Timetable, and print view should not overflow or overlap.

**TT-SUB-E11 — Tablet and Mobile Workspace Behavior**
Workspace should remain usable or intentionally guide users to larger screens. Mobile warning should not block View Timetable access.

**TT-SUB-E12 — Permission-Based Access**
A role without timetable setup permission should not see Setup actions. A role without workspace permission should not edit timetable. Unauthorized UI should be removed, not merely disabled.

---

---

## Critical Bugs QA Must Flag Immediately

1. Substitution suggests the absent teacher as substitute.
2. Substitution suggests a teacher already busy in that period.
3. Substitution suggests a non-working-day teacher without warning.
4. Substitution remains after absence is cancelled.
5. Holiday dates still create coverage needed for normal classes.
6. Downstream teacher/student timetable shows stale substitution data.
7. Teacher-batch, subject, or curriculum changes do not flag existing timetable entries.
8. Long teacher or batch names overflow in workspace, review, or substitution cards.
9. Unauthorized users can access substitution controls.

---

## Suggested Execution Order

1. Absence creation and cancellation
2. Coverage needed calculations
3. Substitute selection
4. Cross-impact in review/teacher/student views
5. Edge case recreation and regression risks

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
