# Chunk 8.05 — Project Knowledge Generator

## Purpose
Condensed format for Bolt/Lovable (~2KB max).

---

## Inputs
- `AIExportBundle` (from chunk 8.01)
- `getEssentialTokens()` (from chunk 8.02)

## Outputs
- `generateProjectKnowledge()` function (consumed by 8.07)

---

## Dependencies
- Chunk 8.02 must be complete

---

## Files Created
- `src/lib/aiExport/projectKnowledge.ts` — Generator

---

## Implementation

### `src/lib/aiExport/projectKnowledge.ts`

```typescript
import type { AIExportBundle, GeneratorOptions } from './types';
import { getEssentialTokens } from './tokenUtils';

export function generateProjectKnowledge(bundle: AIExportBundle, options: GeneratorOptions = {}): string {
  const { packageName = bundle.metadata.packageName } = options;
  const themes = bundle.themes.length > 0 ? bundle.themes : ['default'];
  const colorTokens = getEssentialTokens(bundle.tokens, 'color', 12);

  return `# Design System: ${packageName}

## Setup
\`\`\`jsx
import '${packageName}/dist/tokens.css';
<html className="${themes[0]}">
\`\`\`

## Themes
${themes.map(t => `\`${t}\``).join(' | ')}

## Key Tokens
**Backgrounds:** ${formatVars(colorTokens, 'bg-')}
**Text:** ${formatVars(colorTokens, 'fg-')}
**Buttons:** ${formatVars(colorTokens, 'btn-')}

## Rules
✅ Use CSS variables
❌ Never hardcode colors
`;
}

function formatVars(tokens: any[], pattern: string): string {
  return tokens.filter(t => t.cssVar.includes(pattern)).slice(0, 3).map(t => `\`${t.cssVar}\``).join(', ') || 'None';
}

export const PASTE_INSTRUCTIONS = {
  bolt: 'Project Settings → Project Knowledge → Paste',
  lovable: 'Project Settings → Custom Knowledge → Paste',
};
```

---

## Tests

### Unit Tests
- [ ] Output is under 3KB
- [ ] Includes essential tokens

---

## Time Estimate
0.5 hours
