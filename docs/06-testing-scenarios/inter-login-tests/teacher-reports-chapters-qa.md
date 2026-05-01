# Teacher Reports — Chapters QA

> This document is for testers validating the **Chapters tab** of the Teacher Reports module: how chapter-wise performance is summarised, how the topic heatmap and student buckets behave under varied data, and how the **Generate Homework** flow (a full-page 3-step experience at `/teacher/reports/:batchId/chapters/:chapterId/practice`) connects back into the report. Reports are the most data-sensitive part of the teacher portal — a wrong number here causes a teacher to mis-target a real student. Approach this as exploratory hunting for *silently wrong* values, not just for crashes. Read every scenario in full before you start clicking; the value of this cycle is in noticing what does *not* match the description, and that requires you to know what the description actually claims.

## Threshold Reference (read before filing any color bug)

There are currently **three** color-threshold scales in the Teacher Reports module. Knowing which is canonical prevents misfiled bugs.

| Scale | Used by | Source of truth |
|---|---|---|
| **75 / 50 / 35** | Chapter detail, Topic Heatmap, Student Buckets, Today's Focus topic & student rows | `src/lib/reportColors.ts` — **canonical** |
| 65 / 40 / 35 | `Reports.tsx` landing tile (`classAverage` color), `StudentReport.tsx` Chapter Mastery tooltip copy | UI-side hard-codes — **bugs to file against the UI** |
| Pass/fail bands | Exam pass% badges, "at risk" PI < 35 | Matches canonical |

**Rule for testers:** if a tile or row uses a threshold other than 75/50/35, file the discrepancy as a P2 UI bug pointing at the file in column 2, *not* as a data bug. Do not "fix" the test plan to match the UI.

---

## Before You Begin — Seed Your Data First

You cannot meaningfully test reports against an empty institute. Reports come alive only when there is enough variation in student performance to make the visualisations differentiate. Before you start, log in as the **Institute admin** (and possibly as students) and seed roughly the following shape of data. The exact numbers don't matter — the *variation* does.

- **At least two batches** assigned to the teacher you'll log in as. Make one a relatively strong batch (most students above 65%) and the other a weaker one (most students below 50%). The point is to confirm the same UI behaves correctly when the underlying numbers swing in opposite directions — empty buckets in one, overflowing buckets in the other. If both batches look the same, you are only testing one shape of data.
- **A roster of about 25–30 students per batch.** Anything smaller and the four PI bands (Mastery / Stable / Reinforcement / At Risk) won't have enough students to split into meaningful groups. If you only have five students, every band will look broken even when the logic is correct, and you'll waste hours filing false positives.
- **At least four to five chapters taught**, with deliberate variety:
  - one chapter where most students score well (to test the "all green" heatmap state and a near-empty At Risk band),
  - one where most students struggle (to test the "all red" state and bucket overflow on At Risk),
  - one with very few attempts (sparse-data behaviour — seeding 2–3 students who took it),
  - one that has never appeared in any exam yet (zero-data / empty state — must not pretend to be 0%).
- **Six to ten completed exams** spread across recent dates, mixing Quick Tests and at least one Grand Test or Institute Test on the teacher's subject. Date variation is what powers the trend arrows; if all exams are on the same day, you cannot validate "improving / declining / stable". Aim for at least one exam in the last 7 days, one 2–4 weeks old, and one over a month old.
- **At least one practice assignment generated for each band** in one chapter, so the Chapter Practice History section has something to render and you can validate ordering and counts. If you have never generated practice before, do an exploratory dry-run from the chapter you'll be testing first, just to confirm the flow lands somewhere visible.

You are not building toy data. You are building the conditions under which real bugs surface — empty states, single-student bands, every-student-passed chapters, chapters that were renamed after exams referenced them. If your seed looks too clean, your test will miss everything that breaks in production.

If, while seeding, something feels off (a teacher missing from a batch they should be in, a chapter not appearing under the right curriculum), pause and fix it before testing. Reports bugs and master-data bugs look identical from the report UI, and you will waste hours chasing the wrong root cause.

---

## Highest-Risk Bugs to Hunt

Keep an eye on these throughout — they are the failures that have hurt before, and the ones most likely to embarrass the product if shipped:

1. **Numbers change on refresh.** Mock data is supposed to be deterministic via a seeded PRNG. If a chapter's success rate is 47% on first load and 52% after refresh with no underlying change, that is a P0 stability bug. Capture screenshots before/after and the chapter URL.
2. **Bucket counts that do not sum to the roster.** If the four bands together show 33 students but the batch has 30, somebody is being double-counted or invented. Note the batch student count visible on the batch summary tile and add up the band counts manually — a calculator is faster than trusting your eye.
3. **Stale numbers after generating practice.** Generating a new practice assignment must not silently update the chapter's success rate (practice is not exam data) — but the **Chapter Practice History** row must appear immediately on return to the chapter page.
4. **`returnTo` lost when drilling two levels deep.** Chapter → Exam → back should land you in Chapter, not at the batch root. Three-level drills (Batch → Chapter → Exam → Chapter again via cross-link) are where this most often breaks.
5. **Heatmap colour flipping at a threshold.** A topic at exactly 75%, 50%, or 35% should land in one tier consistently — never green on one render and teal on another. The code thresholds are documented in `src/lib/reportColors.ts` (≥75 emerald, ≥50 teal, ≥35 amber, <35 red); if a tooltip in the UI says something different, **trust the code, file the tooltip**.

---

## Test Scenarios

### A. Chapters Tab Listing & Sorting

**A1 — A batch with no exams yet shows a meaningful empty state**

What this is
The first time a teacher opens a brand-new batch, there is no chapter data. The empty state is the user's first impression of reports — it must explain what's happening rather than look broken. A blank panel or a perpetual spinner makes a teacher think the system is down and they will stop trusting it for the rest of the term.

