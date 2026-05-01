# Teacher Reports — Chapters QA

> This document is for testers validating the **Chapters tab** of the Teacher Reports module: how chapter-wise performance is summarised, how the topic heatmap and student buckets behave under varied data, and how the practice-generation flow connects back into the report. Reports are the most data-sensitive part of the teacher portal — a wrong number here causes a teacher to mis-target a real student. Approach this as exploratory hunting for *silently wrong* values, not just for crashes.

---

## Before You Begin — Seed Your Data First

You cannot meaningfully test reports against an empty institute. Reports come alive only when there is enough variation in student performance to make the visualisations differentiate. Before you start, log in as the **Institute admin** (and possibly as students) and seed roughly the following shape of data. The exact numbers don't matter — the *variation* does.

- **At least two batches** assigned to the teacher you'll log in as. Make one a relatively strong batch and the other a weaker one. The point is to confirm the same UI behaves correctly when the underlying numbers swing in opposite directions — empty buckets in one, overflowing buckets in the other.
- **A roster of about 25–30 students per batch.** Anything smaller and the four PI bands (Mastery / Stable / Reinforcement / Foundational Risk) won't have enough students to split into meaningful groups. If you only have five students, every band will look broken even when the logic is correct.
- **At least four to five chapters taught**, with deliberate variety:
  - one chapter where most students score well (to test the "all green" heatmap state),
  - one where most students struggle (to test the "all red" state and bucket overflow),
  - one with very few attempts (sparse-data behaviour),
  - one that has never appeared in any exam yet (zero-data / empty state).
- **Six to ten completed exams** spread across recent dates, mixing Quick Tests and at least one Grand Test or Institute Test on the teacher's subject. Date variation is what powers the trend arrows; if all exams are on the same day, you cannot validate "improving / declining / stable".
- **At least one practice assignment generated for each band** in one chapter, so the Chapter Practice History section has something to render and you can validate ordering and counts.

You are not building toy data. You are building the conditions under which real bugs surface — empty states, single-student bands, every-student-passed chapters, chapters that were renamed after exams referenced them. If your seed looks too clean, your test will miss everything that breaks in production.

If, while seeding, something feels off (a teacher missing from a batch they should be in, a chapter not appearing under the right curriculum), pause and fix it before testing. Reports bugs and master-data bugs look identical from the report UI, and you will waste hours chasing the wrong root cause.

---

## Highest-Risk Bugs to Hunt

Keep an eye on these throughout — they are the failures that have hurt before:

1. **Numbers change on refresh.** Mock data is supposed to be deterministic via a seeded PRNG. If a chapter's success rate is 47% on first load and 52% after refresh with no underlying change, that is a P0 stability bug.
2. **Bucket counts that do not sum to the roster.** If the four bands together show 33 students but the batch has 30, somebody is being double-counted or invented.
3. **Stale numbers after generating practice.** Generating a new practice assignment must not silently update the chapter's success rate (practice is not exam data) — but the Practice History row must appear immediately.
4. **`returnTo` lost when drilling two levels deep.** Chapter → Exam → back should land you in Chapter, not at the batch root.
5. **Heatmap colour flipping at a threshold.** A topic at exactly 50% should land in one tier consistently — never amber on one render and teal on another.

---

## Test Scenarios

### A. Chapters Tab Listing & Sorting

**A1 — A batch with no exams yet shows a meaningful empty state**

What this is
The first time a teacher opens a brand-new batch, there is no chapter data. The empty state is the user's first impression of reports — it must explain what's happening rather than look broken.

What to try
Create a fresh batch with students enrolled but no exams yet conducted. Open it from `/teacher/reports`. Switch between the three tabs.

Expected
The Chapters tab shows a clear "no chapters yet — conduct an exam to populate" style message, not a blank panel or a spinner that never resolves. The page does not throw a console error, and Today's Focus / Batch Health card either hides itself or shows an empty-friendly variant.

---

**A2 — Chapters are ordered worst-first by default**

What this is
Per the project's reports philosophy, teachers should see what needs attention before what is going well. If the order is alphabetical or random, the most important chapters can hide three scrolls down.

What to try
Open a batch where chapters have a clear performance spread (some near 30%, some near 80%). Note the visual order top-to-bottom.

Expected
The chapter with the lowest overall success rate appears first; the order descends to the strongest chapter at the bottom. Re-sorting (if the UI offers it) and coming back should restore the worst-first default.

---

**A3 — Chapters with zero attempts still appear and are clearly marked**

