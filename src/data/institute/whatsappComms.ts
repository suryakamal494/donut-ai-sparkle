// WhatsApp Communications Hub — Deterministic Mock Data (UI-only)
import type {
  WhatsAppBalance,
  RechargePack,
  AlertConfigRow,
  HistoryEntry,
  CommClassOption,
} from "@/types/whatsappComms";

export const SCHOOL_NAME = "Delhi Public School";
export const GST_RATE = 0.18;
export const LOW_BALANCE_THRESHOLD = 1000;

export const defaultBalance: WhatsAppBalance = {
  remaining: 8420,
  usedThisMonth: 6580,
  lastLowBalanceAlertAt: null,
};

export const rechargePacks: RechargePack[] = [
  { id: "pack-5k", messages: 5000, ratePerMessage: 0.85 },
  { id: "pack-10k", messages: 10000, ratePerMessage: 0.8, tag: "Popular" },
  { id: "pack-25k", messages: 25000, ratePerMessage: 0.72, tag: "Best value" },
];

export const alertConfigRows: AlertConfigRow[] = [
  {
    id: "alert-sub-assigned",
    audience: "teachers",
    title: "Substitution Assigned",
    description: "When a teacher is assigned to cover another class.",
    enabledByDefault: true,
    previewBody:
      "Substitution Alert\n\nDear Mr. Sharma,\nYou are assigned to cover Class 10B – Mathematics, Period 3 (10:30 AM) today.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-today-schedule",
    audience: "teachers",
    title: "Today's Schedule",
    description: "A morning summary of the teacher's periods for the day.",
    enabledByDefault: true,
    previewBody:
      "Today's Schedule\n\nDear Ms. Iyer,\nYou have 5 periods today:\nP1 9A Physics, P3 10B Physics, P4 11A Physics, P6 9A Physics, P7 12B Physics.\n\nHave a great day,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-timetable-published",
    audience: "teachers",
    title: "Timetable Published / Changed",
    description: "When the weekly timetable is published or a period changes.",
    enabledByDefault: true,
    previewBody:
      "Timetable Update\n\nDear Teacher,\nThe timetable for Jan 13–17 has been published. You have 18 periods scheduled this week.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-exam-timetable-teacher",
    audience: "teachers",
    title: "Exam Timetable",
    description: "When an exam schedule affecting the teacher is released.",
    enabledByDefault: false,
    previewBody:
      "Exam Schedule\n\nDear Teacher,\nPhysics Monthly Test for Class 11A is scheduled on Jan 20, 2025, 9:00 AM. Duration: 90 min.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-exam-reports-ready",
    audience: "teachers",
    title: "Exam Reports Ready",
    description: "When result analysis for the teacher's batch is available.",
    enabledByDefault: false,
    previewBody:
      "Results Ready\n\nDear Teacher,\nThe result analysis for Physics Unit Test (Class 11A) is now available in your dashboard.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-syllabus-lag",
    audience: "teachers",
    title: "Syllabus Lag Nudge",
    description: "When teaching falls behind the academic schedule.",
    enabledByDefault: true,
    previewBody:
      "Syllabus Reminder\n\nDear Mr. Sharma,\nClass 10B Mathematics is 2 days behind the planned schedule. Please reconcile 'Quadratic Equations' this week.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-exam-score",
    audience: "parents",
    title: "Exam Score After Attempt",
    description: "Sent to parents once a student's exam is graded.",
    enabledByDefault: true,
    previewBody:
      "Exam Result Notification\n\nDear Parent,\nRohan scored 82/100 in Mathematics Unit Test.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-exam-timetable-parent",
    audience: "parents",
    title: "Exam Timetable",
    description: "When an upcoming exam schedule is published for the class.",
    enabledByDefault: true,
    previewBody:
      "Exam Schedule\n\nDear Parent,\nClass 8 Half-Yearly exams begin Jan 20. Mathematics: Jan 20, Science: Jan 22, English: Jan 24.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-schedule-change",
    audience: "parents",
    title: "Academic Schedule Change",
    description: "When holidays or class timings change.",
    enabledByDefault: true,
    previewBody:
      "Schedule Update\n\nDear Parent,\nDue to a school event, classes on Jan 18 will close early at 12:30 PM.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-attendance",
    audience: "parents",
    title: "Attendance / Absence",
    description: "When a student is marked absent for the day.",
    enabledByDefault: false,
    previewBody:
      "Attendance Alert\n\nDear Parent,\nRohan (Class 8A) was marked absent today, Jan 15. Please contact the office if this is unexpected.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-holiday",
    audience: "parents",
    title: "Holiday Declared",
    description: "When the institute declares a holiday.",
    enabledByDefault: true,
    previewBody:
      "Holiday Notice\n\nDear Parent,\nThe school will remain closed on Jan 26 for Republic Day.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
  {
    id: "alert-announcement-parent",
    audience: "parents",
    title: "General Announcement",
    description: "For PTM reminders and other institute-wide notices.",
    enabledByDefault: false,
    previewBody:
      "Announcement\n\nDear Parent,\nThe Parent-Teacher Meeting is scheduled for Jan 25, 10:00 AM – 1:00 PM.\n\nRegards,\n" +
      SCHOOL_NAME,
  },
];

export const commClasses: CommClassOption[] = [
  {
    id: "class-8",
    label: "Class 8",
    sections: [
      { id: "8A", label: "8A", recipients: 156 },
      { id: "8B", label: "8B", recipients: 152 },
      { id: "8C", label: "8C", recipients: 154 },
    ],
  },
  {
    id: "class-9",
    label: "Class 9",
    sections: [
      { id: "9A", label: "9A", recipients: 148 },
      { id: "9B", label: "9B", recipients: 150 },
    ],
  },
  {
    id: "class-10",
    label: "Class 10",
    sections: [
      { id: "10A", label: "10A", recipients: 160 },
      { id: "10B", label: "10B", recipients: 158 },
    ],
  },
  {
    id: "class-11",
    label: "Class 11",
    sections: [
      { id: "11A", label: "11A", recipients: 120 },
      { id: "11B", label: "11B", recipients: 118 },
    ],
  },
  {
    id: "class-12",
    label: "Class 12",
    sections: [
      { id: "12A", label: "12A", recipients: 110 },
      { id: "12B", label: "12B", recipients: 112 },
    ],
  },
];

export const teacherHeadcount = 84;

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

export const seedHistory: HistoryEntry[] = [
  {
    id: "hist-1",
    type: "broadcast",
    title: "Broadcast",
    body:
      "Dear Parent,\nClass 8 Half-Yearly exams begin Jan 20. Please ensure students carry their hall tickets.\n\nRegards,\n" +
      SCHOOL_NAME,
    snapshot: { audiences: ["parents"], sections: ["8A", "8B", "8C"], recipients: 462 },
    messagesUsed: 462,
    status: "sent",
    sentAt: hoursAgo(3),
    delivery: { delivered: 458, failed: 4 },
  },
  {
    id: "hist-2",
    type: "automated",
    title: "Exam Result Notification",
    body:
      "Dear Parent,\nRohan scored 82/100 in Mathematics Unit Test.\n\nRegards,\n" +
      SCHOOL_NAME,
    snapshot: { audiences: ["parents"], sections: ["10A", "10B"], recipients: 318 },
    messagesUsed: 318,
    status: "sent",
    sentAt: hoursAgo(8),
    delivery: { delivered: 316, failed: 2 },
  },
  {
    id: "hist-3",
    type: "automated",
    title: "Substitution Assigned",
    body:
      "Dear Mr. Sharma,\nYou are assigned to cover Class 10B – Mathematics, Period 3 today.\n\nRegards,\n" +
      SCHOOL_NAME,
    snapshot: { audiences: ["teachers"], sections: [], recipients: 1 },
    messagesUsed: 1,
    status: "sent",
    sentAt: hoursAgo(26),
    delivery: { delivered: 1, failed: 0 },
  },
  {
    id: "hist-4",
    type: "broadcast",
    title: "Broadcast",
    body:
      "Dear Teacher,\nStaff meeting today at 4:00 PM in the Conference Hall. Attendance is mandatory.\n\nRegards,\n" +
      SCHOOL_NAME,
    snapshot: { audiences: ["teachers"], sections: [], recipients: 84 },
    messagesUsed: 84,
    status: "sent",
    sentAt: daysAgo(2),
    delivery: { delivered: 84, failed: 0 },
  },
  {
    id: "hist-5",
    type: "system",
    title: "Low Balance Alert",
    body:
      "Your WhatsApp balance is low. Please recharge to keep alerts and broadcasts running.",
    snapshot: { audiences: [], sections: [], recipients: 1 },
    messagesUsed: 1,
    status: "sent",
    sentAt: daysAgo(3),
    delivery: { delivered: 1, failed: 0 },
  },
  {
    id: "hist-6",
    type: "automated",
    title: "Holiday Notice",
    body:
      "Dear Parent,\nThe school will remain closed on Jan 26 for Republic Day.\n\nRegards,\n" +
      SCHOOL_NAME,
    snapshot: {
      audiences: ["parents"],
      sections: ["8A", "8B", "8C", "9A", "9B", "10A", "10B"],
      recipients: 1078,
    },
    messagesUsed: 1078,
    status: "partial",
    sentAt: daysAgo(4),
    delivery: { delivered: 1031, failed: 47 },
  },
];

export const audienceLabels: Record<string, string> = {
  teachers: "Teachers",
  parents: "Parents",
  students: "Students",
};

export const fmt = (n: number) => n.toLocaleString("en-IN");

export const inr = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
