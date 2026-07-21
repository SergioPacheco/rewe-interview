import { ChangeDetectionStrategy, Component, input, output, signal, computed, ViewEncapsulation } from '@angular/core';

export interface ChoiceOption {
  label: string;
  description?: string;
}

export interface ChoiceResult {
  index: number;
  correct: boolean;
}

/**
 * Reusable multiple-choice component.
 *
 * Displays options, handles selection, shows instant feedback.
 * Parent provides choices and the correct answer index/value.
 * Automatically resets when choices change (new question).
 *
 * Usage:
 * <app-choice-list
 *   [choices]="options"
 *   [correctIndex]="2"
 *   (answered)="onAnswer($event)" />
 */
@Component({
  selector: 'app-choice-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="choice-list">
      @for (choice of choices(); track $index) {
        <button
          type="button"
          class="choice-list__item"
          [class.choice-list__item--correct]="checked() && $index === correctIndex()"
          [class.choice-list__item--wrong]="checked() && selectedIndex() === $index && $index !== correctIndex()"
          [class.choice-list__item--dimmed]="checked() && selectedIndex() !== $index && $index !== correctIndex()"
          [disabled]="checked()"
          (click)="select($index)"
        >
          <span class="choice-list__letter">{{ hasLetterPrefix(choice.label) ? '' : letter($index) }}</span>
          <span class="choice-list__text">
            {{ choice.label }}
            @if (choice.description) {
              <small class="choice-list__desc">{{ choice.description }}</small>
            }
          </span>
        </button>
      }

      @if (checked()) {
        <div class="choice-list__feedback" [attr.data-result]="isCorrect() ? 'correct' : 'incorrect'">
          {{ isCorrect() ? '✓ Correct!' : '✗ Incorrect' }}
        </div>
      }
    </div>
  `,
  styles: [`
    .choice-list {
      display: grid;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .choice-list__item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 8px;
      background: none;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--color-text, #374151);
      transition: border-color 0.15s, background 0.15s, transform 0.1s;
      width: 100%;

      &:hover:not(:disabled) {
        border-color: var(--color-primary, #6366f1);
        background: rgba(99, 102, 241, 0.04);
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        cursor: default;
      }

      &--correct {
        background: rgba(34, 197, 94, 0.08);
        border-color: #22c55e;
        color: #16a34a;
      }

      &--wrong {
        background: rgba(239, 68, 68, 0.08);
        border-color: #ef4444;
        color: #dc2626;
      }

      &--dimmed {
        opacity: 0.5;
      }
    }

    .choice-list__letter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--color-border, #e2e8f0);
      color: var(--color-text, #374151);
      font-weight: 600;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .choice-list__item--correct .choice-list__letter {
      background: #22c55e;
      color: white;
    }

    .choice-list__item--wrong .choice-list__letter {
      background: #ef4444;
      color: white;
    }

    .choice-list__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .choice-list__desc {
      color: var(--color-gray-500, #6b7280);
      font-size: 0.75rem;
    }

    .choice-list__feedback {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875rem;

      &[data-result="correct"] {
        background: rgba(34, 197, 94, 0.08);
        color: #16a34a;
      }

      &[data-result="incorrect"] {
        background: rgba(239, 68, 68, 0.08);
        color: #dc2626;
      }
    }
  `]
})
export class ChoiceListComponent {
  /** The list of choices to display */
  choices = input.required<ChoiceOption[]>();

  /** Index of the correct answer */
  correctIndex = input.required<number>();

  /** Emits when user selects a choice */
  answered = output<ChoiceResult>();

  /** Internal state */
  selectedIndex = signal<number | null>(null);
  checked = signal(false);

  isCorrect = computed(() => this.selectedIndex() === this.correctIndex());

  letter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  hasLetterPrefix(label: string): boolean {
    return /^[A-Za-z]\)/.test(label);
  }

  select(index: number): void {
    if (this.checked()) return;
    this.selectedIndex.set(index);
    this.checked.set(true);
    this.answered.emit({
      index,
      correct: index === this.correctIndex()
    });
  }

  /** Reset state (called by parent on next question) */
  reset(): void {
    this.selectedIndex.set(null);
    this.checked.set(false);
  }
}
