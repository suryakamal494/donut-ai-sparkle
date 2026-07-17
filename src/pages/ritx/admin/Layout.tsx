import { RitxShell } from "@/components/ritx/shared/RitxShell";
import { LayoutDashboard, Settings, Users, UserCog, MessageCircle, CreditCard, FileEdit, FileText, Scale, Gavel } from "lucide-react";

export default function RitxAdminLayout() {
  return (
    <RitxShell
      role="Admin"
      roleColor="from-violet-500 to-indigo-600"
      nav={[
        { to: "/ritx/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/ritx/admin/setup", label: "Competition setup", icon: Settings },
        { to: "/ritx/admin/registrations", label: "Registrations", icon: Users },
        { to: "/ritx/admin/staff", label: "Mentors & judges", icon: UserCog },
        { to: "/ritx/admin/submission-forms", label: "Submission forms", icon: FileEdit },
        { to: "/ritx/admin/submissions", label: "Submissions", icon: FileText },
        { to: "/ritx/admin/rubrics", label: "Rubrics", icon: Scale },
        { to: "/ritx/admin/judge-assignments", label: "Judge assignments", icon: Gavel },
        { to: "/ritx/admin/communications", label: "WhatsApp", icon: MessageCircle },
        { to: "/ritx/admin/payment", label: "Payment gateway", icon: CreditCard },
      ]}
    />
  );
}
