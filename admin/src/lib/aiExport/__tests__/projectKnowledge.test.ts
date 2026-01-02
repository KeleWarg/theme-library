import { describe, it, expect } from 'vitest';
import { generateProjectKnowledge, PASTE_INSTRUCTIONS } from '../projectKnowledge';
import type { AIExportBundle, DesignToken } from '../types';

function createMockBundle(overrides: Partial<AIExportBundle> = {}): AIExportBundle {
  return {
    tokens: [],
    components: [],
    themes: ['health-sem', 'home-sem'],
    metadata: {
      packageName: '@company/design-system',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

function createMockToken(overrides: Partial<DesignToken> = {}): DesignToken {
  return {
    path: 'color.btn.primary-bg',
    name: 'primary-bg',
    category: 'color',
    type: 'color',
    value: '#657E79',
    cssVar: '--color-btn-primary-bg',
    ...overrides,
  };
}

describe('generateProjectKnowledge', () => {
  it('generates valid project knowledge content', () => {
    const bundle = createMockBundle();
    const result = generateProjectKnowledge(bundle);

    expect(result).toContain('# Design System: @company/design-system');
    expect(result).toContain("import '@company/design-system/dist/tokens.css'");
    expect(result).toContain('className="health-sem"');
  });

  it('output is under 3KB', () => {
    const tokens: DesignToken[] = [];
    // Create 50 tokens to test size limits
    for (let i = 0; i < 50; i++) {
      tokens.push(createMockToken({
        path: `color.category-${i}.token-${i}`,
        name: `token-${i}`,
        cssVar: `--color-category-${i}-token-${i}`,
        value: `#${i.toString(16).padStart(6, '0')}`,
      }));
    }

    const bundle = createMockBundle({ tokens });
    const result = generateProjectKnowledge(bundle);

    const sizeInBytes = new TextEncoder().encode(result).length;
    expect(sizeInBytes).toBeLessThan(3 * 1024); // 3KB
  });

  it('includes essential tokens by category', () => {
    const tokens: DesignToken[] = [
      createMockToken({ cssVar: '--color-bg-white', name: 'white', path: 'color.bg.white' }),
      createMockToken({ cssVar: '--color-bg-primary', name: 'primary', path: 'color.bg.primary' }),
      createMockToken({ cssVar: '--color-fg-heading', name: 'heading', path: 'color.fg.heading' }),
      createMockToken({ cssVar: '--color-fg-body', name: 'body', path: 'color.fg.body' }),
      createMockToken({ cssVar: '--color-btn-primary-bg', name: 'primary-bg', path: 'color.btn.primary-bg' }),
      createMockToken({ cssVar: '--color-btn-secondary-bg', name: 'secondary-bg', path: 'color.btn.secondary-bg' }),
    ];

    const bundle = createMockBundle({ tokens });
    const result = generateProjectKnowledge(bundle);

    // Check backgrounds
    expect(result).toContain('--color-bg-white');
    expect(result).toContain('--color-bg-primary');

    // Check text
    expect(result).toContain('--color-fg-heading');
    expect(result).toContain('--color-fg-body');

    // Check buttons
    expect(result).toContain('--color-btn-primary-bg');
    expect(result).toContain('--color-btn-secondary-bg');
  });

  it('lists all themes', () => {
    const bundle = createMockBundle({
      themes: ['health-sem', 'home-sem', 'llm', 'forbes-media-seo'],
    });
    const result = generateProjectKnowledge(bundle);

    expect(result).toContain('`health-sem`');
    expect(result).toContain('`home-sem`');
    expect(result).toContain('`llm`');
    expect(result).toContain('`forbes-media-seo`');
  });

  it('uses default theme when themes array is empty', () => {
    const bundle = createMockBundle({ themes: [] });
    const result = generateProjectKnowledge(bundle);

    expect(result).toContain('className="default"');
    expect(result).toContain('`default`');
  });

  it('respects custom packageName option', () => {
    const bundle = createMockBundle();
    const result = generateProjectKnowledge(bundle, { packageName: '@custom/tokens' });

    expect(result).toContain('# Design System: @custom/tokens');
    expect(result).toContain("import '@custom/tokens/dist/tokens.css'");
  });

  it('handles bundle with no tokens gracefully', () => {
    const bundle = createMockBundle({ tokens: [] });
    const result = generateProjectKnowledge(bundle);

    expect(result).toContain('**Backgrounds:** None');
    expect(result).toContain('**Text:** None');
    expect(result).toContain('**Buttons:** None');
  });

  it('includes usage rules', () => {
    const bundle = createMockBundle();
    const result = generateProjectKnowledge(bundle);

    expect(result).toContain('## Rules');
    expect(result).toContain('✅ Use CSS variables');
    expect(result).toContain('❌ Never hardcode colors');
  });

  it('limits tokens to 3 per category', () => {
    const tokens: DesignToken[] = [];
    // Create 10 bg tokens
    for (let i = 0; i < 10; i++) {
      tokens.push(createMockToken({
        cssVar: `--color-bg-color${i}`,
        name: `color${i}`,
        path: `color.bg.color${i}`,
      }));
    }

    const bundle = createMockBundle({ tokens });
    const result = generateProjectKnowledge(bundle);

    // Should only show 3 bg tokens
    const bgMatch = result.match(/\*\*Backgrounds:\*\* (.+)/);
    expect(bgMatch).toBeTruthy();
    const bgVars = bgMatch![1].match(/`--color-bg-/g);
    expect(bgVars?.length).toBeLessThanOrEqual(3);
  });
});

describe('PASTE_INSTRUCTIONS', () => {
  it('has instructions for Bolt', () => {
    expect(PASTE_INSTRUCTIONS.bolt).toBe('Project Settings → Project Knowledge → Paste');
  });

  it('has instructions for Lovable', () => {
    expect(PASTE_INSTRUCTIONS.lovable).toBe('Project Settings → Custom Knowledge → Paste');
  });
});

