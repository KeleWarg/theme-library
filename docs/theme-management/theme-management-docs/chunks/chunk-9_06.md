# Chunk 9.06 — Plugin Testing

## Purpose
Manual testing, documentation, and final verification.

---

## Inputs
- Complete plugin (from chunks 9.01-9.05)

## Outputs
- README.md documentation
- Verified working plugin

---

## Dependencies
- Chunk 9.05 must be complete

---

## Files Created
- `figma-variables-exporter/README.md`

---

## Implementation

### `README.md`

```markdown
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

\`\`\`json
{
  "Color": {
    "primary": {
      "$type": "color",
      "$value": { "hex": "#657E79", "alpha": 1 }
    }
  }
}
\`\`\`

## API Sync

1. Enter dashboard URL
2. Enter API key
3. Click Sync

## Development

\`\`\`bash
npm install
npm run build
\`\`\`
```

---

## Manual Testing Checklist

### Build
- [ ] `npm run build` succeeds
- [ ] `code.js` generated

### Load
- [ ] Plugin loads in Figma Desktop
- [ ] UI opens correctly

### Export
- [ ] Collections populate
- [ ] Export creates valid JSON
- [ ] Multiple modes work
- [ ] Filtering works

### Sync
- [ ] Requires URL and key
- [ ] Shows errors appropriately
- [ ] Data appears in dashboard

---

## Verification
- [ ] All manual tests pass
- [ ] README complete

---

## Time Estimate
0.5 hours
