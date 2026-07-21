import { Component, computed, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TopicService } from '../../core/services/topic.service';
import { QuizEngineService } from '../../core/services/quiz-engine.service';
import { InterviewService } from '../../core/services/interview.service';
import { TheoryChapter } from '../../models';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SyntaxHighlightPipe } from '../../shared/pipes/syntax-highlight.pipe';
import { InterviewComponent } from '../interview/interview.component';

@Component({
  selector: 'app-theory',
  standalone: true,
  imports: [MarkdownPipe, SyntaxHighlightPipe, InterviewComponent],
  templateUrl: './theory.component.html',
  styleUrl: './theory.component.scss',
  // Learn chapters render trusted authored HTML through [innerHTML]. Disabling
  // emulated encapsulation lets the chapter typography reach those dynamic nodes.
  encapsulation: ViewEncapsulation.None
})
export class TheoryComponent {
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  protected engine = inject(QuizEngineService);
  protected interviewService = inject(InterviewService);

  // Route params
  readonly topicId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('topicId') ?? '')),
    { initialValue: '' }
  );

  /** Raw URL fragment: can name either a subtopic or a tab. */
  readonly fragment = toSignal(
    this.route.fragment.pipe(map(f => f ?? null)),
    { initialValue: null as string | null }
  );

  /** Tab fragments must not be used as a subtopic filter. */
  readonly selectedSubtopic = computed(() => {
    const fragment = this.fragment();
    return fragment === 'learn' || fragment === 'practice' || fragment === 'interview'
      ? null
      : fragment;
  });

  // State
  activeTab = signal<'learn' | 'practice' | 'interview'>('learn');
  showResult = signal(false);
  selectedAnswer = signal('');
  lastResult = signal<'correct' | 'incorrect' | 'partial'>('incorrect');
  practiceReady = signal(false);
  private lastTopicId = '';
  private lastSubtopic: string | null = '';
  private lastFragment: string | null = '';

  // Computed
  readonly topic = computed(() => this.topicService.getTopic(this.topicId()));
  readonly loading = computed(() => this.topicService.loading());

  readonly allChapters = computed<TheoryChapter[]>(() =>
    this.topicService.getTheory(this.topicId())
  );

  readonly exerciseCount = computed(() =>
    this.topicService.getQuestions(
      this.topicId(),
      this.selectedSubtopic() || undefined
    ).filter(q =>
      q.type !== 'ORAL_ANSWER' &&
      q.type !== 'SYSTEM_DESIGN' &&
      (q as any).schemaVersion !== 2
    ).length
  );

  readonly hasTheory = computed(() => this.visibleChapters().length > 0);
  readonly hasExercises = computed(() => this.exerciseCount() > 0);
  readonly currentQuestion = computed(() => this.engine.currentQuestion());

  /** True when the current question uses Schema V2 (rich system-design format) */
  readonly isSchemaV2 = computed(() => (this.currentQuestion() as any)?.schemaVersion === 2);

  /** Subtopic label for breadcrumb */
  readonly subtopicLabel = computed(() => {
    const topic = this.topic();
    const sub = this.selectedSubtopic();
    if (!topic?.subtopics || !sub) return null;
    const found = topic.subtopics.find(s => s.id === sub);
    return found?.label ?? null;
  });

  readonly visibleChapters = computed<TheoryChapter[]>(() => {
    const all = this.allChapters();
    const sub = this.selectedSubtopic();

    // No subtopic selected → show all chapters for the topic
    if (!sub) return all;

    // Deterministic: filter by explicit subtopic field
    // Topic-wide learning maps are intentionally shown before every subtopic.
    // They provide a stable practical context instead of making each page feel
    // like an isolated list of definitions.
    return all.filter(ch => !ch.subtopic || ch.subtopic === sub);
  });

  constructor() {
    // React to topic/subtopic changes (fixes sidebar navigation without reload)
    effect(() => {
      const topicId = this.topicId();
      const subtopic = this.selectedSubtopic();
      const requestedTab = this.fragment();
      const isLoading = this.loading();

      if (isLoading || !topicId) return;

      // Only reset tab when the route actually changes (not on re-renders)
      const routeChanged = topicId !== this.lastTopicId ||
        subtopic !== this.lastSubtopic || requestedTab !== this.lastFragment;
      this.lastTopicId = topicId;
      this.lastSubtopic = subtopic;
      this.lastFragment = requestedTab;

      if (!routeChanged) return;

      // A route change invalidates any previous quiz session. End it before
      // starting a requested Practice session below.
      if (this.engine.isActive()) {
        this.engine.end();
      }

      // Reset tab state when navigation changes
      const hasTheory = this.visibleChapters().length > 0;
      const hasExercises = this.exerciseCount() > 0;
      const topicData = this.topic();

      if (requestedTab === 'interview') {
        this.activeTab.set('interview');
      } else if (requestedTab === 'practice' && hasExercises) {
        this.activeTab.set('practice');
        this.startEngine();
      } else if (!hasTheory && hasExercises) {
        this.activeTab.set('practice');
        this.startEngine();
      } else if (!hasTheory && !hasExercises && topicData?.mode === 'interview') {
        // Interview-only topic (e.g., software-architecture): go straight to Interview tab
        this.activeTab.set('interview');
      } else {
        this.activeTab.set('learn');
      }

      this.practiceReady.set(true);
    }, { allowSignalWrites: true });
  }

  // ===== Methods =====

  switchTab(tab: 'learn' | 'practice' | 'interview'): void {
    this.activeTab.set(tab);
    if (tab === 'practice') {
      this.startEngine();
    }
  }

  startEngine(): void {
    const id = this.topicId();
    const subtopic = this.selectedSubtopic();

    // Always end previous session to get a fresh start
    if (this.engine.isActive()) {
      this.engine.end();
    }

    if (id && this.exerciseCount() > 0) {
      this.engine.start(id, subtopic || undefined);
    }

    this.showResult.set(false);
    this.selectedAnswer.set('');
  }

  revealAnswer(): void {
    this.showResult.set(true);
    this.lastResult.set('correct');
    const q = this.currentQuestion() as any;
    if (q) {
      this.engine.submitAnswer(q.answer || '');
    }
  }

  nextQuestion(): void {
    this.engine.next();
    this.showResult.set(false);
    this.selectedAnswer.set('');
  }

  restartPractice(): void {
    this.engine.end();
    this.startEngine();
  }

  // ===== Template helpers =====

  getPrompt(q: any): string {
    return q?.mission || q?.question || q?.prompt || '';
  }

  getChoices(q: any): any[] {
    return q?.choices || q?.options || [];
  }

  choiceLabel(choice: unknown): string {
    if (typeof choice === 'string') return choice;
    if (choice && typeof choice === 'object') {
      const option = choice as Record<string, unknown>;
      return String(option['label'] ?? option['text'] ?? option['code'] ?? '');
    }
    return String(choice ?? '');
  }

  choiceLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  choiceDescription(choice: unknown): string {
    if (choice && typeof choice === 'object') {
      return String((choice as Record<string, unknown>)['description'] ?? '');
    }
    return '';
  }

  isCorrectChoice(q: any, choice: unknown, index: number): boolean {
    const correct = q?.answer ?? q?.correct ?? q?.bestOption;
    if (typeof correct === 'number') return correct === index;

    const value = choice && typeof choice === 'object'
      ? (choice as Record<string, unknown>)['id'] ?? this.choiceLabel(choice)
      : choice;
    return correct === value || correct === this.choiceLabel(choice);
  }

  getField(q: any, field: string): string {
    return q?.[field] ?? '';
  }

  getFieldArray(q: any, field: string): any[] {
    const val = q?.[field];
    return Array.isArray(val) ? val : [];
  }

  /** Safely reads a top-level field from the current Schema V2 question */
  getV2Field(field: string): any {
    return (this.currentQuestion() as any)?.[field] ?? null;
  }

  /** Returns a CSS-safe class name for an experience level string */
  expLevelClass(level: string): string {
    return (level ?? '').toLowerCase().replace(/_/g, '-');
  }

  /** Returns a human-readable label for an experience level string */
  expLevelLabel(level: string): string {
    return (level ?? '').replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
