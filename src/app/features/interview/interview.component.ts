import { Component, computed, inject, input, effect, OnDestroy, signal, Pipe, PipeTransform } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InterviewService } from '../../core/services/interview.service';
import { I18nService } from '../../core/services/i18n.service';
import { TopicService } from '../../core/services/topic.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block.component';
import { InterviewFollowUp } from '../../models/interview.model';

/**
 * Simple string replace pipe for i18n interpolation.
 * Usage: {{ 'key' | t | replace:'{count}':'5' }}
 */
@Pipe({ name: 'replace', standalone: true, pure: true })
export class ReplacePipe implements PipeTransform {
  transform(value: string, search: string, replacement: string): string {
    return value ? value.replace(search, replacement) : '';
  }
}

/**
 * Interview Mock Simulator — two modes:
 *
 * 1. SIMULATION MODE (default): Conversational flow where the interviewer asks,
 *    candidate thinks (with optional timer), then reveals the answer + self-assessment.
 *    Follow-ups appear one at a time as the "interviewer probes deeper".
 *
 * 2. REFERENCE MODE: The previous accordion-style layout for studying all
 *    answers at once.
 */
@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [MarkdownPipe, TranslatePipe, ReplacePipe, CodeBlockComponent, RouterLink],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.scss'
})
export class InterviewComponent implements OnDestroy {
  private interviewService = inject(InterviewService);
  private topicService = inject(TopicService);
  private i18n = inject(I18nService);

  /** Topic ID passed from parent (TheoryComponent) */
  topicId = input.required<string>();

  /** Optional subtopic filter from parent */
  subtopicId = input<string | null>(null);

  /** Local subtopic override (from internal selector) */
  readonly localSubtopic = signal<string | null>(null);

  /** Effective subtopic: local override takes priority, then parent input */
  readonly effectiveSubtopic = computed(() => this.localSubtopic() ?? this.subtopicId());

  // Expose service signals
  readonly loading = this.interviewService.loading;

  /** Topic → Case Study mapping */
  private static readonly CASE_STUDY_MAP: Record<string, { subtopicId: string; title: string }> = {
    'behavioral': { subtopicId: 'story-incident', title: 'Production Incident Management' },
    'kafka': { subtopicId: 'story-performance', title: 'PostgreSQL Performance Optimization' },
    'software-architecture': { subtopicId: 'story-legacy', title: 'Legacy Code Modernization' },
    'system-design': { subtopicId: 'story-logistics', title: 'Freight Billing Automation' },
    'spring': { subtopicId: 'story-n1', title: 'N+1 Query Detection and Resolution' },
  };

  /** Related case study for this topic (or null) */
  readonly relatedCaseStudy = computed(() => {
    const mapping = InterviewComponent.CASE_STUDY_MAP[this.topicId()];
    return mapping ?? null;
  });

  /** All valid questions for the topic (no filter) */
  readonly allQuestions = computed(() => {
    const all = this.interviewService.getForSubtopic(undefined);
    return all.filter(q => q.shortAnswer && !q.shortAnswer.startsWith('['));
  });

