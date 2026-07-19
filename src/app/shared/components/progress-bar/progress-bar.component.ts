import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

/**
 * Shared Progress Bar — animated, accessible, transform-only.
 * Uses scaleX for animation (no reflow — GPU composited).
 */
@Component({
  selector: 'app-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="progress-bar"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-label]="label()"
    >
      <div
        class="progress-bar__fill"
        [style.transform]="'scaleX(' + fraction() + ')'"
        [attr.data-variant]="variant()"
      ></div>
      @if (showLabel()) {
        <span class="progress-bar__text">{{ percentage() }}%</span>
      }
    </div>
  `,
  styles: [`
    .progress-bar {
      position: relative;
      height: 0.5rem;
      background: var(--color-surface-2);
      border-radius: var(--radius-full);
      overflow: hidden;

      &__fill {
        position: absolute;
        inset: 0;
        border-radius: var(--radius-full);
        transform-origin: left;
        transition: transform 0.4s var(--ease-out);

        &[data-variant="primary"] { background: var(--color-primary); }
        &[data-variant="success"] { background: var(--color-success); }
        &[data-variant="warning"] { background: var(--color-warning); }
        &[data-variant="info"] { background: var(--color-info); }
      }

      &__text {
        position: absolute;
        right: 0;
        top: calc(100% + var(--space-1));
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        font-weight: var(--weight-semibold);
      }
    }
  `]
})
export class ProgressBarComponent {
  value = input.required<number>();
  max = input(100);
  variant = input<'primary' | 'success' | 'warning' | 'info'>('primary');
  label = input('Progress');
  showLabel = input(false);

  fraction = computed(() => {
    const m = this.max();
    return m > 0 ? Math.min(this.value() / m, 1) : 0;
  });

  percentage = computed(() => Math.round(this.fraction() * 100));
}
