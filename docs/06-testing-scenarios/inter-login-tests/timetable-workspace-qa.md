# Timetable Workspace QA

> This document is for testers validating timetable creation, editing, conflict detection, copy week, save/publish behavior, and review/export views. It starts scenario lettering from A so this page can be assigned independently.

---

## Before You Begin

Use a test institute where setup is already configured and teacher-batch-subject mappings exist across multiple curriculums/courses. Include at least one teacher assigned to multiple batches, one teacher with limited working days, one overloaded teacher case, holidays, exam blocks, and existing timetable entries.

---

## How To Read These Scenarios

Each scenario is written in three short blocks so a first-time tester can understand the situation without needing the developer to explain it:

- **What this is** — the situation in plain language.
- **What to try** — the conditions to set up and a few variations worth exploring. Don't treat it as a single fixed path; the goal is to genuinely stress the rule.
- **Expected** — what a passing test looks like.

Titles are written so you can understand the test from the title alone.

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

### A. Teacher Mode Scenarios

**TT-WORKSPACE-A1 — Teacher Mode Should Only Offer Batches That Teacher Is Officially Assigned To**

*What this is:* In Teacher Mode, when an admin opens the assignment dialog for a teacher, the batch list must only include batches where that teacher has been officially mapped — not every batch in the institute that happens to teach the same subject.

*What to try:* Pick a teacher mapped to Class 10-A Physics and Class 10-B Physics, but not to Class 10-C Physics. Open the assignment dialog from different empty slots. Try the same with a teacher mapped to a single batch and with a teacher mapped to four or five batches. Also try after adding or removing a batch assignment in master data, to confirm the dialog reflects the latest mapping.

*Expected:* Only the batches that teacher is officially assigned to appear in the picker. No unrelated batch ever appears, even if the subject name matches.

---

**TT-WORKSPACE-A2 — Dragging A Single-Batch Teacher Should Skip The Batch Picker**

*What this is:* When a teacher is mapped to exactly one batch and one subject, dragging them onto a free slot should assign them directly. The system already knows where they belong and shouldn't bother the admin with a popup.

*What to try:* Find or create a teacher mapped to exactly one batch and one subject. Drag them into different empty slots across multiple days. Try with another such single-mapping teacher. Then add a second batch to that teacher in master data and confirm the behavior changes (picker now appears).

*Expected:* The slot fills directly with the correct teacher, batch, and auto-mapped subject. No batch picker appears for true single-mapping teachers.

---

**TT-WORKSPACE-A3 — Dragging A Multi-Batch Teacher Should Open A Batch Picker With The Right Subject Per Batch**

*What this is:* When a teacher teaches several batches, the system can't guess which one — so dragging them must open a batch picker. Each option must show the subject that teacher actually teaches in that batch, not a generic subject list.

*What to try:* Drag a teacher who is assigned to two or three batches into an empty slot. Look at the subject shown next to each batch option. Try with a teacher who teaches different subjects in different batches (e.g., Physics in 10-A, Chemistry in 11-B) and verify each row shows the correct subject. Repeat from different days and periods.

*Expected:* The batch picker opens, each batch row shows the correct subject for that teacher, and the admin cannot pick an unrelated subject.

---

**TT-WORKSPACE-A4 — Selecting A Batch That Already Has A Class At That Period Should Be Blocked**

*What this is:* In Teacher Mode, after picking a teacher, if the chosen batch already has a class at the same day/period, the system must not let you place another class on top of it.

*What to try:* Assign Class 10-A Monday P3 to any subject. Then in Teacher Mode pick a different teacher and try to assign them to Class 10-A Monday P3. Try the same scenario in different periods and across multiple batches. Also try via drag-drop and via the dialog.

*Expected:* The conflicting batch is either disabled in the picker or the assignment is blocked with a clear "batch already has a class at this period" message.

---

**TT-WORKSPACE-A5 — Same Teacher Cannot Be Placed In Two Batches At The Same Time**

*What this is:* A teacher is one human. The system must not allow the same teacher to be placed into two different batches at the same day and period.

*What to try:* Assign a teacher to Class 10-A Monday P3. Then try to assign the same teacher to Class 10-B Monday P3. Try this from Teacher Mode and Batch Mode. Also try by dragging an existing entry on top of another teacher's slot for the same period.

*Expected:* Either the second assignment is blocked outright, or it lands but the conflict panel immediately raises a teacher clash naming both batches and the period.

---

**TT-WORKSPACE-A6 — Teacher Cannot Be Scheduled On A Day They Don't Work**

*What this is:* If a teacher's working days exclude a particular weekday (e.g., they don't work Wednesdays), the system must reject any attempt to schedule them on that day.

*What to try:* Set a teacher's working days to exclude Wednesday in setup. Drag that teacher onto Wednesday slots in Teacher Mode and try to pick them in Batch Mode for Wednesday. Also try assigning another teacher and then dragging the entry onto Wednesday.

