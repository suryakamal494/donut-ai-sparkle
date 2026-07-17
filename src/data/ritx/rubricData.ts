// Phase 3 — Rubric criteria, judge assignments, blind scores

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
  weight: number; // 0-1, sums to 1 per rubric
}

export interface TrackRubric {
  trackId: string;
  updatedAt: string;
  published: boolean;
  criteria: RubricCriterion[];
}

const sciCriteria: RubricCriterion[] = [
  { id: "c1", label: "Scientific rigor", description: "Hypothesis, method, controls", maxScore: 10, weight: 0.3 },
  { id: "c2", label: "Originality", description: "Novelty of the question and approach", maxScore: 10, weight: 0.2 },
  { id: "c3", label: "Evidence & analysis", description: "Data quality, interpretation", maxScore: 10, weight: 0.25 },
  { id: "c4", label: "Communication", description: "Report clarity and visual explanation", maxScore: 10, weight: 0.15 },
  { id: "c5", label: "Impact potential", description: "Real-world relevance", maxScore: 10, weight: 0.1 },
];

const innoCriteria: RubricCriterion[] = [
  { id: "c1", label: "Problem framing", description: "Clarity and importance of problem", maxScore: 10, weight: 0.2 },
  { id: "c2", label: "Solution design", description: "Feasibility and creativity", maxScore: 10, weight: 0.25 },
  { id: "c3", label: "Prototype maturity", description: "State of implementation", maxScore: 10, weight: 0.25 },
  { id: "c4", label: "Pitch quality", description: "Deck & demo persuasiveness", maxScore: 10, weight: 0.15 },
  { id: "c5", label: "Scalability", description: "Path to broader adoption", maxScore: 10, weight: 0.15 },
];

const openCriteria: RubricCriterion[] = [
  { id: "c1", label: "SDG alignment", description: "Fit with chosen SDG", maxScore: 10, weight: 0.25 },
  { id: "c2", label: "Depth of exploration", description: "Rigor and thoughtfulness", maxScore: 10, weight: 0.25 },
  { id: "c3", label: "Impact narrative", description: "Community/stakeholder value", maxScore: 10, weight: 0.25 },
  { id: "c4", label: "Presentation", description: "Overall storytelling", maxScore: 10, weight: 0.25 },
];

export const initialRubrics: TrackRubric[] = [
  { trackId: "sci-investigator", updatedAt: "2026-07-12", published: true, criteria: sciCriteria },
  { trackId: "innovator", updatedAt: "2026-07-12", published: true, criteria: innoCriteria },
  { trackId: "open-arena", updatedAt: "2026-07-12", published: false, criteria: openCriteria },
];

export interface JudgeAssignment {
  judgeId: string;
  teamId: string;
  status: "pending" | "in-progress" | "scored";
  score?: number; // normalized weighted total (0-10)
}

export const mockAssignments: JudgeAssignment[] = [
  { judgeId: "s2", teamId: "t1", status: "scored", score: 7.6 },
  { judgeId: "s2", teamId: "t2", status: "in-progress" },
  { judgeId: "s2", teamId: "t3", status: "pending" },
  { judgeId: "s3", teamId: "t1", status: "scored", score: 8.1 },
  { judgeId: "s3", teamId: "t2", status: "pending" },
  { judgeId: "s4", teamId: "t2", status: "scored", score: 7.9 },
  { judgeId: "s4", teamId: "t3", status: "in-progress" },
];

export const scoreTone = (s: JudgeAssignment["status"]) => ({
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  scored: "bg-emerald-100 text-emerald-700 border-emerald-200",
}[s]);

export const statusLabel = (s: JudgeAssignment["status"]) => ({
  pending: "Pending",
  "in-progress": "In progress",
  scored: "Scored",
}[s]);
