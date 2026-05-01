# Teacher Reports — Students QA

> This document is for testers validating the **Students tab** of the Teacher Reports module and the **Student Report** screen that hangs off it: the per-student header, AI summary, chapter mastery grid, exam history timeline, difficulty analysis, weak topics list, multi-subject risk card, and the three different "Generate Homework" entry points that all feed into the same AI Homework Generator dialog. Where the Chapters cycle was about a *cohort* and the Exams cycle was about an *event*, this cycle is about an *individual learner*. The bugs that surface here are usually subtle: the wrong name in a banner, a stale weak topic carried over from a previous student, a Performance Index that disagrees with what the teacher saw thirty seconds ago on the Chapters tab. None of them crash the page; all of them cause a teacher to assign the wrong work to the wrong child. Read every banner, every prefilled instruction, and every chapter colour with the question: *if I generated homework based on what I'm seeing, would the right student get the right practice?*

---

## Before You Begin — Seed Your Data First

The students cycle is the one where weak seed data hides the most bugs. A roster of twelve identically-performing students makes every band look the same and makes the multi-subject risk card refuse to render. Spend real time setting up variety before you start clicking.

- **Pick a teacher login that owns at least two batches**, with at least one batch containing **25–30 students**. Anything smaller and the four PI bands (Mastery, Stable, Reinforcement, Foundational Risk) cannot all be populated, and you will mistake "no card rendered" for "card broken".
- **Make sure the roster spans all four PI bands.** You need at least one student in each band, plus at least one band with a *single* student (to test the smallest-bucket rendering) and at least one band with *zero* students (to test the empty-band rendering — does it collapse, hide, or show "no students"?).
- **At least one student should be weak in two or more of your subjects.** This is the only way the Multi-Subject Risk card will render. If you only teach one subject, deliberately note that the card should *not* appear at all and validate that absence.
- **At least one student should have very few exam attempts** (one or two), so the timeline, difficulty analysis, and AI summary are forced into their sparse-data states. A different student should have **10+ attempts** so you can validate scrolling and ordering on a long timeline.
- **At least one student should be absent / have not submitted in one of the exams**. The exam history timeline must show that gracefully — not as a zero score that pollutes the average.
- **At least one student should be newly added to the batch** (joined after several exams already ran), so most rows on their timeline read "did not attempt" rather than "0%".
- **At least one chapter should have zero attempts for at least one student**, so the Chapter Mastery grid is forced to show its no-data tile rather than colouring it red.
- **Generate at least one Practice assignment that targets a specific student or band**, so when you cross-link from the Weak Topics list back into Practice History the connection is visible.

The intent is not to build a tidy dataset. It is to build the *uneven, partial, real-classroom* dataset under which the page actually has to behave.

---

## Highest-Risk Bugs to Hunt

These are the failures most likely to cause a teacher to act on wrong information. Keep them at the front of your mind on every scenario:

1. **Prefill drift between the three Generate Homework entry points (P0).** The header CTA, the AI Summary CTA, and the Weak Topics row CTA must all open the same dialog with the **same student name in the banner, the same subject, the same batch, and the same weak topics in the instructions**. If any one of them shows a different student's name or last session's topics, a teacher will assign mismatched work. Test this entry-point parity on at least three different students.
2. **Chapter Mastery thresholds disagreeing with the tooltip.** The tooltip on the Chapter Mastery card states the colour bands explicitly (e.g. green ≥65, amber 40–64, red <40). If a chapter at exactly 65% colours amber, or a 39% chapter colours amber, the on-screen rule and the rendered colour have diverged. Seed scores that sit *exactly on the boundary* — that is the only way to find this.
3. **Institute exam rows in the timeline opening the wrong subject view.** When a student appears on a multi-subject institute Grand Test, tapping the timeline row from a Physics teacher's view must open the exam scoped to Physics, not the full multi-subject report. Subject leakage from the Exams cycle reappears here through the timeline.
4. **Multi-Subject Risk card showing for single-subject teachers.** A teacher who only teaches Physics cannot meaningfully act on a card titled "weak in 2+ subjects". The card must hide entirely (or render with explanatory text) when the teacher's own subject coverage is one. A card that fires on a student who is weak in only the teacher's own subject and one they don't teach is equally wrong.
5. **Stale state when navigating between students.** Going from Student A → Chapter detail → back → Student B must show Student B's data fully refreshed. A leftover banner reading "Student: Student A — Weak areas identified" inside Student B's homework dialog is the worst version of this bug.
6. **PI exposure to the teacher.** Per project rules the raw Performance Index number is internal — what the teacher sees on the student card is an average percentage and a band label, not a "PI: 32" number. If the raw PI leaks into the UI, flag it.
7. **`returnTo` lost on three-level drill-downs.** Students tab → Student detail → Chapter detail → back should land back on the Student detail, not at the batch root or the Chapters tab.