*Expected:* The platform rejects every Wednesday assignment with a clear non-working-day message. The teacher should ideally be visually disabled for Wednesday.

---

**TT-WORKSPACE-A7 — Subject Should Auto-Fill From The Teacher–Batch Relationship, Not Be Free Choice**

*What this is:* When a teacher teaches different subjects in different batches, picking a batch should auto-fill the correct subject. The admin must not be able to type or pick an arbitrary subject the teacher doesn't teach for that batch.

*What to try:* Use a teacher who teaches Physics in Class 10-A and Mathematics in Class 11-B. In Teacher Mode, pick that teacher and switch the batch selection between 10-A and 11-B. Then try to manually change the subject to something unrelated (e.g., Chemistry) and see if it's allowed.

*Expected:* The subject auto-updates as the batch changes and cannot be overridden to a subject outside the teacher's mapping for that specific batch.

---

**TT-WORKSPACE-A8 — Same Subject Name Across Different Curriculums Must Not Bypass Scope**

*What this is:* "Physics" in CBSE and "Physics" in JEE share a name but belong to different curriculum/course scopes. A teacher assigned to CBSE Physics must not become assignable to a JEE Physics batch just because the subject name matches.

*What to try:* Set up a teacher assigned only to a CBSE Physics batch. Try to assign that teacher to a JEE Physics batch in both Teacher Mode and Batch Mode. Then explicitly add the JEE batch to the teacher's master data and try again to confirm it now works.

*Expected:* Without an explicit JEE assignment the teacher is rejected for the JEE batch. After the assignment is added in master data, they become assignable.

---

### B. Batch Mode Scenarios

**TT-WORKSPACE-B1 — Batch Mode Should Only Show Teachers Assigned To That Batch And Available That Day**

*What this is:* In Batch Mode, the teacher dropdown for a slot must only contain teachers officially assigned to that batch and whose working days include the chosen day.

*What to try:* Select Class 10-A and open the teacher dropdown for Monday and again for Saturday. Compare the lists. Also try with a teacher whose working days exclude Saturday and confirm they vanish from Saturday's dropdown but stay for Monday.

*Expected:* Only assigned teachers appear, and non-working-day teachers are excluded for that specific day.

---

**TT-WORKSPACE-B2 — A Teacher Who Teaches The Subject But Isn't Assigned To That Batch Must Not Appear**

*What this is:* The dropdown must filter by batch assignment, not just by subject capability. A Physics teacher who isn't mapped to Class 10-A should never show up in Class 10-A's teacher list.

*What to try:* Identify a Physics teacher not assigned to Class 10-A. Open Class 10-A Batch Mode and check whether they appear in the teacher dropdown. Then officially assign them to Class 10-A in master data and confirm they now appear.

*Expected:* They are absent before the master-data assignment and present after.

---

**TT-WORKSPACE-B3 — When A Teacher Is Assigned To A Batch For Only One Subject, Only That Subject Should Be Allowed**

*What this is:* If a teacher is assigned to Class 10-A only for Chemistry, picking them must auto-fill Chemistry and must not allow the admin to switch the subject to Physics for the same assignment.

*What to try:* Create or pick such a teacher. In Class 10-A Batch Mode, select them and observe the auto-filled subject. Try to change the subject manually to Physics. Repeat from a different day and period.

*Expected:* The subject auto-fills as Chemistry and cannot be changed to anything outside that teacher's batch-subject mapping.

---

**TT-WORKSPACE-B4 — Wrong-Curriculum Teacher Must Not Appear For A Batch Even When Subject Names Match**

*What this is:* A teacher mapped to JEE Physics should not appear in the teacher dropdown for a CBSE Physics batch unless they're explicitly mapped to that CBSE batch too.

*What to try:* Use a teacher with only JEE assignments. In a CBSE Physics batch's teacher dropdown, look for them. Then add the CBSE batch to the teacher in master data and confirm they appear.

*Expected:* Absent before the CBSE assignment, present after.

---

**TT-WORKSPACE-B5 — A Batch Cannot Have Two Different Classes In The Same Slot**

*What this is:* A batch is a group of students in one room. Two different subjects or teachers cannot be scheduled for the same batch at the same day/period.

*What to try:* Assign Mathematics to Class 10-A Monday P1. Then try to add Physics to Class 10-A Monday P1 with a different teacher. Try via drag-drop, via the assignment dialog, and via Copy Week into the same slot.

*Expected:* The second placement is blocked or the conflict panel immediately raises a batch clash for that slot.

---

**TT-WORKSPACE-B6 — A Teacher Already Busy In Another Batch Should Be Disabled For The Same Slot**

*What this is:* In Batch Mode, the teacher dropdown for a slot must hide or disable teachers who are already teaching another batch at that exact day and period.

*What to try:* Assign a teacher to Class 10-B Monday P2. Switch to Class 10-A and open the teacher dropdown for Monday P2. Look for that teacher. Repeat for several teachers and slots.