What to try
Have the institute admin create a fresh batch with 5–10 students enrolled but **zero** exams yet. Open it from `/teacher/reports`. Switch through all three tabs (Chapters, Exams, Students) once, then back. Also try this on a slow network (DevTools → Network → Slow 3G) to confirm the empty state is the *final* state, not a transient one mid-load. Check the browser console while you do this.

Expected
The Chapters tab shows a clear "no chapters yet — conduct an exam to populate" style message with a visible icon, not a blank panel or a spinner that never resolves. The page does not throw any console error or warning. Today's Focus / Batch Health card either hides itself or shows an empty-friendly variant. If you see a permanent spinner, that is a P1 stuck-state bug; if you see a "0 chapters" badge but no helper copy, that is a P2 affordance bug — file each separately.

---

**A2 — Chapters are ordered worst-first by default**

What this is
Per the project's reports philosophy, teachers should see what needs attention before what is going well. If the order is alphabetical or random, the most important chapters can hide three scrolls down on a 320px screen and the teacher will never act on them. This is the single most important sort decision in the entire reports module.

What to try
Open a batch where chapters have a clear performance spread (some near 30%, some near 80%). Note the visual order top-to-bottom and write down the success rates of the first three rows. Refresh the page and confirm the order is identical. If a sort control is exposed, change it to alphabetical, navigate to a chapter detail and back, and confirm the default returns. Compare the same batch on desktop (1102px+) and 320px to ensure mobile hasn't quietly changed the sort to fit.

Expected
The chapter with the lowest overall success rate appears first; the order descends to the strongest chapter at the bottom. Tied chapters break in a stable way — refreshing must not swap their order. If you see chapters appearing in alphabetical order on mobile but worst-first on desktop, that is a P1 inconsistency. If sorting persists across navigation when you didn't expect it to, decide with the product owner whether that is intentional before filing.

---

**A3 — Chapters with zero attempts still appear and are clearly marked**

What this is
A chapter that's been taught but never tested is still part of the curriculum — hiding it makes the teacher think they've covered everything. But if it shows "0%" without context, it looks like a catastrophic failure, and the teacher will panic-reteach a chapter the class never even attempted.

What to try
Identify (or seed) a chapter in the curriculum that has been taught but never been part of any exam. Confirm it appears in the chapter list. Compare its visual treatment side-by-side with a chapter where students genuinely scored 0–10%. Try sorting by performance and check where the zero-attempt chapter lands — at the bottom? At the top? Filtered out?

Expected
The row appears with an explicit "no attempts yet" or em-dash ("—") indicator rather than 0%. It is visually distinct (different colour band, italics, badge — pick one and confirm consistency) from a chapter that students genuinely failed. Sorting does not push it to either extreme as if it were a real 0%; ideally it sits in a separate "untested" group at the bottom. If the row shows 0% with red colouring, that is a P1 — the teacher will misread it as a crisis.

---

**A4 — Very long chapter names do not break the row layout**

What this is
Real curriculum chapter names get long ("Some Applications of Trigonometry — Heights and Distances" is real). If the name overflows, it can push metrics off-screen on mobile or wrap the success rate badge to a second line in a way that makes scanning the list impossible.

What to try
Find or have the institute admin create a chapter with a 60+ character name. Open the Chapters tab on desktop, then resize to 768px (tablet), then 320px. At each width, attempt to tap the truncated name to confirm navigation still works. Also test with a name that includes special characters or non-Latin script (e.g. Devanagari for Hindi chapters) since text width differs between fonts.

Expected
The name truncates with ellipsis or wraps cleanly without pushing the success rate, exam count, or trend indicator out of view. Tapping any visible part of the truncated name navigates to the right chapter. Tooltips on hover (desktop) reveal the full name. If the success rate badge wraps to a second line on mobile, that is a P2 layout bug; if any metric goes off-screen entirely, that is a P1.

---

**A5 — A teacher with multiple subjects sees the right chapters per batch**

What this is
Teachers can be assigned more than one subject (e.g. Physics + Chemistry). A batch that takes both subjects must show chapters from both, but a batch that takes only one must not pull in unrelated chapters. Cross-subject contamination here is a privacy and correctness bug — a Physics teacher should never see Maths chapter analytics for batches where they don't teach Maths.

What to try
Use a teacher login assigned to two subjects. Open a batch that has both subjects, then a batch that has only one. In the multi-subject batch, scan all visible chapter names against the curriculum to confirm only the teacher's two subjects are present. In the single-subject batch, look specifically for any chapter from the *other* subject the teacher teaches elsewhere — that's the leakage shape to hunt.

Expected
The first batch lists chapters from both subjects clearly grouped or labelled (subject pill, header, or section divider). The second batch lists chapters only from the relevant subject. No chapter from a subject the teacher does not teach in *that specific batch* should appear, even if they teach it elsewhere. If you see contamination, capture both batch IDs and the leaked chapter — this is at least P1.

---

### B. Chapter Overview Banner

**B1 — Overall success rate is consistent across mixed exam types**

What this is
The overview banner at the top of the chapter detail aggregates results from Quick Tests, Grand Tests, and Institute Tests. The aggregation rule (per question? per exam? weighted by question count?) must be applied uniformly or the headline number is misleading. A teacher sees the banner first and uses it as the executive summary.

What to try
Open a chapter that has been examined in at least two different exam types (e.g. a Quick Test and an Institute Grand Test). Manually sanity-check the displayed success rate against the per-exam numbers in the Exam Breakdown section below. Note the exact value, refresh, and compare. Then open the same chapter from a different batch and confirm both numbers are independent (changing one batch's results should never affect the other batch's banner).

Expected
The headline rate is internally consistent with the breakdown — within ±1% rounding tolerance. The same chapter opened a second time gives the identical number (to the decimal). If the headline doesn't match the visible per-exam average and there's no explanation of weighting, that is a P1 trust bug; teachers will compute the simple mean themselves and see the discrepancy.

