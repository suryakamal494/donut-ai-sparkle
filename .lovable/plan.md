Yes, I understand what you are asking.

The current `Timetable Institute QA` document is too large for practical execution. You want it split into four separate markdown documentation pages so different QA people can own different parts independently. Each new document must have its own URL/path in the docs frontend and must render like the existing documentation pages.

A very important requirement: scenario letters must restart from `A` in each new document. So the first split document will have `A, B, C...`, the second document will again start from `A, B, C...`, and so on. We should not continue the old global sequence from the original A-Z document.

## Proposed split

### 1. Timetable QA — Setup
New file:
```text
docs/06-testing-scenarios/inter-login-tests/timetable-setup-qa.md
```
Frontend path:
```text
/docs/06-testing-scenarios/inter-login-tests/timetable-setup-qa
```

Content scope:
- Intro, glossary, prerequisites relevant to setup
- Working days, periods, time mapping
- Breaks
- Period types
- Holidays
- Teacher loads
- Exam schedule
- Advanced constraints and facilities
- Setup-specific critical bugs
- Setup-specific execution order

Scenario renumbering:
```text
Old A. Setup — Period Structure      -> New A. Period Structure
Old B. Setup — Break Scenarios       -> New B. Breaks
Old C. Setup — Period Type Scenarios -> New C. Period Types
Old D. Setup — Holiday Scenarios     -> New D. Holidays
Old E. Setup — Teacher Load          -> New E. Teacher Load
Old F. Setup — Exam Schedule         -> New F. Exam Schedule
Old G. Setup — Constraints/Facilities-> New G. Constraints & Facilities
```
Scenario IDs can be updated from `TT-I-A1` style to a clearer split-specific format such as:
```text
TT-SETUP-A1, TT-SETUP-B1, ...
```

### 2. Timetable QA — Workspace
New file:
```text
docs/06-testing-scenarios/inter-login-tests/timetable-workspace-qa.md
```
Frontend path:
```text
/docs/06-testing-scenarios/inter-login-tests/timetable-workspace-qa
```

Content scope:
- Workspace-focused intro
- Golden Rule validation reminder
- Teacher Mode
- Batch Mode
- Conflict detection
- Edit, move, undo/redo
- Copy week
- Save, draft, publish
- View/review timetable weekly/monthly/past-current-future/export-print, because these are directly connected to workspace output and tester verification
- Workspace-specific critical bugs

Scenario renumbering:
```text
Old H. Workspace — Teacher Mode       -> New A. Teacher Mode
Old I. Workspace — Batch Mode         -> New B. Batch Mode
Old J. Workspace — Conflict Detection -> New C. Conflict Detection
Old K. Workspace — Edit/Move/Undo     -> New D. Edit, Move, Undo/Redo
Old L. Workspace — Copy Week          -> New E. Copy Week
Old M. Workspace — Save/Draft/Publish -> New F. Save, Draft & Publish
Old R. View Weekly                    -> New G. View Timetable — Weekly
Old S. View Monthly                   -> New H. View Timetable — Monthly
Old T. Past/Current/Future Weeks      -> New I. View Timetable — Past/Current/Future
Old U. Export/Print                   -> New J. Export & Print
```
Scenario IDs:
```text
TT-WORKSPACE-A1, TT-WORKSPACE-B1, ...
```

### 3. Timetable QA — Upload View
New file:
```text
docs/06-testing-scenarios/inter-login-tests/timetable-upload-qa.md
```
Frontend path:
```text
/docs/06-testing-scenarios/inter-login-tests/timetable-upload-qa
```

Content scope:
- Upload-specific intro
- File picker and drag/drop upload
- AI parsing and manual review
- Validation against teacher/batch/subject/curriculum scope
- Embed-to-workspace conflict handling
- Upload-specific critical bugs

