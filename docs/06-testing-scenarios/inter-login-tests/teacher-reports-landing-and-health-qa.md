# Teacher Reports — Landing Page & Today's Focus QA

This doc covers the two surfaces every teacher hits *before* they reach a tab: the **Reports landing batch grid** (`/teacher/reports`) and the **Today's Focus / Batch Health card** (`BatchHealthCard`) that sits above the tabs on every batch report. It also covers the **cross-page navigation chain** — breadcrumbs, back behavior, deep-links, and tab-state preservation — which the per-tab docs do not test as a whole journey.

If every other QA doc passes but these scenarios fail, the teacher's first impression of Reports is broken even though every drill-down works perfectly. Treat this doc as the front door.

## Threshold Reference (read before filing any color bug)

There are currently **three** color-threshold scales in the Teacher Reports module. Knowing which is canonical prevents misfiled bugs.

| Scale | Used by | Source of truth |
|---|---|---|
| **75 / 50 / 35** | Chapter detail, Topic Heatmap, Student Buckets, Today's Focus topic & student rows | `src/lib/reportColors.ts` — **canonical** |
| 65 / 40 / 35 | `Reports.tsx` landing tile (`classAverage` color), `StudentReport.tsx` Chapter Mastery tooltip copy | UI-side hard-codes — **bugs to file against the UI** |
| Pass/fail bands | Exam pass% badges, "at risk" PI < 35 | Matches canonical |

**Rule for testers:** if a tile or row uses a threshold other than 75/50/35, file the discrepancy as a P2 UI bug pointing at the file in column 2, *not* as a data bug. Do not "fix" the test plan to match the UI.

## Before You Begin — Seed Your Data First

The landing page only animates to life when there's variety across batches. Without it you can't tell stable from broken.

- **At least three batches** assigned to the current teacher, with deliberately different shapes: one healthy (`classAverage` ≥ 75, low `atRiskCount`), one mid (50–74), one struggling (< 50, atRiskCount > 3). If all three look the same, every trend chip will read "Stable" and you can't validate the color tiers.
- **Trend variation** — for each of those batches make sure `classAverage − previousAverage` produces a clear positive, negative, and zero. Otherwise the landing page will only ever render one of the three trend chips and you'll miss bugs in the others.
- **One batch with zero exams conducted** so the empty-data path on Today's Focus actually triggers (or confirm the card hides itself).
- **One batch where the weakest topic and the most-at-risk student belong to different chapters.** This is what surfaces wrong cross-link bugs in Today's Focus quick-actions.
- **Teacher with at least two assigned subjects across batches** if your seed allows it — needed only for Section C deep-link tests.

## Highest-Risk Bugs to Hunt

1. **Trend chip lies** because `previousAverage` is missing or zero is being treated as "no change". An "improving" arrow on a brand-new batch is a P0 fabricated-data bug — it directly mis-informs the teacher's first action of the day.
2. **Today's Focus quick-link lands on the wrong chapter or student.** The card is the highest-traffic launcher in the module; one wrong navigation here will train teachers to ignore the card entirely.
3. **Stale Today's Focus after a fresh exam.** If the teacher just imported scores in another tab and returns to this one, the suggested focus, weakest topics, and at-risk roll-up must reflect that exam. A 30-second-old recommendation is fine; an hour-old one is a P1.
4. **Back-button blows away the active tab.** Teacher navigates landing → batch → Students tab → student → back. Returning to Students tab (not Chapters default) is the contract. Reset-to-default-tab is a P1 navigation bug because it forces a re-click and loses scroll position.
5. **Threshold drift across the chain.** A batch tile shows green at 65% on the landing, then orange at 65% on the chapter detail. Without the table above, testers will mis-file this. Use the reference and only file against the non-canonical side.

## Test Scenarios

### A. Reports Landing Page — Batch Grid

**A1 — Every batch tile renders all five required pieces of information**

The grid is the teacher's morning glance. Each tile must carry: batch name + class label, student count, trend chip with delta, `classAverage` percentage badge with color, exam count, and `atRiskCount` with its own color tier. Missing any of these forces the teacher to drill in just to triage, which defeats the purpose of the landing.

What to try: open `/teacher/reports`. Read every tile out loud. Note any tile missing a number, showing `NaN`, showing `undefined`, or rendering "0%" where a real value should appear. Resize the viewport to 320px and confirm nothing wraps off-screen — `className` and `batchName` are the most likely truncation casualties.

Expected: all five fields are present and numeric on every tile. Truncation uses ellipsis, never overflow. A missing number is a P1 data-binding bug; a numeric `NaN` or `undefined` rendered as text is a P0 because it ships visible debug state to a teacher.