---

**B2 — Exams Covering count handles a chapter examined twice in one paper**

What this is
If an exam includes two different question sets both tagged to the same chapter (e.g. Section A has 5 questions on Optics, Section C has 3 more), the chapter should still count that exam as **one** — not two. Counting it twice would double-inflate the "tested coverage" of that chapter and make the teacher think the chapter is over-tested when it isn't.

What to try
Construct (or find) an exam that covers the same chapter in two separate sections or paragraph groups. Open the chapter overview banner. Note the "Exams Covering" count. Cross-check by opening the Exam Breakdown section and counting unique exam names.

Expected
The "Exams Covering" count increments by one for that exam, not by two. The "Total Questions Asked" number, however, *does* include all questions from both sections (this is the correct behaviour — see B3). If "Exams Covering" reports 2 for a single exam, that is a P2 inflation bug; if the unique-exams list in Breakdown shows the exam twice, that is the same bug surfacing in two places — file once, mention both.

---

**B3 — Total Questions Asked counts each occurrence, not each unique question**

What this is
If a question from the bank is reused in two different exams, each appearance is a separate testing event for the chapter. Deduplicating would understate how often the chapter has been tested and would make per-question success rates look strange. The count should be the sum of question slots across all exams covering the chapter, not the count of distinct question IDs.

What to try
Find a question that has been asked in two different exams (the institute-level Question Bank shows reuse). Verify the chapter's total question count by manually summing the question counts of every exam in the Exam Breakdown.

Expected
Both occurrences are counted. The number matches the manual sum. If the count is lower than the sum and you can identify the deduplication, that is a P2 bug — flag the dedup logic. If the count is higher than the sum, that is a P1 — phantom questions are appearing.

---

**B4 — A chapter with only one exam shows the banner cleanly**

What this is
Trends and aggregates degrade gracefully when there is only one data point. With a single exam, there is no "previous" to compare against, so any trend arrow is fabricated.

What to try
Open a chapter that has been part of exactly one exam in this batch. Note whether a trend indicator (arrow, percentage delta, "vs previous") is shown. Also try a chapter with two exams to confirm the trend appears correctly from the second one onward.

Expected
The success rate shows that one exam's number. The trend arrow is hidden, shows "—", or explicitly says "first exam" — never an arbitrary up or down arrow. If you see an upward arrow with "+0%" or "+15% vs previous" when there is no previous, that is a P1 fabricated-data bug.

---

### C. Topic Heatmap

**C1 — Colour tier boundaries behave deterministically at the threshold**

What this is
The 4-tier colour standard in `src/lib/reportColors.ts` uses ≥75 emerald, ≥50 teal, ≥35 amber, <35 red. A topic at *exactly* 75% must always render emerald (not teal), at exactly 50% always teal, at exactly 35% always amber. Boundary flicker between renders means downstream filters and bucket assignments will also flicker, and the entire report becomes untrustworthy.

What to try
Either seed or find topics with success rates at or near the boundaries (75, 50, 35). If you cannot get exact values, pick topics within ±1% of each boundary. Refresh the page 3–5 times and compare colours. Inspect the rendered class name in DevTools to confirm which tier the code chose. Cross-check against any tooltip the UI shows — if a tooltip says "≥65 / 40-64 / <40" and the actual tile is coloured by `reportColors.ts` (75/50/35), the tooltip is the bug.

Expected
A topic at 75.0% always renders emerald, at 50.0% always teal, at 35.0% always amber. The boundary rule (`>=` not `>`) is consistent across refreshes. If a tooltip text disagrees with the code thresholds, file two bugs: the colour itself is correct (emerald at 75 is correct per code) and the tooltip text needs updating. If colours change between refreshes for the same value, that is a P0 — the seeded mock data is not deterministic.

---

**C2 — A topic with zero questions asked is visually distinct from a topic with 0% success**

What this is
"Never tested" and "tested and everyone failed" are completely different teaching signals. Showing both as red would mislead the teacher into intervening on a topic that has not yet been measured. Heatmaps have a long history of this conflation bug, so check it explicitly.

What to try
Find a topic that has not appeared in any exam yet within a chapter that has been examined. Compare its tile to a topic where students genuinely scored 0%. Hover or tap each tile and read the tooltip / detail.

Expected
The "untested" topic tile renders in a neutral grey state with a "no data" indicator (em-dash, "—", "untested" label), not in any of the four performance colours. Tapping it either does nothing or shows a clear "no questions asked yet" message — never lands on a broken drill-down or an empty student list. If untested topics render red, that is a P1 misleading-state bug.

---

**C3 — Long topic names do not overflow tiles**

What this is
Topic names like "Conservation of Linear Momentum and its Applications" need to fit in a small tile. If they overflow, they push the success rate badge out or break the grid alignment.

What to try
Inspect the heatmap on a chapter whose topics include long names, on both desktop and 320px viewports. Try Devanagari topic names too if Hindi chapters are seeded — those tend to be both longer in pixels and taller in line-height.

Expected
Names truncate or wrap inside the tile boundaries. The success rate is still visible. Hovering (desktop) or tapping (mobile) reveals the full name. If a name visibly escapes its tile and overlaps the next one, that is a P2 layout bug — capture a screenshot at the exact viewport width.

---

**C4 — Heatmap density remains readable at 320px**

What this is
Mobile-first is a project standard. A heatmap that needs horizontal scrolling at 320px is a UX failure — the teacher will give up before scrolling sideways through 12 tiles.

What to try
Open a chapter with 12+ topics on a 320px viewport. Try also with 4–5 topics (sparse) to confirm the grid doesn't leave awkward empty space. Tap a few tiles to confirm touch targets are still reachable.

