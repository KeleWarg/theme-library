/**
 * Chunk 9.04 — Export Logic
 *
 * Converts Figma Variables to DTCG JSON format.
 */
import { getCollection, getCollectionVariables, shouldExportVariable } from './variableReader';
/**
 * Export variables from selected collections to DTCG JSON format
 */
export async function exportVariables(collectionIds, options) {
    const files = [];
    for (const colId of collectionIds) {
        const collection = await getCollection(colId);
        if (!collection)
            continue;
        const variables = await getCollectionVariables(collection);
        for (const mode of collection.modes) {
            const tokens = buildTokens(variables, mode.modeId, options);
            if (Object.keys(tokens).length === 0)
                continue;
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
function buildTokens(variables, modeId, options) {
    const tokens = {};
    for (const v of variables) {
        if (!shouldExportVariable(v.name, options))
            continue;
        const value = v.valuesByMode[modeId];
        if (value === undefined)
            continue;
        const formatted = formatValue(value, v.resolvedType);
        const path = v.name.split('/').map(p => p.trim());
        setNested(tokens, path, formatted);
    }
    return tokens;
}
/**
 * Format a variable value to DTCG format
 */
function formatValue(value, type) {
    if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
        const { r, g, b, a = 1 } = value;
        const hex = '#' + [r, g, b]
            .map(c => Math.round(c * 255).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
        return { $type: 'color', $value: { hex, alpha: a } };
    }
    if (type === 'FLOAT') {
        return { $type: 'number', $value: value };
    }
    if (type === 'STRING') {
        return { $type: 'string', $value: value };
    }
    return { $type: 'unknown', $value: String(value) };
}
/**
 * Set a nested value in an object using a path array
 */
function setNested(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
            current[path[i]] = {};
        }
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
}
