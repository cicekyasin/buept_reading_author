export type CEFRLevel =
  | 'A1' | 'A1+'
  | 'A2-' | 'A2' | 'A2+'
  | 'B1-' | 'B1' | 'B1+'
  | 'B2-' | 'B2' | 'B2+';

export type UserRole = 'student' | 'instructor';
export type AppMode = 'designer' | 'exam';
export type CreditSystemMode = 'simple' | 'complex';

export interface VocabularyWord {
  word: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
}

export interface ComprehensionQuestion {
  question: string;
  type: 'true-false' | 'multiple-choice' | 'short-answer';
  answer: string;
  options?: string[];
}

export interface LessonPlan {
  title: string;
  cefrLevel: CEFRLevel;
  pedagogicalRationale: string;
  readingPassage: string;
  keyVocabulary: VocabularyWord[];
  comprehensionQuestions: ComprehensionQuestion[];
  writingPrompts: string[];
}

export interface Source {
  uri: string;
  title: string;
}

export interface CefrAnalysisResult {
  estimatedLevel: string;
  justification: string;
}

// BUEPT Exam Types
export interface BueptQuestion {
  questionNumber: number;
  questionText: string;
  type: string;
  paragraphReference: string;
  options?: string[];
  answer: string;
  additionalPassage?: string;
  missingSentence?: string;
  paragraphWithMarkers?: string;
  matchOptions?: string[];
}

export interface BueptReadingSection {
  title: string;
  passage: string;
  questions: BueptQuestion[];
  sourceCredit?: string;
}

export interface BueptExam {
  reading1: BueptReadingSection;
  reading2: BueptReadingSection;
}

// Interactive Exam Types
export type UserAnswers = Record<number, string>;

export type GradingResult = {
  result: 'correct' | 'incorrect';
  correctAnswer: string;
  userAnswer: string;
};

export type GradingResults = Record<number, GradingResult>;