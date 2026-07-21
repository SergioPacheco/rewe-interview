import { ChangeDetectionStrategy, Component, computed, input, signal, ViewEncapsulation } from '@angular/core';
import hljs from 'highlight.js/lib/common';

export type CodeTheme = 'dark' | 'light';

/** IDE-like code viewer shared across learning and interview surfaces. */
@Component({
  selector: 'app-code-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="code-block" [class.code-block--light]="theme() === 'light'" [attr.aria-label]="label()">
      <header class="code-block__toolbar">
        <div class="code-block__window-controls" aria-hidden="true"><i></i><i></i><i></i></div>
        <span class="code-block__file"><span aria-hidden="true">⌘</span> {{ languageLabel() }}</span>
        <button class="code-block__copy" type="button" (click)="copyToClipboard()" [attr.aria-label]="copied() ? 'Code copied' : 'Copy code'">
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      </header>
      <pre class="code-block__pre"><code class="hljs" [innerHTML]="highlightedCode()"></code></pre>
    </section>
  `,
  styles: [`
    .code-block { --ide-bg:#1e1e1e; --ide-toolbar:#252526; --ide-border:#3c3c3c; --ide-text:#d4d4d4; --ide-muted:#9da1a6; --ide-button:#333337; position:relative; overflow:hidden; margin:var(--sp-2, 1rem) 0; border:1px solid var(--ide-border); border-radius:var(--radius-xl, 12px); background:var(--ide-bg); color:var(--ide-text); box-shadow:0 10px 24px rgb(0 0 0 / 18%); }
    .code-block--light { --ide-bg:#fff; --ide-toolbar:#f3f3f3; --ide-border:#d6d6d6; --ide-text:#24292f; --ide-muted:#57606a; --ide-button:#e9e9e9; }
    .code-block__toolbar { display:flex; align-items:center; min-height:2.75rem; gap:.75rem; padding:.5rem .75rem; background:var(--ide-toolbar); border-bottom:1px solid var(--ide-border); }
    .code-block__window-controls { display:flex; gap:.4rem; }.code-block__window-controls i { width:.7rem; height:.7rem; border-radius:50%; background:#ff5f57; }.code-block__window-controls i:nth-child(2){background:#febc2e}.code-block__window-controls i:nth-child(3){background:#28c840}
    .code-block__file { overflow:hidden; color:var(--ide-muted); font-family:var(--font-mono, monospace); font-size:.75rem; text-overflow:ellipsis; white-space:nowrap; }
    .code-block__copy { margin-left:auto; padding:.3rem .65rem; border:1px solid var(--ide-border); border-radius:6px; background:var(--ide-button); color:var(--ide-text); font:600 .75rem var(--font-body, sans-serif); cursor:pointer; }.code-block__copy:hover{filter:brightness(1.15)}
    .code-block__pre { margin:0; padding:1rem 1.25rem; overflow:auto; background:transparent; font:.8125rem/1.75 var(--font-mono, monospace); tab-size:2; }.code-block__pre code { display:block; min-width:max-content; background:transparent; color:inherit; padding:0; font:inherit; }
    .code-block .hljs-comment,.code-block .hljs-quote{color:#6a9955;font-style:italic}.code-block .hljs-keyword,.code-block .hljs-selector-tag,.code-block .hljs-literal{color:#c586c0}.code-block .hljs-title.class_,.code-block .hljs-title.function_,.code-block .hljs-title{color:#dcdcaa}.code-block .hljs-type,.code-block .hljs-built_in{color:#4ec9b0}.code-block .hljs-string,.code-block .hljs-regexp{color:#ce9178}.code-block .hljs-number,.code-block .hljs-params{color:#b5cea8}.code-block .hljs-meta,.code-block .hljs-attr{color:#9cdcfe}
    .code-block--light .hljs-comment,.code-block--light .hljs-quote{color:#008000}.code-block--light .hljs-keyword,.code-block--light .hljs-selector-tag,.code-block--light .hljs-literal{color:#af00db}.code-block--light .hljs-title.class_,.code-block--light .hljs-title.function_,.code-block--light .hljs-title{color:#795e26}.code-block--light .hljs-type,.code-block--light .hljs-built_in{color:#267f99}.code-block--light .hljs-string,.code-block--light .hljs-regexp{color:#a31515}.code-block--light .hljs-number,.code-block--light .hljs-params{color:#098658}
  `]
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly language = input<string>('text');
  readonly theme = input<CodeTheme>('dark');
  readonly label = input<string>('Code example');
  readonly copied = signal(false);

  readonly languageLabel = computed(() => this.language().trim() || 'text');
  readonly highlightedCode = computed(() => {
    const source = this.code();
    const language = this.language().toLowerCase().trim();
    return language && hljs.getLanguage(language)
      ? hljs.highlight(source, { language, ignoreIllegals: true }).value
      : hljs.highlightAuto(source).value;
  });

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // Clipboard access is unavailable in some embedded or insecure contexts.
    }
  }
}
