import { describe, it, expect } from 'vitest';
import { AI_CONFIG } from '../../src/lib/ai/config';
import { buildComponentPrompt, parseGenerationResponse } from '../../src/lib/ai/promptBuilder';

describe('Gate 6A', () => {
  it('config has required fields', () => {
    expect(AI_CONFIG.apiEndpoint).toBeDefined();
    expect(AI_CONFIG.model).toBeDefined();
  });

  it('prompt includes component name', () => {
    const result = buildComponentPrompt({ component: { id: '1', name: 'Button', slug: 'button' } });
    expect(result).toContain('Button');
  });

  it('parser extracts JSX', () => {
    const result = parseGenerationResponse('```jsx\nexport function Button() {}\n```\n```json\n[]\n```');
    expect(result.jsx_code).toContain('Button');
  });
});

