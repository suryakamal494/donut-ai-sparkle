import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Gavel, BookOpen, Video, FolderOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockStaff, mockSessions, mockResources } from "@/data/ritx/staffData";

const currentStaff = mockStaff.find((s) => s.id === "s3")!;

export default function RitxStaffHome() {
  const nav = useNavigate();
  return (
    <div className="space-y-4">
      <PageHeader title={`Welcome, ${currentStaff.name.split(" ")[0]}`} description="Your available tools based on granted access" />

      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">My resources</div>
          <div className="text-2xl font-bold mt-1">{mockResources.filter((r) => r.uploadedBy === currentStaff.name).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Upcoming sessions</div>
          <div className="text-2xl font-bold mt-1">{mockSessions.filter((s) => s.mentorName === currentStaff.name).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Judging queue</div>
          <div className="text-2xl font-bold mt-1">{currentStaff.judgeAccess ? 7 : "—"}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {currentStaff.mentorAccess && (
          <>
            <Card className="p-5">
              <FolderOpen className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold">Resources</div>
              <p className="text-sm text-muted-foreground mt-1 mb-3">Upload theme-wise guides, videos and templates for teams.</p>
              <Button variant="outline" size="sm" onClick={() => nav("/staff/mentor/resources")}>Manage <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Card>
            <Card className="p-5">
              <Video className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold">Webinars & office hours</div>
              <p className="text-sm text-muted-foreground mt-1 mb-3">Schedule live sessions; teams see them in their calendar with a join countdown.</p>
              <Button variant="outline" size="sm" onClick={() => nav("/staff/mentor/sessions")}>Schedule <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Card>
          </>
        )}
        {currentStaff.judgeAccess && (
          <Card className="p-5 md:col-span-2">
            <Gavel className="w-5 h-5 text-primary mb-2" />
            <div className="font-semibold">Judging (blind view)</div>
            <p className="text-sm text-muted-foreground mt-1 mb-3">Assigned submissions show only Team IDs. Rubric scoring opens in Phase 3.</p>
            <Button variant="outline" size="sm" onClick={() => nav("/staff/judge")}>Open queue <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </Card>
        )}
        {!currentStaff.mentorAccess && !currentStaff.judgeAccess && (
          <Card className="p-5 md:col-span-2">
            <div className="font-semibold">No access granted yet</div>
            <p className="text-sm text-muted-foreground mt-1">Ask your admin to enable Mentor and/or Judge access on your account.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
