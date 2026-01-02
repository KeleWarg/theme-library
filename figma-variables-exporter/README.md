# Figma Variables Exporter

Export Figma Variables to DTCG JSON format.

## Installation

1. Open Figma Desktop
2. Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this folder

## Usage

1. Open a Figma file with Variables
2. Run plugin (Plugins → Development → Variables Exporter)
3. Select collections to export
4. Click "Export JSON"

## Export Format (DTCG)

```json
{
  "Color": {
    "primary": {
      "$type": "color",
      "$value": { "hex": "#657E79", "alpha": 1 }
    }
  }
}
```

## API Sync

1. Enter dashboard URL
2. Enter API key
3. Click Sync

## Development

```bash
npm install
npm run build
```