*Expected:* The busy teacher is disabled or hidden for that slot. They reappear once the other booking is removed.

---

**TT-WORKSPACE-B7 — Empty Teacher List Should Show A Clear Empty State**

*What this is:* If a batch and day combination has no eligible teacher, the dropdown should clearly say so instead of looking like a broken UI element.

*What to try:* Pick a batch and a day where no assigned teacher works (e.g., a Saturday for a batch whose teachers are all Mon–Fri). Open the teacher dropdown. Try the same in a few different combinations.

*Expected:* A clear empty-state message appears (e.g., "No teachers available for this batch on this day"), not a blank or loading-looking dropdown.

---

**TT-WORKSPACE-B8 — Switching Between Batches Should Refresh The Grid Cleanly**

*What this is:* When the admin switches from one batch to another in Batch Mode, the grid must show the new batch's entries only — no leftover entries from the previously selected batch.

*What to try:* Make several entries in Class 10-A. Switch to Class 10-B. Switch back. Switch to a third batch with fewer entries. Try this several times rapidly to spot any caching or refresh bugs.

*Expected:* Each batch's grid shows only its own entries, with no stale data appearing from a previously viewed batch.

---

### C. Conflict Detection Scenarios

**TT-WORKSPACE-C1 — Same Teacher Cannot Be In Two Classrooms At The Same Time**

*What this is:* The single most damaging timetable error — the same teacher placed into two different batches at the same day and period. The conflict engine must catch this every time, regardless of how the clash was created.

*What to try:* Assign a teacher to Class 10-A Monday P3, then try to also assign them to Class 10-B Monday P3. Reproduce the same situation from Teacher Mode and from Batch Mode, via drag-drop and via the assignment dialog. Also try producing the clash by Copy Week into a slot where the teacher is already booked.

*Expected:* Either the second assignment is blocked outright, or it lands but the conflict panel immediately shows a clear teacher-clash entry naming both batches, the teacher, and the period.

---

**TT-WORKSPACE-C2 — One Batch Cannot Have Two Different Classes Running Simultaneously**

*What this is:* A batch sits in one room at one time. Two classes (different subjects or teachers) cannot occupy the same batch at the same day/period.

*What to try:* Place a Mathematics class in Class 10-A Monday P1. Then attempt to place a Physics class in the same slot with a different teacher. Try in both modes, via drag and dialog. Also try via Copy Week.

*Expected:* Either the placement is blocked or the conflict panel raises a batch-clash entry naming the batch, both classes, and the period.

---

**TT-WORKSPACE-C3 — Teacher Should Not Exceed Their Weekly Period Limit**

*What this is:* Every teacher has a weekly period cap (e.g., 24 periods). Once that cap is hit, additional assignments either need to be blocked or clearly flagged as overload — they should never silently exceed the limit.

*What to try:* Pick a teacher with a known weekly load (e.g., 24). Assign exactly 24 periods, then try the 25th. Try the 25th in both Teacher Mode and Batch Mode, and via Copy Week. Also try lowering the teacher's cap in setup after they're already at the limit.

*Expected:* The 25th assignment is either blocked with an overload message or accepted with an immediate overload entry in the conflict panel showing the assigned vs allowed count.

---

**TT-WORKSPACE-C4 — Conflict Badge Number Must Match The Real Problems In The Grid**

*What this is:* The toolbar shows a count of conflicts. That number must match the actual unique conflict groups in the grid — not double-count, not miss any.

*What to try:* Deliberately create one teacher clash and one batch clash, then check the badge number. Add an overload, recheck. Resolve one conflict and verify the badge decreases by exactly one. Try situations where one entry is involved in two different conflicts at once.

*Expected:* The badge count always matches the number of distinct conflict groups visible in the conflict panel. Resolving a conflict decreases it by the right amount.

---

**TT-WORKSPACE-C5 — Clicking A Conflict Should Take You To The Affected Slot**

*What this is:* The conflict panel is meant to be actionable. Clicking a conflict entry should navigate the workspace to the relevant teacher or batch and highlight the affected slot, so the admin can resolve it instantly.

*What to try:* Create a teacher clash and click it from the conflict panel. Then create a batch clash and click it. Try with the workspace currently in a different mode or batch from the conflict. Also try clicking when the conflict is in a different week.

*Expected:* The workspace switches mode/batch/week as needed and the affected slot is brought into view and visually highlighted.

---

**TT-WORKSPACE-C6 — Removing A Conflicting Entry Should Clear The Conflict Immediately**

*What this is:* When the user removes one of the two entries causing a conflict, the conflict panel must update right away — no stale conflict entries.

*What to try:* Create a teacher clash by placing the same teacher in two batches at the same slot. Remove one of the two entries. Watch the conflict panel and badge count. Try the same with batch clashes and overloads.

