import { SyntaxHighlightPipe } from './syntax-highlight.pipe';

describe('SyntaxHighlightPipe', () => {
  let pipe: SyntaxHighlightPipe;

  beforeEach(() => {
    pipe = new SyntaxHighlightPipe();
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
    const result = pipe.transform(code);

    // Assert
    expect(result).toContain('hl-keyword');
    expect(result).toContain('public');
    expect(result).toContain('class');
  });

  it('should highlight type names', () => {
    // Arrange
    const code = 'String name = "hello";';

    // Act
    const result = pipe.transform(code);

    // Assert
    expect(result).toContain('hl-type');
  });

  it('should highlight annotations', () => {
    // Arrange
    const code = '@Override public void run() {}';

    // Act
    const result = pipe.transform(code);

    // Assert
    expect(result).toContain('hl-annotation');
  });

  it('should escape HTML entities', () => {
    // Arrange
    const code = 'List<String> items = new ArrayList<>();';

    // Act
    const result = pipe.transform(code);

    // Assert
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).not.toContain('<String>'); // Should be escaped
  });

  it('should highlight numbers', () => {
    // Arrange
    const code = 'int x = 42;';

    // Act
    const result = pipe.transform(code);

    // Assert
    expect(result).toContain('hl-number');
  });

  it('should highlight single-line comments', () => {
    // Arrange
    const code = '// This is a comment\nint x = 1;';

    // Act
    const result = pipe.transform(code);

    // Assert
    expect(result).toContain('hl-comment');
  });
});
