# Timetable Upload View QA

> This document is for testers validating the **Upload Existing Timetable** flow end-to-end: the file picker, AI extraction, validation, partial-week embed into an already-populated workspace, and conflict resolution. The goal is not to confirm the happy path — it is to **break the upload feature on purpose** before real institutes do.

---

## Before You Begin

You are testing a feature that ingests a paper or screenshot timetable, extracts it with AI, and writes it back into the platform's live timetable for a chosen batch. Three things must be true at the same time for this feature to be production-ready:

1. **Garbage input must be rejected or flagged**, not silently accepted.
2. **Existing timetable data must never be destroyed** by an upload unless the user explicitly chose to overwrite.
3. **Every conflict the platform can detect manually must also be detected when entries arrive via upload.**

**Set up before you start testing:**

- Pick one batch as your "target batch" for the whole session. Note its assigned teachers and subjects.
- In **Workspace**, manually fill that batch's current week to roughly 50% — leave clear gaps on some days, fully fill others, and put at least one teacher into a slot you will later try to overwrite from upload. This populated week is the canvas you will be uploading on top of.
- Open a second browser tab on the **Workspace** for the same batch so you can flip back and verify what changed after every embed.
- Collect at least 6 sample timetable images before you start: one clean printed grid, one phone screenshot of a digital timetable, one photo with glare or skew, one handwritten paper, one timetable in a non-standard layout (merged cells, color-coded teachers), and one deliberately crafted to create conflicts with your populated week. **Search the internet for real school and coaching-institute timetables** — the variety of formats out there is what this feature has to survive.

---

## What "Good" Upload Means

A good upload is a four-step contract: **Extract → Validate → Resolve Conflicts → Embed**. The platform must never skip a step, and the user must never end up in a state where the live timetable has changed in a way they did not approve. Validation must verify against the same Teacher ∩ Batch ∩ Subject ∩ Curriculum/Course rules that manual workspace entries follow — fuzzy name matches alone are not enough.

---

## The 7 Failure Modes Testers Must Hunt

1. The file picker accepting a file type the parser cannot actually handle (e.g. PDF, Excel, video).
2. Handwritten or illegible images being parsed into plausible-looking but wrong entries with no warning.
3. Embedding a partial week silently overwriting filled slots that were not part of the upload.
4. A fuzzy teacher-name match selecting the wrong teacher when two teachers share a surname.
5. Cross-batch teacher clashes (same teacher already booked in another batch at that slot) not being surfaced before embed.
6. The user changing the target batch mid-flow and the previously parsed entries staying marked "valid".
7. The conflict dialog being cancelled but the workspace having already been mutated.

---

## Test Scenarios

Each scenario uses a self-explanatory title followed by *What this is*, *What to try*, and *Expected*. Source the sample images yourself — the platform has to handle reality, not curated demos.

---

### A. File Format & Input Edge Cases

**TT-UPLOAD-A1 — Uploading A PDF Should Be Rejected At The File Picker, Not Silently Accepted**
*What this is:* The upload area says "Supports JPG, PNG, PDF photos" but the underlying file input may only accept images. A tester needs to know which one is the truth.
*What to try:* With a batch selected, click the upload area and try to pick a `.pdf` file (any single-page or multi-page PDF will do). Then try drag-and-drop with the same PDF.
*Expected:* Either the PDF is accepted and parsed end-to-end, or it is rejected with a clear message that PDF is not supported. The current "Supports … PDF photos" hint should not be a lie — file picker behaviour and the on-screen hint must agree.

**TT-UPLOAD-A2 — Uploading An Excel Or CSV File Should Never Reach The Parser**
*What this is:* Some institutes maintain timetables in Excel. A tester should confirm the upload area refuses spreadsheets cleanly.
*What to try:* Drag in an `.xlsx` and a `.csv` file. Then try the file picker route.
*Expected:* Both are rejected at the input layer with a clear message. The "Parse with AI" button must never become enabled for these.

**TT-UPLOAD-A3 — Uploading A Video Or A Random Binary Should Be Refused**
*What this is:* Sanity check that the input is not a free-for-all.
*What to try:* Try uploading an `.mp4`, a `.zip`, and a renamed binary (e.g. `timetable.exe`).
*Expected:* All are rejected before any parsing happens. No spinner, no fake "processing" state.