*Expected:* The resolved conflict disappears from the panel instantly and the badge count drops accordingly.

---

**TT-WORKSPACE-C7 — Moving A Conflicting Entry To A Free Slot Should Resolve The Conflict Without Creating A New One**

*What this is:* When a clashing entry is dragged to a free, valid slot, the conflict must clear and the move must not silently create a new clash elsewhere.

*What to try:* Create a teacher clash, then drag one of the two entries to a different free slot for the same teacher. Confirm the original clash is gone. Then deliberately drag it to another slot where a new clash will occur to confirm the new clash is detected.

*Expected:* Moving to a free slot resolves the clash cleanly. Moving to another conflicting slot creates a new conflict entry that is immediately visible.

---

**TT-WORKSPACE-C8 — Two Classes Using The Same Facility At The Same Time Must Be Detected**

*What this is:* When two different classes both require the same facility (e.g., Physics Lab) in the same period, that's a real-world room clash. The conflict engine should flag it. If the product currently doesn't, QA must record this gap.

*What to try:* Create two classes in different batches, both requiring the same facility, both at Monday P3. Try the same facility across two teachers, two days, and adjacent periods. Also try with a facility that has limited capacity if such a setting exists.

*Expected:* A facility-clash conflict appears in the conflict panel. If no such conflict is shown, QA flags it as a missing rule.

---

**TT-WORKSPACE-C9 — Hard And Soft Constraint Violations Should Be Visible**

*What this is:* Hard constraints (must-not-violate) and soft constraints (preferences) should both surface in the workspace — hard ones should block or be flagged as errors, soft ones should warn but may allow assignment.

*What to try:* Set a hard constraint on a teacher (e.g., never on Wednesday) and try to violate it. Then set a soft constraint (e.g., avoid first period) and try to violate that. Compare how each appears in the conflict panel and at assignment time.

*Expected:* Hard violations either block the assignment or appear as errors. Soft violations show as warnings. Hidden violations (no UI feedback at all) must be flagged as a bug.

---

### D. Edit, Move, Undo/Redo Scenarios

**TT-WORKSPACE-D1 — Clicking An Existing Entry Should Open Its Full Details**

*What this is:* Clicking an existing entry should open a dialog showing the actual subject, teacher, batch, period, and any facility — so the admin can verify or edit.

*What to try:* Click entries created via different routes (manual assign, drag, copy week). Try entries with and without facilities. Also try entries in past weeks and future weeks.

*Expected:* The dialog always shows accurate, current details for the entry — never stale or empty fields.

---

**TT-WORKSPACE-D2 — Removing An Entry Should Clear The Slot, Update Counts, And Enable Undo**

*What this is:* When an entry is removed, the slot must clear immediately, the teacher's remaining-period counter must reflect the freed period, and undo must become available.

*What to try:* Remove entries one by one from different teachers and batches. Watch the remaining-period counter for each teacher. Confirm undo is offered after each removal. Try removing a conflicting entry to also confirm the conflict resolves.

*Expected:* The slot clears, the counter updates correctly, and undo is available.

---

**TT-WORKSPACE-D3 — Moving An Entry To A Valid Empty Slot Should Preserve All Its Metadata**

*What this is:* Dragging an existing entry to a different valid empty slot should keep the same teacher, batch, subject, and any facility — only the day/period changes.

*What to try:* Move entries within the same day, across days, and to different periods. Try entries that include facilities. Also try moving in both Teacher Mode and Batch Mode.

*Expected:* The entry appears in the new slot with all metadata intact and disappears from the old slot.

---

**TT-WORKSPACE-D4 — Moving An Entry To An Already-Occupied Slot Should Be Blocked**

*What this is:* If the target slot is already occupied for that teacher or that batch, the move must be blocked with a clear conflict message — not silently overwrite.

*What to try:* Drag an entry on top of another entry for the same teacher in another batch (teacher conflict) and on top of another entry for the same batch (batch conflict). Try this in both modes.

*Expected:* The move is blocked with a clear "slot occupied" or conflict message, and the original entry stays in place.

---

**TT-WORKSPACE-D5 — Moving A Teacher's Entry To A Day They Don't Work Should Be Blocked**

*What this is:* Even via drag, the non-working-day rule must hold. A teacher's entry cannot be moved to a day the teacher doesn't work.

*What to try:* Pick a teacher whose working days exclude Wednesday. Try to drag one of their existing entries onto Wednesday. Try several teachers with different non-working days.

*Expected:* The move is blocked with a non-working-day message, and the entry stays in its original slot.

---

**TT-WORKSPACE-D6 — Undo Should Reverse The Last Change And Recalculate Counts/Conflicts**

*What this is:* Undo should restore the workspace to the state immediately before the last action — entries, counts, and conflicts all aligned with that state.

*What to try:* Make an assignment, then undo. Remove an entry, then undo. Move an entry, then undo. Watch the teacher remaining-period counter and the conflict panel after each undo.

