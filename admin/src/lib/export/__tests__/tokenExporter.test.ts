import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTokensCSS, downloadTokensCSS, TokenValue } from '../tokenExporter';

describe('tokenExporter', () => {
  const mockTokens: TokenValue[] = [
    { category: 'Color', name: 'primary', value: '#007bff', cssVar: '--color-primary' },
    { category: 'Color', name: 'secondary', value: '#6c757d', cssVar: '--color-secondary' },
    { category: 'Spacing', name: 'sm', value: '8px', cssVar: '--spacing-sm' },
    { category: 'Spacing', name: 'md', value: '16px', cssVar: '--spacing-md' },
    { category: 'Typography', name: 'font-size-base', value: '16px', cssVar: '--font-size-base' },
  ];

  describe('generateTokensCSS', () => {
    it('generates valid CSS with :root selector by default', () => {
      const css = generateTokensCSS(mockTokens);

      expect(css).toContain(':root {');
      expect(css).toContain('--color-primary: #007bff;');
      expect(css).toContain('--color-secondary: #6c757d;');
      expect(css).toContain('--spacing-sm: 8px;');
      expect(css).toContain('--spacing-md: 16px;');
      expect(css).toContain('--font-size-base: 16px;');
      expect(css).toContain('}');
    });

    it('groups tokens by category with comments', () => {
      const css = generateTokensCSS(mockTokens);

      expect(css).toContain('/* Color */');
      expect(css).toContain('/* Spacing */');
      expect(css).toContain('/* Typography */');
    });

    it('uses theme class selector when provided', () => {
      const css = generateTokensCSS(mockTokens, 'theme-dark');

      expect(css).toContain('.theme-dark {');
      expect(css).not.toContain(':root');
    });

    it('includes generated timestamp in header comment', () => {
      const css = generateTokensCSS(mockTokens);

      expect(css).toMatch(/\/\* Design Tokens - Generated \d{4}-\d{2}-\d{2}T/);
    });

    it('handles empty token array', () => {
      const css = generateTokensCSS([]);

      expect(css).toContain(':root {');
      expect(css).toContain('}');
    });

    it('handles single category', () => {
      const singleCategory: TokenValue[] = [
        { category: 'Color', name: 'red', value: '#ff0000', cssVar: '--color-red' },
        { category: 'Color', name: 'blue', value: '#0000ff', cssVar: '--color-blue' },
      ];
      const css = generateTokensCSS(singleCategory);

      expect(css).toContain('/* Color */');
      expect(css).toContain('--color-red: #ff0000;');
      expect(css).toContain('--color-blue: #0000ff;');
      // Should not have other category comments
      expect(css).not.toContain('/* Spacing */');
    });

    it('preserves token order within categories', () => {
      const css = generateTokensCSS(mockTokens);
      
      // Check that primary comes before secondary within Color section
      const primaryIndex = css.indexOf('--color-primary');
      const secondaryIndex = css.indexOf('--color-secondary');
      expect(primaryIndex).toBeLessThan(secondaryIndex);
    });
  });

  describe('downloadTokensCSS', () => {
    beforeEach(() => {
      // Mock DOM APIs
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });
    });

    it('creates a download link and triggers click', () => {
      const mockClick = vi.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

      downloadTokensCSS(mockTokens);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe('tokens.css');
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('uses custom filename when provided', () => {
      const mockClick = vi.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

      downloadTokensCSS(mockTokens, 'custom-tokens.css');

      expect(mockAnchor.download).toBe('custom-tokens.css');
    });
  });
});

