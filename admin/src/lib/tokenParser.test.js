// src/lib/tokenParser.test.js

import { describe, it, expect, beforeAll } from 'vitest'
import { 
  parseTokenFile, 
  validateTokenFile, 
  groupTokensByCategory,
  generateCSSVariableName,
  rgbComponentsToHex,
  getTokenStats,
  filterTokensByCategory,
  searchTokens
} from './tokenParser'

describe('tokenParser', () => {
  
  // ===========================================
  // parseTokenFile tests
  // ===========================================
  describe('parseTokenFile', () => {
    
    it('handles empty object', () => {
      const result = parseTokenFile({})
      expect(result.tokens).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
      expect(result.metadata.totalTokens).toBe(0)
    })

    it('handles null input', () => {
      const result = parseTokenFile(null)
      expect(result.errors).toContain('Invalid input: expected a JSON object')
    })

    it('handles array input', () => {
      const result = parseTokenFile([])
      expect(result.errors).toContain('Invalid input: expected a JSON object')
    })

    it('handles string input', () => {
      const result = parseTokenFile('not an object')
      expect(result.errors).toContain('Invalid input: expected a JSON object')
    })

    it('extracts color tokens with hex', () => {
      const jsonData = {
        "Color": {
          "Primary": {
            "primary-bg": {
              "$type": "color",
              "$value": {
                "colorSpace": "srgb",
                "components": [0.4, 0.5, 0.47],
                "alpha": 1,
                "hex": "#657E79"
              }
            }
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].name).toBe('primary-bg')
      expect(result.tokens[0].type).toBe('color')
      expect(result.tokens[0].value.hex).toBe('#657E79')
      expect(result.tokens[0].category).toBe('color')
    })

    it('extracts color tokens from components when hex is missing', () => {
      const jsonData = {
        "Color": {
          "test-color": {
            "$type": "color",
            "$value": {
              "components": [1, 0, 0], // Red
              "alpha": 1
            }
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].value.hex).toBe('#FF0000')
    })

    it('extracts number tokens', () => {
      const jsonData = {
        "Font Size": {
          "body-md": {
            "$type": "number",
            "$value": 16
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].type).toBe('number')
      expect(result.tokens[0].value.value).toBe(16)
      expect(result.tokens[0].value.unit).toBe('px')
    })

    it('extracts string tokens', () => {
      const jsonData = {
        "Font Family": {
          "font-family-serif": {
            "$type": "string",
            "$value": "Georgia"
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].type).toBe('string')
      expect(result.tokens[0].value.value).toBe('Georgia')
    })

    it('preserves Figma variable ID', () => {
      const jsonData = {
        "Color": {
          "test": {
            "$type": "color",
            "$value": { "hex": "#FFFFFF" },
            "$extensions": {
              "com.figma.variableId": "VariableID:123:456"
            }
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].figma_variable_id).toBe('VariableID:123:456')
    })

    it('detects alias references', () => {
      const jsonData = {
        "Color": {
          "test": {
            "$type": "color",
            "$value": { "hex": "#FFFFFF" },
            "$extensions": {
              "com.figma.aliasData": {
                "targetVariableName": "Color/Neutral/white"
              }
            }
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].alias_reference).toBe('Color/Neutral/white')
    })

    it('handles deeply nested tokens', () => {
      const jsonData = {
        "Color": {
          "Button": {
            "Primary": {
              "States": {
                "hover-bg": {
                  "$type": "color",
                  "$value": { "hex": "#123456" }
                }
              }
            }
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].path).toBe('Color/Button/Primary/States/hover-bg')
      expect(result.tokens[0].subcategory).toBe('Button/Primary/States')
    })

    it('handles tokens with $value but no $type', () => {
      const jsonData = {
        "Unknown": {
          "mystery": {
            "$value": 42
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].type).toBe('unknown')
    })

    it('skips $extensions at root level', () => {
      const jsonData = {
        "Color": {
          "test": {
            "$type": "color",
            "$value": { "hex": "#FFFFFF" }
          }
        },
        "$extensions": {
          "com.figma.modeName": "Health - SEM"
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens).toHaveLength(1)
      expect(result.metadata.modeName).toBe('Health - SEM')
    })

    it('builds category summary', () => {
      const jsonData = {
        "Color": {
          "a": { "$type": "color", "$value": { "hex": "#111" } },
          "b": { "$type": "color", "$value": { "hex": "#222" } }
        },
        "Font Size": {
          "c": { "$type": "number", "$value": 16 }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.metadata.categories.color).toBe(2)
      expect(result.metadata.categories.typography).toBe(1)
    })

    it('handles alpha values in colors', () => {
      const jsonData = {
        "Color": {
          "transparent": {
            "$type": "color",
            "$value": {
              "hex": "#FFFFFF",
              "alpha": 0
            }
          }
        }
      }

      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].value.alpha).toBe(0)
    })
  })

  // ===========================================
  // detectCategory tests (via parseTokenFile)
  // ===========================================
  describe('detectCategory', () => {
    
    it('matches color pattern', () => {
      const jsonData = {
        "Color": {
          "test": { "$type": "color", "$value": { "hex": "#FFF" } }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('color')
    })

    it('matches typography pattern for Font Size', () => {
      const jsonData = {
        "Font Size": {
          "test": { "$type": "number", "$value": 16 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('typography')
    })

    it('matches typography pattern for Line height', () => {
      const jsonData = {
        "Line height": {
          "test": { "$type": "number", "$value": 24 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('typography')
    })

    it('matches spacing pattern', () => {
      const jsonData = {
        "Spacing": {
          "test": { "$type": "number", "$value": 8 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('spacing')
    })

    it('returns "other" for unknown category', () => {
      const jsonData = {
        "Something": {
          "test": { "$type": "number", "$value": 42 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('other')
    })

    it('matches shadow pattern from Elevation', () => {
      const jsonData = {
        "Elevation": {
          "shadow-sm": { "$type": "string", "$value": "0 1px 2px rgba(0,0,0,0.1)" }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('shadow')
    })

    it('matches shadow pattern from Shadow', () => {
      const jsonData = {
        "Shadow": {
          "md": { "$type": "string", "$value": "0 4px 6px rgba(0,0,0,0.1)" }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('shadow')
    })

    it('matches radius pattern', () => {
      const jsonData = {
        "Radius": {
          "sm": { "$type": "number", "$value": 4 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('radius')
    })

    it('matches grid pattern from Breakpoint', () => {
      const jsonData = {
        "Breakpoint": {
          "lg": { "$type": "number", "$value": 1024 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('grid')
    })

    it('matches typography from Letter Spacing', () => {
      const jsonData = {
        "Letter Spacing": {
          "tight": { "$type": "number", "$value": -0.5 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].category).toBe('typography')
    })
  })

  // ===========================================
  // generateCSSVariableName tests
  // ===========================================
  describe('generateCSSVariableName', () => {
    
    it('produces correct format for simple case', () => {
      const result = generateCSSVariableName('color', null, 'primary-bg')
      expect(result).toBe('--color-primary-bg')
    })

    it('includes subcategory in path', () => {
      const result = generateCSSVariableName('color', 'Button/Primary', 'hover-bg')
      expect(result).toBe('--color-button-primary-hover-bg')
    })

    it('normalizes special characters', () => {
      const result = generateCSSVariableName('typography', 'Font Size', 'Body LG')
      expect(result).toBe('--typography-font-size-body-lg')
    })

    it('handles empty subcategory', () => {
      const result = generateCSSVariableName('spacing', '', 'margin-sm')
      expect(result).toBe('--spacing-margin-sm')
    })

    it('removes consecutive hyphens', () => {
      const result = generateCSSVariableName('color', 'btn--primary', 'bg')
      expect(result).toBe('--color-btn-primary-bg')
    })

    it('handles numbers in names', () => {
      const result = generateCSSVariableName('color', null, 'gray-100')
      expect(result).toBe('--color-gray-100')
    })
  })

  // ===========================================
  // rgbComponentsToHex tests
  // ===========================================
  describe('rgbComponentsToHex', () => {
    
    it('converts black correctly', () => {
      expect(rgbComponentsToHex([0, 0, 0])).toBe('#000000')
    })

    it('converts white correctly', () => {
      expect(rgbComponentsToHex([1, 1, 1])).toBe('#FFFFFF')
    })

    it('converts red correctly', () => {
      expect(rgbComponentsToHex([1, 0, 0])).toBe('#FF0000')
    })

    it('converts middle values correctly', () => {
      // 0.5 * 255 = 127.5 -> 128 = 0x80
      expect(rgbComponentsToHex([0.5, 0.5, 0.5])).toBe('#808080')
    })

    it('handles missing components', () => {
      expect(rgbComponentsToHex(null)).toBe('#000000')
      expect(rgbComponentsToHex([])).toBe('#000000')
      expect(rgbComponentsToHex([1, 0])).toBe('#000000')
    })

    it('ignores alpha channel if present', () => {
      expect(rgbComponentsToHex([1, 0, 0, 0.5])).toBe('#FF0000')
    })
  })

  // ===========================================
  // validateTokenFile tests
  // ===========================================
  describe('validateTokenFile', () => {
    
    it('rejects null', () => {
      const result = validateTokenFile(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid JSON: expected an object')
    })

    it('rejects arrays', () => {
      const result = validateTokenFile([])
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid format: expected object, got array')
    })

    it('accepts valid object', () => {
      const result = validateTokenFile({ Color: {} })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('warns on unknown structure', () => {
      const result = validateTokenFile({ unknown: {} })
      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('No recognized token categories found. File may not be a Figma Variables export.')
    })

    it('detects color category', () => {
      const result = validateTokenFile({ Color: {} })
      expect(result.detected.hasColor).toBe(true)
    })

    it('detects typography category', () => {
      const result = validateTokenFile({ "Font Size": {} })
      expect(result.detected.hasTypography).toBe(true)
    })

    it('detects typography from Font', () => {
      const result = validateTokenFile({ "Font": {} })
      expect(result.detected.hasTypography).toBe(true)
    })

    it('detects typography from Line height', () => {
      const result = validateTokenFile({ "Line height": {} })
      expect(result.detected.hasTypography).toBe(true)
    })

    it('detects spacing category', () => {
      const result = validateTokenFile({ "Spacing": {} })
      expect(result.detected.hasSpacing).toBe(true)
    })

    it('detects grid from Breakpoint', () => {
      const result = validateTokenFile({ "Breakpoint": {} })
      expect(result.detected.hasGrid).toBe(true)
    })

    it('accepts empty object with warning', () => {
      const result = validateTokenFile({})
      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('rejects string input', () => {
      const result = validateTokenFile('not an object')
      expect(result.valid).toBe(false)
    })
  })

  // ===========================================
  // groupTokensByCategory tests
  // ===========================================
  describe('groupTokensByCategory', () => {
    
    it('groups tokens correctly', () => {
      const tokens = [
        { name: 'a', category: 'color', sort_order: 0 },
        { name: 'b', category: 'typography', sort_order: 0 },
        { name: 'c', category: 'color', sort_order: 0 },
      ]

      const grouped = groupTokensByCategory(tokens)
      expect(grouped.color).toHaveLength(2)
      expect(grouped.typography).toHaveLength(1)
    })

    it('sorts tokens within category', () => {
      const tokens = [
        { name: 'zebra', category: 'color', sort_order: 0 },
        { name: 'alpha', category: 'color', sort_order: 0 },
      ]

      const grouped = groupTokensByCategory(tokens)
      expect(grouped.color[0].name).toBe('alpha')
      expect(grouped.color[1].name).toBe('zebra')
    })

    it('respects sort_order over name', () => {
      const tokens = [
        { name: 'a', category: 'color', sort_order: 2 },
        { name: 'b', category: 'color', sort_order: 1 },
      ]

      const grouped = groupTokensByCategory(tokens)
      expect(grouped.color[0].name).toBe('b')
      expect(grouped.color[1].name).toBe('a')
    })
  })

  // ===========================================
  // getTokenStats tests
  // ===========================================
  describe('getTokenStats', () => {
    
    it('returns correct statistics', () => {
      const parseResult = {
        tokens: [
          { type: 'color', category: 'color' },
          { type: 'color', category: 'color' },
          { type: 'number', category: 'typography' },
        ],
        errors: [],
        warnings: ['test warning'],
        metadata: {
          totalTokens: 3,
          categories: { color: 2, typography: 1 }
        }
      }

      const stats = getTokenStats(parseResult)
      expect(stats.total).toBe(3)
      expect(stats.byCategory.color).toBe(2)
      expect(stats.byType.color).toBe(2)
      expect(stats.byType.number).toBe(1)
      expect(stats.hasErrors).toBe(false)
      expect(stats.hasWarnings).toBe(true)
    })
  })

  // ===========================================
  // filterTokensByCategory tests
  // ===========================================
  describe('filterTokensByCategory', () => {
    const tokens = [
      { name: 'a', category: 'color' },
      { name: 'b', category: 'typography' },
      { name: 'c', category: 'color' },
    ]

    it('filters by category', () => {
      const filtered = filterTokensByCategory(tokens, 'color')
      expect(filtered).toHaveLength(2)
    })

    it('returns all tokens for "all" category', () => {
      const filtered = filterTokensByCategory(tokens, 'all')
      expect(filtered).toHaveLength(3)
    })

    it('returns all tokens for empty category', () => {
      const filtered = filterTokensByCategory(tokens, '')
      expect(filtered).toHaveLength(3)
    })
  })

  // ===========================================
  // searchTokens tests
  // ===========================================
  describe('searchTokens', () => {
    const tokens = [
      { name: 'primary-bg', path: 'Color/Button/primary-bg', css_variable: '--color-btn-primary-bg' },
      { name: 'body-md', path: 'Font Size/body-md', css_variable: '--typography-body-md' },
    ]

    it('searches by name', () => {
      const results = searchTokens(tokens, 'primary')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('primary-bg')
    })

    it('searches by path', () => {
      const results = searchTokens(tokens, 'Button')
      expect(results).toHaveLength(1)
    })

    it('searches by CSS variable', () => {
      const results = searchTokens(tokens, '--color')
      expect(results).toHaveLength(1)
    })

    it('is case insensitive', () => {
      const results = searchTokens(tokens, 'PRIMARY')
      expect(results).toHaveLength(1)
    })

    it('returns all for empty query', () => {
      const results = searchTokens(tokens, '')
      expect(results).toHaveLength(2)
    })
  })

  // ===========================================
  // Edge cases and performance tests
  // ===========================================
  describe('edge cases', () => {
    
    it('handles flat structure (token at category level)', () => {
      const input = {
        Breakpoint: {
          $type: 'number',
          $value: 1440
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens[0].name).toBe('Breakpoint')
      expect(result.tokens[0].subcategory).toBeNull()
    })

    it('handles many tokens (performance)', () => {
      const input = { Color: {} }
      for (let i = 0; i < 500; i++) {
        input.Color[`color-${i}`] = { $type: 'color', $value: { hex: '#000' } }
      }
      const start = performance.now()
      const result = parseTokenFile(input)
      const duration = performance.now() - start
      
      expect(result.tokens).toHaveLength(500)
      expect(duration).toBeLessThan(1000) // Should complete in < 1s
    })

    it('handles empty nested objects', () => {
      const input = {
        Color: {
          EmptyGroup: {}
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('handles tokens with special characters in names', () => {
      const input = {
        Color: {
          'my-token/name@2x': {
            $type: 'color',
            $value: { hex: '#FF0000' }
          }
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens[0].name).toBe('my-token/name@2x')
      expect(result.tokens[0].css_variable).toMatch(/^--color/)
    })

    it('handles tokens with unicode in names', () => {
      const input = {
        Color: {
          'émoji-💙': {
            $type: 'color',
            $value: { hex: '#0000FF' }
          }
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].value.hex).toBe('#0000FF')
    })

    it('handles negative number values', () => {
      const input = {
        Spacing: {
          'negative-margin': {
            $type: 'number',
            $value: -8
          }
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens[0].value.value).toBe(-8)
    })

    it('handles zero values', () => {
      const input = {
        Spacing: {
          'zero': {
            $type: 'number',
            $value: 0
          }
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens[0].value.value).toBe(0)
    })

    it('handles very deep nesting (5+ levels)', () => {
      const input = {
        Color: {
          Level1: {
            Level2: {
              Level3: {
                Level4: {
                  Level5: {
                    deep: { $type: 'color', $value: { hex: '#123' } }
                  }
                }
              }
            }
          }
        }
      }
      const result = parseTokenFile(input)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].path).toBe('Color/Level1/Level2/Level3/Level4/Level5/deep')
    })
  })

  // ===========================================
  // Unit detection tests
  // ===========================================
  describe('unit detection', () => {
    
    it('detects no unit for font weight', () => {
      const jsonData = {
        "Font weight": {
          "font-weight-bold": { "$type": "number", "$value": 700 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].value.unit).toBe('')
    })

    it('detects px unit for font size', () => {
      const jsonData = {
        "Font Size": {
          "body-md": { "$type": "number", "$value": 16 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].value.unit).toBe('px')
    })

    it('detects px unit for line height > 10', () => {
      const jsonData = {
        "Line height": {
          "line-height-lg": { "$type": "number", "$value": 24 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].value.unit).toBe('px')
    })

    it('detects no unit for line height <= 10 (unitless ratio)', () => {
      const jsonData = {
        "Line height": {
          "line-height-ratio": { "$type": "number", "$value": 1.5 }
        }
      }
      const result = parseTokenFile(jsonData)
      expect(result.tokens[0].value.unit).toBe('')
    })
  })
})

// ===========================================
// Integration tests with real files
// ===========================================
describe('Integration tests', () => {
  let healthTokens
  let desktopTokens

  beforeAll(async () => {
    // Load actual token files for integration testing
    try {
      const fs = await import('fs')
      const path = await import('path')
      
      const healthPath = path.resolve(process.cwd(), '../figma_tokens/raw/Health_-_SEM_tokens.json')
      const desktopPath = path.resolve(process.cwd(), '../figma_tokens/raw/Desktop_tokens.json')
      
      if (fs.existsSync(healthPath)) {
        healthTokens = JSON.parse(fs.readFileSync(healthPath, 'utf-8'))
      }
      if (fs.existsSync(desktopPath)) {
        desktopTokens = JSON.parse(fs.readFileSync(desktopPath, 'utf-8'))
      }
    } catch (e) {
      // Files may not be available in CI
      console.warn('Integration test files not available:', e.message)
    }
  })

  it('parses Health_-_SEM_tokens.json successfully', () => {
    if (!healthTokens) {
      console.log('Skipping: Health tokens file not available')
      return
    }

    const result = parseTokenFile(healthTokens)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens.length).toBeGreaterThan(0)
    expect(result.metadata.categories.color).toBeGreaterThan(0)
    expect(result.metadata.modeName).toBe('Health - SEM')
  })

  it('parses Desktop_tokens.json successfully', () => {
    if (!desktopTokens) {
      console.log('Skipping: Desktop tokens file not available')
      return
    }

    const result = parseTokenFile(desktopTokens)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens.length).toBeGreaterThan(0)
    expect(result.metadata.categories.typography).toBeGreaterThan(0)
  })
})

