# Phase 10: Figma Plugin

## Overview

This phase creates a Figma plugin that exports design variables (colors, typography, spacing) to JSON files compatible with the design system build pipeline.

## Prerequisites

- Figma desktop app installed
- Node.js 18+
- Figma file with Variables configured (colors, typography, breakpoints)
- Phases 1-4 complete (for API sync option)

## Outcome

- Figma plugin that exports variables to JSON
- Export formats matching `figma_tokens/` structure
- Optional: Direct sync to admin dashboard API

---

## Plugin Architecture

```
figma-variables-exporter/
├── manifest.json          # Plugin configuration
├── code.ts               # Main plugin logic (runs in Figma sandbox)
├── ui.html               # Plugin UI
├── package.json
├── tsconfig.json
└── README.md
```

---

## Task 10.1: Create Plugin Project

### Instructions

Create a new directory and initialize the plugin:

```bash
mkdir figma-variables-exporter
cd figma-variables-exporter
npm init -y
npm install -D typescript @figma/plugin-typings
```

### manifest.json

```json
{
  "name": "Design System Variables Exporter",
  "id": "design-system-variables-exporter",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["*"]
  },
  "permissions": ["currentuser"]
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### package.json scripts

```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
```

---

## Task 10.2: Create Plugin UI

### ui.html

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 16px;
      background: #ffffff;
      color: #333;
    }
    
    h2 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1e1e1e;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
    }
    
    .checkbox-label input {
      width: 14px;
      height: 14px;
    }
    
    .collection-list {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      padding: 8px;
      margin-bottom: 12px;
    }
    
    .collection-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .collection-item:hover {
      background: #f5f5f5;
    }
    
    .collection-item.selected {
      background: #e8f0fe;
    }
    
    .mode-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: #e5e5e5;
      border-radius: 3px;
      color: #666;
    }
    
    .button-group {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    button {
      flex: 1;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #18a0fb;
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      background: #0d8de5;
    }
    
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: white;
      color: #333;
      border: 1px solid #e5e5e5;
    }
    
    .btn-secondary:hover {
      background: #f5f5f5;
    }
    
    .status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      display: none;
    }
    
    .status.success {
      display: block;
      background: #e6f4ea;
      color: #1e7e34;
    }
    
    .status.error {
      display: block;
      background: #fce8e6;
      color: #c5221f;
    }
    
    .status.info {
      display: block;
      background: #e8f0fe;
      color: #1967d2;
    }
    
    .divider {
      height: 1px;
      background: #e5e5e5;
      margin: 16px 0;
    }
    
    .input-group {
      margin-bottom: 12px;
    }
    
    .input-group label {
      display: block;
      font-size: 11px;
      font-weight: 500;
      margin-bottom: 4px;
      color: #666;
    }
    
    .input-group input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      font-size: 12px;
    }
    
    .input-group input:focus {
      outline: none;
      border-color: #18a0fb;
    }
  </style>
</head>
<body>
  <h2>Design System Variables Exporter</h2>
  
  <div class="section">
    <div class="section-title">Variable Collections</div>
    <div id="collections" class="collection-list">
      <div style="color: #999; font-size: 11px;">Loading collections...</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Export Options</div>
    <div class="checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" id="exportColors" checked>
        Colors (themes)
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="exportTypography" checked>
        Typography
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="exportBreakpoints" checked>
        Breakpoints / Spacing
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="includeMetadata">
        Include Figma metadata
      </label>
    </div>
  </div>
  
  <div class="divider"></div>
  
  <div class="section">
    <div class="section-title">Output Format</div>
    <div class="checkbox-group">
      <label class="checkbox-label">
        <input type="radio" name="format" value="dtcg" checked>
        DTCG Format (Design Tokens Community Group)
      </label>
      <label class="checkbox-label">
        <input type="radio" name="format" value="simple">
        Simple JSON (key-value pairs)
      </label>
    </div>
  </div>
  
  <div class="divider"></div>
  
  <div class="section">
    <div class="section-title">API Sync (Optional)</div>
    <div class="input-group">
      <label>Admin Dashboard URL</label>
      <input type="text" id="apiUrl" placeholder="https://your-admin.vercel.app/api/tokens">
    </div>
    <div class="input-group">
      <label>API Key</label>
      <input type="password" id="apiKey" placeholder="Enter API key for sync">
    </div>
  </div>
  
  <div class="button-group">
    <button class="btn-secondary" id="cancelBtn">Cancel</button>
    <button class="btn-primary" id="exportBtn">Export to JSON</button>
  </div>
  
  <button class="btn-primary" id="syncBtn" style="width: 100%; margin-top: 8px; background: #34a853;" disabled>
    Sync to Dashboard
  </button>
  
  <div id="status" class="status"></div>

  <script>
    // Handle messages from plugin code
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      
      if (msg.type === 'collections') {
        renderCollections(msg.collections);
      } else if (msg.type === 'export-complete') {
        showStatus('success', `Exported ${msg.fileCount} files successfully!`);
      } else if (msg.type === 'sync-complete') {
        showStatus('success', 'Synced to dashboard successfully!');
      } else if (msg.type === 'error') {
        showStatus('error', msg.message);
      }
    };
    
    function renderCollections(collections) {
      const container = document.getElementById('collections');
      
      if (collections.length === 0) {
        container.innerHTML = '<div style="color: #999; font-size: 11px;">No variable collections found</div>';
        return;
      }
      
      container.innerHTML = collections.map(col => `
        <label class="collection-item">
          <input type="checkbox" value="${col.id}" checked>
          <span>${col.name}</span>
          <span class="mode-badge">${col.modeCount} mode${col.modeCount > 1 ? 's' : ''}</span>
        </label>
      `).join('');
    }
    
    function showStatus(type, message) {
      const status = document.getElementById('status');
      status.className = 'status ' + type;
      status.textContent = message;
    }
    
    function getSelectedCollections() {
      const checkboxes = document.querySelectorAll('#collections input[type="checkbox"]:checked');
      return Array.from(checkboxes).map(cb => cb.value);
    }
    
    function getExportOptions() {
      return {
        colors: document.getElementById('exportColors').checked,
        typography: document.getElementById('exportTypography').checked,
        breakpoints: document.getElementById('exportBreakpoints').checked,
        includeMetadata: document.getElementById('includeMetadata').checked,
        format: document.querySelector('input[name="format"]:checked').value
      };
    }
    
    // Export button
    document.getElementById('exportBtn').onclick = () => {
      const collections = getSelectedCollections();
      const options = getExportOptions();
      
      if (collections.length === 0) {
        showStatus('error', 'Please select at least one collection');
        return;
      }
      
      showStatus('info', 'Exporting...');
      parent.postMessage({ 
        pluginMessage: { 
          type: 'export',
          collections,
          options
        } 
      }, '*');
    };
    
    // Sync button
    document.getElementById('syncBtn').onclick = () => {
      const apiUrl = document.getElementById('apiUrl').value;
      const apiKey = document.getElementById('apiKey').value;
      const collections = getSelectedCollections();
      const options = getExportOptions();
      
      if (!apiUrl) {
        showStatus('error', 'Please enter API URL');
        return;
      }
      
      showStatus('info', 'Syncing...');
      parent.postMessage({ 
        pluginMessage: { 
          type: 'sync',
          apiUrl,
          apiKey,
          collections,
          options
        } 
      }, '*');
    };
    
    // Enable sync button when URL is entered
    document.getElementById('apiUrl').oninput = (e) => {
      document.getElementById('syncBtn').disabled = !e.target.value;
    };
    
    // Cancel button
    document.getElementById('cancelBtn').onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    };
    
    // Request collections on load
    parent.postMessage({ pluginMessage: { type: 'get-collections' } }, '*');
  </script>
</body>
</html>
```

