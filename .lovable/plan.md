# Audit of the Three Teacher Reports QA Documents

I audited all three docs (Chapters: 641 lines, Exams: 722 lines, Students: 660 lines) against the actual code in `src/components/teacher/reports/`, `src/data/teacher/`, `src/lib/reportColors.ts`, `src/lib/performanceIndex.ts`, and the StudentReport / BatchReport pages. Honest verdict below.

---

## 1. Are they single-line? — Mostly no, but there are weak spots

The structure (intro narrative, "Before You Begin", "Highest-Risk Bugs", then 3 blocks per scenario) is right and consistent across all three. **The "What this is" block is consistently strong — 2 to 4 sentences explaining intent and stakes.**

**The weak block is "What to try".** Roughly 30–40 scenarios across the three docs have a one-sentence "What to try" of 50–90 characters. Examples:
- Students D3: *"Tap chapter 1 to expand, then tap chapter 2 without collapsing chapter 1 first."*
- Students C3: *"Open a student with no exam history at all."*
- Chapters D3: *"Open a chapter where every student is in Mastery."*
- Chapters E7: *"On the final step, click Generate twice in quick succession."*

These are command-style instructions, not exploratory guidance. A tester reading "Tap chapter 1, then tap chapter 2" gets no insight into *what other taps to try, what state to capture, what to compare against*. This violates your standard.

**"Expected" blocks have the same problem in ~20 places** — single-sentence pass criteria that don't explain the *failure mode* the tester should look for.

---

## 2. Do they create intent? — Yes for "What this is", inconsistent for the other two blocks

The "What this is" framing is strong. Every scenario explains *why* this matters (e.g. "A wrong colour here means a teacher reteaches a topic the class actually knows"). That part hits the bar.

**Where intent is missing:**
- "What to try" reads as a recipe, not an invitation to explore. There's no *"also try X, also try Y, watch for Z"* in most scenarios.
- "Expected" describes the happy path, rarely the failure shape (e.g. *"if you see X, that's a P0 bug; if you see Y, that's a UX issue"*).
- Several scenarios reference behaviours the tester would have no way to inspect ("verify the seeded-PRNG promise", "verify ≥44px touch targets") without saying *how* to inspect them.

---

## 3. Do they cover all edge cases? — Mostly, but with gaps and one wrong claim

**Coverage strengths**
- Empty states, single-row buckets, all-of-one-band, ties, transfers, renames in master data, 320px viewport — all hit.
- Subject-scoping for institute Grand Tests is well covered in Exams (B1–B8) and the Students timeline (E4).
- AI prefill drift across multiple entry points is well covered in Students H1–H3.

**Coverage gaps I found while reading the code**
1. **`getBatchStudentRoster` → `piBucket` real values are `"mastery" | "stable" | "reinforcement" | "risk"`** with thresholds **75 / 50 / 35** (per `studentReportData.ts` line 145–149 and `reportColors.ts`). The Students QA doc D1 quotes the *tooltip* in StudentReport.tsx which says **"≥65 / 40-64 / <40"** — and that tooltip IS wrong vs the code. So D1 *correctly* asks the tester to find the disagreement, but it should also tell the tester the *real* code thresholds (75/50/35) so they know which side is the bug.
2. **Multi-Subject Risk Card factual error.** The Students QA doc G1–G5 says the card is on the Student Report page and triggers on "PI < 35 in 2+ subjects". The actual `MultiSubjectRiskCard` lives inside the **Copilot routine-pilot panel** (`src/components/teacher/routine-pilot/reports-cards/MultiSubjectRiskCard.tsx`), and `reportContext.ts` line 384 filters by **`weak_chapter_count >= 2` within one batch/subject**, not "2+ subjects". The card is not rendered anywhere on the Student Report page at all. **This entire G section is testing the wrong screen with the wrong rule.**
3. **PI exposure claim is wrong.** Students B2 says "Raw PI is not exposed to the teacher". Actually `StudentProfileCard.tsx` (Copilot) line 52 renders `<Badge>PI {s.pi}</Badge>` and `MultiSubjectRiskCard` line 52 shows `PI {s.pi}` too. The rule the doc states does not match the implementation — either the rule is right and these are bugs to log, or the rule is wrong and the doc misleads testers.
4. **"Generate Practice 3-Step Wizard" in Chapters E1–E8** describes a wizard. I did not verify the exact step count against the actual `AIHomeworkGeneratorDialog`. Worth confirming before publishing.
5. **Chapter Practice History (Chapters F1–F5)** — needs verifying that `ChapterPracticeHistory` component actually exists in the chapter detail page; the file isn't in the `index.ts` export I read.
6. **Missing scenarios:**
   - **Print/Export of a Student Report** — Students doc says "export-friendly rendering" in F1 but no dedicated export scenario, even though `exportReport.ts` exists and the project has the off-screen html2canvas pattern documented.
   - **AI Deep-Dive timeout / regenerate** is mentioned in Exams G but no equivalent for the Student AI Summary which calls `analyze-batch-report` / similar.
   - **Today's Focus / Batch Health card** is rendered between tabs and the tab content (BatchReport.tsx line 88) — Chapters doc only mentions it once in passing (A1) but never tests its content, navigation, or how it changes when you switch tabs.
   - **Bottom nav collision** on mobile (`pb-20 md:pb-6` on BatchReport) — never directly tested.
   - **Roll number as identifier** appears in `StudentResultRow` and `StudentsTab` search but only one Chapters scenario covers it.

