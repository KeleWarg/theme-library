# Chunk 8.03 — Cursor Rules Generator

## Purpose
Generate `.cursor/rules/design-system.mdc` format.

---

## Inputs
- `AIExportBundle` (from chunk 8.01)
- `groupByCategory()`, `filterTokens()` (from chunk 8.02)

## Outputs
- `generateCursorRules()` function (consumed by 8.07)

---

## Dependencies
- Chunk 8.02 must be complete

---

## Files Created
- `src/lib/aiExport/cursorRules.ts` — Generator
- `src/lib/aiExport/__tests__/cursorRules.test.ts` — Tests

---

## Implementation

### `src/lib/aiExport/cursorRules.ts`

```typescript
import type { AIExportBundle, GeneratorOptions } from './types';
import { groupByCategory, filterTokens } from './tokenUtils';

export function generateCursorRules(bundle: AIExportBundle, options: GeneratorOptions = {}): string {
  const { packageName = bundle.metadata.packageName } = options;
  const tokensByCategory = groupByCategory(bundle.tokens);
  const themes = bundle.themes.length > 0 ? bundle.themes : ['default'];

  return `---
description: Design system rules - Use ${packageName} tokens for consistent UI
globs: ["src/**/*.tsx", "src/**/*.jsx", "src/**/*.css"]
alwaysApply: false
---

# Design System: ${packageName}

## Setup
\`\`\`tsx
import '${packageName}/dist/tokens.css';
<html className="${themes[0]}">
\`\`\`

## Themes
${themes.map(t => `\`${t}\``).join(' | ')}

## Colors
**Backgrounds:** ${formatTokenList(filterTokens(tokensByCategory.color || [], 'bg-'))}
**Text:** ${formatTokenList(filterTokens(tokensByCategory.color || [], 'fg-'))}
**Buttons:** ${formatTokenList(filterTokens(tokensByCategory.color || [], 'btn-'))}

## Rules
✅ Use CSS variables like \`var(--color-btn-primary-bg)\`
❌ Never hardcode colors
`;
}

function formatTokenList(tokens: any[]): string {
  return tokens.slice(0, 5).map(t => `\`${t.cssVar}\``).join(', ') || 'None';
}

export const CURSOR_RULES_PATH = '.cursor/rules/design-system.mdc';
```

---

## Tests

### Unit Tests
- [ ] Output starts with frontmatter
- [ ] Includes themes
- [ ] Includes token references

---

## Time Estimate
1 hour
