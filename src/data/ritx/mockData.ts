// Mock data for RiTX Young Innovators Challenge (UI-only, Phase 0)

export type CompetitionMode = "free" | "paid" | "sponsored" | "invite";
export type ConsentStatus = "pending" | "sent" | "confirmed" | "withdrawn";
export type AccessStatus = "registered" | "consent-pending" | "active" | "submitted" | "locked";

export interface Track {
  id: string;
  name: string;
  description: string;
  subThemes: string[];
}

export interface Competition {
  id: string;
  name: string;
  mode: CompetitionMode;
  fee: number;
  minTeamSize: number;
  maxTeamSize: number;
  registrationStart: string;
  registrationEnd: string;
  submissionDeadline: string;
  resultsDate: string;
  tracks: Track[];
}

export const mockCompetition: Competition = {
  id: "ritx-2026",
  name: "RiTX Young Innovators Challenge 2026",
  mode: "sponsored",
  fee: 0,
  minTeamSize: 2,
  maxTeamSize: 4,
  registrationStart: "2026-06-01",
  registrationEnd: "2026-08-15",
  submissionDeadline: "2026-10-30",
  resultsDate: "2026-12-15",
  tracks: [
    {
      id: "sci-investigator",
      name: "Science Investigator",
      description: "Investigate a real-world scientific problem in your community.",
      subThemes: ["Health & Wellbeing", "Environment", "Energy", "Food & Agriculture", "Other"],
    },
    {
      id: "innovator",
      name: "Innovator Challenge",
      description: "Design an original prototype or solution.",
      subThemes: ["Assistive Tech", "Climate Tech", "EdTech", "Rural Solutions", "Other"],
    },
    {
      id: "open-arena",
      name: "Open Arena",
      description: "Open-ended exploration across any theme aligned to SDGs.",
      subThemes: ["SDG 3", "SDG 4", "SDG 7", "SDG 11", "SDG 13", "Other"],
    },
  ],
};

export interface TeamMember {
  id: string;
  name: string;
  grade: string;
  email: string;
  parentEmail: string;
  consent: ConsentStatus;
}

export interface Team {
  id: string;
  teamCode: string; // shown to judges (blind)
  teamName: string;
  school: string;
  city: string;
  state: string;
  trackId: string;
  subTheme: string;
  registeredOn: string;
  status: AccessStatus;
  members: TeamMember[];
}

export const mockTeams: Team[] = [
  {
    id: "t1",
    teamCode: "RITX-2026-0421",
    teamName: "Curious Cosmos",
    school: "Delhi Public School, Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    trackId: "sci-investigator",
    subTheme: "Environment",
    registeredOn: "2026-06-12",
    status: "consent-pending",
    members: [
      { id: "m1", name: "Ananya R.", grade: "9", email: "ananya@example.com", parentEmail: "parent1@example.com", consent: "confirmed" },
      { id: "m2", name: "Karthik S.", grade: "9", email: "karthik@example.com", parentEmail: "parent2@example.com", consent: "sent" },
      { id: "m3", name: "Meera P.", grade: "10", email: "meera@example.com", parentEmail: "parent3@example.com", consent: "pending" },
    ],
  },
  {
    id: "t2",
    teamCode: "RITX-2026-0422",
    teamName: "Neon Neurons",
    school: "St. Xavier's, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    trackId: "innovator",
    subTheme: "Assistive Tech",
    registeredOn: "2026-06-14",
    status: "active",
    members: [
      { id: "m4", name: "Rohan D.", grade: "10", email: "rohan@example.com", parentEmail: "parent4@example.com", consent: "confirmed" },
      { id: "m5", name: "Priya N.", grade: "10", email: "priya@example.com", parentEmail: "parent5@example.com", consent: "confirmed" },
    ],
  },
  {
    id: "t3",
    teamCode: "RITX-2026-0423",
    teamName: "Green Guardians",
    school: "Kendriya Vidyalaya, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    trackId: "open-arena",
    subTheme: "SDG 13",
    registeredOn: "2026-06-18",
    status: "registered",
    members: [
      { id: "m6", name: "Aditya V.", grade: "8", email: "aditya@example.com", parentEmail: "parent6@example.com", consent: "pending" },
      { id: "m7", name: "Isha K.", grade: "8", email: "isha@example.com", parentEmail: "parent7@example.com", consent: "pending" },
    ],
  },
];

export const registrationStats = {
  totalRegistrations: 3,
  totalSchools: 3,
  activeTeams: 1,
  consentPending: 5,
  byMode: { free: 0, paid: 0, sponsored: 3, invite: 0 },
  byTrack: { "sci-investigator": 1, innovator: 1, "open-arena": 1 },
};
