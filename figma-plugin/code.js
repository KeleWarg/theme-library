"use strict";
// Show UI
figma.showUI(__html__, { width: 400, height: 600 });
// Handle messages from UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'extract-component') {
        await extractSelectedComponent();
    }
    else if (msg.type === 'sync-component') {
        await syncComponent(msg.apiUrl, msg.componentData);
    }
    else if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
// Extract the currently selected component
async function extractSelectedComponent() {
    try {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.ui.postMessage({
                type: 'error',
                message: 'Please select a component or component set in Figma'
            });
            return;
        }
        const node = selection[0];
        // Check if it's a component or component set
        if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') {
            figma.ui.postMessage({
                type: 'error',
                message: 'Please select a component or component set (not an instance)'
            });
            return;
        }
        figma.ui.postMessage({ type: 'extracting', message: 'Extracting component...' });
        // Extract component data
        const componentData = await extractComponentData(node);
        figma.ui.postMessage({
            type: 'component-extracted',
            data: componentData
        });
        figma.notify(`Extracted: ${componentData.name}`);
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'error',
            message: `Extraction failed: ${error}`
        });
    }
}
// Extract all data from a component or component set
async function extractComponentData(node) {
    const isComponentSet = node.type === 'COMPONENT_SET';
    // Get component name and description
    const name = formatComponentName(node.name);
    const description = node.description || '';
    // Extract variants
    const variants = await extractVariants(node);
    // Extract prop types from component properties or variants
    const propTypes = extractPropTypes(node, variants);
    // Find tokens used in the component
    const tokensUsed = extractTokensUsed(node);
    // Export PNG snapshot
    const snapshot = await exportSnapshot(node);
    // Build Figma URL
    const figmaUrl = buildFigmaUrl(node);
    return {
        figma_id: node.id,
        name,
        description,
        variants,
        prop_types: propTypes,
        tokens_used: tokensUsed,
        snapshot_url: snapshot,
        figma_url: figmaUrl,
        status: 'pending_code'
    };
}
// Format component name to PascalCase
function formatComponentName(name) {
    // Remove variant properties from name (e.g., "Button, State=Default" -> "Button")
    const baseName = name.split(',')[0].trim();
    // Convert to PascalCase
    return baseName
        .split(/[\s\-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
// Extract variants from a component set
async function extractVariants(node) {
    if (node.type === 'COMPONENT') {
        // Single component - one default variant
        return [{
                name: 'default',
                properties: {}
            }];
    }
    // Component set - extract all variant combinations
    const variants = [];
    // Get all child components
    const children = node.children.filter(child => child.type === 'COMPONENT');
    for (const child of children) {
        const variantName = child.name;
        const properties = {};
        // Parse variant properties from the name (e.g., "State=Hover, Size=Large")
        const parts = variantName.split(',').map(p => p.trim());
        for (const part of parts) {
            const [key, value] = part.split('=').map(s => s.trim());
            if (key && value) {
                // Convert "true"/"false" strings to booleans
                if (value.toLowerCase() === 'true') {
                    properties[key] = true;
                }
                else if (value.toLowerCase() === 'false') {
                    properties[key] = false;
                }
                else {
                    properties[key] = value;
                }
            }
        }
        // Create a readable variant name
        const readableName = Object.values(properties)
            .filter(v => typeof v === 'string')
            .join('-')
            .toLowerCase() || 'default';
        variants.push({
            name: readableName,
            properties
        });
    }
    return variants;
}
// Extract prop types from component properties and variants
function extractPropTypes(node, variants) {
    const props = [];
    const seenProps = new Set();
    // Get component property definitions if available
    if (node.type === 'COMPONENT_SET') {
        // Extract property definitions from variant names
        const propertyValues = {};
        for (const variant of variants) {
            for (const [key, value] of Object.entries(variant.properties)) {
                if (!propertyValues[key]) {
                    propertyValues[key] = new Set();
                }
                propertyValues[key].add(String(value));
            }
        }
        // Create prop types from extracted properties
        for (const [propName, values] of Object.entries(propertyValues)) {
            const valuesArray = Array.from(values);
            // Determine type
            let type = 'string';
            if (valuesArray.every(v => v === 'true' || v === 'false')) {
                type = 'boolean';
            }
            const prop = {
                name: toCamelCase(propName),
                type: type === 'boolean' ? 'boolean' : `'${valuesArray.join("' | '")}'`,
                options: type === 'boolean' ? undefined : valuesArray
            };
            // Set default to first value
            if (valuesArray.length > 0) {
                prop.default = valuesArray[0];
            }
            if (!seenProps.has(prop.name)) {
                seenProps.add(prop.name);
                props.push(prop);
            }
        }
    }
    // Add common React props
    if (!seenProps.has('children')) {
        props.push({
            name: 'children',
            type: 'React.ReactNode',
            description: 'Content to render inside the component'
        });
    }
    if (!seenProps.has('className')) {
        props.push({
            name: 'className',
            type: 'string',
            description: 'Additional CSS classes'
        });
    }
    if (!seenProps.has('onClick')) {
        props.push({
            name: 'onClick',
            type: '() => void',
            description: 'Click handler'
        });
    }
    return props;
}
// Convert a string to camelCase
function toCamelCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}
// Extract design tokens used in the component
function extractTokensUsed(node) {
    const tokens = new Set();
    // Walk through all nodes and extract bound variables
    function walkNode(n) {
        // Check for fill colors
        if ('fills' in n && Array.isArray(n.fills)) {
            for (const fill of n.fills) {
                if (fill.type === 'SOLID' && fill.boundVariables?.color) {
                    const varId = fill.boundVariables.color.id;
                    tokens.add(variableIdToToken(varId));
                }
            }
        }
        // Check for stroke colors
        if ('strokes' in n && Array.isArray(n.strokes)) {
            for (const stroke of n.strokes) {
                if (stroke.type === 'SOLID' && stroke.boundVariables?.color) {
                    const varId = stroke.boundVariables.color.id;
                    tokens.add(variableIdToToken(varId));
                }
            }
        }
        // Check for effects (shadows, blurs)
        if ('effects' in n && Array.isArray(n.effects)) {
            for (const effect of n.effects) {
                if ('boundVariables' in effect && effect.boundVariables?.color) {
                    const varId = effect.boundVariables.color.id;
                    tokens.add(variableIdToToken(varId));
                }
            }
        }
        // Check bound variables on the node itself
        if ('boundVariables' in n) {
            const bv = n.boundVariables;
            for (const [key, value] of Object.entries(bv)) {
                if (value && typeof value === 'object' && 'id' in value) {
                    tokens.add(variableIdToToken(value.id));
                }
            }
        }
        // Recursively walk children
        if ('children' in n) {
            for (const child of n.children) {
                walkNode(child);
            }
        }
    }
    walkNode(node);
    // Remove empty tokens
    return Array.from(tokens).filter(t => t.length > 0);
}
// Convert Figma variable ID to a CSS variable name
function variableIdToToken(varId) {
    // Try to get the variable asynchronously is complex in sync context
    // Return a placeholder that references the variable
    return `var(--figma-${varId.replace(/[:/]/g, '-')})`;
}
// Export a PNG snapshot of the component
async function exportSnapshot(node) {
    try {
        // For component sets, export the first variant or the set itself
        let exportNode = node;
        if (node.type === 'COMPONENT_SET' && node.children.length > 0) {
            // Find the "default" variant or use the first one
            const defaultChild = node.children.find(child => child.type === 'COMPONENT' &&
                (child.name.toLowerCase().includes('default') ||
                    child.name.toLowerCase().includes('primary')));
            exportNode = defaultChild || node.children[0];
        }
        const bytes = await exportNode.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 } // 2x for retina
        });
        // Convert to base64
        const base64 = figma.base64Encode(bytes);
        return `data:image/png;base64,${base64}`;
    }
    catch (error) {
        console.error('Failed to export snapshot:', error);
        return '';
    }
}
// Build a Figma URL for the component
function buildFigmaUrl(node) {
    const fileKey = figma.fileKey;
    const nodeId = node.id;
    if (fileKey) {
        return `https://www.figma.com/file/${fileKey}?node-id=${encodeURIComponent(nodeId)}`;
    }
    return '';
}
// Sync component to the admin dashboard API
async function syncComponent(apiUrl, componentData) {
    try {
        figma.ui.postMessage({ type: 'syncing', message: 'Syncing to dashboard...' });
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(componentData)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        const result = await response.json();
        figma.ui.postMessage({
            type: 'sync-complete',
            message: `Synced "${componentData.name}" successfully!`,
            result
        });
        figma.notify(`Synced: ${componentData.name}`);
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'error',
            message: `Sync failed: ${error}`
        });
    }
}
// Initialize - send current selection info on load
async function init() {
    await extractSelectedComponent();
}
// Run init after a short delay to allow UI to load
setTimeout(init, 100);
