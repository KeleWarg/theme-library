# Chunk 8.01 — AI Export Types

## Purpose
TypeScript types for AI platform exports.

---

## Inputs
- None (foundation chunk for Phase 8)

## Outputs
- `DesignToken` type (consumed by 8.02-8.08)
- `AIExportBundle` type (consumed by 8.03-8.08)
- `AIExportFormat` type (consumed by 8.07)

---

## Dependencies
- Phase 7 complete ✅

---

## Files Created
- `src/lib/aiExport/types.ts` — Type definitions

---

## Implementation

### `src/lib/aiExport/types.ts`

```typescript
export type TokenCategory = 'color' | 'typography' | 'spacing' | 'layout' | 'border' | 'shadow' | 'other';

export interface DesignToken {
  path: string;           // "color.btn.primary-bg"
  name: string;           // "primary-bg"
  category: TokenCategory;
  type: 'color' | 'number' | 'string';
  value: string | number;
  cssVar: string;         // "--color-btn-primary-bg"
  theme?: string;
}

export interface ComponentData {
  name: string;
  slug: string;
  description?: string;
  props?: { name: string; type: string; default?: string }[];
  variants?: { name: string }[];
  jsx_code?: string;
  status?: string;
}

export interface AIExportBundle {
  tokens: DesignToken[];
  components: ComponentData[];
  themes: string[];
  metadata: {
    packageName: string;
    version: string;
    exportedAt: string;
  };
}

export type AIExportFormat = 'cursor-rules' | 'claude-code' | 'project-knowledge' | 'mcp-server' | 'full-package';

export interface GeneratorOptions {
  packageName?: string;
  version?: string;
  includeExamples?: boolean;
}
```

---

## Tests

### Unit Tests
- [ ] Types compile without errors

---

## Time Estimate
0.5 hours
