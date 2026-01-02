import { describe, it, expect } from 'vitest';
import { generateCursorRules } from '../../src/lib/aiExport/cursorRules';
import { generateClaudeMd } from '../../src/lib/aiExport/claudeCode';
import { generateProjectKnowledge } from '../../src/lib/aiExport/projectKnowledge';

const bundle = {
  tokens: [],
  components: [],
  themes: ['default'],
  metadata: { packageName: '@test/ds', version: '1.0.0', exportedAt: '' }
};

describe('Gate 8A - AI Export Generators', () => {
  it('cursor rules has frontmatter', () => {
    const result = generateCursorRules(bundle as any);
    expect(result).toMatch(/^---/);
    expect(result).toContain('@test/ds');
  });

  it('claude md has project context', () => {
    const result = generateClaudeMd(bundle as any);
    expect(result).toContain('Project Context');
  });

  it('project knowledge under 3KB', () => {
    const result = generateProjectKnowledge(bundle as any);
    expect(result.length).toBeLessThan(3000);
  });
});