Scenario renumbering:
```text
Old N. Upload — Prerequisite          -> New A. Upload Prerequisites
Old O. Upload — AI Parse & Review     -> New B. AI Parse & Manual Review
Old P. Upload — Validation            -> New C. Validation
Old Q. Upload — Embed Conflict        -> New D. Embed Conflict Handling
```
Scenario IDs:
```text
TT-UPLOAD-A1, TT-UPLOAD-B1, ...
```

### 4. Timetable QA — Substitution & Edge Case Recreation
New file:
```text
docs/06-testing-scenarios/inter-login-tests/timetable-substitution-edge-qa.md
```
Frontend path:
```text
/docs/06-testing-scenarios/inter-login-tests/timetable-substitution-edge-qa
```

Content scope:
- Substitution-focused intro
- Absence marking
- Coverage needed
- Substitute selection
- Cross-impact into review/teacher/student views
- Edge case recreation and regression risks
- Consolidated critical bugs for substitution and cross-module failures

Scenario renumbering:
```text
Old V. Substitution — Absence         -> New A. Absence
Old W. Coverage Needed                -> New B. Coverage Needed
Old X. Substitute Selection           -> New C. Substitute Selection
Old Y. Cross-Impact                   -> New D. Cross-Impact
Old Z. Edge Cases & Regression Risks  -> New E. Edge Cases & Regression Risks
```
Scenario IDs:
```text
TT-SUB-A1, TT-SUB-B1, ...
```

## Documentation structure changes

I will either replace the single long navigation entry or convert it into grouped child entries.

Recommended navigation under `Testing Scenarios > Inter-Login Tests`:
```text
Timetable QA
  - Setup QA
  - Workspace QA
  - Upload View QA
  - Substitution & Edge Cases QA
```

This keeps the docs menu clean and makes assignment to different testers easy.

The current long page can be handled in one of two ways:

1. Recommended: keep the old file as a short index/landing page that links to the four new documents, so existing links do not break.
2. Alternative: remove the old navigation entry entirely and only show the four new docs.

I recommend option 1 because the user is currently on the old route, and keeping it as a landing page prevents broken bookmarks.

## Rendering and frontend verification plan

After implementation, I will verify:

1. Each new `.md` file exists under:
```text
docs/06-testing-scenarios/inter-login-tests/
```

2. Each doc has a clear H1 title and markdown sections that render consistently with the existing docs viewer.

3. Each doc starts scenario sections from `A`.

4. Scenario IDs are internally consistent and do not accidentally continue the old A-Z sequence.

5. `src/data/docsNavigation.ts` includes all four new pages.

6. The old long route either becomes a clean index page or is no longer the primary navigation destination.

7. Related Documentation links at the bottom of each file point to the other three timetable QA documents and existing timetable docs.

## Implementation steps after approval

1. Create four new markdown files:
```text
timetable-setup-qa.md
timetable-workspace-qa.md
timetable-upload-qa.md
timetable-substitution-edge-qa.md
```

2. Move the relevant sections from the current long document into the correct new files.

3. Rewrite each file’s introduction so it is self-contained for the assigned tester.

4. Renumber all section letters from `A` per document.

5. Rename scenario IDs to split-specific prefixes:
```text
TT-SETUP-...
TT-WORKSPACE-...
TT-UPLOAD-...
TT-SUB-...
```

6. Add module-specific critical bug checklists so testers do not have to scan irrelevant warnings.

7. Convert the original `timetable-institute-qa.md` into a short master index page linking to the four new QA documents.

8. Update docs navigation so all four pages are reachable from the frontend UI.

9. Do a final content audit to ensure no scenario groups were lost during the split.

## Expected outcome

Instead of one large A-Z document, you will have four shorter, assignment-ready QA documents:

```text
Timetable Setup QA:        A-G
Timetable Workspace QA:    A-J
Timetable Upload QA:       A-D
Substitution & Edge QA:    A-E
```

Each document will be independently readable, independently assignable, and independently navigable in the frontend documentation UI.