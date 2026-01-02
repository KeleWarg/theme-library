import type { AIExportBundle, GeneratorOptions, DesignToken } from './types';
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

function formatSection(tokens: DesignToken[], title: string): string {
  return `### ${title}\n${formatList(tokens)}`;
}

function formatList(tokens: DesignToken[]): string {
  return tokens.slice(0, 8).map(t => `- \`${t.cssVar}\`: \`${t.value}\``).join('\n') || 'None';
}

export const CLAUDE_CODE_PATHS = { main: 'CLAUDE.md', tokens: '.claude/rules/tokens.md' };

