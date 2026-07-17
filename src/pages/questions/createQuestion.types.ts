// Type definitions for the Create Question screen.

export interface SubQuestion {
  type: 'mcq' | 'multiple' | 'numerical' | 'fill' | 'truefalse';
  text: string;
  options: string[];
  correctAnswer: string;
  blankAnswers?: string[];
}
