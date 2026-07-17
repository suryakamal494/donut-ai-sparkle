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