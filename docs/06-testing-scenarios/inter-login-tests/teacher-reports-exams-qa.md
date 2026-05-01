# Teacher Reports — Exams QA

> This document is for testers validating the **Exams tab** of the Teacher Reports module and every screen that hangs off it: the per-exam Overview, Questions, Chapters, and Difficulty sub-tabs, the Actionable Insights and AI Deep-Dive cards, and the Reteaching Plan flow that pushes a teacher into generating remedial homework. Exams are the most cross-portal-sensitive surface in the entire teacher app — the same Grand Test created by the institute admin must render correctly for three different subject teachers, with **no leakage of one subject's questions or analytics into another**. Treat this cycle as primarily a hunt for *subject-scope correctness* and *AI prefill drift*. A wrong number on a chapter card is bad; a Physics teacher seeing Chemistry questions on a shared Grand Test is catastrophic.

---

## Before You Begin — Seed Your Data First

The exams cycle requires a richer setup than the chapters cycle because it spans both teacher-created and institute-created tests, and because the most important bugs only appear when multiple teachers share the same exam. Plan to spend more time seeding before you start clicking around — at least 45 minutes if you're starting from a clean institute.

- **Pick a teacher login that owns at least two batches**, ideally with overlapping student rosters so you can validate that the same Grand Test row appears once per batch with batch-specific numbers, not merged. If both batches have totally distinct rosters you'll miss a class of cross-batch leakage bugs.
- **Create six to ten teacher exams** (Quick Tests and your own Grand Tests) of mixed status: at least four completed with results captured, one scheduled-but-not-yet-conducted, one draft, and at least one with a single submission so you can hit the smallest-sample edge case. Vary `pattern` (custom, JEE Main, NEET) and `creationMethod` (AI, question bank, PDF) so you can catch UI assumptions about exam shape — bugs love to hide on the less-common combinations.
- **Have the institute admin create at least two Grand Tests** that include your subject. One of them should cover **multiple subjects** (e.g. Physics + Chemistry + Maths) and be assigned to a batch where teachers exist for each subject — this is the only way to test the subject-scoping rule from B onwards. The other should cover only your subject, so you can confirm the multi-subject UI correctly degrades to single-subject when there's nothing to filter.
- **Have at least one institute test published to two of your batches**. The same exam must appear under each batch independently with its own per-batch numbers; if one batch's average shifts when you change the other batch's roster, you've found a leakage bug.
- **Engineer at least one exam where success rate falls below 50% on several questions**, so the Reteaching Plan card is forced to render. Without this you cannot validate the "Take Action" → AI Homework prefill flow, which is one of the most bug-prone surfaces in this cycle.
- **At least one exam where every student scored 100%** and one where every student scored 0% — these expose divide-by-zero and "no insight" bugs in the AI Deep-Dive and Actionable Insights cards.
- **At least one student should be absent / not have submitted** in one of the exams. The Questions tab and Overview must handle missing rows gracefully, not throw. If your seed has every student submitting every exam, you cannot test this.

If you only test against a single perfectly-distributed exam, you will miss every interesting bug. The whole point of this cycle is *exam variety*. Spend the time on seeding now or pay for it in false-positive bug filings later.

---

## Highest-Risk Bugs to Hunt

These are the failures that have either hurt before or that would be most damaging if shipped. Keep them in mind on every scenario:

