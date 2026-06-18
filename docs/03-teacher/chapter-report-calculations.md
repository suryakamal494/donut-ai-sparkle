# Chapter Report — Calculation Spec (v4)

This document defines the exact math behind every number on the teacher **Chapter Report** (`/teacher/reports/:batchId/chapters/:chapterId`): the Topic Heatmap %, the chapter Overall %, and the Student Segregation into bands with diagnostic flags. It defines every edge case and how it is handled.

The report serves a teacher triaging ~40 students after a chapter is complete:
- the **band** answers *who* to help and in what priority;
- the **flags** answer *how* to help.

---

## 1. Core principle — one Response Matrix

Previously each card was generated independently with random numbers, so a topic could read 30% while every student read 80% — the cards never reconciled.

**Now:** a single deterministic **response matrix** is built per `(chapter, batch)`. Every displayed value is an aggregate (a reduction) over this matrix — never a standalone random number. This guarantees Topic Heatmap, Overall %, Student bands, Trends and flags all reconcile back to the same responses.

```text
ResponseRecord = {
  examId
  assessmentType : "chapterTest" | "classTest" | "dpp"   // stakes + graded/practice split
  chapterId, topicId, questionId, studentId
  attempted : boolean
  correct   : boolean        // only meaningful when attempted === true
  timeRatio?: number         // timeUsed / allotted; absent on untimed DPPs
}
```

Each student carries a hidden `ability` and each topic a hidden `difficulty` so the mock looks realistic, but every shown value is computed.

### Deterministic generation (mock/dev data)
```text
studentAbility  ∈ [0.2, 0.9]
topicDifficulty ∈ [0.2, 0.9]

pCorrect  = 1 / (1 + e^(-(ability - difficulty) * 5))
pAttempt  = clamp(0.55 + ability * 0.4, 0, 1)   // realistic engagement (~0.62–0.91); keeps mastery aligned to accuracy
timeRatio = clamp(0.8 - ability * 0.4 + noise, 0.1, 1)   // timed assessments only
```
A PRNG is seeded with `hash(chapterId + batchId)` and every value is drawn from that one stream in a fixed iteration order (assessment → topic → question → student), so the same chapter/batch always reproduces the same report. `Math.random()` is **not** used.

---

## 2. Topic Heatmap — the "%" on each card

```text
avgSuccessRate(topic) = round( Σ correct / Σ attempted × 100 )   // pooled at response level
questionsAsked(topic) = distinct questions from the topic across in-scope assessments
examsAppeared(topic)  = # assessments containing ≥1 question from the topic
```

**Pooled, not averaged per student.** Student A scores 1/1, Student B scores 50/100.
- Pooled = 51/101 = **50.5%** (correct).
- Averaged = (100% + 50%)/2 = 75% (wrong — a 1-question student skews it).

**Status / colour:** `strong ≥ 65`, `moderate ≥ 40`, else `weak`. Heatmap tile colour uses this same 65/40 scale (`getTopicColor`) so a card's colour always matches its label.

**Chapter Overall %** (banner) = pooled `Σ correct / Σ attempted` across **all** topics — *not* the mean of card percentages (topics carry very different question volumes).

### Edge cases
| Case | Handling |
|------|----------|
| Denominator 0 (asked, nobody attempted) | `avgSuccessRate = null` → render "—" + neutral grey "Not attempted". **Never 0%.** |
| `questionsAsked = 0` (never tested) | Hide the card. |
| Low data | `LOW_DATA_THRESHOLD = 2`; `lowData = attempted ≤ 2` — still computed, flagged "low data". |
| Rounding | Round once at the end; keep the raw ratio for stable sorting. |

---

## 3. Student Segregation — Band + Diagnostic Flags

The old single blended Performance Index is **retired**. Averaging Accuracy, Consistency, Time Efficiency and Attempt Rate into one number merged different student types into the same band and hid the intervention. Replacement: **one mastery score decides the band; every other signal becomes a flag that names the intervention.**

### Scope rule
- **Chapter report** → all chapter assessments (chapterTest + classTest + dpp) aggregated.
- **Single-test report** → that test only.

The same student may land in different bands at different scopes (e.g. Mastery on the chapter-test-only view, Stable on the chapter aggregate). This is intentional; the reconciliation assertion runs per scope.

### 3.1 Mastery score — the band decider
```text
STAKES_WEIGHT = { chapterTest: 1.0, classTest: 0.6, dpp: 0.3 }   // tunable

mastery = round( Σ(w · correct) / Σ(w · asked) × 100 )           // 0–100
```
A skipped question stays in the denominator (`asked`), so avoiding questions lowers mastery — Accuracy and Attempt Rate are folded honestly into one number. The chapter test dominates: a student can't practice their way into Mastery on low-stakes DPPs, nor lose a band over one missed DPP.

`DIFFICULTY_WEIGHTING = false` (placeholder): when enabled, multiply each question's `w` by its difficulty so hard questions count more.