**TT-UPLOAD-A4 — A Very Large Image Should Either Process Or Fail Gracefully**
*What this is:* Phone photos can easily exceed 10–15 MB. The parser cannot just hang.
*What to try:* Upload a JPG of at least 10 MB taken from a phone in landscape.
*Expected:* Either it processes within a reasonable time with a visible progress indicator, or it fails with a clear "image too large" message. No infinite spinner, no silent failure.

**TT-UPLOAD-A5 — A Tiny Or Blurry Image Should Not Produce Confident Garbage**
*What this is:* Low-resolution and blurry inputs are exactly where AI extraction breaks.
*What to try:* Upload a 200×200px crop of a timetable, and separately a deliberately blurred photo of a clear timetable. Parse both.
*Expected:* The parsed result either fails outright with a "image quality too low" message or returns entries that are predominantly flagged as low-confidence. There should not be a parsed grid that looks confident but is mostly wrong.

**TT-UPLOAD-A6 — A Screenshot Of A Digital Timetable Should Parse As Well As A Photo**
*What this is:* Many users will paste a WhatsApp screenshot rather than photograph paper.
*What to try:* Take a clean screenshot of any digital timetable on your screen and upload it.
*Expected:* Extraction works at least as well as on a photo. Day, period, subject, and teacher columns are recognised.

**TT-UPLOAD-A7 — A Photo With Glare, Shadow, Or Skew Should Surface Low Confidence**
*What this is:* Real-world paper photos have shadows from the photographer's hand and are rarely perfectly aligned.
*What to try:* Photograph a printed timetable at an angle, with a visible shadow across the page. Upload and parse.
*Expected:* The parse may still succeed, but a non-trivial fraction of entries should be flagged as low confidence so the reviewer knows to verify them.

**TT-UPLOAD-A8 — A Rotated Or Sideways Image Should Be Handled Or Clearly Rejected**
*What this is:* Phones often save images with rotation metadata that some parsers ignore.
*What to try:* Upload a clear timetable image rotated 90° and another rotated 180°.
*Expected:* Either the parser auto-orients the image and extracts correctly, or it tells the user to rotate the image. Producing a parsed grid where days and periods are swapped silently is a bug.

**TT-UPLOAD-A9 — A Handwritten Paper Timetable Must Not Pretend To Succeed**
*What this is:* Many small institutes still maintain handwritten timetables on paper or chalkboards. This is the highest-risk input category.
*What to try:* Photograph a handwritten timetable (your own handwriting on paper is fine) and upload it. Try one neat sample and one messy sample.
*Expected:* If the handwriting is illegible, the platform should clearly say it could not extract reliably and should not generate a parsed grid full of made-up entries. If it does generate entries, almost every entry should be flagged as low confidence and the reviewer should be forced to verify each one before embed.

---

### B. Real-World Sample Sourcing

**TT-UPLOAD-B1 — Standard School Weekly Grid From The Internet**
*What this is:* The most common format — a 6×8 grid with days as rows and periods as columns.
*What to try:* Search the web for "CBSE school class 10 timetable" or similar, save a clear image, and upload it for any compatible batch.
*Expected:* Days and periods are recognised in the correct orientation. Subject and teacher cells map to the parsed grid in the same order as the source image.

**TT-UPLOAD-B2 — Coaching-Institute Block Timetable**
*What this is:* Coaching institutes often use long subject blocks (2–3 periods of the same subject back-to-back) instead of single periods.
*What to try:* Find or create a sample where Physics runs from P1–P3 on Monday. Upload it.
*Expected:* The parser produces one entry per period (P1, P2, P3 each as Physics), not a single merged entry. Embed should write three separate slots into Workspace.

**TT-UPLOAD-B3 — Timetable With Merged Cells And Lunch Breaks**
*What this is:* Many real timetables visually merge cells for lunch, assembly, or activity periods.
*What to try:* Source a timetable that visibly has a merged "Lunch" row across all days and at least one merged subject block.
*Expected:* Lunch and other non-teaching slots are either skipped from embed or surfaced as a separate non-period type. Merged subject cells expand correctly into individual periods.

**TT-UPLOAD-B4 — Color-Coded Or Teacher-Initial Timetable**
*What this is:* Some schools encode teachers as initials or colors rather than full names.
*What to try:* Upload a timetable that uses initials like "PS", "RK" instead of full names.
*Expected:* The validator either matches initials to the closest assigned teacher and flags the match as low confidence, or it flags every entry as "teacher not found". It must not silently pick a random teacher with the same first letter.