1. **Subject leakage on shared Grand Tests (P0).** A Physics teacher must never see Chemistry questions, Chemistry analytics, or Chemistry-flavoured AI insights inside an institute-created multi-subject Grand Test. If you see a question from outside your subject, stop and report immediately — this is the single most important bug to find in this cycle. Capture the exam ID, the screenshot, and the leaked content.
2. **Insight prefill drift.** The "Take Action" / "Generate Homework" CTA on an Insight card or Reteaching Plan must prefill the **same subject, batch, and topics** that the card is about. If you launch the dialog and it shows an unrelated chapter or another batch's name, the teacher will assign wrong work to a real student.
3. **AI Deep-Dive contaminated by other-subject text.** Even when questions are correctly scoped, the AI summary text can leak — phrases like "students struggled with stoichiometry" appearing in a Physics teacher's view means the prompt or the data passed to the model is not subject-filtered.
4. **Verdict / averages stale after a retest.** If results are re-imported or a student re-submits, the Overview verdict, class average, and trend arrow must recalculate. A stale verdict is worse than a missing one because the teacher trusts it.
5. **Institute test row not visually distinct from a teacher-created test.** Institute tests must render with the violet/purple treatment so a teacher never confuses one of their own tests with one they cannot edit. Visual confusion here leads to teachers trying to edit content they don't own.
6. **`returnTo` lost on deep drill-downs.** Exams tab → Exam detail → Chapter cross-link → back should land back on the Exam detail (or the Chapters tab if that's where you started), not at the batch root.

---

## Test Scenarios

### A. Exams Tab Listing — My Exams vs Institute Tests

**A1 — Teacher-created exams and institute tests are visually distinct at a glance**

What this is
A teacher needs to know in under a second whether an exam is one they created (and can edit) or one the institute admin pushed (which they can only analyse). Visual confusion here causes teachers to attempt edits that fail silently or to ignore institute tests that should drive their reteaching. The project standard is a violet/purple accent for institute tests; teacher-owned tests use the default teal/cyan teacher theme.

What to try
Open the Exams tab on a batch that has both kinds of test. Without clicking anything, scan the list for 15 seconds and try to identify which rows are institute and which are teacher-owned just from visual cues. Repeat at 320px on mobile to confirm the distinction survives the responsive squeeze. Check colour, badge, icon, and grouping — and pay attention to whether the distinction holds for *every* row or just the first one (a CSS-only cascade fix sometimes leaves later rows un-styled).

Expected
Institute tests are clearly differentiated with a consistent violet/purple accent (border, badge, icon — at least two of these). The grouping or labelling makes "yours vs institute's" unambiguous within one second of looking. The visual treatment is consistent across every entry, not just the first row. If the visual cue disappears at 320px or fades on the third row down, that is a P2 styling bug; if there is no distinction at all, that is a P1 — capture both row types and the batch ID.

---

**A2 — Tab counts on Exams accurately reflect what's listed**

What this is
The header tab shows `Exams (N)`. If N disagrees with the rows actually rendered (because of a hidden draft, an institute test the teacher cannot see, or a status filter), the teacher loses trust in the entire screen. This is a leading indicator for many other count bugs downstream.

What to try
Count the visible rows on the Exams tab and compare with the badge in the tab header. Then change the filter or sort and recount. Also try toggling between batches rapidly — the badge should never lag the displayed list by even a frame. Refresh the page and recount, since on-mount counts have historically diverged from the post-filter counts.

Expected
The badge always equals the number of rows the teacher actually sees, including institute tests they have access to and excluding anything they shouldn't see. The number does not flicker or briefly show a different value mid-render. If the badge says "12" and the list shows 11, capture the batch ID and the sort/filter state — that is at least P2.

---

**A3 — A scheduled-but-not-yet-conducted exam does not appear in the Exams report**

What this is
The Exams tab is a *report*, not a calendar. Scheduled or draft exams have no results to analyse and must not appear here, even though they exist elsewhere in the teacher portal (Exams page proper, Schedule).

What to try
Confirm the seed has at least one scheduled and one draft exam. Open the Exams tab and scan for them. Then deliberately try to direct-URL navigate to the draft exam's analytics route to see if the route guard works.

Expected
Only completed exams (with at least one submission) are listed. Drafts and scheduled exams are filtered out. The empty state, if everything is scheduled, says so explicitly rather than showing a blank pane. Direct-URL access to a draft's analytics returns a not-found or "not yet conducted" state — see H9.

---

**A4 — The empty state when neither kind of exam exists is informative**

What this is
A new teacher in a new batch will hit this screen with nothing on it. The empty state should tell them what to do, not feel like a broken page. First impressions of the reports module set the tone for whether the teacher will return to it.

What to try
Open a batch with zero completed exams (teacher and institute). Switch to the Exams tab. Verify the empty state on desktop and at 320px. Check the browser console for any "no data" warnings.

Expected
A single, clear empty state explaining there are no exam results yet and pointing toward creating an exam or waiting for institute results. No spinner that never resolves, no console error. If a stuck spinner appears, that is a P1.

---

**A5 — Default sort puts the most recent exam first**

What this is
Teachers almost always care about the most recent exam first when scanning. Random or alphabetical sort buries the latest result and erodes trust.

What to try
Look at the order of exams without changing any filter. Confirm against the seed data's dates. Note the top three exam dates and reload — order should be identical.

Expected
Most recent (by exam date or completion date, whichever the project memory dictates) appears at the top, descending to oldest. Re-sorting and returning restores this default. If the order changes between reloads, that is a P1 stability bug.

---

**A6 — Exams from outside the teacher's subject do not appear**

What this is
If the teacher teaches Physics, the Exams tab on their batch must not list a Chemistry-only test, even if the institute created one for the same batch. Showing it would imply the teacher has analytics responsibility for a subject they don't teach — and risks them clicking into Chemistry data they shouldn't see.

What to try
Have the institute admin publish a single-subject test in a subject the teacher does *not* teach. Open that batch's Exams tab. Then attempt direct-URL navigation to the unauthorised exam's detail.

Expected
The test does not appear in the list at all. There is no greyed-out row, no "you don't have access" placeholder — it simply isn't relevant to this teacher and is filtered out cleanly. Direct-URL access returns a not-found or unauthorised state.

---

### B. Institute Test Subject Scoping (HIGHEST PRIORITY)

This section exists because shared multi-subject Grand Tests are where subject leakage bugs hide. Treat every scenario here as if it were P0.

**Setup hint for this section**: Have the institute admin create a Grand Test that covers **Physics + Chemistry + Maths**, publish it to a batch that has separate teachers for each of those subjects, and have students complete it. You will log in as each subject teacher in turn and verify that each one sees *only their slice* of the data.

**B1 — A subject-teacher only sees questions from their own subject inside a multi-subject Grand Test**

What this is
The single most important behavioural rule of this entire module. A Physics teacher opening a Physics + Chemistry + Maths Grand Test must see Physics questions only — not as a default tab, but as a hard filter. There must be no way to navigate to the Chemistry questions from inside this teacher's report.

What to try
Log in as the Physics teacher, open the multi-subject Grand Test from the Exams tab, and inspect every sub-tab (Overview, Questions, Chapters, Difficulty). Read each question text. Read the chapter and topic names. Look in the URL for any `subject=` query param and try changing it to `chemistry` to see if the route allows the override. Inspect the network tab when the page loads — does the API response contain Chemistry data that the UI is filtering client-side, or is the data already scoped server-side?

Expected
Only Physics questions are listed under Questions. Only Physics chapters appear under Chapters. The Difficulty mix reflects only Physics questions. The Overview class average and verdict are calculated using only the Physics portion of each student's score, not the combined score across all three subjects. There is no UI affordance — tab, dropdown, or "view all subjects" toggle — that exposes Chemistry or Maths content. URL query param manipulation does not bypass the filter (server-side scope is required). If the API response carries other-subject data even when the UI hides it, that is a P1 leakage risk worth filing — capture the response payload.

---

**B2 — Class average and verdict are calculated on the teacher's subject only, not on the combined score**

What this is
A student might have scored 90% in Physics and 30% in Chemistry, totalling 60% combined. The Physics teacher must see 90% as that student's contribution, not 60%. Mixing subjects into one number is the most common subtle leakage bug.

What to try
Pick one student in the multi-subject Grand Test where you know their per-subject scores diverge sharply. Compare what the Physics teacher sees as that student's score against the institute admin's view that shows combined and per-subject breakdowns. Repeat for at least three students with different score patterns to rule out a coincidence.

Expected
The teacher's view shows the per-subject score, not the combined. The class average, top, bottom, and median in the Overview are likewise computed on the per-subject distribution. If the project shows both, the per-subject number must be the dominant one and the combined number clearly labelled. If the dominant number matches the combined score, that is a P0 — the teacher's entire report is computed on the wrong basis.

---

**B3 — A teacher who teaches two subjects in the same Grand Test sees both, side by side**

What this is
Some teachers cover multiple subjects (Maths + Physics is common at higher classes). When such a teacher opens a Grand Test that includes both their subjects, both must be visible — but Chemistry, which they don't teach, must still be filtered out. This tests that the filter is "teacher's assigned subjects" not "current page's subject".

What to try
Configure a teacher to own both Physics and Maths in the institute. Open the multi-subject Grand Test as that teacher. Switch between the two subjects (whatever the UI pattern is — chips, tabs, panels). Confirm Chemistry is nowhere visible. Compare the same exam loaded as a single-subject teacher to confirm consistency.

Expected
Both Physics and Maths content appears, either as side-by-side panels, a subject filter chip set, or a collapsible per-subject section — whatever the project's pattern is. Chemistry remains hidden across all sub-tabs. Switching between the two subjects does not bleed numbers from one into the other (Physics class average remains stable when you switch to Maths and back).

---

**B4 — A teacher whose subject is not in this Grand Test does not see the test at all**

What this is
If the institute publishes a Physics + Chemistry test to a batch that also has a Biology teacher, the Biology teacher's Exams tab must not list this test. Showing it as "no data for your subject" is worse than hiding it because it implies the teacher should be doing something.

What to try
Log in as a teacher whose subject is not in the published Grand Test. Open the Exams tab on the relevant batch. Then attempt direct-URL navigation to that exam's detail (guess the URL based on the format).

Expected
The test is absent from the list. Direct-URL navigation to that exam's detail returns a not-found or unauthorised state, never a partial render. If the route renders even an empty Overview, that is a P1 — the teacher is being told something they shouldn't see exists.

---

**B5 — A multi-batch Grand Test appears once per batch with each batch's own numbers**

What this is
The same institute Grand Test can be published to multiple batches. Each batch's report must be independent — averages, top scorers, and weak topics computed only on that batch's submissions. Mixing them produces meaningless aggregates and breaks per-batch teaching decisions.

What to try
Have the institute admin publish the same Grand Test to two of the teacher's batches. Open Exams on each batch in turn and compare the exam's row and detail screen. Note the class average and top scorer in each batch — they should differ if the rosters perform differently. Switch back and forth several times to confirm no caching mix-up.

Expected
The row appears in both batches. The numbers (class average, top scorer, distribution) differ between the two batches and are computed only from each batch's students. The exam name and date are identical; only the analytics differ. If the same average appears in both batches and matches neither's actual roster, that is a P0 cross-batch aggregation bug.

---

**B6 — Re-publishing the institute test to a new batch after results exist starts that batch clean**

What this is
If the admin publishes the same Grand Test to a third batch a week after the first results came in, the new batch should start with zero submissions, not inherit numbers from the original batches.

What to try
After results exist for batch A, have the admin publish the same test to batch B. Open both batches' reports for that exam. Wait a few minutes and reload to rule out a race condition.

Expected
Batch A's numbers are unchanged. Batch B shows an empty / pending state until its own students attempt the test. There is no cross-contamination. If batch B shows batch A's average on first load, that is a P0 leakage.

---

**B7 — A subject added to the institute test after results captured shows a sensible state for that subject's teacher**

What this is
Edge case: the admin originally published a Physics-only Grand Test, students completed it, and only later was Chemistry added to the test definition. The Chemistry teacher should not see fabricated data for that test.

What to try
If the project supports adding a subject to an already-conducted exam, do so. Then log in as the new subject's teacher and inspect the exam.

Expected
Either the test does not appear for the new subject's teacher (because no Chemistry questions were actually attempted), or it appears with a clear "no attempts in this subject" empty state. Under no circumstances are zeros, fabricated averages, or the other subject's numbers shown.

---

**B8 — Removing the teacher's subject assignment mid-cycle removes the institute test from their report**

What this is
If the institute admin reassigns the Physics teacher off this batch, the institute test row in that batch's Exams tab must disappear from the teacher's view immediately on next load. Stale visibility is a privacy bug.

What to try
Open the Exams tab as the Physics teacher and confirm the institute test is visible. Have the admin remove that teacher's Physics assignment for this batch. Refresh / re-navigate as the teacher.

Expected
The institute test row is gone. The batch may also disappear from the teacher's `/teacher/reports` list entirely if it was their only assignment to that batch. If the row persists for more than one refresh, capture the timing and the steps — there may be a stale-cache bug.

---

### C. Exam Detail — Overview Sub-tab

**C1 — The verdict card narrative matches the underlying numbers**

What this is
The Overview opens with a one-line verdict ("Class struggled with this exam — focus on chapters X and Y" or similar). If the verdict says "strong performance" but the average is 38%, teachers stop reading anything else on the page. The verdict is the most-trusted piece of text on the entire report.

What to try
Compare the verdict text against the class average, median, and the worst-performing chapters / questions visible on the same page. Do this on a strong-performance exam (everyone above 70%), a weak one (everyone below 40%), and a mixed one. Read the verdict literally and check whether every chapter / topic it mentions actually appears as a weak performer in the data below.

Expected
The verdict tone (positive, neutral, concerning) aligns with the actual numbers. The chapter or topic names mentioned in the verdict actually exist as the worst performers in the data below it. If the verdict mentions a chapter not in the exam, that is a P1 hallucination bug — capture the exam ID and the verdict text.

---

**C2 — Class average, median, top, and bottom scores are arithmetically correct**

What this is
These four numbers are the spine of the Overview. If any of them is wrong, every downstream insight inherits the error.

What to try
Pick a small exam (5–10 students) where you can manually compute the four values from the question-level results. Compare against the Overview card. Pay attention to whether absent students are excluded (correct) or counted as 0 (wrong, see H2-style bias).

Expected
Average matches the arithmetic mean of percentages. Median matches the middle value. Top and bottom are the actual highest and lowest scorers in this batch — not across batches, not including teachers, not excluding the absent unless that's the documented rule. If absent students are silently counted as 0, that pulls the average down and is a P1 — flag and clarify the rule.

---

**C3 — The trend arrow vs the previous comparable exam points the right way**

What this is
The verdict often shows an up/down arrow comparing this exam to the previous exam covering similar chapters. A wrong direction misleads the teacher into celebrating a regression or worrying about an improvement.

What to try
Find two consecutive exams covering the same chapter set with clearly different averages. Open the newer one and check the trend arrow. Then open the older one — there should be no arrow if it's the first in the chain (see C4).

Expected
Arrow points up if newer average is higher, down if lower, flat or hidden if there is no comparable previous exam. The percentage delta shown next to the arrow is the actual difference, not a hardcoded value.

---

**C4 — The first exam in a chapter set shows no trend arrow, not a misleading one**

What this is
If there is no prior exam to compare against, the trend arrow must be absent or explicitly labelled "first exam — no comparison". Defaulting to a flat or upward arrow invents data.

What to try
Find an exam that is the first to cover its particular chapter set in this batch (or simply the very first exam in a brand-new batch). Open Overview.

Expected
No arrow, or an explicit "no previous exam to compare" message. Class average and other primary numbers still render normally.

---

**C5 — The Overview lays out cleanly on a 320px-wide screen**

What this is
Teachers open reports on phones during walkrounds. A 320px screen is the lower bound — at this width, cards must stack, text must not overflow, and touch targets must remain ≥44px per the project's responsive standards.

What to try
Set the viewport to 320px and open the Overview of a fully-populated exam. Scroll the entire screen, top to bottom. Tap each interactive element. Pay attention to whether numbers wrap mid-digit ("avg 6\n5%") or whether a long verdict overflows its card.

Expected
No horizontal scroll. No clipped numbers. Cards stack vertically. Trend arrows and badges remain readable. Buttons and tap targets are still at least 44px tall. If any number wraps mid-digit or any card escapes the viewport, that is a P2 layout bug at minimum.

---

### D. Questions Sub-tab + Reteaching Plan

**D1 — Questions are sorted lowest success rate first**

What this is
The Questions tab exists so the teacher can find what to reteach. Worst-first sort is the only ordering that supports that purpose; alphabetical or original-order would force the teacher to scan everything before acting.

What to try
Open the Questions tab on a varied exam. Read the success rates from top to bottom and confirm they descend (worst at top, best at bottom). Refresh and reconfirm. If a sort toggle exists, switch to "by question number" and back to "by success" to verify the default returns.

Expected
The first question shown is the one fewest students got right. Order descends toward the question almost everyone solved. Ties are broken consistently between renders (no flicker on refresh). If the order changes between renders for tied questions, that is a P2 stability bug.

---

**D2 — Each question's option-level distractor breakdown is internally consistent**

What this is
When the question is expanded, the per-option breakdown should sum to the number of students who attempted, with the correct option clearly marked. If 30 students attempted and the four options sum to 28, somebody is being lost — and the teacher draws wrong conclusions about which distractor was most tempting.

What to try
Expand a few questions on an exam where you know the attempt count. Sum the per-option counts manually. Cross-check the correct-option marker against the answer key in the original exam. Try this on at least one MCQ, one multi-select, and one numeric-answer question if the exam has them.

Expected
Per-option counts sum exactly to attempted-student count. The correct option is visually marked (tick, colour, badge). "Did not attempt" students are reported separately and not double-counted into one of the options. If counts don't sum, capture the question ID and the student count diff.

---

**D3 — A question that no student attempted renders gracefully**

What this is
Maybe a sectional time-out meant nobody reached the last question. The row should render with an explicit "no attempts" state, not divide-by-zero into NaN% or hide the question entirely.

What to try
Find or seed an exam with a question that received zero attempts (a sectional cutoff or a paragraph question after a long passage works). Expand it and check the per-option breakdown.

Expected
The success rate shows "—" or "no attempts", not 0% (which would imply every attempter got it wrong). The option breakdown shows zeros across the board, the correct option is still marked, and the question text remains readable. If the row shows "0%" red without context, that is a P1 misleading-state bug.

---

**D4 — The Reteaching Plan card appears only when there are sub-50% questions**

What this is
If every question on the exam was answered well, there is nothing to reteach and the Reteaching Plan card should not render at all — its presence implies action is needed and would confuse teachers on strong exams.

What to try
Open an exam where every question is above 70% success — confirm the card is absent. Then open one with several questions below 50% — confirm the card appears. Check the threshold edge: a question at exactly 50%. Check the card's listed chapters/topics against the actual sub-50% questions.

Expected
Reteaching Plan card is absent on the strong exam, present on the weak one. The card lists the chapters and topics inferred from the weak questions, not all chapters in the exam. If a chapter appears on the card that has no sub-50% question, capture it — that's a P2 inference bug.

---

**D5 — "Generate Homework" from the Reteaching Plan prefills the dialog with the right topics**

What this is
The whole purpose of the Reteaching Plan is to launch a remediation homework with one tap. If the dialog opens with the wrong subject, batch, or topics, the teacher will assign irrelevant work — worse than offering nothing.

What to try
Tap "Generate Homework" on a Reteaching Plan card. Inspect every prefilled field in the dialog before changing anything: subject, batch, chapter, topics, difficulty, banner text. Repeat from at least two different Reteaching cards (different exams, different chapter mixes) to confirm the prefill differs correctly per source. Try also from a card that mentions multiple chapters — does the dialog let you select all of them?

Expected
Subject matches the teacher's subject. Batch matches the batch this exam belongs to. Chapters and topics match the weak items shown on the card. The dialog banner mentions the source exam by name. The teacher can override anything but should not have to. If the prefilled batch is a different one (e.g. the first batch in the teacher's list rather than the exam's batch), that is a P1 prefill drift — capture both batch IDs.

---

**D6 — Reteaching Plan reflects only the teacher's subject inside a multi-subject Grand Test**

What this is
Direct extension of B1: when the institute test mixes subjects, the Reteaching Plan must only consider questions from the current teacher's subject. Otherwise a Physics teacher gets prompted to reteach Chemistry topics.

What to try
Open a multi-subject Grand Test where both Physics and Chemistry have weak questions. Log in as the Physics teacher and open the Reteaching Plan card. Read every chapter and topic name on the card. Tap Generate Homework and inspect the dialog.

Expected
Only Physics chapters and topics appear on the card. Generating homework prefills with only Physics content. No Chemistry topic name is visible anywhere in the flow. If you see a Chemistry topic on the card or in the prefilled dialog, that is a P0 cross-subject leakage in the AI input — file with screenshot.

---

### E. Chapters Sub-tab

**E1 — Per-chapter success rate within the exam is computed on questions from this exam only**

What this is
The Chapters sub-tab shows how each chapter performed *within this single exam*. It must not pull in success data from other exams covering the same chapter — that's the Chapter Report's job.

What to try
Pick a chapter that appears in multiple exams. Compare the success rate on this exam's Chapters tab against the same chapter's overall rate on the Chapter Report (`/teacher/reports/:batchId/chapters/:chapterId`). Note both numbers and the exam IDs.

Expected
The two numbers are different (unless this is the only exam covering that chapter). The exam-level number is computed only from the questions of this exam tagged to that chapter. If they're identical despite multiple exams, that is a P1 — the exam-level view is leaking the all-time aggregate.

---

**E2 — A chapter that contributed only one question carries a "small sample" warning**

What this is
If a chapter is represented by a single question, its success rate is either 0% or 100% — statistically meaningless. Showing it without context invites teachers to act on noise and overhaul a chapter based on one question.

What to try
Find an exam where one chapter has just one question. Open the Chapters sub-tab. Note the visible question count for that chapter row.

Expected
The row either shows a small-sample indicator (e.g. "1 question only") next to the percentage, or it presents the count clearly enough that no teacher would mistake it for a robust signal. If the count is hidden entirely, that is a P2 — file a request to surface it.

---

**E3 — Cross-link from a chapter row to the Chapter Report preserves exam context for back navigation**

What this is
Tapping a chapter inside an exam should drill into the Chapter Report. Pressing back should return the teacher to this exam's Chapters tab, not to the batch root. Losing context here is one of the most common UX complaints.

What to try
From an exam's Chapters sub-tab, tap a chapter. From the Chapter Report, press the browser back button or the in-app back affordance. Inspect the URL on the Chapter Report page — there should be a `returnTo` or similar query param that encodes the exam-detail path.

Expected
Returns to the exact exam detail with the Chapters sub-tab still active and scroll position roughly preserved. If you land at the batch root or the Reports list, that is a P1 returnTo loss — capture the URLs at each step.

---

**E4 — Extreme-distribution chapters render correctly**

What this is
A chapter where every student got every question right (100%) and one where every student got every question wrong (0%) are both real outcomes. The colour, label, and ordering must handle both ends without breaking layout.

What to try
Find or seed an exam with one chapter at 100% success and one at 0%. Open the Chapters sub-tab and confirm both rows render.

Expected
Both rows render with appropriate colour treatment (strong green for 100%, deep red for 0%). The 100% row does not get hidden by a "needs attention only" filter unless that filter is explicitly active. The 0% row does not push other rows off-screen on narrow viewports.

---

### F. Difficulty Sub-tab

**F1 — The Easy / Medium / Hard mix is computed from the exam's actual question distribution**

What this is
The Difficulty bar tells the teacher whether this was a balanced exam or a skewed one. If the mix shown is hardcoded or pulled from a wrong source, every conclusion drawn from it is wrong.

What to try
Manually count the questions in each difficulty band on a small exam (use the Questions tab to count or check the original exam definition). Compare with the bar shown on the Difficulty sub-tab.

Expected
Counts match exactly. Percentages add to 100. The bar visually reflects the proportions, not equal thirds. If the bar shows 33/33/33 for an exam that's actually 60/30/10, the bar is decorative — file a P2.

---

**F2 — A difficulty bucket that has zero questions renders without breaking the layout**

What this is
An exam composed entirely of Medium and Hard questions has zero Easy. The bar should still render with the Easy segment collapsed, the Easy success-rate metric should show "—" not 0%, and the layout should not jump.

What to try
Find an exam missing one difficulty entirely. Open the sub-tab and check the bar, the metric labels, and the browser console.

Expected
Bar renders with two segments (no phantom thin third segment). The empty bucket's stats are explicitly absent or "—". No NaN, no division-by-zero error in the console.

---

**F3 — Anomalous patterns (Hard outperforming Medium) are visible, not silently smoothed**

What this is
If students did better on Hard than Medium it's almost always a flagging error or a miscalibrated question. The UI should not hide this — the teacher needs to see and investigate.

What to try
Find or seed an exam where Hard success rate exceeds Medium. Open the sub-tab.

Expected
The numbers display as-is. Bonus if the UI flags the inversion explicitly ("Hard outperformed Medium — review tagging"). Numbers are not reordered or reclamped to look monotonic.

---

**F4 — Difficulty data behaves consistently for AI-generated and question-bank-pulled exams**

What this is
AI-generated questions and question-bank questions both carry difficulty tags but through different code paths. The Difficulty sub-tab must work identically for both — a discrepancy here usually means one path is missing the tag.

What to try
Compare the Difficulty sub-tab on an exam built entirely from AI generation against one built entirely from the question bank.

Expected
Both render with all three buckets populated (assuming the questions cover the range). No untagged / unknown-difficulty bucket appears for the AI exam if the QB exam doesn't have one.

---

### G. AI Touchpoints — Actionable Insights & AI Deep-Dive

**G1 — Insight cards render with severity colours that match the severity of the finding**

What this is
Insights come with severity (concerning, watch, positive). The colour treatment must match — a concerning insight in a soft positive colour is worse than no insight at all because it gets ignored.

What to try
Open exams with mixed performance to surface a range of insight severities. Inspect each card's colour, icon, and tone. Compare two cards of the same severity from different exams to confirm the treatment is consistent.

Expected
Concerning insights use the project's warning/destructive treatment (red/amber border, alert icon). Positive insights use the success treatment (green). Watch-level uses a neutral/amber tone. The same severity yields the same treatment across cards. If a concerning insight appears in green, the teacher will scroll past it — that is a P1.

---

**G2 — "Take Action" launches the AI Homework Generator with correct prefill**

What this is
Each insight card has a "Take Action" CTA that should pre-populate the homework generator with the chapter, topics, batch, and a banner that references the insight. Drift here means the teacher assigns work disconnected from the insight that prompted it.

What to try
Tap "Take Action" on several different insight cards (at least three from different exams). Each time, inspect the dialog before changing anything. Pay attention to whether the topics are pre-selected (vs. the topic field being empty), whether the difficulty matches the band the insight implies (concerning → easier; positive → harder for stretch), and whether the banner text actually changes per card or shows a generic placeholder.

Expected
Subject = teacher's subject. Batch = current batch. Topics = topics named on the card. Banner text references the insight (e.g. "Generated from insight: students struggled with kinematics in Exam X"). Difficulty defaults to a sensible level for the band the insight implies. If the same generic banner appears for every card, that is a P2 prefill weakness; if the batch is wrong, that is a P1 prefill drift.

---

**G3 — When there are no findings, the Actionable Insights section degrades gracefully**

What this is
On a strong exam there may be nothing actionable. The section should either hide entirely or show a positive-toned empty state — never a literal "no insights" error or a permanently-loading shimmer.

What to try
Open the strongest exam in your seed (everyone scored above 80%). Look at the Insights region. Wait at least 30 seconds to confirm any spinner has resolved.

Expected
Either the entire section is absent, or a single positive card says something like "No interventions needed — class performed well." No spinner that never resolves, no error toast.

---

**G4 — AI Deep-Dive handles loading, error, and timeout states**

What this is
The AI Deep-Dive is an asynchronous call to the model with a 30-second abort. The user must always see one of three clear states: loading, success, or a recoverable error — never an indefinite spinner or a silent failure.

What to try
Open the Deep-Dive on a healthy exam (success path). Then disconnect the network (DevTools → Offline) and try again (error path). Then trigger an exam with so much data that the call risks timing out, or block the function URL specifically to force a 30s abort (timeout path). For each state, confirm the UI clearly tells the teacher what happened.

Expected
Loading shows a clear shimmer or spinner with a label like "Analysing exam…". Errors show a retryable message ("Could not analyse — retry?"). Timeouts surface as an explicit timeout message after roughly 30 seconds, with a retry option. The UI never gets stuck. If a spinner runs for more than 35 seconds with no resolution, that is a P1 abort-handling bug.

---

**G5 — Regenerate produces a fresh response, not a cached one**

What this is
If the teacher hits "Regenerate", they expect a new pass. If the cached response is returned, the button is misleading — and worse, it can mask a real issue with the underlying data.

What to try
Generate the Deep-Dive, note its phrasing (capture the first sentence verbatim), then hit Regenerate. Compare the new response.

Expected
The new response is genuinely re-computed (text differs, even slightly). If the system intentionally caches for cost reasons, that should be communicated to the user — silent caching while pretending to regenerate is a bug.

---

**G6 — Insights based on stale data refresh after a retest or new submission**

What this is
If a student re-submits or scores are corrected, the insights must recompute on next view. A stale insight ("3 students struggled with optics") that no longer matches the data is dangerous because the teacher trusts it.

What to try
Note the insights for an exam. Update the data (re-submit a student's attempt with very different answers, or have the institute admin correct a score). Reload the exam.

Expected
Insights regenerate or are explicitly marked stale with a "refresh insights" affordance. The numbers in the cards align with the current data, not the pre-update data.

---

**G7 — Insights for a multi-subject Grand Test are scoped to the teacher's subject only**

What this is
The third leg of the subject-leakage problem. Even if questions and chapters are correctly filtered, the AI prompt must also be scoped — otherwise the insight text says "students struggled with stoichiometry" on a Physics teacher's screen.

What to try
Open a multi-subject Grand Test as the Physics teacher. Read every insight card carefully. Open the Deep-Dive and read the full text. Use Find-on-Page (Cmd/Ctrl+F) to search for terms from other subjects ("chemistry", "stoichiometry", "calculus") to programmatically catch leakage.

Expected
No mention of any subject other than the teacher's. No chapter or topic from another subject. If the AI returns mixed-subject text, that is a P0 bug — capture the screenshot and the request payload from the network tab.

---

**G8 — Double-clicking "Take Action" or "Regenerate" does not trigger duplicate operations**

What this is
Network latency tempts users to double-tap. The dialog must open exactly once; the regenerate must fire exactly once; no duplicate homework should be created.

What to try
Throttle to Slow 3G. Rapid-double-tap "Take Action" on an insight card and watch for two dialogs stacking. Rapid-double-tap "Regenerate" on the Deep-Dive and watch the network tab for duplicate requests.

Expected
Single dialog opens. Single regenerate request fires. The button visually disables during the in-flight call so a second tap is a no-op. If you see two requests in the network tab even though only one toast appears, that is a P1 leak — the server may dedupe but the client is firing twice.

---

### H. Edge Cases, UI/UX & Stability

**H1 — An exam where every student scored 100% renders without breaking**

What this is
Edge case where the verdict, weak topics, and Reteaching Plan all have nothing to say. The page must still render every section appropriately rather than crash or blank-out.

What to try
Open or seed an exam with universal 100% scores. Inspect every sub-tab (Overview, Questions, Chapters, Difficulty). Confirm Reteaching Plan is absent and Insights show a positive empty state.

Expected
Overview shows "exceptional performance" verdict, no trend arrow misleading. Questions tab shows all green. Reteaching Plan is absent. Insights show a positive empty state. No NaN visible anywhere, no console errors.

---

**H2 — An exam with one submission renders without statistical artefacts**

What this is
With one submission, average = median = top = bottom. Trend arrows are meaningless. Distribution charts are points, not curves.

What to try
Find an exam where only one student has submitted. Open Overview and Questions. Look for any "n=1" notice and confirm distribution charts handle the single point.

Expected
Numbers show without divide-by-zero. The UI either notes "based on 1 submission" or simply shows the data without lying about distribution. No NaN visible anywhere. If the median is computed differently from the average for n=1, capture the discrepancy.

---

**H3 — Switching between Overview / Questions / Chapters / Difficulty preserves scroll within each sub-tab**

What this is
Teachers often scroll deep into Questions, jump to Chapters to cross-reference, then return. If scroll resets every time, the workflow breaks.

What to try
Scroll deep on the Questions sub-tab (10+ questions in). Switch to Chapters, scroll a bit, switch to Difficulty, then back to Questions.

Expected
Each sub-tab remembers its scroll position when revisited within the same session. (Acceptable alternative: each tab returns to the top consistently. The bug is *inconsistency* between tabs — Questions remembering and Chapters not.)

---

**H4 — Export / share on a long exam captures the full report, not just what's on screen**

What this is
If the export uses html2canvas-style off-screen rendering (per the project's export-and-sharing memory), it must include collapsed sections, off-screen chapters, and all questions — not just the rendered viewport.

What to try
Open the longest exam in your seed. Trigger the export / share. Open the resulting file (PDF or image) and scroll through every page.

Expected
Every section appears in the exported file in legible form. Long question lists are paginated or fully rendered. Charts render correctly. No clipped content at page boundaries. If only the visible viewport is captured, that is a P1 export bug.

---

**H5 — An exam spanning chapters not all assigned to this teacher hides the unassigned chapters**

What this is
If the teacher's chapter assignment changed mid-cycle, an old exam may include questions tagged to a chapter the teacher no longer owns. The teacher should see only the assigned chapters; unassigned ones drop out cleanly.

What to try
Have the admin reduce the teacher's chapter assignment after a multi-chapter exam was conducted. Open the Chapters sub-tab on that exam.

Expected
Only currently-assigned chapters appear. Numbers (averages, top, etc.) recompute on the assigned subset, or the exam shows a clear "partial view — some chapters reassigned" notice. No silent data loss.

---

**H6 — Rapid back-button navigation across exam → chapter → student → exam does not corrupt state**

What this is
Teachers drill aggressively. Rapid back/forward between deeply linked screens has historically caused state cleanup bugs (stale dialogs, lingering loaders, doubled API calls).

What to try
From an exam, drill to a chapter, then to a student from there, then back twice rapidly. Repeat with several different starting exams in quick succession. Watch the network tab for orphaned requests.

Expected
Each screen renders cleanly each time. No leftover dialogs, no doubled spinners, no console errors. URLs reflect the actual screen at each step. If a dialog from a previous screen reappears on the next, that is a P1 cleanup bug.

---

**H7 — A long exam name does not break card layouts**

What this is
A teacher might name an exam with a 100-character title. Cards in the Exams tab and headers on the detail screen must truncate gracefully, not push other content off-screen.

What to try
Create an exam with an unusually long name (or rename one). View the Exams tab card and the detail header on desktop and at 320px.

Expected
Name truncates with ellipsis, full name available on hover or tap. Card layout is unchanged. The detail header wraps to at most two lines and remains readable on 320px.

---

**H8 — Numbers do not change between renders**

What this is
Per the project's data-stability memory, mock data is generated through a seeded PRNG so numbers are stable across reloads. If a class average shifts from 62% to 67% on refresh with no underlying change, it's a P0 stability regression.

What to try
Open an exam, note every number on Overview. Refresh 3–5 times. Note again. Then close the tab, reopen the URL, and recheck.

Expected
Every number is identical across reloads. Same applies to insight phrasing and order, weak topic ranking, and AI Deep-Dive content unless explicitly regenerated. Any drift on refresh is a P0.

---

**H9 — A draft or scheduled exam directly URL-accessed does not render Overview as if it had results**

What this is
A teacher pasting a URL or following a stale link to a not-yet-completed exam should hit a sensible empty/awaiting state, not a fabricated zero-everything Overview.

What to try
Take the URL of a completed exam and substitute the ID with that of a draft / scheduled exam. Navigate.

Expected
An empty / awaiting state appears with a clear message ("This exam hasn't been conducted yet"). No zero-filled charts, no fake verdict.

---

**H10 — Closing and reopening the AI Homework dialog mid-edit does not lose unsaved selections**

What this is
If a teacher tweaks topics in the prefilled dialog, then accidentally taps outside, reopening should preserve their edits — or warn them that closing will lose progress.

What to try
Open the dialog from "Take Action". Modify the topics (add or remove some). Tap outside / press escape. Reopen the same dialog from the same insight card.

Expected
Either changes are preserved, or a confirm-discard prompt appeared on close. Silent loss of edits is a P2 bug — file with the steps to reproduce.

---

## Wrap-up

Once every scenario in this document passes (or every failure has a logged ticket), the Exams cycle is signed off. Move on to the **Students QA** cycle, which extends these patterns to per-student reports, mastery grids, and cross-subject risk tracking. Pay particular attention to the prefill-drift bugs from this cycle — they manifest in further entry points on the Student profile.
