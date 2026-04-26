import React from "react";
import type { StudentArtifact } from "../types";
import { normalizeArtifactContent } from "../artifactNormalizers";
import ConceptExplainerView from "./ConceptExplainerView";
import WorkedSolutionView from "./WorkedSolutionView";
import FormulaSheetView from "./FormulaSheetView";
import PracticeSessionView from "./PracticeSessionView";
import StudyPlanView from "./StudyPlanView";
import TargetTrackerView from "./TargetTrackerView";
import MasteryMapView from "./MasteryMapView";
import ProgressReportView from "./ProgressReportView";
import TestDebriefView from "./TestDebriefView";
import InlineResourceCard from "../InlineResourceCard";

interface Props {
  artifact: StudentArtifact;
  completedTasks?: Set<string>;
  onToggleTask?: (dayIndex: number, itemIndex: number) => void;
  onPracticeTopic?: (subject: string, topic: string) => void;
  onStartTask?: (artifact: StudentArtifact, taskDescription: string, dayIndex: number, itemIndex: number) => void;
}

export default function StudentArtifactView({ artifact, completedTasks, onToggleTask, onPracticeTopic, onStartTask }: Props) {
  const content = normalizeArtifactContent(artifact.type, artifact.content as any);

  switch (artifact.type) {
    case "concept_explainer":
      return <ConceptExplainerView content={content} />;
    case "worked_solution":
      return <WorkedSolutionView content={content} />;
    case "formula_sheet":
      return <FormulaSheetView content={content} />;
    case "practice_session":
      return <PracticeSessionView content={content} />;
    case "study_plan":
      return (
        <StudyPlanView
          content={content}
          completedTasks={completedTasks}
          onToggleTask={onToggleTask}
          onStartTask={(taskDescription, dayIndex, itemIndex) =>
            onStartTask?.(artifact, taskDescription, dayIndex, itemIndex)
          }
        />
      );
    case "target_tracker":
      return <TargetTrackerView content={content} />;
    case "mastery_map":
      return <MasteryMapView content={content} onPracticeTopic={onPracticeTopic} />;
    case "progress_report":
      return <ProgressReportView content={content} />;
    case "test_debrief":
      return <TestDebriefView content={content} />;
    case "resource_recommendation":
      return (
        <div className="space-y-2">
          {(content.resources ?? []).map((resource: any) => (
            <InlineResourceCard key={resource.id} resource={resource} reason={content.reason} />
          ))}
        </div>
      );
    default:
      return (
        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
  }
}