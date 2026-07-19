import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shared Code Block — displays syntax-highlighted code.
 * Uses CSS-only highlighting (no heavy lib on first load).
 * CDK Clipboard for copy button.
 */
@Component({
  selector: 'app-code-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block">
      @if (language()) {
        <span class="code-block__lang">{{ language() }}</span>
      }
      <button
        class="code-block__copy"
        (click)="copyToClipboard()"
        aria-label="Copy code"
        title="Copy to clipboard"
      >
        {{ copied ? '✓' : '📋' }}
      </button>
      <pre class="code-block__pre"><code class="code-block__code" [innerHTML]="code()"></code></pre>
    </div>
  `,
  styles: [`
    .code-block {
      position: relative;
      background: var(--color-code-bg);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin: var(--space-4) 0;

      &__lang {
        position: absolute;
        top: var(--space-2);
        right: var(--space-10);
        font-size: var(--text-xs);
        color: var(--color-code-comment);
        font-family: var(--font-mono);
        text-transform: uppercase;
      }

      &__copy {
        position: absolute;
        top: var(--space-2);
        right: var(--space-2);
        background: none;
        border: none;
        font-size: var(--text-md);
        cursor: pointer;
        padding: var(--space-1);
        border-radius: var(--radius-sm);
        opacity: 0.5;
        transition: opacity var(--transition-fast);

        &:hover { opacity: 1; }
      }

      &__pre {
        margin: 0;
        padding: var(--space-5);
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        line-height: 1.6;
      }

      &__code {
        color: var(--color-code-text);
        font-family: inherit;
      }
    }
  `]
})
export class CodeBlockComponent {
  code = input.required<string>();
  language = input<string>('');

  copied = false;

  copyToClipboard(): void {
    const text = this.stripHtml(this.code());
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent ?? '';
  }
}
