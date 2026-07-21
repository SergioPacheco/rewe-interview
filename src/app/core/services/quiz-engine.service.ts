import { computed, Injectable, signal } from '@angular/core';
import { AnswerResult, Question, QuizAnswer, QuizSession } from '../../models';
import { ProgressService } from './progress.service';
import { TopicService } from './topic.service';

/**
 * Quiz Engine — manages quiz sessions with reactive state.
 * Validates answers, tracks combo, calculates XP.
 *
 * Design: Pure logic, no DOM manipulation.
 * Components read signals and react automatically.
 */
@Injectable({ providedIn: 'root' })
export class QuizEngineService {

  // === Session State ===
  readonly session = signal<QuizSession | null>(null);
  readonly isActive = computed(() => this.session() !== null);

  readonly currentQuestion = computed<Question | null>(() => {
    const s = this.session();
    if (!s) return null;
    return s.questions[s.currentIndex] ?? null;
  });

  readonly questionNumber = computed(() => {
    const s = this.session();
    return s ? s.currentIndex + 1 : 0;
  });

  readonly totalInSession = computed(() => {
    const s = this.session();
    return s ? s.questions.length : 0;
  });

  readonly combo = computed(() => this.session()?.combo ?? 0);
  readonly maxCombo = computed(() => this.session()?.maxCombo ?? 0);

  readonly sessionAccuracy = computed(() => {
    const s = this.session();
    if (!s || s.answers.length === 0) return 0;
    const correct = s.answers.filter(a => a.result === 'correct').length;
    return Math.round((correct / s.answers.length) * 100);
  });

  readonly isComplete = computed(() => {
    const s = this.session();
    if (!s) return false;
    return s.currentIndex >= s.questions.length;
  });

  constructor(
    private progressService: ProgressService,
    private topicService: TopicService
  ) {}

  /** Start a new quiz session */
  start(topicId: string, subtopicId?: string, maxQuestions = 10): void {
    let allQuestions = this.topicService.getQuestions(topicId, subtopicId);

    // Fallback: if subtopic filter returns empty, load all questions for the topic
    if (allQuestions.length === 0 && subtopicId) {
      allQuestions = this.topicService.getQuestions(topicId);
    }

    // P3: Exclude ORAL_ANSWER and Schema V2 from Practice (they belong in Interview tab)
    const practiceQuestions = allQuestions.filter(q =>
      q.type !== 'ORAL_ANSWER' &&
      q.type !== 'SYSTEM_DESIGN' &&
      (q as any).schemaVersion !== 2
    );

    // Shuffle and limit
    const shuffled = this.shuffle([...practiceQuestions]);
    const selected = shuffled.slice(0, Math.min(maxQuestions, shuffled.length));

    if (selected.length === 0) {
      console.warn(`[QuizEngine] No questions found for topic: ${topicId}`);
      return;
    }

    this.session.set({
      topicId,
      subtopicId,
      questions: selected,
      currentIndex: 0,
      answers: [],
      startedAt: new Date().toISOString(),
      combo: 0,
      maxCombo: 0
    });

    this.progressService.updateStreak();
  }

  /** Start a mixed practice session with questions from all topics */
  startMixed(maxQuestions = 15): void {
    const allQuestions = this.topicService.questions()
      .filter(q =>
        q.type !== 'ORAL_ANSWER' &&
        q.type !== 'SYSTEM_DESIGN' &&
        (q as any).schemaVersion !== 2
      );

    // Shuffle and limit
    const shuffled = this.shuffle([...allQuestions]);
    const selected = shuffled.slice(0, Math.min(maxQuestions, shuffled.length));

    if (selected.length === 0) {
      console.warn('[QuizEngine] No questions available for mixed practice');
      return;
    }

    this.session.set({
      topicId: 'mixed',
      subtopicId: undefined,
      questions: selected,
      currentIndex: 0,
      answers: [],
      startedAt: new Date().toISOString(),
      combo: 0,
      maxCombo: 0
    });

    this.progressService.updateStreak();
  }

