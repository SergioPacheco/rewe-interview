import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SyntaxHighlightPipe } from './syntax-highlight.pipe';

describe('SyntaxHighlightPipe', () => {
  let pipe: SyntaxHighlightPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SyntaxHighlightPipe(sanitizer);
  });

  /** Extract HTML string from SafeHtml */
  function getHtml(result: unknown): string {
    if (typeof result === 'string') return result;
    return (result as any)?.changingThisBreaksApplicationSecurity ?? '';
  }

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should highlight Java keywords', () => {
    const html = getHtml(pipe.transform('public class Main {}'));
    expect(html).toContain('hl-keyword');
    expect(html).toContain('public');
    expect(html).toContain('class');
  });

  it('should highlight type names', () => {
    const html = getHtml(pipe.transform('String name = "hello";'));
    expect(html).toContain('hl-type');
  });

  it('should highlight annotations', () => {
    const html = getHtml(pipe.transform('@Override public void run() {}'));
    expect(html).toContain('hl-annotation');
  });

  it('should escape HTML entities', () => {
    const html = getHtml(pipe.transform('List<String> items = new ArrayList<>();'));
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
  });

  it('should highlight numbers', () => {
    const html = getHtml(pipe.transform('int x = 42;'));
    expect(html).toContain('hl-number');
  });

  it('should highlight single-line comments', () => {
    const html = getHtml(pipe.transform('// This is a comment\nint x = 1;'));
    expect(html).toContain('hl-comment');
  });

  it('should NOT highlight content inside comments as keywords', () => {
    // The critical bug: "public" inside a comment was being highlighted as keyword
    const html = getHtml(pipe.transform('// public class Foo'));
    // The whole thing should be one comment span, not contain a keyword span
    expect(html).toContain('<span class="hl-comment">');
    expect(html).not.toMatch(/<span class="hl-keyword">public<\/span>/);
  });

  it('should NOT highlight content inside strings as keywords', () => {
    const html = getHtml(pipe.transform('String s = "public class";'));
    // "public class" is inside a string — should not be highlighted as keyword
    const stringSpan = html.match(/<span class="hl-string">"public class"<\/span>/);
    expect(stringSpan).toBeTruthy();
  });

  it('should NOT cascade: string regex must not match class attributes', () => {
    // This was the original bug: after producing <span class="hl-comment">
    // the string rule would match "hl-comment" as a string literal.
    // With token-based approach, this cannot happen.
    const code = '@Service\npublic class DeliveryHandler {\n    // Validate\n    String x = "hello";\n}';
    const html = getHtml(pipe.transform(code));

    // Count occurrences of hl-string — should only match the actual string "hello"
    const stringMatches = html.match(/hl-string/g) || [];
    // "hello" is 1 string, so exactly 1 hl-string span
    expect(stringMatches.length).toBe(1);
    expect(html).toContain('<span class="hl-string">"hello"</span>');
  });

  it('should highlight multi-line code without corruption', () => {
    const code = [
      '@Service',
      'public class Handler {',
      '    // Calculate pricing',
      '    BigDecimal price = new BigDecimal("100");',
      '}'
    ].join('\n');
    const html = getHtml(pipe.transform(code));

    // Should contain correct highlight spans
    expect(html).toContain('hl-annotation');
    expect(html).toContain('hl-keyword');
    expect(html).toContain('hl-comment');
    expect(html).toContain('hl-type');
    expect(html).toContain('hl-string');

    // Should NOT contain malformed nested spans
    expect(html).not.toContain('class=class=');
    expect(html).not.toContain('class="hl-string">"hl-');
  });
});
