import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import RoutinePilotPage from "./RoutinePilotPage";
import CopilotTutorial, { shouldShowTutorial } from "./CopilotTutorial";
import { cn } from "@/lib/utils";
import { useCopilot } from "./CopilotContext";

// Map teacher routes → preferred routine
function deriveRoutineFromPath(pathname: string): string | null {
  if (pathname.startsWith("/teacher/dashboard")) return "lesson_prep";
  if (pathname.startsWith("/teacher/tests")) return "test_creation";
  if (pathname.startsWith("/teacher/homework")) return "homework";
  if (pathname.startsWith("/teacher/reports")) return "analysis";
  if (pathname.startsWith("/teacher/syllabus")) return "syllabus_tracker";
  return null;
}

// Try to extract a batch id from common patterns: /.../batches/:id, /.../batch/:id
function deriveBatchIdFromPath(pathname: string): string | null {
  const m = pathname.match(/\/batch(?:es)?\/([^/?#]+)/);
  return m ? m[1] : null;
}

export default function CopilotLauncher() {
  const location = useLocation();
  const { isOpen, openCopilot, closeCopilot, toggleCopilot, initialRoutineKey, initialBatchId } =
    useCopilot();

  // Global Cmd/Ctrl+K + Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCopilot();
      } else if (e.key === "Escape" && isOpen) {
        closeCopilot();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, toggleCopilot, closeCopilot]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Resolve context-aware preselects: explicit (from openCopilot opts) wins; otherwise derive from route.
  const resolvedRoutineKey =
    initialRoutineKey ?? deriveRoutineFromPath(location.pathname);
  const resolvedBatchId = initialBatchId ?? deriveBatchIdFromPath(location.pathname);

  // Tutorial state — show on open if eligible
  const [tutorialVisible, setTutorialVisible] = useState(false);
  useEffect(() => {
    if (isOpen && shouldShowTutorial()) {
      // Small delay so the overlay paints first
      const t = setTimeout(() => setTutorialVisible(true), 250);
      return () => clearTimeout(t);
    }
    if (!isOpen) setTutorialVisible(false);
  }, [isOpen]);

  const handleOpen = () => openCopilot();

  // Hide the floating launcher on focused lesson-plan workspaces (editor /
  // canvas / presentation) where a dedicated action footer or full-screen
  // surface already occupies the bottom-right and would collide with the FAB.
  const hideFab = /^\/teacher\/(lesson-plans|l)\/.+/.test(location.pathname);

  return (
    <>
      {/* Floating Action Button - hidden when overlay open */}
      {!isOpen && !hideFab && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open Copilot"
          title="Open Copilot (⌘K)"
          className={cn(
            "fixed z-40 right-4 md:right-6",
            "bottom-20 md:bottom-6",
            "flex items-center gap-2 pl-4 pr-5 h-12 md:h-14 rounded-full",
            "bg-gradient-to-r from-primary to-accent text-white",
            "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
            "hover:scale-105 active:scale-95 transition-all duration-200",
            "ring-1 ring-white/20"
          )}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold text-sm md:text-base">Copilot</span>
        </button>
      )}

      {/* Full-screen overlay (covers app chrome entirely) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-background flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Copilot workspace"
        >
          {/* Slim top bar — only Exit on left, brand mark on right */}
          <div className="h-12 flex items-center justify-between px-3 md:px-4 border-b bg-card/80 backdrop-blur-xl flex-shrink-0">
            <button
              type="button"
              data-tour="copilot-exit"
              onClick={closeCopilot}
              className="flex items-center gap-1.5 h-8 px-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
              aria-label="Exit Copilot"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Copilot</span>
              <span className="sm:hidden">Exit</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm">Copilot</span>
            </div>
          </div>

          {/* Workspace */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <RoutinePilotPage
              initialBatchId={resolvedBatchId}
              initialRoutineKey={resolvedRoutineKey}
            />
          </div>

          {/* First-run coachmark tour */}
          {tutorialVisible && (
            <CopilotTutorial onDone={() => setTutorialVisible(false)} />
          )}
        </div>
      )}
    </>
  );
}
