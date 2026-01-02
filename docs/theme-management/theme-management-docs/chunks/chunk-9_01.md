# Chunk 9.01 — Plugin Scaffold

## Purpose
Create Figma plugin project structure.

---

## Inputs
- None (standalone, can run parallel to Phases 6-8)

## Outputs
- `figma-variables-exporter/` directory structure

---

## Dependencies
- None

---

## Files Created
- `figma-variables-exporter/manifest.json`
- `figma-variables-exporter/package.json`
- `figma-variables-exporter/tsconfig.json`

---

## Implementation

### `manifest.json`

```json
{
  "name": "Design System Variables Exporter",
  "id": "design-system-variables-exporter",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": { "allowedDomains": ["*"] }
}
```

### `package.json`

```json
{
  "name": "figma-variables-exporter",
  "version": "1.0.0",
  "scripts": { "build": "tsc", "watch": "tsc --watch" },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@figma/plugin-typings": "^1.85.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "outDir": "./",
    "rootDir": "./src",
    "typeRoots": ["./node_modules/@figma"]
  },
  "include": ["src/**/*"]
}
```

---

## Verification
- [ ] `npm install` succeeds
- [ ] Directory structure correct

---

## Time Estimate
0.5 hours