What this is
A chapter that's been taught but never tested is still part of the curriculum — hiding it makes the teacher think they've covered everything. But if it shows "0%" without context, it looks like a catastrophic failure.

What to try
Identify a chapter in your seed data that has not been part of any exam yet. Confirm it is in the chapter list.

Expected
The row appears with an explicit "no attempts yet" or "—" indicator rather than 0%. Sorting does not push it to either extreme as if it were a real 0%; it should be visually distinct from a chapter that students genuinely failed.

---

**A4 — Very long chapter names do not break the row layout**

What this is
Real curriculum chapter names get long ("Some Applications of Trigonometry — Heights and Distances"). If the name overflows, it can push metrics off-screen on mobile.

What to try
Find or create a chapter with a 60+ character name. Open the Chapters tab on desktop, then on a 320px viewport.

Expected
The name truncates with ellipsis or wraps cleanly without pushing the success rate, exam count, or trend indicator out of view. Tapping the truncated name still navigates to the right chapter.

---

**A5 — A teacher with multiple subjects sees the right chapters per batch**

What this is
Teachers can be assigned more than one subject (e.g. Physics + Chemistry). A batch that takes both subjects must show chapters from both, but a batch that takes only one must not pull in unrelated chapters.

What to try
Use a teacher login assigned to two subjects. Open a batch that has both subjects, then a batch that has only one.

Expected
The first batch lists chapters from both subjects clearly grouped or labelled. The second batch lists chapters only from the relevant subject. No chapter from a subject the teacher does not teach in that batch should appear.

---

### B. Chapter Overview Banner

**B1 — Overall success rate is consistent across mixed exam types**

What this is
The overview banner aggregates results from Quick Tests, Grand Tests, and Institute Tests. The aggregation rule (per question? per exam? weighted?) must be applied uniformly or the headline number is misleading.

What to try
Open a chapter that has been examined in at least two different exam types. Manually sanity-check the displayed success rate against the per-exam numbers in the Exam Breakdown section below.

Expected
The headline rate is internally consistent with the breakdown — within rounding tolerance. The same chapter opened a second time gives the same number.

---

**B2 — Exams Covering count handles a chapter examined twice in one paper**

What this is
If an exam includes two different question sets both tagged to the same chapter, the chapter should still count that exam as one — not two.

What to try
Construct (or find) an exam that covers the same chapter in two separate sections. Open the chapter overview.

Expected
The "Exams Covering" count increments by one for that exam, not by two. The total questions asked, however, *does* include all questions from both sections.

---

**B3 — Total Questions Asked counts each occurrence, not each unique question**

What this is
If a question from the bank is reused in two exams, each appearance is a separate testing event for the chapter. Deduplicating would understate how often the chapter has been tested.

What to try
Find a question that has been asked in two different exams. Verify the chapter's total question count.

Expected
Both occurrences are counted. The number matches the sum of question counts across all exams covering the chapter.

---

**B4 — A chapter with only one exam shows the banner cleanly**

What this is
Trends and aggregates degrade gracefully when there is only one data point. With a single exam, there is no "previous" to compare against.

What to try
Open a chapter that has been part of exactly one exam.

Expected
The success rate shows that one exam's number. The trend arrow is hidden, shows "—", or explicitly says "first exam" — never an arbitrary up or down arrow.

---

### C. Topic Heatmap

**C1 — Colour tier boundaries behave deterministically at the threshold**

What this is
The 4-tier colour standard uses 75 / 50 / 35 as cutoffs. A topic at *exactly* 50% must always render the same colour — never flip between teal and amber.

What to try
Either seed or find topics with success rates exactly on the boundaries (75, 50, 35). Refresh the page several times and compare colours.

Expected
A topic at 75% always renders emerald, at 50% always teal, at 35% always amber. The boundary rule (≥ vs >) is consistent and matches the documented spec.

---

**C2 — A topic with zero questions asked is visually distinct from a topic with 0% success**

What this is
"Never tested" and "tested and everyone failed" are completely different teaching signals. Showing both as red would mislead the teacher into intervening on a topic that has not yet been measured.

What to try
Find a topic that has not appeared in any exam yet within a chapter that has been examined.

Expected
The topic tile renders in a neutral / grey state with a "no data" indicator, not in any of the four performance colours. Tapping it does not lead to a broken drill-down.

---

**C3 — Long topic names do not overflow tiles**

What this is
Topic names like "Conservation of Linear Momentum and its Applications" need to fit in a small tile.

