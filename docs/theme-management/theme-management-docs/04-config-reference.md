# Config Reference

## Overview

All tunable values are externalized to config files. This enables adjustment without code changes and documents the provenance of each value.

---

## Config Files

| File | Purpose | Format |
|------|---------|--------|
| `config/theme-defaults.json` | Default values for new themes | JSON |
| `config/parser.json` | Token parser settings | JSON |
| `config/editor.json` | Editor behavior settings | JSON |
| `config/export.json` | Export format options | JSON |

---

## Theme Defaults

**File:** `config/theme-defaults.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `maxNameLength` | 100 | number | Engineering | Reasonable display length |
| `maxDescriptionLength` | 500 | number | Engineering | Fits in UI card |
| `slugPrefix` | "theme-" | string | Engineering | CSS class compatibility |
| `defaultStatus` | "draft" | string | Engineering | Safe default |

### Schema

```json
{
  "maxNameLength": {
    "type": "number",
    "description": "Maximum characters for theme name",
    "default": 100,
    "validRange": "1-255"
  },
  "maxDescriptionLength": {
    "type": "number",
    "description": "Maximum characters for theme description",
    "default": 500,
    "validRange": "1-2000"
  },
  "slugPrefix": {
    "type": "string",
    "description": "Prefix for generated slugs",
    "default": "theme-",
    "validValues": ["theme-", "t-", ""]
  },
  "defaultStatus": {
    "type": "string",
    "description": "Status for newly created themes",
    "default": "draft",
    "validValues": ["draft", "published"]
  }
}
```

---

## Parser Settings

**File:** `config/parser.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `maxFileSizeMB` | 5 | number | Engineering | UX + performance balance |
| `categoryPatterns.color` | `^color` | regex | Research | Figma naming convention |
| `categoryPatterns.typography` | `^(font\|typography\|type\|text)` | regex | Research | Common prefixes |
| `categoryPatterns.spacing` | `^(spacing\|space\|gap\|margin\|padding)` | regex | Research | Common prefixes |
| `categoryPatterns.shadow` | `^(shadow\|elevation)` | regex | Research | Common prefixes |
| `categoryPatterns.radius` | `^(radius\|corner\|border-radius)` | regex | Research | Common prefixes |
| `categoryPatterns.grid` | `^(grid\|column\|gutter\|breakpoint)` | regex | Research | Common prefixes |
| `defaultCategory` | "other" | string | Engineering | Fallback for unmatched |

### Schema

```json
{
  "maxFileSizeMB": {
    "type": "number",
    "description": "Maximum upload file size in megabytes",
    "default": 5,
    "validRange": "1-50"
  },
  "categoryPatterns": {
    "type": "object",
    "description": "Regex patterns for category detection (case-insensitive)",
    "properties": {
      "color": { "type": "string", "default": "^color" },
      "typography": { "type": "string", "default": "^(font|typography|type|text)" },
      "spacing": { "type": "string", "default": "^(spacing|space|gap|margin|padding)" },
      "shadow": { "type": "string", "default": "^(shadow|elevation)" },
      "radius": { "type": "string", "default": "^(radius|corner|border-radius)" },
      "grid": { "type": "string", "default": "^(grid|column|gutter|breakpoint)" }
    }
  },
  "defaultCategory": {
    "type": "string",
    "description": "Category for tokens that don't match any pattern",
    "default": "other"
  }
}
```

---

## Editor Settings

**File:** `config/editor.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `autoSaveIntervalMs` | 60000 | number | Provisional | 60 seconds |
| `undoHistoryLimit` | 50 | number | Engineering | Memory vs. usability |
| `colorPickerFormats` | ["hex", "rgb", "hsl"] | array | Engineering | Common formats |
| `previewViewports.desktop` | 1440 | number | Research | Common breakpoint |
| `previewViewports.tablet` | 768 | number | Research | Common breakpoint |
| `previewViewports.mobile` | 375 | number | Research | iPhone viewport |

### Schema

```json
{
  "autoSaveIntervalMs": {
    "type": "number",
    "description": "Milliseconds between auto-saves (0 to disable)",
    "default": 60000,
    "validRange": "0-300000"
  },
  "undoHistoryLimit": {
    "type": "number",
    "description": "Maximum undo steps to retain",
    "default": 50,
    "validRange": "10-200"
  },
  "colorPickerFormats": {
    "type": "array",
    "description": "Color formats available in picker",
    "default": ["hex", "rgb", "hsl"],
    "validValues": ["hex", "rgb", "hsl", "hsb"]
  },
  "previewViewports": {
    "type": "object",
    "description": "Viewport widths for preview toggle",
    "properties": {
      "desktop": { "type": "number", "default": 1440 },
      "tablet": { "type": "number", "default": 768 },
      "mobile": { "type": "number", "default": 375 }
    }
  }
}
```

---

## Export Settings

**File:** `config/export.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `css.includeReset` | false | boolean | Engineering | Optional CSS reset |
| `css.scopeClass` | null | string | Engineering | Optional scoping class |
| `css.minify` | false | boolean | Engineering | Production optimization |
| `json.prettyPrint` | true | boolean | Engineering | Readability default |
| `json.includeFigmaMetadata` | true | boolean | Research | Round-trip compatibility |
| `tailwind.version` | "3.x" | string | Research | Current major version |

### Schema

```json
{
  "css": {
    "type": "object",
    "properties": {
      "includeReset": {
        "type": "boolean",
        "description": "Include CSS reset in export",
        "default": false
      },
      "scopeClass": {
        "type": "string|null",
        "description": "CSS class to scope variables under",
        "default": null
      },
      "minify": {
        "type": "boolean",
        "description": "Minify CSS output",
        "default": false
      }
    }
  },
  "json": {
    "type": "object",
    "properties": {
      "prettyPrint": {
        "type": "boolean",
        "description": "Format JSON with indentation",
        "default": true
      },
      "includeFigmaMetadata": {
        "type": "boolean",
        "description": "Include $extensions with Figma variable IDs",
        "default": true
      }
    }
  },
  "tailwind": {
    "type": "object",
    "properties": {
      "version": {
        "type": "string",
        "description": "Target Tailwind CSS version",
        "default": "3.x",
        "validValues": ["2.x", "3.x", "4.x"]
      }
    }
  }
}
```

---

## Provenance Legend

- **Research** — Value derived from Figma documentation, industry standards, or analyzed data
- **Engineering** — Value chosen based on engineering judgment, documented rationale
- **Provisional** — Educated guess requiring empirical validation

---

## Calibration Backlog

Values requiring empirical validation:

| Config Key | Current Value | Validation Method | Priority |
|------------|---------------|-------------------|----------|
| `autoSaveIntervalMs` | 60000 | User feedback on save frequency | Medium |
| `maxFileSizeMB` | 5 | Test with real Figma exports | High |
| `undoHistoryLimit` | 50 | Memory profiling | Low |
| `categoryPatterns.*` | See above | Accuracy test on 100+ tokens | High |

---

## Updating Config Values

When updating a value:

1. Document the reason for change in commit message
2. Update provenance if confidence level changed
3. If changing from Provisional → Research/Engineering, document the evidence
4. Test affected functionality
5. Update this reference document