*Expected:* The previous state returns exactly. Counts and conflicts match what they were before the action.

---

**TT-WORKSPACE-D7 — Redo Should Restore What Was Just Undone**

*What this is:* After an undo, redo should reapply the same action with the same metadata.

*What to try:* Assign an entry, undo, then redo. Try the same with a removal and a move. Try a sequence of multiple undos followed by multiple redos.

*Expected:* Each redo restores exactly what the corresponding undo removed, in the right order.

---

**TT-WORKSPACE-D8 — Undo After Copy Week Should Either Reverse The Whole Copy Or Be Clearly Stepwise**

*What this is:* Copy Week creates many entries at once. Undo should either reverse the entire copy as one logical action, or clearly reverse one entry at a time — but it must not leave the workspace in a confusing partially-undone state without indication.

*What to try:* Copy a fully populated week into the next week. Click undo and observe what happens. Repeat undo a few more times. Note whether the UI clearly tells the admin how many entries were reversed.

*Expected:* The undo behavior is consistent and clearly communicated. The admin always knows what state the workspace is in.

---

**TT-WORKSPACE-D9 — Editing A Published Week Should Make It Clear Whether Changes Are Live Or Draft**

*What this is:* When the admin edits an already-published week, the platform must indicate whether those edits are immediately visible to teachers/students or are held as a draft until republished.

*What to try:* Publish a week. Then edit one entry. Look for any draft indicator, badge, or warning. Check what teachers and students see in their schedules right after the edit.

*Expected:* The behavior is unambiguous — either a clear draft state with a republish action, or a clear "changes are live immediately" indicator.

---

### E. Copy Week Scenarios

**TT-WORKSPACE-E1 — Copying A Batch's Week Should Only Copy That Batch's Entries**

*What this is:* In Batch Mode, Copy Week with the current batch as scope should only duplicate entries belonging to that batch — not pull in other batches' entries.

*What to try:* Select Class 10-A and copy its week to next week. Inspect next week's entries for that batch and for other batches. Repeat for a few different batches.

*Expected:* Only the selected batch's entries are copied; other batches' next-week schedules remain unaffected.

---

**TT-WORKSPACE-E2 — Copying A Teacher's Week Should Only Copy That Teacher's Entries**

*What this is:* In Teacher Mode, Copy Week with the current teacher as scope should only duplicate entries belonging to that teacher across the relevant batches.

*What to try:* Select a teacher and copy their week to next week. Verify other teachers' next-week schedules are unchanged.

*Expected:* Only the selected teacher's entries are copied to the target week.

---

**TT-WORKSPACE-E3 — Copying All Entries Should Preserve Every Entry's Metadata**

*What this is:* When the admin copies all entries from a source week, every copied entry must keep its batch, teacher, subject, and facility intact.

*What to try:* Build a varied source week with many batches, teachers, and at least a few facility-bound entries. Copy the entire week. Inspect a sample of copied entries from different batches.

*Expected:* Every copied entry shows the same batch, teacher, subject, and facility as the source.

---

**TT-WORKSPACE-E4 — Copying To Multiple Future Weeks Should Multiply Correctly And Skip Blocked Dates**

*What this is:* When the admin selects multiple target weeks, the copied count should equal source-week valid entries times the number of target weeks, minus entries skipped because of holidays or exam blocks in those weeks.

*What to try:* Copy a fully populated source week into three future weeks where one week has a holiday and another has a one-day exam block. Compare the actual copied count with the math.

*Expected:* The copied count matches the calculation. The summary clearly states how many entries were skipped and why.

---

**TT-WORKSPACE-E5 — Copying Into A Week With A Holiday Should Skip Holiday Dates**

*What this is:* When "skip holidays" is on, a copy into a week containing a holiday must not place classes on the holiday date — even though the source week had classes that day.

*What to try:* Create a source week with classes on Friday. Mark a Friday holiday in a target week. Copy with skip-holidays enabled. Then turn the setting off and try again to confirm the difference.

*Expected:* With skip-holidays on, the holiday date stays empty and the summary shows the skip count. With skip-holidays off, behavior follows the documented rule (warn or allow).

---

**TT-WORKSPACE-E6 — Copying Into A Week With An Exam Block Should Skip Exam-Blocked Slots**

*What this is:* Periods covered by an exam block must not receive copied class entries when the exam-skip setting is on.

*What to try:* Mark an all-batch exam block on Wednesday P1–P3 in the target week. Copy a source week that has classes in those slots. Verify the result.

*Expected:* Wednesday P1–P3 stays exam-blocked and no class is placed there. The summary reflects the skipped entries.

---

**TT-WORKSPACE-E7 — Copying Into An Already-Occupied Week Without Overwrite Must Not Create Silent Duplicate Clashes**

*What this is:* If the target week already has entries and overwrite is off, the copy should either skip the conflicting slots or warn — it must not just stack a duplicate entry on top and create silent clashes.

