// Phase 4 — Aggregated results, moderation, announcements

import { mockAssignments } from "./rubricData";
import { mockTeams } from "./mockData";

export interface TeamResult {
  teamId: string;
  scores: number[]; // per judge (0-10)
  average: number;
  spread: number; // max-min
  rank: number;
  status: "provisional" | "moderated" | "published";
  award?: "gold" | "silver" | "bronze" | "finalist";
}

function computeResults(): TeamResult[] {
  const byTeam: Record<string, number[]> = {};
  mockAssignments.forEach((a) => {
    if (a.score != null) {
      byTeam[a.teamId] ||= [];
      byTeam[a.teamId].push(a.score);
    }
  });
  const rows = mockTeams.map((t) => {
    const scores = byTeam[t.id] || [];
    const avg = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
    return { teamId: t.id, scores, average: Number(avg.toFixed(2)), spread: Number(spread.toFixed(2)) };
  });
  rows.sort((a, b) => b.average - a.average);
  return rows.map((r, i) => ({
    ...r,
    rank: i + 1,
    status: "provisional" as const,
    award: i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "finalist",
  }));
}

export const initialResults: TeamResult[] = computeResults();

export const awardLabel = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  finalist: "Finalist",
} as const;

export const awardTone = {
  gold: "bg-amber-100 text-amber-700 border-amber-200",
  silver: "bg-slate-100 text-slate-700 border-slate-300",
  bronze: "bg-orange-100 text-orange-700 border-orange-200",
  finalist: "bg-indigo-100 text-indigo-700 border-indigo-200",
} as const;

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all-teams" | "winners" | "finalists" | "staff";
  scheduledAt?: string;
  sentAt?: string;
  channel: ("whatsapp" | "email" | "in-app")[];
}

export const mockAnnouncements: Announcement[] = [
  { id: "a1", title: "Results are live!", body: "Congratulations to all finalists of RiTX 2026. Log in to see your standing.", audience: "all-teams", sentAt: "2026-12-15T10:00:00", channel: ["whatsapp", "email", "in-app"] },
  { id: "a2", title: "Award ceremony invite", body: "Winners — join the virtual award ceremony on 20 Dec at 4 PM IST.", audience: "winners", scheduledAt: "2026-12-16T09:00:00", channel: ["email", "in-app"] },
];
