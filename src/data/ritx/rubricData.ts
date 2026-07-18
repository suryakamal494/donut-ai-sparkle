// Phase 3 — Rubric criteria, judge assignments, blind scores
import { mockTeams } from "./mockData";
import { mockStaff } from "./staffData";

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
  criterionScores?: Record<string, number>;
  comment?: string;
  scoredAt?: string;
}

// ============ Theme-wise judge assignments ============
// Judges are assigned to themes (tracks). Every team in a theme is
// automatically reviewed by the judges assigned to that theme.
// A scope is either the whole theme (subTheme undefined) or a specific sub-theme.
// A team's effective judges = union of every scope that matches the team.
export interface ThemeAssignment {
  trackId: string;
  subTheme?: string; // undefined = applies to every sub-theme in the track
  judgeIds: string[];
}

const judgePool = mockStaff.filter((s) => s.judgeAccess).map((s) => s.id);
// Seed 3 judges per track (rotating through the pool) so every team has coverage.
export const mockThemeAssignments: ThemeAssignment[] = [
  // Whole-theme defaults
  { trackId: "sci-investigator", judgeIds: [judgePool[0], judgePool[1]].filter(Boolean) },
  { trackId: "innovator", judgeIds: [judgePool[3], judgePool[4]].filter(Boolean) },
  { trackId: "open-arena", judgeIds: [judgePool[6], judgePool[0]].filter(Boolean) },
  // Sample sub-theme overrides (adds an extra specialist judge for that sub-theme)
  { trackId: "sci-investigator", subTheme: "Environment", judgeIds: [judgePool[2]].filter(Boolean) },
  { trackId: "innovator", subTheme: "Assistive Tech", judgeIds: [judgePool[5]].filter(Boolean) },
];

// Effective (union of whole-theme + matching sub-theme scopes), deduped.
export const judgeIdsForTeamTheme = (trackId: string, subTheme?: string): string[] => {
  const ids = new Set<string>();
  mockThemeAssignments.forEach((s) => {
    if (s.trackId !== trackId) return;
    if (s.subTheme && s.subTheme !== subTheme) return;
    s.judgeIds.forEach((id) => ids.add(id));
  });
  return Array.from(ids);
};

// All distinct judges that touch any team in a track (for dashboard summaries).
export const judgeIdsForTrack = (trackId: string): string[] => {
  const ids = new Set<string>();
  mockThemeAssignments.forEach((s) => {
    if (s.trackId === trackId) s.judgeIds.forEach((id) => ids.add(id));
  });
  return Array.from(ids);
};

export function setScopeJudges(trackId: string, subTheme: string | undefined, judgeIds: string[]) {
  const idx = mockThemeAssignments.findIndex((s) => s.trackId === trackId && s.subTheme === subTheme);
  if (judgeIds.length === 0) {
    if (idx >= 0) mockThemeAssignments.splice(idx, 1);
  } else if (idx >= 0) {
    mockThemeAssignments[idx].judgeIds = judgeIds;
  } else {
    mockThemeAssignments.push({ trackId, subTheme, judgeIds });
  }
  rebuildAssignments();
}

// Back-compat: whole-theme setter kept for any older caller.
export function setThemeJudges(trackId: string, judgeIds: string[]) {
  setScopeJudges(trackId, undefined, judgeIds);
}

// ---- Generator ----
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Persistent per-(judge,team) score state — survives theme-assignment edits
// so a judge who's already scored a team keeps that score if reassigned.
type ScoreState = Omit<JudgeAssignment, "judgeId" | "teamId">;
const scoreState: Record<string, ScoreState> = {};
const stateKey = (judgeId: string, teamId: string) => `${judgeId}::${teamId}`;

