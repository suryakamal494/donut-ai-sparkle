// Phase 1 mock data: staff (mentor/judge), resources, sessions

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  organisation: string;
  mentorAccess: boolean;
  judgeAccess: boolean;
  invitedOn: string;
  status: "invited" | "active";
}

export const mockStaff: StaffAccount[] = [
  { id: "s1", name: "Dr. Vikram Rao", email: "vikram@iisc.example", organisation: "IISc Bangalore", mentorAccess: true, judgeAccess: false, invitedOn: "2026-06-05", status: "active" },
  { id: "s2", name: "Prof. Sneha Iyer", email: "sneha@iitb.example", organisation: "IIT Bombay", mentorAccess: false, judgeAccess: true, invitedOn: "2026-06-07", status: "active" },
  { id: "s3", name: "Ms. Anita Kaur", email: "anita@panel.example", organisation: "Independent Panel", mentorAccess: true, judgeAccess: true, invitedOn: "2026-06-10", status: "active" },
  { id: "s4", name: "Dr. Rahul Mehta", email: "rahul@nctr.example", organisation: "NCTR Delhi", mentorAccess: false, judgeAccess: true, invitedOn: "2026-06-14", status: "invited" },
];

export interface Resource {
  id: string;
  title: string;
  trackId: string;
  type: "guide" | "video" | "template" | "worksheet";
  uploadedBy: string;
  uploadedOn: string;
  sizeKb: number;
}

export const mockResources: Resource[] = [
  { id: "r1", title: "How to frame a scientific problem", trackId: "sci-investigator", type: "guide", uploadedBy: "Dr. Vikram Rao", uploadedOn: "2026-06-12", sizeKb: 420 },
  { id: "r2", title: "Prototype video pitch template", trackId: "innovator", type: "template", uploadedBy: "Ms. Anita Kaur", uploadedOn: "2026-06-14", sizeKb: 180 },
  { id: "r3", title: "SDG mapping worksheet", trackId: "open-arena", type: "worksheet", uploadedBy: "Ms. Anita Kaur", uploadedOn: "2026-06-16", sizeKb: 92 },
  { id: "r4", title: "Ethics & consent primer", trackId: "sci-investigator", type: "video", uploadedBy: "Dr. Vikram Rao", uploadedOn: "2026-06-18", sizeKb: 15200 },
];

export interface Session {
  id: string;
  title: string;
  mentorName: string;
  trackId: string;
  date: string; // ISO
  durationMin: number;
  joinUrl: string;
}

// Dates seeded relative to "today" for the countdown demo
const now = new Date();
const iso = (offsetMin: number) => new Date(now.getTime() + offsetMin * 60_000).toISOString();

export const mockSessions: Session[] = [
  { id: "w1", title: "Kickoff: Framing your research question", mentorName: "Dr. Vikram Rao", trackId: "sci-investigator", date: iso(8), durationMin: 45, joinUrl: "https://meet.example/kickoff" },
  { id: "w2", title: "Innovator office hours", mentorName: "Ms. Anita Kaur", trackId: "innovator", date: iso(60 * 26), durationMin: 60, joinUrl: "https://meet.example/office" },
  { id: "w3", title: "SDG alignment workshop", mentorName: "Ms. Anita Kaur", trackId: "open-arena", date: iso(60 * 72), durationMin: 90, joinUrl: "https://meet.example/sdg" },
  { id: "w4", title: "Prototype critique clinic", mentorName: "Dr. Vikram Rao", trackId: "innovator", date: iso(60 * 24 * 6), durationMin: 60, joinUrl: "https://meet.example/critique" },
];

export interface WhatsAppTemplate {
  id: string;
  name: string;
  audience: "all-teams" | "team-leads" | "parents" | "staff";
  body: string;
  lastSent?: string;
  sentCount: number;
}

export const mockWaTemplates: WhatsAppTemplate[] = [
  { id: "t1", name: "Registration confirmation", audience: "team-leads", body: "Hi {{team_name}}, your registration for RiTX is confirmed. Team ID: {{team_id}}.", lastSent: "2026-06-14", sentCount: 3 },
  { id: "t2", name: "Parent consent reminder", audience: "parents", body: "Reminder: please confirm participation consent for {{student_name}} at {{link}}.", lastSent: "2026-06-15", sentCount: 5 },
  { id: "t3", name: "Webinar starting soon", audience: "all-teams", body: "Your mentor session '{{title}}' starts in 10 minutes. Join: {{join_url}}", sentCount: 0 },
  { id: "t4", name: "Submission deadline nearing", audience: "all-teams", body: "Only {{days}} days left to submit. Log in at ritx.donutai.example.", sentCount: 0 },
];

export const waWallet = { balance: 1240, plan: "Business", usedThisMonth: 76 };