*What to try:* Pre-populate the target week with a few entries. Copy a source week that overlaps several of those slots, with overwrite off. Inspect the conflicts and the actual entries placed.

*Expected:* Conflicting slots are skipped or warned about. No silent duplicates appear.

---

**TT-WORKSPACE-E8 — Copying With Overwrite On Should Replace Only The Matching Slots**

*What this is:* When overwrite is on, conflicting target slots should be replaced by the source entries — but unrelated target entries must be left alone.

*What to try:* Pre-populate the target week with entries in some slots that overlap the source and others that don't. Copy with overwrite on. Inspect both overlapping and non-overlapping slots.

*Expected:* Overlapping slots now contain the source entries. Non-overlapping target entries remain untouched.

---

**TT-WORKSPACE-E9 — Copying After A Teacher's Batch Assignment Was Removed Should Flag, Not Silently Carry Over**

*What this is:* If a teacher was removed from a batch after the source week was created, copying that source week must not carry the now-invalid teacher-batch entries into the target week as if they were valid.

*What to try:* Create a source week with a teacher assigned to a batch. Remove that teacher-batch assignment in master data. Copy the source week to a target week.

*Expected:* The invalid entries are flagged or skipped with a clear message. They are not silently created in the target week as valid entries.

---

**TT-WORKSPACE-E10 — Copying When The Period Structure Has Changed Should Flag Or Block Out-Of-Range Entries**

*What this is:* If the source week has entries in P8 but the current setup only has 7 periods, those entries cannot be cleanly copied. The system must flag or block them.

*What to try:* Reduce periods per day from 8 to 7 in setup. Try to copy a source week that contains P8 entries.

*Expected:* The copy either blocks with an explanation or completes the copy for valid periods only and clearly reports the skipped P8 entries.

---

### F. Save, Draft & Publish Scenarios

**TT-WORKSPACE-F1 — Saving As Draft Should Not Expose Changes Downstream**

*What this is:* If the product separates drafts from publish, saving as a draft must keep the changes hidden from teachers and students until the admin publishes.

*What to try:* Edit a published week, save as draft. Log in as a teacher and a student to check whether they see the change. Try this with several different kinds of edits (add, remove, move).

*Expected:* The workspace shows draft status. Teacher and student schedules continue to show the previously published version until the admin publishes.

---

**TT-WORKSPACE-F2 — Publishing Should Make The Timetable Visible In Review And Downstream Views**

*What this is:* After publish, View Timetable should reflect the published entries for the selected week, and downstream teacher/student schedules should match.

*What to try:* Build and publish a week. Open View Timetable and inspect the entries. Then check teacher and student schedules.

*Expected:* All views show the published entries consistently for that week.

---

**TT-WORKSPACE-F3 — Publishing A Timetable That Still Has Conflicts Should Be Blocked Or Confirmed**

*What this is:* The admin must not be able to publish a timetable with unresolved conflicts (teacher clash, batch clash, overload) without an explicit confirmation, depending on severity.

*What to try:* Create a week with one teacher clash. Try to publish. Then try with a batch clash. Then with an overload only. Compare the system's behavior in each case.

*Expected:* Hard conflicts block publish. Softer issues (e.g., overload) at minimum require explicit confirmation. Silent publishing of clashing data is a bug.

---

**TT-WORKSPACE-F4 — After Editing A Published Week, Republishing Should Update Downstream Views**

*What this is:* If publish gating exists, edits made after publish should not appear in downstream teacher/student views until the admin republishes — and republishing should immediately update them.

*What to try:* Publish a week. Edit one entry. Check teacher/student views — they should still show the original. Then republish and check again.

*Expected:* Downstream views update only after republish, and the new entry appears for everyone affected.

---

**TT-WORKSPACE-F5 — Saving From Setup Should Move The Admin To Workspace Without Losing Setup Values**

*What this is:* Saving the setup screen should preserve the configuration and take the admin into the workspace cleanly — not reset the setup form or land on the wrong week.

*What to try:* Make several setup changes (working days, periods, breaks) and save. Confirm you land in workspace. Return to setup and verify the values are still there.

*Expected:* The workspace opens with the right context and setup values are preserved.

---

**TT-WORKSPACE-F6 — Saved And Published State Should Survive A Browser Refresh**

*What this is:* After saving or publishing, refreshing the browser should not lose entries, save status, or setup configuration — assuming backend persistence is part of the build.

*What to try:* Save a draft, refresh, and check status. Publish, refresh, and check the published view. Edit setup, save, refresh.

*Expected:* All saved and published state survives the refresh cleanly.

---

### G. View Timetable — Weekly View Scenarios

**TT-WORKSPACE-G1 — Weekly View With All Batches Should Show Every Batch's Entries With Clear Labels**

*What this is:* In weekly mode with the All Batches filter, the view should show entries across all batches and clearly label which batch each entry belongs to.

