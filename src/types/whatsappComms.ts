// WhatsApp Communications Hub — Type Definitions (UI-only, mock data)

export type CommAudience = "teachers" | "parents" | "students";

export type CommMessageType = "automated" | "broadcast" | "system";

export type CommDeliveryStatus = "sent" | "partial" | "paused";

/** Wallet / pay-as-you-go balance state */
export interface WhatsAppBalance {
  /** messages remaining */
  remaining: number;
  /** messages consumed in the current billing month */
  usedThisMonth: number;
  /** ISO timestamp of last low-balance alert sent to principal (or null) */
  lastLowBalanceAlertAt: string | null;
}

/** A recharge pack the institute can buy */
export interface RechargePack {
  id: string;
  /** number of messages in this pack */
  messages: number;
  /** per-message rate in INR (before GST) */
  ratePerMessage: number;
  /** marketing label, e.g. "Popular" */
  tag?: string;
}

/** A single automated-alert configuration row */
export interface AlertConfigRow {
  id: string;
  audience: Extract<CommAudience, "teachers" | "parents" | "students">;
  title: string;
  /** what this sends / when it triggers */
  description: string;
  /** enabled by default? */
  enabledByDefault: boolean;
  /** always-visible preview body with realistic merge fields filled in */
  previewBody: string;
}

/** Frozen snapshot of who a message went to, captured at send time */
export interface AudienceSnapshot {
  audiences: CommAudience[];
  /** resolved section labels at send time, e.g. ["8A","8B","8C"] */
  sections: string[];
  /** recipient count frozen at send time */
  recipients: number;
}

/** Draft used by the broadcast composer (live, not persisted) */
export interface BroadcastDraft {
  audiences: CommAudience[];
  /** class ids selected, or "all" */
  classIds: string[] | "all";
  /** section ids selected, or "all" */
  sectionIds: string[] | "all";
  message: string;
}

/** An immutable entry in the history / audit log */
export interface HistoryEntry {
  id: string;
  type: CommMessageType;
  /** short label, e.g. "Exam Result Notification" or "Broadcast" */
  title: string;
  /** full message body sent */
  body: string;
  /** frozen audience snapshot at send time */
  snapshot: AudienceSnapshot;
  /** messages deducted for this send */
  messagesUsed: number;
  status: CommDeliveryStatus;
  /** ISO timestamp */
  sentAt: string;
  /** mock delivery breakdown */
  delivery: { delivered: number; failed: number };
}

/** Class option for the broadcast scope selector */
export interface CommClassOption {
  id: string;
  label: string; // e.g. "Class 8"
  sections: { id: string; label: string; recipients: number }[];
}
