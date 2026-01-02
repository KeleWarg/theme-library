/**
 * Export Generators
 * Generate various export formats from theme tokens
 * Chunk 4.04 - Export Generators
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract the raw value from a token value object
 * @param {Object|string} value - Token value (can be object with hex/rgba or string)
 * @returns {string} The raw value string
 */
function extractValue(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    // Handle color objects
    if (value.hex) return value.hex
    if (value.rgba) {
      const { r, g, b, a } = value.rgba
      return a !== undefined && a < 1 
        ? `rgba(${r}, ${g}, ${b}, ${a})`
        : `rgb(${r}, ${g}, ${b})`
    }
    // Handle other primitive values
    if (value.value !== undefined) return String(value.value)
    // Fallback to JSON stringification for complex objects
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Minify CSS by removing whitespace and comments
 * @param {string} css - CSS string
 * @returns {string} Minified CSS
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .replace(/\s*([{:;,}])\s*/g, '$1') // Remove space around punctuation
    .replace(/;}/g, '}')               // Remove trailing semicolons
    .trim()
}

/**
 * Sanitize SCSS variable name to ensure validity
 * SCSS variables can't start with numbers
 * @param {string} name - Variable name
 * @returns {string} Valid SCSS variable name
 */
function sanitizeSCSSVariableName(name) {
  // Remove leading dashes and convert to lowercase
  let sanitized = name.replace(/^-+/, '').replace(/\s+/g, '-').toLowerCase()
  
  // If name starts with a number, prefix with underscore
  if (/^\d/.test(sanitized)) {
    sanitized = '_' + sanitized
  }
  
  return sanitized
}

/**
 * Format CSS with proper indentation
 * @param {string} css - CSS string
 * @returns {string} Formatted CSS
 */
function formatCSS(css) {
  let formatted = ''
  let indentLevel = 0
  const indent = '  '
  
  // Split on meaningful boundaries
  const tokens = css.split(/([{};])/)
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim()
    if (!token) continue
    
    if (token === '{') {
      formatted += ' {\n'
      indentLevel++
    } else if (token === '}') {
      indentLevel--
      formatted += indent.repeat(indentLevel) + '}\n'
    } else if (token === ';') {
      formatted += ';\n'
    } else {
      // Property or selector
      formatted += indent.repeat(indentLevel) + token
    }
  }
  
  return formatted.trim()
}

// ============================================================================
// CSS EXPORT
// ============================================================================

/**
 * Generate CSS variables from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Export options
 * @param {boolean} options.minify - Minify output
 * @param {boolean} options.includeComments - Include category comments
 * @param {string} options.scopeClass - Scope variables to a class (null for :root)
 * @returns {string} CSS output
 */
export function generateCSS(tokens, options = {}) {
  const { minify = false, includeComments = true, scopeClass = null } = options
  
  if (!tokens || tokens.length === 0) {
    return scopeClass 
      ? `.${scopeClass} {\n  /* No tokens */\n}`
      : ':root {\n  /* No tokens */\n}'
  }
  
  // Group tokens by category
  const grouped = tokens.reduce((acc, token) => {
    const category = token.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(token)
    return acc
  }, {})
  
  // Generate CSS
  const selector = scopeClass ? `.${scopeClass}` : ':root'
  let css = `${selector} {\n`
  
  const categories = Object.keys(grouped).sort()
  categories.forEach((category, idx) => {
    if (includeComments && !minify) {
      if (idx > 0) css += '\n'
      css += `  /* ${category.charAt(0).toUpperCase() + category.slice(1)} */\n`
    }
    
    grouped[category].forEach(token => {
      const varName = token.css_variable || `--${token.name}`
      const value = extractValue(token.value)
      css += `  ${varName}: ${value};\n`
    })
  })
  
  css += '}'
  
  return minify ? minifyCSS(css) : css
}

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Generate JSON from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Export options
 * @param {boolean} options.prettyPrint - Format with indentation
 * @param {boolean} options.includeFigmaMetadata - Include Figma variable IDs
 * @returns {string} JSON output
 */
