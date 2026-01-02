# Chunk 6.01 — AI Types & Config

## Purpose
Define TypeScript types and configuration for AI code generation.

---

## Inputs
- None (foundation chunk for Phase 6)

## Outputs
- `AIConfig` type (consumed by chunk 6.02, 6.03)
- `ComponentSpec` type (consumed by chunk 6.02, 6.03)
- `GenerationResult` type (consumed by chunk 6.03, 6.06)

---

## Dependencies
- Phase 5 complete ✅

---

## Implementation Notes

### Key Considerations
- All tunable values externalized to config (model, tokens, retry settings)
- Types should match existing component structure from Phase 1-5
- Config checks for API key presence

### Gotchas
- API key comes from `import.meta.env.VITE_ANTHROPIC_API_KEY`
- Don't hardcode model version - keep in config

### Algorithm/Approach
Standard TypeScript type definitions. Config exports constants and helper functions.

---

## Files Created
- `src/lib/ai/types.ts` — Type definitions
- `src/lib/ai/config.ts` — Configuration constants
- `src/lib/ai/__tests__/config.test.ts` — Config tests

---

## Implementation

### `src/lib/ai/types.ts`

```typescript
export interface ComponentSpec {
  id: string;
  name: string;
  slug: string;
  description?: string;
  variants?: { name: string; description?: string }[];
  figma_properties?: { name: string; type: string; defaultValue?: string }[];
  linked_tokens?: string[];
  jsx_code?: string;
  props?: PropDefinition[];
  code_status?: 'pending' | 'generating' | 'generated' | 'approved' | 'published';
}

export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}

export interface GenerationRequest {
  component: ComponentSpec;
  feedback?: string;
  options?: GenerationOptions;
}

export interface GenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationResult {
  jsx_code: string;
  props: PropDefinition[];
  tokensUsed?: number;
}

export interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  usage?: { input_tokens: number; output_tokens: number };
}
```

### `src/lib/ai/config.ts`

```typescript
export const AI_CONFIG = {
  apiEndpoint: 'https://api.anthropic.com/v1/messages',
  apiVersion: '2023-06-01',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.3,
  maxRetries: 2,
  retryDelayMs: 1000,

  availableTokens: {
    buttonBackgrounds: [
      'var(--color-btn-primary-bg)',
      'var(--color-btn-primary-hover)',
      'var(--color-btn-secondary-bg)',
    ],
    buttonText: [
      'var(--color-btn-primary-text)',
      'var(--color-btn-secondary-text)',
    ],
    backgrounds: [
      'var(--color-bg-white)',
      'var(--color-bg-neutral-light)',
      'var(--color-bg-neutral-medium)',
    ],
    text: [
      'var(--color-fg-heading)',
      'var(--color-fg-body)',
      'var(--color-fg-caption)',
    ],
    feedback: [
      'var(--color-fg-feedback-error)',
      'var(--color-fg-feedback-success)',
    ],
  },
} as const;

export function isAIConfigured(): boolean {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
}

export function getApiKey(): string | undefined {
  return import.meta.env.VITE_ANTHROPIC_API_KEY;
}
```

---

## Tests

### Unit Tests
- [ ] AI_CONFIG has required fields (apiEndpoint, model, maxTokens)
- [ ] availableTokens contains button, text, background tokens
- [ ] isAIConfigured returns boolean based on env var

### Verification
- [ ] Types compile without errors
- [ ] Config exports correctly
- [ ] `npm test src/lib/ai/__tests__/config.test.ts` passes

---

## Time Estimate
0.5 hours

---

## Notes
- API key should be added to `.env.local` (not committed)
- Model can be updated as new versions release
