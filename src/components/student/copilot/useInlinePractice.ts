// useInlinePractice — manages inline practice question flow within chat
import { useState, useCallback, useRef } from "react";
import { insertAttempts } from "./api";
import type { StudentArtifact, StudentAttempt } from "./types";
import type { PracticeQuestion } from "./InlinePracticeCard";
import { normalizePracticeSession } from "./artifactNormalizers";

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
      return {
        question: q.question ?? q.prompt ?? "",
        type: q.type ?? "mcq",
        options: q.options,
        answer: q.correct_answer ?? q.answer ?? "",
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