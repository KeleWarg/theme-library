/**
 * Chunk 9.04 — Export Logic
 * 
 * Converts Figma Variables to DTCG JSON format.
 * Properly resolves variable aliases to their actual values.
 */

import { getCollection, getCollectionVariables, shouldExportVariable } from './variableReader';

export interface ExportOptions {
  colors: boolean;
  typography: boolean;
  spacing: boolean;
}

export interface ExportFile {
  name: string;
  content: string;
}

/**
 * Export variables from selected collections to DTCG JSON format
 */
export async function exportVariables(
  collectionIds: string[],
  options: ExportOptions
): Promise<ExportFile[]> {
  const files: ExportFile[] = [];

  for (const colId of collectionIds) {
    const collection = await getCollection(colId);
    if (!collection) continue;

    const variables = await getCollectionVariables(collection);

    for (const mode of collection.modes) {
      const tokens = await buildTokens(variables, mode.modeId, options);
      if (Object.keys(tokens).length === 0) continue;

      files.push({
        name: `${collection.name}_${mode.name}_tokens.json`.replace(/\s+/g, '_'),
        content: JSON.stringify(tokens, null, 2),
      });
    }
  }

  return files;
}

/**
 * Build token object from variables for a specific mode
 */
async function buildTokens(
  variables: Variable[],
  modeId: string,
  options: ExportOptions
): Promise<Record<string, unknown>> {
  const tokens: Record<string, unknown> = {};

  for (const v of variables) {
    if (!shouldExportVariable(v.name, options)) continue;
    const value = v.valuesByMode[modeId];
    if (value === undefined) continue;

    const formatted = await formatValue(value, v.resolvedType);
    const path = v.name.split('/').map(p => p.trim());
    setNested(tokens, path, formatted);
  }

  return tokens;
}

/**
 * Resolve a variable value, following aliases to get the actual value
 */
async function resolveVariableValue(
  value: VariableValue,
  resolvedType: string
): Promise<unknown> {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Handle primitive values (numbers, strings, booleans)
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  // Handle object values
  if (typeof value === 'object' && value !== null) {
    // Handle alias (reference to another variable) - resolve it!
    if ('type' in value && (value as { type: string }).type === 'VARIABLE_ALIAS') {
      const aliasId = (value as { type: string; id: string }).id;
      try {
        const referencedVar = await figma.variables.getVariableByIdAsync(aliasId);
        if (referencedVar) {
          // Get the value from the first mode of the referenced variable
          const firstModeId = Object.keys(referencedVar.valuesByMode)[0];
          const refValue = referencedVar.valuesByMode[firstModeId];
          // Recursively resolve (in case it's another alias)
          return resolveVariableValue(refValue, referencedVar.resolvedType);
        }
      } catch (e) {
        // If we can't resolve, return the alias reference
        return { alias: aliasId };
      }
    }
    
    // Handle color values (RGB/RGBA)
    if ('r' in value && 'g' in value && 'b' in value) {
      const c = value as { r: number; g: number; b: number; a?: number };
      const toHex = (n: number): string => Math.round(n * 255).toString(16).padStart(2, '0');
      return {
        hex: '#' + toHex(c.r) + toHex(c.g) + toHex(c.b),
        alpha: c.a !== undefined ? c.a : 1
      };
    }
  }

  // Fallback - return as-is for primitives, stringify for unknown objects
  if (typeof value === 'object') {
    return String(value);
  }
  return value;
}

/**
 * Format a variable value to DTCG format
 */
async function formatValue(
  value: VariableValue,
  type: VariableResolvedDataType
): Promise<{ $type: string; $value: unknown }> {
  const resolved = await resolveVariableValue(value, type);

  // Handle color type
  if (type === 'COLOR') {
    // If resolved is already a color object with hex
    if (typeof resolved === 'object' && resolved !== null && 'hex' in resolved) {
      return { $type: 'color', $value: resolved };
    }
    // If it's an unresolved alias (fallback)
    if (typeof resolved === 'object' && resolved !== null && 'alias' in resolved) {
      return { $type: 'color', $value: resolved };
    }
  }

  if (type === 'FLOAT') {
    return { $type: 'number', $value: resolved };
  }

  if (type === 'STRING') {
    return { $type: 'string', $value: resolved };
  }

  if (type === 'BOOLEAN') {
    return { $type: 'boolean', $value: resolved };
  }

  // Fallback for any other type
  return { $type: 'unknown', $value: resolved };
}

/**
 * Set a nested value in an object using a path array
 */
function setNested(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown
): void {
  let current = obj as Record<string, unknown>;
  
  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) {
      current[path[i]] = {};
    }
    current = current[path[i]] as Record<string, unknown>;
  }
  
  current[path[path.length - 1]] = value;
}
