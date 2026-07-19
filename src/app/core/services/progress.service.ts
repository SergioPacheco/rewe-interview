import { computed, effect, Injectable, signal } from '@angular/core';
import { TopicProgress, UserProgress } from '../../models';
import { StorageService } from './storage.service';

/**
 * Manages user progress with Angular Signals.
 * Reactive state: any component reading a signal auto-updates on change.
 *
 * Architecture note: This replaces BehaviorSubject + manual subscriptions.
 * Signals are synchronous, glitch-free, and don't leak memory.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly storage = new StorageService();

  // === Writable Signals (source of truth) ===
  readonly progress = signal<UserProgress>(
    this.storage.load() ?? this.storage.getDefaultProgress()
  );

  // === Computed Signals (derived state — auto-tracks dependencies) ===
  readonly totalXp = computed(() => this.progress().totalXp);
  readonly streak = computed(() => this.progress().streak);

  readonly totalAnswered = computed(() =>
    Object.values(this.progress().topics)
      .reduce((sum, t) => sum + t.answered, 0)
  );

  readonly totalCorrect = computed(() =>
    Object.values(this.progress().topics)
      .reduce((sum, t) => sum + t.correct, 0)
  );

  readonly accuracy = computed(() => {
    const answered = this.totalAnswered();
    return answered > 0 ? Math.round((this.totalCorrect() / answered) * 100) : 0;
  });

  readonly topicsStarted = computed(() =>
    Object.values(this.progress().topics).filter(t => t.answered > 0).length
  );

  readonly overallMastery = computed(() => {
    const topics = Object.values(this.progress().topics);
    if (topics.length === 0) return 0;
    return Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length);
  });

  constructor() {
    // Auto-persist on any change (effect runs whenever signals inside it change)
    effect(() => {
      this.storage.save(this.progress());
    });
  }

  /** Get progress for a specific topic */
  getTopicProgress(topicId: string): TopicProgress | null {
    return this.progress().topics[topicId] ?? null;
  }

  /** Record a correct/incorrect answer */
  recordAnswer(topicId: string, correct: boolean, totalInTopic: number): void {
    this.progress.update(p => {
      const existing = p.topics[topicId] ?? {
        topicId,
        totalQuestions: totalInTopic,
        answered: 0,
        correct: 0,
        lastAttempt: null,
        mastery: 0
      };

      const updated: TopicProgress = {
        ...existing,
        totalQuestions: totalInTopic,
        answered: existing.answered + 1,
        correct: existing.correct + (correct ? 1 : 0),
        lastAttempt: new Date().toISOString(),
        mastery: Math.round(
          ((existing.correct + (correct ? 1 : 0)) / (existing.answered + 1)) * 100
        )
      };

      const xpGain = correct ? 10 : 0;

      return {
        ...p,
        totalXp: p.totalXp + xpGain,
        lastPractice: new Date().toISOString(),
        topics: { ...p.topics, [topicId]: updated }
      };
    });
  }

  /** Update streak (call once per day of practice) */
  updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastPractice = this.progress().lastPractice?.split('T')[0];

    if (lastPractice === today) return; // Already practiced today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastPractice === yesterday
      ? this.progress().streak + 1
      : 1; // Reset if missed a day

    this.progress.update(p => ({ ...p, streak: newStreak }));
  }

  /** Reset all progress */
  reset(): void {
    this.progress.set(this.storage.getDefaultProgress());
  }
}
