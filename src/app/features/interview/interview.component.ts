import { Component, computed, inject, input, effect, signal } from '@angular/core';
import { InterviewService } from '../../core/services/interview.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SyntaxHighlightPipe } from '../../shared/pipes/syntax-highlight.pipe';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block.component';

/**
 * Interview tab component — displays interview preparation questions
 * with short answer, detailed explanation, code examples, visuals,
 * follow-ups, and red flags.
 */
@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [MarkdownPipe, SyntaxHighlightPipe, CodeBlockComponent],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.scss'
})
export class InterviewComponent {
  private interviewService = inject(InterviewService);

  /** Topic ID passed from parent (TheoryComponent) */
  topicId = input.required<string>();

  /** Optional subtopic filter */
  subtopicId = input<string | null>(null);

  // Expose service signals
  readonly loading = this.interviewService.loading;

  /** Filtered questions: excludes placeholders, respects subtopic */
  readonly questions = computed(() => {
    const sub = this.subtopicId();
    const all = this.interviewService.getForSubtopic(sub ?? undefined);
    // P1: Filter out placeholder content (starts with '[')
    return all.filter(q =>
      q.shortAnswer && !q.shortAnswer.startsWith('[')
    );
  });

  // P2: Local navigation state (operates on filtered list, not service-level)
  private readonly _selectedIndex = signal(0);
  readonly selectedIndex = this._selectedIndex.asReadonly();
  readonly currentQuestion = computed(() => this.questions()[this._selectedIndex()] ?? null);
  readonly totalQuestions = computed(() => this.questions().length);
  readonly hasQuestions = computed(() => this.questions().length > 0);

  // UI state
  readonly expandedSections = new Set<string>();

  constructor() {
    // Load interview data when topicId changes
    effect(() => {
      const topicId = this.topicId();
      if (topicId) {
        this._selectedIndex.set(0);
        this.interviewService.loadForTopic(topicId);
      }
    });
  }

  selectQuestion(index: number): void {
    const max = this.questions().length;
    if (index >= 0 && index < max) {
      this._selectedIndex.set(index);
    }
    this.expandedSections.clear();
  }

  next(): void {
    const idx = this._selectedIndex();
    if (idx < this.questions().length - 1) {
      this._selectedIndex.set(idx + 1);
    }
    this.expandedSections.clear();
  }

  previous(): void {
    const idx = this._selectedIndex();
    if (idx > 0) {
      this._selectedIndex.set(idx - 1);
    }
    this.expandedSections.clear();
  }

  toggleSection(section: string): void {
    if (this.expandedSections.has(section)) {
      this.expandedSections.delete(section);
    } else {
      this.expandedSections.add(section);
    }
  }

  isExpanded(section: string): boolean {
    return this.expandedSections.has(section);
  }

  /** CSS class for difficulty badge */
  difficultyClass(difficulty: string): string {
    return `badge--${difficulty.toLowerCase()}`;
  }

  /** CSS class for experience level */
  experienceClass(level: string): string {
    return `exp--${(level ?? '').toLowerCase().replace(/_/g, '-')}`;
  }

  /** Human-readable experience level label */
  experienceLabel(level: string): string {
    const labels: Record<string, string> = {
      'PRODUCTION_EXPERIENCE': 'Production Experience',
      'TRANSFERABLE_EXPERIENCE': 'Transferable Experience',
      'STUDIED_NOT_USED': 'Studied, Not Used',
      'INFERENCE': 'Inference'
    };
    return labels[level] ?? level;
  }
}
