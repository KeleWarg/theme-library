# Chunk 7.01 — Export Types & Utils

## Purpose
Define types and utility functions for package export.

---

## Inputs
- None (foundation chunk for Phase 7)

## Outputs
- `ExportableComponent` type (consumed by 7.02, 7.03, 7.04)
- `PackageConfig` type (consumed by 7.02, 7.03)
- `getPublishableComponents()` (consumed by 7.02, 7.03)
- `generateComponentsIndex()` (consumed by 7.03)

---

## Dependencies
- Phase 6 complete ✅

---

## Implementation Notes

### Key Considerations
- Filter components by status AND presence of code
- Index file uses named exports

### Gotchas
- Empty jsx_code should be filtered out
- Package names with @ and / need sanitization for filenames

---

## Files Created
- `src/lib/export/types.ts` — Type definitions
- `src/lib/export/utils.ts` — Utility functions
- `src/lib/export/__tests__/utils.test.ts` — Tests

---

## Implementation

### `src/lib/export/types.ts`

```typescript
export interface ExportableComponent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  jsx_code: string;
  props?: { name: string; type: string; default?: string; description?: string }[];
  variants?: { name: string }[];
  status: 'published' | 'approved' | 'generated' | 'pending';
  code_status?: string;
}

export interface PackageConfig {
  packageName: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
}

export const DEFAULT_PACKAGE_CONFIG: PackageConfig = {
  packageName: '@yourorg/design-system',
  version: '1.0.0',
  description: 'Design system components',
  license: 'MIT',
};
```

### `src/lib/export/utils.ts`

```typescript
import type { ExportableComponent } from './types';

export function getPublishableComponents(components: ExportableComponent[]): ExportableComponent[] {
  return components.filter(c => c.status === 'published' && c.jsx_code?.trim());
}

export function generateComponentsIndex(components: ExportableComponent[]): string {
  return components.map(c => `export { ${c.name} } from './${c.name}';`).join('\n');
}

export function sanitizePackageName(name: string): string {
  return name.replace('@', '').replace('/', '-').replace(/[^a-z0-9-]/gi, '-');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

---

## Tests

### Unit Tests
- [ ] getPublishableComponents filters by status and code
- [ ] generateComponentsIndex creates export statements
- [ ] sanitizePackageName handles @ and /

### Verification
- [ ] `npm test src/lib/export/__tests__/utils.test.ts` passes

---

## Time Estimate
1 hour
