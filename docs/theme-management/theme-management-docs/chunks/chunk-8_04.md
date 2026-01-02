# Chunk 8.04 — Claude Code Generator

## Purpose
Generate CLAUDE.md and .claude/rules/*.md format.

---

## Inputs
- `AIExportBundle` (from chunk 8.01)
- `groupByCategory()`, `filterTokens()` (from chunk 8.02)

## Outputs
- `generateClaudeMd()` function (consumed by 8.07)
- `generateClaudeTokensRule()` function (consumed by 8.07)

---

## Dependencies
- Chunk 8.02 must be complete

---

## Files Created
- `src/lib/aiExport/claudeCode.ts` — Generator

---

## Implementation

### `src/lib/aiExport/claudeCode.ts`

```typescript
import type { AIExportBundle, GeneratorOptions } from './types';
import { groupByCategory, filterTokens } from './tokenUtils';

export function generateClaudeMd(bundle: AIExportBundle, options: GeneratorOptions = {}): string {
  const { packageName = bundle.metadata.packageName } = options;
  const themes = bundle.themes.length > 0 ? bundle.themes : ['default'];
  const published = bundle.components.filter(c => c.status === 'published').length;

  return `# Project Context

Design system with ${bundle.tokens.length} tokens and ${published} components.

## Design System: ${packageName}

### Setup
\`\`\`tsx
import '${packageName}/dist/tokens.css';
<html className="${themes[0]}">
\`\`\`

### Themes
${themes.map(t => `- \`${t}\``).join('\n')}

### Token Reference
See @.claude/rules/tokens.md

## Rules
- ✅ Use CSS variables: \`var(--color-btn-primary-bg)\`
- ❌ Never hardcode colors
`;
}

export function generateClaudeTokensRule(bundle: AIExportBundle, options: GeneratorOptions = {}): string {
  const tokensByCategory = groupByCategory(bundle.tokens);

  return `---
paths: ["src/**/*.tsx", "src/**/*.jsx"]
---

# Token Reference

## Colors
${formatSection(filterTokens(tokensByCategory.color || [], 'bg-'), 'Backgrounds')}
${formatSection(filterTokens(tokensByCategory.color || [], 'fg-'), 'Text')}
${formatSection(filterTokens(tokensByCategory.color || [], 'btn-'), 'Buttons')}

## Typography
${formatList(tokensByCategory.typography || [])}
`;
}

function formatSection(tokens: any[], title: string): string {
  return `### ${title}\n${formatList(tokens)}`;
}

function formatList(tokens: any[]): string {
  return tokens.slice(0, 8).map(t => `- \`${t.cssVar}\`: \`${t.value}\``).join('\n') || 'None';
}

export const CLAUDE_CODE_PATHS = { main: 'CLAUDE.md', tokens: '.claude/rules/tokens.md' };
```

---

## Tests

### Unit Tests
- [ ] CLAUDE.md includes project context
- [ ] Tokens rule includes frontmatter

---

## Time Estimate
1 hour
