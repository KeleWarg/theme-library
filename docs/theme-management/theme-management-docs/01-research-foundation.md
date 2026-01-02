# Research Foundation

## Overview
This document grounds all technical decisions in research, prior art, or explicitly documented engineering decisions for the Theme Management System.

---

## Data Sources

| Source | What It Provides | How We Use It |
|--------|------------------|---------------|
| Figma Variables JSON Export | Token structure, types, color spaces, alias references, variable IDs | Primary import format; defines our parsing logic |
| W3C Design Tokens Format (DTCG) | Community standard for `$type`, `$value`, `$extensions` structure | Reference for understanding token semantics |
| Project token files (Health_-_SEM_tokens.json, etc.) | Real-world examples of production token structures | Test fixtures and validation targets |
| CSS Custom Properties Spec | Variable naming conventions, inheritance rules | Export format for CSS Variables |
| Tailwind CSS Config | Theme configuration structure | Export format for Tailwind |

---

## Key Scientific Decisions

### Token Type Detection
**Choice:** Infer type from `$type` field with fallback to path-based heuristics
**Rationale:** Figma Variables always include `$type`; path-based detection handles edge cases
**Source:** Figma Variables export format specification

### Color Space Handling
**Choice:** Store both sRGB components and hex; convert on import if hex missing
**Rationale:** Figma exports both; hex is human-readable, components enable precise color math
**Source:** Figma Variables JSON structure analysis (sRGB color space with 0-1 component values)

### Category Detection
**Choice:** Path-prefix matching with explicit mapping table
**Rationale:** Figma Variables use hierarchical naming (Color/Button/Primary); first segment reliably indicates category
**Source:** Analysis of 5 production token files showing consistent naming patterns

---

## Engineering Decisions

### ENGINEERING DECISION: CSS Variable Naming Convention

**Context:** Need consistent, predictable CSS variable names from arbitrary token paths
**Decision:** Generate as `--{category}-{subcategory}-{name}` with lowercase and hyphen normalization
**Rationale:** 
- Matches existing CSS variable conventions in codebase
- Lowercase prevents case-sensitivity issues
- Hyphens are standard CSS custom property separator
**Validation needed:** Verify no collisions in real token sets; ensure round-trip compatibility

### ENGINEERING DECISION: Database Token Storage

**Context:** Tokens have varying value structures (color = object with hex/components, number = primitive)
**Decision:** Store `value` as JSONB column to preserve structure flexibility
**Rationale:**
- Avoids schema changes for new token types
- Enables querying within value structure if needed
- Preserves all original data without lossy flattening
**Validation needed:** Query performance acceptable at scale (1000+ tokens per theme)

### ENGINEERING DECISION: Category Taxonomy

**Context:** Need finite set of categories for UI organization
**Decision:** Fixed categories: color, typography, spacing, shadow, radius, grid, other
**Rationale:**
- Covers 95%+ of tokens in analyzed files
- "other" provides escape hatch for unexpected types
- Small enough set for clear UI navigation
**Validation needed:** Track usage of "other" category; expand if >10% of tokens fall there

---

## Figma Variables Format Specification

### Token Structure
```json
{
  "CategoryName": {
    "GroupName": {
      "token-name": {
        "$type": "color" | "number" | "string",
        "$value": <type-specific-value>,
        "$extensions": {
          "com.figma.variableId": "VariableID:XXXX:YYY",
          "com.figma.hiddenFromPublishing": boolean,
          "com.figma.scopes": ["ALL_SCOPES"],
          "com.figma.aliasData": { ... } // Optional: for alias tokens
        }
      }
    }
  }
}
```

### Color Value Structure
```json
{
  "colorSpace": "srgb",
  "components": [0.396, 0.494, 0.475],  // 0-1 range
  "alpha": 1,
  "hex": "#657E79"  // Optional but usually present
}
```

### Number Value Structure
```json
1440  // Direct numeric value
```

### Alias Data Structure
```json
{
  "targetVariableId": "VariableID:xxx",
  "targetVariableName": "Color/Health SEM/Primary/700",
  "targetVariableSetId": "VariableCollectionId:xxx",
  "targetVariableSetName": "Primitives"
}
```

### Mode Extension (Root Level)
```json
{
  "$extensions": {
    "com.figma.modeName": "Desktop"
  }
}
```

---

## Provenance Table

| Fact/Assumption | Value | Evidence | Confidence |
|-----------------|-------|----------|------------|
| Figma exports include `$type` | Always present | Analyzed 5 production files | ✅ High |
| Color tokens always have hex | Usually present | 5 files analyzed; hex present in all | ⚠️ Medium |
| First path segment = category | Reliable pattern | Consistent in all analyzed files | ✅ High |
| sRGB components are 0-1 range | 0.0 to 1.0 | Figma documentation + file analysis | ✅ High |
| Max reasonable tokens per theme | ~500 | Largest file has ~400 tokens | ⚠️ Medium |
| JSON file size limit | 5MB | Engineering decision (UX + performance) | ❓ Low |
| Auto-save interval | 60 seconds | Engineering decision (balance freshness vs. API load) | ❓ Low |
| Slug format | `theme-{name}` | Engineering decision (CSS class compatibility) | ✅ High |

---

## Validation Backlog

| Item | Current Value | Validation Method | Priority |
|------|---------------|-------------------|----------|
| Hex always present in color tokens | Assumed true | Test with 10+ real Figma exports | High |
| Category detection accuracy | Path-prefix matching | Manual review of 100 tokens | High |
| CSS variable collision rate | 0% assumed | Generate vars for full theme, check uniqueness | Medium |
| Max tokens per theme | 500 | Load test with 1000 tokens | Medium |
| JSON parse time | <100ms assumed | Benchmark with 5MB file | Low |

---

## References

1. Figma, "Variables REST API," Figma Developer Documentation. https://www.figma.com/developers/api#variables
2. W3C Design Tokens Community Group, "Design Tokens Format Module," Draft Community Report. https://tr.designtokens.org/format/
3. Tailwind Labs, "Theme Configuration," Tailwind CSS Documentation. https://tailwindcss.com/docs/theme
4. MDN, "Using CSS custom properties," Mozilla Developer Network. https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
