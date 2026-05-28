## Goal

Rewrite `docs/06-testing-scenarios/inter-login-tests/packages-qa.md` so a brand-new intern — someone who has never opened the Packages module before — can read it top-to-bottom and know **exactly** what to click, what to look at, what counts as a bug, and how bad that bug is. The current version is a terse 4-column table that assumes the reader already knows the product. We will replace it with the same narrative style used in `student-progress-overview-qa.md` (Why this matters → Scenarios in plain English → What to try → Expected → Severity).

No code changes. Documentation-only edit. Same file path, same scenario IDs (`PKG-LIST-001` etc.) preserved so anyone already tracking bugs against them stays anchored.

## What changes for the reader

For each existing scenario we expand the single table row into a short narrative block that answers six questions a tester always needs:

1. **Why this matters** — one sentence on the user-visible impact of a bug here, so the intern understands the stakes (e.g. "If the class dropdown forgets the active grade, every teacher loading this package sees the wrong subjects on day one").
2. **Setup** — the exact precondition (which seeded package to open, which viewport, which toggle state). No "assume you have…" hand-waving.
3. **Steps** — numbered, click-by-click, naming the actual button labels and routes the user will see (e.g. "Click the ⚙ gear icon in the top-right of `/superadmin/packages/cbse-comprehensive-foundation`").
4. **What to look for** — the observable signals (header text, toast wording, URL change, console quiet, count on the card).
5. **Pass vs Fail examples** — one concrete "looks like this = pass" and one "looks like this = bug" line.
6. **Severity** — P0 / P1 / P2 with a one-line reason, matching the convention already used in the student-progress docs.

## New structure of the document

```text
1. Before You Begin
   1a. Who this guide is for (interns, first-time testers)
   1b. How to read a scenario (the 6-part pattern above, explained once)
   1c. Severity legend (P0 = blocks release, P1 = ship-blocker for the
       module, P2 = polish; with one example each)
   1d. Domain Glossary (kept, lightly reworded for plain English)
   1e. Where to find things (kept)
   1f. Prerequisites (kept, but each item explains *why* you need it)

2. How a Package is Structured
   - Keep ASCII diagram
   - Add a "Read this diagram like a tester" paragraph that walks the
     intern through each level and points out where bugs usually hide

3. Twelve scenario groups (PKG-LIST, PKG-CREATE, PKG-HDR, PKG-SUBJECTS,
   PKG-CHAPTERS, PKG-LESSONS, PKG-BLOCKS, PKG-ATTACH, PKG-LIFECYCLE,
   PKG-RESPONSIVE, PKG-EDGE, PKG-DATA)
   - Group intro: 2-3 sentences explaining what surface this covers and
     the single most common bug class here.
   - Each scenario rewritten in the 6-part narrative pattern above.
   - Scenario IDs unchanged so existing bug tickets keep linking.

4. Known Limitations & Out of Scope (kept)
```

## Example: before vs after

**Before (current row):**

```
| PKG-HDR-004 | Switching class via dropdown | Pick Class 11 from the
dropdown | Subject tabs reset to Physics; chapter rail reloads; URL
grade param (if any) updates |
```

**After (new format):**

```
### PKG-HDR-004 — Switching class via the dropdown
**Why this matters:** The class dropdown was added specifically to stop
the toolbar from cramping when a package covers 5+ grades. If the
switch leaves stale subjects or chapters on screen, an author will
edit the wrong grade without realising it.

**Setup:** Open `/superadmin/packages/cbse-comprehensive-foundation`.
The header should show "Class 6" as the active class on first load.

**Steps:**
1. Click the "Class 6" pill in the header — a dropdown opens listing
   Class 6, 7, 11, 12 (the four grades in this package's shape).
2. Click "Class 11".

**What to look for:**
- The pill now reads "Class 11" with a check mark next to it in the
  open dropdown.
- The subject chip row directly below resets to the first subject of
  Class 11's shape — in the seeded pack this is "Physics".
- The chapter rail on the left reloads with Class 11 Physics chapters
  (e.g. "Electrostatics", "Current Electricity"), not the Class 6
  Maths chapters that were there before.
- No red errors in the browser console (open DevTools → Console).

**Pass example:** Header = "Class 11", active chip = "Physics",
chapter rail shows Physics chapters, console clean.

**Bug example:** Header switches to "Class 11" but the chip row still
shows "Maths" (Class 11 doesn't even include Maths) — file as **P0**:
authors will silently edit the wrong cell.

**Severity if it fails:** P0 — stale cell after grade switch is a
data-integrity bug, every edit downstream is suspect.
```

We do this expansion for every existing PKG-* scenario. Group intros are added so the intern always knows which surface they are about to test.

## Length & file size

Expanding ~75 rows × ~6 short paragraphs each lands the file around 1,500–1,800 lines. That is in line with the longest existing QA docs (`student-progress-*-qa.md`). No split needed — keeping it one file matches the entry already in `docs/06-testing-scenarios/README.md` and how the user has been referring to it.

## Out of scope

- No changes to source code, routes, components, or seed data.
- No changes to scenario IDs.
- No new screenshots (we describe what to look for in words, matching the rest of the QA library).
- No changes to `README.md` (the link is already correct).

## Deliverable

A single replaced file: `docs/06-testing-scenarios/inter-login-tests/packages-qa.md`, rewritten in the intern-friendly narrative style above, every scenario covering: Why this matters, Setup, Steps, What to look for, Pass/Bug examples, Severity.