What to try
Inspect the heatmap on a chapter whose topics include long names, on both desktop and 320px viewports.

Expected
Names truncate or wrap inside the tile. The success rate is still visible. Hovering or tapping reveals the full name.

---

**C4 — Heatmap density remains readable at 320px**

What this is
Mobile-first is a project standard. A heatmap that needs horizontal scrolling at 320px is a UX failure.

What to try
Open a chapter with 12+ topics on a 320px viewport.

Expected
Tiles reflow into a grid that fits the viewport. No horizontal scroll. Tap targets remain at least 44px tall.

---

**C5 — All-green and all-red heatmaps both render gracefully**

What this is
Edge distributions test that no logic assumes a "spread" of colours.

What to try
Open a chapter where every topic is above 75%, then one where every topic is below 35%.

Expected
Both render without empty rows, layout collapse, or "no data" placeholders mistakenly appearing. The chapter overview banner still shows a valid headline number.

---

**C6 — Tapping a topic tile drills into the right context**

What this is
The heatmap is a visual index — its only job after showing colour is to take the teacher to the underlying questions or students.

What to try
Tap a topic tile. Note where it lands. Hit back and confirm you return to the chapter, scrolled to the heatmap.

Expected
You arrive at a topic-scoped drill-down (questions list or weak-students list, per design). Back returns to the chapter and ideally restores scroll position. The URL changes are clean, no double-encoded params.

---

### D. Student Buckets & PI Bucketing

**D1 — Default expand/collapse matches band severity**

What this is
Per project spec, the two attention-needing bands (Reinforcement Needed, Foundational Risk) open by default, while the two healthy bands (Stable, Mastery) collapse. This guides the teacher's eye to where intervention is needed.

What to try
Open a chapter for a batch with students in all four bands.

Expected
Reinforcement and Foundational Risk are expanded showing student lists. Stable and Mastery are collapsed showing only counts. Manually expanding Mastery and refreshing the page brings the default state back.

---

**D2 — A bucket with a single student renders cleanly**

What this is
List components often assume "many" — a single-row state can break alignment or hide CTAs.

What to try
Find a chapter where exactly one student falls into a given band.

Expected
The single student's row is correctly displayed. The "Generate Homework" CTA for that band still works and pre-fills with that one student in scope.

---

**D3 — An empty bucket renders without breaking the layout**

What this is
If no student is in Foundational Risk on a strong chapter, the section should not collapse the page or show a broken heading.

What to try
Open a chapter where every student is in Mastery.

Expected
The empty bands either hide gracefully or show an explicit "no students in this band" message. The page does not push other content up incorrectly.

---

**D4 — A band containing every student still calculates correctly**

What this is
The inverse of D3 — an entire batch in Foundational Risk on a brutal chapter.

What to try
Open a chapter where the success rate is below 30% for almost everyone.

Expected
Foundational Risk shows the full roster. Other bands show empty / hidden. Generate Homework from this band scopes to the entire batch correctly.

---

**D5 — Two students with identical PI break ties deterministically**

What this is
If sort order changes between page loads when two students tie, the teacher will think the data is unstable.

What to try
Find or seed two students with the same approximate PI in the same band. Refresh the chapter several times.

Expected
The relative order of the two tied students stays the same across refreshes (likely tie-broken by name, ID, or roll number — but consistently).

---

**D6 — A student with zero attempts in this chapter is handled explicitly**

What this is
If a student joined the batch after the only exam covering this chapter, they have no data for it. Showing them as Foundational Risk is wrong — they have not been measured.

What to try
Add a new student to a batch and immediately open a chapter that has been examined before they joined.

Expected
The student either does not appear in any band, or appears in a clearly-marked "no data yet" segment — never as red-bucketed Foundational Risk based on absence.

---

**D7 — A student who transferred mid-cycle does not corrupt counts**

What this is
Roster changes are common in real institutes. Bucketing must reflect the *current* roster, not historical exam respondents who have left.

What to try
Remove a student from the batch (transfer them out). Reopen the chapter.

Expected
The transferred student no longer appears in any band. Bucket counts sum to the *current* roster size, not the old one. Their old attempts may still influence chapter-level success rate (this is a product decision worth flagging if unclear).

---

### E. Generate Practice — The 3-Step Wizard

**E1 — Wizard opens from each band's CTA with correct prefill**

What this is
The CTA is band-specific. Opening the wizard from Reinforcement should propose a different difficulty than from Mastery. If they all prefill identically, the band-aware UX is broken.