Expected
Tiles reflow into a grid that fits the viewport — typically 2 columns at 320px. No horizontal scroll appears. Tap targets remain at least 44px tall. With sparse topic counts, the grid does not over-stretch tiles to fill the row.

---

**C5 — All-green and all-red heatmaps both render gracefully**

What this is
Edge distributions test that no logic assumes a "spread" of colours. An "all green" heatmap should not trigger the "weak topics" empty state in a way that breaks the page; an "all red" heatmap should not crash the bucket logic by pushing every student into one band.

What to try
Open a chapter where every topic is above 75%, then one where every topic is below 35%. On each, scroll past the heatmap into the Student Buckets section to confirm those also render correctly under these extreme distributions.

Expected
Both render without empty rows, layout collapse, or "no data" placeholders mistakenly appearing. The chapter overview banner still shows a valid headline number. Student Buckets show one or two bands fully populated and the others empty (see D3, D4). If the page crashes or shows a partial render, that is a P1 — capture the chapter ID and batch ID.

---

**C6 — Tapping a topic tile drills into the right context**

What this is
The heatmap is a visual index — its only job after showing colour is to take the teacher to the underlying questions or students for that topic. If the drill-down lands somewhere generic (chapter root) or wrong (a different topic), the heatmap loses its purpose.

What to try
Tap a topic tile. Note the URL change and where the page lands. Hit the browser back button and confirm you return to the chapter, ideally scrolled to the heatmap section. Repeat with at least three different tiles in different colour tiers.

Expected
You arrive at a topic-scoped drill-down (questions list or weak-students list, per design). The URL contains the topic ID cleanly (no double-encoding, no `undefined`). Back returns to the chapter and ideally restores scroll position. If back lands at the batch root, that is a `returnTo` P1 bug.

---

### D. Student Buckets & PI Bucketing

The four bands render via the `StudentBuckets` component on the chapter page. Per the code in `studentReportData.ts` and `reportColors.ts`, the bands map to PI thresholds: **Mastery ≥75, Stable ≥50, Reinforcement ≥35, At Risk <35**.

**D1 — Default expand/collapse matches band severity**

What this is
Per project spec, the two attention-needing bands (Reinforcement, At Risk) open by default, while the two healthy bands (Stable, Mastery) collapse. This guides the teacher's eye to where intervention is needed without requiring extra clicks. If all four open, the page becomes overwhelming on mobile; if all four collapse, the teacher loses the at-a-glance signal.

What to try
Open a chapter for a batch with students in all four bands. Note the initial expand/collapse state of each band on first load. Manually expand Mastery and collapse Reinforcement. Refresh the page and check the state again. Navigate to another chapter and back to confirm the default is per-page, not per-session.

Expected
On first load: Reinforcement and At Risk are expanded showing student lists; Stable and Mastery are collapsed showing only counts. After refresh, the default state returns regardless of what you toggled. If the toggle persists across a refresh in a way that hides At Risk by default on subsequent visits, that is a P2 — the teacher can be tricked into missing risk students.

---

**D2 — A bucket with a single student renders cleanly**

What this is
List components often assume "many" — a single-row state can break alignment, hide the header count, or render the CTA in a way that doesn't fit. A single student in At Risk is the *most important* row in the report and must be visible.

What to try
Find a chapter where exactly one student falls into a given band (At Risk is most likely). Confirm the row renders with the student's name and PI badge. Note whether the band header still shows "(1 student)" or similar.

Expected
The single student's row is correctly displayed with name, roll number, and PI value. The band header reflects the count of 1. The Generate Homework CTA at the bottom of `StudentBuckets` is still functional and, when launched, scopes correctly. If the row collapses into the header or the count says "0", that is a P1.

---

**D3 — An empty bucket renders without breaking the layout**

What this is
If no student is in At Risk on a strong chapter, the section should not collapse the page or show a broken heading. The teacher should be able to see at a glance "0 students at risk" — that is itself useful information.

What to try
Open a chapter where every student is in Mastery or Stable. Look at the At Risk and Reinforcement bands. Try expanding the empty band manually.

Expected
The empty bands either hide gracefully or show an explicit "no students in this band" message with a count of 0. The page does not push other content up incorrectly; the practice CTA at the bottom is still reachable. If an empty band renders with a phantom student row or a stuck loading skeleton, that is a P1.

---

**D4 — A band containing every student still calculates correctly**

What this is
The inverse of D3 — an entire batch in At Risk on a brutal chapter. Bucket calculation must not skip the "everyone in one band" edge case, and the Generate Homework CTA must scope to the entire batch correctly.

What to try
Open a chapter where the success rate is below 30% for almost every student. Confirm At Risk shows the full roster count. Note that other bands are empty / collapsed. Click Generate Homework and confirm the next page (`ConfigureStep`) shows the correct band count.

Expected
At Risk shows the full roster count. The other three bands show 0 students. On the practice page, the band list reflects the same distribution — only At Risk has a non-zero count. If any band shows a count higher than the batch size, that is a P0 phantom-student bug.

---

**D5 — Two students with identical PI break ties deterministically**

What this is
If sort order changes between page loads when two students tie, the teacher will think the data is unstable and lose trust in every other number on the screen.

What to try
Find or seed two students with the same PI in the same band. Refresh the chapter 3–5 times. Note the relative order of the two tied students each time. Also navigate away to another chapter and back.

Expected
The relative order of the two tied students stays the same across all refreshes (likely tie-broken by name alphabetical or by ID — but consistently). If order swaps even once, that is a P1 stability bug; capture the two student IDs.

---

**D6 — A student with zero attempts in this chapter is handled explicitly**

What this is
If a student joined the batch after the only exam covering this chapter, they have no data for it. Showing them as At Risk is wrong — they have not been measured. This is a particularly nasty bug because it leads to the teacher reaching out to a student about a chapter they were never assessed on.

