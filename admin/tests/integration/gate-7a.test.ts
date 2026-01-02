import { describe, it, expect } from 'vitest';
import { getPublishableComponents } from '../../src/lib/export/utils';
import { generateLLMSTxt } from '../../src/lib/export/llmsGenerator';

describe('Gate 7A - Export Foundation', () => {
  it('filters publishable components', () => {
    const result = getPublishableComponents([
      { status: 'published', jsx_code: 'code' },
      { status: 'pending', jsx_code: 'code' },
      { status: 'published', jsx_code: '' },
    ] as any);
    expect(result).toHaveLength(1);
  });

  it('generates LLMS.txt with package name', () => {
    const result = generateLLMSTxt([], { packageName: '@test/ds', version: '1.0.0' });
    expect(result).toContain('@test/ds');
    expect(result).toContain('Quick Start');
  });
});

