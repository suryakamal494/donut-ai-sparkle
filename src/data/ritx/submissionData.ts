// Mock data for RiTX Phase 2 — submission form builder + team submissions
import { mockTeams } from "./mockData";

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

export type AnswerValue =
  | string
  | number
  | string[]
  | { url: string; name: string; mime: string; sizeKb?: number };

export interface TeamSubmissionRecord {
  teamId: string;
  stage: SubmissionStage;
  progressPct: number;
  lastEditedAt: string;
  submittedAt?: string;
  version: number;
  answers: Record<string, AnswerValue>;
}

// ---- Deterministic generator ----
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Public sample PDF (Mozilla's tracemonkey demo — CORS-friendly for inline iframe).
const SAMPLE_PDF = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const SAMPLE_IMAGE = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=70";
const YOUTUBE_IDS = ["ZbdPjooZBcs", "4pKly2JojMw", "6avJHaC3C2U", "kJQP7kiw5Fk"];

const TITLES: Record<string, string[]> = {
  "sci-investigator": [
    "Impact of Urban Air Quality on School Attendance",
    "Low-Cost Water Purification Using Neem",
    "Studying Microplastics in Local Rivers",
    "Effect of Music on Plant Growth",
    "Solar Cooker Efficiency Across Seasons",
  ],
  innovator: [
    "Braille-to-Speech Wearable for Visually Impaired",
    "Smart Flood Sensor Grid for Coastal Villages",
    "Solar Drying Rack for Farmers",
    "Voice-Activated Study Companion for Rural Schools",
    "Recycled Plastic Bricks for Affordable Housing",
  ],
  "open-arena": [
    "Community Learning Circles for Girls' Education",
    "Waste-Segregation Awareness Game",
    "Rooftop Kitchen Gardens Handbook",
    "Mental Wellness Peer Support Network",
    "Renewable Micro-grid Simulator",
  ],
};

const ABSTRACTS = [
  "Our team explored a real-world problem affecting our community and designed a systematic approach to investigate causes and possible interventions. Over three months we collected data, iterated on our hypothesis, and worked with a mentor to validate results. The findings suggest concrete next steps that could scale to nearby schools and neighbourhoods with modest resources. We believe the approach is both practical and rooted in evidence. This abstract summarises our journey and headline result.",
  "This project addresses a challenge that affects many students and families around us. We designed and tested a low-cost intervention, gathered qualitative and quantitative evidence, and refined our approach across three iterations. Our results point to a promising direction that could be adopted with minimal investment. We also discuss limitations and the ethical considerations that shaped our work.",
];

function pickAnswer(field: { id: string; type: string; options?: string[] }, r: () => number, trackId: string, seedIdx: number): AnswerValue {
  switch (field.type) {
    case "short-text":
      if (field.id === "title") return TITLES[trackId][seedIdx % TITLES[trackId].length];
      return "Team submission entry";
    case "long-text":
      return ABSTRACTS[seedIdx % ABSTRACTS.length];
    case "number":
      return 20 + Math.floor(r() * 480);
    case "url":
      return "https://example.com/team-reference";
    case "select":
      return field.options?.[Math.floor(r() * (field.options?.length ?? 1))] ?? "";
    case "multi-select": {
      const opts = field.options ?? [];
      return opts.filter(() => r() > 0.5).slice(0, 3);
    }
    case "file":
      return { url: SAMPLE_PDF, name: `${field.id}-v${seedIdx}.pdf`, mime: "application/pdf", sizeKb: 800 + Math.floor(r() * 2400) };
    case "video-url":
      return `https://www.youtube.com/watch?v=${YOUTUBE_IDS[seedIdx % YOUTUBE_IDS.length]}`;
    default:
      return "";
  }
}

function generateSubmissions(): TeamSubmissionRecord[] {
  const rand = mulberry32(101);
  const stagePool: SubmissionStage[] = [
    "submitted", "submitted", "submitted", "submitted", "submitted",
    "locked", "in-progress", "in-progress", "in-progress",
    "not-started", "returned",
  ];
  return mockTeams.map((t, i) => {
    const stage: SubmissionStage = stagePool[Math.floor(rand() * stagePool.length)];
    const fields = defaultFields(t.trackId);
    const answers: Record<string, AnswerValue> = {};
    // Only in-progress/submitted/locked/returned have answers
    if (stage !== "not-started") {
      const fillRate = stage === "in-progress" ? 0.6 : 1;
      fields.forEach((f, fi) => {
        if (rand() <= fillRate) answers[f.id] = pickAnswer(f, rand, t.trackId, i + fi);
      });
    }
    const progressPct =
      stage === "not-started" ? 0 :
      stage === "in-progress" ? 40 + Math.floor(rand() * 40) :
      stage === "returned" ? 70 + Math.floor(rand() * 20) : 100;
    const submittedAt = stage === "submitted" || stage === "locked"
      ? `2026-10-${String(1 + Math.floor(rand() * 27)).padStart(2, "0")}T14:00:00`
      : undefined;
    return {
      teamId: t.id,
      stage,
      progressPct,
      lastEditedAt: submittedAt ?? (stage === "not-started" ? "" : `2026-09-${String(1 + Math.floor(rand() * 27)).padStart(2, "0")}T10:00:00`),
      submittedAt,
      version: stage === "not-started" ? 0 : 1 + Math.floor(rand() * 3),
      answers,
    };
  });
}

export const mockTeamSubmissions: TeamSubmissionRecord[] = generateSubmissions();

export const submissionForTeam = (teamId: string) => mockTeamSubmissions.find((s) => s.teamId === teamId);

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

// =========================================================================
// PHASE 3 — Two-stage submission model (Progress + Final)
// Kept alongside the legacy `initialForms` above so SubmissionViewer/judging
// keep working. New team & admin flows read from `stageForms` below.
// =========================================================================

export type StageId = "progress" | "final";

export interface FormSection {
  id: string;
  label: string;
  /** If true, team renderer prepends a built-in Attachments uploader. */
  builtInAttachments?: boolean;
  /** If true, team renderer prepends a built-in Deck/Video block. */
  builtInDeck?: boolean;
  fields: SubmissionField[];
}

export interface StageForm {
  stageId: StageId;
  label: string;
  openAt: string; // ISO
  deadlineAt: string; // ISO
  editable: boolean;
  sections: FormSection[];
}

export interface TrackStageForms {
  trackId: string;
  updatedAt: string;
  stages: Record<StageId, StageForm>;
}

export const GOI_MISSIONS = [
  "Mission LiFE",
  "Swachh Bharat Mission",
  "Jal Jeevan Mission",
  "National Clean Air Programme",
  "PM E-DRIVE",
  "PM Surya Ghar: Muft Bijli Yojana",
  "Ayushman Bharat",
  "School Health & Wellness Programme",
  "National AYUSH Mission",
  "Fit India",
  "FSSAI Eat Right India",
  "POSHAN Abhiyaan",
  "Atal Innovation Mission",
  "Startup India",
  "Digital India",
  "Make in India",
  "Pradhan Mantri Jan-Dhan Yojana",
  "MyGov citizen participation",
];

export const SDG_OPTIONS = [
  "SDG 1 No Poverty",
  "SDG 2 Zero Hunger",
  "SDG 3 Good Health & Well-being",
  "SDG 4 Quality Education",
  "SDG 5 Gender Equality",
  "SDG 6 Clean Water & Sanitation",
  "SDG 7 Affordable & Clean Energy",
  "SDG 8 Decent Work & Growth",
  "SDG 9 Industry, Innovation & Infrastructure",
  "SDG 10 Reduced Inequalities",
  "SDG 11 Sustainable Cities",
  "SDG 12 Responsible Consumption",
  "SDG 13 Climate Action",
  "SDG 16 Peace & Justice",
  "SDG 17 Partnerships",
];

function isoOffsetDays(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours, 0, 0, 0);
  return d.toISOString();
}

