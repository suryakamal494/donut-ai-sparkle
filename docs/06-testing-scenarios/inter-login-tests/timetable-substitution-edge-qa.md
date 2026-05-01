# Timetable Substitution & Edge Cases QA

> This document is for testers validating teacher absence handling, substitute assignment logic, and the high-risk edge cases that surface when master data shifts underneath an existing timetable. It is intentionally heavier on **why** each scenario matters than on click steps — substitution is the area where silent bugs cause the most real-world damage (a student arrives to class and no one is there), so testers should approach this as exploratory hunting, not checklist ticking.

---

## Before You Begin

You will need a **published timetable** with multiple teachers, multiple batches, mixed curriculums (e.g. CBSE and JEE), at least one teacher who teaches across two curriculums, holidays defined in the academic calendar, exam blocks already configured, and at least one teacher who has no classes on the date you plan to test. If you are validating downstream propagation (Section D), have a teacher login and a student login of an affected batch ready in another browser window so you can verify the substitution actually reaches them.

If anything in the setup feels wrong — a teacher missing from a batch they should be in, a holiday that didn't get marked — pause and fix it before you start. Substitution bugs and master-data bugs look identical from the UI, and you will waste hours chasing the wrong thing.

---

## The Substitution Golden Rule

> A substitute assignment is valid **only if** all four of these are true at the moment of assignment:
> 1. There is a real scheduled class for the absent teacher in that period.
> 2. The substitute is not the absent teacher themselves.
> 3. The substitute is not already teaching another class in that same period.
> 4. The substitute works on that weekday.
>
> Subject/curriculum capability is a **strongly preferred** fifth rule. If the platform lets you assign an unrelated teacher to cover a Physics class without any warning, that is a product gap worth flagging — not a tester error.

Every scenario in Sections A–D is ultimately a check that the platform enforces these five rules under varied conditions. Sections E–H push on what happens when the world around those rules changes.

---

## Test Scenarios

### A. Marking Absences

**A1 — Mark a teacher absent for the full day**

What this is
The most common substitution path: a teacher calls in sick in the morning and the admin needs to record it before first period. This single action drives every downstream calculation, so getting the affected-slots derivation right is foundational.

What to try
Pick a teacher with a busy weekday — at least 4–5 periods spread across multiple batches. Open Mark Teacher Absent, choose Full Day, optionally add a reason, and save. Then repeat with a teacher who has only one or two classes that day, and again with a teacher who teaches the same batch in two different periods.

Expected
Coverage Needed populates with **exactly** the periods that teacher has on that weekday — no extras, no missing slots, no duplicates if they teach the same batch twice. The toast confirms the absence and the calendar dot for that date appears.

---

**A2 — Mark a partial-day absence for selected periods only**

What this is
Teachers sometimes leave mid-day (medical appointment, training session). The platform must let admins mark only the affected periods, not force a full-day absence as a workaround.

What to try
Choose Partial in the absence dialog. Pick a non-contiguous selection — e.g. periods 2 and 5 only. Save. Then try the inverse: a contiguous block (periods 3, 4, 5). Then try selecting periods the teacher does not actually teach that day.

Expected
Coverage Needed shows only the chosen periods *that the teacher actually has classes in*. Periods you selected where the teacher had no class should silently produce no coverage row (or, better, the picker should not have offered them). No phantom slots appear.

---

**A3 — Submit the absence dialog without selecting a teacher**

What this is
Basic input validation. Easy to overlook, but if it fails the platform creates a ghost absence record that breaks every downstream query.

What to try
Open Mark Teacher Absent, leave the teacher field empty, click Save. Try the same with only a reason filled in. Try with the dialog opened on a holiday date and no teacher selected.

Expected
A clear error appears, focus returns to the teacher field, and **no absence record is created**. Refreshing the page shows zero absences for that date.

---

**A4 — Cancel an existing absence and verify all linked data clears**

What this is
Admins frequently mark someone absent and then learn the teacher is actually coming in. Cancellation must fully unwind everything the absence created — including substitute assignments already made against it.

What to try
Mark a teacher absent, assign substitutes to two of the affected slots, leave one uncovered. Then cancel the absence. Repeat by cancelling an absence with **no** substitutes assigned, and again by cancelling an absence after assigning a substitute to every slot.

Expected
The absence row disappears, all substitution assignments tied to it are removed (not just hidden), urgent and covered counts reset, and the calendar dot disappears for that date. The substitute teacher's schedule (if you have it open) loses the substitution duty.

---

**A5 — Two teachers absent on the same date**