---

## Test Scenarios

### A. Students Tab Roster & PI Bucketing

**A1 — Roster shows every student in the batch with consistent ordering**

What this is
The Students tab is a teacher's roster view. If a student is silently missing, or if the order shuffles between visits, a teacher will lose track of who they were going to talk to next.

What to try
Open the Students tab on a well-populated batch. Note the first five names and the total count. Refresh the page, switch to another tab and back, then re-count.

Expected
Every enrolled student appears exactly once. The count badge on the tab header matches the visible row count. Order is stable across refresh and tab switches and matches a clear rule (band first, then worst-first inside band, or alphabetical — whichever the product spec says, but consistent).

---

**A2 — All four PI bands render with their distinct visual treatment**

What this is
Bucketing into Mastery / Stable / Reinforcement / Foundational Risk is the primary signal a teacher uses to decide who to prioritise. If the bands are not visually distinct or the labels are wrong, the entire screen loses its purpose.

What to try
On a batch where you've seeded students into all four bands, look at each badge colour and label. Compare against the project's documented band colours (greens for Mastery/Stable, amber for Reinforcement, red for Foundational Risk).

Expected
Each band has a distinct, readable badge. Labels match the project terminology exactly — no "At Risk" rendered as "Critical" or "Reinforce" rendered as "Needs Work".

---

**A3 — A band with a single student renders cleanly**

What this is
Edge case for the smallest possible non-empty bucket. Components that assume "list with multiple rows" sometimes break or show awkward singular/plural text on a single-row band.

What to try
On a batch where exactly one student sits in a given band (most often Foundational Risk early in a term, or Mastery on a struggling batch), inspect that band's rendering.

Expected
The single student renders normally with full data. Any header text reads "1 student" not "1 students". No empty whitespace where a list-of-many would be.

---

**A4 — An empty band is handled, not hidden silently**

What this is
Sometimes no student qualifies for a band (e.g. no one has reached Mastery yet). The teacher needs to know "no one is here" rather than think the band is broken.

What to try
Find or seed a batch where one band is empty. Check whether the band header still appears, whether it shows an empty-state message, or whether it disappears entirely.

Expected
The behaviour is intentional and consistent — if it hides, it hides for all empty bands; if it shows an empty state, the message is informative ("No students currently in Mastery"). Inconsistency between bands is a bug.

---

**A5 — Search filters the roster correctly without breaking band counts**

What this is
The search box at the top of the Students tab filters by name and roll number. The visible count should reflect the filter, but the underlying band counts on the cards beside each name should still be the student's true band — not "band among visible rows".

What to try
Type a partial name. Watch which rows remain. Type a roll number prefix. Clear and re-type a different name.

Expected
Filter is case-insensitive and matches both name and roll number. Each remaining student's band badge is unchanged. Clearing the search restores the full list immediately.

---

**A6 — A student newly added mid-cycle appears in the roster**

What this is
Teachers add students to batches during a term. The new student should appear immediately in the roster, even though they have no exam history yet.