function baseOverviewFields(trackId: string): SubmissionField[] {
  const track = trackId;
  const subThemeOptions =
    track === "sci-investigator"
      ? ["Health & Wellbeing", "Environment", "Energy", "Food & Agriculture", "Other"]
      : track === "innovator"
      ? ["Assistive Tech", "Climate Tech", "EdTech", "Rural Solutions", "Other"]
      : ["SDG 3", "SDG 4", "SDG 7", "SDG 11", "SDG 13", "Other"];
  return [
    { id: "title", type: "short-text", label: "Project title", required: true, min: 4, max: 90 },
    { id: "sub-theme", type: "select", label: "Sub-theme", required: true, options: subThemeOptions },
    { id: "sdgs", type: "multi-select", label: "Primary SDGs addressed", required: true, options: SDG_OPTIONS, helper: "Pick 1–3 SDGs your project targets." },
    { id: "mission", type: "select", label: "Government of India mission", required: true, options: GOI_MISSIONS, helper: "Aligns with concept note §5 – Policy & SDG Lens." },
    { id: "problem", type: "long-text", label: "Problem statement", required: true, min: 60, max: 500 },
    { id: "people-affected", type: "short-text", label: "People affected", required: true, min: 4, max: 120, helper: "e.g. Students of Class 8 in our school." },
  ];
}

