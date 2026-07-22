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
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ChoiceListComponent, ChoiceResult } from '../../shared/components/choice-list/choice-list.component';
import { InterviewComponent } from '../interview/interview.component';

@Component({
  selector: 'app-theory',
  standalone: true,
  imports: [MarkdownPipe, SyntaxHighlightPipe, TranslatePipe, ChoiceListComponent, InterviewComponent],
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
  selectedPracticeIndex = signal<number | null>(null);
  practiceChecked = signal(false);
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

  /** Subtopics with exercise counts for the Practice dropdown */
  readonly practiceSubtopics = computed(() => {
    const topic = this.topic();
    if (!topic?.subtopics) return [];
    const topicId = this.topicId();
    return topic.subtopics
      .map(sub => {
        const count = this.topicService.getQuestions(topicId, sub.id)
          .filter(q =>
            q.type !== 'ORAL_ANSWER' &&
            q.type !== 'SYSTEM_DESIGN' &&
            (q as any).schemaVersion !== 2
          ).length;
        return { id: sub.id, label: sub.label, count };
      })
      .filter(s => s.count > 0);
  });

  /** Total practice exercises across all subtopics */
  readonly totalPracticeCount = computed(() =>
    this.topicService.getQuestions(this.topicId())
      .filter(q =>
        q.type !== 'ORAL_ANSWER' &&
        q.type !== 'SYSTEM_DESIGN' &&
        (q as any).schemaVersion !== 2
      ).length
  );

  /** Local practice subtopic override signal */
  readonly practiceSubtopic = signal<string | null>(null);

  readonly hasTheory = computed(() => this.visibleChapters().length > 0);
  readonly hasExercises = computed(() => this.exerciseCount() > 0);
  readonly currentQuestion = computed(() => this.engine.currentQuestion());

  // ===== LEARN NAVIGATION =====

  /** Local subtopic filter for Learn tab */
  readonly learnSubtopic = signal<string | null>(null);

  /** Current chapter index in Learn tab */
  readonly learnChapterIndex = signal(0);

  /** Chapters filtered by learn subtopic (or all) */
  readonly learnFilteredChapters = computed<TheoryChapter[]>(() => {
    const all = this.visibleChapters();
    const sub = this.learnSubtopic();
    if (!sub) return all;
    return all.filter(ch => ch.subtopic === sub);
  });

  /** Current chapter based on index */
  readonly currentChapter = computed(() => {
    const chapters = this.learnFilteredChapters();
    const idx = this.learnChapterIndex();
    return chapters[idx] ?? null;
  });

  /** Subtopics with chapter counts for Learn dropdown */
  readonly learnSubtopics = computed(() => {
    const topic = this.topic();
    const all = this.visibleChapters();
    if (!topic?.subtopics) return [];

    const subtopicLabels = new Map<string, string>();
    for (const s of topic.subtopics) {
      subtopicLabels.set(s.id, s.label);
    }

    const subtopicMap = new Map<string, number>();
    for (const ch of all) {
      if (ch.subtopic) {
        subtopicMap.set(ch.subtopic, (subtopicMap.get(ch.subtopic) ?? 0) + 1);
      }
    }
    return Array.from(subtopicMap.entries())
      .map(([id, count]) => ({
        id,
        label: subtopicLabels.get(id) ?? id,
        count
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  readonly totalLearnChapters = computed(() => this.visibleChapters().length);

  /** Navigate learn chapters */
  navigateLearn(direction: number): void {
    const max = this.learnFilteredChapters().length;
    const idx = this.learnChapterIndex();
    const next = idx + direction;
    if (next >= 0 && next < max) {
      this.learnChapterIndex.set(next);
    }
  }

  /** Change learn subtopic from dropdown */
  selectLearnSubtopic(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.learnSubtopic.set(value || null);
    this.learnChapterIndex.set(0);
  }

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
      } else if (requestedTab === 'learn') {
        this.activeTab.set('learn');
      } else if (!hasTheory && !hasExercises && topicData?.mode === 'interview') {
        // No learn/practice content available — fall through to Interview
        this.activeTab.set('interview');
      } else if (!hasTheory && hasExercises) {
        this.activeTab.set('practice');
        this.startEngine();
      } else if (hasTheory) {
        this.activeTab.set('learn');
      } else {
        // Fallback: no content at all, try interview
        this.activeTab.set('interview');
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
      this.engine.start(id, subtopic || undefined, 999);
    }

    this.showResult.set(false);
    this.selectedAnswer.set('');
    this.selectedPracticeIndex.set(null);
    this.practiceChecked.set(false);
  }

  /** Navigate practice questions with arrows — resets answer state */
  navigatePractice(direction: number): void {
    if (direction > 0) {
      this.engine.next();
    } else {
      this.engine.previous();
    }
    this.showResult.set(false);
    this.selectedAnswer.set('');
    this.selectedPracticeIndex.set(null);
    this.practiceChecked.set(false);
  }

  /** Change practice subtopic from dropdown — restarts engine with new filter */
  selectPracticeSubtopic(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.practiceSubtopic.set(value || null);
    // Restart engine with the selected subtopic
    const id = this.topicId();
    if (this.engine.isActive()) {
      this.engine.end();
    }
    const sub = value || undefined;
    const count = this.topicService.getQuestions(id, sub)
      .filter(q =>
        q.type !== 'ORAL_ANSWER' &&
        q.type !== 'SYSTEM_DESIGN' &&
        (q as any).schemaVersion !== 2
      ).length;
    if (id && count > 0) {
      this.engine.start(id, sub, 999);
    }
    this.showResult.set(false);
    this.selectedAnswer.set('');
    this.selectedPracticeIndex.set(null);
    this.practiceChecked.set(false);
  }

  onChoiceAnswered(result: ChoiceResult): void {
    this.practiceChecked.set(true);
    this.selectedPracticeIndex.set(result.index);
    this.lastResult.set(result.correct ? 'correct' : 'incorrect');
    // Auto-reveal explanation after selection
    this.showResult.set(true);
    const q = this.currentQuestion() as any;
    if (q) {
      this.engine.submitAnswer(q.answer || '');
    }
  }

  revealAnswer(): void {
    this.showResult.set(true);
    const q = this.currentQuestion() as any;
    if (q) {
      this.engine.submitAnswer(q.answer || '');
    }
  }

  nextQuestion(): void {
    this.engine.next();
    this.showResult.set(false);
    this.selectedAnswer.set('');
    this.selectedPracticeIndex.set(null);
    this.practiceChecked.set(false);
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
    return q?.choices || q?.options || q?.snippets || q?.items || [];
  }

  choiceLabel(choice: unknown): string {
    if (typeof choice === 'string') return choice;
    if (choice && typeof choice === 'object') {
      const option = choice as Record<string, unknown>;
      return String(option['label'] ?? option['text'] ?? '');
    }
    return String(choice ?? '');
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

  /** Get the correct answer index for a question with choices */
  getCorrectIndex(q: any): number {
    const choices = this.getChoices(q);
    for (let i = 0; i < choices.length; i++) {
      if (this.isCorrectChoice(q, choices[i], i)) return i;
    }
    return -1;
  }

  /** Convert raw choices to ChoiceOption[] for the reusable component */
  getChoiceOptions(q: any): Array<{ label: string; description?: string; code?: string }> {
    return this.getChoices(q).map((c: unknown) => {
      if (typeof c === 'string') return { label: c };
      const obj = c as Record<string, unknown>;
      return {
        label: String(obj['label'] ?? obj['text'] ?? ''),
        description: (obj['description'] as string) || undefined,
        code: (obj['code'] as string) || undefined
      };
    });
  }

  getField(q: any, field: string): string {
    const val = q?.[field];
    if (val == null) return '';
    if (typeof val === 'string') return val;
    return ''; // non-string fields handled by specific methods
  }

  /** Get explanation as renderable text (handles string or structured object) */
  getExplanationText(q: any): string {
    const explain = q?.explain;
    if (typeof explain === 'string' && explain) return explain;

    const explanation = q?.explanation;
    if (!explanation) return '';
    if (typeof explanation === 'string') return explanation;

    // Structured explanation (DESIGN_DECISION): format as markdown
    if (typeof explanation === 'object') {
      const bestChoice = q?.bestChoice || q?.answer;
      const lines: string[] = [];
      for (const [key, val] of Object.entries(explanation)) {
        const entry = val as any;
        const isBest = key === bestChoice;
        lines.push(`**Option ${key.toUpperCase()}${isBest ? ' ✅ (Best)' : ''}:**`);
        if (entry.pros) lines.push(...entry.pros.map((p: string) => `- ✓ ${p}`));
        if (entry.cons) lines.push(...entry.cons.map((c: string) => `- ✗ ${c}`));
        if (entry.verdict) lines.push(`\n> ${entry.verdict}`);
        lines.push('');
      }
      return lines.join('\n');
    }
    return '';
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
