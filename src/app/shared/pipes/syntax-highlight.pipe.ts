import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Custom Pipe — transforms plain code text into syntax-highlighted HTML.
 * Lightweight regex-based highlighting (no heavy library needed for display).
 */
@Pipe({
  name: 'syntaxHighlight',
  standalone: true,
  pure: true
})
export class SyntaxHighlightPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  private readonly rules: Array<{ pattern: RegExp; className: string }> = [
    // Comments first (before other rules match content inside comments)
    { pattern: /\/\/.*/g, className: 'hl-comment' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'hl-comment' },
    // Strings
    { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: 'hl-string' },
    // Annotations
    { pattern: /@\w+/g, className: 'hl-annotation' },
    // Java/Kotlin keywords
    { pattern: /\b(public|private|protected|class|interface|abstract|static|final|void|return|new|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|extends|implements|super|this|null|true|false|var|val|fun|suspend|sealed|data|object|companion|override|open|enum|record|sealed|permits|instanceof|yield|when|is|as|in|by)\b/g, className: 'hl-keyword' },
    // Types
    { pattern: /\b(String|Int|Long|Double|Float|Boolean|Char|Byte|Short|Unit|Nothing|Any|List|Map|Set|Optional|Stream|CompletableFuture|Object|Array|Duration|Instant|Route|Delivery|Driver)\b/g, className: 'hl-type' },
    // Numbers
    { pattern: /\b\d+\.?\d*[fFdDlL]?\b/g, className: 'hl-number' },
  ];

  transform(code: string): SafeHtml {
    if (!code) return '';

    let result = this.escapeHtml(code);

    // Apply highlighting rules in order (first match wins per character)
    for (const rule of this.rules) {
      result = result.replace(rule.pattern, (match) =>
        `<span class="${rule.className}">${match}</span>`
      );
    }

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
