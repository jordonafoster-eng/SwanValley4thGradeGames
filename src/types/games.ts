export type Subject = 'math' | 'reading' | 'science' | 'logic';

export interface UserProgress {
  level: number;
  exp: number;
  expToNextLevel: number;
  totalCorrect: number;
  totalAttempts: number;
}

export interface SubjectProgress {
  math: UserProgress;
  reading: UserProgress;
  science: UserProgress;
  logic: UserProgress;
}

export interface GameQuestion {
  id: string;
  question: string;
  answer: string | number;
  options?: string[];
  difficulty: number; // 1-10 scale
}

export interface GameState {
  currentQuestion: GameQuestion | null;
  score: number;
  questionsAnswered: number;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export interface SubjectCategory {
  id: Subject;
  title: string;
  description: string;
  icon: string;
  color: string;
}
