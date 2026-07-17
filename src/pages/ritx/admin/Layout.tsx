import { RitxShell } from "@/components/ritx/shared/RitxShell";
import { LayoutDashboard, Settings, Users } from "lucide-react";

export default function RitxAdminLayout() {
  return (
    <RitxShell
      role="Admin"
      roleColor="from-violet-500 to-indigo-600"
      nav={[
        { to: "/ritx/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/ritx/admin/setup", label: "Competition setup", icon: Settings },
        { to: "/ritx/admin/registrations", label: "Registrations", icon: Users },
      ]}
    />
  );
}