What to try
Have the institute admin add a student to your batch (or simulate one), then refresh the Students tab.

Expected
The new student is listed. Their row shows zero exams attempted, no average percentage (or "—"), and a sensible band assignment (most likely "Stable" or a default — not "At Risk" purely because they have no data).

---

### B. Student Header Card

**B1 — Student header shows identity and batch context unambiguously**

What this is
The header is the first thing a teacher reads. If they cannot tell at a glance which student and which batch they are looking at, every action below becomes risky.

What to try
Open three different students in the same batch, and the same student in two different batches if possible. Compare the headers.

Expected
Name, class, and batch label are all visible and correctly populated. The same student in two batches shows the correct batch label in each. No name truncation that hides part of a student's surname.

---

**B2 — Raw Performance Index is not exposed to the teacher**

What this is
Per project rules the underlying PI number is an internal scoring artifact. Teachers see a band label and an average percentage. A leaked "PI: 32" string anywhere on the header is a privacy/UX bug.

What to try
Inspect the header card text on several students across different bands. Look for any literal PI value rendered.

Expected
No raw PI number is visible. Average percentage and band label are shown; that is the contract.

---

**B3 — Generate Homework button is reachable and obvious**

What this is
The header CTA is the primary entry point into the AI Homework Generator. If it's hidden behind a menu or pushed below the fold on small screens, the flow breaks.

What to try
Open a student profile on desktop, tablet (768), and mobile (320). Find the Generate Homework button on each.

Expected
The button is visible without scrolling on desktop and tablet. On mobile it remains accessible (either pinned in the header or as a floating action). Touch target is ≥44px on mobile.

---

**B4 — Header layout holds at 320px**

What this is
320px is the project's hard minimum. A header that overflows or wraps awkwardly here is a daily friction point for teachers on older Android phones.

What to try
Resize the viewport to 320px and load a student with a long name and a long batch label.

Expected
No horizontal scroll. Name truncates with ellipsis if needed but remains readable. Batch label wraps cleanly. CTA stays reachable.

---

### C. AI Student Summary

**C1 — Summary renders strengths, priorities, and engagement note for a typical student**

What this is
The AI summary is the teacher's 10-second read on the child. It must be specific (cite chapters, cite trends) rather than generic ("keep working hard"). Generic output means the prompt or the data passed in is too thin.

What to try
Open a student with a balanced mix of strong and weak chapters. Read the strengths block, the priorities block, and the engagement note.

Expected
Strengths name actual chapters or topics the student does well in. Priorities name actual weak chapters with a hint of what to do. Engagement note references attempt frequency or trend, not a platitude.

---

**C2 — Summary degrades gracefully for a top performer with no priorities**

What this is
If a student has no weak areas, the "Priorities" block has nothing to say. A confused output here ("focus on improving in [empty]") is worse than a missing block.

What to try
Open a student in the Mastery band with no chapters below the threshold.

Expected
Priorities either show a positive maintenance message ("maintain consistency in X") or the block hides cleanly. No empty bullet, no "[object Object]", no broken sentence.

---

**C3 — Summary degrades gracefully for a student with zero attempts**

What this is
A newly enrolled student or one who has been absent has nothing to summarise. The card must say so rather than fabricate insights.

What to try
Open a student with no exam history at all.

Expected
The summary either renders an explicit empty state ("Not enough data yet — student has not attempted any exams") or hides. It must not invent strengths from nothing.

---

**C4 — "Scroll to Weak Topics" anchor jumps to the right section**

What this is
The summary's call to "see weak topics" should scroll the page to the Weak Topics list, not somewhere arbitrary.

What to try
Tap the scroll-to-weak-topics action from the AI summary on desktop and on mobile.

Expected
The page scrolls smoothly to the Weak Topics list with the section heading visible (not hidden under a sticky header).

---

**C5 — Generate Homework from the AI summary prefills the correct student and topics**

