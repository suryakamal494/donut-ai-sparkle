## What you are asking for

You want a new QA documentation page for the Institute Timetable module, written in the same style as the existing `curriculum-scope-qa` document.

This is not a small checklist. You want a tester-oriented scenario guide that first explains the timetable domain, then gives grouped real-world test scenarios so QA can thoroughly test the product and find bugs before release.

The focus is the Institute Admin timetable area, especially these four timetable pages/sub-tabs:

1. **Setup**
   - Period Structure
   - Period Types
   - Holidays
   - Teacher Load
   - Exam Schedule
   - Teacher Constraints
   - Facilities

2. **Workspace**
   - Teacher mode
   - Batch mode
   - Drag-and-drop teacher assignment
   - Assignment dialog
   - Conflict panel
   - Upload/Embed flow
   - Copy previous week
   - Undo/Redo
   - Save draft / Publish

3. **View Timetable / Review Timetable**
   - Weekly view
   - Monthly view
   - Batch filter
   - Teacher filter
   - Holiday and exam-block display
   - Past/future/current week behavior
   - Print/export behavior
   - Edit week navigation back to workspace

4. **Substitution Management**
   - Mark teacher absent
   - Full-day absence
   - Partial-period absence
   - Coverage needed list
   - Find substitute
   - Substitute availability validation
   - Remove/change substitute
   - Holiday behavior

You also want the document to include complex validation scenarios, for example:

- A teacher cannot be assigned to two batches at the same day and period.
- A batch cannot have two teachers/classes in the same day and period.
- A teacher should only be assignable to a batch if that teacher is already assigned to that batch.
- The teacher-batch-subject-curriculum mapping must be respected.
- If a teacher has a weekly load limit, the system should warn/block when the limit is exceeded.
- Teacher remaining-period count should decrease as periods are assigned.
- Setup changes should affect workspace/view/substitution correctly.
- Copy-week should not create broken duplicates or overwrite unexpectedly.
- Uploaded timetable data should be validated before embedding into the workspace.
- Mid-year changes, like changing period structure or teacher assignment, should be tested carefully.

The final output should be a proper QA document, not UI implementation. The document should guide testers like a narrative, grouped by headings, similar to the curriculum scope QA style.

---

## What I found in the existing timetable implementation

### Existing routes/pages

The current codebase has these timetable pages:

```text
/institute/timetable              -> Timetable Workspace
/institute/timetable/setup        -> Timetable Setup
/institute/timetable/view         -> View Timetable / Review Timetable
/institute/timetable/substitution -> Substitution Management
/institute/timetable/upload       -> Upload Existing Timetable
```

The upload page is not one of the four main tabs, but it is launched from the Workspace and must be covered because uploaded schedules are embedded back into the Workspace.

### Existing documentation style to follow

The existing `/docs/06-testing-scenarios/inter-login-tests/curriculum-scope-qa` page uses this structure:

```text
Title
Short description
Before You Begin
Domain Glossary
Where to Find Things in the UI
Prerequisites for Testing
How the Platform Links Everything Together
Entity Relationship Model
Important edit/cascade behavior
Test Scenarios grouped by topic
Scenario IDs with narrative descriptions
```

I will follow the same pattern for timetable QA.

### Current timetable validation areas found in code

The timetable implementation currently includes or implies these validations:

#### Setup validations / configuration rules

- Working days are configurable.
- Periods per day are configurable.
- Breaks can be added, edited, and removed.
- Maximum 4 breaks are allowed in the current setup logic.
- Time mappings can be manually edited or generated based on period duration and breaks.
- Teacher load can be edited per teacher.
- Advanced mode enables Teacher Constraints and Facilities.
- Teacher constraints include:
  - max periods per day
  - max consecutive periods
  - unavailable days
  - unavailable periods
  - time window
  - hard vs soft preference level
- Facilities include allowed classes, duration, availability, and linked period type.
- Exam Schedule blocks regular timetable slots downstream.

#### Workspace validations / behavior

