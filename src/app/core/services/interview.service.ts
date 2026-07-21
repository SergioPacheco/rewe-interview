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
  private readonly _loadedTopics = new Set<string>(); // Track already-attempted topics

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
   * No-op if already attempted (success or 404) for the same topic.
   */
  async loadForTopic(topicId: string): Promise<void> {
    if (this._loadedTopics.has(topicId)) {
      return; // Already attempted — don't refetch
    }

    this._loading.set(true);
    this._currentTopic.set(topicId);
    this._selectedIndex.set(0);
    this._loadedTopics.add(topicId);

    try {
      const url = new URL(`data/interviews/${topicId}.json`, document.baseURI).href;
      const response = await fetch(url);

      if (!response.ok) {
        this._questions.set([]);
        return;
      }

      const data: InterviewQuestion[] = await response.json();
      this._questions.set(data);
    } catch {
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
    this._loadedTopics.clear();
  }
}