What this is
Real days have multiple absences. The Coverage Needed list must keep each teacher's affected periods clearly attributed and must not accidentally merge two absences into one.

What to try
Mark Teacher A absent (full day) and Teacher B absent (partial, periods 1–3). Both for the same date. Inspect the Coverage Needed panel and the calendar.

Expected
Each affected slot clearly shows which absent teacher it belongs to. Urgent count reflects the combined uncovered total. Assigning a substitute for one of Teacher A's slots must not accidentally satisfy any of Teacher B's slots.

---

**A6 — Mark a teacher absent on a holiday**

What this is
A holiday means there are no scheduled classes for anyone, so an absence on that date is logically meaningless. The platform should either prevent it or, at minimum, not generate phantom coverage for classes that don't exist.

What to try
Pick a date that is a defined academic holiday. Try to mark a teacher absent on it. If the system allows it, look at Coverage Needed.

Expected
Either the dialog is blocked with a "this is a holiday" message, or the absence saves but Coverage Needed remains empty and the holiday banner is shown. Coverage Needed must **never** populate with regular weekday classes for a holiday date.

---

**A7 — Mark a teacher absent on a date when they have no classes**

What this is
Some teachers don't teach every weekday (e.g. only teach Mon/Wed/Fri). Marking them absent on a Tuesday is valid for HR/leave records but must not generate coverage for classes they never had.

What to try
Find a teacher whose `workingDays` excludes the selected weekday, or who simply has zero entries on that day. Mark them absent. Then mark a teacher who works that day but happens to have a free schedule.

