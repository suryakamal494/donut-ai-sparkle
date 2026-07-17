import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Gavel, BookOpen } from "lucide-react";

export default function RitxStaffHome() {
  return (
    <div className="space-y-4">
      <PageHeader title="Staff overview" description="Access is granted by the admin. Available tools appear below." />
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-5">
          <Gavel className="w-5 h-5 text-primary mb-2" />
          <div className="font-semibold">Judging (blind)</div>
          <p className="text-sm text-muted-foreground mt-1">Score submissions using the rubric. Teams are anonymised — only Team IDs are shown. Available in Phase 3.</p>
        </Card>
        <Card className="p-5">
          <BookOpen className="w-5 h-5 text-primary mb-2" />
          <div className="font-semibold">Mentoring</div>
          <p className="text-sm text-muted-foreground mt-1">Upload theme-wise resources and host webinars for teams. Available in Phase 1.</p>
        </Card>
      </div>
    </div>
  );
}
