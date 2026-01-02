# Design System Component Syncer

A Figma plugin that extracts component metadata and syncs it to your Design System Admin Dashboard.

## Features

- **Extract Component Data**: Automatically extracts name, description, variants, props, and tokens from selected Figma components
- **PNG Snapshot**: Exports a high-res PNG preview of the component
- **Prop Types**: Maps Figma variant properties to React prop types
- **Token Detection**: Identifies which design tokens are used in the component
- **Dashboard Sync**: Sends component data directly to your admin dashboard API

## Installation

### 1. Build the Plugin

```bash
cd figma-plugin
npm install
npm run build
```

This compiles `src/code.ts` to `code.js`.

### 2. Import into Figma

1. Open Figma Desktop
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this folder
4. The plugin will appear under **Plugins** → **Development**

## Usage

### Extract a Component

1. Select a **Component** or **Component Set** in Figma
2. Run the plugin: **Plugins** → **Development** → **Design System Component Syncer**
3. View the extracted metadata in the plugin UI

### Sync to Dashboard

1. Set the **Dashboard API URL** (default: `http://localhost:5173/api/components`)
2. Click **Sync to Dashboard**
3. The component data is POSTed to your API

### Copy JSON

Click **Copy JSON** to copy the extracted component data to your clipboard.

## API Payload

When syncing, the plugin sends a POST request with this structure:

```json
{
  "figma_id": "123:456",
  "name": "Button",
  "description": "Primary action button",
  "variants": [
    {
      "name": "primary",
      "properties": { "State": "Default", "Size": "Medium" }
    },
    {
      "name": "secondary",
      "properties": { "State": "Hover", "Size": "Large" }
    }
  ],
  "prop_types": [
    { "name": "state", "type": "'Default' | 'Hover' | 'Disabled'", "default": "Default" },
    { "name": "size", "type": "'Small' | 'Medium' | 'Large'", "default": "Medium" },
    { "name": "children", "type": "React.ReactNode" },
    { "name": "onClick", "type": "() => void" }
  ],
  "tokens_used": [
    "var(--color-btn-primary-bg)",
    "var(--color-btn-primary-text)"
  ],
  "snapshot_url": "data:image/png;base64,...",
  "figma_url": "https://www.figma.com/file/xxx?node-id=123:456",
  "status": "pending_code"
}
```

## Development

### Watch Mode

For development, run TypeScript in watch mode:

```bash
npm run watch
```

### File Structure

```
figma-plugin/
├── manifest.json      # Plugin configuration
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── src/
│   └── code.ts        # Plugin logic (compiles to code.js)
├── ui.html            # Plugin UI
├── code.js            # Compiled output (generated)
└── README.md
```

## Troubleshooting

### "Please select a component"
- Make sure you have a **Component** or **Component Set** selected, not a **Frame** or **Instance**

### "Network error"
- Verify the API URL is correct
- Check that your admin dashboard server is running
- Ensure CORS is enabled on your API

### Tokens not detected
- Make sure your component uses Figma Variables (not just colors)
- Tokens are detected from bound variables on fills, strokes, and effects

## Dashboard Integration

Add this API endpoint to your admin dashboard to receive synced components:

```javascript
// pages/api/components.js (Next.js) or equivalent
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const componentData = req.body

  // Save to database
  const { data, error } = await supabase
    .from('components')
    .upsert({
      figma_id: componentData.figma_id,
      name: componentData.name,
      description: componentData.description,
      variants: componentData.variants,
      prop_types: componentData.prop_types,
      tokens_used: componentData.tokens_used,
      snapshot_url: componentData.snapshot_url,
      figma_url: componentData.figma_url,
      status: componentData.status || 'pending_code'
    }, {
      onConflict: 'figma_id'
    })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ success: true, component: data })
}
```