function progressStage(trackId: string): StageForm {
  return {
    stageId: "progress",
    label: "Progress submission",
    openAt: isoOffsetDays(-3),
    deadlineAt: isoOffsetDays(4, 6),
    editable: true,
    sections: [
      {
        id: "overview",
        label: "Overview & Policy lens",
        fields: [
          ...baseOverviewFields(trackId),
          { id: "progress-note", type: "long-text", label: "Progress so far", required: true, min: 100, max: 800, helper: "What have you done in the last 3–4 weeks?" },
          { id: "next-steps", type: "long-text", label: "Next steps", required: true, min: 40, max: 400 },
        ],
      },
      {
        id: "evidence",
        label: "Evidence / Survey",
        builtInAttachments: true,
        fields: [
          { id: "sample-size", type: "number", label: "Sample size / observations", required: false, min: 0, max: 100000 },
          { id: "survey-summary", type: "long-text", label: "Survey summary", required: false, min: 0, max: 600 },
        ],
      },
    ],
  };
}

function finalStage(trackId: string): StageForm {
  const trackFields: SubmissionField[] =
    trackId === "sci-investigator"
      ? [
          { id: "hypothesis", type: "long-text", label: "Hypothesis", required: true, min: 40, max: 500 },
          { id: "methodology", type: "long-text", label: "Methodology", required: true, min: 100, max: 1200 },
          { id: "sample-size", type: "number", label: "Sample size / observations", required: true, min: 1, max: 100000 },
        ]
      : trackId === "innovator"
      ? [
          { id: "solution", type: "long-text", label: "Proposed solution", required: true, min: 100, max: 1200 },
          { id: "prototype-stage", type: "select", label: "Prototype stage", required: true, options: ["Concept", "Paper prototype", "Working model", "Deployed pilot"] },
          { id: "materials", type: "multi-select", label: "Materials used", required: false, options: ["Electronics", "3D print", "Wood", "Recycled", "Software only", "Other"] },
        ]
      : [
          { id: "impact", type: "long-text", label: "Impact narrative", required: true, min: 100, max: 1000 },
          { id: "beneficiaries", type: "short-text", label: "Direct beneficiaries", required: true, min: 4, max: 160 },
        ];
  return {
    stageId: "final",
    label: "Final submission",
    openAt: isoOffsetDays(5),
    deadlineAt: isoOffsetDays(22, 0),
    editable: true,
    sections: [
      {
        id: "overview",
        label: "Overview & Policy lens",
        fields: [
          ...baseOverviewFields(trackId),
          { id: "intended-improvement", type: "long-text", label: "Intended improvement", required: true, min: 60, max: 500, helper: "What will improve if your solution is adopted?" },
          { id: "abstract", type: "long-text", label: "Abstract", required: true, min: 150, max: 300 },
          ...trackFields,
        ],
      },
      {
        id: "evidence",
        label: "Evidence / Survey",
        builtInAttachments: true,
        fields: [
          { id: "data-sources", type: "long-text", label: "Data sources & references", required: false, min: 0, max: 800 },
        ],
      },
      {
        id: "deck",
        label: "Deck / Prototype",
        builtInDeck: true,
        fields: [
          { id: "github", type: "url", label: "GitHub / code repository (optional)", required: false },
        ],
      },
    ],
  };
}

export const stageForms: TrackStageForms[] = ["sci-investigator", "innovator", "open-arena"].map(
  (trackId) => ({
    trackId,
    updatedAt: new Date().toISOString().slice(0, 10),
    stages: {
      progress: progressStage(trackId),
      final: finalStage(trackId),
    },
  })
);

export function getStageForm(trackId: string, stageId: StageId): StageForm | undefined {
  return stageForms.find((f) => f.trackId === trackId)?.stages[stageId];
}

export function updateStageForm(trackId: string, stageId: StageId, next: StageForm): void {
  const tf = stageForms.find((f) => f.trackId === trackId);
  if (!tf) return;
  tf.stages[stageId] = next;
  tf.updatedAt = new Date().toISOString().slice(0, 10);
}

export function extendDeadline(trackId: string, stageId: StageId, days: number): void {
  const s = getStageForm(trackId, stageId);
  if (!s) return;
  const d = new Date(s.deadlineAt);
  d.setDate(d.getDate() + days);
  s.deadlineAt = d.toISOString();
}

export type StageWindowStatus = "upcoming" | "open" | "closed";

// =========================================================================
// Evidence categories — mirror the RiTX rubric so teams tag every attachment
// against the criterion it supports. Weights come from the concept note §7.
// =========================================================================

export interface EvidenceCategory {
  id: string;
  label: string;
  weight: number; // percent
  tone: string;   // tailwind classes for chip
}