---

## 4. Did the docs actually read the code? — Partially. Some claims are invented.

Cases where the docs match the code well:
- 4-tier colour bands and worst-first ordering (Chapters)
- Subject-scoping rule for institute Grand Tests (Exams)
- The three Generate Homework entry points on StudentReport (header CTA, AI summary CTA, but the third — *"weak topic row CTA"* — I could not find in `WeakTopicsList.tsx`. It may exist; needs to be re-verified before shipping.)

Cases where the docs **invented behaviour**:
- The Multi-Subject Risk card on the Student Report (does not exist there).
- The "≥65 / 40-64 / <40" thresholds being authoritative (the actual color util uses 75/50/35; the tooltip is the outlier).
- The "PI hidden from teacher" rule (PI is shown in multiple Copilot cards).

These need to be corrected before the docs go to interns, otherwise they will spend time hunting for a card that isn't there or "verifying" a rule that the product never agreed to.

---

## 5. If all scenarios pass, are reports production-ready? — Close, but not quite

**What would be confirmed:** subject-scoping integrity, sort/order correctness, colour tier consistency, deterministic mock data, prefill correctness, returnTo preservation across two-level drills, 320px layout, empty-state handling.

**What would NOT be confirmed:**
- Real backend persistence (currently mock data — the docs note this once but don't make the tester explicitly validate it)
- Actual AI edge function output quality / token-limit failures (`analyze-batch-report`, `generate-chapter-practice`)
- Performance under realistic load (a real institute has 500+ students per batch; the docs cap testing at 30)
- Cross-portal flow: institute creates → teacher sees → student sees — only the institute → teacher leg is tested
- Today's Focus / Batch Health card across all states
- Three-level returnTo (Students → Student → Chapter → Exam → back × 3)

So a "100% pass" gives roughly **80% confidence** the Reports module is shippable. The remaining 20% is real backend integration, AI output quality, scale, and end-to-end cross-portal flow.

---

## 6. Will an intern understand what to test from a scenario alone? — Not always

The "What this is" block reads well alone. But a tester reading just one scenario (e.g. Chapters E7 "Double-clicking Generate") sees:
- Why it matters (idempotency)
- What to do (click Generate twice quickly)
- What should happen (one assignment created)

What they DON'T see:
- *Where* to find Generate (which band, from where on the page)
- *What other rapid-action edge cases to also try* (network throttling, refresh during, navigating away)
- *What error/state to capture if it fails* (server logs? toast? duplicate row?)
- *What variations to repeat the test under* (different bands, different subjects, etc.)

A senior tester fills these gaps from instinct. An intern won't.

---

# Remediation Plan

I will rewrite all three docs in two passes:

## Pass 1 — Correctness fixes (mandatory before any publish)

For each doc:
- **Students QA**: Remove or rewrite section G (Multi-Subject Risk Card) — either point it at the actual Copilot location or remove it entirely with a note that it's a Copilot test, not a Reports test.
- **Students QA**: Rewrite B2 (PI exposure) to match what the code actually does — either reframe as "verify whether PI badges in the Copilot are intentional" or remove.
- **Students QA D1 + Chapters C1**: Quote the *real* code thresholds (75/50/35) explicitly so the tester can identify which side is the bug if they disagree.
- **Students QA H1**: Re-verify the third Generate Homework entry point (weak topic row CTA) by reading `WeakTopicsList.tsx`. If it doesn't exist, drop the scenario to two entry points.
- **Chapters QA E1–E8**: Re-verify the wizard is actually 3-step against `AIHomeworkGeneratorDialog`. Update scenario titles and step counts to match.
- **Chapters QA F1–F5**: Verify `ChapterPracticeHistory` is rendered in the chapter detail. If not present yet, mark the section as "for the upcoming Practice History feature" and move on.

## Pass 2 — Depth fixes (the real ask)

For every scenario where "What to try" is under ~150 characters or "Expected" is under ~120, expand both blocks to give the tester:
- **In "What to try"**: 3–5 sentences covering the primary action *plus 2–3 variations* (different data shapes, different navigation paths, different network/timing conditions). Example for Chapters E7 (currently *"On the final step, click Generate twice in quick succession."*) becomes:
  > Trigger Generate at least three different ways. First, the obvious one — click the button twice rapidly on a normal connection and watch the network tab. Second, throttle the network to 3G and try the same; the lock or spinner should appear faster than your second click can land. Third, hit Enter while the button still has focus immediately after the first click. Repeat the whole exercise from at least two different bands, since the prefill and target student set differ per band and the request payload may differ too.
- **In "Expected"**: 3–4 sentences covering the happy path *plus the failure shapes to look for*. Example continuation:
  > Exactly one practice row appears in History, with one corresponding network call. If you see two rows, that is a P0 duplication bug — capture the request payloads and the practice IDs. If you see one row but two network calls (the second returning 4xx because of a server-side dedupe), the UI is leaking duplicate clicks to the network even if the server saves us; that is a P1 lock bug. If the button never re-enables after a successful generation, that is a P2 stuck-state bug worth filing separately.

This pattern — *primary action + variations + happy path + failure shapes + severity* — is what gives an intern enough to actually explore.

## Files touched

- `docs/06-testing-scenarios/inter-login-tests/teacher-reports-chapters-qa.md`
- `docs/06-testing-scenarios/inter-login-tests/teacher-reports-exams-qa.md`
- `docs/06-testing-scenarios/inter-login-tests/teacher-reports-students-qa.md`
- `.lovable/plan.md` (track audit + remediation status)

## Sequencing

1. **Audit fix pass on Students QA first** (it has the most factual errors — Multi-Subject Risk card, PI exposure, third entry point). Deliver, you review.
2. Then **depth pass on Students QA**.
3. Then audit fix + depth pass on **Chapters QA** (mostly depth — wizard step count and Practice History existence are the only correctness items).
4. Then audit fix + depth pass on **Exams QA** (mostly depth, plus verifying that "scheduled exam not appearing" rule is actually enforced in code).

After each doc I will pause for your review before continuing — same cadence we used for the timetable docs.

## Length expectation

Expect each doc to grow from ~700 lines to ~1,300–1,500 lines after the depth pass. That is the cost of giving every scenario enough rope for an intern to explore independently.

If you'd rather I just do correctness fixes (Pass 1) without the depth expansion, say so — that would be a much smaller change.

---

## Execution Status (live)

- [x] **Students QA** — fully rewritten. Correctness fixes applied: Multi-Subject Risk section removed (it lives in the Copilot, not Reports — explicit note added in Highest-Risk #6); PI exposure (B2) reframed to match actual code (PI hidden in Reports, present in Copilot); third Generate Homework entry point dropped to two (WeakTopicsList has no per-row CTA — F5 added explicitly to prevent testers hunting for it); D1 now quotes both the tooltip text and the real `reportColors.ts` thresholds and asks the tester to report which side renders. Depth pass: every "What to try" and "Expected" expanded with variations + failure shapes + severity. 595 lines, zero blocks under 120 chars.
- [ ] **Chapters QA** — needs correctness pass: rewrite section E to match real architecture (3-step *page* `configure → review → done` at `/practice` route, with all-bands-at-once question generation, common + per-band instructions, remove/regenerate, per-band assignment) — current docs describe a non-existent dialog wizard. F section is OK (`ChapterPracticeHistory` exists). Depth pass needed throughout.
- [ ] **Exams QA** — depth pass needed; correctness mostly OK (subject-scoping language matches the spec). Verify the "scheduled-but-not-yet-conducted exam not appearing" rule against actual filter logic before publishing.

Resume by rewriting Chapters QA section E first (highest correctness risk), then full depth pass on Chapters, then Exams.