**TT-UPLOAD-B5 — Handwritten Chalkboard Or Whiteboard Photo**
*What this is:* The hardest real-world case.
*What to try:* Photograph a handwritten board timetable from across a room (mimicking a teacher snapping a quick photo) and upload it.
*Expected:* The platform clearly communicates the quality risk. Entries should be predominantly low-confidence and the user should be unable to embed without first reviewing every entry.

---

### C. OCR / Extraction Quality

**TT-UPLOAD-C1 — Low-Confidence Entries Must Be Visibly Flagged In The Parsed Grid**
*What this is:* Confidence is the only signal a reviewer has about which cells to double-check.
*What to try:* Use any imperfect image so the parsed result contains some entries with confidence below 0.8.
*Expected:* Low-confidence cells are visually distinct (color, badge, or icon) in the parsed grid AND counted in the "X need review" badge above. The numbers must match.

**TT-UPLOAD-C2 — Teacher Name Variation Should Match The Right Teacher**
*What this is:* A timetable might say "Mr. Sharma" while the institute has "Priya Sharma" and "Rohit Sharma".
*What to try:* Manually edit a parsed teacher cell to "Mr. Sharma" when two teachers in your batch share that surname. Re-validate.
*Expected:* The validator either picks one and surfaces the ambiguity as a warning, or refuses to match and asks the reviewer to choose. Silently picking one of two same-surname teachers is a critical bug.

**TT-UPLOAD-C3 — Subject Abbreviation Should Resolve To The Full Subject**
*What this is:* "Maths" / "Math" / "Mathematics" should all map to the same subject if the batch teaches it.
*What to try:* Edit a parsed subject cell to "Maths" and another to "Math" for a batch that has Mathematics in its curriculum.
*Expected:* Both resolve to Mathematics without raising a "subject not in batch" error. If they cannot be resolved automatically, the warning should suggest the closest batch subject.

**TT-UPLOAD-C4 — Missing Periods In The Source Should Stay Missing, Not Be Invented**
*What this is:* If the source timetable only has 5 periods on Monday, the parser must not make up a 6th.
*What to try:* Upload an image where Monday clearly only has 5 filled periods.
*Expected:* The parsed grid for Monday shows exactly 5 entries. No phantom 6th period appears.

**TT-UPLOAD-C5 — Manually Adding A Missing Cell Should Be Treated As Verified**
*What this is:* When a reviewer adds an entry the parser missed, that entry should not carry low-confidence styling.
*What to try:* In the parsed grid, click an empty slot and add a Subject + Teacher.
*Expected:* The new entry is shown as fully verified (confidence 1.0 / no warning badge) and is included in the embed payload.

**TT-UPLOAD-C6 — Editing A Low-Confidence Cell Should Re-Run Validation**
*What this is:* Validation cannot be a one-shot operation.
*What to try:* Pick a parsed entry whose teacher fails validation. Edit it inline to a teacher who IS assigned to the batch.
*Expected:* The validation card updates immediately — the error for that entry disappears and the error count decreases. The Embed button enables once the last blocking error is resolved.

**TT-UPLOAD-C7 — Removing A Wrong Parsed Entry Should Remove It From Validation And Embed**
*What this is:* Removed entries should leave no trace in the embed payload.
*What to try:* Remove an entry that was raising a validation error. Inspect the validation card and the embed entry count.
*Expected:* The error for that entry disappears, the entry count drops by one, and the entry is not present in Workspace after embed.

---

### D. Validation Errors & Action Links

**TT-UPLOAD-D1 — Teacher Not Found In Institute Must Block Embed**
*What this is:* If the parsed teacher does not exist in the institute at all, embedding would create an orphan entry.
*What to try:* Edit a parsed teacher cell to a name that does not exist anywhere in your institute (e.g. "Mr. Nobody"). Try to embed.
*Expected:* A blocking error appears, the Embed button is disabled, and the error includes an "Add Teacher" link that navigates to the teacher creation page.

**TT-UPLOAD-D2 — Teacher Exists But Not Assigned To The Selected Batch Must Block Embed**
*What this is:* This is the single most common mismatch. A teacher might exist in the institute but be assigned to a different batch.
*What to try:* Edit a parsed teacher cell to a real teacher who is NOT assigned to your target batch.
*Expected:* A blocking error appears identifying the teacher and the batch, with a "Manage Teachers" deep link.

