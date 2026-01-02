# Chunk 9.03 — Variable Reader

## Purpose
Read Figma Variables and collections using Figma Plugin API.

---

## Inputs
- Plugin UI (from chunk 9.02)

## Outputs
- `getCollections()` function
- `getCollectionVariables()` function
- `categorizeVariable()` function

---

## Dependencies
- Chunk 9.02 must be complete

---

## Files Created
- `figma-variables-exporter/src/variableReader.ts`

---

## Implementation

### `src/variableReader.ts`

```typescript
export interface CollectionInfo {
  id: string;
  name: string;
  modeCount: number;
}

export async function getCollections(): Promise<CollectionInfo[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  return collections.map(c => ({
    id: c.id,
    name: c.name,
    modeCount: c.modes.length,
  }));
}

export async function getCollection(id: string): Promise<VariableCollection | null> {
  return await figma.variables.getVariableCollectionByIdAsync(id);
}

export async function getCollectionVariables(collection: VariableCollection): Promise<Variable[]> {
  const variables: Variable[] = [];
  for (const varId of collection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(varId);
    if (variable) variables.push(variable);
  }
  return variables;
}

export function categorizeVariable(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('color') || lower.includes('bg') || lower.includes('fg')) return 'colors';
  if (lower.includes('font') || lower.includes('text')) return 'typography';
  if (lower.includes('spacing') || lower.includes('gap')) return 'spacing';
  return 'other';
}

export function shouldExportVariable(name: string, options: { colors: boolean; typography: boolean; spacing: boolean }): boolean {
  const cat = categorizeVariable(name);
  if (cat === 'colors' && !options.colors) return false;
  if (cat === 'typography' && !options.typography) return false;
  if (cat === 'spacing' && !options.spacing) return false;
  return true;
}
```

---

## Verification
- [ ] Can read collections from Figma file
- [ ] Categorization works correctly

---

## Time Estimate
1.5 hours
