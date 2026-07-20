/**
 * Core domain models — strictly typed data contracts.
 * Equivalent to Java DTOs/Records for the quiz engine.
 */

// ===== TOPIC =====

export type TopicPriority = 0 | 1 | 2 | 3;
export type TopicMode = 'interview' | 'practice' | 'theory';
export type TopicGroup = 'interview' | 'backend' | 'distributed' | 'frontend' | 'quality' | 'more';

export interface Subtopic {
  id: string;
  label: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  priority: TopicPriority;
  group?: TopicGroup;
  desc: string;
  mode: TopicMode;
  subtopics: Subtopic[];
}

// ===== QUESTIONS =====

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TEXT_OUTPUT'
  | 'COMPILES_OR_NOT'
  | 'FILL_THE_BLANK'
  | 'ORDER_STEPS'
  | 'MATCH_PAIRS'
  | 'TRACE_EXECUTION'
  | 'SELECT_LINE'
  | 'CODE_FIX'
  // Original types from the JS data (not normalized)
  | 'PREDICT_OUTPUT'
  | 'ORAL_ANSWER'
  | 'FILL_BLANK'
  | 'PICK_INVALID'
  | 'COMPARE'
  | 'SYSTEM_DESIGN'
  | 'DEBUG_ISSUE'
  | 'SCENARIO'
  | 'EXPLAIN_WHY'
  | string; // Allow any string for future types

/**
 * Question — flexible interface that preserves ALL original fields.
 * No normalization. The quiz engine handles each type dynamically.
 */
export interface Question {
  id: string;
  type: QuestionType;
  topic?: string;
  subtopic?: string;
  difficulty?: string;

  // Display fields (varies by type)
  prompt?: string;
  mission?: string;
  question?: string;
  code?: string;

  // Answer fields (varies by type)
  choices?: string[];
  options?: string[];
  answer?: string | number | string[];
  correct?: unknown;
  blank?: string;
  snippets?: Array<{ id: string; code: string; valid?: boolean }>;

  // Rich content (interview exercises)
  explanation?: string;
  explain?: string;
  modelAnswer?: string;
  shortAnswer?: string;
  keyPoints?: string[];
  followUps?: Array<{ question: string; answerHint?: string }>;
  vocabulary?: Array<{ term: string; meaning: string; example?: string }>;
  mistakesToAvoid?: string[];
  selfEvaluation?: Array<{ criterion: string; weight: number }>;
  interviewerIntent?: string;
  senaiExample?: string;
  reweExample?: string;
  context?: string;
  followUp?: string;
  tags?: string[];

  // Allow any additional fields from original data
  [key: string]: unknown;
}

// ===== THEORY =====

export interface TheorySection {
  heading: string;
  content: string;
}

export interface TheoryChapter {
  id: string;
  topic?: string;
  subtopic?: string;
  title: string;
  sections: TheorySection[];
}

// ===== PROGRESS =====

export interface TopicProgress {
  topicId: string;
  totalQuestions: number;
  answered: number;
  correct: number;
  lastAttempt: string | null;  // ISO date
  mastery: number;             // 0-100
}

export interface UserProgress {
  totalXp: number;
  streak: number;
  lastPractice: string | null;  // ISO date
  topics: Record<string, TopicProgress>;
}

// ===== QUIZ SESSION =====

export type AnswerResult = 'correct' | 'incorrect' | 'partial';

export interface QuizAnswer {
  questionId: string;
  userAnswer: unknown;
  result: AnswerResult;
  timeMs: number;
}

export interface QuizSession {
  topicId: string;
  subtopicId?: string;
  questions: Question[];
  currentIndex: number;
  answers: QuizAnswer[];
  startedAt: string;
  combo: number;
  maxCombo: number;
}