**A2 — Trend chip math matches `classAverage − previousAverage` and points the right way**

The trend chip is computed inline in `Reports.tsx` from `Math.abs(classAverage - previousAverage)` plus the `batch.trend` field. Two failure modes: the math is right but the icon is wrong (down arrow on improvement), or the icon is right but the percentage is wrong (chip shows `+5%` when it should be `+12%`). Both look plausible at a glance and require explicit inspection.

What to try: pick a batch where you know the previous average (from your seed). Compute the expected delta yourself. Compare the chip text and arrow direction. Then refresh the page five times — the chip must not flip between renders. Then open the same batch on a second viewport size — the value must be identical.

Expected: arrow direction matches sign of delta, percentage matches absolute value of delta, "Stable" appears when delta is zero. Flipping between renders is a P1 stability bug. A wrong arrow direction with correct math is a P1 visual bug. Wrong math with correct arrow is a P0 trust bug.

**A3 — `classAverage` color badge follows the (non-canonical) 65/40 scale on the landing**

The landing tile uses 65/40 thresholds for the score badge color, which differs from the canonical 75/50/35 used on chapter detail. This *is* a bug per the threshold reference above, but it's the bug that the UI ships today, so the test must verify the *current* behavior and flag the inconsistency.

What to try: find batches sitting at exactly 65%, 64%, 50%, 40%, and 39% averages. Confirm the landing tile colors them green/amber/amber/amber/red respectively. Then open each batch and check the chapter-level color for the same percentage on a chapter detail page — they should differ for the 65% and 50% cases.

Expected: the landing renders 65/40 as documented in the code. Capture screenshots of the inconsistency between the landing tile and the chapter detail and file as a single P2 "threshold scale not unified — landing uses 65/40, canonical is 75/50/35 in `reportColors.ts`". Do not file as P0 unless it actively misleads (e.g., a batch the teacher should escalate appears green).

**A4 — `atRiskCount` color tier matches the >3 / >0 / 0 split**

Distinct from the score badge. The "at risk" number on each tile uses `> 3` red, `> 0` amber, `0` green. This is the teacher's escalation cue.

What to try: find tiles with 0, 1, 3, 4, and 7 at-risk students. Confirm the colors are green / amber / amber / red / red respectively. Boundary values matter — a tile with exactly 3 should be amber, not red.

Expected: boundaries are inclusive on the lower side per the code. Any tile where 3 is rendered red or 4 is rendered amber is a P2 boundary bug. A tile where 0 at-risk is rendered red is a P1 because it triggers false escalation.

**A5 — Empty state appears when the teacher has zero batches**

`Reports.tsx` renders an empty card with the dashed-border treatment when `batchReports.length === 0`. Most teachers will never see this, but a brand-new teacher account does, and a "no batches found" page that's actually a broken render kills onboarding.

What to try: log in (or simulate) as a teacher with no batch assignments. Open `/teacher/reports`. Confirm the empty state shows the icon, the headline, and the helper copy ("Reports will appear once exams are conducted for your batches"). No console errors, no perpetual spinner.

Expected: clean empty state with all three elements. A blank page or a spinner is a P1 stuck-state bug. A console error is always P1 even if the visible UI looks fine.

**A6 — Single-batch teacher gets a usable layout, not a giant lonely tile**

Edge case: one batch in the grid. The grid uses `sm:grid-cols-2 lg:grid-cols-3` so on desktop a single tile sits in a 1/3 column with empty space to its right. This is acceptable; a stretched-to-full-width tile that breaks the visual grid is not.

What to try: simulate a teacher with exactly one batch. View at mobile, tablet, and desktop. The tile should respect the grid column width at every breakpoint.

Expected: tile width matches what it would be with three batches present. Stretching across the full viewport is a P2 layout bug.

**A7 — Tap on tile navigates to `/teacher/reports/{batchId}` with kebab-case ID intact**

Navigation contract. A wrong route or a broken slug is the difference between the landing being usable and being a dead end.

What to try: tap each visible tile. Confirm the URL becomes `/teacher/reports/{batchId}` and the destination page shows the matching batch name in the header and breadcrumbs.

Expected: every tile lands on the right batch. A 404 or a navigation to the wrong batch is P0. Any URL with non-kebab characters (`Batch_10A` instead of `batch-10a`) is a P1 routing-convention bug per the project standard.

### B. Today's Focus / Batch Health Card

**B1 — The header gradient bar, "Today's Focus" label, and trend pill are always visible even when the body is collapsed**

