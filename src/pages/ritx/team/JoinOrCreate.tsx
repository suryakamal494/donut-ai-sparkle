import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, KeyRound, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import DonutLogo from "@/components/shared/DonutLogo";
import {
  createWorkspace,
  ensureCurrentUser,
  getCurrentUser,
  getWorkspaceForUser,
  joinByCode,
} from "@/data/ritx/workspaceState";

export default function RitxTeamJoinOrCreate() {
  const navigate = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    // If already in a workspace, skip this screen entirely.
    const u = getCurrentUser();
    if (u && getWorkspaceForUser(u.id)) navigate("/team", { replace: true });
  }, [navigate]);

  const user = getCurrentUser() ?? ensureCurrentUser();

  const doCreate = () => {
    try {
      const ws = createWorkspace(teamName, user.id);
      toast.success(`Workspace "${ws.name}" created — invite code ${ws.code}`);
      navigate("/team");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const doJoin = () => {
    const r: { ok: boolean; workspace?: { name: string }; reason?: string } = joinByCode(code, user.id);
    if (r.ok && r.workspace) {
      toast.success(`Joined "${r.workspace.name}"`);
      navigate("/team");
    } else {
      toast.error(r.reason ?? "Unable to join workspace");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/60 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <DonutLogo size={40} />
          <div>
            <div className="font-bold text-lg gradient-text leading-tight">RiTX</div>
            <div className="text-xs text-muted-foreground">Hi {user.name.split(" ")[0]} — set up your team workspace</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 bg-white flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-donut-coral to-donut-orange flex items-center justify-center shadow-md mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-lg">Create a new workspace</div>
            <p className="text-sm text-muted-foreground mt-1 flex-1">
              You'll be the team lead. You get an invite code to share with up to 3 teammates. Only the lead can complete payment.
            </p>
            <Button
              className="mt-4 bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0 shadow-md shadow-donut-coral/30"
              onClick={() => setOpenCreate(true)}
            >
              Create workspace <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>

          <Card className="p-6 rounded-2xl border-orange-100/60 shadow-sm shadow-orange-100/30 bg-white flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md mb-3">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-lg">Join with an invite code</div>
            <p className="text-sm text-muted-foreground mt-1">
              Ask your team lead for the 6-character workspace code and paste it here.
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="code" className="text-xs">Invite code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 6))}
                placeholder="e.g. NEON88"
                className="uppercase tracking-widest font-mono text-center text-lg h-12"
                maxLength={6}
                autoComplete="off"
                onKeyDown={(e) => { if (e.key === "Enter" && code.length === 6) doJoin(); }}
              />
              <Button
                onClick={doJoin}
                disabled={code.length !== 6}
                variant="outline"
                className="w-full border-teal-200 hover:bg-teal-50"
              >
                <Users className="w-4 h-4 mr-1" /> Join workspace
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Each student can be in only one workspace at a time.
        </p>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Name your team workspace</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="team-name">Workspace name</Label>
            <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Solar Sparks" />
            <p className="text-[11px] text-muted-foreground">
              You can invite up to 3 teammates after this. You'll pick your track later from the dashboard.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button
              disabled={!teamName.trim()}
              onClick={doCreate}
              className="bg-gradient-to-r from-donut-coral to-donut-orange hover:opacity-95 border-0"
            >
              Create workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}