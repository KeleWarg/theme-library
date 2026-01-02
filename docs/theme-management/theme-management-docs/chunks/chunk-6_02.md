# Chunk 6.02 — Prompt Builder

## Purpose
Build structured prompts for Claude API and parse responses.

---

## Inputs
- `ComponentSpec` type (from chunk 6.01)
- `AI_CONFIG.availableTokens` (from chunk 6.01)

## Outputs
- `buildSystemPrompt()` function (consumed by chunk 6.03)
- `buildComponentPrompt()` function (consumed by chunk 6.03)
- `parseGenerationResponse()` function (consumed by chunk 6.03)

---

## Dependencies
- Chunk 6.01 must be complete

---

## Implementation Notes

### Key Considerations
- System prompt establishes AI as React component generator
- Component prompt includes all spec details + token reference
- Response parser extracts JSX and props from markdown code blocks

### Gotchas
- Response format uses triple backticks - regex must handle this
- Props JSON might be missing or malformed - handle gracefully
- Include feedback in prompt when regenerating

### Algorithm/Approach
Template-based prompt construction. Regex-based response parsing with fallbacks.

---

## Files Created
- `src/lib/ai/promptBuilder.ts` — Prompt construction and parsing
- `src/lib/ai/__tests__/promptBuilder.test.ts` — Unit tests

---

## Implementation

### `src/lib/ai/promptBuilder.ts`

```typescript
import type { ComponentSpec, GenerationRequest } from './types';
import { AI_CONFIG } from './config';

export function buildSystemPrompt(): string {
  return `You are a React component generator for a design system.
Generate production-ready React components that:
1. Use CSS variables for ALL styling (never hardcode colors)
2. Support variants via props
3. Are accessible and well-documented
4. Follow React best practices`;
}

export function buildComponentPrompt(request: GenerationRequest): string {
  const { component, feedback } = request;

  return `Generate a React component based on this specification:

## Component: ${component.name}

**Description:** ${component.description || 'No description provided'}

**Variants:**
${formatVariants(component.variants)}

**Figma Properties:**
${formatProperties(component.figma_properties)}

**Linked Tokens:**
${(component.linked_tokens || []).join(', ') || 'None specified'}

${feedback ? `## Feedback on Previous Code\n${feedback}\n` : ''}

## Requirements

1. Create a named export function component
2. Use CSS variables for ALL colors and typography:
${formatAvailableTokens()}
3. Use inline styles with the style prop
4. Support all variants via a "variant" prop
5. Include JSDoc comment describing props

## Output Format

Return ONLY:

\`\`\`jsx
// Component code here
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary", "description": "..."}]
\`\`\``;
}

function formatVariants(variants?: { name: string }[]): string {
  if (!variants?.length) return 'None';
  return variants.map(v => `- ${v.name}`).join('\n');
}

function formatProperties(props?: { name: string; type: string }[]): string {
  if (!props?.length) return 'None';
  return JSON.stringify(props, null, 2);
}

function formatAvailableTokens(): string {
  const t = AI_CONFIG.availableTokens;
  return `- Buttons: ${t.buttonBackgrounds.slice(0, 2).join(', ')}
- Text: ${t.text.join(', ')}
- Backgrounds: ${t.backgrounds.join(', ')}`;
}

export function parseGenerationResponse(text: string): { jsx_code: string; props: any[] } {
  const jsxMatch = text.match(/```jsx\n([\s\S]*?)\n```/);
  const propsMatch = text.match(/```json\n([\s\S]*?)\n```/);

  if (!jsxMatch) {
    throw new Error('Could not parse JSX code from response');
  }

  let props: any[] = [];
  if (propsMatch) {
    try {
      props = JSON.parse(propsMatch[1]);
    } catch {
      console.warn('Could not parse props JSON');
    }
  }

  return { jsx_code: jsxMatch[1].trim(), props };
}
```

---

## Tests

### Unit Tests
- [ ] buildComponentPrompt includes component name
- [ ] buildComponentPrompt includes feedback when provided
- [ ] buildComponentPrompt includes available tokens
- [ ] parseGenerationResponse extracts JSX correctly
- [ ] parseGenerationResponse extracts props array
- [ ] parseGenerationResponse throws on missing JSX

### Verification
- [ ] `npm test src/lib/ai/__tests__/promptBuilder.test.ts` passes

---

## Time Estimate
1.5 hours

---

## Notes
- Prompt format tuned for Claude's response patterns
- Parser is lenient on props (missing = empty array, malformed = warn + empty)