The card is collapsed by default on mobile (`window.innerWidth < 768`) and expanded on desktop. The header — gradient strip, sparkles icon, "Today's Focus" label, "Improving / Declining / Stable" pill, weak-topic count, at-risk count, last-exam-avg pill — must remain visible in both states. If the header collapses too, the teacher loses the at-a-glance signal entirely.

What to try: open a batch report on mobile (≤ 767px). Confirm the card is collapsed but the header pills are still readable. Tap the header to expand, confirm the body slides down. Tap again to collapse. Resize to desktop and reload — confirm the body is expanded by default. Resize back to mobile *without* reloading — the expansion state should not silently change underneath the user.

Expected: header always visible with all stat pills. Smooth expand/collapse animation, no jank. Resizing across the breakpoint does not retroactively change state without a deliberate user action. Header pills disappearing on collapse is a P1 information-hiding bug.

**B2 — The trend pill ("Improving / Declining / Stable") matches the underlying `health.overallTrend`**

What to try: pick batches where you've seeded clear improving / declining / flat trajectories. Open each and verify the pill matches your expectation. Cross-check by going into the Exams tab and reading the last two exams' averages — a card showing "Improving" while the last two exam averages dropped is a contradiction worth filing.

Expected: pill matches the data. A contradiction between the pill and the underlying exams is P1 trust bug — the card is supposed to be a summary, not a separate calculation.

**B3 — Suggested Focus copy is specific, not generic**

When expanded, the body shows a "Suggested Focus" line above the priority topics. Generic copy ("Continue monitoring", "Review weak areas") is functionally useless. Specific copy names a chapter, a student bucket, or an exam ("Re-teach Rotational Motion to the bottom 8 students before Friday's exam").

What to try: open three batches. Read the Suggested Focus on each. Capture any case where two batches show the same suggestion despite having different weak topics, at-risk counts, or recent exam averages — that's a sign the suggestion is templated rather than data-driven.

Expected: each batch shows a distinct, data-grounded suggestion. Identical suggestions across batches with different shapes is a P2 data-utility bug. Outright wrong references (cites a chapter not in the batch) is a P1 hallucination.

**B4 — Priority Topics list each link to the right chapter detail**

Each row in Priority Topics is a button that calls `onNavigateToChapter(topic.chapterId)`. The destination must be the chapter named in the row, not a sibling chapter from the same batch.

What to try: tap each priority topic in turn. Confirm the chapter detail page that loads matches the topic name from the row. Then back-button to the batch and tap the next one. Repeat until you've exercised all rows.

Expected: every tap lands on the correct chapter. A wrong destination is P0 because this is the highest-traffic launcher in the module. A back-button that doesn't return to the batch with the card still expanded is a P2 state-loss bug.

**B5 — Students to Check In rows link to the right student report**

Same contract as B4 but for `onNavigateToStudent(student.studentId)`. Even more critical because student names are easier to confuse at a glance than chapter names.

What to try: tap each student row. Confirm the student name in the header of the destination matches the row you tapped. Pay attention if two students share a first name or have similar roll numbers — that's where wrong-ID bugs usually surface.

Expected: every tap lands on the correct student. Wrong student is P0 — it's a privacy adjacent bug because the teacher might act on the wrong child's data. Capture the row text, the URL, and the destination header for any mismatch.

**B6 — Topic and student rows use canonical 75/50/35 thresholds**

The inline color logic on each row reads `successRate < 35 ? red : successRate < 50 ? amber : teal` for topics and the same for student `avgPercentage`. This is the canonical scale, distinct from the landing tile's 65/40. So Today's Focus and the chapter detail must agree.

What to try: find a topic row showing 49% and a chapter detail showing the same topic at 49%. Both should be amber. Then 50% — both should be teal/green. Then 34% — both red.

Expected: rows on Today's Focus and chapter detail agree on color for the same percentage. A disagreement here is a P1 inconsistency bug because the teacher will see contradictory severity within seconds of each other.

**B7 — Empty Today's Focus state for a batch with no recent exams**

If `health.weakTopicCount === 0`, `health.atRiskCount === 0`, and there's no recent exam, the card should either hide the alarm pills, render an "all clear" body, or hide the body entirely (the chapter doc claims it hides — verify that's actually what happens).

What to try: open the batch you seeded with zero exams. Note what the card does. Then open a batch where exams exist but everything is healthy (≥ 75% across the board). Both should be calm — no red pills, no alarming language.

Expected: empty/healthy state is reassuring, not alarming. A red pill on a batch with no data is a P0 false-alarm bug. A spinner that never resolves is P1.

**B8 — All-red overload state is still legible**

