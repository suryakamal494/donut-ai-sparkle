import { RitxShell } from "@/components/ritx/shared/RitxShell";
import { LayoutDashboard, Settings, Users, UserCog, MessageCircle, CreditCard, FileEdit, FileText, Scale, Gavel, Trophy, Megaphone } from "lucide-react";

export default function RitxAdminLayout() {
  return (
    <RitxShell
      role="Admin"
      roleColor="from-violet-500 to-indigo-600"
      nav={[
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/setup", label: "Competition setup", icon: Settings },
        { to: "/admin/registrations", label: "Registrations", icon: Users },
        { to: "/admin/staff", label: "Mentors & judges", icon: UserCog },
        { to: "/admin/submission-forms", label: "Submission forms", icon: FileEdit },
        { to: "/admin/submissions", label: "Submissions", icon: FileText },
        { to: "/admin/rubrics", label: "Rubrics", icon: Scale },
        { to: "/admin/judge-assignments", label: "Judge assignments", icon: Gavel },
        { to: "/admin/results", label: "Results", icon: Trophy },
        { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
        { to: "/admin/communications", label: "WhatsApp", icon: MessageCircle },
        { to: "/admin/payment", label: "Payment gateway", icon: CreditCard },
      ]}
    />
  );
}