**TT-UPLOAD-D3 — Teacher Assigned To Batch But Wrong Subject Mapping Must Be Caught**
*What this is:* The teacher might be assigned to the batch for Chemistry but the parsed entry says they teach Physics.
*What to try:* Pick a teacher assigned to your target batch for one subject only. Edit a parsed entry so the teacher is paired with a different subject the batch also offers.
*Expected:* Either a blocking error or a clear warning highlighting the teacher–subject mismatch. Silent acceptance is a bug.

**TT-UPLOAD-D4 — Subject Not In Batch Curriculum Must Block Embed**
*What this is:* Embedding a subject the batch does not offer would corrupt the curriculum view.
*What to try:* Edit a parsed subject to one not in the batch's curriculum (e.g. add "Sanskrit" to a JEE batch).
*Expected:* Blocking error appears. Embed disabled until fixed.

**TT-UPLOAD-D5 — Validation Action Links Should Not Lose Upload Context**
*What this is:* Clicking "Add Teacher" or "Manage Teachers" should let the reviewer come back without re-uploading.
*What to try:* On a validation error, click the deep-link button. Add the missing teacher. Use the browser back button.
*Expected:* The uploaded image and parsed grid are still on screen with the same edits intact, and validation re-runs reflecting the new teacher.

**TT-UPLOAD-D6 — Warnings Alone Do Not Block Embed**
*What this is:* Low-confidence and duplicate-slot warnings should be advisory, not blocking.
*What to try:* Get a parsed set with only warnings (no errors). Try to embed.
*Expected:* Embed button is enabled. Embedding proceeds. The reviewer is responsible for accepting the risk.

---

### E. Partial-Week Embed Into Existing Data

This is the highest-risk section. Re-confirm before each scenario that your target batch's current week is roughly 50% pre-filled.

**TT-UPLOAD-E1 — Embedding Into An Empty Week Should Insert All Entries Cleanly**
*What this is:* Baseline. Embedding into a clean canvas should not trigger the conflict dialog.
*What to try:* Pick a *different* batch whose current week is empty. Upload a valid image for it and embed.
*Expected:* No conflict dialog appears. All parsed entries appear in Workspace at the correct day/period.

**TT-UPLOAD-E2 — Embedding Into A 50% Filled Week With No Overlap Must Preserve Existing Entries**
*What this is:* The classic safe case — the upload fills empty slots only.
*What to try:* On your pre-populated batch, upload an image whose entries fall into slots that are currently empty in Workspace.
*Expected:* No conflict dialog. After embed, both the original 50% AND the newly embedded entries are visible. Nothing was overwritten or removed.

**TT-UPLOAD-E3 — Embedding With Partial Overlap And Choosing "Skip Conflicts" Must Leave Existing Entries Untouched**
*What this is:* The reviewer is saying "trust the existing schedule, only add what does not collide."
*What to try:* Upload an image where some parsed entries fall on slots already filled in Workspace and some fall on empty slots. In the conflict dialog, choose **Skip Conflicts**.
*Expected:* Only non-overlapping entries are embedded. Every existing entry in the conflicting slots remains exactly as it was — same subject, same teacher.

**TT-UPLOAD-E4 — Embedding With Partial Overlap And Choosing "Replace All" Must Overwrite Only The Listed Slots**
*What this is:* The reviewer is saying "the upload is the source of truth for the conflicting slots."
*What to try:* Same setup as E3, but choose **Replace All**. Note exactly which slots the dialog listed before clicking.
*Expected:* The slots listed in the dialog are overwritten with the parsed entries. Slots NOT listed (whether previously filled or empty) are left exactly as they were. The dialog must not be a license to wipe the whole week.

**TT-UPLOAD-E5 — Cancelling The Conflict Dialog Must Make Zero Changes To Workspace**
*What this is:* This is the failure mode that destroys user trust.
*What to try:* Trigger the conflict dialog with at least 3 conflicts. Click **Cancel**. Then open Workspace.
*Expected:* Workspace looks identical to how it was before you clicked Embed. No parsed entries leaked in, no existing entries were removed.

**TT-UPLOAD-E6 — Embedding A Sparse Upload Must Not Wipe The Rest Of The Week**
*What this is:* If the parsed set only has Monday entries, embed must not touch Tuesday–Saturday.
*What to try:* Upload an image that only contains one day's schedule. Embed.
*Expected:* Only that day's slots are touched. The rest of the week is unchanged. This must hold for both Skip Conflicts and Replace All paths.