*What to try:* Open weekly view with All Batches. Scan a few crowded slots and verify batch labels are visible. Try with very long batch names too.

*Expected:* Every entry shows or links its batch label clearly. No entry is shown without batch context.

---

**TT-WORKSPACE-G2 — Filtering By A Single Batch Should Show Only That Batch's Entries**

*What this is:* Selecting one batch in the weekly view should hide every entry that doesn't belong to that batch.

*What to try:* Apply different batch filters one by one. Spot-check days and periods.

*Expected:* Only the selected batch's entries are shown.

---

**TT-WORKSPACE-G3 — Filtering By A Single Teacher Should Show Only That Teacher's Entries**

*What this is:* Selecting one teacher should hide every entry that doesn't belong to that teacher.

*What to try:* Apply different teacher filters. Try with teachers who have many entries and teachers with few.

*Expected:* Only the selected teacher's entries are shown.

---

**TT-WORKSPACE-G4 — Combined Batch And Teacher Filters Should Apply As AND, Not OR**

*What this is:* When both filters are set, the view should show only entries matching both — not entries matching either.

*What to try:* Pick a teacher and a batch where you know the intersection is small. Apply both filters. Verify the visible entries belong to that teacher AND that batch.

*Expected:* The intersection is shown — never a union.

---

**TT-WORKSPACE-G5 — Break Rows Should Display In The Right Position And Never Hold Class Entries**

*What this is:* Break rows configured in setup should appear between the correct periods and must not contain any teaching entries.

*What to try:* Add multiple breaks (short, lunch, snacks). Open weekly view and confirm their position. Try assigning a class into a break row.

*Expected:* Breaks appear in the right slots, in chronological order, and class entries cannot be placed into them.

---

**TT-WORKSPACE-G6 — Holiday Dates Should Show Holiday Styling, Not Normal Class Cells**

*What this is:* A date marked as holiday should appear visually distinct in the weekly view and must not show normal class cells as if school is open.

*What to try:* Mark a holiday on a date that already has source-week entries. Open weekly view and inspect that date.

*Expected:* The holiday is clearly styled and class cells for that date are blocked or marked accordingly.

---

**TT-WORKSPACE-G7 — Exam Blocks Should Show Their Label And Blocked Styling**

*What this is:* Cells covered by an exam block should display the exam label/type and a clearly blocked appearance.

*What to try:* Apply different kinds of exam blocks (all-batch, batch-specific, partial-day) and inspect the affected cells in weekly view.

*Expected:* Each blocked cell shows the exam label and a distinct blocked style.

---

**TT-WORKSPACE-G8 — Empty Cells Should Look Empty, Not Like Loading Or Broken Data**

*What this is:* A truly empty period must look obviously empty (e.g., a dash or blank cell) and not be confused with a loading state or a rendering error.

*What to try:* Open a sparsely populated week. Look at empty slots. Refresh and observe whether empty cells flicker or look like they're still loading.

*Expected:* Empty cells are visually clean and unambiguous.

---

**TT-WORKSPACE-G9 — Substituted Slots Should Show The Substitute Per Product Rule**

*What this is:* If a substitution exists for a slot, the weekly view should reflect the substitute teacher according to the product rule (replace the original or show both).

*What to try:* Create a substitution for a known slot. Open weekly view and inspect that slot. Try with multiple substitutions across different days.

*Expected:* The slot reflects the substitution consistently across all weekly views and filters.

---

### H. View Timetable — Monthly View Scenarios

**TT-WORKSPACE-H1 — Monthly Calendar Should Show Working Days, Non-Working Days, Holidays, And Today Clearly**

*What this is:* Switching to monthly view should show the current month with clear visual differentiation for working days, non-working days, holidays, and the current date.

*What to try:* Open monthly view. Hover or inspect different date types. Try with months that have multiple holidays.

*Expected:* Each day type is visually distinct and the current date is clearly highlighted.

---

**TT-WORKSPACE-H2 — Month Navigation Should Update Display Without Losing Filters**

*What this is:* Navigating to the previous or next month should refresh the calendar but keep any currently applied filters.

*What to try:* Apply a batch filter. Navigate next, next, previous. Apply a teacher filter and repeat.

*Expected:* Filters stay applied across month navigation.

---

**TT-WORKSPACE-H3 — Batch Filter In Monthly View Should Only Show That Batch's Daily Counts**

*What this is:* When a batch filter is applied in monthly view, the daily entry counts or details should reflect only that batch.

*What to try:* Apply a batch filter and inspect daily counts across the month. Switch batches and re-inspect.

*Expected:* Counts reflect only the selected batch.

---

**TT-WORKSPACE-H4 — Teacher Filter In Monthly View Should Only Show That Teacher's Schedule**

*What this is:* Same idea for teacher — daily counts/details should reflect only the selected teacher.

*What to try:* Apply a teacher filter and inspect daily counts. Switch teachers and re-inspect.