What this is
This is one of the three Generate Homework entry points. Prefill must include the student's name in the banner and the student's actual weak topics in the instructions field — not the previous student's, not the batch's average weak topics.

What to try
Open Student A's profile, tap Generate Homework from the AI summary block, note the banner and instructions text. Close, navigate to Student B, repeat.

Expected
Banner reads "Student: <Student A's exact name> — Weak areas identified". Instructions list Student A's actual weak topic names. Student B's dialog shows Student B's data with no leakage.

---

### D. Chapter Mastery Grid

**D1 — Chapter colour matches the tooltip's stated thresholds**

What this is
The Chapter Mastery card has an info tooltip that states the colour rules (e.g. green ≥65, amber 40–64, red <40). The actual rendered colours must obey those rules exactly. Boundary values are where this most often breaks.

What to try
Seed or find chapters where the student's percentage is exactly on the boundary — 65, 64, 40, 39. Open the grid and verify each chapter's colour against the tooltip text.

Expected
A 65% chapter colours green (per the ≥65 rule). A 64% chapter colours amber. A 40% chapter colours amber. A 39% chapter colours red. Any disagreement with the tooltip is a bug — fix the colour, not the tooltip.

---

**D2 — Chapter with no attempts shows a no-data tile, not a misleading red**

What this is
A chapter the student has never been examined on is *unknown*, not *failed*. Colouring it red because the percentage is "0%" punishes a student for not having had the opportunity.

What to try
Find a chapter where this student has zero questions attempted, and inspect that tile.

Expected
The tile renders as neutral / grey / "no data" with explicit text such as "Not yet assessed", not as a red weak chapter.

---

**D3 — Only one chapter expands at a time**

What this is
Per the page's behaviour, tapping a second chapter should collapse the first. Two open accordions cause layout shift and confuse the eye on mobile.

What to try
Tap chapter 1 to expand, then tap chapter 2 without collapsing chapter 1 first.

Expected
Chapter 1 collapses automatically as chapter 2 opens. State remains consistent across rapid taps.

---

**D4 — Long chapter names truncate cleanly**

What this is
Some curriculum chapters have very long titles. The grid must truncate with ellipsis rather than wrap unpredictably or push the percentage badge off-screen.

What to try
Find or seed a chapter with a 60-character name and view it on 320px.

Expected
Name truncates with ellipsis. Percentage badge remains visible and readable. Tapping the row still expands it.

---

**D5 — Expanded chapter shows topic-level breakdown that matches the chapter's roll-up**

What this is
When expanded, a chapter reveals topic scores. The topic-level numbers should plausibly average to the chapter-level number — if the chapter says 70% but every topic shows 30%, the roll-up is broken.

What to try
Expand several chapters across different bands and sanity-check that topic scores aggregate to roughly the chapter score.

Expected
Roll-up arithmetic is consistent. Weighting by question count is acceptable, but a wild divergence (chapter says 70%, topics all show 20%) is a bug.

---

### E. Exam History Timeline

**E1 — Exams render in chronological order with clear dates**

What this is
The timeline is the teacher's view of the student's trajectory. Out-of-order rows or missing dates make trend reading impossible.

What to try
Open a student with 6+ exams across several weeks. Read the dates top-to-bottom.

Expected
Order is consistently most-recent-first (or oldest-first — whichever the page commits to). Each row has a readable date, exam name, score, and per-exam delta if shown.

---

**E2 — A missed / not-submitted exam is shown as absent, not as zero**

What this is
If a student didn't submit, their score is *missing*, not *zero*. Treating it as zero crashes the average and unfairly drops the student in the band.

What to try
Open a student who was absent for at least one exam.

Expected
The row shows "Did not attempt" or similar, distinct from a real 0% score. The student's overall average and timeline trend exclude this row from arithmetic.

---

**E3 — Institute tests in the timeline are visually distinct**

