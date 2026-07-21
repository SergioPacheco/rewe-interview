import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const pipe = new MarkdownPipe();

  it('renders paragraphs, headings, and both list types as separate blocks', () => {
    const html = pipe.transform([
      '# Explanation',
      '',
      'First paragraph.',
      '',
      '- First point',
      '- Second point',
      '',
      '1. First step',
      '2. Second step'
    ].join('\n'));

    expect(html).toContain('<h3>Explanation</h3>');
    expect(html).toContain('<p>First paragraph.</p>');
    expect(html).toContain('<ul><li>First point</li><li>Second point</li></ul>');
    expect(html).toContain('<ol><li>First step</li><li>Second step</li></ol>');
  });

  it('does not parse list markers inside fenced code', () => {
    const html = pipe.transform('```text\n- literal code line\n```');

    expect(html).toContain('<pre class="reveal-code">');
    expect(html).toContain('- literal');
    expect(html).not.toContain('<ul>');
  });
});
