# Chunk 6.03 — Code Generation Service

## Purpose
API client for Claude code generation with retry logic.

---

## Inputs
- `AI_CONFIG` (from chunk 6.01)
- `buildSystemPrompt`, `buildComponentPrompt`, `parseGenerationResponse` (from chunk 6.02)

## Outputs
- `generateComponentCode()` function (consumed by chunk 6.06)
- `generateWithRetry()` function (consumed by chunk 6.06)
- Re-export `isAIConfigured()` (consumed by chunk 6.04, 6.06)

---

## Dependencies
- Chunk 6.02 must be complete

---

## Implementation Notes

### Key Considerations
- Uses fetch to call Anthropic API directly
- Requires `anthropic-dangerous-direct-browser-access` header for browser use
- Retry logic with exponential backoff

### Gotchas
- Don't retry on auth errors (API key issues)
- Empty response content should throw
- API errors return JSON with `error.message`

### Algorithm/Approach
Standard fetch with error handling. Retry wraps the core function with delay logic.

---

## Files Created
- `src/lib/ai/generateCode.ts` — Generation service
- `src/lib/ai/__tests__/generateCode.test.ts` — Unit tests with mocked fetch

---

## Implementation

### `src/lib/ai/generateCode.ts`

```typescript
import type { GenerationRequest, GenerationResult, ClaudeResponse } from './types';
import { AI_CONFIG, getApiKey, isAIConfigured } from './config';
import { buildSystemPrompt, buildComponentPrompt, parseGenerationResponse } from './promptBuilder';

export { isAIConfigured };

export async function generateComponentCode(
  request: GenerationRequest
): Promise<GenerationResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local');
  }

  const { model, maxTokens, apiEndpoint, apiVersion } = AI_CONFIG;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': apiVersion,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: request.options?.model || model,
      max_tokens: request.options?.maxTokens || maxTokens,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildComponentPrompt(request) }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data: ClaudeResponse = await response.json();
  const text = data.content[0]?.text;

  if (!text) {
    throw new Error('Empty response from API');
  }

  const { jsx_code, props } = parseGenerationResponse(text);

  return {
    jsx_code,
    props,
    tokensUsed: data.usage?.output_tokens,
  };
}

export async function generateWithRetry(
  request: GenerationRequest,
  maxRetries = AI_CONFIG.maxRetries
): Promise<GenerationResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateComponentCode(request);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (lastError.message.includes('API key')) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, AI_CONFIG.retryDelayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
```

---

## Tests

### Unit Tests
- [ ] Throws when API key missing
- [ ] Calls fetch with correct headers
- [ ] Parses successful response
- [ ] Throws on API error response
- [ ] generateWithRetry retries on failure
- [ ] generateWithRetry doesn't retry on auth error

### Verification
- [ ] Mock fetch in tests
- [ ] `npm test src/lib/ai/__tests__/generateCode.test.ts` passes
- [ ] Manual test with real API key (optional)

---

## Time Estimate
2 hours

---

## Notes
- Real API testing requires valid key in `.env.local`
- Consider rate limiting for production use
