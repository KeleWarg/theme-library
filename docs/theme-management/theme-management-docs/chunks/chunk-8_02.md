# Chunk 8.02 — Token Utils

## Purpose
Parse and transform tokens for AI exports.

---

## Inputs
- `DesignToken` type (from chunk 8.01)

## Outputs
- `parseFigmaTokens()` function (consumed by 8.03-8.05)
- `groupByCategory()` function (consumed by 8.03, 8.04)
- `filterTokens()` function (consumed by 8.03, 8.04)
- `getEssentialTokens()` function (consumed by 8.05)

---

## Dependencies
- Chunk 8.01 must be complete

---

## Files Created
- `src/lib/aiExport/tokenUtils.ts` — Utility functions
- `src/lib/aiExport/__tests__/tokenUtils.test.ts` — Tests

---

## Implementation

### `src/lib/aiExport/tokenUtils.ts`

```typescript
import type { DesignToken, TokenCategory } from './types';

export function parseFigmaTokens(json: Record<string, any>, theme?: string): DesignToken[] {
  const tokens: DesignToken[] = [];

  function traverse(obj: Record<string, any>, path: string[] = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$extensions') continue;
      const currentPath = [...path, key];

      if (value && typeof value === 'object' && '$type' in value && '$value' in value) {
        const token = createToken(currentPath, value, theme);
        if (token) tokens.push(token);
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, currentPath);
      }
    }
  }

  traverse(json);
  return tokens;
}

function createToken(path: string[], data: any, theme?: string): DesignToken | null {
  const name = path[path.length - 1].toLowerCase().replace(/\s+/g, '-');
  const category = inferCategory(path);
  const value = resolveValue(data);
  if (value === null) return null;

  return {
    path: path.join('.').toLowerCase().replace(/\s+/g, '-'),
    name,
    category,
    type: data.$type,
    value,
    cssVar: `--${category}-${path.slice(1).join('-').toLowerCase().replace(/\s+/g, '-')}`,
    theme,
  };
}

function resolveValue(data: any): string | number | null {
  if (data.$type === 'color') {
    const val = data.$value;
    if (val.hex) return val.hex;
    if (val.components?.length >= 3) {
      const [r, g, b] = val.components.map((c: number) => Math.round(c * 255).toString(16).padStart(2, '0'));
      return `#${r}${g}${b}`.toUpperCase();
    }
    return null;
  }
  return data.$value;
}

function inferCategory(path: string[]): TokenCategory {
  const joined = path.join(' ').toLowerCase();
  if (/color|bg-|fg-|btn-/.test(joined)) return 'color';
  if (/font|typography|text/.test(joined)) return 'typography';
  if (/spacing|margin|padding/.test(joined)) return 'spacing';
  return 'other';
}

export function groupByCategory(tokens: DesignToken[]): Record<TokenCategory, DesignToken[]> {
  return tokens.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<TokenCategory, DesignToken[]>);
}

export function filterTokens(tokens: DesignToken[], pattern: string): DesignToken[] {
  return tokens.filter(t => t.cssVar.includes(pattern));
}

export function getEssentialTokens(tokens: DesignToken[], category: TokenCategory, limit = 10): DesignToken[] {
  return tokens.filter(t => t.category === category).slice(0, limit);
}
```

---

## Tests

### Unit Tests
- [ ] parseFigmaTokens extracts tokens from nested JSON
- [ ] groupByCategory groups correctly
- [ ] filterTokens filters by pattern

---

## Time Estimate
0.5 hours
