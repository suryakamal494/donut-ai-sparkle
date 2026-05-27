import {
  mockQuestions,
  type Question,
  type QuestionType,
  type QuestionDifficulty,
  type CognitiveType,
} from "./questionsData";

export interface AiGenerationConfig {
  subject?: string;
  chapter?: string;
  topics: string[];
  cognitiveTypes: CognitiveType[];
  questionType: QuestionType;
  difficultyMix: Record<QuestionDifficulty, number>;
  count: number;
  prompt?: string;
}

let _seq = 0;
const nextId = () => `ai-q-${Date.now().toString(36)}-${(_seq++).toString(36)}`;

const pickPool = (config: AiGenerationConfig): Question[] => {
  const chapterLc = (config.chapter ?? "").toLowerCase();
  const subjectLc = (config.subject ?? "").toLowerCase();
  const topicsLc = config.topics.map((t) => t.toLowerCase());
  return mockQuestions.filter((q) => {
    if (subjectLc && q.subject.toLowerCase() !== subjectLc) return false;
    if (chapterLc && q.chapter.toLowerCase() !== chapterLc) return false;
    if (topicsLc.length && !topicsLc.includes(q.topic.toLowerCase())) return false;
    return true;
  });
};

const buildOne = (
  template: Question,
  config: AiGenerationConfig,
  index: number,
  difficulty: QuestionDifficulty,
): Question => {
  const cog =
    config.cognitiveTypes[index % Math.max(config.cognitiveTypes.length, 1)] ??
    "conceptual";
  return {
    ...template,
    id: nextId(),
    questionId: `AI-${(index + 1).toString().padStart(3, "0")}`,
    type: config.questionType,
    difficulty,
    cognitiveType: cog,
    topic: config.topics[index % config.topics.length] ?? template.topic,
    source: "AI Generated",
    status: "review",
  };
};

const expandDifficulties = (
  mix: Record<QuestionDifficulty, number>,
  total: number,
): QuestionDifficulty[] => {
  const out: QuestionDifficulty[] = [];
  (["easy", "medium", "hard"] as QuestionDifficulty[]).forEach((d) => {
    for (let i = 0; i < (mix[d] ?? 0); i++) out.push(d);
  });
  while (out.length < total) out.push("medium");
  return out.slice(0, total);
};

export const generateMockAiQuestions = (
  config: AiGenerationConfig,
): Question[] => {
  const pool = pickPool(config);
  const fallback = mockQuestions.filter(
    (q) => q.type === config.questionType,
  );
  const source = pool.length ? pool : fallback.length ? fallback : mockQuestions;
  const difficulties = expandDifficulties(config.difficultyMix, config.count);
  return Array.from({ length: config.count }, (_, i) =>
    buildOne(source[i % source.length], config, i, difficulties[i]),
  );
};

export const regenerateMockQuestion = (
  config: AiGenerationConfig,
  index: number,
  existing: Question,
): Question => {
  const pool = pickPool(config);
  const source = pool.length ? pool : mockQuestions;
  // Try to pick a different template than the previous one
  const candidates = source.filter((q) => q.questionText !== existing.questionText);
  const template = candidates.length
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : source[Math.floor(Math.random() * source.length)];
  return buildOne(template, config, index, existing.difficulty);
};

export const getTopicsForChapter = (chapter?: string, subject?: string): string[] => {
  const chapterLc = (chapter ?? "").toLowerCase();
  const subjectLc = (subject ?? "").toLowerCase();
  const topics = mockQuestions
    .filter((q) => {
      if (subjectLc && q.subject.toLowerCase() !== subjectLc) return false;
      if (chapterLc && q.chapter.toLowerCase() !== chapterLc) return false;
      return true;
    })
    .map((q) => q.topic);
  return Array.from(new Set(topics)).filter(Boolean);
};