import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom Pipe — transforms plain code text into syntax-highlighted HTML.
 * Lightweight regex-based highlighting (no heavy library needed for display).
 *
 * Demonstrates: Custom Pipe, pure transform, security consideration.
 */
@Pipe({
  name: 'syntaxHighlight',
  standalone: true,
  pure: true // Only re-runs when input reference changes
})
export class SyntaxHighlightPipe implements PipeTransform {

  private readonly rules: Array<{ pattern: RegExp; className: string }> = [
    // Java/Kotlin keywords
    { pattern: /\b(public|private|protected|class|interface|abstract|static|final|void|return|new|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|extends|implements|super|this|null|true|false|var|val|fun|suspend|sealed|data|object|companion|override|open|enum|record|sealed|permits|instanceof|yield)\b/g, className: 'hl-keyword' },
    // Types
    { pattern: /\b(String|int|long|double|float|boolean|char|byte|short|Integer|Long|Double|Float|Boolean|List|Map|Set|Optional|Stream|CompletableFuture|void|Object|Array|Consumer|Supplier|Function|Predicate)\b/g, className: 'hl-type' },
    // Annotations
    { pattern: /@\w+/g, className: 'hl-annotation' },
    // Strings
    { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: 'hl-string' },
    // Numbers
    { pattern: /\b\d+\.?\d*[fFdDlL]?\b/g, className: 'hl-number' },
    // Comments (single line)
    { pattern: /\/\/.*/g, className: 'hl-comment' },
    // Comments (multi line — simplified)
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'hl-comment' },
  ];

  transform(code: string): string {
    if (!code) return '';

    let result = this.escapeHtml(code);

    // Apply highlighting rules in order
    for (const rule of this.rules) {
      result = result.replace(rule.pattern, `<span class="${rule.className}">$&</span>`);
    }

    return result;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
