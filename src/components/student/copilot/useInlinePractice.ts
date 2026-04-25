// useInlinePractice — manages inline practice question flow within chat
import { useState, useCallback, useRef } from "react";
import { insertAttempts } from "./api";
import type { StudentArtifact, StudentAttempt } from "./types";
import type { PracticeQuestion } from "./InlinePracticeCard";
import { normalizePracticeSession } from "./artifactNormalizers";

const LABELS = ["A", "B", "C", "D", "E", "F"];

export interface PracticeResult {
  given: string;
  correct: boolean;
  topic?: string;
}

export interface PracticeState {
  artifactId: string;
  questions: PracticeQuestion[];
  currentIndex: number;
  results: PracticeResult[];
  finished: boolean;
}

export function useInlinePractice(studentId: string) {
  const [practiceStates, setPracticeStates] = useState<Record<string, PracticeState>>({});
  // Use ref to avoid stale closure in answerQuestion
  const statesRef = useRef(practiceStates);
  statesRef.current = practiceStates;

  const startPractice = useCallback((artifact: StudentArtifact) => {
    const content = normalizePracticeSession(artifact.content as any);
    // Map normalized questions to InlinePracticeCard format
    const questions: PracticeQuestion[] = (content?.questions ?? []).map((q: any) => {
      const options = Array.isArray(q.options)
        ? q.options.map((o: any, index: number) =>
            typeof o === "object"
              ? { label: String(o.label ?? LABELS[index] ?? index + 1), text: String(o.text ?? "") }
              : { label: LABELS[index] ?? String(index + 1), text: String(o) }
          )
        : undefined;
      const answer = String(q.correct_answer ?? q.answer ?? "").trim();
      const answerOption = options?.find(
        (o) => o.label.toLowerCase() === answer.toLowerCase() || o.text.trim().toLowerCase() === answer.toLowerCase()
      );
      return {
        question: q.question ?? q.prompt ?? "",
        type: q.type ?? "mcq",
        options,
        answer: answerOption?.label ?? answer,
        explanation: q.explanation,
        topic: q.topic,
        subject: q.subject ?? content?.subject,
      };
    });
    if (questions.length === 0) return;

    setPracticeStates((prev) => ({
      ...prev,
      [artifact.id]: {
        artifactId: artifact.id,
        questions,
        currentIndex: 0,
        results: [],
        finished: false,
      },
    }));
  }, []);

  const answerQuestion = useCallback(
    async (artifactId: string, given: string, correct: boolean) => {
      setPracticeStates((prev) => {
        const state = prev[artifactId];
        if (!state) return prev;
        const q = state.questions[state.currentIndex];
        const result: PracticeResult = { given, correct, topic: q?.topic };
        return {
          ...prev,
          [artifactId]: {
            ...state,
            results: [...state.results, result],
          },
        };
      });

      // Record attempt — use ref for fresh state
      const state = statesRef.current[artifactId];
      if (state) {
        const q = state.questions[state.currentIndex];
        const attempt: StudentAttempt = {
          student_id: studentId,
          artifact_id: artifactId,
          subject: q?.subject ?? null,
          topic: q?.topic ?? null,
          question_type: q?.type ?? "short",
          question_text: q?.question ?? null,
          expected_answer: q?.answer ?? null,
          given_answer: given,
          correct,
          source: "practice",
        };
        await insertAttempts([attempt]);
      }
    },
    [studentId]
  );

  const nextQuestion = useCallback((artifactId: string) => {
    setPracticeStates((prev) => {
      const state = prev[artifactId];
      if (!state) return prev;
      const nextIdx = state.currentIndex + 1;
      const finished = nextIdx >= state.questions.length;
      return {
        ...prev,
        [artifactId]: {
          ...state,
          currentIndex: finished ? state.currentIndex : nextIdx,
          finished,
        },
      };
    });
  }, []);

  const resetPractice = useCallback((artifactId: string) => {
    setPracticeStates((prev) => {
      const state = prev[artifactId];
      if (!state) return prev;
      return {
        ...prev,
        [artifactId]: {
          ...state,
          currentIndex: 0,
          results: [],
          finished: false,
        },
      };
    });
  }, []);

  return {
    practiceStates,
    startPractice,
    answerQuestion,
    nextQuestion,
    resetPractice,
  };
}