export function generateJSON(tokens, options = {}) {
  const { prettyPrint = true, includeFigmaMetadata = true } = options
  
  if (!tokens || tokens.length === 0) {
    return prettyPrint ? '{\n  "tokens": []\n}' : '{"tokens":[]}'
  }
  
  // Group tokens by category and subcategory for structured output
  const structured = {}
  
  tokens.forEach(token => {
    const category = token.category || 'other'
    const subcategory = token.subcategory || '_root'
    
    if (!structured[category]) structured[category] = {}
    if (!structured[category][subcategory]) structured[category][subcategory] = {}
    
    const tokenData = {
      $type: getTokenType(token),
      $value: token.value
    }
    
    // Add Figma metadata if requested and available
    if (includeFigmaMetadata && token.figma_variable_id) {
      tokenData.$extensions = {
        'com.figma': {
          variableId: token.figma_variable_id
        }
      }
    }
    
    structured[category][subcategory][token.name] = tokenData
  })
  
  // Clean up _root subcategories
  Object.keys(structured).forEach(category => {
    if (structured[category]._root) {
      const rootTokens = structured[category]._root
      delete structured[category]._root
      Object.assign(structured[category], rootTokens)
    }
  })
  
  return prettyPrint 
    ? JSON.stringify(structured, null, 2)
    : JSON.stringify(structured)
}

/**
 * Get DTCG token type from token data
 * @param {Object} token - Token object
 * @returns {string} Token type
 */