Opposite extreme: a batch where every priority topic is red and every student to check is red. The card must remain readable, not become a wall of red panic.

What to try: find or seed your worst batch. Confirm spacing between rows, color contrast on red text against the muted background, and the trend pill in the header still being readable.

Expected: legibility holds. Color-on-color contrast failures (red text on red badge background) are P2 accessibility bugs. The sheer volume of red is a product concern, not a QA bug — file it separately if it feels overwhelming.

### C. Cross-Page Navigation Chain

**C1 — Breadcrumbs at every depth name the right parent and link back correctly**

The chain has up to four levels: Teacher › Reports › {Batch Name} › {Chapter or Exam or Student name}, and one level deeper for practice sessions. Each breadcrumb segment except the last must be a working link.

What to try: navigate landing → batch → chapter → practice session. At each page read every breadcrumb segment and click each one. Each click must land on the page the segment names. Then do the same for landing → batch → exam detail and landing → batch → student detail.

Expected: every non-terminal segment is a link, every link works, the terminal segment is plain text. A broken link in the middle of the chain is a P1 navigation bug. A terminal segment that's actually a link to itself is P2 affordance noise.

**C2 — Back-button preserves the active tab on the batch report page**

Teacher: landing → batch (defaults to Chapters tab) → switch to Students tab → tap a student → back-button. The expectation is that the batch report opens with the Students tab still active, not reset to Chapters.

What to try: do exactly that flow. Then do it again with the Exams tab. Then do it via swipe-to-dismiss on mobile if the gesture is enabled. Then do it after a hard reload of the student page (which simulates a deep-link entry).

Expected: tab state is preserved on back navigation from a child route opened via in-app navigation. Hard-reload-then-back is allowed to lose state since there's no history to restore from. A reset to default tab on the in-app flow is a P1 because teachers triage in batches and re-clicking the tab every time is friction.

**C3 — Scroll position is restored on back navigation**

Related to C2 but separate. If the teacher scrolled halfway down the Students tab to find a particular student, returning from that student's detail page should drop them back at the same scroll offset — not at the top.

What to try: in a batch with 30+ students, scroll to roughly the middle of the Students tab. Tap a student. Hit back. Confirm the scroll position is approximately where you left it (within one viewport).

Expected: scroll restoration works on back. Resetting to top is a P2 friction bug. Scroll position jumping wildly (top → past the bottom → back to top) is a P1 layout-shift bug usually caused by lazy-loaded content above the fold.

**C4 — Deep-link entry to a child route renders correctly without first visiting the parent**

A teacher pastes `/teacher/reports/batch-10a/students/student-123` from a Slack message. The page must render fully — student header, AI summary, chapter mastery, the lot — even though the teacher never visited the batch report first.

What to try: copy the URL of a chapter detail, an exam detail, a student detail, and a practice session detail. Open each in a fresh tab. Confirm the full page renders, breadcrumbs are correct, and clicking the parent breadcrumb works.

Expected: deep-link entry is fully supported. A page that needs the parent to be visited first to populate state is a P0 architectural bug — it breaks every external link. A page that renders but with broken breadcrumbs is P1.

**C5 — Today's Focus card state survives navigating to a child and back**

Tied to B1. If the teacher expanded the card on mobile, navigated to a chapter via the priority topic link, and came back, the card should remain expanded. Re-collapsing forces them to expand it again to keep working.

What to try: on mobile, expand the card, tap a priority topic, hit back. Card should still be expanded. Repeat with a Students-to-Check-In tap.

Expected: expansion state preserved on in-app back. Resetting to collapsed on back is P2.

**C6 — Switching subjects (multi-subject teacher) does not contaminate the previous subject's view**

Only relevant if the teacher has multiple subjects assigned. The Today's Focus card pulls data scoped to `currentTeacher.subjects[0]`. If the teacher switches active subject, the card must refresh — not show the previous subject's at-risk students.

What to try: as a teacher with both Physics and Chemistry, view a batch's Today's Focus while in Physics. Note the priority topics and at-risk students. Switch to Chemistry. Confirm those topics and students change to Chemistry's set, not a mix.

Expected: clean subject scoping. Contamination here is a P0 data-isolation bug per the dual-match scope rule.

## Wrap-up

The landing and Today's Focus card are the front door of Teacher Reports. If A1–A7 and B1–B8 all pass, the teacher's morning glance is trustworthy. If C1–C6 all pass, the navigation chain holds across every drill-down covered in the per-tab docs. File every bug with: page URL, exact tile or row, expected value (with calculation if applicable), observed value, screenshot, and console output.
