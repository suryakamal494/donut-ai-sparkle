import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { mockTeams } from "@/data/mockData";
import { initialRubrics } from "@/data/rubricData";
import { SubmissionViewer } from "@/components/judging/SubmissionViewer";
import { ScoringPanel } from "@/components/judging/ScoringPanel";
import { useMediaQuery } from "@/hooks/use-media-query";

// Mock: current judge is s3 (matches AssignedList)
const CURRENT_JUDGE_ID = "s3";

export default function RitxJudgeScoreSheet() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const team = mockTeams.find((t) => t.id === teamId);
  const rubric = team ? initialRubrics.find((r) => r.trackId === team.trackId) : undefined;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!team || !rubric) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/staff/judge")}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Card className="p-6 mt-2">Submission not found or rubric not published.</Card>
      </div>
    );
  }

  const backBar = (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-10">
      <Button variant="ghost" size="sm" onClick={() => navigate("/staff/judge")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to queue
      </Button>
      <div className="text-xs text-muted-foreground">Blind evaluation</div>
    </div>
  );

  if (!isDesktop) {
    // Mobile / tablet: viewer full-width, scoring in a bottom sheet via FAB
    return (
      <div className="-m-4 sm:-m-6 flex flex-col h-[calc(100vh-var(--header-h,4rem))]">
        {backBar}
        <div className="flex-1 min-h-0">
          <SubmissionViewer teamId={team.id} mode="judge" />
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="fixed bottom-4 right-4 shadow-lg h-12 px-5 rounded-full z-30">
              <ClipboardCheck className="w-4 h-4 mr-2" /> Score submission
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] flex flex-col">
            <SheetHeader><SheetTitle>Score submission</SheetTitle></SheetHeader>
            <div className="flex-1 min-h-0 mt-3">
              <ScoringPanel teamId={team.id} judgeId={CURRENT_JUDGE_ID} compact onSubmitted={() => { setSheetOpen(false); setTimeout(() => navigate("/staff/judge"), 400); }} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="-m-4 sm:-m-6 flex flex-col h-[calc(100vh-var(--header-h,4rem))]">
      {backBar}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={62} minSize={40}>
          <div className="h-full">
            <SubmissionViewer teamId={team.id} mode="judge" />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={38} minSize={28}>
          <div className="h-full p-4 bg-muted/20">
            <ScoringPanel teamId={team.id} judgeId={CURRENT_JUDGE_ID} onSubmitted={() => setTimeout(() => navigate("/staff/judge"), 500)} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