- Teacher mode and Batch mode exist.
- In Teacher mode, selecting a teacher shows only that teacher’s allowed batches.
- In Batch mode, selecting a batch shows only teachers assigned to that batch and available on that day.
- Subject is auto-determined from the teacher-batch assignment.
- A teacher cannot be dragged onto a day they do not work.
- A teacher cannot be assigned to two classes at the same day and period.
- A batch cannot be assigned two classes at the same day and period.
- If a teacher has one allowed batch, drag-and-drop directly assigns that batch.
- If a teacher has multiple allowed batches, a batch picker opens.
- Existing entries can be clicked and removed.
- Entry drag/move checks occupied target slots and teacher working days.
- Conflict panel detects:
  - teacher clash
  - batch clash
  - teacher overload
- Assignment dialog displays teacher remaining periods.
- In Batch mode, teachers with zero remaining periods are disabled.
- Hard teacher constraint violations block assignment in Batch mode.
- Facility conflicts disable facility selection.

#### Upload validations / behavior

- User must select a batch before uploading.
- Upload accepts image files through file picker or drag/drop.
- Parsed timetable entries have confidence scores.
- Validation checks:
  - teacher not found
  - teacher not assigned to selected batch
  - subject not in selected batch curriculum
  - low-confidence OCR result
  - duplicate parsed slot
- Blocking errors prevent embedding.
- Warnings allow embedding after review.
- Existing timetable slot conflicts show a conflict dialog.
- User can skip conflicting uploaded entries or replace all.
- Embedded entries navigate back to Workspace and are added to the selected batch/week.

#### View / Review timetable behavior

- Weekly and monthly views exist.
- Batch and teacher filters exist.
- Past weeks are read-only; edit button is hidden.
- Current/future weekly views allow “Edit Week”.
- Holidays display as blocked/holiday cells.
- Exam blocks display as blocked cells with exam label/type.
- Break rows display between configured periods.
- Print/export uses browser print.

#### Substitution validations / behavior

- Date selector supports previous/next day and calendar picker.
- Holidays show “No coverage needed”.
- Mark Teacher Absent requires selecting a teacher.
- Absence can be full-day or partial periods.
- Coverage Needed is derived from absent teacher’s timetable entries for that date/day.
- Substitute list excludes:
  - original absent teacher
  - teachers already busy in that period
  - teachers who do not work on that day
- Substitute assignment creates a temporary coverage record.
- Existing substitution can be changed or removed.
- Cancelling an absence also removes its substitutions.

### Important gap to reflect in QA document

The timetable mock data has `allowedBatches` with batch and subject, but it does not visibly carry full curriculum metadata in the timetable-specific data model. The platform rule from curriculum-scope QA says teacher assignment must be validated by:

```text
Teacher curriculum ∩ Batch curriculum
AND
Teacher subject ∩ Batch subject
AND
Teacher must be assigned to that batch
```

So the timetable QA document should explicitly test this intended rule, even if the current mock implementation only partially models it. This will help QA identify whether the production implementation has fully connected timetable logic to the master-data teacher/batch/curriculum scope.

---

## Proposed implementation approach

I will create a new documentation page for timetable QA, likely:

```text
docs/06-testing-scenarios/inter-login-tests/timetable-institute-qa.md
```

I will also register it in the docs navigation if required, so it is accessible from the Docs UI.

The document will be written as a complete scenario guide, not a table-only smoke test.

---

## Phase-wise implementation plan

### Phase 1 — Build the document foundation

Create the new QA document with:

1. Title and purpose
2. “Before You Begin” section
3. Domain glossary for timetable terms:
   - Period
   - Break
   - Working Day
   - Period Type
   - Teacher Load
   - Remaining Periods
   - Teacher Constraint
   - Facility
   - Batch Mode
   - Teacher Mode
   - Conflict
   - Exam Block
   - Substitution
   - Upload/Embed
4. UI navigation map:
   - Setup
   - Workspace
   - Upload Existing Timetable
   - View Timetable
   - Substitution Management
