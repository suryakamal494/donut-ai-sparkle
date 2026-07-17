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

// ---- Deterministic generator (seeded PRNG, per project memory rule) ----
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SCHOOLS = [
  { school: "DAV Public School", city: "Pune", state: "Maharashtra" },
  { school: "Bishop Cotton Boys' School", city: "Bangalore", state: "Karnataka" },
  { school: "La Martiniere College", city: "Lucknow", state: "Uttar Pradesh" },
  { school: "The Doon School", city: "Dehradun", state: "Uttarakhand" },
  { school: "Modern School Barakhamba", city: "New Delhi", state: "Delhi" },
  { school: "Chinmaya Vidyalaya", city: "Kochi", state: "Kerala" },
  { school: "Sardar Patel Vidyalaya", city: "Ahmedabad", state: "Gujarat" },
  { school: "Bhavan's Vidya Mandir", city: "Hyderabad", state: "Telangana" },
  { school: "Sishya School", city: "Chennai", state: "Tamil Nadu" },
  { school: "Mayo College", city: "Ajmer", state: "Rajasthan" },
  { school: "Kendriya Vidyalaya IIT", city: "Kanpur", state: "Uttar Pradesh" },
  { school: "Delhi Public School R.K. Puram", city: "New Delhi", state: "Delhi" },
  { school: "Podar International School", city: "Nashik", state: "Maharashtra" },
  { school: "St. Michael's High School", city: "Patna", state: "Bihar" },
  { school: "Assam Valley School", city: "Tezpur", state: "Assam" },
  { school: "Rishi Valley School", city: "Chittoor", state: "Andhra Pradesh" },
  { school: "Loyola School", city: "Trivandrum", state: "Kerala" },
  { school: "St. Aloysius School", city: "Mangalore", state: "Karnataka" },
];

const TEAM_NAMES = [
  "Curious Cosmos", "Neon Neurons", "Green Guardians", "Quantum Quokkas",
  "Solar Sparks", "Byte Botanists", "Circuit Sirens", "Delta Divers",
  "Echo Innovators", "Fusion Foxes", "Gravity Geckos", "Helix Hackers",
  "Ion Igniters", "Jade Jaguars", "Kinetic Kites", "Lumen Lions",
  "Micro Mavericks", "Nebula Ninjas", "Orbit Otters", "Pulse Pioneers",
  "Quasar Questers", "Radiant Ravens", "Sonic Scholars", "Tesla Tigers",
  "Umbra Uplinks", "Vertex Voyagers", "Waveform Wolves", "Xeno Xplorers",
  "Yotta Yaks", "Zenith Zebras", "Aurora Alchemists", "Binary Bees",
  "Cyber Cardinals",
];

const FIRST = ["Aarav","Ishika","Kabir","Riya","Vivaan","Anaya","Reyansh","Saanvi","Aditya","Diya","Arjun","Myra","Rehan","Aisha","Neel","Zara","Vihaan","Kiara","Ayaan","Pari"];
const LAST = ["Sharma","Verma","Gupta","Iyer","Nair","Reddy","Menon","Patel","Khan","Das","Bose","Jain","Rao","Singh"];

const SUBTHEMES: Record<string, string[]> = {
  "sci-investigator": ["Health & Wellbeing", "Environment", "Energy", "Food & Agriculture", "Other"],
  innovator: ["Assistive Tech", "Climate Tech", "EdTech", "Rural Solutions", "Other"],
  "open-arena": ["SDG 3", "SDG 4", "SDG 7", "SDG 11", "SDG 13", "Other"],
};

function generateExtraTeams(): Team[] {
  const rand = mulberry32(42);
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const tracks = ["sci-investigator", "innovator", "open-arena"] as const;
  const teams: Team[] = [];
  // 33 more teams so total is 36; 11 per track
  const distribution: string[] = [];
  tracks.forEach((tr) => { for (let i = 0; i < 11; i++) distribution.push(tr); });
  // shuffle deterministic
  for (let i = distribution.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
  }
  const statuses: AccessStatus[] = ["registered", "consent-pending", "active", "submitted", "active", "active"];
  for (let i = 0; i < distribution.length; i++) {
    const idx = i + 4;
    const trackId = distribution[i];
    const school = pick(SCHOOLS);
    const memberCount = 2 + Math.floor(rand() * 3); // 2-4
    const members: TeamMember[] = Array.from({ length: memberCount }, (_, k) => {
      const name = `${pick(FIRST)} ${pick(LAST)[0]}.`;
      const consentRoll = rand();
      const consent: ConsentStatus = consentRoll < 0.65 ? "confirmed" : consentRoll < 0.85 ? "sent" : "pending";
      return {
        id: `m-${idx}-${k}`,
        name,
        grade: String(8 + Math.floor(rand() * 3)),
        email: `student${idx}${k}@example.com`,
        parentEmail: `parent${idx}${k}@example.com`,
        consent,
      };
    });
    const day = 12 + Math.floor(rand() * 40);
    const registeredOn = `2026-${day > 30 ? "07" : "06"}-${String(day > 30 ? day - 30 : day).padStart(2, "0")}`;
    teams.push({
      id: `t${idx}`,
      teamCode: `RITX-2026-${String(420 + idx).padStart(4, "0")}`,
      teamName: TEAM_NAMES[idx - 1] ?? `Team ${idx}`,
      school: school.school,
      city: school.city,
      state: school.state,
      trackId,
      subTheme: pick(SUBTHEMES[trackId]),
      registeredOn,
      status: pick(statuses),
      members,
    });
  }
  return teams;
}

mockTeams.push(...generateExtraTeams());

export const registrationStats = {
  totalRegistrations: mockTeams.length,
  totalSchools: new Set(mockTeams.map((t) => t.school)).size,
  activeTeams: mockTeams.filter((t) => t.status === "active" || t.status === "submitted").length,
  consentPending: mockTeams.reduce((n, t) => n + t.members.filter((m) => m.consent !== "confirmed").length, 0),
  byMode: { free: 0, paid: 0, sponsored: mockTeams.length, invite: 0 },
  byTrack: mockTeams.reduce<Record<string, number>>((acc, t) => {
    acc[t.trackId] = (acc[t.trackId] || 0) + 1;
    return acc;
  }, {}),
};
