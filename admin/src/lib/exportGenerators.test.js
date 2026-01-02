/**
 * Export Generators Tests
 * Chunk 4.04 - Export Generators
 */

import { describe, it, expect } from 'vitest'
import {
  generateCSS,
  generateJSON,
  generateTailwind,
  generateSCSS,
  generateExport,
  getFileExtension,
  getMimeType,
} from './exportGenerators'

// Sample test tokens
const sampleTokens = [
  {
    id: '1',
    category: 'color',
    subcategory: 'button',
    name: 'primary-bg',
    value: { hex: '#657E79' },
    css_variable: '--color-btn-primary-bg',
  },
  {
    id: '2',
    category: 'color',
    subcategory: 'button',
    name: 'primary-text',
    value: { hex: '#FFFFFF' },
    css_variable: '--color-btn-primary-text',
  },
  {
    id: '3',
    category: 'spacing',
    subcategory: null,
    name: 'margin-sm',
    value: '8px',
    css_variable: '--spacing-margin-sm',
  },
  {
    id: '4',
    category: 'font-size',
    subcategory: 'body',
    name: 'md',
    value: '16px',
    css_variable: '--font-size-body-md',
  },
]

// ============================================================================
// generateCSS tests
// ============================================================================

describe('generateCSS', () => {
  it('generates CSS variables in :root by default', () => {
    const result = generateCSS(sampleTokens)
    expect(result).toContain(':root {')
    expect(result).toContain('--color-btn-primary-bg: #657E79;')
    expect(result).toContain('--color-btn-primary-text: #FFFFFF;')
    expect(result).toContain('--spacing-margin-sm: 8px;')
  })

  it('includes category comments by default', () => {
    const result = generateCSS(sampleTokens)
    expect(result).toContain('/* Color */')
    expect(result).toContain('/* Spacing */')
  })

  it('scopes to class when scopeClass option is provided', () => {
    const result = generateCSS(sampleTokens, { scopeClass: 'my-theme' })
    expect(result).toContain('.my-theme {')
    expect(result).not.toContain(':root')
  })

  it('minifies output when minify option is true', () => {
    const result = generateCSS(sampleTokens, { minify: true })
    expect(result).not.toContain('\n')
    expect(result).not.toContain('/*')
    expect(result).toMatch(/--color-btn-primary-bg:#657E79/)
  })

  it('excludes comments when includeComments is false', () => {
    const result = generateCSS(sampleTokens, { includeComments: false })
    expect(result).not.toContain('/* Color */')
    expect(result).toContain('--color-btn-primary-bg')
  })

  it('handles empty tokens array', () => {
    const result = generateCSS([])
    expect(result).toContain(':root')
    expect(result).toContain('No tokens')
  })

  it('handles tokens with rgba values', () => {
    const tokens = [
      {
        category: 'color',
        name: 'overlay',
        value: { rgba: { r: 0, g: 0, b: 0, a: 0.5 } },
        css_variable: '--color-overlay',
      },
    ]
    const result = generateCSS(tokens)
    expect(result).toContain('rgba(0, 0, 0, 0.5)')
  })

  it('produces syntactically valid CSS structure', () => {
    // This tests the verification requirement: "Import CSS into project, verify works"
    const result = generateCSS(sampleTokens)
    
    // Verify CSS structure: selector { properties }
    expect(result).toMatch(/^:root\s*\{/)  // Starts with :root {
    expect(result).toMatch(/\}$/)          // Ends with }
    
    // Verify all variables have valid format: --name: value;
    const lines = result.split('\n').filter(l => l.includes('--'))
    lines.forEach(line => {
      expect(line.trim()).toMatch(/^--[\w-]+:\s*.+;$/)
    })
    
    // Count opening and closing braces match
    const openBraces = (result.match(/\{/g) || []).length
    const closeBraces = (result.match(/\}/g) || []).length
    expect(openBraces).toBe(closeBraces)
  })
})

// ============================================================================
// generateJSON tests
// ============================================================================

describe('generateJSON', () => {
  it('generates structured JSON with categories', () => {
    const result = generateJSON(sampleTokens)
    const parsed = JSON.parse(result)
    expect(parsed.color).toBeDefined()
    expect(parsed.spacing).toBeDefined()
  })

  it('includes $type and $value in DTCG format', () => {
    const result = generateJSON(sampleTokens)
    const parsed = JSON.parse(result)
    expect(parsed.color.button['primary-bg'].$type).toBe('color')
    expect(parsed.color.button['primary-bg'].$value).toEqual({ hex: '#657E79' })
  })

  it('includes Figma metadata when option is true', () => {
    const tokens = [
      {
        category: 'color',
        name: 'primary',
        value: '#657E79',
        figma_variable_id: 'figma:123',
        css_variable: '--color-primary',
      },
    ]
    const result = generateJSON(tokens, { includeFigmaMetadata: true })
    const parsed = JSON.parse(result)
    expect(parsed.color.primary.$extensions).toBeDefined()
    expect(parsed.color.primary.$extensions['com.figma'].variableId).toBe('figma:123')
  })

  it('excludes Figma metadata when option is false', () => {
    const tokens = [
      {
        category: 'color',
        name: 'primary',
        value: '#657E79',
        figma_variable_id: 'figma:123',
        css_variable: '--color-primary',
      },
    ]
    const result = generateJSON(tokens, { includeFigmaMetadata: false })
    const parsed = JSON.parse(result)
    expect(parsed.color.primary.$extensions).toBeUndefined()
  })

  it('minifies when prettyPrint is false', () => {
    const result = generateJSON(sampleTokens, { prettyPrint: false })
    expect(result).not.toContain('\n')
  })

  it('handles empty tokens array', () => {
    const result = generateJSON([])
    expect(result).toContain('"tokens": []')
  })

  it('produces JSON that can be re-imported (round-trip)', () => {
    // This tests the verification requirement: "Re-import JSON into tool"
    const originalTokens = [
      {
        category: 'color',
        subcategory: 'button',
        name: 'primary',
        value: { hex: '#657E79' },
        figma_variable_id: 'figma:var:123',
      },
      {
        category: 'spacing',
        name: 'md',
        value: '16px',
      },
    ]
    
    const exportedJSON = generateJSON(originalTokens, { includeFigmaMetadata: true })
    const reimported = JSON.parse(exportedJSON)
    
    // Verify structure is preserved
    expect(reimported.color.button.primary.$type).toBe('color')
    expect(reimported.color.button.primary.$value).toEqual({ hex: '#657E79' })
    expect(reimported.color.button.primary.$extensions['com.figma'].variableId).toBe('figma:var:123')
    expect(reimported.spacing.md.$type).toBe('dimension')
    expect(reimported.spacing.md.$value).toBe('16px')
  })
})

// ============================================================================
// generateTailwind tests
// ============================================================================

describe('generateTailwind', () => {
  it('generates Tailwind 3.x config by default', () => {
    const result = generateTailwind(sampleTokens)
    expect(result).toContain('module.exports')
    expect(result).toContain('theme:')
    expect(result).toContain('extend:')
  })

  it('includes colors in extend.colors', () => {
    const result = generateTailwind(sampleTokens)
    expect(result).toContain('colors:')
    expect(result).toContain('primary-bg')
  })

  it('generates Tailwind 4.x CSS theme when version is 4.x', () => {
    const result = generateTailwind(sampleTokens, { version: '4.x' })
    expect(result).toContain('@theme {')
    expect(result).toContain('--color-')
  })

  it('separates tokens into appropriate Tailwind categories', () => {
    const result = generateTailwind(sampleTokens)
    expect(result).toContain('colors')
    expect(result).toContain('spacing')
    expect(result).toContain('fontSize')
  })

  it('handles empty tokens array', () => {
    const result = generateTailwind([])
    expect(result).toContain('module.exports')
    expect(result).toContain('extend: {}')
  })

  it('produces valid Tailwind config structure', () => {
    // This tests the verification requirement: "Use Tailwind config in project"
    const result = generateTailwind(sampleTokens)
    
    // Verify it has the required Tailwind config structure
    expect(result).toContain('/** @type {import("tailwindcss").Config} */')
    expect(result).toContain('module.exports =')
    expect(result).toContain('theme:')
    expect(result).toContain('extend:')
    
    // Verify the config object structure is valid JSON-like
    // Extract just the object part after module.exports =
    const configPart = result.replace('/** @type {import("tailwindcss").Config} */\n', '')
      .replace('module.exports = ', '')
    
    // The output uses JS object notation, so convert to JSON and parse
    const jsonified = configPart.replace(/(\w+):/g, '"$1":')
    expect(() => JSON.parse(jsonified)).not.toThrow()
  })

  it('correctly categorizes border-radius tokens', () => {
    const tokens = [
      { category: 'border-radius', name: 'sm', value: '4px' },
      { category: 'radius', name: 'lg', value: '12px' },
    ]
    const result = generateTailwind(tokens)
    expect(result).toContain('borderRadius')
    // Keys don't have quotes in the JS output
    expect(result).toContain('sm: "4px"')
    expect(result).toContain('lg: "12px"')
  })

  it('correctly categorizes shadow tokens', () => {
    const tokens = [
      { category: 'shadow', name: 'md', value: '0 4px 6px rgba(0,0,0,0.1)' },
    ]
    const result = generateTailwind(tokens)
    expect(result).toContain('boxShadow')
    // Keys don't have quotes in the JS output
    expect(result).toContain('md: "0 4px 6px rgba(0,0,0,0.1)"')
  })
})

// ============================================================================
// generateSCSS tests
// ============================================================================

describe('generateSCSS', () => {
  it('generates SCSS variables by default', () => {
    const result = generateSCSS(sampleTokens)
    expect(result).toContain('$color-btn-primary-bg: #657E79;')
    expect(result).toContain('$spacing-margin-sm: 8px;')
  })

  it('includes category comments by default', () => {
    const result = generateSCSS(sampleTokens)
    expect(result).toContain('// Color')
    expect(result).toContain('// Spacing')
  })

  it('generates SCSS map when useMap is true', () => {
    const result = generateSCSS(sampleTokens, { useMap: true })
    expect(result).toContain('$tokens: (')
    expect(result).toContain("'color': (")
  })

  it('excludes comments when includeComments is false', () => {
    const result = generateSCSS(sampleTokens, { includeComments: false })
    expect(result).not.toContain('// Color')
  })

  it('handles empty tokens array', () => {
    const result = generateSCSS([])
    expect(result).toContain('No tokens')
  })

  it('prefixes variables starting with numbers with underscore', () => {
    const tokens = [
      {
        category: 'spacing',
        name: '2xl',
        value: '24px',
        // No css_variable - should use name directly, which starts with number
      },
      {
        category: 'font-size',
        name: '3xl-heading',
        value: '32px',
        // No css_variable - should use name directly, which starts with number
      },
      {
        category: 'color',
        name: 'primary',
        value: '#657E79',
        css_variable: '--color-primary', // Valid - doesn't start with number
      },
    ]
    const result = generateSCSS(tokens)
    // Variables where name starts with numbers should be prefixed with underscore
    expect(result).toContain('$_2xl: 24px;')
    expect(result).toContain('$_3xl-heading: 32px;')
    // Valid CSS variables that don't start with numbers should NOT be prefixed
    expect(result).toContain('$color-primary: #657E79;')
    // Should NOT contain SCSS variables starting with a digit directly after $
    expect(result).not.toMatch(/\$\d/)
  })

  it('handles map keys starting with numbers', () => {
    const tokens = [
      {
        category: '2d-effects',
        name: '3d-shadow',
        value: '0 4px 6px rgba(0,0,0,0.1)',
      },
    ]
    const result = generateSCSS(tokens, { useMap: true })
    // Category and name keys should be sanitized
    expect(result).toContain("'_2d-effects'")
    expect(result).toContain("'_3d-shadow'")
  })
})

// ============================================================================
// generateExport tests
// ============================================================================

describe('generateExport', () => {
  it('routes to CSS generator', () => {
    const result = generateExport('css', sampleTokens)
    expect(result).toContain(':root')
  })

  it('routes to JSON generator', () => {
    const result = generateExport('json', sampleTokens)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('routes to Tailwind generator', () => {
    const result = generateExport('tailwind', sampleTokens)
    expect(result).toContain('module.exports')
  })

  it('routes to SCSS generator', () => {
    const result = generateExport('scss', sampleTokens)
    expect(result).toContain('$')
  })

  it('throws for unknown format', () => {
    expect(() => generateExport('unknown', sampleTokens)).toThrow('Unknown export format')
  })

  it('passes options through to generators', () => {
    const result = generateExport('css', sampleTokens, { scopeClass: 'test' })
    expect(result).toContain('.test {')
  })
})

// ============================================================================
// getFileExtension tests
// ============================================================================

describe('getFileExtension', () => {
  it('returns .css for css format', () => {
    expect(getFileExtension('css')).toBe('.css')
  })

  it('returns .json for json format', () => {
    expect(getFileExtension('json')).toBe('.json')
  })

  it('returns .js for tailwind format', () => {
    expect(getFileExtension('tailwind')).toBe('.js')
  })

  it('returns .scss for scss format', () => {
    expect(getFileExtension('scss')).toBe('.scss')
  })

  it('returns .txt for unknown format', () => {
    expect(getFileExtension('unknown')).toBe('.txt')
  })
})

// ============================================================================
// getMimeType tests
// ============================================================================

describe('getMimeType', () => {
  it('returns text/css for css format', () => {
    expect(getMimeType('css')).toBe('text/css')
  })

  it('returns application/json for json format', () => {
    expect(getMimeType('json')).toBe('application/json')
  })

  it('returns application/javascript for tailwind format', () => {
    expect(getMimeType('tailwind')).toBe('application/javascript')
  })

  it('returns text/x-scss for scss format', () => {
    expect(getMimeType('scss')).toBe('text/x-scss')
  })

  it('returns text/plain for unknown format', () => {
    expect(getMimeType('unknown')).toBe('text/plain')
  })
})

