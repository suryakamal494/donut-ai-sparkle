## Goal

Rewrite `docs/06-testing-scenarios/inter-login-tests/timetable-upload-qa.md` so a first-time tester can stress-test the Upload feature end-to-end: real-world image samples, OCR/extraction edge cases, batch/teacher/subject validation, and most importantly **partial-week embed + conflict management** against an already-populated timetable.

Same 3-block scenario format as Workspace QA: **Self-Explanatory Title** → *What this is* / *What to try* / *Expected*. No "Background" or "Why it matters".

---

## Ground truth from the codebase (drives realistic scenarios)

Verified against `TimetableUpload.tsx`, `useTimetableUpload.ts`, `ParsedTimetableValidator.tsx`:

- **File picker accepts `image/*` only** (JPG, PNG, screenshots). The UI hint says "PDF photos" but PDF and Excel files are blocked by the input. Scenarios must cover this gap.
- **Batch must be selected before upload** is enabled.
- **No week/date picker** — embed always targets the current week of the chosen batch.
- **Validation runs after parse**, with these categories: teacher-not-found, teacher-not-assigned-to-batch, subject-not-in-batch, low-confidence (<0.8), duplicate slot inside parsed set.
- **Embed conflict check** only compares parsed entries against existing entries in the **same batch / same day / same period**. Teacher clashes across other batches are NOT pre-checked at embed time (they appear later in Workspace conflict panel).
- **Resolution choices**: Cancel, Skip Conflicts (embed only non-overlapping), Replace All (overwrite).
- **Blocking errors disable Embed**; warnings (low confidence, duplicates) do not.

These facts surface real bugs testers should hunt — not abstract scenarios.

---

## Document structure

1. **Header & "Before You Begin"** — reframed to require testers to gather **real-world timetable samples** from the internet (school websites, coaching institutes, screenshots from WhatsApp, handwritten paper photos) and to **manually create a partially-filled batch timetable** before testing embed conflicts.

2. **What "Good" Upload Means** — short principle box: extract → validate → resolve conflicts → embed without destroying existing data.

3. **The 7 Failure Modes Testers Must Hunt** — quick-reference list (file format rejection, OCR garbage on handwritten, partial-week overwrite, silent teacher mismatch, cross-batch teacher clash missed, week-context loss, replace-all data loss).

4. **Test Scenarios** organised in sections:

   - **A. File Format & Input Edge Cases** (~9 scenarios)
     PDF rejection, Excel rejection, multi-page PDF expectation, very large image (>10MB), tiny/blurry image, screenshot of digital timetable, photo with glare/shadow, rotated/skewed photo, handwritten paper photo.

   - **B. Real-World Sample Sourcing** (~5 scenarios)
     Each scenario instructs the tester to find a specific timetable style online or create one, upload it, and report what extraction did. Styles: CBSE school grid, coaching-institute weekly grid, college timetable with merged cells, color-coded teacher chart, handwritten chalkboard photo.

   - **C. OCR / Extraction Quality** (~7 scenarios)
     Low-confidence flagging, name-variation matching ("Mr. Sharma" vs "Priya Sharma"), subject abbreviation ("Maths" vs "Mathematics"), missing periods, extra parsed periods that don't exist, teacher name typos that almost match, two teachers with similar names.

   - **D. Validation Errors & Action Links** (~6 scenarios)
     Teacher not in institute, teacher in institute but not in batch, teacher in batch but wrong subject mapping, subject not in batch curriculum, "Add Teacher" / "Manage Teachers" deep links preserve upload context, fixing one error re-runs validation.

   - **E. Partial-Week Embed Into Existing Data** (~8 scenarios — most critical)
     Each scenario starts by telling the tester to **pre-populate the target batch's week to ~50%** in Workspace, then upload a parsed set that fills different/overlapping slots. Covers: embed into empty week, embed into 50% filled week with no overlap, embed with partial overlap (Skip Conflicts), embed with partial overlap (Replace All), embed where parsed set has fewer entries than existing, cancel mid-conflict-dialog leaves nothing changed, embed preserves non-overlapping existing entries, undo after embed in Workspace.

   - **F. Conflict Detection Coverage** (~7 scenarios)
     Tester is asked to deliberately construct conflicts before upload: same teacher already teaching another batch at that slot, teacher overload after embed, batch already has a holiday on that day, slot falls on non-working day, parsed entry hits an exam-block slot, parsed slot exceeds period count for the day, two parsed entries hitting the same slot.

   - **G. Week & Date Context** (~4 scenarios)
     Document the current limitation (always embeds to current week), test changing batch after upload re-validates, switching batch mid-flow clears parsed state, embed appears in correct week of Workspace immediately.

   - **H. Post-Embed Verification** (~5 scenarios)
     After embed, open Workspace and verify: entries appear in correct slots, conflict panel re-evaluates with new entries, teacher load counters update, weekly/monthly views render embedded entries, print/export includes embedded entries.

5. **Critical Bugs QA Must Flag Immediately** — refreshed list of ~10 real bugs (silent overwrite, replace-all without confirmation snapshot, teacher fuzzy-match accepting wrong teacher, embed succeeds despite blocking error, batch change leaves stale parsed state, conflict dialog cancel still mutates Workspace, handwritten garbage parsed silently as valid, etc.).

6. **Suggested Execution Order** — file format → real samples → OCR quality → validation → partial-week embed → conflict coverage → post-embed verification.

7. **Related Documentation** — keep existing links.

---

## Style rules (same as Workspace QA)

- Self-explanatory titles: e.g. "Uploading A PDF Should Be Rejected At The File Picker, Not Silently Accepted" instead of "PDF Upload".
- Every scenario uses the 3-block format. No tables of expected/actual.
- *What to try* always tells the tester **what to set up first** (which batch, what existing entries, which sample image to source) before exercising the feature.
- IDs follow `TT-UPLOAD-A1`, `TT-UPLOAD-B1`, etc., matching the existing convention.
- Scope strictly to the Upload page — Workspace conflict-panel deep behaviour stays in Workspace QA, but cross-references are added.

---

## Files touched

- `docs/06-testing-scenarios/inter-login-tests/timetable-upload-qa.md` — full rewrite (overwrite via `code--exec` heredoc, like Workspace doc).
- `.lovable/plan.md` — append note that Upload doc is now done; Setup and Substitution remain.

No code, no navigation file changes (Upload doc is already registered).

---

After approval I rewrite the file in one pass, then ask you which doc to tackle next (Setup or Substitution).