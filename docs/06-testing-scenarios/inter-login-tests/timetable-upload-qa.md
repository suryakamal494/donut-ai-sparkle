# Timetable Upload View QA

> This document is for testers validating Upload Existing Timetable, image parsing, manual review, validation, and embedding parsed timetable entries into Workspace. It starts scenario lettering from A so upload testing can be assigned independently.

---

## Before You Begin

Use at least two timetable images: one clean image that should parse successfully and one imperfect image with low-confidence or ambiguous cells. Prepare teacher, batch, subject, and curriculum/course data so testers can confirm that upload validation does not rely only on teacher names or subject-name matches.

---

## Upload Validation Principle

Uploaded entries must pass the same Teacher ∩ Batch ∩ Subject ∩ Curriculum/Course validation as manual workspace entries. Low confidence can be a warning, but teacher/batch/subject/scope mismatch must block embedding.

---

## Test Scenarios

Each scenario below describes an upload, parse, validation, or embed situation and the expected platform behavior.
### A. Upload Prerequisite Scenarios

**TT-UPLOAD-A1 — Batch Required Before Upload**
Open Upload Existing Timetable without selecting a batch. Upload area should be disabled or should prompt batch selection.

**TT-UPLOAD-A2 — File Picker Upload**
Select a valid image through file picker. Preview should display and process button should enable.

**TT-UPLOAD-A3 — Drag and Drop Upload**
Drag a valid image into the upload area. Preview should display the same as file picker.

**TT-UPLOAD-A4 — Unsupported File Type**
Upload an unsupported file type. Platform should reject it with a clear message.

**TT-UPLOAD-A5 — Remove Uploaded Image**
After preview appears, remove it. Preview and parsed state should reset, and admin should be able to upload a different image.

**TT-UPLOAD-A6 — Change Batch After Upload**
If admin changes selected batch after image upload or parse, validation should rerun. Parsed entries should not remain marked valid for the old batch.

---

---

### B. AI Parse & Manual Review Scenarios

**TT-UPLOAD-B1 — Successful Parse**
Upload a clear timetable image and process it. Parsed grid should show days, periods, subjects, teachers, and confidence indicators.

**TT-UPLOAD-B2 — Low Confidence Cell**
A parsed entry has confidence below threshold. It should be visually highlighted and listed as a review warning.

**TT-UPLOAD-B3 — Edit Parsed Cell**
Edit subject and teacher in a parsed cell. Confidence should update to manual/verified state and validation should rerun.

**TT-UPLOAD-B4 — Add Missing Cell**
Click an empty parsed grid cell and add a missing entry. It should be included in validation and embed count.

**TT-UPLOAD-B5 — Remove Incorrect Cell**
Remove a wrong parsed entry. It should disappear from grid, validation, and embed payload.

**TT-UPLOAD-B6 — Duplicate Parsed Slot**
Parsed data contains two entries for the same day/period. Validator should show duplicate slot warning and suggest removal.

**TT-UPLOAD-B7 — Image Zoom Review**
Zoom in/out on original image. Parsed grid should remain usable and the original image should not distort the page layout.

---

---

### C. Validation Scenarios

**TT-UPLOAD-C1 — Teacher Not Found**
Parsed teacher name does not match any teacher in the institute. Validator should show blocking error and prevent embed.

**TT-UPLOAD-C2 — Teacher Exists But Not Assigned to Batch**
Parsed teacher exists but is not assigned to selected batch. Validator should show blocking error.

**TT-UPLOAD-C3 — Subject Not in Batch**
Parsed subject is not part of the selected batch curriculum/course. Validator should show blocking error.

**TT-UPLOAD-C4 — Teacher Assigned to Batch But Wrong Subject**
Teacher is assigned to selected batch for Chemistry, but uploaded entry says Physics. Platform should block or flag mismatch.

**TT-UPLOAD-C5 — Curriculum/Course Mismatch**
Teacher teaches Physics in CBSE, but selected batch is JEE Physics. Same subject name should not pass validation unless teacher is assigned to that JEE batch/course.

**TT-UPLOAD-C6 — Warnings Do Not Block Embed**
Low confidence warning with otherwise valid teacher/batch/subject should allow embed after review.

**TT-UPLOAD-C7 — Blocking Errors Prevent Embed**
Any teacher-not-found, teacher-not-assigned, or subject-not-in-batch error should disable Embed to Timetable.

**TT-UPLOAD-C8 — Validation Action Links**
If validator offers “Add Teacher” or “Manage Teachers,” link should navigate to correct page without losing the uploaded context unless intentionally reset.

---

---

### D. Embed Conflict Scenarios

**TT-UPLOAD-D1 — Embed Into Empty Workspace**
Parsed valid entries are embedded into an empty selected batch/week. Workspace should open in Batch Mode with entries visible.

**TT-UPLOAD-D2 — Embed Into Occupied Slots**
Some parsed entries target slots already occupied in workspace. Platform should show conflict dialog before embedding.

**TT-UPLOAD-D3 — Skip Conflicts**
Choose Skip Conflicts. Non-conflicting parsed entries should embed; conflicting entries should not be added.

**TT-UPLOAD-D4 — Replace All**
Choose Replace All. Existing entries in conflicting slots should be replaced by parsed entries, not duplicated.

**TT-UPLOAD-D5 — Cancel Embed Conflict Dialog**
Cancel conflict dialog. No parsed entries should be embedded.

**TT-UPLOAD-D6 — Embedded Entries Trigger Normal Conflict Rules**
After embed, conflict panel should still detect teacher clashes, batch clashes, overloads, and facility conflicts.

**TT-UPLOAD-D7 — Embedded Teacher Name Matching**
If upload uses partial teacher names or spelling variations, matched teacher should be correct. Ambiguous matches should require manual review.

---

---

## Critical Bugs QA Must Flag Immediately

1. Upload embeds teacher/batch/subject mismatches.
2. Upload validates only teacher name but ignores assigned batch and curriculum/course.
3. Blocking validation errors still allow Embed to Timetable.
4. Changing selected batch after upload leaves old parsed entries marked valid.
5. Ambiguous teacher-name matches are accepted without manual review.
6. Embed creates duplicate timetable entries without conflict warning.
7. Cancelled embed still changes Workspace.

---

## Suggested Execution Order

1. Upload prerequisites
2. AI parse and manual review
3. Validation errors and warnings
4. Embed conflict handling

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
