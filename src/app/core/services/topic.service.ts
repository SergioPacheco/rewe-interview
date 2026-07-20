import { Injectable, signal, computed } from '@angular/core';
import { Topic, Question, TheoryChapter, TopicPriority } from '../../models';

/**
 * Central data service — loads topics, questions, and theory.
 * In a real enterprise app, this would call HTTP endpoints.
 * Here we load from JSON files (pre-built data).
 */
@Injectable({ providedIn: 'root' })
export class TopicService {

  // === State ===
  readonly topics = signal<Topic[]>([]);
  readonly questions = signal<Question[]>([]);
  readonly theory = signal<TheoryChapter[]>([]);
  readonly loading = signal(true);

  // === Computed ===
  readonly criticalTopics = computed(() =>
    this.topics().filter(t => t.priority === 1)
  );

  readonly importantTopics = computed(() =>
    this.topics().filter(t => t.priority === 2)
  );

  readonly niceToHaveTopics = computed(() =>
    this.topics().filter(t => t.priority === 3)
  );

  readonly totalQuestions = computed(() => this.questions().length);
  readonly totalTheoryChapters = computed(() => this.theory().length);

  /** Load all data (called on app init) */
  async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const [topicsData, questionsData, theoryData] = await Promise.all([
        this.loadJson<Topic[]>('/data/topics/index.json'),
        this.loadAllQuestions(),
        this.loadAllTheory()
      ]);

      this.topics.set(topicsData);
      this.questions.set(questionsData);
      this.theory.set(theoryData);
    } catch (e) {
      console.error('[TopicService] Failed to load data:', e);
    } finally {
      this.loading.set(false);
    }
  }

  /** Get questions for a specific topic/subtopic */
  getQuestions(topicId: string, subtopicId?: string): Question[] {
    return this.questions().filter(q =>
      q.topic === topicId && (!subtopicId || q.subtopic === subtopicId)
    );
  }

  /** Get theory chapters for a specific topic */
  getTheory(topicId: string): TheoryChapter[] {
    return this.theory().filter(t => t.id.startsWith(`theory-${topicId}`));
  }

  /** Get a single topic by ID */
  getTopic(topicId: string): Topic | undefined {
    return this.topics().find(t => t.id === topicId);
  }

  /** Get topics grouped by priority */
  getGrouped(): Record<TopicPriority, Topic[]> {
    return {
      0: this.topics().filter(t => t.priority === 0),
      1: this.criticalTopics(),
      2: this.importantTopics(),
      3: this.niceToHaveTopics()
    };
  }

  // === Private helpers ===

  private async loadJson<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
    return response.json();
  }

  private async loadAllQuestions(): Promise<Question[]> {
    const files = [
      '/data/exercises/java-core.json',
      '/data/exercises/oop.json',
      '/data/exercises/solid.json',
      '/data/exercises/spring-boot.json',
      '/data/exercises/kafka.json',
      '/data/exercises/sql.json',
      '/data/exercises/rest.json',
      '/data/exercises/concurrency.json',
      '/data/exercises/design-patterns.json',
      '/data/exercises/jpa.json',
      '/data/exercises/behavioral.json',
      '/data/exercises/system-design.json',
      '/data/exercises/rewe.json',
      '/data/exercises/security.json',
      '/data/exercises/testing.json',
      '/data/exercises/docker.json',
      '/data/exercises/k8s.json',
      '/data/exercises/kotlin.json',
      '/data/exercises/angular.json'
    ];

    const results = await Promise.allSettled(
      files.map(f => this.loadJson<Question[]>(f))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<Question[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  private async loadAllTheory(): Promise<TheoryChapter[]> {
    const files = [
      '/data/topics/theory-java-basics.json',
      '/data/topics/theory-java-modern.json',
      '/data/topics/theory-rewe.json',
      '/data/topics/theory-portfolio.json',
      '/data/topics/theory-spring-boot.json',
      '/data/topics/theory-kafka.json',
      '/data/topics/theory-rest.json',
      '/data/topics/theory-sql.json',
      '/data/topics/theory-solid.json',
      '/data/topics/theory-concurrency.json',
      '/data/topics/theory-patterns.json',
      '/data/topics/theory-jpa.json',
      '/data/topics/theory-docker-k8s.json',
      '/data/topics/theory-testing.json',
      '/data/topics/theory-kotlin.json',
      '/data/topics/theory-angular.json',
      '/data/topics/theory-collections.json',
      '/data/topics/theory-oop.json',
      '/data/topics/theory-k8s.json'
    ];

    const results = await Promise.allSettled(
      files.map(f => this.loadJson<TheoryChapter[]>(f))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<TheoryChapter[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }
}