What this is
Per project standards institute-created tests render with a violet/purple accent. Without that distinction the teacher cannot tell which tests they own and which they only see analytics for.

What to try
Open a student whose timeline includes both teacher-created and institute-created exams.

Expected
Institute exam rows carry the violet/purple treatment consistently. Teacher-created rows use the standard treatment.

---

**E4 — Tapping a timeline row opens the exam detail scoped to this teacher's subject**

What this is
On a multi-subject institute Grand Test, the row must open the exam detail filtered to the teacher's subject — never the full multi-subject report. This is the same subject-scoping rule as the Exams cycle, surfacing through the student route.

What to try
On a Physics teacher login, open a student profile that has a multi-subject Grand Test in their timeline. Tap that row.

Expected
The exam detail opens with only Physics questions, Physics analytics, and Physics-flavoured insights. The back button returns to this student's profile, not to the batch root.

---

**E5 — A long timeline (10+ exams) remains usable**

What this is
Students with long histories must not break the layout or force the teacher to scroll endlessly without a clear ordering or pagination.

What to try
Open the student with the most exam history. Scroll. Look for pagination, "show more", or virtualised rendering.

Expected
The page handles long histories gracefully — either via pagination, a "show more" toggle, or smooth scrolling without lag. Order remains correct throughout.

---

### F. Difficulty Analysis & Weak Topics

**F1 — Difficulty section is collapsed by default on small screens**

What this is
Per project responsive standards, secondary analysis sections start collapsed on mobile to keep the primary information above the fold.

What to try
Open a student profile at 320px. Locate the Difficulty Analysis section.

Expected
Section is collapsed with a clear expand affordance. On desktop it may render expanded; on mobile/tablet it should default closed.

---

**F2 — Difficulty distribution numbers add up to total attempts**

What this is
Easy + Medium + Hard counts must equal the student's total questions attempted, otherwise a bucket is being dropped.

What to try
Expand difficulty analysis. Sum the visible counts and compare to the timeline's total questions or attempts.

Expected
The arithmetic ties out. If a question has unknown difficulty it should be visibly counted in an "Unclassified" bucket, not silently lost.

---

**F3 — Weak topics list is ordered worst-first with supporting context**

What this is
The teacher needs to know not just *what* the student is weak in, but *how confident* the system is in that signal. A topic flagged weak on one attempt is far less actionable than one flagged weak across ten.

What to try
Inspect the weak topics list on a student with both well-supported and thinly-supported weak topics.

Expected
Topics are ordered worst-first by score (or by combined score and attempt count). Each row shows the supporting attempt count or sample-size hint, so the teacher can judge confidence.

---

**F4 — A weak topic whose underlying chapter has been renamed in master data still resolves correctly**

What this is
If the institute admin renames a chapter in master data, the topic reference inside the student's history must still resolve to the new name — not show the stale name or break.

What to try
Have the institute admin rename a chapter that this student has weak topics under. Reload the student profile.

Expected
The weak topic row shows the new chapter name. Cross-link from the row still navigates correctly to the renamed chapter's report.

---

**F5 — Generate Homework from a weak topic row prefills that specific topic**

What this is
This is the third Generate Homework entry point. Tapping from a specific topic row should narrow the prefill to that topic — not dump every weak topic the student has.

What to try
Open a student with at least three weak topics. Tap Generate Homework from one specific row.

Expected
The dialog opens with the student's name in the banner, the correct subject, the correct batch, and the *single* topic name prefilled in instructions. The other weak topics are not silently bundled in.

---

### G. Multi-Subject Risk Card

**G1 — Card appears only when the student is weak in 2+ of the teacher's own subjects**

What this is
The card is only meaningful when the teacher can act on it. If the student is weak in chemistry and biology but the teacher only teaches physics, surfacing this card creates anxiety with no path forward.

What to try
Open a student weak in two of your subjects. Then open one weak in only one of your subjects. Then one weak in two subjects but only one of them is yours.