Expected
The absence is recorded (it's a legitimate HR action), Coverage Needed for that date stays empty for that teacher, and the absence shows in the day's absence list with a clear "no classes affected" indicator.

---

### B. Coverage Needed Calculation

**B1 — Affected slots match the teacher's actual weekday entries exactly**

What this is
This is the integrity check for the entire substitution feature. If the affected-slot derivation is wrong by even one period, every substitute decision built on top of it is wrong too.

What to try
Pick a teacher with a complex weekday — multiple batches, mixed periods, maybe a back-to-back double period. Open the Workspace and screenshot or note their entries for that weekday. Then mark them absent full day on that date. Compare the Coverage Needed list against your screenshot.

Expected
One-to-one match. Every period the teacher had on that weekday appears in Coverage Needed; nothing extra appears; ordering is by period number ascending.

---

**B2 — Urgent count decreases as substitutes are assigned**

What this is
The urgent counter is the at-a-glance signal admins use to know whether the day is "handled". It must reflect reality in real time.

What to try
Create an absence with five affected slots. Note the urgent count. Assign substitutes one slot at a time, watching the counter after each assignment. Then remove a substitute and watch the counter again.

Expected
Urgent decreases by exactly one with each substitute assigned, covered increases by exactly one. Removing a substitute restores both counters. No off-by-one, no stale numbers requiring a refresh.

---

**B3 — Date navigation refreshes Coverage Needed cleanly**

What this is
Admins move between dates a lot — checking yesterday's substitutions, planning tomorrow's. The previous date's data must not leak into the next.

What to try
Mark absences on two consecutive dates with different teachers and different affected periods. Use the prev/next day arrows and the calendar picker to switch between them rapidly. Switch to a date with no absences. Switch to a holiday.

Expected
Each date shows only its own absences and coverage. No flicker of stale data, no "phantom" rows from the previously viewed date, holidays show the empty state.

---

**B4 — Calendar absence indicators are accurate**

What this is
The calendar dots are how admins spot upcoming or past absence days at a glance. False positives or missing dots erode trust in the whole module.

What to try
Mark absences across three different weeks. Open the calendar picker. Cancel one absence and reopen the calendar.

Expected
A dot appears on every date with at least one absence, no dot appears on dates without absences, and cancelling clears the dot immediately.

---

**B5 — Holiday selected: empty state with holiday context**

What this is
Selecting a holiday should communicate clearly *why* there's nothing to do, not just show an empty list which looks like a bug.

What to try
Select a defined holiday from the calendar. Look at the Coverage Needed panel and the absence list.

Expected
A clear holiday message names the holiday. Coverage Needed shows an empty state explaining no classes are scheduled. Mark Absent action is either disabled or warns before opening.

---

**B6 — Partial absence affects only the named periods**

What this is
The partial-period filter inside the affected-slots calculation is a common bug source — it's an extra `.filter()` that's easy to forget.

What to try
Mark a teacher partial-absent for periods 2 and 4 only. Confirm coverage. Then edit (cancel and re-create) as full day. Then re-create as partial for periods 1, 3, 5.

Expected
Coverage Needed contains only the specified periods at each step. No leakage of period 3 into a "periods 2 and 4" partial absence.

---

**B7 — Two absences for the same teacher on the same date are prevented or merged sensibly**

What this is
A duplicate absence is an obvious data integrity bug — should it stack, replace, or be blocked?

What to try
Mark Teacher A full-day absent. Without cancelling, try to mark Teacher A absent again on the same date — first as full day, then as partial.

Expected
Either the second attempt is blocked with a clear message, or it cleanly replaces the first. What must **not** happen: two absence rows for the same teacher on the same date producing duplicated Coverage Needed entries.

---

### C. Substitute Selection Engine

**C1 — The absent teacher is never offered as their own substitute**

What this is
Sounds obvious, but it's a classic filter bug — when the exclusion is keyed on the wrong field or computed before the absence is fully written, the absent teacher slips into their own substitute list.

What to try
Mark a teacher absent. Open Find Substitute on any of their slots. Scroll the entire substitute list. Try this for a teacher with a common name and a teacher with a unique name.

Expected
The absent teacher does not appear in the substitute list under any circumstance. Filtering or searching by their name returns zero results for that slot.

---

**C2 — Teachers already busy in that period are excluded**

What this is
The most important rule. If a busy teacher is offered and assigned, you have just double-booked them — two batches expecting the same person at the same time.

What to try
Pick a period where you know multiple teachers are already teaching other batches. Open Find Substitute for that period and verify each of those teachers is absent from the list. Then add a new timetable entry for a previously-free teacher in that period (in the Workspace, in another tab) and re-open the picker.

Expected
Every teacher already teaching in that exact period and weekday is excluded. The picker reflects current data — adding a new entry that makes a teacher busy should remove them from the picker on the next open.

---

**C3 — Teachers who don't work that weekday are excluded**

What this is
Part-time and visiting teachers have working-day constraints. Suggesting them as a substitute on their off-day means the substitute will simply not show up.

What to try
Find a teacher whose `workingDays` excludes the selected weekday (e.g. doesn't work Saturdays). Open the substitute picker on a Saturday absence. Confirm absence. Then change the same teacher's working days in master data to include Saturday and re-check.

Expected
That teacher does not appear while their working days exclude Saturday, and **does** appear after master data is updated. No warning-only state — they should be excluded outright, or at minimum heavily warned.

---

**C4 — Subject/curriculum capability check (product-gap probe)**

What this is
A Math teacher covering a Physics class is technically possible but pedagogically weak. The platform should at least surface this trade-off, ideally restrict it. If the picker treats all available teachers identically regardless of subject, that is a product-rule gap worth filing — not a tester misunderstanding.

What to try
On a Physics absence, open the substitute picker. Note whether subject-matched teachers are visually distinguished (badge, sort order, "recommended" label). Try assigning a teacher who does not teach Physics. Then try one who teaches Physics in a different curriculum (e.g. teacher teaches CBSE Physics, the absent class is JEE Physics).

Expected
Subject-matching teachers are surfaced first or marked recommended. Cross-curriculum subject matches (CBSE Physics teacher offered for JEE Physics) should be distinguishable from same-curriculum matches. If none of this is true, file as a product gap with severity high.

---

**C5 — Assign a substitute and verify the slot updates**

What this is
The happy path. Establishes baseline correctness before the harder scenarios.

What to try
Pick any uncovered slot, open the picker, select a clearly-eligible substitute, save.

Expected
The slot card flips to a "Covered by [substitute name]" state, urgent count drops by one, covered count rises by one, and the substitute's entry is queryable in the substitutions list.

---

**C6 — Change an already-assigned substitute**

What this is
Plans change — the first substitute becomes unavailable, a better match becomes free. Re-assignment must replace cleanly, not stack.

What to try
Assign Substitute A to a slot. Open the picker again on that same slot and assign Substitute B. Inspect the substitution list (you can do this by checking the substitute teacher's schedule view in another tab if available, or by counting substitution rows for that slot).

Expected
Exactly one substitution exists for that slot, attributed to Substitute B. Substitute A no longer carries that duty anywhere in the system.

---

**C7 — Remove a substitute and verify the slot reverts to urgent**

What this is
The inverse of C5. Confirms the assignment is genuinely deleted, not just hidden.

What to try
Assign a substitute, then remove the assignment. Refresh the page.

Expected
The slot returns to the uncovered/urgent state, urgent count rises by one, covered count drops by one, and the substitute teacher's downstream schedule no longer shows the duty.

---

**C8 — Substitute becomes busy *after* being assigned**

What this is
A nasty race condition: at 9:00 AM you assign Mr. Patel as substitute for period 3. At 10:00 AM another admin adds a new regular timetable entry that puts Mr. Patel in a different batch for period 3. The system has just created a conflict it cannot warn the user about reactively unless it re-validates.

What to try
Assign a substitute. Then in the Workspace (another tab), add a new timetable entry that places that substitute in another batch in the same period. Return to the substitution screen.

Expected
Either the system blocks the conflicting Workspace entry, or the substitution screen surfaces a conflict warning on the affected substitute card. Silent acceptance of both is a P0 bug — file immediately.

---

**C9 — No available substitutes at all**

What this is
On a heavily-staffed institute this is rare; on a small one it's common. The empty state must be useful, not a blank panel that looks broken.

What to try
Engineer a period where every teacher is either the absent one, busy, or off that day. Open the picker.

Expected
A clear empty state explains why no one is available ("All teachers are busy or off today") and offers next-step actions (e.g. mark as Self Study, or split the class). The picker does not appear broken or stuck loading.

---

### D. Cross-Impact & Downstream Propagation

**D1 — Substitution appears in the Review/View Timetable**

What this is
The published timetable view is what students and parents may eventually see. A substitution that doesn't propagate there means the displayed teacher is wrong.

What to try
Assign a substitute. Open the Review Timetable for the affected batch and date. Check the affected slot.

Expected
The slot shows the substitute teacher's name (often with a "Substitute" badge or visual marker) instead of the original teacher. Removing the substitution restores the original.

---

**D2 — The substitute teacher sees the duty in their schedule**

What this is
The substitute will not show up if they don't know they have the duty. This is the single most user-visible consequence of substitution working or not.

What to try
Assign a substitute. Log in as that substitute teacher in another browser window. Navigate to their schedule for that date.

Expected
The substitution appears as an entry on their schedule with a clear "Substitution" indicator and the original teacher's name as context. Their normal classes are unchanged. Removing the substitution removes it from their schedule.

---

**D3 — The original (absent) teacher's schedule reflects the absence**

What this is
The absent teacher should see their own classes either removed for that date or marked as covered, so they have an accurate record of what happened in their absence.

What to try
Mark a teacher absent and assign substitutes to some slots, leaving others uncovered. Log in as that absent teacher and view their schedule for that date.

Expected
Affected slots are visibly different from normal (cancelled, covered, or marked absent). The teacher can see who covered each slot. Slots without substitutes are visibly uncovered.

---

**D4 — Students of the affected batch see the substitute teacher**

What this is
The downstream surface that matters most. If a student opens their timetable and sees the absent teacher's name, they walk into class expecting the wrong person.

What to try
Assign a substitute. Log in as a student of the affected batch and view today's schedule.

Expected
The student sees the substitute teacher's name for the affected period. Other periods are unchanged. Removing the substitution restores the original teacher in the student view.

---

**D5 — Cancelling the parent absence cascades through every downstream view**

What this is
Cancellation cleanup is one of the most common bug surfaces because cleanup paths get less testing than creation paths. Stale substitution data left behind after a cancellation is highly visible to teachers and students.

What to try
Mark a teacher absent, assign substitutes to several slots, then cancel the absence. Check the Coverage Needed panel, the substitute teacher's schedule, the absent teacher's schedule, the student schedule, and the Review Timetable — all in tabs you opened *before* the cancellation.

Expected
Every surface refreshes (or makes its stale state obvious so a normal refresh fixes it). After explicit refresh, no trace of the substitution remains anywhere. The substitute teacher does not still show the substitution duty.

---

**D6 — Notifications fire correctly on assignment and removal**

What this is
If notifications are wired in, they should reach the right people at the right moments. Wrong recipients or duplicate notifications are immediate trust-breakers.

What to try
With notifications enabled, mark an absence (notify absent teacher and admin), assign a substitute (notify substitute and absent teacher), change the substitute (notify both old and new substitutes), and cancel the absence (notify all involved).

Expected
Each event triggers exactly the expected notifications to exactly the expected recipients. No duplicates, no notifications to uninvolved teachers, no missing notifications on the change/cancel paths.

---

**D7 — Batch-level views (e.g. batch dashboard) reflect coverage status**

What this is
If the batch dashboard surfaces "today's classes" or similar, those views must agree with the substitution module about who is teaching.

What to try
Assign substitutes for a batch. Navigate to that batch's dashboard or any batch-level "today" view.

Expected
The batch view shows substitute teachers consistent with what the substitution module shows. No two views of the same data contradict each other.

---

### E. Master-Data Regression Risks

> These scenarios are the highest-value section of this document. Substitution and timetable data are created under one set of master-data assumptions (Teacher X is in Batch Y, teaches Subject Z, in Curriculum C). When master data later changes — and it always does — every existing entry that depended on those assumptions becomes a latent bug. The platform must either flag, block, or migrate; silent acceptance is the worst outcome because nobody notices until a student walks into a class with no teacher.
>
> Approach each scenario as an exploratory hunt: "if this assumption silently changes, what breaks downstream?"

---

**E1 — A teacher is removed from a batch *after* timetable entries already use that teacher-batch pairing**

What this is
The institute admin removes Teacher X from Batch 10-A in the Teachers module. But the timetable already has Teacher X scheduled for 10-A across multiple periods. The platform now has scheduled classes that, by current master data, should be impossible. The Workspace, the substitution picker, and downstream teacher/student schedules are all consuming this contradiction simultaneously.

What to try
Pick a teacher actively scheduled in a batch. Go to the Teachers (or Batches) module and remove that teacher's assignment to that batch. Return to the Workspace, the substitution screen, and the student timetable for that batch.

Expected
Existing entries are visibly flagged ("teacher no longer assigned to this batch" warning, color change, or invalid badge). Attempting to add **new** entries for that teacher-batch combination is blocked. The substitution picker no longer offers that teacher for substitutions in that batch. Silent retention of the entries with no warning is a P0 master-data regression bug.

---

**E2 — A batch's curriculum is changed after timetable entries already exist**

What this is
A batch is moved from CBSE to ICSE (or to JEE) after the timetable was built. Entries reference subjects that exist under one curriculum but may not exist — or may mean different chapters — under the new one. This is the kind of change that looks fine on the surface and corrupts everything below it.

What to try
Find a batch with timetable entries. Change its curriculum in master data. Check the Workspace for that batch, the affected teachers' schedules, and the substitution picker.

Expected
Entries whose teacher/subject combination no longer makes sense under the new curriculum are flagged. New scheduling against the now-incompatible subjects is blocked. The tester should specifically look for entries that are *silently* still valid because the subject name happens to exist in both curriculums but means different things — those are the most dangerous.

---

**E3 — A subject is removed from a batch after that subject is scheduled**

What this is
Physics is removed from Class 10-A's subject list, but the timetable already has Physics periods for 10-A. Until those entries are flagged or removed, the system is scheduling a subject the batch officially no longer takes.

What to try
Schedule Physics for a batch. Then in master data, remove Physics from that batch's subject list. Check the Workspace, the substitution screen, the substitute picker (try to assign a substitute to one of the now-orphaned Physics slots), and the student schedule.

Expected
Existing Physics entries for that batch are flagged as invalid. New Physics scheduling for that batch is blocked. The substitution flow either prevents substituting an orphaned slot or warns clearly.

---

**E4 — A subject is removed from a teacher's profile after they're scheduled to teach it**

What this is
A teacher's profile is updated to remove Mathematics from their teachable subjects, but they already have Math classes on the timetable. This is a particularly subtle bug because the teacher is still valid for the batch, just not for the subject.

What to try
Schedule a teacher for Math classes. Remove Math from their teachable subjects in their profile. Check existing entries, attempt to add new Math entries for them, and check the substitute picker to see if they are still offered for Math substitutions.

Expected
Existing Math entries flagged. New Math entries for that teacher blocked. Substitute picker excludes them from Math slots (or visibly warns).

---

**E5 — A teacher is deactivated or deleted while scheduled**

What this is
A teacher leaves the institute. The admin deactivates them. Every timetable entry referencing them is now scheduled to a person who isn't there. The substitution module is the most likely surface to expose this, but it's also where it's most dangerous if missed.

What to try
Deactivate (or simulate deletion of) a teacher who has many scheduled classes. Check the Workspace, the substitution picker (the deactivated teacher should not appear as substitute), and what happens when you try to mark them absent.

Expected
Existing entries remain auditable for historical purposes but are clearly marked "requires replacement". The deactivated teacher cannot be marked absent (they're already not coming in), cannot be selected as substitute, and their scheduled classes are surfaced for re-assignment.

---

**E6 — A batch is archived while it has live timetable entries**

What this is
Archiving a batch with active scheduling shouldn't break the Workspace or the substitution module — but those modules typically filter on active batches, so historical data can suddenly disappear from view.

What to try
Find a batch with current timetable entries and absences. Archive it. Check that historical Review Timetable still works, that past substitutions for the batch are still queryable, that the batch no longer appears in new scheduling pickers, and that no module crashes from a missing-batch reference.

Expected
Archived batches drop out of new scheduling pickers but remain visible in historical/review contexts. No blank screens, no "batch not found" errors crashing a panel.

---

**E7 — A facility (room) is deleted while assigned to timetable entries**

What this is
Less critical than teacher/batch changes but still surfaces broken-reference bugs. A room being deleted should leave existing entries with a clear "missing facility" warning, not blank fields or crashes.

What to try
Delete a room/facility currently used by multiple timetable entries. Check Workspace, Review Timetable, and the substitution flow.

Expected
Affected entries display a clear "facility removed" warning. New entries cannot use the deleted facility. Nothing renders blank or crashes.

---

**E8 — Same teacher teaches the same subject across two curriculums**

What this is
Mr. Sharma teaches CBSE Physics for one batch and JEE Physics for another. These are pedagogically different subjects with different chapters and difficulty levels even though they share a name. The scheduling and substitution UIs must distinguish them — never merge them into one ambiguous "Physics" option.

What to try
Set up a teacher with two curriculum-specific Physics assignments. Schedule them for both. Mark them absent. Open the substitute picker for the CBSE Physics slot, then for the JEE Physics slot. Look for any place in the UI where the two get combined.

Expected
Subject options always carry curriculum context (badge, prefix, scope label). The substitute picker treats CBSE Physics and JEE Physics as distinct subjects when ranking subject-matched substitutes. Bulk operations (e.g. swap teacher) operate on the curriculum-scoped pair, never on the merged name.

---

### F. Naming & Identity Edge Cases

**F1 — Same subject name across multiple batches with different curriculums**

What this is
Physics in 10-A (CBSE) and Physics in JEE-1 (JEE) share the literal name "Physics" but are different subjects. A teacher assigned to one should not silently become valid for the other.

What to try
Assign a teacher to CBSE Physics only. Try to schedule them for JEE Physics. Try to use them as a substitute for a JEE Physics slot.

Expected
The platform treats the two as distinct. No silent cross-pollination. Any "this teacher teaches Physics" lookup must respect curriculum scope.

---

**F2 — Long teacher and batch names overflow UI containers**

What this is
Real institute data includes names like "Dr. Lakshminarayanan Venkataraman Subramanian" and batches like "Class 10-A Morning Section CBSE 2025-26". These break cards, dropdowns, table cells, and print layouts that were designed against short test data.

What to try
Add a teacher and a batch with maximum-length names. Schedule them. Open Workspace cards, the absence dialog dropdown, the substitute picker, the affected-slot cards, the Review Timetable, and Print/Export views.

Expected
Names truncate cleanly with ellipsis and a tooltip showing the full name. No overlap, no broken card heights, no horizontal scroll appearing on the page itself, print output stays within page width.

---

**F3 — Two teachers with the same display name**

What this is
"Priya Singh" is common. The substitute picker must disambiguate between two Priya Singhs without forcing the admin to guess.

What to try
Create two teachers with identical names. Make both eligible substitutes for the same slot. Open the picker.

Expected
Each appears with a disambiguating element — employee ID, subject, or batch context. Selecting one does not accidentally assign the other. Toasts and confirmation messages are unambiguous.

---

**F4 — Special characters and non-Latin scripts in names**

What this is
Names with apostrophes (O'Connor), periods (Dr. R.K. Sharma), Devanagari (राज कुमार), or accents must render and search correctly across every UI surface.

What to try
Add teachers with these character types. Schedule them, mark absent, search for them in pickers and search boxes, view in print/export.

Expected
Names render correctly everywhere, are searchable by substring, and don't break any storage or comparison logic. No mojibake in exports.

---

**F5 — Batch is renamed after timetable creation**

What this is
A batch's display name is changed in master data. All scheduled entries and substitutions for that batch should reflect the new name immediately, with no broken references to the old name lingering anywhere.

What to try
Rename a batch with existing timetable entries and active substitutions. Refresh the substitution screen, the Workspace, downstream teacher and student views.

Expected
The new name appears everywhere. No screen still shows the old name. Historical records (audit logs, past substitutions) may show the historical name with context — this is acceptable if intentional.

---

### G. State, Concurrency & Replay Edge Cases

> This section probes the state-management bugs that one-shot click directives miss — what happens when actions are taken in unusual orders, repeated, or interrupted.

---

**G1 — Mark absent then immediately cancel before assigning any substitute**

What this is
A clean rollback test. The system should leave no trace if an absence is created and immediately undone.

What to try
Mark a teacher absent, then within seconds cancel the absence — no substitutes assigned, no other actions taken in between.

Expected
Absence row gone, calendar dot gone, no orphaned data anywhere. Re-marking the same teacher absent works normally afterwards.

---

**G2 — Assign substitute, then cancel the parent absence**

What this is
The substitution depends on the absence; cancelling the absence must cascade-delete the substitution. This is one of the most common bug paths.

What to try
Mark absent, assign a substitute to one slot, then cancel the absence.

Expected
The substitution assignment is fully removed alongside the absence. The substitute teacher's downstream schedule loses the duty. No orphaned substitution row remains in any list.

---

**G3 — Rapidly navigate between dates while the panel is rendering**

What this is
Stress-tests for race conditions in the date-change handler. If state updates from a prior date arrive after the new date is loaded, the wrong data shows.

What to try
Use the prev/next day arrows in quick succession (5–10 clicks). Then jump via the calendar to a far date. Then jump back via the calendar.

Expected
Final state reflects the final selected date, with no stale absence rows from intermediate dates and no flicker that lingers more than briefly.

---

**G4 — Refresh page mid-assignment**

What this is
A user opens the substitute picker, selects a substitute, but refreshes (or the connection drops) before save completes. The system must not leave the substitution in a half-saved state.

What to try
Open the picker, select a substitute. Before clicking save, hard-refresh the page. After reload, check for the substitution.

Expected
No substitution exists (the action wasn't committed). If it does exist, save was committed; re-opening the picker shows the assignment correctly. What must not happen: a substitution that exists in the data but doesn't show in the UI, or vice versa.

---

**G5 — Mark the same teacher absent twice on the same date**

What this is
Duplicate-prevention test. Two absence rows for the same teacher on the same date will produce duplicated coverage entries and confused downstream views.

What to try
Mark Teacher A absent. Without cancelling, immediately try again — first as full day, then as partial.

Expected
Second attempt is blocked or cleanly replaces the first. Coverage Needed shows each affected period exactly once.

---

**G6 — Try to mark an absence in the past**

What this is
Backdating an absence is a legitimate HR action (recording yesterday's sick day) but creates risk if it triggers downstream substitution flows that no longer make sense. The platform should either allow it as a record-only action or block it explicitly.

What to try
Select a date in the past. Try to mark a teacher absent. If it succeeds, try to assign a substitute.

Expected
Behavior is consistent and explained — either backdating is allowed as audit-only (with substitute assignment disabled) or it is blocked with a clear message. Silent partial behavior (allows the absence, lets you assign a substitute who clearly couldn't have actually shown up yesterday) is a bug.

---

### H. Access, Permissions & Responsive

**H1 — Role without `timetable.edit` cannot reach substitution UI**

What this is
A read-only or unrelated role must not see substitution actions at all. UI removal is required, not just disabling — disabled controls leak the existence of the feature and tempt social engineering.

What to try
Log in as a role that lacks `timetable.edit`. Look for any substitution entry point: sidebar link, dashboard quick action, batch detail page action, direct URL navigation to `/institute/timetable/substitution`.

Expected
Sidebar and quick actions are completely absent. Direct URL navigation either redirects or shows an access-denied page. No disabled-but-visible controls.

---

**H2 — Tablet (768–1024px) workspace usability**

What this is
Many institute admins use tablets in the staff room. The substitution flow must remain usable, not collapse to a "use a desktop" warning.

What to try
At a 900px viewport, run through marking an absence, assigning a substitute, navigating dates, and opening the calendar.

Expected
All actions complete. Touch targets are 44px+. Dialogs fit the viewport. No horizontal scroll on the page itself.

---

**H3 — Mobile (320–480px) handling**

What this is
Substitution is too dense for true mobile, but the platform should guide gracefully rather than silently break.

What to try
Open the substitution screen at 360px width. Try to mark an absence and assign a substitute.

Expected
Either a clear "best on tablet/desktop" guidance is shown with a path forward, or the flow degrades sensibly with stacked layouts and accessible touch targets. No overlapping cards, no clipped buttons, no inability to dismiss dialogs.

---

**H4 — Calendar interaction on touch devices**

What this is
The calendar picker is the primary date-navigation control. It must work cleanly with taps, not require mouse-only behaviors.

What to try
On a touch device or with touch emulation, open the calendar, tap dates including those with absence dots, swipe between months, dismiss by tapping outside.

Expected
Dates respond to first tap, the dot remains visible while interacting, month navigation works, dismissal patterns are predictable.

---

**H5 — Dialog scrolling on small viewports**

What this is
The Mark Absent and Find Substitute dialogs contain forms and long lists. On short viewports they must scroll internally without burying the action buttons.

What to try
At a 600px tall viewport, open both dialogs. Verify the Save/Assign action buttons remain reachable while scrolling the body.

Expected
Dialog body scrolls; header and action buttons stay pinned. No need to dismiss the dialog and re-open to reach Save.

---

**H6 — Keyboard-only navigation through the substitute picker**

What this is
Accessibility baseline. A power-user admin should be able to assign substitutes without leaving the keyboard.

What to try
Open the substitute picker using only Tab, Shift+Tab, arrow keys, and Enter. Search, select, and assign a substitute. Cancel without assigning.

Expected
Focus order is logical, focus is visible at every step, search input is reachable, Enter confirms, Escape cancels, focus returns to a sensible element after dialog close.

---

## Critical Bugs QA Must Flag Immediately

Grouped by severity. P0 means stop testing and file immediately; the platform is unsafe to use in this state.

### P0 — Wrong substitute suggestions
- The absent teacher appears as their own substitute.
- A teacher already busy in the same period appears as available.
- A teacher who doesn't work that weekday appears with no warning.
- A deactivated teacher appears in the picker.

### P0 — Stale data after cancellation or change
- Substitution assignment survives cancellation of its parent absence.
- Downstream teacher or student schedules retain a removed substitution after refresh.
- Changing a substitute leaves the old substitute's schedule still showing the duty.

### P0 — Silent master-data regression
- Teacher unassigned from a batch and existing entries show no warning.
- Subject removed from a batch and existing entries are silently retained.
- Subject removed from a teacher and they remain selectable for that subject.
- Curriculum changed on a batch and curriculum-mismatched entries are not flagged.

### P1 — Holiday and non-working-day leakage
- Coverage Needed populates for a holiday date.
- Non-working-day teacher selectable as substitute without warning.
- Holiday date allows new absence creation that produces phantom slots.

### P1 — Identity ambiguity
- Same subject name across curriculums gets merged anywhere in the UI.
- Two teachers with the same name are not disambiguated in the picker.
- Long teacher or batch names overflow Workspace cards, dialogs, Review Timetable, or Print.

### P2 — Permission and UI leakage
- Unauthorized role sees substitution sidebar entries or quick actions.
- Direct URL navigation to substitution succeeds for unauthorized roles.
- Disabled-but-visible controls reveal feature existence to unauthorized users.

---

## Suggested Execution Order

Run sections in this order. Each pass is designed to surface a specific class of bug — completing them in order means each later pass benefits from data created by earlier ones, and bugs surface where they're easiest to diagnose.

1. **Absence creation and cancellation (Section A)** — surfaces input validation bugs and the foundational absence-record integrity. If A is broken, nothing downstream is testable.
2. **Coverage Needed calculation (Section B)** — surfaces the affected-slot derivation logic. If B is wrong, every substitute decision built on top will be wrong.
3. **Substitute selection (Section C)** — surfaces the eligibility rules. This is where most P0 substitution bugs live.
4. **Cross-impact (Section D)** — surfaces propagation bugs by checking that what you saw in A–C reaches teachers and students correctly.
5. **Master-data regression (Section E)** — the highest-value hunting ground. Run only after A–D pass cleanly so any new failures are clearly attributable to master-data changes.
6. **Naming and identity (Section F)** — visual and disambiguation bugs that rarely block but consistently embarrass.
7. **State and concurrency (Section G)** — race conditions and rollback paths. Easier to diagnose once you know the happy paths from A–C work.
8. **Access and responsive (Section H)** — final polish pass. Cheaper to run last because it doesn't depend on earlier scenarios passing.

---

## Related Documentation

- [Timetable QA Master Index](./timetable-institute-qa.md)
- [Timetable Setup QA](./timetable-setup-qa.md)
- [Timetable Workspace QA](./timetable-workspace-qa.md)
- [Timetable Upload View QA](./timetable-upload-qa.md)
- [Timetable Setup](../../02-institute/timetable-setup.md)
- [Timetable Workspace](../../02-institute/timetable-workspace.md)
- [Timetable Substitution](../../02-institute/timetable-substitution.md)
- [Timetable Flow](../../05-cross-login-flows/timetable-flow.md)

---

*Last Updated: May 2026*
