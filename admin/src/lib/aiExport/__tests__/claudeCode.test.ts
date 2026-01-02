import { describe, it, expect } from 'vitest';
import { generateClaudeMd, generateClaudeTokensRule, CLAUDE_CODE_PATHS } from '../claudeCode';
import type { AIExportBundle, DesignToken } from '../types';

function createMockBundle(overrides: Partial<AIExportBundle> = {}): AIExportBundle {
  return {
    tokens: [],
    components: [],
    themes: [],
    metadata: {
      packageName: '@acme/design-system',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

function createMockToken(overrides: Partial<DesignToken> = {}): DesignToken {
  return {
    path: 'color.bg.primary',
    name: 'primary',
    category: 'color',
    type: 'color',
    value: '#657E79',
    cssVar: '--color-bg-primary',
    ...overrides,
  };
}

describe('claudeCode', () => {
  describe('generateClaudeMd', () => {
    it('includes project context with token and component counts', () => {
      const bundle = createMockBundle({
        tokens: [createMockToken(), createMockToken({ name: 'secondary' })],
        components: [
          { name: 'Button', slug: 'button', status: 'published' },
          { name: 'Card', slug: 'card', status: 'published' },
          { name: 'Modal', slug: 'modal', status: 'pending' },
        ],
      });

      const result = generateClaudeMd(bundle);

      expect(result).toContain('# Project Context');
      expect(result).toContain('2 tokens');
      expect(result).toContain('2 components'); // only published count
    });

    it('includes package name from bundle metadata', () => {
      const bundle = createMockBundle();
      const result = generateClaudeMd(bundle);

      expect(result).toContain('## Design System: @acme/design-system');
    });

    it('uses custom package name from options', () => {
      const bundle = createMockBundle();
      const result = generateClaudeMd(bundle, { packageName: '@custom/pkg' });

      expect(result).toContain('## Design System: @custom/pkg');
      expect(result).toContain("import '@custom/pkg/dist/tokens.css'");
    });

    it('includes setup section with import statement', () => {
      const bundle = createMockBundle();
      const result = generateClaudeMd(bundle);

      expect(result).toContain('### Setup');
      expect(result).toContain("import '@acme/design-system/dist/tokens.css'");
    });

    it('lists themes or defaults to "default"', () => {
      const bundleNoThemes = createMockBundle({ themes: [] });
      const resultDefault = generateClaudeMd(bundleNoThemes);
      expect(resultDefault).toContain('- `default`');

      const bundleWithThemes = createMockBundle({ themes: ['light', 'dark', 'high-contrast'] });
      const resultThemes = generateClaudeMd(bundleWithThemes);
      expect(resultThemes).toContain('- `light`');
      expect(resultThemes).toContain('- `dark`');
      expect(resultThemes).toContain('- `high-contrast`');
    });

    it('includes reference to tokens rule file', () => {
      const bundle = createMockBundle();
      const result = generateClaudeMd(bundle);

      expect(result).toContain('See @.claude/rules/tokens.md');
    });

    it('includes rules section with CSS variable guidance', () => {
      const bundle = createMockBundle();
      const result = generateClaudeMd(bundle);

      expect(result).toContain('## Rules');
      expect(result).toContain('✅ Use CSS variables');
      expect(result).toContain('var(--color-btn-primary-bg)');
      expect(result).toContain('❌ Never hardcode colors');
    });

    it('uses first theme in html className example', () => {
      const bundle = createMockBundle({ themes: ['dark', 'light'] });
      const result = generateClaudeMd(bundle);

      expect(result).toContain('<html className="dark">');
    });
  });

  describe('generateClaudeTokensRule', () => {
    it('includes frontmatter with paths', () => {
      const bundle = createMockBundle();
      const result = generateClaudeTokensRule(bundle);

      expect(result).toContain('---');
      expect(result).toContain('paths: ["src/**/*.tsx", "src/**/*.jsx"]');
    });

    it('includes Token Reference heading', () => {
      const bundle = createMockBundle();
      const result = generateClaudeTokensRule(bundle);

      expect(result).toContain('# Token Reference');
    });

    it('groups colors by Backgrounds, Text, and Buttons sections', () => {
      const bundle = createMockBundle({
        tokens: [
          createMockToken({ cssVar: '--color-bg-primary', value: '#111' }),
          createMockToken({ cssVar: '--color-bg-secondary', value: '#222' }),
          createMockToken({ cssVar: '--color-fg-heading', value: '#333' }),
          createMockToken({ cssVar: '--color-btn-primary', value: '#444' }),
        ],
      });

      const result = generateClaudeTokensRule(bundle);

      expect(result).toContain('### Backgrounds');
      expect(result).toContain('### Text');
      expect(result).toContain('### Buttons');
      expect(result).toContain('`--color-bg-primary`: `#111`');
      expect(result).toContain('`--color-fg-heading`: `#333`');
      expect(result).toContain('`--color-btn-primary`: `#444`');
    });

    it('includes Typography section', () => {
      const bundle = createMockBundle({
        tokens: [
          createMockToken({
            path: 'typography.font-size.lg',
            name: 'lg',
            category: 'typography',
            type: 'string',
            value: '24px',
            cssVar: '--typography-font-size-lg',
          }),
        ],
      });

      const result = generateClaudeTokensRule(bundle);

      expect(result).toContain('## Typography');
      expect(result).toContain('`--typography-font-size-lg`: `24px`');
    });

    it('shows "None" for empty token categories', () => {
      const bundle = createMockBundle({ tokens: [] });
      const result = generateClaudeTokensRule(bundle);

      expect(result).toContain('None');
    });

    it('limits tokens to 8 per category', () => {
      const manyBgTokens = Array.from({ length: 15 }, (_, i) =>
        createMockToken({
          cssVar: `--color-bg-color${i}`,
          value: `#${i.toString().padStart(6, '0')}`,
        })
      );

      const bundle = createMockBundle({ tokens: manyBgTokens });
      const result = generateClaudeTokensRule(bundle);

      // Should only have 8 tokens listed in the backgrounds section
      const bgMatches = result.match(/--color-bg-color\d+/g) || [];
      expect(bgMatches.length).toBe(8);
    });
  });

  describe('CLAUDE_CODE_PATHS', () => {
    it('exports correct file paths', () => {
      expect(CLAUDE_CODE_PATHS.main).toBe('CLAUDE.md');
      expect(CLAUDE_CODE_PATHS.tokens).toBe('.claude/rules/tokens.md');
    });
  });
});

