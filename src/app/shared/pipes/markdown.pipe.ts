import { Pipe, PipeTransform } from '@angular/core';
import hljs from 'highlight.js/lib/common';

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

  transform(value: string | null | undefined): string {
    if (!value) return '';

    let html = value;

    // If already contains HTML block elements, return as-is (already formatted)
    if (/<(table|div|section|pre|ul|ol|h[1-6])\b/i.test(html)) {
      // Still process markdown tables if mixed content
      html = this.convertMarkdownTables(html);
      html = this.normalizeBulletLists(html);
      // Rich authored layouts can contain nested cards. Do not try to split
      // nested div/section trees with regular expressions; retain their DOM
      // structure and only upgrade any code snippets they contain.
      if (/<(div|section)\b/i.test(html)) {
        return this.enhanceCodeBlocks(html);
      }
      // Theory content commonly mixes authored HTML blocks (such as <pre>)
      // with plain prose and bullet characters. Format the prose around those
      // blocks too, otherwise browser whitespace collapsing makes it look like
      // one dense paragraph.
      return this.enhanceCodeBlocks(this.formatMixedHtml(html));
    }

    // Markdown tables: | col | col |
    html = this.convertMarkdownTables(html);

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

    // Format prose fragments independently. Protecting lists is essential:
    // adding <br> between <li> elements produces the large empty gaps seen
    // in the Learn view and makes a list look like loose plain text.
    const parts = html.split(/(<(?:pre|table|ul|ol)[\s\S]*?<\/(?:pre|table|ul|ol)>)/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) return part;
      const prose = part.trim();
      if (!prose) return '';
      return prose
        .split(/\n\s*\n+/)
        .filter(Boolean)
        .map(paragraph => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
        .join('');
    }).join('');
  }

  /**
   * Convert Markdown tables (| col | col |) to HTML <table>.
   */
  private convertMarkdownTables(html: string): string {
    // Match consecutive lines that start with |
    return html.replace(/((?:^\|.+\|$\n?)+)/gm, (tableBlock) => {
      const lines = tableBlock.trim().split('\n').filter(l => l.trim());
      if (lines.length < 2) return tableBlock; // Need at least header + separator

      // Check if second line is separator (|---|---|)
      const isSeparator = (line: string) => /^\|[\s\-:]+\|/.test(line.trim());
      const hasSeparator = lines.length >= 2 && isSeparator(lines[1]);

      const parseRow = (line: string): string[] =>
        line.split('|').slice(1, -1).map(cell => cell.trim());

      let tableHtml = '<table>';

      if (hasSeparator) {
        // Header row
        const headers = parseRow(lines[0]);
        tableHtml += '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>';

        // Body rows (skip separator line)
        tableHtml += '<tbody>';
        for (let i = 2; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cells = parseRow(lines[i]);
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
        tableHtml += '</tbody>';
      } else {
        // No separator — all rows are body
        tableHtml += '<tbody>';
        for (const line of lines) {
          const cells = parseRow(line);
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
        tableHtml += '</tbody>';
      }

      tableHtml += '</table>';
      return tableHtml;
    });
  }

  /** Formats text fragments while preserving authored HTML blocks. */
  private formatMixedHtml(html: string): string {
    const blockPattern = /(<(?:table|div|section|pre|ul|ol|h[1-6])\b[\s\S]*?<\/(?:table|div|section|pre|ul|ol|h[1-6])>)/gi;
    return html
      .split(blockPattern)
      .map((part, index) => index % 2 === 1 ? part : this.formatTextFragment(part))
      .join('');
  }

  /** Converts authored • / - lists even when they live inside a rich HTML card. */
  private normalizeBulletLists(html: string): string {
    const protectedBlocks = html.split(/(<pre[\s\S]*?<\/pre>)/gi);
    return protectedBlocks.map((part, index) => {
      if (index % 2 === 1) return part;
      return part.replace(/(^|\n)((?:[•-]\s+[^\n]+(?:\n|$))+)/gm, (_match, prefix, block) => {
        const items = block.trim().split('\n')
          .map((line: string) => line.replace(/^[•-]\s+/, '').trim())
          .filter(Boolean)
          .map((item: string) => `<li>${item}</li>`)
          .join('');
        return `${prefix}<ul>${items}</ul>`;
      });
    }).join('');
  }

  private formatTextFragment(text: string): string {
    let html = text.trim();
    if (!html) return '';

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');

    const listPattern = /(<ul>[\s\S]*?<\/ul>)/g;
    return html
      .split(listPattern)
      .map((part, index) => {
        if (index % 2 === 1) return part;
        const prose = part.trim();
        if (!prose) return '';
        return prose
          .split(/\n\s*\n+/)
          .filter(Boolean)
          .map(paragraph => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
          .join('');
      })
      .join('');
  }

  /** Gives authored Learn-tab <pre><code> snippets the same IDE shell as app-code-block. */
  private enhanceCodeBlocks(html: string): string {
    return html.replace(/<pre(?:\s[^>]*)?>\s*<code(?:\s[^>]*)?>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (_match, code) => `<section class="code-block code-block--static" aria-label="Code example">
        <header class="code-block__toolbar">
          <div class="code-block__window-controls" aria-hidden="true"><i></i><i></i><i></i></div>
          <span class="code-block__file">⌘ code</span>
        </header>
        <pre class="code-block__pre"><code class="hljs">${this.highlightCode(code.trim())}</code></pre>
      </section>`
    );
  }

  private highlightCode(code: string): string {
    // Highlight.js tokenizes the original source before emitting HTML. This
    // avoids matching strings inside the spans generated by an earlier rule.
    return hljs.highlightAuto(code).value;
  }
}