export const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  { id: "problem-relevance",    label: "Problem relevance",              weight: 15, tone: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: "investigation",        label: "Investigation & evidence",       weight: 25, tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "scientific-reasoning", label: "Scientific reasoning",           weight: 20, tone: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "originality",          label: "Originality & creativity",       weight: 15, tone: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "feasibility",          label: "Feasibility & impact",           weight: 15, tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "policy-sdg",           label: "Policy, SDG, ethics & communication", weight: 10, tone: "bg-indigo-100 text-indigo-700 border-indigo-200" },
];

export const evidenceCategory = (id: string) =>
  EVIDENCE_CATEGORIES.find((c) => c.id === id);

export interface EvidenceAttachment {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  name: string;
  sizeKb: number;
  url?: string;
  mime?: string;
}

// Deterministic mock evidence per team so judges see multi-category uploads.
const SAMPLE_EVIDENCE: Array<Omit<EvidenceAttachment, "id"> & { id?: string }> = [
  { categoryId: "investigation",        title: "Household survey — 42 responses", description: "Door-to-door survey across 3 wards; raw responses + summary sheet.", name: "survey-responses.pdf", sizeKb: 1240, url: SAMPLE_PDF, mime: "application/pdf" },
  { categoryId: "investigation",        title: "Field observation photos",         description: "Photos of the problem site captured across two weeks.",             name: "field-photos.pdf",     sizeKb: 2180, url: SAMPLE_PDF, mime: "application/pdf" },
  { categoryId: "problem-relevance",    title: "Stakeholder interview notes",      description: "Notes from 6 interviews with teachers, parents and a doctor.",     name: "interviews.pdf",       sizeKb: 640,  url: SAMPLE_PDF, mime: "application/pdf" },
  { categoryId: "scientific-reasoning", title: "Analysis worksheet",                description: "Assumptions, comparisons and cost-benefit breakdown.",              name: "analysis.pdf",         sizeKb: 880,  url: SAMPLE_PDF, mime: "application/pdf" },
  { categoryId: "originality",          title: "Concept sketches",                 description: "Early ideation sketches showing three alternative approaches.",    name: "sketches.pdf",         sizeKb: 1520, url: SAMPLE_PDF, mime: "application/pdf" },
  { categoryId: "feasibility",          title: "Prototype cost sheet",             description: "Bill of materials + affordability check for a school setting.",    name: "cost-sheet.pdf",       sizeKb: 410,  url: SAMPLE_PDF, mime: "application/pdf" },
  { categoryId: "policy-sdg",           title: "SDG mapping note",                 description: "Short note mapping our work to SDG targets and GoI mission.",      name: "sdg-mapping.pdf",      sizeKb: 320,  url: SAMPLE_PDF, mime: "application/pdf" },
];

export function evidenceForTeam(teamId: string): EvidenceAttachment[] {
  // Seed from team id length + char sum → stable per team.
  const seed = Array.from(teamId).reduce((a, c) => a + c.charCodeAt(0), 7);
  const r = mulberry32(seed);
  const count = 3 + Math.floor(r() * 4); // 3–6 attachments
  const picks: EvidenceAttachment[] = [];
  const pool = [...SAMPLE_EVIDENCE];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(r() * pool.length);
    const item = pool.splice(idx, 1)[0];
    picks.push({ ...item, id: `${teamId}-att-${i}` });
  }
  return picks;
}

export function stageWindowStatus(stage: StageForm, now: Date = new Date()): StageWindowStatus {
  const open = new Date(stage.openAt).getTime();
  const close = new Date(stage.deadlineAt).getTime();
  const n = now.getTime();
  if (n < open) return "upcoming";
  if (n > close) return "closed";
  return "open";
}

export function timeToDeadline(stage: StageForm, now: Date = new Date()): {
  ms: number;
  label: string;
  tone: "safe" | "warn" | "danger" | "closed" | "upcoming";
  expired: boolean;
} {
  const close = new Date(stage.deadlineAt).getTime();
  const open = new Date(stage.openAt).getTime();
  const ms = close - now.getTime();
  if (now.getTime() < open) {
    const dOpen = open - now.getTime();
    const days = Math.ceil(dOpen / 86400000);
    return { ms, label: `Opens in ${days}d`, tone: "upcoming", expired: false };
  }
  if (ms <= 0) return { ms, label: "Deadline passed", tone: "closed", expired: true };
  const days = Math.floor(ms / 86400000);
  const hrs = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const label =
    days > 0 ? `${days}d ${hrs}h to deadline` : hrs > 0 ? `${hrs}h ${mins}m to deadline` : `${mins}m to deadline`;
  const tone: "safe" | "warn" | "danger" = days >= 3 ? "safe" : days >= 1 ? "warn" : "danger";
  return { ms, label, tone, expired: false };
}