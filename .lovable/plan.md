# Rewrite Plan: Timetable Substitution & Edge Cases QA

## Goal

Transform `docs/06-testing-scenarios/inter-login-tests/timetable-substitution-edge-qa.md` from a flat list of one-line directives into a descriptive QA reference that helps a first-time tester understand *why* each scenario matters, *what variations to explore*, and *what a correct outcome looks like* — with deep coverage on edge cases, cross-impact, and regression risks.

## Format Conventions (consistent with Workspace & Upload QA rewrites)

Each scenario uses three blocks under a self-explanatory title. Per your instruction, drop the `TT-SUB-` prefix — use plain numbering like `A1`, `A2`, `B1`.

```text
**A1 — Self-explanatory descriptive title**

What this is
2–4 sentence plain-language framing. Explains the real-world situation
being simulated and why it's risky if it breaks.

What to try
Concrete setup + variations to explore. Lists what to vary (teacher with
many vs few classes, holidays, partial periods, etc.) so testers don't
just run one happy-path attempt.

Expected
Clear pass criteria. What the platform should do, what it should refuse,
and what downstream surfaces should reflect.
```

Edge case and regression sections (E and beyond) get longer **What this is** blocks — 4–6 sentences — explicitly naming the regression risk, why it tends to break, and what classes of bug to hunt for, so testers approach them as exploratory hunts rather than checklist ticks.

## Section Structure (8 sections, ~55 scenarios)

**A. Marking Absences (7 scenarios)**
Full-day, partial-day, multi-teacher same day, holiday absence, absence for teacher with no classes that day, cancellation, validation gaps. Anchor on the real `useSubstitution.handleMarkAbsent` flow.

**B. Coverage Needed Calculation (7 scenarios)**
Affected-slot accuracy vs the teacher's actual weekday entries, urgent/covered counters, date navigation refresh, calendar absence indicators, holiday empty state, partial-period filtering, multi-absence aggregation.

**C. Substitute Selection Engine (9 scenarios)**
The core anti-bug section. Exclusion of the absent teacher, exclusion of teachers already busy that period, exclusion of non-working-day teachers, subject/curriculum capability gap (flag as product-rule weakness if missing), assigning, changing, removing, substitute-becomes-busy-after-assignment race, and the "no available teachers at all" empty state.

**D. Cross-Impact & Downstream Propagation (7 scenarios)**
Substitution showing in Review Timetable, substitute teacher's schedule, original teacher's schedule, student schedule, batch-level views, cancellation propagation, and notification triggers. Each scenario names the downstream surface so testers know where to look.

**E. Master-Data Regression Risks (8 scenarios — heavily detailed)**
The classes of bugs you flagged as critical: teacher-batch unassignment after entries exist, batch curriculum change, subject removed from batch, teacher subject removed, teacher deactivated, batch archived, facility deleted, and the same-teacher-across-multiple-curriculums ambiguity. Each scenario explains *why* this is a regression hotspot (data created under one set of assumptions, then assumptions change underneath it) and what the platform should do — flag, block, or migrate.

**F. Naming & Identity Edge Cases (5 scenarios)**
Same subject name across batches with different curriculums, long teacher/batch names overflowing UI, duplicate teacher names, teachers with special characters, batch rename after timetable creation.

**G. State, Concurrency & Replay Edge Cases (6 scenarios — new section)**
Mark absent then immediately cancel, assign substitute then cancel parent absence, navigate between dates rapidly, refresh page mid-assignment, mark same teacher absent twice on same date, attempt to mark absence in the past. These probe state-management bugs that one-shot directives miss.

**H. Access, Permissions & Responsive (6 scenarios)**
Role without timetable.edit cannot reach substitution UI (UI removed not disabled), tablet workspace, mobile guidance, calendar interaction on touch, dialog scrolling on small screens, keyboard-only navigation through substitute picker.

## Critical Bugs Section (rewritten)

Replace the current 9-item list with a tighter, prioritized list grouped by severity:

- **P0 — Wrong substitute suggestions** (absent teacher suggested, busy teacher suggested, non-working-day teacher suggested without warning)
- **P0 — Stale data after cancellation** (substitution survives parent absence cancellation, downstream teacher/student views don't refresh)
- **P0 — Master-data regression silence** (teacher unassigned from batch, subject removed, curriculum changed — and existing entries show no warning)
- **P1 — Holiday/non-working-day leakage** (coverage needed generated for holidays, non-working teachers selectable)
- **P1 — Identity ambiguity** (same subject across curriculums merged, long names overflowing)
- **P2 — Permission/UI leakage** (unauthorized roles see substitution controls)

## Suggested Execution Order

Keep the existing 5-step order but add a short rationale for each step explaining what bugs that pass is designed to surface — so testers understand the strategy, not just the sequence.

## Files Changed

- `docs/06-testing-scenarios/inter-login-tests/timetable-substitution-edge-qa.md` — full rewrite
- `.lovable/plan.md` — mark Substitution & Edge Cases QA as complete; note Setup QA as the only remaining doc

## Out of Scope

- `timetable-setup-qa.md` (next, per your sequencing)
- Any code changes to `useSubstitution.ts` or related components — this is documentation-only
