// Types
interface VariableCollection {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  variableIds: string[];
}

interface ExportOptions {
  colors: boolean;
  typography: boolean;
  breakpoints: boolean;
  includeMetadata: boolean;
  format: 'dtcg' | 'simple';
}

interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ExportedToken {
  $type: string;
  $value: any;
  $extensions?: Record<string, any>;
}

// Show UI
figma.showUI(__html__, { width: 340, height: 580 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-collections') {
    await sendCollections();
  } else if (msg.type === 'export') {
    await exportVariables(msg.collections, msg.options);
  } else if (msg.type === 'sync') {
    await syncToAPI(msg.apiUrl, msg.apiKey, msg.collections, msg.options);
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// Get all variable collections
async function sendCollections() {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    
    const collectionData = collections.map(col => ({
      id: col.id,
      name: col.name,
      modeCount: col.modes.length
    }));
    
    figma.ui.postMessage({ type: 'collections', collections: collectionData });
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: 'Failed to load collections' });
  }
}

// Convert Figma color to hex
function colorToHex(color: ColorValue): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

// Get resolved value for a variable
async function getResolvedValue(variable: Variable, modeId: string): Promise<any> {
  const value = variable.valuesByMode[modeId];
  
  if (value === undefined) return null;
  
  // Handle alias (reference to another variable)
  if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    const aliasedVar = await figma.variables.getVariableByIdAsync(value.id);
    if (aliasedVar) {
      return getResolvedValue(aliasedVar, modeId);
    }
  }
  
  return value;
}

// Format variable value based on type
function formatValue(value: any, type: string, options: ExportOptions): ExportedToken {
  if (options.format === 'simple') {
    if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
      return { $type: 'color', $value: colorToHex(value as ColorValue) };
    }
    return { $type: type.toLowerCase(), $value: value };
  }
  
  // DTCG format with full metadata
  if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
    const color = value as ColorValue;
    return {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [color.r, color.g, color.b],
        alpha: color.a,
        hex: colorToHex(color)
      }
    };
  }
  
  if (type === 'FLOAT') {
    return { $type: 'number', $value: value };
  }
  
  if (type === 'STRING') {
    return { $type: 'string', $value: value };
  }
  
  if (type === 'BOOLEAN') {
    return { $type: 'boolean', $value: value };
  }
  
  return { $type: type.toLowerCase(), $value: value };
}

// Build nested object from path
function setNestedValue(obj: any, path: string[], value: any): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

// Categorize variable by name
function categorizeVariable(name: string): 'colors' | 'typography' | 'breakpoints' | 'other' {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('color') || lowerName.includes('bg') || lowerName.includes('fg') || 
      lowerName.includes('button') || lowerName.includes('background') || lowerName.includes('foreground')) {
    return 'colors';
  }
  
  if (lowerName.includes('font') || lowerName.includes('text') || lowerName.includes('line-height') ||
      lowerName.includes('letter') || lowerName.includes('typography')) {
    return 'typography';
  }
  
  if (lowerName.includes('breakpoint') || lowerName.includes('spacing') || lowerName.includes('grid') ||
      lowerName.includes('margin') || lowerName.includes('gutter') || lowerName.includes('column')) {
    return 'breakpoints';
  }
  
  return 'other';
}

// Export variables to JSON
async function exportVariables(collectionIds: string[], options: ExportOptions) {
  try {
    const exports: { name: string; content: string }[] = [];
    
    for (const colId of collectionIds) {
      const collection = await figma.variables.getVariableCollectionByIdAsync(colId);
      if (!collection) continue;
      
      for (const mode of collection.modes) {
        const tokens: Record<string, any> = {};
        
        for (const varId of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(varId);
          if (!variable) continue;
          
          const category = categorizeVariable(variable.name);
          
          if (category === 'colors' && !options.colors) continue;
          if (category === 'typography' && !options.typography) continue;
          if (category === 'breakpoints' && !options.breakpoints) continue;
          
          const value = await getResolvedValue(variable, mode.modeId);
          if (value === null) continue;
          
          const formattedValue = formatValue(value, variable.resolvedType, options);
          
          if (options.includeMetadata) {
            formattedValue.$extensions = {
              'com.figma.variableId': variable.id,
              'com.figma.hiddenFromPublishing': variable.hiddenFromPublishing,
              'com.figma.scopes': variable.scopes
            };
          }
          
          const path = variable.name.split('/').map(p => p.trim());
          setNestedValue(tokens, path, formattedValue);
        }
        
        const fileName = `${collection.name}/${mode.name}.tokens.json`;
        exports.push({
          name: fileName,
          content: JSON.stringify(tokens, null, 2)
        });
      }
    }
    
    figma.ui.postMessage({ 
      type: 'export-complete', 
      files: exports,
      fileCount: exports.length
    });
    
    figma.notify(`Exported ${exports.length} token files`);
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: `Export failed: ${error}` });
  }
}

// Sync to admin dashboard API
async function syncToAPI(apiUrl: string, apiKey: string, collectionIds: string[], options: ExportOptions) {
  try {
    const exports: { name: string; content: any }[] = [];
    
    for (const colId of collectionIds) {
      const collection = await figma.variables.getVariableCollectionByIdAsync(colId);
      if (!collection) continue;
      
      for (const mode of collection.modes) {
        const tokens: Record<string, any> = {};
        
        for (const varId of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(varId);
          if (!variable) continue;
          
          const category = categorizeVariable(variable.name);
          if (category === 'colors' && !options.colors) continue;
          if (category === 'typography' && !options.typography) continue;
          if (category === 'breakpoints' && !options.breakpoints) continue;
          
          const value = await getResolvedValue(variable, mode.modeId);
          if (value === null) continue;
          
          const formattedValue = formatValue(value, variable.resolvedType, options);
          
          if (options.includeMetadata) {
            formattedValue.$extensions = {
              'com.figma.variableId': variable.id,
              'com.figma.hiddenFromPublishing': variable.hiddenFromPublishing,
              'com.figma.scopes': variable.scopes
            };
          }
          
          const path = variable.name.split('/').map(p => p.trim());
          setNestedValue(tokens, path, formattedValue);
        }
        
        exports.push({
          name: `${collection.name}/${mode.name}`,
          content: tokens
        });
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        tokens: exports,
        timestamp: new Date().toISOString(),
        source: 'figma-plugin'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    figma.ui.postMessage({ type: 'sync-complete' });
    figma.notify('Synced to dashboard successfully!');
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: `Sync failed: ${error}` });
  }
}
