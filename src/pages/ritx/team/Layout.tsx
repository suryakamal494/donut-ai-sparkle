import { RitxShell } from "@/components/shared/RitxShell";
import { Home, Users, FileText, FolderOpen, Trophy } from "lucide-react";

export default function RitxTeamLayout() {
  return (
    <RitxShell
      role="Team"
      roleColor="from-fuchsia-500 to-rose-500"
      nav={[
        { to: "/team", label: "Home", icon: Home },
        { to: "/team/members", label: "Members & consent", icon: Users },
        { to: "/team/resources", label: "Resources", icon: FolderOpen },
        { to: "/team/submissions", label: "Submissions", icon: FileText },
        { to: "/team/results", label: "Results", icon: Trophy },
      ]}
    />
  );
}