---

## Task 10.3: Create Plugin Code

### src/code.ts

```typescript
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
    // Simple format: just return the value
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
      
      // Export each mode as a separate file
      for (const mode of collection.modes) {
        const tokens: Record<string, any> = {};
        
        for (const varId of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(varId);
          if (!variable) continue;
          
          const category = categorizeVariable(variable.name);
          
          // Skip based on options
          if (category === 'colors' && !options.colors) continue;
          if (category === 'typography' && !options.typography) continue;
          if (category === 'breakpoints' && !options.breakpoints) continue;
          
          const value = await getResolvedValue(variable, mode.modeId);
          if (value === null) continue;
          
          const formattedValue = formatValue(value, variable.resolvedType, options);
          
          // Add Figma metadata if requested
          if (options.includeMetadata) {
            formattedValue.$extensions = {
              'com.figma.variableId': variable.id,
              'com.figma.hiddenFromPublishing': variable.hiddenFromPublishing,
              'com.figma.scopes': variable.scopes
            };
          }
          
          // Build nested structure from variable name (e.g., "Color/Button/Primary/bg")
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
    
    // Trigger download for each file
    for (const file of exports) {
      // In Figma plugins, we can't directly download files
      // Instead, we copy to clipboard or send to UI for download
      console.log(`Exported: ${file.name}`);
    }
    
    // Send all exports to UI for download
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
    // Build the same export data
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
    
    // Send to API
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
```

---

## Task 10.4: Build and Install Plugin

### Build the plugin

```bash
cd figma-variables-exporter
npm run build
```

This creates `code.js` from `src/code.ts`.

### Install in Figma

1. Open Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from your plugin folder
4. The plugin appears under **Plugins** → **Development**

### Test the plugin

1. Open a Figma file with Variables
2. Run the plugin: **Plugins** → **Development** → **Design System Variables Exporter**
3. Select collections and export options
4. Click **Export to JSON**

---

## Task 10.5: Add Download Functionality to UI

Update the UI script to handle file downloads:

### Add to ui.html (inside `<script>` tag)

