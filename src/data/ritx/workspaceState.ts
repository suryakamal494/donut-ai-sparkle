// Workspace + individual-user mock state for RiTX Team side.
// UI-only: current user persists in localStorage, workspaces + pricing live in-memory.
// Dev team will replace this with real auth + DB later — component surface stays the same.

import { mockCompetition } from "./mockData";

export type PricingMode = "free" | "paid";
export interface Pricing { mode: PricingMode; amount: number; currency: "INR" }

// Editable pricing (admin toggle). Default: paid ₹499 so the gating is visible in demos.
export const pricing: Pricing = { mode: "paid", amount: 499, currency: "INR" };
export function setPricing(next: Partial<Pricing>) { Object.assign(pricing, next); }

export interface RitxUser {
  id: string;
  name: string;
  email: string;
  class: string;
}

export type WorkspaceRole = "lead" | "member";

export interface EditLogEntry {
  id: string;
  userId: string;
  userName: string;
  section: string;
  field: string;
  at: string; // ISO
}

export interface Workspace {
  id: string;
  name: string;
  code: string;               // invite code
  leadUserId: string;
  memberIds: string[];        // includes lead
  maxMembers: number;
  paidAt: string | null;
  paidBy: string | null;
  trackId: string;
  subTheme: string;
  createdAt: string;
  editHistory: EditLogEntry[];
}

// --- Seeds ---------------------------------------------------------------

export const mockUsers: RitxUser[] = [
  { id: "u1", name: "Ananya Rao",    email: "ananya@ritx.demo",   class: "9"  },
  { id: "u2", name: "Karthik Suresh", email: "karthik@ritx.demo", class: "9"  },
  { id: "u3", name: "Meera Prasad",  email: "meera@ritx.demo",    class: "10" },
  { id: "u4", name: "Rohan Dixit",   email: "rohan@ritx.demo",    class: "10" },
  { id: "u5", name: "Priya Nair",    email: "priya@ritx.demo",    class: "10" },
];

export const workspaces: Workspace[] = [
  {
    id: "ws1",
    name: "Curious Cosmos",
    code: "CURI42",
    leadUserId: "u1",
    memberIds: ["u1", "u2", "u3"],
    maxMembers: 4,
    paidAt: null, // unpaid — shows paywall for demo
    paidBy: null,
    trackId: "sci-investigator",
    subTheme: "Environment",
    createdAt: "2026-06-12T10:00:00Z",
    editHistory: [],
  },
  {
    id: "ws2",
    name: "Neon Neurons",
    code: "NEON88",
    leadUserId: "u4",
    memberIds: ["u4", "u5"],
    maxMembers: 4,
    paidAt: "2026-06-15T09:00:00Z", // paid — unlocked
    paidBy: "u4",
    trackId: "innovator",
    subTheme: "Assistive Tech",
    createdAt: "2026-06-14T09:00:00Z",
    editHistory: [],
  },
];

// --- Current user (localStorage-backed) ----------------------------------

const USER_KEY = "ritx.currentUserId";

export function getCurrentUser(): RitxUser | null {
  const id = typeof window === "undefined" ? null : window.localStorage.getItem(USER_KEY);
  if (!id) return null;
  return mockUsers.find((u) => u.id === id) ?? null;
}

export function setCurrentUser(user: RitxUser) {
  if (typeof window !== "undefined") window.localStorage.setItem(USER_KEY, user.id);
}

export function signOutCurrentUser() {
  if (typeof window !== "undefined") window.localStorage.removeItem(USER_KEY);
}

// If nothing is stored yet, seed with the workspace lead of ws1 so demos land somewhere sensible.
export function ensureCurrentUser(): RitxUser {
  const existing = getCurrentUser();
  if (existing) return existing;
  setCurrentUser(mockUsers[0]);
  return mockUsers[0];
}

// --- Login / registration ------------------------------------------------

export function loginOrRegister(input: { name: string; email: string; class: string }): RitxUser {
  const email = input.email.trim().toLowerCase();
  let user = mockUsers.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    user = {
      id: `u-${Date.now().toString(36)}`,
      name: input.name.trim(),
      email,
      class: input.class,
    };
    mockUsers.push(user);
  } else {
    // Update any changed profile fields on re-login
    user.name = input.name.trim() || user.name;
    user.class = input.class || user.class;
  }
  setCurrentUser(user);
  return user;
}

// --- Workspace lookups ---------------------------------------------------

export function getWorkspaceForUser(userId: string): Workspace | null {
  return workspaces.find((w) => w.memberIds.includes(userId)) ?? null;
}

export function getCurrentWorkspace(): Workspace | null {
  const u = getCurrentUser();
  return u ? getWorkspaceForUser(u.id) : null;
}