function getTokenType(token) {
  const category = (token.category || '').toLowerCase()
  const value = token.value
  
  // Type inference based on category
  if (category.includes('color')) return 'color'
  if (category.includes('font') && category.includes('size')) return 'dimension'
  if (category.includes('font') && category.includes('weight')) return 'fontWeight'
  if (category.includes('font') && category.includes('family')) return 'fontFamily'
  if (category.includes('spacing')) return 'dimension'
  if (category.includes('shadow')) return 'shadow'
  if (category.includes('radius')) return 'dimension'
  if (category.includes('line-height') || category.includes('lineheight')) return 'number'
  if (category.includes('letter-spacing') || category.includes('letterspacing')) return 'dimension'
  if (category.includes('typography')) return 'typography'
  
  // Type inference based on value
  if (typeof value === 'object') {
    if (value.hex || value.rgba) return 'color'
  }
  if (typeof value === 'string') {
    if (value.match(/^#[0-9a-fA-F]{3,8}$/)) return 'color'
    if (value.match(/^rgba?\(/)) return 'color'
    if (value.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) return 'dimension'
  }
  
  return 'string'
}

// ============================================================================
// TAILWIND EXPORT
// ============================================================================

/**
 * Generate Tailwind config from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Export options
 * @param {string} options.version - Tailwind version ('3.x' or '4.x')
 * @returns {string} Tailwind config output
 */
export function generateTailwind(tokens, options = {}) {
  const { version = '3.x' } = options
  
  if (!tokens || tokens.length === 0) {
    return version === '4.x'
      ? '@theme {\n  /* No tokens */\n}'
      : `module.exports = {\n  theme: {\n    extend: {}\n  }\n}`
  }
  
  // Group tokens by category
  const colors = {}
  const spacing = {}
  const fontSize = {}
  const fontWeight = {}
  const fontFamily = {}
  const borderRadius = {}
  const boxShadow = {}
  const other = {}
  
  tokens.forEach(token => {
    const category = (token.category || '').toLowerCase()
    const name = token.name.replace(/\s+/g, '-').toLowerCase()
    const value = extractValue(token.value)
    
    if (category.includes('color')) {
      colors[name] = value
    } else if (category.includes('spacing') || category.includes('gap') || category.includes('margin') || category.includes('padding')) {
      spacing[name] = value
    } else if (category.includes('font') && category.includes('size')) {
      fontSize[name] = value
    } else if (category.includes('font') && category.includes('weight')) {
      fontWeight[name] = value
    } else if (category.includes('font') && category.includes('family')) {
      fontFamily[name] = [value]
    } else if (category.includes('radius') || category.includes('border-radius')) {
      borderRadius[name] = value
    } else if (category.includes('shadow')) {
      boxShadow[name] = value
    } else {
      other[name] = value
    }
  })
  
  if (version === '4.x') {
    return generateTailwind4(colors, spacing, fontSize, fontWeight, fontFamily, borderRadius, boxShadow)
  }
  
  return generateTailwind3(colors, spacing, fontSize, fontWeight, fontFamily, borderRadius, boxShadow)
}

/**
 * Generate Tailwind 3.x config
 */
function generateTailwind3(colors, spacing, fontSize, fontWeight, fontFamily, borderRadius, boxShadow) {
  const theme = {
    extend: {}
  }
  
  if (Object.keys(colors).length > 0) theme.extend.colors = colors
  if (Object.keys(spacing).length > 0) theme.extend.spacing = spacing
  if (Object.keys(fontSize).length > 0) theme.extend.fontSize = fontSize
  if (Object.keys(fontWeight).length > 0) theme.extend.fontWeight = fontWeight
  if (Object.keys(fontFamily).length > 0) theme.extend.fontFamily = fontFamily
  if (Object.keys(borderRadius).length > 0) theme.extend.borderRadius = borderRadius
  if (Object.keys(boxShadow).length > 0) theme.extend.boxShadow = boxShadow
  
  const config = {
    theme
  }
  
  // Generate formatted JS module
  let output = '/** @type {import("tailwindcss").Config} */\n'
  output += 'module.exports = ' + JSON.stringify(config, null, 2)
  
  // Convert JSON to JS (remove quotes from keys where possible)
  output = output.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:')
  
  return output
}

/**
 * Generate Tailwind 4.x CSS theme
 */
function generateTailwind4(colors, spacing, fontSize, fontWeight, fontFamily, borderRadius, boxShadow) {
  let output = '@theme {\n'
  
  if (Object.keys(colors).length > 0) {
    output += '  /* Colors */\n'
    Object.entries(colors).forEach(([name, value]) => {
      output += `  --color-${name}: ${value};\n`
    })
    output += '\n'
  }
  
  if (Object.keys(spacing).length > 0) {
    output += '  /* Spacing */\n'
    Object.entries(spacing).forEach(([name, value]) => {
      output += `  --spacing-${name}: ${value};\n`
    })
    output += '\n'
  }
  
  if (Object.keys(fontSize).length > 0) {
    output += '  /* Font Sizes */\n'
    Object.entries(fontSize).forEach(([name, value]) => {
      output += `  --font-size-${name}: ${value};\n`
    })
    output += '\n'
  }
  
  if (Object.keys(fontWeight).length > 0) {
    output += '  /* Font Weights */\n'
    Object.entries(fontWeight).forEach(([name, value]) => {
      output += `  --font-weight-${name}: ${value};\n`
    })
    output += '\n'
  }
  
  if (Object.keys(fontFamily).length > 0) {
    output += '  /* Font Families */\n'
    Object.entries(fontFamily).forEach(([name, value]) => {
      const families = Array.isArray(value) ? value.join(', ') : value
      output += `  --font-family-${name}: ${families};\n`
    })
    output += '\n'
  }
  
  if (Object.keys(borderRadius).length > 0) {
    output += '  /* Border Radius */\n'
    Object.entries(borderRadius).forEach(([name, value]) => {
      output += `  --radius-${name}: ${value};\n`
    })
    output += '\n'
  }
  
  if (Object.keys(boxShadow).length > 0) {
    output += '  /* Shadows */\n'
    Object.entries(boxShadow).forEach(([name, value]) => {
      output += `  --shadow-${name}: ${value};\n`
    })
  }
  
  // Remove trailing newline before closing brace
  output = output.trimEnd() + '\n}'
  
  return output
}

// ============================================================================
// SCSS EXPORT
// ============================================================================

/**
 * Generate SCSS variables from tokens
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Export options
 * @param {boolean} options.useMap - Generate as SCSS map
 * @param {boolean} options.includeComments - Include category comments
 * @returns {string} SCSS output
 */
export function generateSCSS(tokens, options = {}) {
  const { useMap = false, includeComments = true } = options
  
  if (!tokens || tokens.length === 0) {
    return useMap 
      ? '$tokens: ();\n' 
      : '// No tokens\n'
  }
  
  if (useMap) {
    return generateSCSSMap(tokens, includeComments)
  }
  
  return generateSCSSVariables(tokens, includeComments)
}

/**
 * Generate SCSS variables
 */
function generateSCSSVariables(tokens, includeComments) {
  // Group tokens by category
  const grouped = tokens.reduce((acc, token) => {
    const category = token.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(token)
    return acc
  }, {})
  
  let output = ''
  
  const categories = Object.keys(grouped).sort()
  categories.forEach((category, idx) => {
    if (includeComments) {
      if (idx > 0) output += '\n'
      output += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`
    }
    
    grouped[category].forEach(token => {
      let varName
      if (token.css_variable) {
        // Convert CSS variable to SCSS variable and sanitize
        const baseName = token.css_variable.replace(/^--/, '')
        varName = `$${sanitizeSCSSVariableName(baseName)}`
      } else {
        varName = `$${sanitizeSCSSVariableName(token.name)}`
      }
      const value = extractValue(token.value)
      output += `${varName}: ${value};\n`
    })
  })
  
  return output
}

/**
 * Generate SCSS map
 */
function generateSCSSMap(tokens, includeComments) {
  // Group tokens by category
  const grouped = tokens.reduce((acc, token) => {
    const category = token.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(token)
    return acc
  }, {})
  
  let output = '$tokens: (\n'
  
  const categories = Object.keys(grouped).sort()
  categories.forEach((category, catIdx) => {
    if (includeComments) {
      output += `  // ${category.charAt(0).toUpperCase() + category.slice(1)}\n`
    }
    
    // Sanitize category name for SCSS map key
    const sanitizedCategory = sanitizeSCSSVariableName(category)
    output += `  '${sanitizedCategory}': (\n`
    
    grouped[category].forEach((token, tokenIdx) => {
      // Sanitize token name for SCSS map key
      const name = sanitizeSCSSVariableName(token.name)
      const value = extractValue(token.value)
      const comma = tokenIdx < grouped[category].length - 1 ? ',' : ''
      output += `    '${name}': ${value}${comma}\n`
    })
    
    const catComma = catIdx < categories.length - 1 ? ',' : ''
    output += `  )${catComma}\n`
  })
  
  output += ');\n'
  
  return output
}

// ============================================================================
// UNIFIED EXPORT FUNCTION
// ============================================================================

/**
 * Generate export in specified format
 * @param {string} format - Export format (css, json, tailwind, scss)
 * @param {Array} tokens - Array of token objects
 * @param {Object} options - Format-specific options
 * @returns {string} Generated output
 */
export function generateExport(format, tokens, options = {}) {
  switch (format.toLowerCase()) {
    case 'css':
      return generateCSS(tokens, options)
    case 'json':
      return generateJSON(tokens, options)
    case 'tailwind':
      return generateTailwind(tokens, options)
    case 'scss':
      return generateSCSS(tokens, options)
    default:
      throw new Error(`Unknown export format: ${format}`)
  }
}

/**
 * Get file extension for format
 * @param {string} format - Export format
 * @returns {string} File extension
 */
export function getFileExtension(format) {
  switch (format.toLowerCase()) {
    case 'css': return '.css'
    case 'json': return '.json'
    case 'tailwind': return '.js'
    case 'scss': return '.scss'
    default: return '.txt'
  }
}

/**
 * Get MIME type for format
 * @param {string} format - Export format
 * @returns {string} MIME type
 */
export function getMimeType(format) {
  switch (format.toLowerCase()) {
    case 'css': return 'text/css'
    case 'json': return 'application/json'
    case 'tailwind': return 'application/javascript'
    case 'scss': return 'text/x-scss'
    default: return 'text/plain'
  }
}