**TT-UPLOAD-E7 — Embedding Should Not Create Duplicate Entries For The Same Slot**
*What this is:* If the parsed set has two entries for the same day/period and the reviewer ignored the duplicate warning, embed must still produce one entry per slot.
*What to try:* Force two parsed entries for the same Monday P1 (different subjects). Ignore the duplicate warning. Embed.
*Expected:* Only one entry exists for Monday P1 after embed. The platform must not allow two entries to share the same slot — either the second entry replaces the first, or the embed errors out before persisting.

**TT-UPLOAD-E8 — Undo In Workspace Should Reverse An Embed In One Step**
*What this is:* A safety net for the user who realises they embedded into the wrong batch.
*What to try:* Embed any non-trivial parsed set. Switch to the Workspace tab and trigger Undo.
*Expected:* All embedded entries are removed in a single Undo. The pre-embed state of the week is fully restored. Redo brings the embed back.

---

### F. Conflict Detection Coverage

The Workspace conflict engine knows about teacher clashes, batch clashes, overloads, holidays, non-working days, and exam blocks. Embed must not be a back door that bypasses any of these checks.

**TT-UPLOAD-F1 — Embedding A Slot Where The Teacher Is Already Booked In Another Batch Must Be Caught**
*What this is:* The same teacher cannot be in two classrooms at the same time. Manual entry blocks this. Upload must too.
*What to try:* Pick a teacher who is already teaching Batch A on Monday P3 in Workspace. Upload a parsed entry that puts the same teacher into Batch B (your target batch) on Monday P3. Embed.
*Expected:* Either the embed conflict dialog flags this as a teacher clash before persisting, or the Workspace conflict panel surfaces it loudly the moment Workspace re-renders. Silent acceptance with no warning anywhere is a critical bug.

**TT-UPLOAD-F2 — Embedding Pushes A Teacher Over Their Weekly Period Cap**
*What this is:* Teacher load is a configured constraint. Upload must respect it.
*What to try:* Choose a teacher near their weekly cap. Upload entries that, when embedded, would exceed the cap. Embed.
*Expected:* After embed, the Workspace teacher load card and conflict panel both show the overload. Embed should ideally warn before persisting, but at minimum the post-embed view must surface it.

**TT-UPLOAD-F3 — Embedding On A Configured Holiday Must Be Blocked Or Flagged**
*What this is:* If the institute has marked a day as a holiday, no class should land on it.
*What to try:* In Setup, mark the upcoming Wednesday as a holiday. Upload a parsed image whose Wednesday column has entries. Embed.
*Expected:* Wednesday entries are either rejected during validation, flagged in the conflict dialog, or visibly highlighted in Workspace as "scheduled on a holiday".

**TT-UPLOAD-F4 — Embedding Onto A Non-Working Day Must Be Blocked Or Flagged**
*What this is:* Many institutes do not work on Sundays. Upload should respect the working-day configuration.
*What to try:* Confirm Sunday is configured as non-working. Upload an image that includes Sunday entries. Embed.
*Expected:* Sunday entries either do not embed at all, or are surfaced as a constraint violation. They must not be silently inserted.

**TT-UPLOAD-F5 — Embedding On A Slot Already Inside An Exam Block Must Be Caught**
*What this is:* Exam blocks reserve slots for assessments. Regular classes cannot land in them.
*What to try:* Configure an exam block covering Tuesday P2–P4 for your target batch. Upload entries that would fill those slots. Embed.
*Expected:* The collision is surfaced — either pre-embed in the conflict dialog or post-embed in the Workspace conflict panel.

**TT-UPLOAD-F6 — Embedding A Period That Exceeds The Day's Period Count Must Be Refused**
*What this is:* If the institute is configured for 6 periods per day, an entry for P7 has no valid slot.
*What to try:* Edit a parsed entry to period 7 (or beyond your configured maximum). Embed.
*Expected:* The entry is either rejected during validation or silently clipped, but never persists into a period that does not exist.

**TT-UPLOAD-F7 — Two Parsed Entries Hitting The Same Slot Must Be Caught Before Embed**
*What this is:* Internal consistency of the parsed set itself.
*What to try:* Force two parsed entries on Wednesday P2 (same day, same period, different subjects). Inspect the validation card.
*Expected:* A duplicate-slot warning lists both entries and points the reviewer to remove one before embedding.

---

### G. Week & Date Context

**TT-UPLOAD-G1 — Embed Should Clearly Indicate Which Week It Is Writing To**
*What this is:* Today the embed always targets the current week. The user must not be left guessing.
*What to try:* Open Upload from a fresh navigation. Look for any indication of the target week before clicking Embed.
*Expected:* The pre-embed area shows "These entries will be added to [Batch] timetable for [week label / date range]." If only "current week" is shown, that is acceptable but should be unambiguous.

