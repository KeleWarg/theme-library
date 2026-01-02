# Chunk 1.03 — Token Parser

## Purpose
Create a parser that transforms Figma Variables JSON export format into our internal ParsedToken structure.

---

## Inputs
- Figma Variables JSON object (raw parsed JSON)
- Category patterns from config (see 04-config-reference.md)

## Outputs
- `src/lib/tokenParser.js` (consumed by chunks 2.02, 2.03, 2.04)
- ParseResult object containing tokens array, errors, warnings, metadata

---

## Dependencies
- None (can be developed in parallel with 1.01)

---

## Implementation Notes

### Key Considerations
- Recursive traversal to handle arbitrary nesting depth
- Skip `$extensions` and other `$`-prefixed keys except `$type` and `$value`
- Preserve Figma variable IDs for round-trip compatibility
- Handle both hex-only and components-based color values

### Gotchas
- Some tokens may have `$value` without `$type` — treat as "unknown"
- Root-level `$extensions` contains mode name, not a token
- RGB components are 0-1 range, not 0-255
- Path segments become category/subcategory/group

### Algorithm/Approach
1. Validate input is object (not array, null, string)
2. Recursively traverse all keys
3. When `$type` or `$value` found, extract token
4. Detect category from path using regex patterns
5. Generate CSS variable name from path
6. Collect into result object with metadata

---

## Files Created
- `src/lib/tokenParser.js` — Parser implementation

---

## Implementation