Expected
Card appears for the first student. Card hides for the second and third. The criteria match the documented PI < 35 in two-or-more *of the teacher's own subjects* rule.

---

**G2 — Card lists each weak subject with its specific PI and weak chapters**

What this is
A card that just says "weak in multiple subjects" is no more useful than the absence of the card. The teacher needs the per-subject breakdown.

What to try
Open the card on a multi-subject-risk student. Read each subject row.

Expected
Each subject row shows the subject name, the student's PI in that subject, and the weak chapter chips. The chips are tappable and lead to the right chapter context.

---

**G3 — Card does not appear at all for single-subject teachers**

What this is
If the teacher only teaches one subject, this card has no meaning. It should not render — not as an empty state, not as a "you only teach one subject" message; just absent.

What to try
Log in as a teacher who teaches a single subject. Open any student in their batch.

Expected
The Multi-Subject Risk card is not present anywhere on the page.

---

**G4 — Card behaves on a student who is weak in 2+ subjects but only one is yours**

What this is
The most subtle case: criteria are met *globally* but not *for this teacher*. The card must respect the teacher's own subject scope, not the institute-wide picture.

What to try
Find a student weak in physics and chemistry, logged in as the physics teacher who does not also teach chemistry.

Expected
Card does not appear (because by the teacher's own scope this is a single-subject weakness). If the product spec says it should appear with a note, that note must explain why the teacher cannot fully act.

---

**G5 — Tapping a subject in the card navigates to that subject's chapter context for this student**

What this is
The card is an entry point into deeper investigation. A broken link or one that drops the student context kills the workflow.

What to try
Tap a subject row in the card. Note where you land. Tap the back button.

Expected
You land on the chapter or subject report for this specific student in this specific subject. Back returns to the student profile with scroll position roughly preserved.

---

### H. Generate Homework Parity, Edge Cases & Stability

**H1 — All three Generate Homework entry points open the same dialog with consistent prefill**

What this is
The header CTA, the AI summary CTA, and the weak topic row CTA must produce a *consistent* prefilled dialog for the same student. Inconsistency between them is a P0 bug because teachers learn to trust whichever one they tap first.

What to try
On the same student, open the dialog from each of the three entry points in turn. Compare the banner text, subject, batch, and instructions field.

Expected
Banner names the same student in all three. Subject and batch match. Instructions field is consistent — header and AI summary should list all weak topics; the per-row weak topic CTA may narrow to that single topic, but must still cite the same student.

---

**H2 — Banner inside the dialog never shows the previous student's name**

What this is
The classic stale-state bug: open Student A's dialog, close it, open Student B's dialog. Student A's name in the banner is the worst-case outcome.

What to try
Open Student A's homework dialog from the header. Close. Navigate to Student B. Open the dialog again. Read the banner.

Expected
Banner shows Student B's name. No trace of Student A. Repeat with rapid back-and-forth navigation between three students.

---

**H3 — Switching subject inside the dialog when a student has multi-subject weakness**

What this is
If the dialog allows the teacher to switch subject (when they teach more than one), the prefilled topics should update to that subject's weak topics for this student — not stay frozen on the original subject's list.

What to try
Open the dialog for a multi-subject-weakness student. Switch the subject in the dialog.

Expected
The instructions / topic list updates to reflect the newly selected subject's weak topics for this student. If a refresh is required, it happens automatically rather than silently keeping stale data.

---

**H4 — Generating without any weak topics still produces a sensible default**

What this is
A top performer has no weak topics. The dialog must not render an empty topic list and disable the Generate button — it should fall back to a maintenance-style default ("targeted practice for <name>").

What to try
Open the dialog for a Mastery-band student with no weak topics.

Expected
A sensible default instruction is prefilled (per the StudentReport code: "Targeted practice for <name>"). Generate is enabled. The output is reasonable revision content, not random remediation.

---

**H5 — Double-clicking Generate does not produce two assignments**

What this is
Idempotency on a high-stakes button. Two assignments mean two notifications to the student and two entries to manage.

What to try
Tap Generate twice in rapid succession on a slow network.

Expected
Exactly one assignment is created. The button disables or shows a spinner after the first tap.

---

**H6 — Navigating away mid-generation does not corrupt the assignment or the page**

What this is
If the teacher gets distracted and clicks back while generation is in flight, the request should either complete in the background, abort cleanly, or surface a recoverable state — not orphan the assignment or freeze the page.

What to try
Tap Generate. Before it completes, navigate to another student or another tab. Return.

Expected
Either the assignment completes silently and is visible the next time you open Practice History, or it is aborted with no record. No half-saved state, no console errors that break the page.

---

**H7 — Student deleted from the batch while their report is open**

What this is
Edge case where the institute admin removes the student between page load and the next interaction. The page should fail gracefully on the next action rather than silently submit work for a non-existent student.

What to try
Open a student profile, then have admin remove that student. Try to Generate Homework.

Expected
The action either fails with a clear "student no longer in batch" message or refreshes the page to a not-found state. No silent assignment to a deleted record.

---

**H8 — Student transferred to another batch — does the report still load?**

What this is
Similar edge case. The student now belongs to a different batch, but the URL still references the old one.

What to try
Have admin transfer a student to another batch. Reload the original student URL.

Expected
Either the page redirects to the student's new batch context, or it shows a clear "student no longer in this batch" empty state with a back link. Never a corrupted profile that mixes the two batches.

---

**H9 — Student profile holds at 320px with all interactive elements reachable**

What this is
The full student page is dense. On 320px the header, AI summary, mastery grid, timeline, weak topics, and CTAs must all remain reachable with no horizontal scroll and no buttons clipped behind the bottom nav.

What to try
Resize to 320px. Scroll the entire page. Try every CTA. Confirm bottom nav doesn't overlap content (collision padding per project memory).

Expected
No horizontal scroll. Every CTA is tappable with a 44px touch target. The Weak Topics list and Generate Homework remain reachable above the bottom nav.

---

**H10 — Rapid drilling Student → Chapter → back → another Student leaves no stale state**

What this is
The most common source of "wrong data on screen" bugs: navigating fast between contexts and ending up with a hybrid of two students' data.

What to try
Open Student A. Drill into a chapter from their mastery grid. Use the back button. Open Student B from the roster. Open the homework dialog. Then back, then Student C, then drill into their timeline.

Expected
At every step the page reflects the current student exclusively — name, batch, mastery, timeline, weak topics, and homework dialog all aligned. No banner text, no chapter list, no weak topic carries over from a previous student.

---

**H11 — `returnTo` is preserved across three-level drill-downs**

What this is
Students tab → Student detail → Chapter detail → back should land on the Student detail. The `returnTo` parameter must survive intermediate hops.

What to try
Drill from the roster into a student, into a chapter from their mastery grid, then back. Then back again.

Expected
First back returns to the student profile. Second back returns to the Students tab on the batch. Never to the batch root or the Chapters tab on the way down.

---

## Cross-Cutting Notes

- **Responsive widths**: every section above should be re-checked at 320, 768, and desktop. A scenario that passes at desktop and fails at 320 is still a failure — log it.
- **Touch targets**: verify ≥44px on every CTA, including the small chips inside the Multi-Subject Risk card.
- **Visual identity of institute content**: violet/purple treatment must be applied consistently anywhere institute-created content surfaces in the student profile (timeline rows, mastery cards influenced by institute tests, etc.).
- **Mock data stability**: the page is currently powered by deterministic mock data. Refreshing should not change percentages, band assignments, or AI summary text. If numbers shift on refresh, the seeded-PRNG promise is broken — log it as a high-priority data stability bug.

If a scenario above does not match the current build, the *build* is what needs investigation, not the scenario. The scenarios are written from the product specification, not from the implementation, and should outlive small UI iterations.