What to try
Open the wizard once from each band's "Generate Homework" button.

Expected
Chapter is prefilled in all cases. Difficulty defaults differ — easier for Foundational Risk, harder for Mastery. The student scope shows the band's roster, not the whole class.

---

**E2 — Weak topics are pre-selected based on the band's actual weakness**

What this is
The wizard should save the teacher a step by pre-selecting topics where the band performs worst.

What to try
Open the wizard from Reinforcement. Note the pre-selected topics. Cross-check against the heatmap.

Expected
Selected topics correspond to the lowest-performing topics for students in that band — not the chapter's overall weak topics.

---

**E3 — Switching difficulty mid-wizard updates downstream steps**

What this is
If the teacher overrides the suggested difficulty, the question count or distribution preview should update.

What to try
Start with the suggested difficulty. On step 2 or 3, switch to a different difficulty. Continue.

Expected
The preview / count updates. No stale numbers from the original difficulty leak through. Going back to step 1 still shows your override, not the original suggestion.

---

**E4 — Generating with zero weak topics produces a sensible default**

What this is
If the band has no weak topics (everyone aced everything), what does the wizard do?

What to try
Open the wizard from a band where the suggested-topics list is empty.

Expected
Either the wizard prompts the teacher to manually pick topics, or it defaults to a balanced sample across all chapter topics. It must not generate an empty homework or crash.

---

**E5 — Assigning to a band with zero students is blocked or warned**

What this is
Generating practice for an empty band wastes AI cost and creates an orphaned homework.

What to try
Try to launch the wizard from an empty band's CTA (if visible).

Expected
Either the CTA is disabled / hidden when the band is empty, or the wizard warns the teacher before generating.

---

**E6 — Navigating back inside the wizard preserves state**

What this is
If the teacher refines on step 2 then goes back to step 1 to change a topic, their step-2 selections should not silently reset.

What to try
Move forward to step 2, set a non-default option, click Back to step 1, then forward again.

Expected
Step 2's state is preserved. Only fields directly invalidated by a step 1 change should reset.

---

**E7 — Double-clicking Generate does not produce two assignments**

What this is
Network latency makes double-click a real concern. Two practice assignments for the same scope is a duplication bug.

What to try
On the final step, click Generate twice in quick succession.

Expected
Only one practice assignment is created. The second click is either ignored, debounced, or shows a "generating…" lock.

---

**E8 — Long generation latency or aborted call is handled**

What this is
AI generation can take 20–30 seconds. The UI must not look frozen, and a network failure must not leave a half-created practice.

What to try
Throttle your network in DevTools and trigger a generation. Optionally cancel the request mid-flight.

Expected
A loading state is visible (spinner, progress text). On abort or failure, the user gets an error toast and no orphan record appears in Practice History.

---

### F. Chapter Practice History

**F1 — A newly-generated practice appears immediately**

What this is
If the teacher generates and then has to refresh to see their own creation, they will think it failed.

What to try
Generate a practice from the wizard. Without manual refresh, look at the Practice History section on the chapter page.

Expected
The new practice row is at the top of the list within a second or two. The count badge (if shown) increments.

---

**F2 — Sessions are ordered most-recent first**

What this is
Recency matters more than alphabetical or band order in practice history.

What to try
Generate three practices a few minutes apart, possibly across bands.

Expected
Newest at the top. Order remains correct after a refresh.

---

**F3 — A session with zero student attempts shows clearly**

What this is
Just-generated practices have no attempts yet. The row should not show "0% success" as if students tried and failed.

What to try
Look at the row of the practice you just generated, before any student opens it.

Expected
The row shows "not yet attempted" or "0 / N submitted" rather than a misleading 0% success rate.

---

**F4 — A session whose chapter was renamed in master data still resolves**

What this is
Master data can change. A practice generated last month against "Light — Reflection" should still be findable if the chapter is now "Reflection of Light".

What to try
After generating a practice, ask the institute admin to rename the underlying chapter. Reopen the chapter report.

Expected
The practice still appears. The chapter name shown in the row matches the current name (not the historical one), or there is a clear note about the rename.

---

**F5 — Deleting a practice removes it everywhere it was counted**

What this is
If deletion is supported, count badges and roll-ups must update consistently.

What to try
Delete a practice (if the action is exposed). Check Practice History, the band's CTA badge, and the student profile of an assigned student.

Expected
The row disappears from history. Counts decrement consistently across the chapter, band, and any student profile that referenced it.

---

### G. Chapter Exam Breakdown & Cross-Navigation

