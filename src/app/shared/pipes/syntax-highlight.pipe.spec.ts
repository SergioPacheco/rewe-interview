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

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should highlight Java keywords', () => {
    // Arrange
    const code = 'public class Main {}';

    // Act
    const result = pipe.transform(code) as any;
    const html = typeof result === 'string' ? result : result?.changingThisBreaksApplicationSecurity ?? '';

    // Assert
    expect(html).toContain('hl-keyword');
    expect(html).toContain('public');
    expect(html).toContain('class');
  });

  it('should highlight type names', () => {
    // Arrange
    const code = 'String name = "hello";';

    // Act
    const result = pipe.transform(code) as any;
    const html = typeof result === 'string' ? result : result?.changingThisBreaksApplicationSecurity ?? '';

    // Assert
    expect(html).toContain('hl-type');
  });

  it('should highlight annotations', () => {
    // Arrange
    const code = '@Override public void run() {}';

    // Act
    const result = pipe.transform(code) as any;
    const html = typeof result === 'string' ? result : result?.changingThisBreaksApplicationSecurity ?? '';

    // Assert
    expect(html).toContain('hl-annotation');
  });

  it('should escape HTML entities', () => {
    // Arrange
    const code = 'List<String> items = new ArrayList<>();';

    // Act
    const result = pipe.transform(code) as any;
    const html = typeof result === 'string' ? result : result?.changingThisBreaksApplicationSecurity ?? '';

    // Assert
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
  });

  it('should highlight numbers', () => {
    // Arrange
    const code = 'int x = 42;';

    // Act
    const result = pipe.transform(code) as any;
    const html = typeof result === 'string' ? result : result?.changingThisBreaksApplicationSecurity ?? '';

    // Assert
    expect(html).toContain('hl-number');
  });

  it('should highlight single-line comments', () => {
    // Arrange
    const code = '// This is a comment\nint x = 1;';

    // Act
    const result = pipe.transform(code) as any;
    const html = typeof result === 'string' ? result : result?.changingThisBreaksApplicationSecurity ?? '';

    // Assert
    expect(html).toContain('hl-comment');
  });
});
