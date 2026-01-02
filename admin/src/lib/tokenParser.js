// src/lib/tokenParser.js

// Category detection patterns (from config-reference.md)
const CATEGORY_PATTERNS = {
  color: /^color/i,
  typography: /^(font|typography|type|text|line[\s-]?height|letter[\s-]?spacing)/i,
  spacing: /^(spacing|space|gap|margin|padding)/i,
  shadow: /^(shadow|elevation)/i,
  radius: /^(radius|corner|border-radius)/i,
  grid: /^(grid|column|gutter|breakpoint)/i,
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
      modeName: null,
    }
  }

  try {
    if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
      result.errors.push('Invalid input: expected a JSON object')
      return result
    }

    // Extract mode name from root-level $extensions
    if (jsonData.$extensions?.['com.figma.modeName']) {
      result.metadata.modeName = jsonData.$extensions['com.figma.modeName']
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
  if (name.includes('line-height') || name.includes('lineheight') || name.includes('line height')) {
    return value > 10 ? 'px' : ''
  }
  if (name.includes('letter') && name.includes('spacing')) {
    // Letter spacing is typically in px or em, but Figma exports as raw numbers
    return 'px'
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
export function generateCSSVariableName(category, subcategory, name) {
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
export function rgbComponentsToHex(components) {
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

  // Detect known categories (case-insensitive check)
  const keys = Object.keys(jsonData).map(k => k.toLowerCase())
  const detected = {
    hasColor: keys.some(k => k.includes('color')),
    hasTypography: keys.some(k => k.includes('font') || k.includes('typography') || k.includes('line height') || k.includes('letter spacing')),
    hasSpacing: keys.some(k => k.includes('spacing') || k.includes('space')),
    hasGrid: keys.some(k => k.includes('breakpoint') || k.includes('grid')),
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

/**
 * Get token statistics from a parse result
 */
export function getTokenStats(parseResult) {
  const stats = {
    total: parseResult.metadata.totalTokens,
    byCategory: { ...parseResult.metadata.categories },
    byType: {},
    hasErrors: parseResult.errors.length > 0,
    hasWarnings: parseResult.warnings.length > 0,
  }

  // Count by type
  parseResult.tokens.forEach(token => {
    stats.byType[token.type] = (stats.byType[token.type] || 0) + 1
  })

  return stats
}

/**
 * Filter tokens by category
 */
export function filterTokensByCategory(tokens, category) {
  if (!category || category === 'all') return tokens
  return tokens.filter(t => t.category === category)
}

/**
 * Search tokens by name or path
 */
export function searchTokens(tokens, query) {
  if (!query || query.trim() === '') return tokens
  const lowerQuery = query.toLowerCase()
  return tokens.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.path.toLowerCase().includes(lowerQuery) ||
    t.css_variable.toLowerCase().includes(lowerQuery)
  )
}