What to try
Add a new student to a batch (institute side) and immediately open a chapter that has been examined before they joined. Look for the new student in the bands. Also check the chapter page's overall student count vs the batch roster.

Expected
The student either does not appear in any band, or appears in a clearly-marked "no data yet" segment — never as red-bucketed At Risk based on absence. The total of all band counts matches the count of students who *have* attempted the chapter, which may be less than the batch roster.

---

**D7 — A student who transferred mid-cycle does not corrupt counts**

What this is
Roster changes are common in real institutes. Bucketing must reflect the *current* roster, not historical exam respondents who have left. A transferred-out student showing up in At Risk would be embarrassing.

What to try
Remove a student from the batch (institute side — transfer them out). Reopen the chapter without restarting the app. Check whether the transferred student appears anywhere in the bands.

Expected
The transferred student no longer appears in any band. Bucket counts sum to the *current* roster size (excluding new joiners with no data, per D6). Their old attempts may still influence the chapter-level success rate (this is a product decision worth flagging if unclear) but they themselves are not listed.

---

### E. Generate Homework — The 3-Step Page Flow

The chapter page's `StudentBuckets` component shows a single **Generate Homework** CTA at the bottom of the bucket list. Clicking it navigates to the full-page route `/teacher/reports/:batchId/chapters/:chapterId/practice`. This is **not a dialog wizard** — it is a dedicated 3-step page (`configure → review → done`) that generates questions for **all four bands at once**, lets the teacher review and remove individual questions per band tab, regenerate replacements, and assign per-band or all-at-once.

**E1 — Generate Homework CTA opens the configure page with the correct chapter context**

What this is
The CTA is chapter-scoped (one button at the bottom of `StudentBuckets`), not band-scoped. Opening it should land on the configure step with the chapter name, subject, batch, and band counts already populated and read-only — the teacher should never be able to accidentally generate practice for a different chapter from this entry point.

What to try
Open at least three different chapters from at least two different batches. Click Generate Homework on each. On the configure page, verify the chapter name in the breadcrumb and header, the subject pill, the batch name, and the four-band roster counts. Hit back and try from another chapter to confirm context updates correctly. Also try opening the practice URL directly with a typed chapter ID that doesn't exist in the batch.

Expected
The configure page shows the correct chapter, subject, batch class, and batch name. The four bands (Mastery / Stable / Reinforcement / At Risk) are listed with the same counts as on the chapter page's `StudentBuckets`. Bands with zero students show "0" but do not block the flow. Direct navigation to a non-existent chapter ID shows the "Chapter Not Found" empty state with a back-to-batch button — never a partial render or a console crash.

---

**E2 — Question count selector (5 or 10 per band) propagates correctly**

What this is
The configure step exposes a binary choice: 5 questions per band or 10 per band. With 4 bands this means total questions = 20 or 40. The total preview must update live, and clicking Generate must produce exactly that many questions distributed correctly.

What to try
On the configure page, toggle between 5 and 10 a few times and watch the "Total Questions" preview. Generate with 5, go through to review, and count the questions in each band's tab. Use the Re-configure option from the review step to go back, switch to 10, and regenerate. Confirm the new count is honoured.

Expected
The preview updates instantly between 20 and 40. After Generate, each band's tab in the review step shows exactly the selected count (5 or 10). The success toast says "Generated 20 questions across 4 bands" or "Generated 40 questions across 4 bands". If a band shows fewer questions than selected without explanation, that is a P2 generation bug.

---

**E3 — Common instructions apply to all bands; per-band overrides only those bands**

What this is
The configure step has a single common-instructions textarea and a "Show per-band instructions" toggle that reveals four additional textareas. Common instructions should anchor the AI prompt for every band; per-band fields should layer on top *only for the bands they target*. Mixing these would mean a teacher's "focus on conceptual depth" instruction for Mastery accidentally bleeds into At Risk, where it's actively harmful.

What to try
Set common instructions like "Use NCERT examples". Toggle on per-band, set distinct per-band instructions ("easier vocabulary" for At Risk, "JEE-style depth" for Mastery, leave Stable and Reinforcement blank). Generate and inspect the questions in each band tab — do the questions visibly reflect their band's instruction shape, or are they uniform?

Expected
After generation, each band's question set visibly differs in difficulty/shape consistent with the instructions. Bands with no per-band override fall back to common-only. If every band returns identical-feeling questions regardless of instruction, that is a P2 prompt-leakage bug — the per-band field is decorative. If the toggle for per-band is on but the textareas are hidden or non-editable, that is a P1 UI bug.

---

**E4 — Generate produces all four bands at once, even when some bands are empty**

What this is
Unlike a per-band wizard, this flow generates for all four bands in a single click — even when a band has zero students. The point is to give the teacher a full set so they can decide post-hoc which bands to actually assign. Generating only for non-empty bands would force the teacher to regenerate if the roster changes.

What to try
Open Generate Homework on a chapter where one or two bands are empty (e.g. Mastery has 0 students). Click Generate. In the review step, switch through all four band tabs.

Expected
All four band tabs are present, each with the selected count of questions. Empty-band tabs still show questions but their assign button shows "0 students" and is either disabled or warns before assigning. The toast confirms generation across 4 bands.

---

**E5 — Review step lets you remove individual questions and regenerate replacements**

What this is
On the review step, each question has a remove icon. Removing pulls the question out of the assignable set. The "Regenerate" button at the page level fetches replacements for *only* the removed slots, preserving the kept questions. If regenerate replaces the entire set, the teacher loses all their curation work.

What to try
On the review step, remove 2 questions from At Risk and 1 from Mastery (3 total). Note the IDs of the questions you kept. Click Regenerate. Confirm the kept questions are still present and only the removed slots have new questions.

Expected
The kept questions are unchanged in text and ID. The removed slots are filled with new questions. The toast says "Regenerated 3 questions". Total active count returns to 20 (or 40). If kept questions are replaced or duplicated, that is a P1 — file with the question IDs you tracked.

