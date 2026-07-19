import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AnswerResult } from '../../../models';

/**
 * Shared Feedback Card — shows correct/incorrect result with animation.
 * Uses CSS transform-only animation (no reflow).
 */
@Component({
  selector: 'app-feedback-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="feedback-card" [attr.data-result]="result()">
      <div class="feedback-card__icon">
        {{ result() === 'correct' ? '✓' : result() === 'partial' ? '◐' : '✗' }}
      </div>
      <div class="feedback-card__content">
        <strong class="feedback-card__title">
          {{ result() === 'correct' ? 'Correct!' : result() === 'partial' ? 'Partially correct' : 'Incorrect' }}
        </strong>
        @if (explanation()) {
          <p class="feedback-card__explanation">{{ explanation() }}</p>
        }
      </div>
      <button class="feedback-card__btn" (click)="next.emit()">
        Next →
      </button>
    </div>
  `,
  styles: [`
    .feedback-card {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      animation: slide-up 0.25s var(--ease-out);

      &[data-result="correct"] {
        background: var(--color-success-bg);
        border: 1px solid var(--color-success);
      }

      &[data-result="incorrect"] {
        background: var(--color-error-bg);
        border: 1px solid var(--color-error);
      }

      &[data-result="partial"] {
        background: var(--color-warning-bg);
        border: 1px solid var(--color-warning);
      }

      &__icon {
        font-size: 1.5rem;
        font-weight: 900;
        line-height: 1;
      }

      &__content {
        flex: 1;
      }

      &__title {
        font-size: var(--text-base);
        display: block;
        margin-bottom: var(--space-1);
      }

      &__explanation {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      &__btn {
        padding: var(--space-2) var(--space-5);
        background: var(--color-text);
        color: var(--color-text-inverse);
        border: none;
        border-radius: var(--radius-full);
        font-size: var(--text-sm);
        font-weight: var(--weight-bold);
        cursor: pointer;
        transition: transform var(--transition-fast);
        white-space: nowrap;

        &:hover { transform: scale(1.05); }
      }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(0.5rem); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FeedbackCardComponent {
  result = input.required<AnswerResult>();
  explanation = input<string>('');
  next = output<void>();
}
