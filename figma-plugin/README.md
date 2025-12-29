# Figma Variables Exporter Plugin

A Figma plugin that exports design variables (colors, typography, spacing) to JSON files compatible with the design system build pipeline.

## Installation

### 1. Install dependencies

```bash
cd figma-plugin
npm install
```

### 2. Build the plugin

```bash
npm run build
```

This compiles `src/code.ts` to `code.js`.

### 3. Install in Figma

1. Open Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this folder
4. The plugin appears under **Plugins** → **Development**

## Usage

1. Open a Figma file with Variables configured
2. Run the plugin: **Plugins** → **Development** → **Design System Variables Exporter**
3. Select which variable collections to export
4. Choose export options:
   - **Colors** - Button, background, foreground colors
   - **Typography** - Font families, sizes, weights
   - **Breakpoints** - Grid columns, margins, gutters
5. Click **Export to JSON**
6. Files are downloaded automatically

## Output Format

The plugin exports JSON in DTCG (Design Tokens Community Group) format:

```json
{
  "Color": {
    "Button": {
      "Primary": {
        "primary-bg": {
          "$type": "color",
          "$value": {
            "hex": "#657E79"
          }
        }
      }
    }
  }
}
```

## File Structure

After export, place files in the `figma_tokens/` directory:

```
figma_tokens/
├── themes/
│   ├── Health - SEM.tokens.json
│   └── ...
├── typography/
│   ├── Desktop.tokens.json
│   └── ...
└── breakpoints/
    └── ...
```

Then run the build script:

```bash
npm run build:tokens
```

## API Sync (Optional)

You can sync directly to the admin dashboard:

1. Enter your dashboard API URL
2. Enter your API key
3. Click **Sync to Dashboard**

## Development

Watch for changes:

```bash
npm run watch
```

## Troubleshooting

### "No variable collections found"
- Ensure your Figma file has **Variables** (not just Styles)
- Variables are in the right sidebar under "Local variables"

### "Export failed"
- Check variable values are set for selected modes
- Open Figma console for detailed errors

See `docs/PHASE_10_FIGMA_PLUGIN.md` for full documentation.
