import { Injectable, signal, computed } from '@angular/core';
import { InterviewQuestion } from '../../models';

/**
 * Service for loading interview preparation questions per topic.
 * Loads lazily (on demand when Interview tab is opened) to avoid
 * bloating the initial load.
 */
@Injectable({ providedIn: 'root' })
export class InterviewService {

  // State
  private readonly _questions = signal<InterviewQuestion[]>([]);
  private readonly _loading = signal(false);
  private readonly _currentTopic = signal('');
  private readonly _selectedIndex = signal(0);

  // Public signals
  readonly questions = this._questions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly currentTopic = this._currentTopic.asReadonly();
  readonly selectedIndex = this._selectedIndex.asReadonly();

  // Computed
  readonly currentQuestion = computed(() => {
    const qs = this._questions();
    const idx = this._selectedIndex();
    return qs[idx] ?? null;
  });

  readonly totalQuestions = computed(() => this._questions().length);
  readonly hasQuestions = computed(() => this._questions().length > 0);

  /** Questions filtered by subtopic (or all if no subtopic) */
  getForSubtopic(subtopicId?: string): InterviewQuestion[] {
    if (!subtopicId) return this._questions();
    return this._questions().filter(q => q.subtopic === subtopicId);
  }

  /**
   * Load interview questions for a topic.
   * No-op if already loaded for the same topic.
   */
  async loadForTopic(topicId: string): Promise<void> {
    if (this._currentTopic() === topicId && this._questions().length > 0) {
      return; // Already loaded
    }

    this._loading.set(true);
    this._currentTopic.set(topicId);
    this._selectedIndex.set(0);

    try {
      const url = new URL(`data/interviews/${topicId}.json`, document.baseURI).href;
      const response = await fetch(url);

      if (!response.ok) {
        // No interview data for this topic yet — that's fine
        this._questions.set([]);
        return;
      }

      const data: InterviewQuestion[] = await response.json();
      this._questions.set(data);
    } catch {
      // Graceful — no interview content available
      this._questions.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  /** Select a specific question by index */
  selectQuestion(index: number): void {
    const max = this._questions().length;
    if (index >= 0 && index < max) {
      this._selectedIndex.set(index);
    }
  }

  /** Navigate to next question */
  next(): void {
    const idx = this._selectedIndex();
    if (idx < this._questions().length - 1) {
      this._selectedIndex.set(idx + 1);
    }
  }

  /** Navigate to previous question */
  previous(): void {
    const idx = this._selectedIndex();
    if (idx > 0) {
      this._selectedIndex.set(idx - 1);
    }
  }

  /** Reset state (e.g., when navigating away) */
  reset(): void {
    this._questions.set([]);
    this._currentTopic.set('');
    this._selectedIndex.set(0);
  }
}