```javascript
// src/lib/tokenParser.js

// Category detection patterns (from config)
const CATEGORY_PATTERNS = {
  color: /^color/i,
  typography: /^(font|typography|type|text)/i,
  spacing: /^(spacing|space|gap|margin|padding)/i,
  shadow: /^(shadow|elevation)/i,
  radius: /^(radius|corner|border-radius)/i,
  grid: /^(grid|column|gutter|breakpoint|margin)/i,
}

/**
 * Parse a Figma Variables JSON file
 * @param {Object} jsonData - Parsed JSON object
 * @returns {ParseResult} - { tokens, errors, warnings, metadata }
 */
export function parseTokenFile(jsonData) {
  const result = {
    tokens: [],
    errors: [],
    warnings: [],
    metadata: {
      totalTokens: 0,
      categories: {},
    }
  }

  try {
    if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
      result.errors.push('Invalid input: expected a JSON object')
      return result
    }

    traverseTokens(jsonData, [], result)

    // Build category summary
    result.tokens.forEach(token => {
      result.metadata.categories[token.category] = 
        (result.metadata.categories[token.category] || 0) + 1
    })
    result.metadata.totalTokens = result.tokens.length

  } catch (error) {
    result.errors.push(`Parse error: ${error.message}`)
  }

  return result
}

/**
 * Recursively traverse token structure
 */
function traverseTokens(obj, path, result) {
  if (!obj || typeof obj !== 'object') return

  // Check if this is a token (has $type or $value)
  if (obj.$type !== undefined || obj.$value !== undefined) {
    const token = extractToken(obj, path)
    if (token) {
      result.tokens.push(token)
    }
    return
  }

  // Skip root-level $extensions (contains mode name)
  if (path.length === 0 && obj.$extensions) {
    // Could extract mode name here if needed
  }

  // Recurse into children
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue // Skip $ properties
    if (value && typeof value === 'object') {
      traverseTokens(value, [...path, key], result)
    }
  }
}

/**
 * Extract token data from a token object
 */
function extractToken(tokenObj, path) {
  if (path.length === 0) return null

  const name = path[path.length - 1]
  const category = detectCategory(path)
  const subcategory = path.length > 2 ? path.slice(1, -1).join('/') : null
  const groupName = path.length > 1 ? path[0] : null
  
  // Process value based on type
  let processedValue = tokenObj.$value
  const tokenType = tokenObj.$type || 'unknown'

  if (tokenType === 'color' && typeof processedValue === 'object') {
    processedValue = {
      hex: processedValue.hex || rgbComponentsToHex(processedValue.components),
      alpha: processedValue.alpha ?? 1,
      colorSpace: processedValue.colorSpace || 'srgb',
      components: processedValue.components,
    }
  } else if (tokenType === 'number') {
    processedValue = {
      value: processedValue,
      unit: detectUnit(path, processedValue),
    }
  } else if (tokenType === 'string') {
    processedValue = { value: processedValue }
  }

  // Extract Figma metadata
  const extensions = tokenObj.$extensions || {}
  const figmaId = extensions['com.figma.variableId'] || null
  const aliasData = extensions['com.figma.aliasData'] || null

  return {
    name,
    category,
    subcategory,
    group_name: groupName,
    value: processedValue,
    type: tokenType,
    css_variable: generateCSSVariableName(category, subcategory, name),
    figma_variable_id: figmaId,
    alias_reference: aliasData?.targetVariableName || null,
    path: path.join('/'),
    sort_order: 0,
  }
}

/**
 * Detect category from path segments
 */
function detectCategory(path) {
  const fullPath = path.join('/').toLowerCase()
  
  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(fullPath)) {
      return category
    }
  }
  
  return 'other'
}

/**
 * Detect unit for number values based on context
 */
function detectUnit(path, value) {
  const name = path.join('/').toLowerCase()
  
  if (name.includes('weight')) return ''
  if (name.includes('line-height') || name.includes('lineheight')) {
    return value > 10 ? 'px' : ''
  }
  if (name.includes('size') || name.includes('spacing') || 
      name.includes('margin') || name.includes('padding') ||
      name.includes('gutter') || name.includes('breakpoint') ||
      name.includes('width') || name.includes('radius')) {
    return 'px'
  }
  
  return ''
}

/**
 * Generate CSS variable name from path components
 */
function generateCSSVariableName(category, subcategory, name) {
  const parts = [category]
  if (subcategory) {
    parts.push(...subcategory.split('/').map(normalize))
  }
  parts.push(normalize(name))
  
  return '--' + parts.join('-')
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Convert RGB components (0-1 range) to hex
 */
function rgbComponentsToHex(components) {
  if (!components || components.length < 3) return '#000000'
  
  const toHex = (val) => {
    const hex = Math.round(val * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return '#' + components.slice(0, 3).map(toHex).join('').toUpperCase()
}

/**
 * Validate JSON file structure before parsing
 */
export function validateTokenFile(jsonData) {
  const errors = []
  const warnings = []

  if (!jsonData || typeof jsonData !== 'object') {
    errors.push('Invalid JSON: expected an object')
    return { valid: false, errors, warnings, detected: {} }
  }

  if (Array.isArray(jsonData)) {
    errors.push('Invalid format: expected object, got array')
    return { valid: false, errors, warnings, detected: {} }
  }

  // Detect known categories
  const detected = {
    hasColor: 'Color' in jsonData || 'color' in jsonData,
    hasTypography: 'Font' in jsonData || 'Typography' in jsonData,
    hasSpacing: 'Spacing' in jsonData || 'spacing' in jsonData,
    hasGrid: 'Breakpoint' in jsonData || 'Grid' in jsonData,
  }

  const hasKnownCategories = Object.values(detected).some(Boolean)
  if (!hasKnownCategories) {
    warnings.push('No recognized token categories found. File may not be a Figma Variables export.')
  }

  return { valid: errors.length === 0, errors, warnings, detected }
}

/**
 * Group tokens by category for UI display
 */
export function groupTokensByCategory(tokens) {
  const grouped = {}
  
  tokens.forEach(token => {
    if (!grouped[token.category]) {
      grouped[token.category] = []
    }
    grouped[token.category].push(token)
  })

  // Sort within each category
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => 
      a.sort_order - b.sort_order || a.name.localeCompare(b.name)
    )
  })

  return grouped
}
```

---

## Tests

### Unit Tests
- [ ] `parseTokenFile` handles empty object
- [ ] `parseTokenFile` extracts color tokens with hex
- [ ] `parseTokenFile` extracts color tokens from components
- [ ] `parseTokenFile` extracts number tokens
- [ ] `parseTokenFile` preserves Figma variable ID
- [ ] `parseTokenFile` detects alias references
- [ ] `detectCategory` matches color pattern
- [ ] `detectCategory` matches typography pattern
- [ ] `detectCategory` returns 'other' for unknown
- [ ] `generateCSSVariableName` produces correct format
- [ ] `rgbComponentsToHex` converts correctly
- [ ] `validateTokenFile` rejects arrays
- [ ] `validateTokenFile` warns on unknown structure

### Integration Tests
- [ ] Parse Health_-_SEM_tokens.json successfully
- [ ] Parse Desktop_tokens.json successfully
- [ ] All 5 project JSON files parse without errors

### Verification
- [ ] Console log parse result for real file
- [ ] Verify token count matches expected
- [ ] Verify category distribution is reasonable

---

## Time Estimate
3 hours

---

## Notes
- Parser is pure functions with no side effects — easy to test
- Consider adding streaming parser for very large files (future)
- Category patterns could be moved to config file for easier tuning
