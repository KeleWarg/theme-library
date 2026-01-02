import { describe, it, expect } from 'vitest';
import { generateCursorRules, CURSOR_RULES_PATH } from '../cursorRules';
import type { AIExportBundle } from '../types';

describe('generateCursorRules', () => {
  const mockBundle: AIExportBundle = {
    tokens: [
      { path: 'color.bg.white', name: 'white', category: 'color', type: 'color', value: '#FFFFFF', cssVar: '--color-bg-white' },
      { path: 'color.bg.gray', name: 'gray', category: 'color', type: 'color', value: '#F5F5F5', cssVar: '--color-bg-gray' },
      { path: 'color.fg.primary', name: 'primary', category: 'color', type: 'color', value: '#1A1A1A', cssVar: '--color-fg-primary' },
      { path: 'color.fg.secondary', name: 'secondary', category: 'color', type: 'color', value: '#666666', cssVar: '--color-fg-secondary' },
      { path: 'color.btn.primary-bg', name: 'primary-bg', category: 'color', type: 'color', value: '#657E79', cssVar: '--color-btn-primary-bg' },
      { path: 'color.btn.primary-fg', name: 'primary-fg', category: 'color', type: 'color', value: '#FFFFFF', cssVar: '--color-btn-primary-fg' },
      { path: 'typography.font-size.body', name: 'body', category: 'typography', type: 'number', value: 16, cssVar: '--typography-font-size-body' },
    ],
    components: [
      { name: 'Button', slug: 'button', description: 'A button component' },
    ],
    themes: ['health-sem', 'home-sem', 'llm'],
    metadata: {
      packageName: '@design-system/tokens',
      version: '1.0.0',
      exportedAt: '2025-01-01T00:00:00.000Z',
    },
  };

  it('output starts with frontmatter', () => {
    const result = generateCursorRules(mockBundle);
    
    expect(result.startsWith('---\n')).toBe(true);
    expect(result).toContain('description: Design system rules');
    expect(result).toContain('globs: ["src/**/*.tsx", "src/**/*.jsx", "src/**/*.css"]');
    expect(result).toContain('alwaysApply: false');
    expect(result).toContain('---\n\n#'); // Frontmatter ends before heading
  });

  it('includes themes', () => {
    const result = generateCursorRules(mockBundle);
    
    expect(result).toContain('## Themes');
    expect(result).toContain('`health-sem`');
    expect(result).toContain('`home-sem`');
    expect(result).toContain('`llm`');
  });

  it('includes token references', () => {
    const result = generateCursorRules(mockBundle);
    
    expect(result).toContain('## Colors');
    expect(result).toContain('**Backgrounds:**');
    expect(result).toContain('`--color-bg-white`');
    expect(result).toContain('**Text:**');
    expect(result).toContain('`--color-fg-primary`');
    expect(result).toContain('**Buttons:**');
    expect(result).toContain('`--color-btn-primary-bg`');
  });

  it('includes setup instructions with first theme', () => {
    const result = generateCursorRules(mockBundle);
    
    expect(result).toContain('## Setup');
    expect(result).toContain(`import '@design-system/tokens/dist/tokens.css'`);
    expect(result).toContain('className="health-sem"');
  });

  it('includes rules section', () => {
    const result = generateCursorRules(mockBundle);
    
    expect(result).toContain('## Rules');
    expect(result).toContain('✅ Use CSS variables');
    expect(result).toContain('❌ Never hardcode colors');
  });

  it('uses custom package name from options', () => {
    const result = generateCursorRules(mockBundle, { packageName: '@acme/design-tokens' });
    
    expect(result).toContain('Design System: @acme/design-tokens');
    expect(result).toContain(`import '@acme/design-tokens/dist/tokens.css'`);
  });

  it('handles empty themes array', () => {
    const emptyThemesBundle: AIExportBundle = {
      ...mockBundle,
      themes: [],
    };
    
    const result = generateCursorRules(emptyThemesBundle);
    
    expect(result).toContain('`default`');
    expect(result).toContain('className="default"');
  });

  it('handles empty tokens', () => {
    const emptyTokensBundle: AIExportBundle = {
      ...mockBundle,
      tokens: [],
    };
    
    const result = generateCursorRules(emptyTokensBundle);
    
    expect(result).toContain('**Backgrounds:** None');
    expect(result).toContain('**Text:** None');
    expect(result).toContain('**Buttons:** None');
  });

  it('limits token list to 5 items', () => {
    const manyTokensBundle: AIExportBundle = {
      ...mockBundle,
      tokens: [
        { path: 'color.bg.1', name: '1', category: 'color', type: 'color', value: '#111', cssVar: '--color-bg-1' },
        { path: 'color.bg.2', name: '2', category: 'color', type: 'color', value: '#222', cssVar: '--color-bg-2' },
        { path: 'color.bg.3', name: '3', category: 'color', type: 'color', value: '#333', cssVar: '--color-bg-3' },
        { path: 'color.bg.4', name: '4', category: 'color', type: 'color', value: '#444', cssVar: '--color-bg-4' },
        { path: 'color.bg.5', name: '5', category: 'color', type: 'color', value: '#555', cssVar: '--color-bg-5' },
        { path: 'color.bg.6', name: '6', category: 'color', type: 'color', value: '#666', cssVar: '--color-bg-6' },
        { path: 'color.bg.7', name: '7', category: 'color', type: 'color', value: '#777', cssVar: '--color-bg-7' },
      ],
    };
    
    const result = generateCursorRules(manyTokensBundle);
    
    // Should contain first 5 but not 6th or 7th
    expect(result).toContain('`--color-bg-1`');
    expect(result).toContain('`--color-bg-5`');
    expect(result).not.toContain('`--color-bg-6`');
    expect(result).not.toContain('`--color-bg-7`');
  });
});

describe('CURSOR_RULES_PATH', () => {
  it('exports correct path constant', () => {
    expect(CURSOR_RULES_PATH).toBe('.cursor/rules/design-system.mdc');
  });
});

