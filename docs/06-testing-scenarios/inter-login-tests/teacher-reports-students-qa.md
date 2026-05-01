# Teacher Reports — Students QA

> This document is for testers validating the **Students tab** of the Teacher Reports module and the **Student Report** screen that hangs off it: the per-student header, AI summary, chapter mastery grid, exam history timeline, difficulty analysis, weak topics list, and the AI Homework Generator dialog. Where the Chapters cycle was about a *cohort* and the Exams cycle was about an *event*, this cycle is about an *individual learner*. The bugs that surface here are usually subtle: the wrong name in a banner, a stale weak topic carried over from a previous student, a colour on a chapter tile that disagrees with the tooltip beside it, a Performance Index value rendered in a place where it shouldn't be. None of them crash the page; all of them cause a teacher to assign the wrong work to the wrong child. Read every banner, every prefilled instruction, and every chapter colour with the question: *if I generated homework based on what I'm seeing, would the right student get the right practice?*

---

## Before You Begin — Seed Your Data First

The students cycle is the one where weak seed data hides the most bugs. A roster of twelve identically-performing students makes every band look the same and makes every edge case impossible to trigger. Spend real time setting up variety before you start clicking. Treat seeding as the first phase of testing — if the data underneath is uniform, your test results are useless even when the page is broken.