---

**E6 — Assigning per-band marks only that band as assigned and updates the page**

What this is
Each band tab has its own Assign button. Clicking it should assign just that band's active questions to that band's students, mark the band as assigned (visual badge, button disabled), and leave other bands untouched.

What to try
Click Assign on Reinforcement only. Note the toast. Switch to At Risk — its Assign button should still be active. Switch back to Reinforcement — it should now show as assigned. Try clicking the assigned band's button again to confirm idempotency.

Expected
Toast says "N questions assigned to M students in 'Reinforcement Needed'". Reinforcement's Assign button is now disabled or shows "Assigned ✓". Other bands are untouched. Re-clicking does nothing or shows a non-error info message. If clicking again creates a duplicate assignment, that is a P1.

---

**E7 — "Assign All" assigns every non-empty band and advances to the done step**

What this is
The bulk action should assign every band that has students AND has at least one active question, skip the others, and route to the success screen.

What to try
On a chapter with all four bands populated, click Assign All. Confirm the toast count, the done step renders with the correct totals (questions assigned, students reached, bands assigned). Then repeat on a chapter where one band is empty — confirm that band is silently skipped, not errored.

Expected
The done step shows: assigned band count (4 or fewer), total active questions assigned, total students across those bands. Empty bands are excluded from these totals. The "Go Back" button on the done step returns to the chapter detail page, not the batch root.

---

**E8 — Double-clicking Generate or Assign does not produce duplicates**

What this is
Network latency or finger-stutter makes double-click a real concern. Two practice generations or two assignments for the same scope is a duplication bug that pollutes Practice History and confuses the assigned students.

What to try
Throttle network in DevTools to Slow 3G. On the configure step, click Generate twice in rapid succession. Observe the network tab and the resulting review step — is there one set of questions or two? On the review step, click Assign on a band twice rapidly. Then try keyboard rapid-fire (Enter twice).

Expected
Exactly one generation occurs (one network call, one set of questions, one toast). Exactly one assignment per band. If you see two toasts, two history rows after returning to the chapter page, or two distinct question sets, that is a P1 duplication bug — capture both request payloads from the network tab and the resulting IDs.

---

**E9 — Long generation latency or aborted call is handled**

What this is
AI generation can take 20–30 seconds in production. The UI must not look frozen, and a network failure must not leave a half-created practice or a stuck button.

What to try
Throttle to Slow 3G. Trigger Generate and watch the button state — does it disable, show a spinner, or update copy? Open DevTools network tab, find the in-flight request, and right-click → Block request URL to simulate failure. Try also navigating away mid-generation.

Expected
The Generate button is disabled and shows a loading state during generation. On a successful response (even slow), the review step appears with the generated questions. On a blocked / failed request, an error toast appears and the button re-enables. If the button stays stuck disabled forever after an error, that is a P1 stuck-state bug. If you successfully reach the review step but the questions are empty or partial, capture the network response.

---

**E10 — Re-configure from the review step resets review state cleanly**

What this is
The review step has a Re-configure action that takes the teacher back to step 1. This must clear the generated questions, the removed-question set, and any in-progress band assignments — otherwise the teacher returns to review and sees stale state mixed with new generation.

What to try
Generate, remove some questions, assign one band, then click Re-configure. Note that the configure page reappears. Change the question count, regenerate. Inspect the review step — are the previous removals or assignments still tracked?

Expected
On returning to configure, instructions are preserved but the prior generation is fully discarded. New generation produces fresh questions. No band shows "Assigned" from the prior cycle. If stale assignments persist, that is a P1 — the teacher could think a band is assigned when it isn't.

---

### F. Chapter Practice History

**F1 — A newly-generated practice appears immediately on return to the chapter page**

