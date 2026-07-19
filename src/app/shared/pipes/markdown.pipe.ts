import { Pipe, PipeTransform } from '@angular/core';

/**
 * Converts basic Markdown to HTML for rendering in [innerHTML].
 *
 * Supports:
 * - **bold** → <strong>
 * - `inline code` → <code>
 * - ```code blocks``` → <pre><code> with syntax highlighting
 * - - bullet lists → <ul><li>
 * - Headings ## → <h4>
 * - Line breaks
 */
@Pipe({
  name: 'markdown',
  standalone: true,
  pure: true
})
export class MarkdownPipe implements PipeTransform {

  private readonly highlightRules: Array<{ pattern: RegExp; className: string }> = [
    { pattern: /\b(public|private|protected|class|interface|abstract|static|final|void|return|new|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|extends|implements|super|this|null|true|false|var|val|fun|suspend|sealed|data|object|companion|override|open|enum|record|permits|instanceof|yield)\b/g, className: 'hl-keyword' },
    { pattern: /\b(String|int|long|double|float|boolean|char|byte|short|Integer|Long|Double|Float|Boolean|List|Map|Set|Optional|Stream|CompletableFuture|void|Object|Array|Consumer|Supplier|Function|Predicate)\b/g, className: 'hl-type' },
    { pattern: /@\w+/g, className: 'hl-annotation' },
    { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: 'hl-string' },
    { pattern: /\b\d+\.?\d*[fFdDlL]?\b/g, className: 'hl-number' },
    { pattern: /\/\/.*/g, className: 'hl-comment' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'hl-comment' },
  ];

  transform(value: string | null | undefined): string {
    if (!value) return '';

    let html = value;

    // Fenced code blocks: ```...```
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
      const highlighted = this.highlightCode(code.trim());
      return `<pre class="reveal-code"><code>${highlighted}</code></pre>`;
    });

    // Inline code: `...`
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold: **...**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic: *...*
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Headings: ## ... (at start of line)
    html = html.replace(/^###\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^##\s+(.+)$/gm, '<h4>$1</h4>');

    // Bullet lists: lines starting with - or •
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Numbered lists: lines starting with 1. 2. etc
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // Line breaks: double newline = paragraph break, single = <br>
    // First, protect <pre> blocks
    const parts = html.split(/(<pre[\s\S]*?<\/pre>)/g);
    html = parts.map((part, i) => {
      if (i % 2 === 1) return part; // Inside <pre>, leave as-is
      // Double newlines → paragraph separator
      part = part.replace(/\n\n+/g, '</p><p>');
      // Single newlines → <br>
      part = part.replace(/\n/g, '<br>');
      return part;
    }).join('');

    // Wrap in paragraph if it doesn't start with block element
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<pre') && !html.startsWith('<p')) {
      html = '<p>' + html + '</p>';
    }

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  private highlightCode(code: string): string {
    let result = this.escapeHtml(code);
    for (const rule of this.highlightRules) {
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