- **Pick a teacher login that owns at least two batches**, with at least one batch containing **25–30 students**. Anything smaller and the four PI bands (Mastery, Stable, Reinforcement, Risk) cannot all be populated, and you will mistake "no card rendered" for "card broken". Use a real subject the teacher actually owns, never an unowned one — the page will look empty and you will not learn anything.
- **Make sure the roster spans all four PI bands.** You need at least one student in each band, plus at least one band with a *single* student (to test the smallest-bucket rendering) and at least one band with *zero* students (to test the empty-band rendering — does the band hide entirely, render an empty state, or look broken?).
- **At least one student should have very few exam attempts** (one or two), so the timeline, difficulty analysis, and AI summary are forced into their sparse-data states. A different student should have **10+ attempts** so you can validate scrolling, ordering, and how the timeline handles long histories. A third student should have **zero attempts** to surface the cold-start state.
- **At least one student should be absent / not have submitted in one of the exams**. The exam history timeline must show that gracefully — never as a 0% score that drags down their average and dumps them into the Risk band unfairly.
- **At least one student should be newly added to the batch** (joined after several exams already ran), so most rows on their timeline read "did not attempt" rather than "0%".
- **At least one chapter should have zero attempts for at least one student**, so the Chapter Mastery grid is forced to show its no-data state for that tile rather than colouring it red.
- **For at least one student, deliberately seed scores exactly on the colour-band boundaries (75%, 50%, 35%)**. The chapter mastery and PI band logic uses these thresholds (`src/lib/reportColors.ts`: ≥75 emerald, ≥50 teal, ≥35 amber, otherwise red), and boundary tests are the only way to catch off-by-one mistakes in the colour mapping.
- **Seed at least one student who has weak topics across multiple chapters** within your subject (not across multiple subjects — that's a different feature, see the note in the Highest-Risk section). This makes the Weak Topics list non-trivial and gives the AI Homework prefill enough material to differentiate from a default fallback.
- **Generate at least one Practice assignment from the chapter side first** so that when you cross-link from the Weak Topics list back into chapter context, there is something for the tester to land on.

The intent is not to build a tidy dataset. It is to build the *uneven, partial, real-classroom* dataset under which the page actually has to behave. If your seed feels too clean, your test will miss every interesting bug. If something feels off while seeding (a chapter not showing under the right curriculum, a student missing from a batch), pause and fix it first — you will waste hours chasing report bugs that are actually master-data bugs.

---

## Highest-Risk Bugs to Hunt

These are the failures most likely to cause a teacher to act on wrong information. Keep them at the front of your mind on every scenario, and stop testing to file an immediate report if you see any of them:

1. **Prefill drift between Generate Homework entry points (P0).** The header CTA on the Student Header card and the "Generate Homework" CTA inside the AI Student Summary must open the same dialog with the **same student name in the banner, the same subject, the same batch, and the same weak-topic list in the instructions**. If the two CTAs produce different prefilled content for the same student, a teacher will assign mismatched work. The Weak Topics list itself does **not** currently have a per-row Generate CTA — if you find one, treat that as a new entry point and verify its prefill matches the other two.
2. **Chapter Mastery thresholds disagreeing with the tooltip.** The tooltip on the Chapter Mastery card says *"Green = strong (≥65%), Amber = moderate (40-64%), Red = weak (<40%)"*, but the underlying colour utility (`src/lib/reportColors.ts`) uses **75 / 50 / 35** as the cutoffs. **One of these is wrong.** Your job is to confirm which side the rendered colour follows on real seeded data and file a bug against the side that disagrees with the product spec. Do not assume the tooltip is correct; do not assume the code is correct. Test boundary values (75, 65, 50, 40, 35) and report what you actually see.
3. **Stale state when navigating between students.** Going from Student A → Chapter detail → back → Student B must show Student B's data fully refreshed everywhere on the page — header name, AI summary text, chapter mastery grid, weak topics list, and especially the homework dialog banner. A leftover banner reading *"Student: <Student A's name> — Weak areas identified"* inside Student B's homework dialog is the worst version of this bug because the teacher cannot see the leak unless they re-read the banner carefully.
4. **Performance Index leaking into the teacher view.** Per the project's bucketing memory the raw PI number is an internal scoring artifact; what the teacher should see in the Reports surface is a band label plus an average percentage. The Reports `StudentsTab` and `StudentHeaderCard` follow this rule, but the Copilot's `StudentProfileCard` and `MultiSubjectRiskCard` (under `src/components/teacher/routine-pilot/reports-cards/`) currently render `PI {value}` chips. Check whether each PI surface you find is intentional or a leak — if PI shows up *inside the Student Report screen itself*, that is a P1 bug.
5. **Institute exam rows in the timeline opening the wrong subject view.** When a student appears on a multi-subject institute Grand Test, tapping the timeline row from a Physics teacher's view must open the exam scoped to Physics, not the full multi-subject report. Subject leakage from the Exams cycle reappears here through the timeline.
6. **Multi-Subject Risk feature is in the Copilot, not the Student Report.** If you go looking for a "Multi-Subject Risk" card on the Student Report page, you will not find one — it lives inside the Copilot panel and uses `weak_chapter_count >= 2` (weak in ≥2 chapters within the teacher's own subject), not "weak in 2+ subjects". This document does **not** test that card. If anyone asks why this cycle does not include it, tell them it belongs in a Copilot QA cycle, not the Student Report cycle.
7. **`returnTo` lost on three-level drill-downs.** Students tab → Student detail → Chapter detail → back should land back on the Student detail, not at the batch root or the Chapters tab.

---

## Test Scenarios

### A. Students Tab Roster & PI Bucketing

**A1 — Roster shows every enrolled student exactly once with consistent ordering**

What this is
The Students tab is the teacher's roster view. If a student is silently missing, or if the order shuffles between visits, a teacher will lose track of who they were going to talk to next, miscount the bands at a glance, and stop trusting the screen. Stable ordering is the difference between "report" and "shuffled list".

What to try
Open the Students tab on a well-populated batch (your 25–30 student one). Note the first five names, the last name, and the total count badge in the tab header. Refresh the page hard, switch to Chapters, switch to Exams, then back to Students, and recount. Do the same after changing nothing for a minute (to rule out incidental re-fetches). Then resize the viewport between desktop and 320px and re-check the order — the underlying list should not re-sort just because the layout changed.

Expected
Every enrolled student appears exactly once. The count badge equals the visible row count. Order is stable across refresh, tab switches, viewport changes, and time. If you see a student vanish or appear after a tab switch, capture the network tab — that's a stale-cache / refetch race. If you see two rows with the same student, that's a rendering-key bug. Both are P1.

---

**A2 — All four PI bands render with their distinct visual treatment and project-correct labels**

What this is
Bucketing into Mastery / Stable / Reinforcement / Risk is the primary signal a teacher uses to decide who to prioritise. If the bands are not visually distinct or the labels disagree with what the rest of the product calls them, the entire screen loses its purpose and the teacher has to do bucket arithmetic in their head.

What to try
On a batch where you've seeded students into all four bands, look at every badge colour and label across the visible rows. Cross-check against the project's documented colour scale (`src/lib/reportColors.ts`): emerald for ≥75, teal for ≥50, amber for ≥35, red below. Open at least three different students from each band and confirm the badge on the row matches whatever band shows up on their detail page header. Then scroll down the roster — the colours and labels must remain consistent for the same band across the entire list.

Expected
Each band has a distinct, readable badge. Labels match the project terminology exactly: "Mastery", "Stable", "Reinforce" (or "Reinforcement"), "At Risk" (or "Risk"). Colours match the four-tier scale and do not vary between rows of the same band. If you see "Critical" or "Needs Work" or any label not in this set, that's a stale-string bug. If colours flicker between rows of the same band, that's likely a re-render or memoisation bug — capture two screenshots.

---

**A3 — A band with a single student renders cleanly, including its singular text**

What this is
Edge case for the smallest possible non-empty bucket. List components written by someone assuming "many students" often break alignment, mis-pluralise headings ("1 students"), or hide a CTA when only one row sits in a section. Foundational Risk early in a term and Mastery on a struggling batch are the two most common ways to hit this naturally.

What to try
Find or seed a band that has exactly one student. Inspect that section closely: header text, count badge, the student row's alignment, the action buttons (if any), the spacing above and below. Then resize to 320px and re-check — single-row sections often look fine on desktop and broken on mobile because flex-grow rules expect siblings.

Expected
The single student renders normally with full data and correct band styling. Any header text reads "1 student" not "1 students". No empty whitespace where a list-of-many would be. CTAs remain reachable and tappable. If you see a "0 students" line under a band that clearly has one student, the count is being computed from a different filtered list than the rendered rows — that is a P1 logic split.

---

**A4 — An empty band is handled deliberately and consistently across all four bands**

What this is
Sometimes no student qualifies for a band (no one has reached Mastery yet on a struggling batch, or no one is at Risk on a strong one). The teacher needs to know "no one is here" rather than wonder if the band is broken or hidden by a filter. The behaviour also has to be consistent — if Mastery hides when empty but Risk shows an empty state, the teacher cannot trust the page.

What to try
Find or seed a batch where exactly one band is empty. Check whether the band header still appears, whether it shows an empty-state message, or whether it disappears entirely. Then find a second batch where a *different* band is empty and confirm the same treatment. If you can, find one where two bands are empty.

Expected
The behaviour is intentional and consistent across bands — if it hides, it hides for all empty bands; if it shows an empty state, the message is informative ("No students currently in Mastery"). Inconsistency between bands is itself a bug. If an empty band collapses other content awkwardly (pushing the next band's header onto the search bar, for example), capture a screenshot — that is a layout regression.

---

**A5 — Search filters the roster correctly without breaking band counts or persistence**

What this is
The search box at the top of the Students tab filters the visible roster by name and roll number. The visible count should reflect the filter, but each remaining student's band badge should still be the student's *true* band, not a "band among the visible rows". Search is also where stale-state bugs leak: filtering down to one student then clearing should restore the full list, not leave a ghost.

What to try
Type a partial name. Watch which rows remain. Type a roll number prefix. Type something that should match nothing ("zzz") and confirm the empty state. Clear and re-type a different name. Then filter, navigate to a student, hit back — does the filter survive or reset? Try mixed-case and spaces.

Expected
Filter is case-insensitive and matches both name and roll number. Each remaining student's band badge is unchanged from the unfiltered view. The "no matches" state is informative, not a blank space. Clearing the search restores the full list immediately. Whether the filter survives a navigate-and-return is a product decision — log the behaviour you see and confirm it matches the spec, but inconsistency between back-navigation and tab-switch is a bug either way.

---

**A6 — A student newly added mid-cycle appears in the roster with sensible band assignment**

What this is
Teachers add students to batches during a term. The new student should appear immediately in the roster and should not be punished for having no exam history yet — assigning them straight to "Risk" because their average percentage is undefined would mislead the teacher into intervening on a child who has simply not been measured.

What to try
Have the institute admin add a new student to your batch (or simulate one in seed data), then refresh the Students tab. Open the new student's profile. Then navigate back to the roster and check their badge.

Expected
The new student is listed. Their row shows zero exams attempted and no average percentage (or "—"). Band assignment is sensible — most likely a default neutral band such as "Stable" or an explicit "no data yet" label, never "At Risk" purely because they have no data. If the new student is rendered as a 0% Risk-band student, that is a P1 fairness bug; capture a screenshot and the seeding steps.

---

### B. Student Header Card

**B1 — Student header shows identity and batch context unambiguously**

What this is
The header is the first thing a teacher reads on the Student Report. If they cannot tell at a glance which student and which batch they are looking at, every action below — generating homework, opening a chapter, reading the AI summary — becomes risky because they might be acting on the wrong child.

What to try
Open three different students in the same batch in turn, and the same student in two different batches if your seed allows. Compare the headers carefully. Look for name, class, batch label, and any other identifying chip. Test on desktop, then resize to 320px to confirm nothing critical is hidden behind a truncation.

Expected
Name, class, and batch label are all visible and correctly populated for each student. The same student in two batches shows the correct batch label in each — never the wrong batch's name. No name truncation that hides part of a student's surname without an ellipsis. If you see Student A's name on Student B's header for even a second after navigation, that's a stale-render bug — capture both screenshots and the navigation steps.

---

**B2 — Performance Index does not appear on the Student Report surface**

What this is
Per the project's bucketing memory, the raw Performance Index is an internal scoring artifact used to assign students to bands. The teacher-facing view should expose the band label and an average percentage, not a number labelled "PI". This rule is followed inside the Reports module today (`StudentsTab`, `StudentHeaderCard`, `StudentReport`), but the *Copilot* surface (`src/components/teacher/routine-pilot/reports-cards/`) does render PI chips. Your job is to confirm the Reports surface stays clean.

What to try
Inspect every text element on the Student Report page — header card, AI summary, chapter mastery grid, exam history rows, weak topics list — looking for any literal "PI" string or any two-digit number labelled as a Performance Index. Open at least four students across different bands. Then open the Copilot panel from the same page and note that PI does appear there — confirm the leak is contained to the Copilot.

Expected
No "PI" string appears anywhere on the Student Report screen itself. The header shows an average percentage and a band badge, nothing else numeric. If you find a PI value rendered inside the Student Report (not the Copilot), that is a P1 leak — capture the exact element and which component file is rendering it. If the Copilot shows PI chips, log it as an observation but not a bug for this cycle.

---

**B3 — Generate Homework button on the header is reachable on every viewport**

What this is
The header CTA is one of the two confirmed entry points into the AI Homework Generator dialog. If it gets pushed below the fold on small screens, hidden behind a menu, or rendered behind the bottom nav, the entire homework flow is broken on the device that teachers most often use.

What to try
Open a student profile on desktop, tablet (768), and mobile (320). Find the Generate Homework button on each. On mobile, scroll the page and confirm the button doesn't get clipped by the sticky header above or the bottom nav below. Tap it on each viewport — the dialog should open without the page jumping or the button needing two taps.

Expected
The button is visible without scrolling on desktop and tablet. On mobile it remains accessible (either pinned in the header or as a floating action). Touch target is ≥44px on mobile. Tapping reliably opens the dialog on the first tap. If you have to double-tap on mobile, that's a touch-area or pointer-events bug — capture the viewport size and the exact target.

---

**B4 — Header layout holds at 320px with long names and long batch labels**

What this is
320px is the project's hard minimum. A header that overflows or wraps awkwardly here is a daily friction point for teachers on older Android phones. Long real-world names ("Lakshmi Priyadarshini Venkataraghavan") combined with long batch labels ("Class 12 Science — JEE Advanced Morning Batch") are where this most often breaks.

What to try
Resize the viewport to 320px and load a student with a long name and a batch with a long label. If your seed doesn't have one, find or create the longest name/batch combination you can. Inspect the header — name truncation, batch wrapping, CTA position. Then rotate (if testing on a real device) to landscape 320×something and back.

Expected
No horizontal scroll at 320px. Long names truncate with ellipsis if needed but remain readable, with a way to see the full name (tooltip, expand-on-tap). Long batch labels wrap cleanly without pushing the CTA off-screen. The CTA stays reachable above the bottom nav. If horizontal scroll appears, that is a P1 responsive bug.

---

### C. AI Student Summary

**C1 — Summary renders specific strengths, priorities, and engagement notes for a typical student**

What this is
The AI summary is the teacher's 10-second read on the child. It must be specific (cite chapters by name, cite trends with direction) rather than generic ("keep working hard", "needs improvement"). Generic output usually means the prompt or the data passed in is too thin, or the student has too little history to summarise. Either way, a generic summary is worse than no summary because it looks intelligent without being useful.

What to try
Open a student with a balanced mix of strong and weak chapters and at least 5 exam attempts. Read each block: strengths, priorities, engagement note. Cross-check the named chapters against the Chapter Mastery grid below — the chapters cited in "strengths" should actually be the green ones in the grid; the chapters cited in "priorities" should be the red ones. Open three more students in different bands and repeat.

Expected
Strengths name actual chapters or topics the student does well in, and the chapters cited match what's green in the grid. Priorities name actual weak chapters with a hint of what to do, and they match what's red. Engagement note references attempt frequency, recency, or trend, not a platitude. If the AI summary cites a chapter that doesn't appear anywhere else on the page, that's a hallucination — capture the summary text, the student ID, and the actual chapter list, and file as P1.

---

**C2 — Summary degrades gracefully for a top performer with no priorities to report**

What this is
If a student has no weak areas, the "Priorities" block has nothing to say. A confused output here ("focus on improving in [empty]", an empty bullet, "[object Object]") is worse than a missing block because it looks like the AI is broken.

What to try
Open a student in the Mastery band whose chapters are all above the strong threshold. Read the priorities section and the engagement note. If your seed doesn't have such a student, generate one by raising scores in the data layer or by picking a sparse-data student whose few attempts were all strong.

Expected
Priorities either show a positive maintenance message ("maintain consistency in X") or the block hides cleanly. No empty bullet, no "[object Object]", no broken sentence ending in "in ." or "focus on .". The strengths block remains populated. The engagement note acknowledges the strong status. If the AI says "needs improvement" about a top performer, the prompt is reading the wrong end of the data — file as P1.

---

**C3 — Summary degrades gracefully for a student with zero exam attempts**

What this is
A newly enrolled student or one who has been continuously absent has nothing to summarise. The card must say so explicitly rather than fabricate insights from nothing or render an empty white box. This is the most common cold-start failure in AI-driven cards across the product.

What to try
Open the student you seeded with zero exam history. Inspect the AI summary card from top to bottom. Refresh the page and check whether the same empty-state text appears, or whether the AI tries again with the same empty input and produces different garbage each time.

Expected
The summary either renders an explicit empty state ("Not enough data yet — student has not attempted any exams") or hides entirely. It must not invent strengths from nothing. The output must be deterministic — refreshing the page must not change the text, because the input is the same. If the text differs across refreshes for an empty-input student, the AI call is being made on every render and not memoised; that is both a bug and a cost issue.

---

**C4 — "Scroll to Weak Topics" anchor lands at the right section on every viewport**

What this is
The summary's call to "see weak topics" should scroll the page to the Weak Topics list with the heading visible — not somewhere arbitrary, not hidden under a sticky header, not below the section so the user has to scroll up.

What to try
Tap the scroll-to-weak-topics action from the AI summary on desktop, tablet, and mobile. Watch where the page lands in each case. On mobile, also try tapping it after you've already scrolled the page partway down — does it scroll up correctly, or does it only work from the top?

Expected
The page scrolls smoothly to the Weak Topics list with the section heading visible at the top of the viewport on every screen size. Sticky headers do not eat the heading. The action works regardless of current scroll position. If the heading lands behind a sticky bar, the scroll target needs an offset — file as a P2 UX bug. If the action does nothing on mobile, the ref is detaching on re-render — capture the device size and a video.

---

**C5 — Generate Homework from the AI summary prefills the correct student and weak topics**

What this is
The AI summary's CTA is one of two confirmed entry points into the homework dialog. The prefill must include the student's name in the banner, the correct subject and batch, and the student's actual weak topics in the instructions field — not the previous student's, not the batch's average weak topics, not a hardcoded default.

What to try
Open Student A's profile, tap Generate Homework from the AI summary block, and read every field of the dialog: banner, subject, batch, instructions text, due date. Note them down. Close the dialog. Navigate to Student B and repeat. Then navigate back to Student A and open the dialog from the *header* CTA instead — compare the prefilled fields with the AI-summary version you saw earlier. They should match for the same student.

Expected
Banner reads "Student: <Student A's exact name> — Weak areas identified". Instructions list Student A's actual weak topic names. Subject is the teacher's subject (or the subject the page is scoped to). Batch is the current batch. Student B's dialog shows Student B's data with no leakage. Header-CTA prefill matches AI-summary-CTA prefill for the same student. Any drift between the two CTAs for the same student is a P0 prefill drift bug — capture both dialogs and the student ID.

---

### D. Chapter Mastery Grid

**D1 — Chapter colour matches the project colour rule, and any disagreement with the tooltip is reported**

What this is
The Chapter Mastery card has an info tooltip that currently states *"Green = strong (≥65%), Amber = moderate (40-64%), Red = weak (<40%)"*. The colour utility used by the rest of the Reports module (`src/lib/reportColors.ts`) uses **75 / 50 / 35** thresholds with four tiers (emerald / teal / amber / red). **One of these is wrong.** Boundary values are where this is most catchable — a chapter at 65% should colour green per the tooltip and amber per the code. Your job is not to pick a side; your job is to report what the rendered tile actually does.

What to try
Seed or find chapters where the student's percentage is exactly on the boundaries — 75, 65, 50, 40, 35 — and any value just above and below each. Open the grid and note the rendered colour for each percentage. Then open the tooltip and read its text. Refresh the page several times to confirm colours are stable across renders.

Expected
Record the actual rendered colour for each boundary value. If colours follow 75/50/35, the tooltip is wrong (file P1 against the tooltip text). If colours follow 65/40, the colour utility is being overridden somewhere (file P0 against the colour rule because the rest of the Reports module assumes 75/50/35). Either way, screenshots of every boundary value plus the tooltip text are required for the bug report. Colours flickering between renders for the same percentage is a separate P0 stability bug.

---

**D2 — A chapter with no attempts shows a no-data tile, not a misleading red**

What this is
A chapter the student has never been examined on is *unknown*, not *failed*. Colouring it red because the percentage rounds to 0% punishes a student for not having had the opportunity, and tells the teacher to intervene on something they cannot intervene on.

What to try
Find or seed a chapter where this student has zero questions attempted. Inspect that tile's colour, its percentage value, and any indicator text. Compare against a real 0% chapter (where the student attempted everything and got everything wrong) if you can seed one — the two states must be visually distinct.

Expected
The "no attempts" tile renders as neutral / grey / "Not yet assessed" with explicit text, not as a red weak chapter. A real 0% chapter, by contrast, may show as red — and the difference between the two should be obvious without hovering. If both look the same, the page cannot distinguish "absent" from "failed" — that is a P1 data-modelling bug, not just a UI one. Capture both tiles side by side.

---

**D3 — Only one chapter expands at a time, and rapid taps don't double-open or stutter**

What this is
Per the page's behaviour, tapping a second chapter should collapse the first. Two open accordions cause layout shift and confuse the eye on mobile. Rapid double-tapping is also a real-world behaviour on touch devices and should not produce a flicker or a half-open state.

What to try
Tap chapter 1 to expand, then tap chapter 2 without collapsing chapter 1 first. Then tap chapter 2 again to collapse. Then tap chapter 1 and chapter 3 in rapid succession. Then tap the same chapter 5 times very fast on mobile. Watch for any state where two chapters are open at once or where the chevron arrow disagrees with the body's open/closed state.

Expected
Chapter 1 collapses automatically as chapter 2 opens. State remains consistent across rapid taps — the chevron and body are always in sync. No flicker. No layout jump that pushes chapter 3 off the visible area mid-tap. If you can produce a state with two chapters open, capture the exact tap sequence; that's likely a state-update race in the parent component.

---

**D4 — Long chapter names truncate cleanly without breaking the row**

What this is
Some curriculum chapters have very long titles like "Some Applications of Trigonometry — Heights and Distances". The grid must truncate with ellipsis rather than wrap unpredictably or push the percentage badge off-screen, especially at 320px where there is no horizontal slack.

What to try
Find or seed a chapter with a 60+ character name and view it on desktop, tablet, and 320px. Tap the row to expand and confirm the full name is reachable inside the expanded body. Then view the same chapter when it's collapsed and when it's expanded — both states must handle the long name gracefully.

Expected
Name truncates with ellipsis at smaller widths. Percentage badge remains visible and readable. Tapping the row still expands it. Inside the expanded body the full name is shown without truncation. If the truncated name on the collapsed row does not show enough characters to disambiguate two similarly-named chapters ("Some Applications of Trigon..." vs "Some Applications of Triang..."), file a P2 UX issue suggesting a tooltip or wider truncation rule.

---

**D5 — Expanded chapter shows topic-level breakdown that plausibly aggregates to the chapter score**

What this is
When expanded, a chapter reveals topic-level scores. The topic numbers should plausibly average up to the chapter-level score. If the chapter says 70% but every topic shows 30%, the roll-up logic is broken or one of the two numbers is reading from the wrong dataset. Teachers will compute the average in their head and lose trust if it doesn't add up.

What to try
Expand at least five chapters across different bands and sanity-check that topic scores aggregate roughly to the chapter score (weighted by question count is acceptable, simple averaging is acceptable — but a wild divergence is not). Use a calculator if needed. Pick at least one chapter with many topics and one with two or three.

Expected
Roll-up arithmetic is consistent across all spot-checked chapters. Where weighting matters, the math still ties out within rounding. If a chapter says 70% and every topic shows 20%, capture the screenshot and the expected vs actual numbers — that is a P1 data correctness bug that affects every downstream insight.

---

### E. Exam History Timeline

**E1 — Exams render in a clear chronological order with readable dates and per-exam scores**

What this is
The timeline is the teacher's view of the student's trajectory. Out-of-order rows, missing dates, or unreadable scores make trend reading impossible. The order rule (newest-first or oldest-first) must be obvious and consistent — flipping between the two across renders is a separate stability bug.

What to try
Open a student with 6+ exams across several weeks. Read the dates top-to-bottom. Note whether the order is newest-first or oldest-first. Refresh the page and confirm the order is the same. Then open a student with only one or two exams and confirm the same rule applies (a one-row timeline still has to use the project's chosen order).

Expected
Order is consistently most-recent-first (or oldest-first — whichever the page commits to, but the same on every load). Each row has a readable date, exam name, score, and per-exam delta if shown. A one-row timeline renders cleanly. If two consecutive renders disagree on order, the sort is unstable — capture both screenshots and the student ID.

---

**E2 — A missed / not-submitted exam is marked absent, never as a 0% score**

What this is
If a student didn't submit, their score is *missing*, not *zero*. Treating it as zero crashes the average, drags the student into the Risk band unfairly, and makes the trend arrow point down for the wrong reason. This is one of the most common silent-correctness bugs in any analytics product.

What to try
Open a student who was absent for at least one exam in your seed. Inspect that timeline row. Then look at their average percentage on the header card and see whether the absence drops their average compared to a similar student who attended that exam. Cross-check the trend arrow.

Expected
The row shows "Did not attempt" or similar, distinct from a real 0% score. The student's overall average and timeline trend exclude this row from arithmetic. The trend arrow does not turn negative just because of the absence. If the absence is being arithmetically counted as 0, the average and trend will be visibly off — capture the absence row, the average shown, and what the average should be without the absence.

---

**E3 — Institute tests in the timeline carry the violet/purple visual distinction**

What this is
Per project standards (`mem://features/teacher-module/institute-test-integration-logic`) institute-created tests render with a violet/purple accent everywhere they appear. Without that distinction the teacher cannot tell which tests they own and which they only see analytics for, and may attempt to edit or delete content they don't control.

What to try
Open a student whose timeline includes both teacher-created and institute-created exams (your seed should have at least one of each). Compare the two row treatments — colour, badge, icon, label. Then resize to 320px and confirm the distinction survives the smaller layout.

Expected
Institute exam rows carry the violet/purple treatment consistently. Teacher-created rows use the standard styling. The distinction is visible at every viewport. If the distinction disappears at 320px (because a coloured badge gets hidden by a responsive rule), that's a P2 visibility regression — capture the small-screen screenshot.

---

**E4 — Tapping a multi-subject institute test row opens the exam scoped to the teacher's subject only**

What this is
On a multi-subject institute Grand Test, the row must open the exam detail filtered to the teacher's own subject — never the full multi-subject report. This is the same subject-scoping rule as the Exams cycle, surfacing here through the student timeline. Subject leakage on this path is a P0 because the teacher will not realise they're seeing another subject's questions until they read them carefully.

What to try
On a Physics teacher login, open a student profile that has a multi-subject Grand Test in their timeline (your seed should include this). Tap that row. Read the exam name, the questions on the Questions tab, the chapters on the Chapters tab. Confirm everything is Physics. Then tap back and confirm you return to this student's profile, not the batch root.

Expected
The exam detail opens with only Physics questions, Physics chapters, and Physics-flavoured insights. Class average and top/bottom scores are computed from the Physics portion of student scores only. The back button returns to this student's profile, scrolled roughly back to the timeline. If you see a Chemistry or Maths question on the Questions tab, stop testing and file P0 with the exam ID, the student ID, and the teacher login used.

---

**E5 — A long timeline (10+ exams) remains usable without lag or layout collapse**

What this is
Students with long histories must not break the layout or force the teacher to scroll endlessly without ordering, pagination, or any way to find a specific exam. This is also where virtualisation bugs surface — rows rendering blank as you scroll, or duplicate rows appearing.

What to try
Open the student with the longest exam history in your seed. Scroll from top to bottom. Look for pagination, a "show more" toggle, or virtualised rendering with smooth scroll. Note the time it takes to scroll and whether the rows render in time. Then scroll quickly back up and watch for blank or duplicated rows.

Expected
The page handles long histories gracefully — either via pagination, a "show more" toggle, or smooth virtualised scrolling without lag. Order remains correct throughout. No blank rows during fast scroll. No duplicate rows. If the page lags noticeably (>500ms per scroll gesture) on a 10-row history, that's a P2 perf bug; on a 30-row history it's a P1.

---

### F. Difficulty Analysis & Weak Topics

**F1 — Difficulty Analysis is collapsed by default on small screens and expands cleanly**

What this is
Per project responsive standards (`mem://style/reports-collapsible-default-state`), secondary analysis sections start collapsed on mobile to keep the primary information above the fold. A section that defaults open eats the viewport and forces the teacher to scroll past it on every visit. The expand affordance must also be visible and tappable, not hidden behind a chevron that's smaller than the touch target.

What to try
Open a student profile at 320px. Locate the Difficulty Analysis section. Confirm it is collapsed. Tap to expand and confirm the body renders. Tap to collapse and confirm it closes. Then resize to desktop and check the default state — it may render expanded there, which is acceptable, but the toggle must still work.

Expected
Section is collapsed by default at 320px with a clear expand affordance. On desktop it may render expanded — that is acceptable. The toggle works in both directions. If the section is open by default on mobile, file as a P2 responsive default bug. If the toggle leaves the chevron pointing the wrong way after the body's animation completes, that's a separate state-sync issue.

---

**F2 — Difficulty distribution numbers add up to total attempts**

What this is
Easy + Medium + Hard counts must equal the student's total questions attempted, otherwise a bucket is being silently dropped (often the "Unclassified" or "no difficulty tag" set). Lost questions mean the analysis is incomplete and the teacher cannot tell which questions are missing.

What to try
Expand difficulty analysis on a student with at least 30+ attempted questions across multiple exams. Sum the visible counts (easy + medium + hard) and compare to the student's total questions attempted (visible on the header or computable from the timeline). If your seed has questions tagged with non-standard difficulties or no difficulty, deliberately include them.

Expected
The arithmetic ties out exactly. If a question has unknown difficulty it should be visibly counted in an "Unclassified" bucket, not silently lost. If the sum is less than the total, capture both numbers and the count for each bucket — that's a P1 silent data loss bug. If the sum is greater (rare but possible if a question is double-counted across difficulty tags), that's also P1.

---

**F3 — Weak topics list is ordered worst-first with sample-size context for each row**

What this is
The teacher needs to know not just *what* the student is weak in, but *how confident* the system is in that signal. A topic flagged weak on one attempted question is far less actionable than one flagged weak across ten. Without sample-size context the teacher cannot tell whether to assign remedial work or wait for more data.

What to try
Open a student with both well-supported and thinly-supported weak topics (your seed should have at least one of each). Inspect the list — order, score values, supporting attempt counts, chapter context. The component currently shows accuracy as a percentage badge and "<chapter> · N Q" as the secondary line; verify both render for every row.

Expected
Topics are ordered worst-first by accuracy. Each row shows the supporting question count so the teacher can judge confidence. Chapter context is visible. If a row shows a topic without a question count, the data layer isn't providing it — capture the row and the topic name. If the order is alphabetical or arbitrary, that's a P1 sort bug because the entire list's purpose is to surface the worst topics first.

---

**F4 — A weak topic whose underlying chapter has been renamed in master data still resolves correctly**

What this is
If the institute admin renames a chapter in master data, every topic reference inside the student's history must still resolve to the new chapter name — not show the stale name, not break the row, not silently disappear. This is a real-world scenario because chapter names get cleaned up periodically.

What to try
Have the institute admin rename a chapter that this student has weak topics under (or simulate the rename in the data layer). Reload the student profile. Inspect the weak topic row that referenced the renamed chapter — does the chapter name now read the new name, the old name, or "undefined"? Then try cross-linking from the row (if a tap action exists) to the chapter report.

Expected
The weak topic row shows the new chapter name. Cross-link from the row (if present) navigates correctly to the renamed chapter's report. If the row shows "undefined" or the old name, the data join is keying on a stale label rather than an ID — that's a P1 data-integrity bug that will accumulate as more chapters get renamed over time.

---

**F5 — Note: Weak Topics list does not currently expose a per-row Generate Homework CTA**

What this is
The original test plan assumed a third Generate Homework entry point on each weak topic row. Reading `src/components/teacher/reports/WeakTopicsList.tsx` confirms there is no such CTA today — each row is a display-only summary. This scenario exists to make sure testers don't waste time hunting for a button that isn't there, and to capture the case if a future build adds one.

What to try
Inspect each weak topic row. Look for any tap, hover, or long-press action that opens the homework dialog. Try tapping the row. Try long-pressing on mobile.

Expected
No homework CTA on the row in the current build. Tapping/long-pressing the row does nothing or shows a tooltip. If you find a Generate Homework CTA on the row, the build has changed since this document was written — file a documentation update request and verify that the new CTA's prefill matches the header and AI summary CTAs (this becomes a third entry point in the H1 prefill-drift scenario).

---

### G. Generate Homework Parity, Edge Cases & Stability

**G1 — Both Generate Homework entry points produce a consistent prefilled dialog for the same student**

What this is
The header CTA on the Student Header and the AI Summary CTA must produce a *consistent* prefilled dialog for the same student. Inconsistency between them is a P0 bug because teachers learn to trust whichever one they tap first and assume the others match. If the AI summary path silently drops weak topics that the header path includes, the teacher will assign less work than intended without ever realising it.

What to try
On the same student, open the dialog from each of the two entry points in turn. Compare the banner text, subject, batch, instructions field, due date, and any selected content source. Repeat on a second student in a different band. Then repeat on a third student who has zero weak topics, to confirm the fallback prefill is also consistent across both entry points.

Expected
Banner names the same student in all entry points. Subject, batch, and due date match. Instructions field matches — both entry points should list all weak topics for the student, framed identically. If you find any difference (one entry point lists three topics and the other lists five, or one names the student in the banner and the other says "Targeted practice for student"), capture both dialogs side by side and the student ID. This is a P0.

---

**G2 — Banner inside the dialog never carries the previous student's name**

What this is
The classic stale-state bug: open Student A's dialog, close it, navigate to Student B, open the dialog again. Student A's name in the banner is the worst-case outcome because the teacher cannot tell something is wrong unless they re-read the banner — and most teachers don't.

What to try
Open Student A's homework dialog from the header. Read the banner. Close. Navigate to Student B. Open the dialog from the header. Read the banner. Then repeat with rapid back-and-forth navigation between three students, opening and closing the dialog each time. Try the same with the AI summary CTA instead of the header CTA.

Expected
Banner shows the current student's name on every open. No trace of the previous student. Subject, batch, and topics also reflect the current student. If you ever see the previous student's name even for a flash before the new name appears, that's a render-order bug — capture a video. If the previous name persists until you click something inside the dialog, that's a P0 prefill leak.

---

**G3 — Switching subject inside the dialog (when the teacher owns multiple subjects)**

What this is
If the teacher teaches more than one subject and the dialog allows switching between them, the prefilled instructions and any topic context should update to that subject's data for this student — not stay frozen on the original subject's list. If the topics don't update, the teacher will assign Physics homework with Chemistry topic names in the instructions.

What to try
Open the dialog for a student with a multi-subject teacher login. Switch the subject in the dialog (if the affordance exists). Watch the instructions field and any topic context. Switch back. Switch to a third subject if available.

Expected
The instructions / topic list updates to reflect the newly selected subject's weak topics for this student on every switch. If the field stays frozen on the original subject's content, that's a P1 because the teacher will not notice the mismatch until after assignment. If switching subjects clears the instructions entirely, that's a smaller P2 UX bug — log it.

---

**G4 — Generating without any weak topics still produces a sensible default**

What this is
A top performer has no weak topics. The dialog must not render an empty topic list and disable the Generate button — it should fall back to a maintenance-style default. The current code uses *"Targeted practice for <name>"* as the fallback (`src/pages/teacher/StudentReport.tsx` line 67), so the dialog should at least open with that string.

What to try
Open the dialog for a Mastery-band student with no weak topics. Read the instructions field. Try to Generate without editing anything. Then open the dialog for a student with zero exam history (and therefore no weak topics for a different reason) and repeat.

Expected
The fallback instruction "Targeted practice for <student name>" is prefilled. Generate is enabled. The output is reasonable revision content, not random remediation or an error. The two cases (Mastery student vs zero-data student) may use different fallback text — if they do, log the difference; if they don't, that may be acceptable but worth confirming with product.

---

**G5 — Double-clicking Generate does not produce two assignments**

What this is
Idempotency on a high-stakes button. Two assignments mean two notifications to the student, two entries to manage, and possibly two AI calls billed. This is a real production concern, not just a test artefact.

What to try
Tap Generate twice in rapid succession on a normal connection and watch the network tab. Then throttle to 3G in DevTools and try again — the lock or spinner should appear faster than your second click can land. Then hit Enter while the button still has focus immediately after the first click. Repeat from at least two different students to vary the prefill.

Expected
Exactly one assignment is created and exactly one network call is fired. The button disables or shows a spinner after the first tap. If you see two rows in any subsequent assignment list, that's a P0 duplication bug — capture the request payloads and the assignment IDs. If you see one row but two network calls (the second returning 4xx because of a server-side dedupe), the UI is leaking duplicate clicks even though the server saved you; that's a P1 lock bug worth filing separately.

---

**G6 — Navigating away mid-generation does not corrupt the assignment or the page**

What this is
If the teacher gets distracted and clicks back while generation is in flight, the request should either complete in the background, abort cleanly, or surface a recoverable state — not orphan the assignment, freeze the page, or leak a stuck spinner that stays after navigation.

What to try
Tap Generate. Before it completes, navigate to another student or tab. Wait a few seconds and return. Check whether the assignment exists, whether a toast appeared, whether the dialog state was preserved. Repeat with a refresh instead of a navigate, and with a hard close (closing the tab) and re-open.

Expected
Either the assignment completes silently and is visible the next time you open the relevant list, or it aborts with no record. No half-saved state. No spinner stuck on a different page. No console errors that break the next page. If you find an orphaned assignment with partial fields, capture the assignment ID and the steps that produced it — that's a P1 data integrity issue.

---

**G7 — Student deleted from the batch while their report is open**

What this is
Edge case where the institute admin removes the student between page load and the next interaction. The page should fail gracefully on the next action rather than silently submit work for a non-existent student or render a corrupted state.

What to try
Open a student profile, then have the institute admin remove that student (or simulate the removal in the data layer). Try to Generate Homework. Try to navigate to a chapter from the mastery grid. Try to refresh the page entirely.

Expected
The action either fails with a clear "student no longer in batch" message or the page refreshes to a not-found state. No silent assignment to a deleted record. If Generate succeeds against a deleted student, that's a P0 data integrity bug — capture the assignment ID. If the page renders zero data with no explanation, that's a P2 UX issue — file a separate ticket suggesting an explicit empty state.

---

**G8 — Student transferred to another batch — does the report still load coherently?**

What this is
Similar edge case to G7 but more common. The student now belongs to a different batch, but the URL still references the old one. The page must not blend the old batch's context with the new student data.

What to try
Have admin transfer a student to another batch. Reload the original student URL (`/teacher/reports/<old-batch>/students/<student-id>`). Note what the page does. Then try the URL with the new batch ID and confirm it works.

Expected
Either the page redirects to the student's new batch context, or it shows a clear "student no longer in this batch" empty state with a back link. Never a corrupted profile that mixes the two batches' chapter lists, exam timelines, or AI summaries. If you see a profile that loads with chapters from one batch and a header from another, capture both batch IDs and the URL — that's a P1 cross-batch data leak.

---

**G9 — Student profile holds at 320px with all interactive elements reachable, including under the bottom nav**

What this is
The full student page is dense (header + AI summary + mastery grid + timeline + difficulty + weak topics). On 320px the bottom nav can clip the last 80px of the page (`pb-20` on `StudentReport.tsx` adds bottom padding to compensate). Any CTA that ends up clipped is effectively invisible and unusable on the device most teachers carry.

What to try
Resize to 320px. Scroll the entire page from top to bottom. Try every CTA — header Generate Homework, AI summary CTAs, chapter expand/collapse, exam timeline rows, weak topic rows, difficulty toggle. Confirm bottom nav doesn't overlap content. Try tapping each CTA close to the bottom edge and confirm it actually fires.

Expected
No horizontal scroll. Every CTA is tappable with a 44px touch target. The Weak Topics list and any final CTA remain reachable above the bottom nav. If a tap near the bottom of the page mis-fires (hits the bottom nav instead of the page CTA), capture the y-coordinate and the device size — that's a collision-padding bug.

---

**G10 — Rapid drilling Student → Chapter → back → another Student leaves no stale state anywhere**

What this is
The most common source of "wrong data on screen" bugs is navigating fast between contexts and ending up with a hybrid of two students' data — Student A's name in the header, Student B's chapters in the grid, Student A's weak topics in the list. This bug is invisible unless you check every section after every navigation.

What to try
Open Student A. Drill into a chapter from their mastery grid. Hit back. Open Student B from the roster. Open the homework dialog and read the banner. Close. Hit back to the roster. Open Student C. Drill into their timeline by tapping an exam row. Hit back. Open the homework dialog from the AI summary this time. At every step, check the header name, the AI summary first sentence, the first chapter in the mastery grid, the first weak topic.

Expected
At every step the page reflects the current student exclusively — name, batch, mastery, timeline, weak topics, and homework dialog all aligned. No banner text, no chapter list, no weak topic carries over from a previous student. If you see any field reflecting an earlier student even for a flash, capture a video. If the homework dialog banner shows the wrong student, that's the worst version of this bug and is P0.

---

**G11 — `returnTo` is preserved across three-level drill-downs**

What this is
Students tab → Student detail → Chapter detail → back should land on the Student detail. Then back again should land on the Students tab on the batch. Then back again should land on the Reports list. The `returnTo` parameter must survive all the intermediate hops.

What to try
Drill from the Students tab into a student, into a chapter from their mastery grid, then back. Then back again. Then back again. Note where each back lands. Then try the same with a four-level drill (Students → Student → Chapter → Exam from the chapter's exam breakdown → back × 4).

Expected
First back returns to the student profile. Second back returns to the Students tab on the batch. Third back returns to the Reports list. On the four-level drill, the same hop-by-hop unwind applies. Never lands at the batch root mid-stack, never skips a level. If a back jumps two levels at once, capture the URL trail and the exact taps — that's a P1 navigation contract violation.

---

## Cross-Cutting Notes

- **Responsive widths**: every section above should be re-checked at 320, 768, and desktop. A scenario that passes at desktop and fails at 320 is still a failure — log it with both viewport sizes.
- **Touch targets**: verify ≥44px on every CTA, including the small chips on weak-topic rows.
- **Visual identity of institute content**: violet/purple treatment must be applied consistently anywhere institute-created content surfaces in the student profile (timeline rows especially).
- **Mock data stability**: the page is currently powered by deterministic mock data. Refreshing should not change percentages, band assignments, or AI summary text. If numbers shift on refresh, the seeded-PRNG promise is broken — log it as a high-priority data stability bug. (See `src/data/teacher/studentReportData.ts` — the PRNG seeding lives there.)
- **What this cycle does NOT cover**: real backend persistence (mock data only), edge function quality for `analyze-batch-report`, scale (>30 students per batch), and the Copilot's Multi-Subject Risk and Student Profile cards (those belong in a Copilot QA cycle).

If a scenario above does not match the current build, the *build* is what needs investigation, not the scenario. The scenarios are written from the product specification cross-checked against the code as it exists today; small UI iterations should not invalidate them, but feature-level rewrites might. Flag any scenario you cannot execute and we will decide whether to update the doc or file a bug.