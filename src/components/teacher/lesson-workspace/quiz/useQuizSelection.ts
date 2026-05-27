import { useCallback, useMemo, useState } from "react";
import type { Question } from "@/data/questionsData";

export type QuizSource = "bank" | "ai";

export interface SelectedItem {
  question: Question;
  source: QuizSource;
}

export const useQuizSelection = () => {
  const [map, setMap] = useState<Map<string, SelectedItem>>(new Map());

  const has = useCallback((id: string) => map.has(id), [map]);

  const toggle = useCallback((q: Question, source: QuizSource) => {
    setMap((prev) => {
      const next = new Map(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.set(q.id, { question: q, source });
      return next;
    });
  }, []);

  const addMany = useCallback((qs: Question[], source: QuizSource) => {
    setMap((prev) => {
      const next = new Map(prev);
      qs.forEach((q) => next.set(q.id, { question: q, source }));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setMap(new Map()), []);

  const items = useMemo(() => Array.from(map.values()), [map]);

  return {
    has,
    toggle,
    addMany,
    remove,
    clear,
    items,
    count: map.size,
    bankCount: items.filter((i) => i.source === "bank").length,
    aiCount: items.filter((i) => i.source === "ai").length,
  };
};

export type QuizSelection = ReturnType<typeof useQuizSelection>;