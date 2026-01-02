import { describe, it, expect } from 'vitest';
import { parseFigmaTokens, groupByCategory, filterTokens, getEssentialTokens } from '../tokenUtils';
import type { DesignToken } from '../types';

describe('tokenUtils', () => {
  describe('parseFigmaTokens', () => {
    it('extracts tokens from nested JSON', () => {
      const figmaJson = {
        Color: {
          Button: {
            Primary: {
              'primary-bg': {
                $type: 'color',
                $value: { hex: '#657E79' },
              },
            },
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        name: 'primary-bg',
        category: 'color',
        type: 'color',
        value: '#657E79',
      });
      expect(tokens[0].cssVar).toContain('--color-');
    });

    it('handles multiple nested tokens', () => {
      const figmaJson = {
        Color: {
          Bg: {
            white: {
              $type: 'color',
              $value: { hex: '#FFFFFF' },
            },
            black: {
              $type: 'color',
              $value: { hex: '#000000' },
            },
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson);

      expect(tokens).toHaveLength(2);
      expect(tokens.map(t => t.name)).toContain('white');
      expect(tokens.map(t => t.name)).toContain('black');
    });

    it('assigns theme when provided', () => {
      const figmaJson = {
        Color: {
          primary: {
            $type: 'color',
            $value: { hex: '#FF0000' },
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson, 'health-sem');

      expect(tokens[0].theme).toBe('health-sem');
    });

    it('handles color values with components array', () => {
      const figmaJson = {
        Color: {
          test: {
            $type: 'color',
            $value: {
              components: [1, 0, 0], // Full red in 0-1 range
            },
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].value).toBe('#FF0000');
    });

    it('skips $extensions keys', () => {
      const figmaJson = {
        Color: {
          primary: {
            $type: 'color',
            $value: { hex: '#FF0000' },
          },
          $extensions: {
            'some-extension': 'value',
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].name).toBe('primary');
    });

    it('handles non-color tokens', () => {
      const figmaJson = {
        'Font Size': {
          'heading-lg': {
            $type: 'number',
            $value: 24,
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        name: 'heading-lg',
        category: 'typography',
        type: 'number',
        value: 24,
      });
    });

    it('returns empty array for invalid color values', () => {
      const figmaJson = {
        Color: {
          broken: {
            $type: 'color',
            $value: {}, // No hex or components
          },
        },
      };

      const tokens = parseFigmaTokens(figmaJson);

      expect(tokens).toHaveLength(0);
    });
  });

  describe('groupByCategory', () => {
    it('groups tokens by category correctly', () => {
      const tokens: DesignToken[] = [
        { path: 'color.primary', name: 'primary', category: 'color', type: 'color', value: '#FF0000', cssVar: '--color-primary' },
        { path: 'color.secondary', name: 'secondary', category: 'color', type: 'color', value: '#00FF00', cssVar: '--color-secondary' },
        { path: 'spacing.sm', name: 'sm', category: 'spacing', type: 'number', value: 8, cssVar: '--spacing-sm' },
        { path: 'typography.body', name: 'body', category: 'typography', type: 'number', value: 16, cssVar: '--typography-body' },
      ];

      const grouped = groupByCategory(tokens);

      expect(grouped.color).toHaveLength(2);
      expect(grouped.spacing).toHaveLength(1);
      expect(grouped.typography).toHaveLength(1);
    });

    it('handles empty token array', () => {
      const grouped = groupByCategory([]);

      expect(grouped).toEqual({});
    });

    it('creates new category arrays as needed', () => {
      const tokens: DesignToken[] = [
        { path: 'other.custom', name: 'custom', category: 'other', type: 'string', value: 'test', cssVar: '--other-custom' },
      ];

      const grouped = groupByCategory(tokens);

      expect(grouped.other).toHaveLength(1);
      expect(grouped.color).toBeUndefined();
    });
  });

  describe('filterTokens', () => {
    const tokens: DesignToken[] = [
      { path: 'color.btn.primary', name: 'primary', category: 'color', type: 'color', value: '#FF0000', cssVar: '--color-btn-primary' },
      { path: 'color.btn.secondary', name: 'secondary', category: 'color', type: 'color', value: '#00FF00', cssVar: '--color-btn-secondary' },
      { path: 'color.bg.white', name: 'white', category: 'color', type: 'color', value: '#FFFFFF', cssVar: '--color-bg-white' },
    ];

    it('filters tokens by pattern', () => {
      const filtered = filterTokens(tokens, 'btn');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => t.cssVar.includes('btn'))).toBe(true);
    });

    it('returns empty array when no matches', () => {
      const filtered = filterTokens(tokens, 'nonexistent');

      expect(filtered).toHaveLength(0);
    });

    it('returns all tokens when pattern matches all', () => {
      const filtered = filterTokens(tokens, 'color');

      expect(filtered).toHaveLength(3);
    });
  });

  describe('getEssentialTokens', () => {
    const tokens: DesignToken[] = [
      { path: 'color.1', name: '1', category: 'color', type: 'color', value: '#1', cssVar: '--color-1' },
      { path: 'color.2', name: '2', category: 'color', type: 'color', value: '#2', cssVar: '--color-2' },
      { path: 'color.3', name: '3', category: 'color', type: 'color', value: '#3', cssVar: '--color-3' },
      { path: 'spacing.1', name: '1', category: 'spacing', type: 'number', value: 4, cssVar: '--spacing-1' },
      { path: 'spacing.2', name: '2', category: 'spacing', type: 'number', value: 8, cssVar: '--spacing-2' },
    ];

    it('filters by category and respects limit', () => {
      const essential = getEssentialTokens(tokens, 'color', 2);

      expect(essential).toHaveLength(2);
      expect(essential.every(t => t.category === 'color')).toBe(true);
    });

    it('returns all tokens in category if under limit', () => {
      const essential = getEssentialTokens(tokens, 'spacing', 10);

      expect(essential).toHaveLength(2);
    });

    it('uses default limit of 10', () => {
      const manyTokens: DesignToken[] = Array.from({ length: 15 }, (_, i) => ({
        path: `color.${i}`,
        name: `${i}`,
        category: 'color' as const,
        type: 'color' as const,
        value: `#${i}`,
        cssVar: `--color-${i}`,
      }));

      const essential = getEssentialTokens(manyTokens, 'color');

      expect(essential).toHaveLength(10);
    });

    it('returns empty array for non-existent category', () => {
      const essential = getEssentialTokens(tokens, 'shadow');

      expect(essential).toHaveLength(0);
    });
  });
});