  /** Available subtopics for the selector (with label from topic definition) */
  readonly availableSubtopics = computed(() => {
    const all = this.allQuestions();
    const topic = this.topicService.getTopic(this.topicId());
    const subtopicLabels = new Map<string, string>();
    if (topic?.subtopics) {
      for (const s of topic.subtopics) {
        subtopicLabels.set(s.id, s.label);
      }
    }

    const subtopicMap = new Map<string, number>();
    for (const q of all) {
      if (q.subtopic) {
        subtopicMap.set(q.subtopic, (subtopicMap.get(q.subtopic) ?? 0) + 1);
      }
    }
    return Array.from(subtopicMap.entries())
      .map(([id, count]) => ({
        id,
        label: subtopicLabels.get(id) ?? id,
        count
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  /** Filtered questions: subtopic first, then remaining for continuation */
  readonly questions = computed(() => {
    const sub = this.effectiveSubtopic();
    const all = this.allQuestions();
    if (!sub) return all;

    // Put subtopic questions first, then the rest (for seamless continuation)
    const matched = all.filter(q => q.subtopic === sub);
    const rest = all.filter(q => q.subtopic !== sub);
    return [...matched, ...rest];
  });

  /** Number of questions in the selected subtopic (for UI indicator) */
  readonly subtopicQuestionCount = computed(() => {
    const sub = this.effectiveSubtopic();
    if (!sub) return 0;
    return this.allQuestions().filter(q => q.subtopic === sub).length;
  });

  /** Change subtopic from the internal selector */
  selectSubtopic(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.localSubtopic.set(value || null);
    this._selectedIndex.set(0);
    this.resetSimulationState();
  }

  // ═══════════════════════════════════════════════════════════════
  // MODE CONTROL
  // ═══════════════════════════════════════════════════════════════

  /** No mode toggle — unified simulation experience */

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION (linear flow — no jumping around)
  // ═══════════════════════════════════════════════════════════════

  private readonly _selectedIndex = signal(0);
  readonly selectedIndex = this._selectedIndex.asReadonly();
  readonly currentQuestion = computed(() => this.questions()[this._selectedIndex()] ?? null);
  readonly totalQuestions = computed(() => this.questions().length);
  readonly hasQuestions = computed(() => this.questions().length > 0);

  // ═══════════════════════════════════════════════════════════════
  // SIMULATION STATE
  // ═══════════════════════════════════════════════════════════════

  /** Has the candidate marked they've answered? */
  readonly isAnswered = signal(false);

  /** Self-assessment score (1-5) after revealing answer */
  readonly selfScore = signal<number | null>(null);

  /** Index of the current follow-up being shown (null = main question) */
  readonly currentFollowUpIndex = signal<number | null>(null);

  /** Has the candidate answered the current follow-up? */
  readonly followUpAnswered = signal(false);

  /** Timer state */
  readonly timerActive = signal(false);
  readonly timerSeconds = signal(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  /** Session statistics */
  readonly questionsCompleted = signal(0);
  readonly totalSelfScore = signal(0);
  readonly scoreCount = signal(0);

  /** Computed: average confidence across session */
  readonly averageScore = computed(() => {
    const count = this.scoreCount();
    return count > 0 ? Math.round((this.totalSelfScore() / count) * 10) / 10 : 0;
  });

  /** Computed: are we in the follow-up phase? */
  readonly inFollowUpPhase = computed(() => this.currentFollowUpIndex() !== null);

  /** Computed: current follow-up question text */
  readonly currentFollowUp = computed<InterviewFollowUp | null>(() => {
    const q = this.currentQuestion();
    const idx = this.currentFollowUpIndex();
    if (!q?.followUps || idx === null) return null;
    return q.followUps[idx] ?? null;
  });

  /** Computed: total follow-ups for current question */
  readonly totalFollowUps = computed(() => {
    const q = this.currentQuestion();
    return q?.followUps?.length ?? 0;
  });

  // ═══════════════════════════════════════════════════════════════
  // TTS (Text-to-Speech)
  // ═══════════════════════════════════════════════════════════════

  readonly readingSection = signal<string | null>(null);

  private lastTopicId = '';

  constructor() {
    effect(() => {
      const topicId = this.topicId();
      const _locale = this.i18n.locale(); // track locale to reload data
      if (topicId) {
        const topicChanged = topicId !== this.lastTopicId;
        this.lastTopicId = topicId;

        if (topicChanged) {
          this._selectedIndex.set(0);
          this.resetSimulationState();
        }

        this.interviewService.loadForTopic(topicId);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SIMULATION ACTIONS
  // ═══════════════════════════════════════════════════════════════

  /** Reveal all content immediately (skip the simulation flow) */
  revealAll(): void {
    this.stopTimer();
    this.isAnswered.set(true);
  }

  /** Candidate marks they've formulated an answer */
  markAnswered(): void {
    this.stopTimer();
    this.isAnswered.set(true);
  }

  /** Candidate rates their confidence */
  rateSelf(score: number): void {
    this.selfScore.set(score);
    this.totalSelfScore.update(v => v + score);
    this.scoreCount.update(v => v + 1);
  }

  /** Move to the next follow-up question (or next main question if done) */
  nextFollowUp(): void {
    const q = this.currentQuestion();
    const idx = this.currentFollowUpIndex();

    if (!q?.followUps || q.followUps.length === 0) {
      this.advanceToNextQuestion();
      return;
    }

    if (idx === null) {
      // Start follow-up phase
      this.currentFollowUpIndex.set(0);
      this.followUpAnswered.set(false);
    } else if (idx < q.followUps.length - 1) {
      // Next follow-up
      this.currentFollowUpIndex.set(idx + 1);
      this.followUpAnswered.set(false);
    } else {
      // All follow-ups done → next main question
      this.advanceToNextQuestion();
    }
  }

  /** Mark follow-up as answered (reveals hint if available) */
  markFollowUpAnswered(): void {
    this.followUpAnswered.set(true);
  }

  /** Skip follow-ups and go directly to next question */
  skipToNext(): void {
    this.advanceToNextQuestion();
  }

  /** Start the thinking timer */
  startTimer(): void {
    if (this.timerActive()) return;
    this.timerActive.set(true);
    this.timerSeconds.set(0);
    this.timerInterval = setInterval(() => {
      this.timerSeconds.update(v => v + 1);
    }, 1000);
  }

  /** Stop the thinking timer */
  stopTimer(): void {
    this.timerActive.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /** Format seconds to mm:ss */
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  selectQuestion(index: number): void {
    const max = this.questions().length;
    if (index >= 0 && index < max) {
      this._selectedIndex.set(index);
    }
    this.resetSimulationState();
    this.stopSectionAudio();
  }

  next(): void {
    const idx = this._selectedIndex();
    if (idx < this.questions().length - 1) {
      this._selectedIndex.set(idx + 1);
    }
    this.resetSimulationState();
    this.stopSectionAudio();
  }

  previous(): void {
    const idx = this._selectedIndex();
    if (idx > 0) {
      this._selectedIndex.set(idx - 1);
    }
    this.resetSimulationState();
    this.stopSectionAudio();
  }

  private advanceToNextQuestion(): void {
    this.questionsCompleted.update(v => v + 1);
    this.next();
  }

  private resetSimulationState(): void {
    this.isAnswered.set(false);
    this.selfScore.set(null);
    this.currentFollowUpIndex.set(null);
    this.followUpAnswered.set(false);
    this.stopTimer();
    this.timerSeconds.set(0);
    // Auto-start timer when a new question appears
    this.startTimer();
  }

  // ═══════════════════════════════════════════════════════════════
  // TTS (Text-to-Speech)
  // ═══════════════════════════════════════════════════════════════

  ngOnDestroy(): void {
    this.stopSectionAudio();
    this.stopTimer();
  }

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

  private toSpeechText(markdown: string): string {
    return markdown
      .replace(/```[\s\S]*?```/g, ' Code example omitted. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*{1,3}|#{1,6}|[_~]/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  toSpeechList(items: string[]): string {
    return items.map((item, i) => `${i + 1}. ${item}`).join('. ');
  }

  toSpeechFollowUps(followUps: Array<{ question: string; hint?: string }>): string {
    return followUps.map((fu, i) =>
      `Question ${i + 1}: ${fu.question}${fu.hint ? '. Hint: ' + fu.hint : ''}`
    ).join('. ');
  }

  difficultyClass(difficulty: string): string {
    return `badge--${difficulty.toLowerCase()}`;
  }

  /** Translated difficulty label */
  difficultyLabel(difficulty: string): string {
    return this.i18n.t(`simulator.difficulty.${difficulty}`) || difficulty;
  }

  experienceClass(level: string): string {
    return `exp--${(level ?? '').toLowerCase().replace(/_/g, '-')}`;
  }

  /** Translated experience level label */
  experienceLabel(level: string): string {
    return this.i18n.t(`simulator.experience.${level}`) || level;
  }
}
