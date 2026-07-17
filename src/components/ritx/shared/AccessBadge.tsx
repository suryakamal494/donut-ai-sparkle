import { cn } from "@/lib/utils";
import type { AccessStatus } from "@/data/ritx/mockData";

const map: Record<AccessStatus, { label: string; className: string }> = {
  registered: { label: "Registered", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "consent-pending": { label: "Consent Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  submitted: { label: "Submitted", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  locked: { label: "Locked", className: "bg-slate-200 text-slate-700 border-slate-300" },
};

export function AccessBadge({ status, className }: { status: AccessStatus; className?: string }) {
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border", s.className, className)}>
      {s.label}
    </span>
  );
}

export function ConsentBadge({ status }: { status: "pending" | "sent" | "confirmed" | "withdrawn" }) {
  const c = {
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    sent: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    withdrawn: "bg-rose-100 text-rose-700 border-rose-200",
  }[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize", c)}>
      {status}
    </span>
  );
}

export function TeamIdChip({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-primary/10 text-primary border border-primary/20">
      {code}
    </span>
  );
}
