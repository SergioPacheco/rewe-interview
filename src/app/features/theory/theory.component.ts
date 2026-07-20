import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TopicService } from '../../core/services/topic.service';
import { QuizEngineService } from '../../core/services/quiz-engine.service';
import { TheoryChapter } from '../../models';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SyntaxHighlightPipe } from '../../shared/pipes/syntax-highlight.pipe';

@Component({
  selector: 'app-theory',
  standalone: true,
  imports: [MarkdownPipe, SyntaxHighlightPipe],
  templateUrl: './theory.component.html',
  styleUrl: './theory.component.scss'
})
export class TheoryComponent {
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);
  protected engine = inject(QuizEngineService);

  // Route params
  readonly topicId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('topicId') ?? '')),
    { initialValue: '' }
  );

  readonly selectedSubtopic = toSignal(
    this.route.fragment.pipe(map(f => f ?? null)),
    { initialValue: null as string | null }
  );

  // State
  activeTab = signal<'learn' | 'practice'>('learn');
  showResult = signal(false);
  selectedAnswer = signal('');
  lastResult = signal<'correct' | 'incorrect' | 'partial'>('incorrect');
  practiceReady = signal(false);

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
    ).length
  );

  readonly hasTheory = computed(() => this.visibleChapters().length > 0);
  readonly hasExercises = computed(() => this.exerciseCount() > 0);
  readonly currentQuestion = computed(() => this.engine.currentQuestion());

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
    return all.filter(ch => ch.subtopic === sub);
  });

  constructor() {
    // React to topic/subtopic changes (fixes sidebar navigation without reload)
    effect(() => {
      const topicId = this.topicId();
      const subtopic = this.selectedSubtopic();
      const isLoading = this.loading();

      if (isLoading || !topicId) return;

      // Reset tab state when navigation changes
      const hasTheory = this.visibleChapters().length > 0;
      const hasExercises = this.exerciseCount() > 0;

      if (!hasTheory && hasExercises) {
        this.activeTab.set('practice');
        this.startEngine();
      } else {
        this.activeTab.set('learn');
      }

      // Stop any running practice session when navigating
      if (this.engine.isActive() && this.activeTab() === 'learn') {
        this.engine.end();
      }

      this.practiceReady.set(true);
    }, { allowSignalWrites: true });
  }

  // ===== Methods =====

  switchTab(tab: 'learn' | 'practice'): void {
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

  getChoices(q: any): string[] {
    return q?.choices || q?.options || [];
  }

  isCorrectChoice(q: any, choice: string): boolean {
    return q?.answer === choice;
  }

  getField(q: any, field: string): string {
    return q?.[field] ?? '';
  }

  getFieldArray(q: any, field: string): any[] {
    const val = q?.[field];
    return Array.isArray(val) ? val : [];
  }
}
