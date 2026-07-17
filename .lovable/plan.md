
## Validation of your points (after reading the Concept Note)

Yes — your requirements match the document. The note explicitly defines **two submissions**: a **Progress submission** (Aug 2026, mid-programme check-in) and a **Final submission** (early Sept 2026, pitch/prototype). Every final submission must carry a **"Policy & SDG Lens"** (national mission + primary SDG + affected people + intended improvement + track/theme). Tracks are **Sustainability**, **Health & Well-being**, **Open Arena**. Judging rubric = 6 weighted criteria (problem relevance, investigation & evidence, scientific reasoning, originality, feasibility & impact, policy/SDG/ethics/communication). Outputs differ per track (evidence report / pitch deck / prototype / video). So your ask — **two submissions, tabbed form + evidence uploads, deadline countdown, admin extension, inline preview** — is fully aligned. ✅

---

## What changes, at a glance

| Login | Page | Change |
|---|---|---|
| **Admin** | Submission forms | Per-track **× per-stage** builder (Progress / Final), each stage has an **Open date, Deadline, Extension controls**, and **multi-section tabs** (Form / Evidence / Deck) |
| **Admin** | New: Submissions timeline strip | Enable/disable each stage, extend deadline (auto propagates timer), lock/unlock edits |
| **Team** | Submission page | Two top-level cards: **Progress submission** & **Final submission**; each opens a tabbed form (Overview → Evidence/Survey → Deck/Prototype → Review & Submit) with a **live countdown**, autosave draft, lock after deadline |
| **Team** | Resources | Add **inline preview** (PDF/image/video/doc via Google-viewer fallback) alongside Download |
| **Staff (Judge)** | Score sheet | Read-only view now shows both Progress + Final submission tabs so judges can compare progression |

---

## 1. Team login — `/team/submissions`

Rebuild `src/pages/ritx/team/Submission.tsx` as a **stage-picker shell**, not a single flat form.

**Top area (compact, no wasted header space):**
- Compact page header (title + team chip inline, no `PageHeader` vertical padding — replace with `<div className="flex items-center justify-between">`)
- Two stage cards side-by-side:
  - **Progress submission** — status pill, progress %, **countdown chip** ("Closes in 3d 4h"), CTA "Continue" / "Start" / "Locked"
  - **Final submission** — same layout; disabled with tooltip "Opens after Progress deadline" until admin opens it

**Inside a stage (route: `/team/submissions/:stageId`):**
Tabbed form (shadcn `Tabs`, sticky under header):
1. **Overview** — Project title, Track (readonly from registration), Sub-theme, **SDG multi-select**, **Government mission** select, **Problem statement**, People affected, Intended improvement, Abstract. (Progress stage = shorter version; Final = full "Policy & SDG Lens" per concept note §5.)
2. **Evidence / Survey** — Multi-file upload block ("Add survey attachment"), each row: title + file + optional notes. Supports repeated attachments (photos, survey PDFs, data sheets). Show list with inline remove.
3. **Deck / Prototype** — Pitch deck upload (PDF/PPTX), demo video URL (YouTube/Vimeo), optional prototype photos, optional GitHub/other link. On Progress stage this becomes **"Work-in-progress artifacts"** (looser, optional).
4. **Review & Submit** — Field-by-field summary, missing-item checklist, big Submit button + Save draft.

**Header of the stage screen** (persistent, compact):
```
[← Back]  Progress submission   ● In progress   ⏱ 3d 04h to deadline   [Save draft] [Submit]
```
- Countdown recomputes every minute from `stage.deadlineAt`.
- If `now > deadlineAt`: banner "Deadline passed — saved as draft, editing disabled", all inputs go `disabled`, Submit hidden.
- If admin extends: mock data change re-renders new countdown automatically (state is derived).

**Compactness rules** applied everywhere:
- Kill `PageHeader` on submission screens (replace with a 40px inline bar).
- Card padding `p-4` → `p-3`; section `space-y-4` → `space-y-2`.
- Field label + input in the same row on ≥md; helper text `text-[11px]`.
- No decorative gradients inside form area — keep white surface for scan-ability (ERP feel), reserve warm gradient for outer shell only.

---

## 2. Admin login — `/admin/submission-forms`

Extend `SubmissionForms.tsx` + `submissionData.ts`:

**Data shape change** (`submissionData.ts`):
```ts
type StageId = "progress" | "final";
interface FormSection { id: string; label: string; fields: SubmissionField[]; } // tab
interface StageForm {
  stageId: StageId;
  openAt: string; deadlineAt: string;
  status: "draft" | "open" | "closed";
  editable: boolean;
  sections: FormSection[];  // Overview / Evidence / Deck
}
interface TrackSubmissionForm { trackId: string; stages: Record<StageId, StageForm>; updatedAt: string; }
```
Team-side record gains `stageId` and stores answers per stage.

**Builder UI** (compact ERP feel):
- Track tabs (existing) → inside, **Stage sub-tabs** `Progress | Final`
- Inside each stage:
  - Top strip: `Open date` `Deadline` `[Extend +N days]` `Status pill` `Editable switch`
  - Section tabs: Overview | Evidence | Deck (Add section button)
  - Field editor list (existing `FieldEditor`) scoped to the active section
- Right column: **Live preview** now renders the exact tabbed team view for that stage.

**Deadline extension**: `[Extend deadline]` opens a small popover with +1d/+3d/+7d chips + custom date. Saves to mock state; team countdown updates.

**Seed content** for defaults (mapped to concept note):
- Progress → Overview only: title, track, sub-theme, SDG (multi), mission, problem, methodology outline, 150-word progress note. Evidence = optional early survey files. Deck = disabled.
- Final → full 3 sections including "Policy & SDG Lens" fields, mandatory pitch deck + demo video, prototype stage select for Innovator track, sample-size for Sustainability, impact narrative for Open Arena.

---

## 3. Staff / Judge — `/staff/judge/:teamId`

Add `Tabs` `Progress | Final` in the read-only scoresheet so judges scroll less and can compare stages. Rubric panel unchanged.

---

## 4. Resources — inline preview (both `team/Resources.tsx` and `staff/mentor/Resources.tsx`)

- Add "Preview" icon button next to Download.
- Click opens a `Dialog` (max-w-4xl, h-[80vh]) with a viewer routed by mime:
  - **PDF** → `<iframe src={url} />`
  - **image/*** → `<img>`
  - **video** → `<video controls>`
  - **YouTube/Vimeo URL** → embed iframe
  - **DOC/PPT** → `<iframe src="https://docs.google.com/gview?url=...&embedded=true" />` fallback with a "Download to view" note.
- Extend `Resource` type with `url` and `mime` (mock data update — use SAMPLE_PDF/SAMPLE_IMAGE already present in `submissionData.ts`).

---

## Technical section

**Files to add/edit** (frontend only, mock data, no backend):
- `src/data/ritx/submissionData.ts` — new stage/section schema + seed for Progress & Final per track; helper `stageStatus(stage, now)`, `timeToDeadline(stage)`.
- `src/pages/ritx/team/Submission.tsx` — stage-picker landing.
- `src/pages/ritx/team/SubmissionStage.tsx` (new) — tabbed form (Overview/Evidence/Deck/Review) with sticky compact header + countdown.
- `src/components/ritx/shared/DeadlineTimer.tsx` (new) — recomputes with `setInterval(60_000)`; returns `{label, tone, expired}`.
- `src/pages/ritx/admin/SubmissionForms.tsx` — stage sub-tabs, section tabs, deadline controls, live preview per stage.
- `src/pages/ritx/staff/judge/ScoreSheet.tsx` — stage tabs for review.
- `src/pages/ritx/team/Resources.tsx` + `src/pages/ritx/staff/mentor/Resources.tsx` — preview dialog.
- `src/components/ritx/shared/ResourcePreviewDialog.tsx` (new).
- `src/data/ritx/staffData.ts` — add `url`, `mime` to `Resource`.
- `src/routes/RitxRoutes.tsx` — add `/team/submissions/:stageId` route.

**Compactness pass:** on every RiTX submission-flow file, replace `PageHeader` with a 40-48px inline bar, drop card `p-4` → `p-3`, drop section `space-y-4` → `space-y-2`, tighten label text to `text-xs`.

**No backend changes.** All state via React + module-level mock updates. Deadlines are ISO strings in mock data; extending updates the same object so the timer re-derives.

**Verification:** `bunx tsgo --noEmit` + Playwright smoke on `/team/submissions`, `/team/submissions/progress`, `/team/submissions/final`, `/admin/submission-forms`, `/team/resources` (open preview dialog).