### 3.2 Bands (inclusive lower bounds)
```text
Mastery Ready          mastery ≥ 75
Stable Progress        50 ≤ mastery < 75
Reinforcement Needed   35 ≤ mastery < 50
Foundational Risk      mastery < 35
```
> **Thresholds are placeholders.** `correct/asked` runs harsher than the old blended PI (skipped + wrong are now in the denominator), so 75/50/35 must be recalibrated against a real class distribution before launch — you don't want 30 of 40 in Risk on a hard chapter.

### 3.3 Diagnostic signals (feed flags — never the band)
```text
testMastery       = stakes-weighted correct/asked on graded tests only (chapterTest + classTest)
practiceMastery   = correct/asked on DPPs only
dppEffort         = attempted/asked on DPPs
pacing            = clamp(round(100 − avg(timeRatio) × 100), 0, 100)   // on correct timed answers; suppressed if no timing
perTestAccuracy[] = round(correct/attempted × 100) per assessment, attempted ≥ MIN_ATTEMPTS_PER_EXAM (=1)
consistency       = clamp(round(100 − stdDev(perTestAccuracy) / 30 × 100), 0, 100)   // population stdDev; needs ≥2 tests
trend             = slope(perTestAccuracy): > 2 up, < -2 down, else flat
```

### 3.4 Flags — max 2 shown, priority-ordered
```text
cracks-under-pressure : practiceMastery − testMastery ≥ 20   (needs both DPP and graded data)
disengaged            : dppEffort < 60
conceptual-gap        : practiceMastery < 50 AND testMastery < 50
declining             : trend = down
topic-weakness        : ≥1 in-scope topic below the student's weak cut   (phase 2)
pacing                : pacing < 40
inconsistent          : ≥3 tests-with-attempts, stdDev > 15
plateaued             : ≥3 tests-with-attempts, stdDev < 5, slope ≈ 0, AND band < Mastery Ready
improving             : trend = up
```
```text
FLAG_PRIORITY = [
  cracks-under-pressure,  // non-obvious, specific fix — most decision-changing
  disengaged,             // gating: fix engagement before diagnosing knowledge
  conceptual-gap, declining, topic-weakness,
  pacing, inconsistent, plateaued, improving
]
```
Sort by priority, then take the top 2. **Display discipline (40-student class):** one band + at most two flags per student; the mastery score is the sortable column and never appears without its flags.

### 3.5 Bucket edge cases + assertion
| Case | Bucket | masteryScore |
|------|--------|--------------|
| `Σ asked = 0` in scope | **Absent** (own line, excluded from the 4 bands AND from Not-attempted) | `—` |
| `asked > 0`, `attempted = 0` | **Not attempted** (own line) | `—` (never 0 — that would falsely inflate Risk) |

```text
total = masteryReady + stableProgress + reinforcementNeeded
      + foundationalRisk + notAttempted + absent
console.assert(total === studentsInScope, "Bucket counts do not reconcile")
```

---

## 4. Where it lives (implementation)

| File | Responsibility |
|------|----------------|
| `src/lib/performanceIndex.ts` | `ResponseRecord`/`Band` types, `STAKES_WEIGHT`, `computeStudentSegregation()` (mastery + flags), `bandFromMastery()`, `FLAG_META`. |
| `src/data/teacher/reportsData.ts` | `buildResponseMatrix(chapterId, batchId)` (seeded, deterministic) + `generateChapterDetail()` deriving topics / overall / examBreakdown / studentBuckets from the matrix. |
| `src/lib/reportColors.ts` | `getTopicColor(status)` on the 65/40 topic scale + `NEUTRAL_TOPIC_COLORS`. |
| `src/components/teacher/reports/TopicHeatmapGrid.tsx` | Neutral "Not attempted / low data" rendering for `avgSuccessRate === null`. |
| `src/components/teacher/reports/StudentBuckets.tsx` | 6 bands incl. Absent / Not attempted; band + up to 2 flags per student. |

---

## 5. Out of scope (phase 2)
- Real database wiring — the matrix stays deterministic mock data for dev.
- Final recalibration of band thresholds (placeholders; needs a real class distribution).
- `topic-weakness` per-student × topic breakdown.
- Batch-roster / institute-level reports — the Students-tab roster still uses its own generator and does not yet fully reconcile with chapter buckets.

---

## Changelog
- **v4** — Blended PI retired → mastery-band + diagnostic flags; `assessmentType` (chapterTest/classTest/dpp) added enabling the cracks-under-pressure flag and the effort/mastery/resilience split; scope rule; Consistency & Time Efficiency demoted to flags; thresholds flagged for recalibration.
- **v3** — Flat `ResponseRecord`, `LOW_DATA_THRESHOLD`, sigmoid generator; population stdDev; Absent vs Not-attempted assertion fix; partial-timing, plateaued-at-mastery, `MIN_ATTEMPTS_PER_EXAM` edges.
- **v2** — perExamAccuracy standardised to 0–100; zero-attempt exams excluded; tag tie-break order; dev assertion scoped to `asked > 0`.