export function getMembers(ws: Workspace): RitxUser[] {
  return ws.memberIds
    .map((id) => mockUsers.find((u) => u.id === id))
    .filter((u): u is RitxUser => Boolean(u));
}

export function isLead(ws: Workspace, userId: string): boolean {
  return ws.leadUserId === userId;
}

// --- Invite codes --------------------------------------------------------

// 6-char, uppercase, no ambiguous chars (0/O/1/I)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateInviteCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  // Guarantee uniqueness within existing workspaces
  if (workspaces.some((w) => w.code === out)) return generateInviteCode();
  return out;
}

// --- Create / join / leave ----------------------------------------------

export function createWorkspace(name: string, leadUserId: string): Workspace {
  // Enforce single-workspace-per-user
  const existing = getWorkspaceForUser(leadUserId);
  if (existing) throw new Error(`You are already in workspace "${existing.name}".`);
  // Payment must happen BEFORE workspace creation when the competition is paid.
  let usedPrepaid = false;
  if (pricing.mode === "paid") {
    if (!hasPrepaidCredit(leadUserId)) {
      throw new Error("Payment required before creating a workspace.");
    }
    consumePrepaidCredit(leadUserId);
    usedPrepaid = true;
  }
  const ws: Workspace = {
    id: `ws-${Date.now().toString(36)}`,
    name: name.trim() || "New Team",
    code: generateInviteCode(),
    leadUserId,
    memberIds: [leadUserId],
    maxMembers: mockCompetition.maxTeamSize,
    paidAt: usedPrepaid ? new Date().toISOString() : null,
    paidBy: usedPrepaid ? leadUserId : null,
    trackId: "",
    subTheme: "",
    createdAt: new Date().toISOString(),
    editHistory: [],
  };
  workspaces.push(ws);
  return ws;
}

export type JoinResult =
  | { ok: true; workspace: Workspace }
  | { ok: false; reason: string };

export function joinByCode(rawCode: string, userId: string): JoinResult {
  const code = rawCode.trim().toUpperCase();
  if (code.length !== 6) return { ok: false, reason: "Codes are 6 characters." };
  const existing = getWorkspaceForUser(userId);
  if (existing) return { ok: false, reason: `You're already in workspace "${existing.name}".` };
  const ws = workspaces.find((w) => w.code === code);
  if (!ws) return { ok: false, reason: "No workspace found for that code." };
  if (ws.memberIds.length >= ws.maxMembers) return { ok: false, reason: "This workspace is full." };
  ws.memberIds.push(userId);
  return { ok: true, workspace: ws };
}

export function removeMember(ws: Workspace, userId: string): boolean {
  if (userId === ws.leadUserId) return false;
  const before = ws.memberIds.length;
  ws.memberIds = ws.memberIds.filter((id) => id !== userId);
  return ws.memberIds.length < before;
}

export function updateWorkspaceTrack(ws: Workspace, trackId: string, subTheme: string) {
  ws.trackId = trackId;
  ws.subTheme = subTheme;
}

// --- Payment (mock) ------------------------------------------------------

export function isUnlocked(ws: Workspace | null): boolean {
  if (pricing.mode === "free") return true;
  return Boolean(ws?.paidAt);
}

export function payForWorkspace(ws: Workspace, userId: string) {
  ws.paidAt = new Date().toISOString();
  ws.paidBy = userId;
}

// --- Prepaid credit (pay-before-create) ---------------------------------
// Users pay the team fee BEFORE the workspace exists. Successful payment
// grants a one-shot credit that `createWorkspace` consumes to mark the new
// workspace as paid. UI-only mock: in-memory Set.

const prepaidUserIds = new Set<string>();

export function hasPrepaidCredit(userId: string): boolean {
  return prepaidUserIds.has(userId);
}
export function grantPrepaidCredit(userId: string) {
  prepaidUserIds.add(userId);
}
export function consumePrepaidCredit(userId: string): boolean {
  return prepaidUserIds.delete(userId);
}

// Unified "has this user paid" check across pre-create and post-create flows.
export function hasUserPaid(user: RitxUser | null, ws: Workspace | null): boolean {
  if (pricing.mode === "free") return true;
  if (!user) return false;
  if (ws?.paidAt) return true;
  return hasPrepaidCredit(user.id);
}

// --- Edit history --------------------------------------------------------

export function logEdit(ws: Workspace, user: RitxUser, section: string, field: string) {
  ws.editHistory.unshift({
    id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: user.id,
    userName: user.name,
    section,
    field,
    at: new Date().toISOString(),
  });
  if (ws.editHistory.length > 50) ws.editHistory.length = 50;
}