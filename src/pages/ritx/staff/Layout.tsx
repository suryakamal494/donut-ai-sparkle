import { RitxShell } from "@/components/ritx/shared/RitxShell";
import { LayoutDashboard, Gavel, BookOpen } from "lucide-react";

export default function RitxStaffLayout() {
  return (
    <RitxShell
      role="Staff"
      roleColor="from-emerald-500 to-cyan-500"
      nav={[
        { to: "/ritx/staff", label: "Overview", icon: LayoutDashboard },
        { to: "/ritx/staff/judge", label: "Judging (blind)", icon: Gavel },
        { to: "/ritx/staff/mentor", label: "Mentoring", icon: BookOpen },
      ]}
    />
  );
}