5. Prerequisite test data:
   - minimum 10 teachers
   - multiple batches
   - overlapping subjects
   - at least 2 curriculums/courses
   - teachers with different weekly loads
   - teachers with unavailable days/periods
   - batches with different curriculum/subject combinations
   - holidays and exam blocks configured
   - at least one facility/lab

### Phase 2 — Explain timetable relationship model

Add a conceptual model like:

```text
Institute Setup
  ├── Period Structure
  ├── Working Days
  ├── Holidays
  ├── Exam Blocks
  ├── Teacher Loads
  ├── Teacher Constraints
  └── Facilities
        │
        ▼
Workspace
  ├── Teacher Mode
  ├── Batch Mode
  ├── Upload/Embed
  ├── Copy Week
  └── Save/Publish
        │
        ▼
View Timetable / Review
  ├── Weekly View
  ├── Monthly View
  ├── Batch Filter
  └── Teacher Filter
        │
        ▼
Substitution
  ├── Absence
  ├── Coverage Needed
  └── Substitute Assignment
```

Also add the core timetable golden rule:

```text
A timetable entry is valid only if the teacher, batch, subject, curriculum/course, day, period, load, constraints, facility, holiday, and exam-block rules all agree.
```

### Phase 3 — Setup test scenarios

Create grouped scenarios for the seven Setup components:

#### A. Period Structure scenarios

Examples:
- Initial setup with 6 working days and 8 periods.
- Change periods per day from 8 to 7 mid-year.
- Change periods per day from 7 to 9 after workspace already has entries.
- Remove Saturday after Saturday entries already exist.
- Turn time mapping on/off and verify display in View Timetable.
- Edit start/end times and verify ordering/readability.
- Generate time slots after changing breaks.

#### B. Break scenarios

Examples:
- Add one break after P2.
- Add multiple breaks and verify order.
- Try adding more than 4 breaks.
- Move lunch break from after P4 to after P5.
- Delete a break after timetable is already built.
- Verify breaks appear in View Timetable and do not become assignable periods.

#### C. Period Types scenarios

Examples:
- Add Lab / Library / Sports period type.
- Verify teacher-required vs no-teacher period types.
- Verify double-period period type behavior.
- Verify period type display and color consistency.

#### D. Holidays scenarios

Examples:
- Add a full-day holiday.
- Add holiday after timetable entries exist.
- Verify holiday blocks workspace/view/substitution.
- Verify copy-week skips holiday when option enabled.
- Verify holiday does not remove source entries.

#### E. Teacher Load scenarios

Examples:
- Set teacher weekly limit to 10 and attempt 11th assignment.
- Verify remaining-period count decreases after assignment.
- Verify removing an entry restores count.
- Verify copied week affects teacher load correctly.
- Verify overload warning appears in conflict panel.

#### F. Exam Schedule scenarios

Examples:
- Add exam block for one batch.
- Add exam block for all batches.
- Verify blocked cells in View Timetable.
- Verify workspace should not allow regular assignment during exam block.
- Verify copy-week skip exam periods option.

#### G. Advanced Setup scenarios

Examples:
- Hard constraint blocks assignment.
- Soft constraint warns but allows assignment.
- Teacher unavailable day.
- Teacher unavailable period.
- Facility already booked by another class.
- Facility not allowed for selected class.
- Double-period facility requirement.

### Phase 4 — Workspace test scenarios

Create detailed groups for workspace behavior:

#### H. Teacher Mode scenarios

Examples:
- Select a teacher and verify only assigned batches appear.
- Drag teacher with one batch to a free slot.
- Drag teacher with multiple batches and verify batch picker opens.
- Select allowed batch and verify subject auto-fills.
- Attempt assignment to an unassigned batch.
- Attempt teacher assignment on non-working day.
- Attempt teacher assignment beyond weekly load.

#### I. Batch Mode scenarios

