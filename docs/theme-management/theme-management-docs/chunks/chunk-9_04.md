# Chunk 9.04 — Export Logic

## Purpose
Convert Figma Variables to DTCG JSON format and wire up main plugin code.

---

## Inputs
- Variable reader functions (from chunk 9.03)

## Outputs
- `exportVariables()` function
- `code.ts` main plugin entry

---

## Dependencies
- Chunk 9.03 must be complete

---

## Files Created
- `figma-variables-exporter/src/exporter.ts`
- `figma-variables-exporter/src/code.ts`

---

## Implementation

### `src/exporter.ts`

```typescript
import { getCollection, getCollectionVariables, shouldExportVariable } from './variableReader';

export interface ExportOptions { colors: boolean; typography: boolean; spacing: boolean; }
export interface ExportFile { name: string; content: string; }

export async function exportVariables(collectionIds: string[], options: ExportOptions): Promise<ExportFile[]> {
  const files: ExportFile[] = [];

  for (const colId of collectionIds) {
    const collection = await getCollection(colId);
    if (!collection) continue;

    const variables = await getCollectionVariables(collection);

    for (const mode of collection.modes) {
      const tokens = buildTokens(variables, mode.modeId, options);
      if (Object.keys(tokens).length === 0) continue;

      files.push({
        name: `${collection.name}_${mode.name}_tokens.json`.replace(/\s+/g, '_'),
        content: JSON.stringify(tokens, null, 2),
      });
    }
  }
  return files;
}

function buildTokens(variables: Variable[], modeId: string, options: ExportOptions): Record<string, any> {
  const tokens: Record<string, any> = {};

  for (const v of variables) {
    if (!shouldExportVariable(v.name, options)) continue;
    const value = v.valuesByMode[modeId];
    if (value === undefined) continue;

    const formatted = formatValue(value, v.resolvedType);
    const path = v.name.split('/').map(p => p.trim());
    setNested(tokens, path, formatted);
  }
  return tokens;
}

function formatValue(value: VariableValue, type: VariableResolvedDataType): any {
  if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
    const { r, g, b, a = 1 } = value as RGBA;
    const hex = '#' + [r, g, b].map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
    return { $type: 'color', $value: { hex, alpha: a } };
  }
  if (type === 'FLOAT') return { $type: 'number', $value: value };
  if (type === 'STRING') return { $type: 'string', $value: value };
  return { $type: 'unknown', $value: String(value) };
}

function setNested(obj: Record<string, any>, path: string[], value: any): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) current[path[i]] = {};
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}
```

### `src/code.ts`

```typescript
import { getCollections } from './variableReader';
import { exportVariables, ExportOptions } from './exporter';

figma.showUI(__html__, { width: 340, height: 480 });

loadCollections();

async function loadCollections() {
  const collections = await getCollections();
  figma.ui.postMessage({ type: 'collections', collections });
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'cancel') { figma.closePlugin(); return; }
  
  if (msg.type === 'export') {
    try {
      const files = await exportVariables(msg.collections, msg.options);
      figma.ui.postMessage({ type: 'export-complete', files, fileCount: files.length });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e) });
    }
  }
};
```

---

## Verification
- [ ] Export produces valid JSON
- [ ] DTCG format correct ($type, $value)

---

## Time Estimate
1.5 hours