*Expected:* Counts reflect only the selected teacher.

---

**TT-WORKSPACE-H5 — Holidays In Monthly View Should Be Marked And Not Counted As Working Schedule**

*What this is:* Holiday dates should be visually marked in the monthly calendar and should not be counted as days that need a normal working schedule.

*What to try:* Mark several holidays and open monthly view. Inspect both marking and any totals shown.

*Expected:* Holidays are clearly marked and excluded from working-day totals.

---

**TT-WORKSPACE-H6 — Sundays And Removed Working Days Should Look Distinct From Working Days**

*What this is:* Days that aren't part of the institute's working week should be visually distinct from working days in the monthly view.

*What to try:* Compare Sundays and any removed working days against regular working days in the calendar.

*Expected:* Non-working days are clearly distinct.

---

### I. View Timetable — Past, Current & Future Week Scenarios

**TT-WORKSPACE-I1 — Past Weeks Should Be Read-Only To Protect Historical Records**

*What this is:* Past weeks represent classes that already happened. They should be read-only — the Edit Week action should be hidden or disabled, with a clear read-only indicator.

*What to try:* Navigate to a past week and look for the Edit Week action. Try clicking anywhere that would normally open the dialog.

*Expected:* The week is clearly marked read-only and no edits are possible.

---

**TT-WORKSPACE-I2 — Current Week Should Be Editable If The User Has Permission**

*What this is:* The current week should support edits for users with the right permission.

*What to try:* Navigate to the current week. Try Edit Week. Try with two roles — one with permission, one without.

*Expected:* The permitted user can edit. The non-permitted user cannot see or use the action.

---

**TT-WORKSPACE-I3 — Future Weeks Should Be Editable And Open Workspace For That Week**

*What this is:* Future weeks should support full editing, and Edit Week should open the workspace at exactly that week.

*What to try:* Navigate two or three weeks ahead and click Edit Week. Verify which week the workspace opens to.

*Expected:* The workspace opens for the selected future week, not for today.

---

**TT-WORKSPACE-I4 — Edit Week From Review Should Preserve The Selected Week**

*What this is:* Clicking Edit Week from View Timetable should land in the workspace with the same week selected — never default to a different week.

*What to try:* Open View Timetable for several different weeks (past, current, future) and click Edit Week from each.

*Expected:* The workspace always opens to exactly the week the admin came from (or shows a clear read-only state for past weeks).

---

**TT-WORKSPACE-I5 — Today Action Should Return To The Current Week/Month With Sensible Filters**

*What this is:* Clicking Today should return the view to the current week (in weekly view) or current month (in monthly view) and keep filters in a sensible state.

*What to try:* Navigate far away in past and future. Click Today. Try in both weekly and monthly views. Try with filters applied.

*Expected:* The view returns to today and filters are preserved (or reset in a documented, predictable way).

---

### J. View Timetable — Export & Print Scenarios

**TT-WORKSPACE-J1 — Print With All Batches Should Include Title, Date Range, And All Visible Entries**

*What this is:* Printing the weekly view with All Batches selected should produce output that contains the timetable title, date range, and all entries currently shown.

*What to try:* Open weekly view with All Batches and trigger Export/Print. Inspect the print preview.

*Expected:* Title, date range, and all visible entries appear in the print output without clipping.

---

**TT-WORKSPACE-J2 — Print With A Batch Filter Should Reflect That Batch In Header And Content**

*What this is:* When a batch filter is applied, the printed output should clearly indicate the selected batch and contain only that batch's entries.

*What to try:* Apply a batch filter and trigger print. Inspect both header text and entry content.

*Expected:* The printed header shows the batch name and the content matches.

---

**TT-WORKSPACE-J3 — Print With A Teacher Filter Should Not Include Unrelated Teachers**

*What this is:* Same for teacher filter — only the selected teacher's entries should appear in the printed output.

*What to try:* Apply a teacher filter and print. Spot-check that no unrelated teacher's entries leak into the output.

*Expected:* Only the selected teacher's entries are present.

---

**TT-WORKSPACE-J4 — Print Of A Week With Holidays Or Exam Blocks Should Show Those States Clearly**

*What this is:* If the printed week contains holidays or exam blocks, those states must be readable on paper — not silently hidden or merged with normal cells.

*What to try:* Print a week that includes both a holiday and an exam block. Inspect those cells in the printed output.

*Expected:* Holidays and exam blocks are clearly labeled and visually distinct in the print.

---

**TT-WORKSPACE-J5 — Review View Should Stay Usable On Tablet And Mobile**

*What this is:* On tablet and mobile, View Timetable should remain usable — filters should work and the grid should scroll horizontally without clipping controls.

*What to try:* Open the review view on a tablet width and a phone width. Apply filters. Scroll horizontally. Try landscape and portrait.

*Expected:* Filters remain usable, the grid scrolls cleanly, and no controls are clipped or unreachable.

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
