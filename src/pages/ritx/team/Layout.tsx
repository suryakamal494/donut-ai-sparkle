import { RitxShell } from "@/components/ritx/shared/RitxShell";
import { Home, Users, FileText } from "lucide-react";

export default function RitxTeamLayout() {
  return (
    <RitxShell
      role="Team"
      roleColor="from-fuchsia-500 to-rose-500"
      nav={[
        { to: "/ritx/team", label: "Home", icon: Home },
        { to: "/ritx/team/members", label: "Members & consent", icon: Users },
        { to: "/ritx/team/submissions", label: "Submissions", icon: FileText },
      ]}
    />
  );
}
