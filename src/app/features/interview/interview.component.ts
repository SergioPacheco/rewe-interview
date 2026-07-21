import { Component, computed, inject, input, effect } from '@angular/core';
import { InterviewService } from '../../core/services/interview.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

/**
 * Interview tab component — displays interview preparation questions
 * with short answer, detailed explanation, code examples, visuals,
 * follow-ups, and red flags.
 */
@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [MarkdownPipe],
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
  readonly questions = computed(() => {
    const sub = this.subtopicId();
    return this.interviewService.getForSubtopic(sub ?? undefined);
  });
  readonly currentQuestion = this.interviewService.currentQuestion;
  readonly selectedIndex = this.interviewService.selectedIndex;
  readonly totalQuestions = computed(() => this.questions().length);
  readonly hasQuestions = computed(() => this.questions().length > 0);

  // UI state
  readonly expandedSections = new Set<string>();

  constructor() {
    // Load interview data when topicId changes
    effect(() => {
      const topicId = this.topicId();
      if (topicId) {
        this.interviewService.loadForTopic(topicId);
      }
    }, { allowSignalWrites: true });
  }

  selectQuestion(index: number): void {
    this.interviewService.selectQuestion(index);
    this.expandedSections.clear();
  }

  next(): void {
    this.interviewService.next();
    this.expandedSections.clear();
  }

  previous(): void {
    this.interviewService.previous();
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
