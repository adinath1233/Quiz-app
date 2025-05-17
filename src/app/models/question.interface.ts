export interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizState {
  language: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
} 