**TT-UPLOAD-G2 — Changing The Selected Batch After Upload Must Re-Run Validation**
*What this is:* Validation against teachers and subjects depends entirely on the selected batch.
*What to try:* Upload an image and parse it for Batch A. Without removing the image, change the batch dropdown to Batch B. Inspect the validation card.
*Expected:* Validation re-runs immediately. Errors and warnings reflect Batch B's teachers and curriculum, not Batch A's. Stale "valid" status from Batch A is a critical bug.

**TT-UPLOAD-G3 — Switching Batch Or Removing The Image Should Clear Parsed State Cleanly**
*What this is:* Stale parsed entries from a previous batch must not leak into a new upload session.
*What to try:* Parse for Batch A, remove the image, then start a fresh upload for Batch B.
*Expected:* The previous parsed grid is gone. Embed targets only the new parsed entries for Batch B.

**TT-UPLOAD-G4 — Embedded Entries Must Appear In The Correct Week Of Workspace Immediately**
*What this is:* No refresh, no manual navigation.
*What to try:* Embed a parsed set. Get redirected to Workspace.
*Expected:* Workspace lands on the same batch and the week the embed targeted, with the new entries visible without a page refresh.

---

### H. Post-Embed Verification

**TT-UPLOAD-H1 — Embedded Entries Render In The Correct Slots In Workspace**
*What this is:* Day and period mapping must survive the round-trip.
*What to try:* After embedding 8–10 known entries, locate each in Workspace and compare day/period.
*Expected:* Every embedded entry is in the slot the parsed grid said it would be in. None are shifted by a day or a period.

**TT-UPLOAD-H2 — Workspace Conflict Panel Re-Evaluates With The Embedded Entries**
*What this is:* Conflicts that only become visible AFTER the embed must show up.
*What to try:* Construct an upload that, post-embed, triggers a teacher clash with another batch's pre-existing entry. Embed and open the conflict panel.
*Expected:* The new clash is listed in the panel with the correct teacher, day, and period.

**TT-UPLOAD-H3 — Teacher Load Counters Update After Embed**
*What this is:* Teacher weekly period totals must include the just-embedded entries.
*What to try:* Note a teacher's current load (e.g. 18/24). Embed entries that add 4 more periods for them.
*Expected:* The teacher load card now reads 22/24 without a refresh.

**TT-UPLOAD-H4 — Weekly And Monthly Views Both Show Embedded Entries**
*What this is:* No view should be missing the new data.
*What to try:* Switch between Weekly and Monthly Workspace views after embed.
*Expected:* All embedded entries are present in both views, in the correct slots.

**TT-UPLOAD-H5 — Print Or Export Of The Workspace Includes Embedded Entries**
*What this is:* Final confirmation that embed produced real, persisted entries.
*What to try:* Trigger Print or Export from Workspace immediately after embed.
*Expected:* The exported artifact includes every embedded entry alongside the original entries.

---

## Critical Bugs QA Must Flag Immediately

1. The file picker accepts a file type that the parser cannot handle, leading to a stuck spinner or fake parse result.
2. A handwritten or unreadable image produces a parsed grid full of confident entries with no low-confidence flags.
3. An embed silently overwrites slots that were not in the conflict dialog list.
4. Cancelling the conflict dialog still mutates Workspace.
5. A fuzzy teacher-name match selects the wrong teacher when two teachers share a surname, with no ambiguity warning.
6. Changing the selected batch after upload leaves the old parsed entries marked "valid" against the new batch.
7. A blocking validation error does not actually disable the Embed button.
8. Embed succeeds but the new entries do not appear in Workspace (silent persistence failure).
9. Embed creates two entries for the same day/period in the same batch.
10. Embedding bypasses the conflict engine — teacher clashes across batches, holidays, non-working days, or exam blocks are never surfaced.

---

## Suggested Execution Order

1. File format and input edge cases (Section A)
2. Real-world sample sourcing (Section B)
3. OCR / extraction quality (Section C)
4. Validation errors and action links (Section D)
5. Partial-week embed into existing data (Section E)
6. Conflict detection coverage (Section F)
7. Week and date context (Section G)
8. Post-embed verification (Section H)

Run E and F only after you have a confidently pre-populated Workspace week — they are the scenarios most likely to surface destructive bugs.

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