```javascript
// Handle export complete - download files
if (msg.type === 'export-complete') {
  showStatus('success', `Exported ${msg.fileCount} files!`);
  
  // Download each file
  msg.files.forEach((file, index) => {
    setTimeout(() => {
      downloadFile(file.name, file.content);
    }, index * 500); // Stagger downloads
  });
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\//g, '_');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## Task 10.6: Create API Endpoint (Optional)

If you want to sync directly from Figma to your admin dashboard, add this API route:

### src/pages/api/tokens.js (Next.js) or equivalent

```javascript
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify API key
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const apiKey = authHeader.split(' ')[1];
  if (apiKey !== process.env.FIGMA_SYNC_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  try {
    const { tokens, timestamp, source } = req.body;
    
    // Store tokens in database
    const { error } = await supabase
      .from('token_syncs')
      .insert({
        tokens: tokens,
        synced_at: timestamp,
        source: source
      });
    
    if (error) throw error;
    
    // Optionally trigger rebuild
    // await triggerBuild();
    
    res.status(200).json({ success: true, count: tokens.length });
    
  } catch (error) {
    console.error('Token sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
}
```

---

## Expected Output Format

The plugin exports JSON matching this structure (used by `scripts/transform-tokens.js`):

### Theme tokens (e.g., `themes/Health - SEM.tokens.json`)

```json
{
  "Color": {
    "Button": {
      "Primary": {
        "primary-bg": {
          "$type": "color",
          "$value": {
            "colorSpace": "srgb",
            "components": [0.396, 0.494, 0.474],
            "alpha": 1,
            "hex": "#657E79"
          },
          "$extensions": {
            "com.figma.variableId": "VariableID:5059:407"
          }
        }
      }
    },
    "Background": {
      "bg-white": {
        "$type": "color",
        "$value": {
          "hex": "#FFFFFF"
        }
      }
    }
  }
}
```

### Typography tokens (e.g., `typography/Desktop.tokens.json`)

```json
{
  "Font Family": {
    "SEM": {
      "font-family-serif": {
        "$type": "string",
        "$value": "Georgia"
      }
    }
  },
  "Font Size": {
    "heading-lg": {
      "$type": "number",
      "$value": 48
    }
  }
}
```

### Breakpoint tokens (e.g., `breakpoints/Desktop.tokens.json`)

```json
{
  "Breakpoint": {
    "desktop": {
      "$type": "number",
      "$value": 1440
    }
  },
  "Grid": {
    "columns": {
      "$type": "number",
      "$value": 12
    },
    "margin": {
      "$type": "number",
      "$value": 80
    },
    "gutter": {
      "$type": "number",
      "$value": 24
    }
  }
}
```

---

## Folder Structure After Export

```
figma_tokens/
├── themes/
│   ├── Health - SEM.tokens.json
│   ├── Home - SEM.tokens.json
│   ├── LLM.tokens.json
│   ├── ForbesMedia - SEO.tokens.json
│   └── Advisor SEM/
│       └── Compare Coverage.tokens.json
├── typography/
│   ├── Desktop.tokens.json
│   ├── Tablet.tokens.json
│   └── Mobile.tokens.json
└── breakpoints/
    ├── Desktop.tokens.json
    ├── Tablet.tokens.json
    └── Mobile.tokens.json
```

---

## Integration with Build Pipeline

After exporting from Figma:

1. Place JSON files in `figma_tokens/` directory
2. Run the transform script:

```bash
npm run build:tokens
# or
node scripts/transform-tokens.js
```

3. This generates:
   - `dist/tokens.css` - CSS variables
   - `dist/tokens.json` - Combined JSON
   - `dist/tokens.ts` - TypeScript types
   - `dist/tailwind.config.js` - Tailwind theme

---

## Checklist

- [ ] Task 10.1: Plugin project created
- [ ] Task 10.2: UI implemented
- [ ] Task 10.3: Export logic implemented
- [ ] Task 10.4: Plugin installed in Figma
- [ ] Task 10.5: Download functionality works
- [ ] Task 10.6: API sync (optional)
- [ ] Exports match expected format
- [ ] Integration with build pipeline tested

---

## Troubleshooting

### "No variable collections found"
- Ensure your Figma file has Variables (not just Styles)
- Variables are found in the right sidebar under "Local variables"

### "Export failed"
- Check the console for detailed errors
- Ensure variables have values set for the selected modes

### "Sync failed"
- Verify the API URL is correct
- Check API key is valid
- Ensure the API endpoint is deployed and accessible

### Variables not appearing in export
- Check variable naming matches expected patterns
- Ensure variables are not hidden from publishing
- Try enabling "Include Figma metadata" to debug

---

## Next Steps

After completing this phase:

1. Export your Figma variables using the plugin
2. Place files in `figma_tokens/` directory
3. Run `npm run build:tokens` to generate CSS/TS
4. Verify tokens appear in the admin dashboard
5. Components can now use the design tokens