Examples:
- Select batch and verify only assigned teachers appear.
- Select teacher and verify subject is auto-determined.
- Verify teacher with same subject but not assigned to batch is hidden.
- Verify teacher assigned to same batch but wrong curriculum is hidden/blocked.
- Assign one teacher to slot, then attempt another teacher in same batch/slot.
- Verify batch conflict message.

#### J. Conflict scenarios

Examples:
- Same teacher, same period, different batches.
- Same batch, same period, different teachers.
- Teacher overload.
- Facility conflict.
- Constraint violation.
- Conflict panel count and navigation.
- Conflict resolution by moving/removing entry.

#### K. Edit, move, undo/redo scenarios

Examples:
- Click existing entry and remove it.
- Move entry to empty slot.
- Move entry to occupied slot.
- Move entry to teacher non-working day.
- Undo assignment.
- Redo assignment.
- Undo after deletion.

#### L. Copy week scenarios

Examples:
- Copy teacher-specific week.
- Copy batch-specific week.
- Copy all entries.
- Copy to one future week.
- Copy to multiple future weeks.
- Skip holidays.
- Skip exam periods.
- Overwrite existing entries.
- Copy when target week already has entries.
- Verify no duplicate conflicts are silently created.

#### M. Save/publish scenarios

Examples:
- Save draft and verify status.
- Publish and verify View Timetable shows expected entries.
- Edit after publish and republish.
- Verify unpublished changes should not appear downstream if persistence is implemented.

### Phase 5 — Upload/Embed test scenarios

Create scenarios for uploaded timetable validation:

#### N. Upload prerequisites

- Batch must be selected before upload.
- File picker upload.
- Drag/drop upload.
- Unsupported file or non-image handling.
- Remove uploaded image.

#### O. AI parse / review scenarios

- Successful parse.
- Low-confidence parsed cell.
- Edit parsed subject/teacher.
- Add missing cell.
- Remove wrong cell.
- Duplicate parsed slot.

#### P. Validation scenarios

- Teacher not found.
- Teacher exists but not assigned to selected batch.
- Teacher assigned to batch but wrong subject.
- Subject not in selected batch curriculum.
- Teacher-batch-curriculum mismatch.
- Blocking errors prevent embed.
- Warnings allow embed but require review.

#### Q. Embed conflict scenarios

- Embed into empty workspace.
- Embed when some target slots are occupied.
- Skip conflicts.
- Replace all.
- Cancel embed.
- Verify embedded entries appear in Workspace in Batch mode.
- Verify embedded entries trigger normal conflict detection.

### Phase 6 — View / Review Timetable scenarios

Create grouped scenarios for review:

#### R. Weekly view scenarios

- View all batches.
- Filter by one batch.
- Filter by one teacher.
- Combine batch and teacher filters.
- Verify break rows.
- Verify holidays.
- Verify exam blocks.
- Verify empty cells.
- Verify substituted teacher display.

#### S. Monthly view scenarios

- Month navigation.
- Current day highlighting.
- Non-working day display.
- Holiday display.
- Batch/teacher filters in monthly view.

#### T. Past/current/future week scenarios

- Past week should be read-only.
- Current week should be editable.
- Future week should be editable.
- Edit Week navigates back to Workspace with selected week.

#### U. Export/print scenarios

- Print weekly timetable.
- Print after applying batch filter.
- Print after applying teacher filter.
- Verify print header and dates.

### Phase 7 — Substitution Management scenarios

Create grouped substitution scenarios:

#### V. Absence scenarios

- Mark full-day absence.
- Mark partial-period absence.
- Attempt absence without teacher.
- Cancel absence.
- Multiple absences on same day.
- Absence on holiday.

#### W. Coverage scenarios

- Full-day absence generates all affected classes.
- Partial absence generates only selected periods.
- No timetable entries means no coverage needed.
- Urgent count updates.
- Covered count updates.

#### X. Substitute selection scenarios

