# Student Progress — Subjects Tab QA

> Tests the Subjects tab grid AND its `SubjectDeepDive` drill-in at `/student/progress` with `activeTab = "subjects"`. **Read [Setup & Preconditions](./student-reports-setup-and-preconditions-qa.md) first.**

Component files: `SubjectOverviewGrid`, `SubjectDeepDive`, `ChapterMasteryList`, `WeakTopicsAlert`. Data: `getSubjectSummaries()`, `getSubjectDetail(subjectId)`.

### Threshold reference
75 / 50 / 35. See Setup §Threshold Reference.

---

## A. Grid State

**Why this matters:** the grid is the source of truth for "which subjects do I actually study?" — a missing subject means a missing curriculum binding upstream.

**Scenarios**

- **A1.** Confirm one tile per subject mapped to the student's batch. Subject count must equal `getSubjectSummaries().length` and must equal the count visible in the Institute panel's batch view. Mismatch → **P0** (curriculum-binding).
- **A2.** A subject with **zero attempts** must render with placeholder values (e.g. "—", "Not yet attempted") rather than `0%` in red — a fresh student should not be branded "At Risk" before they sit any test.
- **A3.** Color tier on each tile follows Setup §Threshold Reference.
- **A4.** Default sort: highest-average first OR worst-first (verify against `subject-health-sorting-logic` memory). If both Subjects tab and Overview grid disagree on ordering, file P1 (inconsistency).

**What to try:** remove a subject mapping at the Institute level and re-login → tile must disappear within one session. Surviving tile after re-login = **P0** stale cache.

---

## B. Selection & Deep-Dive

**Scenarios**

- **B1.** Tap a tile → `SubjectDeepDive` mounts inside the tab; the page does NOT navigate away from `/student/progress`. The URL must remain `/student/progress` (no route change). Route change = **P1** (architecture deviation).
- **B2.** `SubjectDeepDive` shows a Back affordance → returns to the grid with `selectedSubjectId = null`. Scroll position of the grid should be restored to where the tile was tapped, not jump to top. Scroll jump → **P2**.
- **B3.** Lazy-load skeleton (`SubjectGridSkeleton`) appears under throttled network; no layout shift after the deep-dive replaces it.

---

## C. Per-Subject Metrics

**Scenarios**

- **C1.** Subject average displayed in `SubjectDeepDive` must equal `round(mean(examsForSubject[].percentage))`. Cross-check with Exams tab by filtering to that subject. Mismatch → **P0**.
- **C2.** Exam count = number of attempts for that subject (Grand Tests and PYPs in which the subject participated must be included). Excluding a Grand Test → **P1** under-counting.
- **C3.** Weak chapters list (if rendered) uses `< 50` per the project-wide convention (`reports-students.md`). Any chapter at 50% appearing as weak → **P1** off-by-one.
- **C4.** Trend arrow direction matches the slope of the last 3 exam attempts for the subject.

---

## D. Cross-Tab Handoff

**Why this matters:** the Overview → Subjects handoff is the single most-used flow.

**Scenarios**

- **D1.** From Overview tab, tap a subject tile → land on Subjects tab with `SubjectDeepDive` already open for that subject. Landing on grid root = **P1**.
- **D2.** Switch to a different top-level tab (e.g., Insights) → return to Subjects → `selectedSubjectId` should be cleared (per `Progress.tsx` `setActiveTab` logic: `if (tab.key !== "subjects") setSelectedSubjectIdRaw(null)`). Persisting selection across full tab switches is a known intentional reset — verify.
- **D3.** Direct deep-link reload of `/student/progress` (no state) → lands on Overview, not on the previously-open deep-dive. Acceptable per current architecture; document as expected.

---

## E. Multi-Track Curriculum

**Why this matters:** students on multiple tracks (e.g., NEET aspirant who also follows CBSE) have curriculum-track persistence in localStorage (`student-portal-curriculum-persistence` memory).

**Scenarios**

- **E1.** With two tracks enabled, switch track in Subjects landing → the deep-dive's chapter list must update to the new track's chapters within one render. Stale chapters from the old track → **P0** (track leakage).
- **E2.** Track badge color must follow `curriculum-switcher-ui-standards` memory (track-specific color mapping).
- **E3.** Clear localStorage `student-curriculum-*` → reload → page must fall back to the auto-selected default track without crashing.

---

## F. Empty States

**Scenarios**

- **F1.** Brand-new student with zero attempts on any subject → grid renders all curriculum tiles with placeholder values; deep-dive shows "No exam history yet — start with your first test" CTA linking to `/student/tests`. Broken CTA → **P1**.
- **F2.** Subject with chapters but no attempts → `ChapterMasteryList` shows all chapters at "Not started" without painting any band color (no false-red).
- **F3.** Subject with one attempt → trend arrow defaults to `"stable"`, not `"up"` (1 data point cannot be a trend).

---

## Done Criteria

- Grid count matches Institute curriculum binding.
- Deep-dive averages cross-check with Exams tab filtered series.
- No false-red on fresh accounts.
- Track switching does not leak chapters across tracks.