# Gate Checkpoints — Phases 6-9

## Gate 6A: AI Generation Service

**Trigger:** 6.01 + 6.02 + 6.03 ✅  
**Blocks:** 6.06

```typescript
// tests/integration/gate-6a.test.ts
import { describe, it, expect } from 'vitest';
import { AI_CONFIG } from '../src/lib/ai/config';
import { buildComponentPrompt, parseGenerationResponse } from '../src/lib/ai/promptBuilder';

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
```

---

## Gate 6B: Phase 6 Complete

**Trigger:** Phase 6 ✅  
**Blocks:** Phase 7

```typescript
// tests/integration/gate-6b.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GenerateButton from '../src/components/ui/GenerateButton';

vi.mock('../src/lib/ai/generateCode', () => ({ isAIConfigured: () => true }));

describe('Gate 6B', () => {
  it('button renders', () => {
    render(<GenerateButton onClick={() => {}} />);
    expect(screen.getByText('Generate with AI')).toBeInTheDocument();
  });
});
```

---

## Gate 7A: Export Foundation

**Trigger:** 7.01 + 7.02 + 7.03 ✅  
**Blocks:** 7.05, 7.06

```typescript
// tests/integration/gate-7a.test.ts
import { describe, it, expect } from 'vitest';
import { getPublishableComponents } from '../src/lib/export/utils';
import { generateLLMSTxt } from '../src/lib/export/llmsGenerator';

describe('Gate 7A', () => {
  it('filters publishable', () => {
    const result = getPublishableComponents([
      { status: 'published', jsx_code: 'code' },
      { status: 'pending', jsx_code: 'code' },
    ] as any);
    expect(result).toHaveLength(1);
  });

  it('generates LLMS.txt', () => {
    const result = generateLLMSTxt([], { packageName: '@test/ds', version: '1.0.0' });
    expect(result).toContain('@test/ds');
  });
});
```

---

## Gate 7B: Phase 7 Complete

**Trigger:** Phase 7 ✅  
**Blocks:** Phase 8

```typescript
// tests/integration/gate-7b.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../src/pages/Settings';

vi.mock('../src/hooks/useComponents', () => ({ useComponents: () => ({ components: [], loading: false }) }));
vi.mock('../src/lib/ai/generateCode', () => ({ isAIConfigured: () => true }));

describe('Gate 7B', () => {
  it('settings renders', () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
```

---

## Gate 8A: AI Export Generators

**Trigger:** 8.01 + 8.02 + 8.03 + 8.04 + 8.05 ✅  
**Blocks:** 8.07

```typescript
// tests/integration/gate-8a.test.ts
import { describe, it, expect } from 'vitest';
import { generateCursorRules } from '../src/lib/aiExport/cursorRules';
import { generateProjectKnowledge } from '../src/lib/aiExport/projectKnowledge';

const bundle = { tokens: [], components: [], themes: ['default'], metadata: { packageName: '@test/ds', version: '1.0.0', exportedAt: '' } };

describe('Gate 8A', () => {
  it('cursor rules has frontmatter', () => {
    expect(generateCursorRules(bundle as any)).toMatch(/^---/);
  });

  it('project knowledge under 3KB', () => {
    expect(generateProjectKnowledge(bundle as any).length).toBeLessThan(3000);
  });
});
```

---

## Gate 8B: Phase 8 Complete

**Trigger:** Phase 8 ✅  
**Blocks:** Release

```typescript
// tests/integration/gate-8b.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIExportPanel from '../src/components/AIExportPanel';

const bundle = { tokens: [], components: [], themes: [], metadata: { packageName: '@test/ds', version: '1.0.0', exportedAt: '' } };

describe('Gate 8B', () => {
  it('panel renders formats', () => {
    render(<AIExportPanel bundle={bundle as any} />);
    expect(screen.getByText('Cursor Rules')).toBeInTheDocument();
  });
});
```

---

## Gate 9: Figma Plugin

**Trigger:** Phase 9 ✅  
**Test:** Manual verification in Figma Desktop

### Checklist
- [ ] `npm run build` succeeds
- [ ] Plugin loads in Figma Desktop
- [ ] Collections populate
- [ ] Export creates valid JSON
- [ ] Sync works (with API configured)