What this is
After completing the generate flow and returning to the chapter detail (via the done step's Go Back button or breadcrumb), the new practice should appear at the top of `ChapterPracticeHistory`. If the teacher has to refresh to see their own creation, they will think it failed and may regenerate, creating duplicates.

What to try
Generate and assign a practice. Click Go Back from the done step. Without refreshing, look at the Practice History section on the chapter page. Note the timestamp on the new row.

Expected
The new practice row is at the top of the list immediately. The count badge (if shown) increments. The timestamp matches when you assigned it (within seconds). If you have to refresh to see it, that is a P2 stale-state bug.

---

**F2 — Sessions are ordered most-recent first**

What this is
Recency matters more than alphabetical or band order in practice history. The teacher's most recent action should be at the top.

What to try
Generate three practices on the same chapter a few minutes apart. Refresh after each. Confirm ordering.

Expected
Newest at the top, descending. Order is stable across refreshes. If two practices have identical timestamps (rare), the tiebreak is consistent.

---

**F3 — A session with zero student attempts shows clearly**

What this is
Just-generated practices have no attempts yet. The row should not show "0% success" as if students tried and failed — it should show a "not yet attempted" state distinct from a genuine failure.

What to try
Look at the row of the practice you just generated, before any student opens it. Compare its visual treatment to an older practice that students have attempted.

Expected
The row shows "not yet attempted", "0 / N submitted", or similar — not a misleading 0% red badge. The visual treatment is distinct from an older practice with real attempts.

---

**F4 — A session whose chapter was renamed in master data still resolves**

What this is
Master data can change. A practice generated last month against "Light — Reflection" should still be findable if the institute admin renames the chapter to "Reflection of Light". History rows should not become orphans.

What to try
After generating a practice, ask the institute admin to rename the underlying chapter. Reopen the chapter report (you may need to navigate via the renamed chapter).

Expected
The practice still appears in history. The chapter name shown matches the current name (not the historical one), or there is a clear note about the rename. No orphaned rows or broken links.

---

**F5 — Deleting a practice removes it everywhere it was counted**

What this is
If deletion is supported, count badges and roll-ups must update consistently across the chapter page, the band CTAs (if they show counts), and any student profile that referenced it.

What to try
Delete a practice (if the action is exposed in the row's overflow menu). Check Practice History, the chapter banner stats, and the student profile of one of the assigned students.

Expected
The row disappears from history. Counts decrement consistently across all surfaces. If the deletion succeeds in one place but the count persists elsewhere, that is a P2 cache-stale bug.

---

### G. Chapter Exam Breakdown & Cross-Navigation

**G1 — Drilling from an exam row preserves return context**

What this is
`returnTo` is the small contract that makes deep navigation feel coherent. If it breaks, the teacher loses their place after every drill and has to re-navigate from the batch root every time.

What to try
From a chapter, click into an exam row in the Exam Breakdown section. From the exam detail, hit the back button or breadcrumb. Then try a deeper drill: chapter → exam → click a chapter cross-link inside the exam → back twice.

Expected
You return to the same chapter, scrolled to the Exam Breakdown section. The URL on the way in carried a `returnTo` param; the way back honoured it. On the deeper drill, each back step returns one level, never jumping to the batch root.

---

**G2 — An exam from a different subject must not appear here**

What this is
If the chapter is Physics and a Chemistry exam is somehow listed, it points to a tagging or scoping bug.

What to try
Scan the Exam Breakdown rows on a Physics chapter. Confirm every listed exam is from the Physics subject. Repeat on a Chemistry chapter to confirm the inverse.

Expected
No cross-subject exams. If a Grand Test covers multiple subjects but includes this chapter for the right subject, it appears with the correct subject context (and only the relevant subject's questions contribute to the chapter analytics — see B1).

---

**G3 — An exam un-published after results were captured behaves predictably**

What this is
Once results exist, un-publishing the exam should not erase historical analytics. But the teacher should know its current status.

What to try
Have the institute admin unpublish an exam that already has student responses. Reload the chapter.

Expected
The exam still contributes to chapter analytics historically, but is visually marked as "unpublished" or otherwise distinguished from active exams (greyed text, badge, italics). Clicking it still leads to the analytics view.

---

**G4 — Institute test rows are visually distinct (violet/purple)**

What this is
Per project standards, institute-created tests use a violet/purple visual cue so teachers can immediately tell what is theirs versus what came from the institute.

What to try
Find a chapter with both teacher-created and institute-created exams in its breakdown. Compare row treatments side-by-side on desktop and mobile.

Expected
Institute test rows are clearly tinted violet/purple. Teacher exams use the standard styling. The distinction holds on both desktop and mobile, and at 320px specifically.

---

**G5 — Sorting by date vs by average works and persists during the visit**

What this is
Teachers sometimes want chronology, sometimes severity. The sort state should not flicker between the two.

What to try
Toggle the sort. Navigate away to the exam detail and back.

Expected
The sort selection is preserved during navigation. Refreshing the page may reset to the default — that is acceptable as long as it is consistent.

---

### H. Edge Cases, Curriculum Boundaries & Stability

**H1 — The same chapter under two curriculums shows the right curriculum context**

What this is
"Physics — Optics" exists in CBSE Class 10 and in JEE Main. They are different chapters with different topics. Conflating them in the UI would cause major teaching errors — a CBSE teacher might see JEE Advanced topics in their report.

What to try
Use a teacher who teaches both a CBSE batch and a JEE batch. Open the same-named chapter in each batch's report. Compare topic lists, exam lists, and student counts.

Expected
Each chapter shows its own topics, exams, and student data — no leakage. The breadcrumb or header makes the curriculum context clear (e.g. "Optics — JEE Main" vs "Optics — CBSE Class 10").

---

**H2 — A chapter removed from master data after exams reference it does not crash**

What this is
Master-data deletes are rare but real. Historical data must remain readable rather than crash the page.

What to try
Have the institute admin remove or deactivate a chapter that already has exam history. Reload the chapter report (navigate via an exam row that referenced it, since direct access may be blocked).

Expected
The page either redirects gracefully with a clear "chapter no longer available" message, or renders the historical data with an explicit deprecation banner. No infinite spinner, no console crash, no white screen.

---

**H3 — Page refresh produces identical numbers (deterministic mock data)**

What this is
The mock data layer uses a seeded PRNG so a tester sees consistent values. If numbers drift on refresh, no tester can verify anything else reliably — every other scenario is built on this assumption.

What to try
Note three numbers on the chapter page (overall success rate, a specific topic's percentage, a band count). Refresh the page 5 times. Then close the tab and reopen the URL fresh.

Expected
All three numbers are identical across all refreshes and the fresh tab open. If any of them changes, that is a P0 stability bug — flag it before continuing other tests, because every other scenario is now suspect.

---

**H4 — Rapid tab switching between Chapters / Exams / Students does not corrupt state**

What this is
If the teacher flips quickly between tabs, in-flight async loads can settle into the wrong tab and overwrite its data.

What to try
On a slow network (Slow 3G), click Chapters → Exams → Students → Chapters in quick succession. Repeat in different orders.

Expected
Each tab eventually shows its correct data. No tab ends up showing another tab's content. No stale spinner persists after the data has loaded. If you see Exam data inside the Chapters panel, capture the URL and the exact click sequence.

---

**H5 — Chapter detail at 320px is fully usable**

What this is
Mobile is the primary support target per project standards. The chapter detail is dense (banner, heatmap, four bands, practice history, exam breakdown), so this is where layout breaks first.

What to try
Open a chapter with all sections populated on a 320px viewport. Scroll top to bottom. Try the Generate Homework CTA at the bottom of buckets — is it reachable with one thumb? Is the button at least 44px tall?

Expected
No horizontal scroll. All CTAs are reachable. Touch targets are at least 44px. Sticky headers (if any) do not eat more than 15% of viewport height. Bottom nav padding (`pb-20`) ensures the last CTA isn't hidden behind the teacher bottom nav bar.

---

*This document covers the Chapters tab only. See `teacher-reports-exams-qa.md` for the Exams cycle and `teacher-reports-students-qa.md` for the Students cycle.*

### I. Practice Session Detail Drill-In

The 3-step generation flow (Section E) and the Practice History list (Section F) both end with the teacher looking at a session row. This section covers what happens when they tap that row and land on `/teacher/reports/{batchId}/chapters/{chapterId}/practice/{sessionId}` — the per-session drill-in. Without these scenarios the practice loop is half-tested: we know we can create and list, we don't know we can analyze.

**I1 — The page renders all four overview stats and one band card per band**

The drill-in opens with four `StatCard`s — Total Students, Completion %, Avg Accuracy, Questions — and then one `BandCard` per band that was generated (At Risk / Bottom / Middle / Top, depending on which were included). The band cards must show the band's color marker, the assigned-vs-completed count, and the questions-in-band count. Missing any of these forces the teacher back to the parent page to recompute.

What to try: tap a session that was generated for all four bands. Read each StatCard and confirm the math (Completion = completed / assigned, Avg Accuracy = correct / answered). Then tap a session that was generated for only two bands — only those two BandCards should appear. Then resize to 320px and confirm the 2×2 stat grid stacks cleanly without clipping.

Expected: stat math is correct, only generated bands render their cards, layout holds at 320px. Wrong math on Completion or Accuracy is P1 because it directly mis-states intervention progress. A BandCard rendering for a band that was excluded during generation is P0 architectural — it means the session record didn't honor the configuration.

**I2 — Students tab: per-band accordions list the assigned students with their per-student status**

Default view of the drill-in. Each band accordion is open by default (`defaultValue={bandDetails.map(b => b.key)}`). Each student row should show name, completion state, and accuracy on this session — not their overall PI, which would mix scopes.

What to try: open a session, expand and collapse each band accordion. Confirm each student listed is actually in that band (cross-check against the parent chapter's Student Buckets section). Find a student who appears in multiple completed sessions — their per-session accuracy here should match what the practice history list summarized.

Expected: students are bucketed correctly per band, per-session metrics shown not overall PI, accordion state survives a re-open of the page. A student showing up in the wrong band is a P1 data-mapping bug. A student listed in this session who wasn't actually assigned is P0.

**I3 — Questions tab: per-band question lists match the configuration that produced them**

Switch to the Questions tab. Each band accordion shows the questions that were generated for that band. Difficulty mix and topic spread should match what the teacher configured during the 3-step page (Section E). If band-specific instructions were used at generation time, those questions should still reflect that override.

What to try: open a session you generated yourself with deliberate per-band overrides (e.g., harder-than-default for the Top band). Confirm the Top band's questions in this view are visibly harder than the At Risk band's. Confirm the question count per band matches what you set.

Expected: the questions stored on the session match the configuration captured at generation time. A band whose questions don't reflect its override is a P1 because it breaks the differentiated-homework promise. Question count drift (set 8, see 6) is P1 — usually a save bug.

**I4 — Breadcrumbs and back-navigation return to the chapter detail with practice history visible**

The breadcrumb chain on this page is Reports › {Batch} › {Chapter} › Practice Detail. Tapping the {Chapter} segment must return to the chapter detail page with the Practice History section in view (or at least scroll-restorable to it).

What to try: from a session detail, tap the Chapter breadcrumb. Then use the browser back button instead. Then on mobile use the system back gesture. All three should return to the chapter detail. Scroll position should land at or near the Practice History card, not the top of the chapter page.

Expected: all three back paths work, scroll restoration drops the teacher into Practice History. Returning to the top of the chapter page is a P2 friction bug. Returning to the wrong batch or wrong chapter is P0.

**I5 — Missing or deleted session URL renders the empty state, not a crash**

Direct-link a session ID that doesn't exist (manually edit the URL to `.../practice/session-does-not-exist`). The page should render the "Practice Session Not Found" card with a working "Go Back" button — not a blank page, not a console error storm, not an infinite spinner.

What to try: paste a fabricated session ID into the URL bar. Then try a real session ID with a fabricated chapter ID. Then try a real session ID for a session that belongs to a different batch.

Expected: the empty state renders cleanly for all three cases. "Go Back" returns to the previous valid page. A crash here is P0. A blank white page with a console error is P1. The page silently loading some other session's data is P0 — that would be a data-leak bug.

**I6 — Regenerate flow returns to the 3-step page with the original config prefilled**

If the drill-in offers a "Regenerate" or "Generate again" action (verify against the live UI — the route exists, the button may not), it should land back on the 3-step practice page with the original session's configuration prefilled. The teacher may want to tweak one band and rerun, not start from scratch.

What to try: locate the regenerate affordance. Tap it. Confirm the configure step opens with band selection, instruction overrides, and question counts already populated to match the source session. Make a small change and run — confirm a new session record appears in Practice History.

Expected: prefill is faithful to the source session. If regenerate isn't implemented yet, file as a feature gap rather than a bug; if it is implemented and prefill is empty, that's P1 because the teacher loses their config. A regenerate that overwrites the existing session instead of creating a new one is P0 — destroys historical data.

**I7 — The page is stable across reloads, returns, and concurrent sessions**

Reload the page five times in a row — every stat must be identical (deterministic mock-data per the project's PRNG memory). Open the same session in two browser tabs — both should agree. Open a different session for the same chapter in a second tab — they must not contaminate each other's data.

What to try: do all three. Pay attention to the StatCard numbers, the BandCard counts, and any per-student accuracy. A single digit changing between reloads is a stability regression.

Expected: full determinism per session ID. Drift between reloads is a P1 data-stability bug — these sessions are referenced by name in conversations between teachers and parents and must not change underneath them.
