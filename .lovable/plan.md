# Chapter Report — Calculation Spec & Implementation (v4)

Deliverable order: (1) publish the spec doc the team can read, (2) implement so every number on the chapter report is computed and reconciles.

## Step 1 — Documentation (do first)

Create `docs/03-teacher/chapter-report-calculations.md` containing the full spec below, and refresh the [Chapter Insights](mem://features/teacher-module/chapter-insights-and-automation) and [Student Bucketing](mem://features/teacher-module/student-bucketing-and-pi-logic) memories to record the new contract (blended PI retired → mastery-band + flags). The doc is the source the team shares; code follows it exactly.

---

## The problem today
`generateChapterDetail()` fakes everything: topic % = `20 + rand()*65`, student accuracy from a separate random `examHistory`. A topic can read 30% while every student reads 80% — the cards never reconcile.

**Fix:** build ONE deterministic **response matrix** per `(chapter, batch)`. Every displayed value is a reduction over it — never random.

```text
ResponseRecord = {
  examId, assessmentType: "chapterTest"|"classTest"|"dpp",
  chapterId, topicId, questionId, studentId,
  attempted: bool, correct: bool (only if attempted),
  timeRatio?: number   // timeUsed/allotted; absent on untimed DPPs
}
```
Latent `studentAbility∈[0.2,0.9]`, `topicDifficulty∈[0.2,0.9]` make results realistic; all shown values are aggregates.

## A. Topic Heatmap
- `avgSuccessRate(topic) = round(Σcorrect / Σattempted × 100)` — pooled at response level (not mean of per-student %). `null` when `Σattempted===0`.
- `questionsAsked` = total questions from topic in scope; `examsAppeared` = assessments with ≥1 question.
- Status/colour: `strong≥65 / moderate≥40 / else weak`.
- `overallSuccessRate` (banner) = pooled `Σcorrect/Σattempted` across ALL topics (reconciles with cards).
- **Edges:** denom 0 → "—" neutral grey "Not attempted" (not 0%); `questionsAsked===0` → hide card; `LOW_DATA_THRESHOLD=2`, `lowData = attempted ≤ 2` (compute + flag fragile); round once, keep raw ratio for sorting.

## B. Student Segregation — Band + Flags
Blended PI retired (one averaged number ranks but doesn't segregate by need). One **mastery score** decides the band; everything else becomes a **flag** that names the intervention.

**Scope rule:** chapter report aggregates all chapter assessments (chapterTest+classTest+dpp); single-test report uses that test only. Same student may differ by scope — intentional; assertion runs per scope.

### B1 Mastery score (band decider)
```text
STAKES_WEIGHT = { chapterTest:1.0, classTest:0.6, dpp:0.3 }   // tunable
mastery = round( Σ(w·correct) / Σ(w·asked) × 100 )            // 0–100
```
Skipped questions stay in `asked`, so avoiding questions lowers mastery — Accuracy + Attempt Rate folded honestly into one number; chapter test dominates. `DIFFICULTY_WEIGHTING=false` (when on, multiply `w` by question difficulty). `Σasked===0` → absent, excluded.

### B2 Bands (inclusive lower bounds)
```text
Mastery Ready        ≥75 (provisional)
Stable Progress      50–<75
Reinforcement Needed 35–<50
Foundational Risk    <35
```
**Thresholds are placeholders** — `correct/asked` runs harsher than the old PI; recalibrate against a real class distribution before launch (avoid 30/40 in Risk on a hard chapter).

### B3 Diagnostic signals (feed flags, never the band)
`testMastery` (graded only), `practiceMastery` (DPP only), `dppEffort = attempted/asked on DPPs`, `pacing = clamp(round(100−avg(timeRatio)×100),0,100)` on correct timed answers (suppressed if no timing), `perTestAccuracy[] = round(correct/attempted×100)` per assessment with `attempted ≥ MIN_ATTEMPTS_PER_EXAM (=1)`, `consistency` & `trend` from `perTestAccuracy[]` (0–100, population stdDev, slope ±2).

### B4 Flags — max 2, priority-ordered
```text
cracks-under-pressure : practiceMastery − testMastery ≥ 20 (needs both)
disengaged            : dppEffort < 60
conceptual-gap        : practiceMastery <50 AND testMastery <50
declining             : trend down
topic-weakness        : ≥1 in-scope topic below weak cut (phase 2)
pacing                : pacing < 40
inconsistent          : ≥3 tests-with-attempts, stdDev >15
plateaued             : ≥3 tests-with-attempts, stdDev <5, slope≈0, band<Mastery
improving             : trend up
```
`FLAG_PRIORITY` = the order above; sort then `slice(0,2)`. Display: one band + ≤2 flags per student; mastery score is the sortable column, never shown without flags.

### Bucket edges + assertion
- **Absent** (`Σasked=0`): own line, excluded from 4 bands AND from "Not attempted".
- **Not attempted** (`asked>0, attempted=0`): own line, mastery "—" (never 0).
- Per-scope: `mastery+stable+reinforcement+risk+notAttempted+absent === studentsInScope`.

---

## Step 2 — Implementation

**`src/data/teacher/reportsData.ts`**
- Add `buildResponseMatrix(chapterId, batchId)` — seeded mulberry32 on `hash(chapterId+batchId)`, drawn in fixed order (assessment→topic→question→student), tagging each record with `assessmentType`. Generator: `pCorrect=1/(1+e^(-(ability-difficulty)*5))`, `pAttempt=clamp(ability*0.7+0.3,0,1)`, `timeRatio=clamp(0.8-ability*0.4+noise,0.1,1)` (timed only).
- Rewrite `generateChapterDetail()` to derive topics / overall / totals / examBreakdown / studentBuckets (4 bands + `notAttempted` + `absent`) from the matrix, scoped.
- Types: `ChapterTopicAnalysis.avgSuccessRate: number|null` + `lowData?`; new `Band` union; `ChapterStudentEntry` → `asked`, `attempted`, `masteryScore: number|null`, `band`, optional diagnostics, `flags: string[]`; `ChapterStudentBucket.key` extended to the 6 band keys.

**`src/lib/performanceIndex.ts`** (segregation module)
- Add `computeMastery({records, scope})` → 0–100 band score, and `computeFlags({records})` → signals + ordered flags. Reuse existing consistency/trend helpers. Keep a thin deprecated `computeStudentPI` shim so current importers (`studentReportData.ts`) compile until phase 2.

**UI (presentation only)**
- `reportColors.ts`: add `getTopicColor(status)` on the 65/40 scale; keep `getPerformanceColor` for bands.
- `TopicHeatmapGrid.tsx`: neutral grey "Not attempted / low data" when `avgSuccessRate===null`; colour tiles via `getTopicColor`.
- `StudentBuckets.tsx`: update `bandStyles` to the 6 keys; render separate "Not attempted" and "Absent" lines (mastery "—"); show band + up to 2 flags per student.
- Null-guard `getPerformanceColor` / sorts / filters anywhere `masteryScore` can be null (incl. `reportContext.ts`).

## Verification
- One chapter: topic pooled %s, banner overall %, and per-student mastery all trace to the same matrix; per-scope reconciliation assertion passes; absent/not-attempted never render red.
- Build clean; ChapterReport renders bands + flags; deep-dive card shows "—" not "null%".

## Out of scope
- Real DB (stays deterministic mock).
- Recalibrating final band thresholds (placeholders; needs real distribution).
- `topic-weakness` per-student×topic flag — phase 2.
- Batch roster / institute reports — Students-tab roster stays on the old generator for now (won't fully reconcile until phase 2).