- Substitute list excludes original teacher.
- Substitute list excludes busy teachers.
- Substitute list excludes non-working-day teachers.
- Substitute should ideally respect subject/curriculum capability.
- Assign substitute.
- Change substitute.
- Remove substitute.

#### Y. Cross-impact scenarios

- Substitution should appear in View Timetable.
- Teacher schedule should show substitution duty if downstream exists.
- Student timetable should show substitute if downstream exists.
- Cancelling absence should remove substitution everywhere.

### Phase 8 — Cross-module and edge-case scenarios

Add final advanced scenarios that connect timetable to the rest of the platform:

- Teacher assignment changed after timetable is created.
- Batch curriculum changed after timetable is created.
- Subject removed from batch after timetable is created.
- Teacher load changed mid-year.
- Period structure changed mid-year.
- Holiday added after published timetable.
- Exam block added after published timetable.
- Teacher deleted/deactivated after assigned to timetable.
- Batch archived/deactivated after timetable exists.
- Facility removed after assignment exists.
- Same teacher assigned to multiple courses/curriculums with overlapping subjects.
- Teacher assigned to batch but not to required subject.
- Teacher assigned to subject but not batch.
- Teacher assigned to curriculum but not batch.
- Batch and teacher share subject name but not curriculum/course.

### Phase 9 — Add explicit “Known Bug / Gap Detection” section

At the end of the document, add a section called something like:

```text
What QA Should Flag as Critical Bugs
```

This section will list bugs testers should immediately raise, such as:

- Any teacher appears for a batch they are not assigned to.
- Any teacher appears because subject matches but curriculum does not match.
- A batch accepts two classes in the same slot.
- A teacher accepts two classes in the same slot.
- Teacher remaining-period count does not change after assignment/removal.
- Copy week creates duplicates without warning.
- Holiday/exam block still allows assignment.
- Upload allows embedding teacher/batch/subject mismatches.
- Substitution suggests a busy teacher.
- Published timetable differs from workspace without explanation.

### Phase 10 — Register and link the document

If required by the docs system, update the docs navigation so the new page is visible in the Docs UI under:

```text
Testing Scenarios → Inter-login Tests → Timetable Institute QA
```

I will also cross-link from or to the existing timetable docs:

- `docs/02-institute/timetable-setup.md`
- `docs/02-institute/timetable-workspace.md`
- `docs/02-institute/timetable-substitution.md`
- `docs/05-cross-login-flows/timetable-flow.md`
- existing `docs/06-testing-scenarios/inter-login-tests/timetable-tests.md`

---

## Expected final document structure

The new document will roughly look like this:

```text
# Institute Timetable QA — Setup, Workspace, Review & Substitution Testing

Before You Begin
  Domain Glossary
  Where to Find Things in the UI
  Prerequisites for Testing

How Timetable Links Everything Together
  Relationship model
  Golden rules
  Validation model
  What changes mid-year should affect

Test Scenarios
  A. Period Structure
  B. Breaks
  C. Period Types
  D. Holidays
  E. Teacher Load
  F. Exam Schedule
  G. Advanced Setup: Constraints & Facilities
  H. Workspace: Teacher Mode
  I. Workspace: Batch Mode
  J. Workspace: Conflict Detection
  K. Workspace: Edit, Move, Undo/Redo
  L. Workspace: Copy Week
  M. Workspace: Save/Publish
  N. Upload: Prerequisites
  O. Upload: AI Parse & Manual Review
  P. Upload: Validation
  Q. Upload: Embed Conflicts
  R. View Timetable: Weekly
  S. View Timetable: Monthly
  T. View Timetable: Past/Current/Future Weeks
  U. View Timetable: Export/Print
  V. Substitution: Absence
  W. Substitution: Coverage Needed
  X. Substitution: Substitute Selection
  Y. Substitution: Cross-impact
  Z. Edge Cases & Regression Risks

Critical Bugs QA Must Flag
Related Documentation
```

---

## Approval needed

Once you approve, I will implement this documentation page in the codebase and wire it into the docs navigation if needed.