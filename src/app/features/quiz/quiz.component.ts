import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { QuizEngineService } from '../../core/services/quiz-engine.service';
import { TopicService } from '../../core/services/topic.service';
import { SyntaxHighlightPipe } from '../../shared/pipes/syntax-highlight.pipe';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block.component';
import { AnswerResult } from '../../models';

/**
 * Quiz Component — interactive exercise engine.
 * Reads state from QuizEngineService (signals), zero local duplication.
 */
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink, SyntaxHighlightPipe, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="quiz">
      <!-- Header -->
      <nav class="quiz__nav">
        <a routerLink="/" class="quiz__back">← Topics</a>
        @if (topic(); as t) {
          <span class="quiz__topic">{{ t.icon }} {{ t.name }}</span>
        } @else if (engine.isActive()) {
          <span class="quiz__topic">🎯 Mixed practice</span>
        }
      </nav>

      <!-- Practice setup: the global route should explain what it starts. -->
      @if (isSetupVisible()) {
        <section class="quiz__setup" aria-labelledby="practice-setup-title">
          <span class="quiz__eyebrow">PRACTICE SESSION</span>
          <h1 id="practice-setup-title">Practice with a purpose</h1>
          <p>
            Choose a mixed revision session or focus on one subject. Answers stay hidden until
            you submit or review your attempt.
          </p>

          <div class="quiz__setup-grid">
            <label class="quiz__field">
              <span>Focus</span>
              <select [value]="selectedTopicId()" (change)="setTopic($event)">
                <option value="mixed">Mixed topics</option>
                @for (t of practiceTopics(); track t.id) {
                  <option [value]="t.id">{{ t.icon }} {{ t.name }} · {{ questionCount(t.id) }} questions</option>
                }
              </select>
            </label>

            <label class="quiz__field">
              <span>Questions</span>
              <select [value]="selectedQuestionCount()" (change)="setQuestionCount($event)">
                <option value="5">Quick review · 5</option>
                <option value="10">Focused session · 10</option>
                <option value="15">Full session · 15</option>
              </select>
            </label>
          </div>

          <div class="quiz__setup-note">
            <strong>{{ selectedTopicId() === 'mixed' ? 'Mixed practice' : selectedTopicName() }}</strong>
            <span>{{ setupDescription() }}</span>
          </div>

          <button class="quiz__start-btn" (click)="startSelectedPractice()">Start practice →</button>
        </section>
      }

      <!-- Active quiz -->
      @if (engine.isActive() && !engine.isComplete()) {
        <div class="quiz__active">
          <!-- Progress bar -->
          <div class="quiz__progress">
            <div
              class="quiz__progress-bar"
              [style.transform]="'scaleX(' + progressFraction() + ')'"
              role="progressbar"
              [attr.aria-valuenow]="engine.questionNumber()"
              [attr.aria-valuemax]="engine.totalInSession()"
            ></div>
            <span class="quiz__progress-text">
              {{ engine.questionNumber() }} / {{ engine.totalInSession() }}
            </span>
          </div>

          <!-- Combo indicator -->
          @if (engine.combo() > 1) {
            <div class="quiz__combo">
              🔥 {{ engine.combo() }}x combo!
            </div>
          }

          <!-- Question -->
          @if (engine.currentQuestion(); as q) {
            <div class="quiz__question">
              <div class="quiz__type-badge">{{ q.type }}</div>
              <p class="quiz__prompt" [innerHTML]="getPrompt(q)"></p>

              <!-- Code block (if exercise has code) -->
              @if (getField(q, 'code')) {
                <app-code-block
                  [code]="getField(q, 'code')"
                  [language]="getField(q, 'language') || 'text'"
                  label="Exercise code"
                />
              }

              <!-- Snippets (PICK_INVALID type) -->
              @if (getFieldArray(q, 'snippets').length > 0) {
                <div class="quiz__snippets">
                  @for (snippet of getFieldArray(q, 'snippets'); track snippet.id || $index) {
                    <button
                      class="quiz__snippet"
                      [class.quiz__snippet--selected]="textAnswer() === (snippet.id || $index.toString())"
                      [class.quiz__snippet--correct]="showResult() && (snippet.id || $index.toString()) === getField(q, 'answer')"
                      [class.quiz__snippet--wrong]="showResult() && textAnswer() === (snippet.id || $index.toString()) && (snippet.id || $index.toString()) !== getField(q, 'answer')"
                      [disabled]="showResult()"
                      (click)="selectText(snippet.id || $index.toString())"
                    >
                      <pre><code [innerHTML]="snippet.code | syntaxHighlight"></code></pre>
                    </button>
                  }
                </div>
              }

              <!-- Multiple choices (PREDICT_OUTPUT, FILL_BLANK, SINGLE_CHOICE, etc) -->
              @if (getOptions(q).length > 0 && getFieldArray(q, 'snippets').length === 0) {
                <div class="quiz__options">
                  @for (opt of getOptions(q); track optionValue(opt, $index)) {
                    <button
                      class="quiz__option"
                      [class.quiz__option--selected]="isSelected($index)"
                      [class.quiz__option--correct]="showResult() && isCorrectChoice(q, $index)"
                      [class.quiz__option--wrong]="showResult() && isSelected($index) && !isCorrectChoice(q, $index)"
                      [disabled]="showResult()"
                      (click)="selectChoice($index)"
                    >
                      <span class="quiz__option-letter">{{ optionLetter($index) }}</span>
                      <span class="quiz__option-text" [innerHTML]="optionLabel(opt)"></span>
                    </button>
                  }
                </div>
              }

              <!-- ORAL_ANSWER: just a text area for practicing -->
              @if (q.type === 'ORAL_ANSWER') {
                <div class="quiz__oral">
                  <p class="quiz__oral-hint">Practice answering out loud, then reveal the model answer.</p>
                  @if (getField(q, 'interviewerIntent')) {
                    <p class="quiz__interviewer-intent">
                      🎯 <strong>Interviewer intent:</strong> {{ getField(q, 'interviewerIntent') }}
                    </p>
                  }

                  <!-- Schema V2: Opening Guidance (before answer) -->
                  @if (getField(q, 'schemaVersion')) {
                    @if (getField(q, 'context')) {
                      <p class="quiz__context"><em>{{ getField(q, 'context') }}</em></p>
                    }
                    <details class="quiz__details quiz__details--open">
                      <summary>💡 Opening Guidance</summary>
                      <div class="quiz__guidance">
                        <p><strong>Objective:</strong> {{ getFieldNested(q, 'openingGuidance', 'objective') }}</p>
                        @if (getFieldArray(getFieldObj(q, 'openingGuidance'), 'requiredElements').length > 0) {
                          <p><strong>Must include:</strong></p>
                          <ul>
                            @for (el of getFieldArray(getFieldObj(q, 'openingGuidance'), 'requiredElements'); track $index) {
                              <li>✅ {{ el }}</li>
                            }
                          </ul>
                        }
                        @if (getFieldArray(getFieldObj(q, 'openingGuidance'), 'avoid').length > 0) {
                          <p><strong>Avoid:</strong></p>
                          <ul>
                            @for (el of getFieldArray(getFieldObj(q, 'openingGuidance'), 'avoid'); track $index) {
                              <li>❌ {{ el }}</li>
                            }
                          </ul>
                        }
                      </div>
                    </details>

                    <details class="quiz__details">
                      <summary>❓ Clarifying Questions to Ask ({{ getFieldArray(q, 'clarifyingQuestions').length }})</summary>
                      <div class="quiz__clarifying">
                        @for (cq of getFieldArray(q, 'clarifyingQuestions'); track $index) {
                          <div class="quiz__cq-item">
                            <strong>{{ cq.question }}</strong>
                            <details>
                              <summary>Why it matters</summary>
                              <p>{{ cq.whyItMatters }}</p>
                            </details>
                          </div>
                        }
                      </div>
                    </details>
                  }

                  <textarea
                    class="quiz__text-area"
                    placeholder="Type your answer here (optional — or just practice speaking)..."
                    [value]="textAnswer()"
                    (input)="onTextInput($event)"
                    [disabled]="showResult()"
                    rows="5"
                  ></textarea>
                </div>
              }

              <!-- COMPARE type: shows comparison table -->
              @if (q.type === 'COMPARE' && getFieldArray(q, 'pairs').length > 0) {
                <div class="quiz__compare-table">
                  @for (pair of getFieldArray(q, 'pairs'); track $index) {
                    <div class="quiz__compare-row">
                      <div class="quiz__compare-left" [innerHTML]="pair.left || pair.a"></div>
                      <div class="quiz__compare-right" [innerHTML]="pair.right || pair.b"></div>
                    </div>
                  }
                </div>
              }

              <!-- Free text input (for types without choices) -->
              @if (!getOptions(q).length && !getFieldArray(q, 'snippets').length && q.type !== 'ORAL_ANSWER' && q.type !== 'COMPARE') {
                @if (!isSelfReview(q)) {
                  <div class="quiz__input-area">
                    <input
                      type="text"
                      class="quiz__text-input"
                      [placeholder]="q.type === 'PREDICT_OUTPUT' ? 'Type the exact output...' : 'Type your answer...'"
                      [value]="textAnswer()"
                      (input)="onTextInput($event)"
                      [disabled]="showResult()"
                      (keydown.enter)="checkAnswer()"
                    />
                  </div>
                }
              }
            </div>

            <!-- Actions -->
            <div class="quiz__actions">
              @if (!showResult()) {
                @if (isSelfReview(q)) {
                  <button class="quiz__check-btn" (click)="revealSuggestedAnswer()">REVEAL SUGGESTED ANSWER</button>
                } @else {
                  <button
                    class="quiz__check-btn"
                    [disabled]="!hasAnswer()"
                    (click)="checkAnswer()"
                  >
                    CHECK ANSWER
                  </button>
                }
              } @else {
                <!-- Feedback -->
                <div class="quiz__feedback" [attr.data-result]="lastResult()">
                  <span class="quiz__feedback-icon">
                    {{ lastResult() === 'correct' ? '✓' : '✗' }}
                  </span>
                  <span class="quiz__feedback-text">
                    {{ selfReview() ? 'Suggested answer' : (lastResult() === 'correct' ? 'Correct!' : 'Incorrect') }}
                  </span>
                </div>

                @if (getAnswerText(q)) {
                  <details class="quiz__details quiz__details--open" open>
                    <summary>📝 Suggested Answer</summary>
                    <div class="quiz__rich-content">{{ getAnswerText(q) }}</div>
                  </details>
                }

                <!-- Explanation -->
                @if (q.explanation || getField(q, 'explain')) {
                  <div class="quiz__explanation-box">
                    <p class="quiz__explanation">{{ q.explanation || getField(q, 'explain') }}</p>
                  </div>
                }

                <!-- Rich content: Model Answer (for ORAL/interview questions) -->
                @if (getField(q, 'modelAnswer')) {
                  <details class="quiz__details">
                    <summary>📝 Model Answer (STAR)</summary>
                    <div class="quiz__rich-content" [innerHTML]="getField(q, 'modelAnswer')"></div>
                  </details>
                }

                <!-- Key Points -->
                @if (getFieldArray(q, 'keyPoints').length > 0) {
                  <details class="quiz__details">
                    <summary>🎯 Key Points</summary>
                    <ul class="quiz__key-points">
                      @for (point of getFieldArray(q, 'keyPoints'); track $index) {
                        <li>{{ point }}</li>
                      }
                    </ul>
                  </details>
                }

                <!-- Follow-up Questions -->
                @if (getFieldArray(q, 'followUps').length > 0) {
                  <details class="quiz__details">
                    <summary>💬 Follow-up Questions</summary>
                    <div class="quiz__followups">
                      @for (fu of getFieldArray(q, 'followUps'); track $index) {
                        <div class="quiz__followup">
                          <strong>Q: {{ fu.question || fu }}</strong>
                          @if (fu.answerHint) {
                            <p>💡 {{ fu.answerHint }}</p>
                          }
                        </div>
                      }
                    </div>
                  </details>
                }

                <!-- Vocabulary -->
                @if (getFieldArray(q, 'vocabulary').length > 0) {
                  <details class="quiz__details">
                    <summary>📖 Vocabulary</summary>
                    <div class="quiz__vocabulary">
                      @for (v of getFieldArray(q, 'vocabulary'); track $index) {
                        <div class="quiz__vocab-item">
                          <strong>{{ v.term }}</strong>: {{ v.meaning }}
                          @if (v.example) {
                            <p class="quiz__vocab-example">💬 "{{ v.example }}"</p>
                          }
                        </div>
                      }
                    </div>
                  </details>
                }

                <!-- Mistakes to Avoid -->
                @if (getFieldArray(q, 'mistakesToAvoid').length > 0) {
                  <details class="quiz__details">
                    <summary>⚠️ Mistakes to Avoid</summary>
                    <ul class="quiz__mistakes">
                      @for (m of getFieldArray(q, 'mistakesToAvoid'); track $index) {
                        <li>❌ {{ m }}</li>
                      }
                    </ul>
                  </details>
                }

                <!-- Schema V2: Extended post-reveal content -->
                @if (getField(q, 'schemaVersion')) {
                  <!-- Tradeoffs -->
                  @if (getFieldArray(q, 'tradeoffs').length > 0) {
                    <details class="quiz__details">
                      <summary>⚖️ Tradeoffs ({{ getFieldArray(q, 'tradeoffs').length }})</summary>
                      <div class="quiz__v2-section">
                        @for (t of getFieldArray(q, 'tradeoffs'); track $index) {
                          <div class="quiz__v2-card">
                            <strong>{{ t.dimensionA }}</strong> vs <strong>{{ t.dimensionB }}</strong>
                            <p>{{ t.domainContext }}</p>
                            <p><em>→ {{ t.consequence }}</em></p>
                          </div>
                        }
                      </div>
                    </details>
                  }

                  <!-- Decision Branches -->
                  @if (getFieldArray(q, 'decisionBranches').length > 0) {
                    <details class="quiz__details">
                      <summary>🌿 Decision Branches ({{ getFieldArray(q, 'decisionBranches').length }})</summary>
                      <div class="quiz__v2-section">
                        @for (b of getFieldArray(q, 'decisionBranches'); track $index) {
                          <div class="quiz__v2-card">
                            <p><strong>If:</strong> {{ b.condition }}</p>
                            <p><strong>Then:</strong> {{ b.recommendation }}</p>
                            <p><em>Rationale:</em> {{ b.rationale }}</p>
                            @if (b.risks?.length) { <p>⚠️ Risks: {{ b.risks.join(', ') }}</p> }
                          </div>
                        }
                      </div>
                    </details>
                  }

                  <!-- Experience Evidence -->
                  @if (getFieldArray(q, 'experienceEvidence').length > 0) {
                    <details class="quiz__details">
                      <summary>🏷️ Experience Classification</summary>
                      <div class="quiz__v2-section">
                        @for (e of getFieldArray(q, 'experienceEvidence'); track $index) {
                          <div class="quiz__v2-card">
                            <strong>{{ e.area }}</strong> — <span class="quiz__exp-level">{{ e.level }}</span>
                            <p><em>{{ e.safeWording }}</em></p>
                          </div>
                        }
                      </div>
                    </details>
                  }

                  <!-- Scoring Rubric -->
                  @if (getFieldArray(q, 'scoringRubric').length > 0) {
                    <details class="quiz__details">
                      <summary>📊 Scoring Rubric</summary>
                      <div class="quiz__v2-section">
                        @for (r of getFieldArray(q, 'scoringRubric'); track $index) {
                          <div class="quiz__v2-card">
                            <strong>{{ r.criterion }}</strong> ({{ r.weight }}%)
                            <p>✅ Strong: {{ r.strongSignals?.join('; ') }}</p>
                            <p>❌ Weak: {{ r.weakSignals?.join('; ') }}</p>
                          </div>
                        }
                      </div>
                    </details>
                  }

                  <!-- Red Flags -->
                  @if (getFieldArray(q, 'redFlags').length > 0) {
                    <details class="quiz__details">
                      <summary>🚩 Red Flags</summary>
                      <ul class="quiz__mistakes">
                        @for (f of getFieldArray(q, 'redFlags'); track $index) {
                          <li>🚩 {{ f }}</li>
                        }
                      </ul>
                    </details>
                  }

                  <!-- Coach Debrief -->
                  @if (getFieldObj(q, 'coachDebrief')) {
                    <details class="quiz__details">
                      <summary>🎓 Coach Debrief</summary>
                      <div class="quiz__v2-section">
                        @if (getFieldArray(getFieldObj(q, 'coachDebrief'), 'strongAnswerElements').length > 0) {
                          <p><strong>Strong answer includes:</strong></p>
                          <ul>
                            @for (el of getFieldArray(getFieldObj(q, 'coachDebrief'), 'strongAnswerElements'); track $index) {
                              <li>{{ el }}</li>
                            }
                          </ul>
                        }
                        @if (getFieldArray(getFieldObj(q, 'coachDebrief'), 'commonlyMissedPoints').length > 0) {
                          <p><strong>Commonly missed:</strong></p>
                          <ul>
                            @for (el of getFieldArray(getFieldObj(q, 'coachDebrief'), 'commonlyMissedPoints'); track $index) {
                              <li>⚠️ {{ el }}</li>
                            }
                          </ul>
                        }
                      </div>
                    </details>
                  }
                }

                <button class="quiz__next-btn" (click)="nextQuestion()">
                  NEXT →
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- Complete -->
      @if (engine.isComplete()) {
        <div class="quiz__complete">
          <h2>🎉 Session Complete!</h2>
          <div class="quiz__results">
            <div class="quiz__result-stat">
              <strong>{{ engine.sessionAccuracy() }}%</strong>
              <span>Accuracy</span>
            </div>
            <div class="quiz__result-stat">
              <strong>{{ engine.maxCombo() }}x</strong>
              <span>Best Combo</span>
            </div>
          </div>
          <div class="quiz__complete-actions">
            <button class="quiz__start-btn" (click)="restartPractice()">
              Practice Again
            </button>
            <a routerLink="/" class="quiz__home-link">← Back to Dashboard</a>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './quiz.component.scss'
})
export class QuizComponent {
  protected engine = inject(QuizEngineService);
  private route = inject(ActivatedRoute);
  private topicService = inject(TopicService);

  // Route params
  private topicId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('topicId') ?? '')),
    { initialValue: '' }
  );

  private subtopicId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('subtopicId') ?? undefined)),
    { initialValue: undefined as string | undefined }
  );

  // Local UI state (not duplicated from engine)
  selectedOptions = signal<number[]>([]);
  textAnswer = signal('');
  showResult = signal(false);
  lastResult = signal<AnswerResult>('incorrect');
  selfReview = signal(false);
  selectedTopicId = signal('mixed');
  selectedQuestionCount = signal(15);

  // Computed
  topic = computed(() => this.topicService.getTopic(this.topicId()));
  availableCount = computed(() =>
    this.topicService.getQuestions(this.topicId(), this.subtopicId()).length
  );
  practiceTopics = computed(() => this.topicService.topics().filter(t =>
    this.topicService.getQuestions(t.id).some(q => this.isPracticeQuestion(q))
  ));
  isSetupVisible = computed(() => !this.topicId() && !this.engine.isActive() && !this.engine.isComplete());
  selectedTopicName = computed(() =>
    this.topicService.getTopic(this.selectedTopicId())?.name ?? 'Mixed practice'
  );
  setupDescription = computed(() => this.selectedTopicId() === 'mixed'
    ? `${this.selectedQuestionCount()} questions selected randomly across the technical topics.`
    : `${this.selectedQuestionCount()} questions selected from this topic.`
  );
  progressFraction = computed(() => {
    const total = this.engine.totalInSession();
    return total > 0 ? this.engine.questionNumber() / total : 0;
  });

  readonly compilesOptions = [
    { value: 'compiles', label: '✓ Compiles and runs' },
    { value: 'compile_error', label: '✗ Compilation error' },
    { value: 'runtime_exception', label: '💥 Runtime exception' }
  ];

  constructor() {
    // Auto-start quiz when topicId is available (for /quiz/:topicId routes)
    // For /practice route, the guard already starts the engine
    effect(() => {
      const id = this.topicId();
      if (id && !this.engine.isActive() && !this.engine.isComplete()) {
        this.engine.start(id, this.subtopicId());
      }
    }, { allowSignalWrites: true });
  }

  startQuiz(): void {
    const id = this.topicId();
    if (id) {
      this.engine.start(id, this.subtopicId());
    } else {
      this.engine.startMixed();
    }
    this.resetLocal();
  }

  startSelectedPractice(): void {
    const topicId = this.selectedTopicId();
    const count = this.selectedQuestionCount();
    if (topicId === 'mixed') {
      this.engine.startMixed(count);
    } else {
      this.engine.start(topicId, undefined, count);
    }
    this.resetLocal();
  }

  restartPractice(): void {
    if (!this.topicId()) {
      this.engine.end();
      this.startSelectedPractice();
      return;
    }
    this.startQuiz();
  }

  setTopic(event: Event): void {
    this.selectedTopicId.set((event.target as HTMLSelectElement).value);
  }

  setQuestionCount(event: Event): void {
    this.selectedQuestionCount.set(Number((event.target as HTMLSelectElement).value));
  }

  questionCount(topicId: string): number {
    return this.topicService.getQuestions(topicId).filter(q => this.isPracticeQuestion(q)).length;
  }

  /** Get the prompt/question text from any exercise type */
  getPrompt(q: unknown): string {
    const item = q as any;
    return item.mission || item.question || item.prompt || '';
  }

  /** Select a choice by index (for choices array) */
  selectChoice(index: number): void {
    this.selectedOptions.set([index]);
  }

  /** Check if a choice is the correct one */
  isCorrectChoice(q: unknown, index: number): boolean {
    const item = q as any;
    const correct = item.answer ?? item.correct ?? item.bestOption;
    if (typeof correct === 'number') return correct === index;
    const option = this.getOptions(q)[index];
    return this.optionValue(option, index) === correct || this.optionLabel(option) === correct;
  }

  /** Select text-based answer */
  selectText(value: string): void {
    this.textAnswer.set(value);
  }

  selectOption(index: number): void {
    this.selectedOptions.set([index]);
  }

  onTextInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.textAnswer.set(target.value);
  }

  isSelected(index: number): boolean {
    return this.selectedOptions().includes(index);
  }

  hasAnswer(): boolean {
    const q = this.engine.currentQuestion() as any;
    if (!q) return false;
    if (q.type === 'ORAL_ANSWER') return true; // Always can proceed
    if (this.selectedOptions().length > 0) return true;
    if (this.textAnswer().trim().length > 0) return true;
    return false;
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  checkAnswer(): void {
    const q = this.engine.currentQuestion() as any;
    if (!q) return;

    let answer: unknown;

    if (q.type === 'ORAL_ANSWER') {
      answer = this.textAnswer(); // Self-evaluation
    } else if (q.type === 'PICK_INVALID') {
      answer = this.textAnswer(); // snippet id
    } else if (this.selectedOptions().length > 0) {
      answer = this.selectedOptions()[0];
    } else {
      answer = this.textAnswer(); // free text
    }

    const result = this.engine.submitAnswer(answer);
    this.lastResult.set(result);
    this.showResult.set(true);
  }

  revealSuggestedAnswer(): void {
    this.selfReview.set(true);
    this.showResult.set(true);
  }

  nextQuestion(): void {
    this.engine.next();
    this.resetLocal();
  }

  private resetLocal(): void {
    this.selectedOptions.set([]);
    this.textAnswer.set('');
    this.showResult.set(false);
    this.lastResult.set('incorrect');
    this.selfReview.set(false);
  }

  /** Access dynamic fields from rich exercise data */
  getField(q: unknown, field: string): string {
    return (q as Record<string, unknown>)[field] as string ?? '';
  }

  getFieldArray(q: unknown, field: string): any[] {
    const val = (q as Record<string, unknown>)[field];
    return Array.isArray(val) ? val : [];
  }

  getOptions(q: unknown): any[] {
    const item = q as Record<string, unknown>;
    const values = item['choices'] ?? item['options'];
    return Array.isArray(values) ? values : [];
  }

  optionLabel(option: unknown): string {
    if (typeof option === 'string') return option;
    if (option && typeof option === 'object') {
      const item = option as Record<string, unknown>;
      return String(item['text'] ?? item['label'] ?? item['code'] ?? '');
    }
    return String(option ?? '');
  }

  optionValue(option: unknown, index: number): string | number {
    if (option && typeof option === 'object') {
      const item = option as Record<string, unknown>;
      return (item['id'] as string | number | undefined) ?? index;
    }
    return typeof option === 'string' ? option : index;
  }

  getAnswerText(q: unknown): string {
    const item = q as Record<string, unknown>;
    const answer = item['modelAnswer'] ?? item['shortAnswer'] ?? item['answer'];
    if (typeof answer === 'string') return answer;
    if (Array.isArray(answer)) {
      const labels = new Map(
        this.getFieldArray(q, 'items').map((entry: any) => [entry.id, entry.label])
      );
      return answer.map(value => labels.get(value) ?? String(value)).join(' → ');
    }
    return this.getField(q, 'explain') || this.getField(q, 'explanation');
  }

  isSelfReview(q: unknown): boolean {
    const item = q as Record<string, unknown>;
    if (this.getOptions(q).length || this.getFieldArray(q, 'snippets').length) return false;
    return ['DESIGN_DECISION', 'CODE_REFACTOR', 'ORDER_EXECUTION', 'COMPARE_CONCEPTS', 'SCENARIO', 'REAL_EXPERIENCE'].includes(String(item['type']));
  }

  private isPracticeQuestion(q: any): boolean {
    return q.type !== 'ORAL_ANSWER' && q.type !== 'SYSTEM_DESIGN' && q.schemaVersion !== 2;
  }

  getFieldObj(q: unknown, field: string): any {
    return (q as Record<string, unknown>)?.[field] ?? {};
  }

  getFieldNested(q: unknown, parent: string, child: string): string {
    const obj = (q as Record<string, unknown>)?.[parent] as Record<string, unknown> | undefined;
    return (obj?.[child] as string) ?? '';
  }
}