**G1 — Drilling from an exam row preserves return context**

What this is
`returnTo` is the small contract that makes deep navigation feel coherent. If it breaks, the teacher loses their place after every drill.

What to try
From a chapter, click into an exam row. From the exam detail, hit the back button or breadcrumb.

Expected
You return to the same chapter, scrolled to the Exam Breakdown section. The URL on the way in carried a `returnTo` param; the way back honoured it.

---

**G2 — An exam from a different subject must not appear here**

What this is
If the chapter is Physics and a Chemistry exam is somehow listed, it points to a tagging or scoping bug.

What to try
Scan the Exam Breakdown rows. Confirm every listed exam is from the same subject as the chapter.

Expected
No cross-subject exams. If a Grand Test covers multiple subjects but includes this chapter for the right subject, it appears with the correct subject context.

---

**G3 — An exam un-published after results were captured behaves predictably**

What this is
Once results exist, un-publishing the exam should not erase historical analytics. But the teacher should know its current status.

What to try
Have the institute admin unpublish an exam that already has student responses. Reload the chapter.

Expected
The exam still contributes to chapter analytics historically, but is visually marked as "unpublished" or otherwise distinguished from active exams.

---

**G4 — Institute test rows are visually distinct (violet/purple)**

What this is
Per project standards, institute-created tests use a violet/purple visual cue so teachers can immediately tell what is theirs versus what came from the institute.

What to try
Find a chapter with both teacher-created and institute-created exams in its breakdown.

Expected
Institute test rows are clearly tinted violet/purple. Teacher exams use the standard styling. The distinction holds on both desktop and mobile.

---

**G5 — Sorting by date vs by average works and persists during the visit**

What this is
Teachers sometimes want chronology, sometimes severity. The sort state should not flicker between the two.

What to try
Toggle the sort. Navigate away to the exam detail and back.

Expected
The sort selection is preserved during the navigation. Refreshing the page may reset to the worst-first default — that is acceptable as long as it is consistent.

---

### H. Edge Cases, Curriculum Boundaries & Stability

**H1 — The same chapter under two curriculums shows the right curriculum context**

What this is
"Physics — Optics" exists in CBSE Class 10 and in JEE Main. They are different chapters with different topics. Conflating them in the UI would cause major teaching errors.

What to try
Use a teacher who teaches both a CBSE batch and a JEE batch. Open the same-named chapter in each batch's report.

Expected
Each chapter shows its own topics, exams, and student data — no leakage. The breadcrumb or header makes the curriculum context clear.

---

**H2 — A chapter removed from master data after exams reference it does not crash**

What this is
Master-data deletes are rare but real. Historical data must remain readable.

What to try
Have the institute admin remove or deactivate a chapter that already has exam history. Reload the chapter report (you may need to navigate via the exam if direct access is blocked).

Expected
The page either redirects gracefully with a clear "chapter no longer available" message, or renders the historical data with an explicit deprecation banner. No infinite spinner, no console crash.

---

**H3 — Page refresh produces identical numbers (deterministic mock data)**

What this is
The mock data layer is meant to be seeded so a tester sees consistent values. If numbers drift on refresh, no tester can verify anything else reliably.

What to try
Note three numbers on the chapter page (overall success rate, a specific topic's percentage, a band count). Refresh the page five times.

Expected
All three numbers are identical across all refreshes. If any of them changes, that is a P0 stability bug — flag it before continuing other tests.

---

**H4 — Rapid tab switching between Chapters / Exams / Students does not corrupt state**

What this is
If the teacher flips quickly between tabs, in-flight async loads can settle into the wrong tab and overwrite its data.

What to try
On a slow network, click Chapters → Exams → Students → Chapters in quick succession.

Expected
Each tab eventually shows its correct data. No tab ends up showing another tab's content. No stale spinner persists after the data has loaded.

---

**H5 — Chapter detail at 320px is fully usable**

What this is
Mobile is the primary support target per project standards. The chapter detail is dense, so this is where layout breaks first.

What to try
Open a chapter with all sections populated — heatmap, all four bands, practice history, exam breakdown — on a 320px viewport.

Expected
No horizontal scroll. All CTAs (Generate Homework per band, Generate Practice) are reachable with one thumb. Touch targets are at least 44px. Sticky headers, if any, do not eat more than 15% of viewport height.

---

*This document covers the Chapters tab only. See `teacher-reports-exams-qa.md` for the Exams cycle and `teacher-reports-students-qa.md` for the Students cycle.*