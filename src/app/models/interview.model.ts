/**
 * Interview preparation models — clean schema for oral/technical interview questions.
 *
 * These are NOT quiz questions (no score, no right/wrong).
 * They represent what an interviewer would ask and how to structure a great answer.
 */

export type InterviewDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'SENIOR';

export type ExperienceLevel =
  | 'PRODUCTION_EXPERIENCE'
  | 'TRANSFERABLE_EXPERIENCE'
  | 'STUDIED_NOT_USED'
  | 'INFERENCE';

export type VisualBlockType =
  | 'FLOW'
  | 'ARCHITECTURE'
  | 'COMPARISON'
  | 'SEQUENCE'
  | 'HIERARCHY';

export interface InterviewFollowUp {
  question: string;
  hint?: string;
}

export interface CodeExample {
  language: string;
  title?: string;
  code: string;
}

export interface VisualBlock {
  type: VisualBlockType;
  title: string;
  content: string;
}

export interface RealExperience {
  title: string;
  description: string;
}

export interface InterviewQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: InterviewDifficulty;

  question: string;
  context?: string;

  shortAnswer: string;
  detailedAnswer: string;

  keyPoints: string[];
  redFlags?: string[];
  followUps?: InterviewFollowUp[];

  clarifyingQuestions?: string[];
  tradeoffs?: string[];

  codeExamples?: CodeExample[];
  visualBlocks?: VisualBlock[];

  realExperience?: RealExperience;

  experienceLevel?: ExperienceLevel;
}
