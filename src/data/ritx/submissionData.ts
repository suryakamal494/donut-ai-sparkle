// Mock data for RiTX Phase 2 — submission form builder + team submissions

export type FieldType =
  | "short-text"
  | "long-text"
  | "number"
  | "url"
  | "select"
  | "multi-select"
  | "file"
  | "video-url";

export interface SubmissionField {
  id: string;
  type: FieldType;
  label: string;
  helper?: string;
  required: boolean;
  min?: number;
  max?: number;
  options?: string[];
  accept?: string; // for file
  maxSizeMb?: number;
}

export interface TrackSubmissionForm {
  trackId: string;
  updatedAt: string;
  editable: boolean;
  fields: SubmissionField[];
}

export const defaultFields = (trackId: string): SubmissionField[] => {
  const common: SubmissionField[] = [
    { id: "title", type: "short-text", label: "Project title", required: true, min: 4, max: 80 },
    { id: "abstract", type: "long-text", label: "Abstract", helper: "150–300 words summarising your work.", required: true, min: 150, max: 300 },
  ];
  if (trackId === "sci-investigator") {
    return [
      ...common,
      { id: "hypothesis", type: "long-text", label: "Hypothesis", required: true, min: 40, max: 500 },
      { id: "methodology", type: "long-text", label: "Methodology", required: true, min: 100, max: 1000 },
      { id: "sample-size", type: "number", label: "Sample size / observations", required: true, min: 1, max: 100000 },
      { id: "report", type: "file", label: "Full report (PDF)", required: true, accept: "application/pdf", maxSizeMb: 20 },
      { id: "video", type: "video-url", label: "3-minute explainer video (YouTube/Vimeo)", required: false },
    ];
  }
  if (trackId === "innovator") {
    return [
      ...common,
      { id: "problem", type: "long-text", label: "Problem statement", required: true, min: 50, max: 500 },
      { id: "solution", type: "long-text", label: "Proposed solution", required: true, min: 100, max: 1000 },
      { id: "prototype-stage", type: "select", label: "Prototype stage", required: true, options: ["Concept", "Paper prototype", "Working model", "Deployed pilot"] },
      { id: "materials", type: "multi-select", label: "Materials used", required: false, options: ["Electronics", "3D print", "Wood", "Recycled", "Software only", "Other"] },
      { id: "pitch", type: "file", label: "Pitch deck (PDF, ≤10MB)", required: true, accept: "application/pdf", maxSizeMb: 10 },
      { id: "demo", type: "video-url", label: "Demo video URL", required: true },
    ];
  }
  return [
    ...common,
    { id: "sdg", type: "select", label: "Primary SDG addressed", required: true, options: ["SDG 3", "SDG 4", "SDG 7", "SDG 11", "SDG 13"] },
    { id: "impact", type: "long-text", label: "Impact narrative", required: true, min: 100, max: 800 },
    { id: "artifact", type: "file", label: "Supporting artifact", required: false, accept: "application/pdf,image/*", maxSizeMb: 15 },
    { id: "reference", type: "url", label: "Reference link", required: false },
  ];
};

export const initialForms: TrackSubmissionForm[] = [
  { trackId: "sci-investigator", updatedAt: "2026-07-10", editable: true, fields: defaultFields("sci-investigator") },
  { trackId: "innovator", updatedAt: "2026-07-10", editable: true, fields: defaultFields("innovator") },
  { trackId: "open-arena", updatedAt: "2026-07-10", editable: true, fields: defaultFields("open-arena") },
];

export type SubmissionStage = "not-started" | "in-progress" | "submitted" | "locked" | "returned";

export interface TeamSubmissionRecord {
  teamId: string;
  stage: SubmissionStage;
  progressPct: number;
  lastEditedAt: string;
  submittedAt?: string;
  version: number;
}

export const mockTeamSubmissions: TeamSubmissionRecord[] = [
  { teamId: "t1", stage: "in-progress", progressPct: 40, lastEditedAt: "2026-09-18T10:20:00", version: 2 },
  { teamId: "t2", stage: "submitted", progressPct: 100, lastEditedAt: "2026-10-02T14:11:00", submittedAt: "2026-10-02T14:12:00", version: 1 },
  { teamId: "t3", stage: "not-started", progressPct: 0, lastEditedAt: "", version: 0 },
];

export const stageLabel: Record<SubmissionStage, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  submitted: "Submitted",
  locked: "Locked",
  returned: "Returned for edits",
};

export const stageTone: Record<SubmissionStage, string> = {
  "not-started": "bg-slate-100 text-slate-600 border-slate-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  submitted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  locked: "bg-slate-200 text-slate-700 border-slate-300",
  returned: "bg-rose-100 text-rose-700 border-rose-200",
};

export const fieldTypeLabel: Record<FieldType, string> = {
  "short-text": "Short text",
  "long-text": "Long text",
  number: "Number",
  url: "URL",
  select: "Single select",
  "multi-select": "Multi select",
  file: "File upload",
  "video-url": "Video URL",
};