function seedScoreState() {
  const rand = mulberry32(77);
  const rubricByTrack: Record<string, RubricCriterion[]> = {};
  initialRubrics.forEach((r) => (rubricByTrack[r.trackId] = r.criteria));

  mockTeams.forEach((team, i) => {
    const judges = judgeIdsForTeamTheme(team.trackId, team.subTheme);
    judges.forEach((jid, jIdx) => {
      const roll = rand();
      // Weight statuses: 55% scored, 25% in-progress, 20% pending
      const status: JudgeAssignment["status"] = roll < 0.55 ? "scored" : roll < 0.8 ? "in-progress" : "pending";
      const criteria = rubricByTrack[team.trackId] || [];
      const key = stateKey(jid, team.id);
      if (status === "scored" && criteria.length) {
        const criterionScores: Record<string, number> = {};
        let weighted = 0;
        criteria.forEach((c) => {
          const bias = jIdx === 0 ? 0 : (rand() - 0.5) * 2;
          const rawFloat = 6 + rand() * 4 + bias;
          const snapped = Math.max(3, Math.min(c.maxScore, Math.round(rawFloat * 4) / 4));
          criterionScores[c.id] = snapped;
          weighted += (snapped / c.maxScore) * 10 * c.weight;
        });
        scoreState[key] = {
          status,
          score: Number(weighted.toFixed(2)),
          criterionScores,
          comment: rand() > 0.5 ? "Solid submission, clearly presented evidence." : "Interesting concept, could use stronger data support.",
          scoredAt: `2026-11-${String(1 + Math.floor(rand() * 20)).padStart(2, "0")}T15:00:00`,
        };
      } else if (status === "in-progress" && criteria.length) {
        const criterionScores: Record<string, number> = {};
        const half = Math.floor(criteria.length / 2);
        criteria.slice(0, half).forEach((c) => {
          criterionScores[c.id] = Math.round((5 + rand() * 4) * 4) / 4;
        });
        scoreState[key] = { status, criterionScores };
      } else {
        scoreState[key] = { status };
      }
      // Use the initial index to keep team-idx variance from prior seed
      void i;
    });
  });
}

function deriveAssignments(): JudgeAssignment[] {
  const out: JudgeAssignment[] = [];
  mockTeams.forEach((team) => {
    judgeIdsForTeamTheme(team.trackId, team.subTheme).forEach((jid) => {
      const key = stateKey(jid, team.id);
      const state = scoreState[key] ?? { status: "pending" as const };
      out.push({ judgeId: jid, teamId: team.id, ...state });
    });
  });
  return out;
}

// mockAssignments stays a mutable array so existing imports (Dashboard,
// resultsData, Submissions, etc.) keep receiving up-to-date data after edits.
seedScoreState();
export const mockAssignments: JudgeAssignment[] = deriveAssignments();

function rebuildAssignments() {
  const next = deriveAssignments();
  mockAssignments.length = 0;
  mockAssignments.push(...next);
}

// ---- Helpers ----
export const assignmentsForJudge = (judgeId: string) => mockAssignments.filter((a) => a.judgeId === judgeId);
export const assignmentsForTeam = (teamId: string) => mockAssignments.filter((a) => a.teamId === teamId);
export const assignmentFor = (judgeId: string, teamId: string) =>
  mockAssignments.find((a) => a.judgeId === judgeId && a.teamId === teamId);

export function updateAssignment(judgeId: string, teamId: string, patch: Partial<JudgeAssignment>) {
  const key = stateKey(judgeId, teamId);
  const { judgeId: _j, teamId: _t, ...rest } = patch;
  scoreState[key] = { ...(scoreState[key] ?? { status: "pending" }), ...rest };
  const idx = mockAssignments.findIndex((a) => a.judgeId === judgeId && a.teamId === teamId);
  if (idx >= 0) mockAssignments[idx] = { ...mockAssignments[idx], ...rest };
}

export type TeamJudgingSummary = {
  assigned: number;
  scored: number;
  inProgress: number;
  pending: number;
  average?: number;
  status: "awaiting" | "partial" | "complete" | "conflict";
};

export function judgingSummaryForTeam(teamId: string): TeamJudgingSummary {
  const list = assignmentsForTeam(teamId);
  const scored = list.filter((a) => a.status === "scored");
  const inProgress = list.filter((a) => a.status === "in-progress").length;
  const pending = list.filter((a) => a.status === "pending").length;
  const scores = scored.map((a) => a.score!).filter((v) => v != null);
  const average = scores.length ? Number((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2)) : undefined;
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
  let status: TeamJudgingSummary["status"];
  if (list.length === 0) status = "awaiting";
  else if (scored.length === list.length) status = spread >= 1.5 ? "conflict" : "complete";
  else if (scored.length > 0) status = "partial";
  else status = "awaiting";
  return { assigned: list.length, scored: scored.length, inProgress, pending, average, status };
}

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
