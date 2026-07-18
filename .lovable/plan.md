# Multi-attachment evidence uploads

## Goal
Let teams attach as many evidence files as they want per submission stage, and tag each one against a rubric criterion (Problem relevance, Investigation & evidence, Scientific reasoning, Originality & creativity, Feasibility & impact, Policy/SDG/ethics & communication) so judges know why the file was uploaded.

## What changes

### 1. Attachment shape (`SubmissionStage.tsx`)
Replace the current `Attachment { id, title, name, sizeKb }` with:

```
Attachment {
  id, category, title, description, name, sizeKb
}
```

- `category`: dropdown of the 6 rubric criteria (source of truth added to `submissionData.ts` as `EVIDENCE_CATEGORIES`, tagged with weight so we can show "25%" next to the label).
- `title`: short label (existing).
- `description`: 1–2 line textarea explaining what the file shows.
- File picker unchanged.

### 2. Redesigned `AttachmentsBlock`
- Header row: "Evidence & attachments" + helper "Add one row per artefact. You can attach as many as you like and tag each one to a judging criterion."
- "Add attachment" primary button opens an inline row (not a modal) with: Category select · Title · File picker · Description textarea · Save / Cancel.
- List rendered as cards (not table) so descriptions wrap cleanly on mobile:
  - Left: category chip (color-coded by criterion) + title (bold) + filename + size.
  - Below: description in muted text.
  - Right: edit + delete icon buttons.
- Empty state: dashed card "No evidence added yet — start with your strongest artefact."
- Optional grouping toggle: "Group by criterion" (default on) so judges see coverage per category; shows a small "0 files" hint for criteria with nothing attached yet.

### 3. Validation
- Category + title + file are required to save a row; description optional but recommended (soft hint under textarea).
- Same per-field 15 MB file cap already enforced elsewhere.

### 4. Where it applies
Both Progress and Final stages already render `AttachmentsBlock` via `section.builtInAttachments`, so no changes needed in `submissionData.ts` sections — only the new `EVIDENCE_CATEGORIES` constant.

### 5. Judge / Admin side
`SubmissionViewer` currently lists attachments flat. Update it to:
- Group attachments by category (matching the team's grouping).
- Show category chip + title + description above the preview button, so judges reading the rubric criterion can jump straight to matching evidence.

No scoring logic changes — this is purely how evidence is captured and displayed.

## Out of scope
- No backend, no persistence beyond the existing mock state.
- No changes to rubric weights or scoring UI.
- Progress vs Final stage definitions stay as they are.
