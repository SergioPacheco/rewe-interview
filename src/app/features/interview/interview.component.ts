import { Component, computed, inject, input, effect, OnDestroy, signal } from '@angular/core';
import { InterviewService } from '../../core/services/interview.service';
import { I18nService } from '../../core/services/i18n.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block.component';

/**
 * Interview tab component — displays interview preparation questions
 * with short answer, detailed explanation, code examples, visuals,
 * follow-ups, and red flags.
 */
@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [MarkdownPipe, CodeBlockComponent],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.scss'
})
export class InterviewComponent implements OnDestroy {
  private interviewService = inject(InterviewService);
  private i18n = inject(I18nService);

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
  readonly isReadingCoreAnswer = signal(false);
  readonly readingSection = signal<string | null>(null);

  constructor() {
    // Load interview data when topicId OR locale changes
    effect(() => {
      const topicId = this.topicId();
      const _locale = this.i18n.locale(); // track locale changes
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
    this.stopCoreAnswerAudio();
    this.stopSectionAudio();
    this.expandedSections.clear();
  }

  next(): void {
    const idx = this._selectedIndex();
    if (idx < this.questions().length - 1) {
      this._selectedIndex.set(idx + 1);
    }
    this.stopCoreAnswerAudio();
    this.stopSectionAudio();
    this.expandedSections.clear();
  }

  previous(): void {
    const idx = this._selectedIndex();
    if (idx > 0) {
      this._selectedIndex.set(idx - 1);
    }
    this.stopCoreAnswerAudio();
    this.stopSectionAudio();
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

  ngOnDestroy(): void {
    this.stopCoreAnswerAudio();
    this.stopSectionAudio();
  }

  /** Plays text from any section in the current locale's voice. */
  toggleSectionAudio(text: string, sectionId: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.readingSection() === sectionId) {
      this.stopSectionAudio();
      return;
    }

    const speechText = this.toSpeechText(text);
    if (!speechText) return;

    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    this.isReadingCoreAnswer.set(false);

    const utterance = new SpeechSynthesisUtterance(speechText);
    const locale = this.i18n.locale();
    utterance.lang = locale === 'es' ? 'es-ES' : 'en-GB';
    utterance.rate = 0.95;

    const voices = synthesis.getVoices();
    const matchedVoice = voices.find(voice =>
      voice.lang.toLowerCase().startsWith(locale === 'es' ? 'es' : 'en-gb')
    ) ?? voices.find(voice =>
      voice.lang.toLowerCase().startsWith(locale)
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => this.readingSection.set(null);
    utterance.onerror = () => this.readingSection.set(null);

    this.readingSection.set(sectionId);
    synthesis.speak(utterance);
  }

  private stopSectionAudio(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.readingSection.set(null);
  }

  /** Uses the device's available browser voice matching the current locale. */
  toggleCoreAnswerAudio(markdown: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.isReadingCoreAnswer()) {
      this.stopCoreAnswerAudio();
      return;
    }

    const text = this.toSpeechText(markdown);
    if (!text) return;

    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    // Match voice to current locale
    const locale = this.i18n.locale();
    const langCode = locale === 'es' ? 'es' : 'en-GB';
    utterance.lang = langCode;
    utterance.rate = 0.95;

    const voices = synthesis.getVoices();
    const matchedVoice = voices.find(voice =>
      voice.lang.toLowerCase().startsWith(langCode.toLowerCase().split('-')[0])
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => this.isReadingCoreAnswer.set(false);
    utterance.onerror = () => this.isReadingCoreAnswer.set(false);
    synthesis.cancel();
    this.isReadingCoreAnswer.set(true);
    synthesis.speak(utterance);
  }

  private stopCoreAnswerAudio(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isReadingCoreAnswer.set(false);
  }

  private toSpeechText(markdown: string): string {
    return markdown
      .replace(/```[\s\S]*?```/g, ' Code example omitted. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*{1,3}|#{1,6}|[_~]/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Joins array items into a speakable sentence list */
  toSpeechList(items: string[]): string {
    return items.map((item, i) => `${i + 1}. ${item}`).join('. ');
  }

  /** Joins follow-up questions into speakable text */
  toSpeechFollowUps(followUps: Array<{ question: string; hint?: string }>): string {
    return followUps.map((fu, i) =>
      `Question ${i + 1}: ${fu.question}${fu.hint ? '. Hint: ' + fu.hint : ''}`
    ).join('. ');
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
