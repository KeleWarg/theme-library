# Chunk 7.04 — CSS Token Exporter

## Purpose
Export design tokens as CSS variables file.

---

## Inputs
- Token data from database (existing)

## Outputs
- `generateTokensCSS()` function (consumed by chunk 7.03)
- `downloadTokensCSS()` function

---

## Dependencies
- Chunk 7.01 must be complete

---

## Files Created
- `src/lib/export/tokenExporter.ts` — CSS generator
- `src/lib/export/__tests__/tokenExporter.test.ts` — Tests

---

## Implementation

### `src/lib/export/tokenExporter.ts`

```typescript
interface TokenValue {
  category: string;
  name: string;
  value: string;
  cssVar: string;
}

export function generateTokensCSS(tokens: TokenValue[], themeClass?: string): string {
  const selector = themeClass ? `.${themeClass}` : ':root';
  const grouped = groupByCategory(tokens);

  let css = `/* Design Tokens - Generated ${new Date().toISOString()} */\n\n`;
  css += `${selector} {\n`;

  for (const [category, categoryTokens] of Object.entries(grouped)) {
    css += `  /* ${category} */\n`;
    for (const token of categoryTokens) {
      css += `  ${token.cssVar}: ${token.value};\n`;
    }
    css += '\n';
  }

  css += '}\n';
  return css;
}

function groupByCategory(tokens: TokenValue[]): Record<string, TokenValue[]> {
  return tokens.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, TokenValue[]>);
}

export function downloadTokensCSS(tokens: TokenValue[], filename = 'tokens.css'): void {
  const css = generateTokensCSS(tokens);
  const blob = new Blob([css], { type: 'text/css' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

---

## Tests

### Unit Tests
- [ ] Generates valid CSS
- [ ] Groups by category
- [ ] Uses theme class when provided

---

## Time Estimate
1 hour
