// Static configuration for the Create Question screen.
// Extracted from CreateQuestion.tsx so that editing these lists
// does not force Vite to re-transform the 700-line page component.

export const cognitiveTypes = [
  { id: "logical", label: "Logical" },
  { id: "analytical", label: "Analytical" },
  { id: "conceptual", label: "Conceptual" },
  { id: "numerical", label: "Numerical" },
  { id: "application", label: "Application" },
  { id: "memory", label: "Memory" },
];

export const questionTypes = [
  { id: "mcq", label: "MCQ (Single Correct)" },
  { id: "multiple", label: "Multiple Correct" },
  { id: "numerical", label: "Numerical" },
  { id: "truefalse", label: "True/False" },
  { id: "assertion", label: "Assertion-Reasoning" },
  { id: "fill", label: "Fill in Blanks" },
  { id: "paragraph", label: "Paragraph Based" },
  { id: "short", label: "Short Answer" },
  { id: "long", label: "Long Answer" },
];

// Assertion-Reasoning standard options
export const assertionReasoningOptions = [
  { id: "A", label: "Both Assertion and Reason are correct, and Reason is the correct explanation for Assertion" },
  { id: "B", label: "Both Assertion and Reason are correct, but Reason is NOT the correct explanation for Assertion" },
  { id: "C", label: "Assertion is correct, but Reason is incorrect" },
  { id: "D", label: "Assertion is incorrect, but Reason is correct" },
];