  /** Submit an answer for the current question */
  submitAnswer(userAnswer: unknown): AnswerResult {
    const s = this.session();
    const question = this.currentQuestion();
    if (!s || !question) return 'incorrect';

    const startTime = s.answers.length > 0
      ? Date.now()
      : new Date(s.startedAt).getTime();

    const result = this.validate(question, userAnswer);

    const answer: QuizAnswer = {
      questionId: question.id,
      userAnswer,
      result,
      timeMs: Date.now() - startTime
    };

    const newCombo = result === 'correct' ? s.combo + 1 : 0;
    const newMaxCombo = Math.max(s.maxCombo, newCombo);

    this.session.update(current => current ? {
      ...current,
      answers: [...current.answers, answer],
      combo: newCombo,
      maxCombo: newMaxCombo
    } : null);

    // Record in progress
    const totalInTopic = this.topicService.getQuestions(s.topicId).length;
    this.progressService.recordAnswer(s.topicId, result === 'correct', totalInTopic);

    return result;
  }

  /** Move to next question */
  next(): void {
    this.session.update(s => s ? {
      ...s,
      currentIndex: s.currentIndex + 1
    } : null);
  }

  /** End current session */
  end(): void {
    this.session.set(null);
  }

  // === Answer Validation ===

  private validate(question: Question, userAnswer: unknown): AnswerResult {
    const q = question as any; // Original types are dynamic

    switch (q.type) {
      case 'SINGLE_CHOICE':
        return userAnswer === q.correct ? 'correct' : 'incorrect';

      case 'MULTIPLE_CHOICE': {
        const selected = userAnswer as number[];
        const correct = q.correct as number[];
        const isCorrect = selected.length === correct.length
          && selected.every((s: number) => correct.includes(s));
        return isCorrect ? 'correct' : 'incorrect';
      }

      // PREDICT_OUTPUT: user types what the code prints
      case 'PREDICT_OUTPUT':
      case 'TEXT_OUTPUT': {
        const answer = (userAnswer as string).trim();
        const correct = (q.answer || q.correct || '').trim();
        return answer === correct ? 'correct' : 'incorrect';
      }

      // FILL_BLANK: user selects from choices
      case 'FILL_BLANK':
      case 'FILL_THE_BLANK': {
        const answer = (userAnswer as string).trim().toLowerCase();
        const correct = (q.answer || '').trim().toLowerCase();
        return answer === correct ? 'correct' : 'incorrect';
      }

      // PICK_INVALID: user picks the wrong one (answer is the invalid id)
      case 'PICK_INVALID': {
        return userAnswer === q.answer ? 'correct' : 'incorrect';
      }

      // ORAL_ANSWER: self-evaluation — always "correct" (no wrong answer)
      case 'ORAL_ANSWER':
        return 'correct';

      // COMPARE: pick the correct comparison
      case 'COMPARE':
      case 'SCENARIO':
      case 'EXPLAIN_WHY':
      case 'SYSTEM_DESIGN':
        return userAnswer === q.answer ? 'correct' : 'incorrect';

      // COMPILES_OR_NOT
      case 'COMPILES_OR_NOT':
        return userAnswer === q.correct ? 'correct' : 'incorrect';

      // ORDER_STEPS
      case 'ORDER_STEPS': {
        const order = userAnswer as number[];
        const correct = q.correct || q.correctOrder || [];
        const isCorrect = order.every((v: number, i: number) => v === correct[i]);
        return isCorrect ? 'correct' : 'incorrect';
      }

      // MATCH_PAIRS
      case 'MATCH_PAIRS': {
        const pairs = userAnswer as Record<number, number>;
        const correct = q.correct as Record<number, number>;
        const isCorrect = Object.entries(correct)
          .every(([k, v]) => pairs[Number(k)] === v);
        return isCorrect ? 'correct' : 'incorrect';
      }

      // SELECT_LINE / DEBUG_ISSUE
      case 'SELECT_LINE':
      case 'DEBUG_ISSUE':
        return userAnswer === q.answer || userAnswer === q.correct ? 'correct' : 'incorrect';

      // CODE_FIX
      case 'CODE_FIX': {
        const fix = (userAnswer as string).trim();
        const correct = (q.answer || q.correct || '').trim();
        return fix === correct ? 'correct' : 'incorrect';
      }

      default:
        // For unknown types, check if answer matches
        if (q.answer !== undefined) {
          return userAnswer === q.answer ? 'correct' : 'incorrect';
        }
        return 'correct'; // Self-evaluation types
    }
  }

  // === Utilities ===

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
