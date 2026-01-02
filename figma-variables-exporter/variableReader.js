/**
 * Chunk 9.03 — Variable Reader
 *
 * Reads Figma Variables and collections using Figma Plugin API.
 */
/**
 * Get all local variable collections in the Figma file
 */
export async function getCollections() {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    return collections.map(c => ({
        id: c.id,
        name: c.name,
        modeCount: c.modes.length,
    }));
}
/**
 * Get a specific collection by ID
 */
export async function getCollection(id) {
    return await figma.variables.getVariableCollectionByIdAsync(id);
}
/**
 * Get all variables in a collection
 */
export async function getCollectionVariables(collection) {
    const variables = [];
    for (const varId of collection.variableIds) {
        const variable = await figma.variables.getVariableByIdAsync(varId);
        if (variable)
            variables.push(variable);
    }
    return variables;
}
/**
 * Categorize a variable by its name
 */
export function categorizeVariable(name) {
    const lower = name.toLowerCase();
    if (lower.includes('color') || lower.includes('bg') || lower.includes('fg'))
        return 'colors';
    if (lower.includes('font') || lower.includes('text'))
        return 'typography';
    if (lower.includes('spacing') || lower.includes('gap'))
        return 'spacing';
    return 'other';
}
/**
 * Check if a variable should be exported based on options
 */
export function shouldExportVariable(name, options) {
    const cat = categorizeVariable(name);
    if (cat === 'colors' && !options.colors)
        return false;
    if (cat === 'typography' && !options.typography)
        return false;
    if (cat === 'spacing' && !options.spacing)
        return false;
    return true;
}
