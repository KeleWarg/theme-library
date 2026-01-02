# Chunk 1.04 — Parser Tests

## Purpose
Create comprehensive test suite for the token parser covering all edge cases and real-world files.

---

## Inputs
- `src/lib/tokenParser.js` (from chunk 1.03)
- Project JSON files for integration tests

## Outputs
- `src/lib/tokenParser.test.js` (verification artifact)

---

## Dependencies
- Chunk 1.03 must be complete

---

## Implementation Notes

### Key Considerations
- Test both happy paths and edge cases
- Use real project JSON files as integration test fixtures
- Test error handling for malformed input
- Verify metadata calculations are correct

### Gotchas
- File imports in tests may need path adjustments
- Large file tests should have reasonable timeouts
- Mock console.error to keep test output clean

### Algorithm/Approach
Use Vitest with describe/it blocks organized by function. Include snapshot tests for complex outputs.

---

## Files Created
- `src/lib/tokenParser.test.js` — Test suite

---

## Implementation

```javascript
// src/lib/tokenParser.test.js
import { describe, it, expect } from 'vitest'
import { 
  parseTokenFile, 
  validateTokenFile, 
  groupTokensByCategory 
} from './tokenParser'

describe('tokenParser', () => {
  
  describe('validateTokenFile', () => {
    it('rejects null input', () => {
      expect(validateTokenFile(null).valid).toBe(false)
    })

    it('rejects string input', () => {
      expect(validateTokenFile('string').valid).toBe(false)
    })

    it('rejects array input', () => {
      const result = validateTokenFile([])
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('array')
    })

    it('accepts empty object with warning', () => {
      const result = validateTokenFile({})
      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('detects Color category', () => {
      const result = validateTokenFile({ Color: {} })
      expect(result.valid).toBe(true)
      expect(result.detected.hasColor).toBe(true)
    })

    it('detects Typography category', () => {
      const result = validateTokenFile({ Font: {} })
      expect(result.detected.hasTypography).toBe(true)
    })
  })

  describe('parseTokenFile', () => {
    
    describe('basic parsing', () => {
      it('returns empty tokens for empty object', () => {
        const result = parseTokenFile({})
        expect(result.tokens).toHaveLength(0)
        expect(result.errors).toHaveLength(0)
      })

      it('extracts simple color token', () => {
        const input = {
          Color: {
            primary: {
              $type: 'color',
              $value: { hex: '#FF0000' }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens).toHaveLength(1)
        expect(result.tokens[0].name).toBe('primary')
        expect(result.tokens[0].category).toBe('color')
        expect(result.tokens[0].value.hex).toBe('#FF0000')
      })

      it('extracts number token', () => {
        const input = {
          Spacing: {
            md: {
              $type: 'number',
              $value: 16
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens).toHaveLength(1)
        expect(result.tokens[0].value.value).toBe(16)
        expect(result.tokens[0].value.unit).toBe('px')
      })

      it('handles string tokens', () => {
        const input = {
          Font: {
            family: {
              $type: 'string',
              $value: 'Inter'
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].value.value).toBe('Inter')
      })
    })

    describe('color handling', () => {
      it('uses hex when provided', () => {
        const input = {
          Color: {
            test: {
              $type: 'color',
              $value: { hex: '#123456' }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].value.hex).toBe('#123456')
      })

      it('converts RGB components to hex', () => {
        const input = {
          Color: {
            test: {
              $type: 'color',
              $value: {
                colorSpace: 'srgb',
                components: [1, 0, 0], // Red
                alpha: 1
              }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].value.hex).toBe('#FF0000')
      })

      it('preserves alpha value', () => {
        const input = {
          Color: {
            test: {
              $type: 'color',
              $value: { hex: '#000000', alpha: 0.5 }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].value.alpha).toBe(0.5)
      })

      it('converts components accurately', () => {
        const input = {
          Color: {
            test: {
              $type: 'color',
              $value: {
                components: [0.396, 0.494, 0.475]
              }
            }
          }
        }
        const result = parseTokenFile(input)
        // 0.396 * 255 ≈ 101 = 0x65
        expect(result.tokens[0].value.hex).toMatch(/^#6[45]/i)
      })
    })

    describe('nested structure handling', () => {
      it('handles deeply nested tokens', () => {
        const input = {
          Color: {
            Button: {
              Primary: {
                hover: {
                  $type: 'color',
                  $value: { hex: '#000' }
                }
              }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].path).toBe('Color/Button/Primary/hover')
        expect(result.tokens[0].subcategory).toBe('Button/Primary')
        expect(result.tokens[0].group_name).toBe('Color')
      })

      it('handles flat structure', () => {
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
    })

    describe('Figma metadata', () => {
      it('extracts variable ID', () => {
        const input = {
          Color: {
            test: {
              $type: 'color',
              $value: { hex: '#000' },
              $extensions: {
                'com.figma.variableId': 'VariableID:123:456'
              }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].figma_variable_id).toBe('VariableID:123:456')
      })

      it('extracts alias reference', () => {
        const input = {
          Color: {
            test: {
              $type: 'color',
              $value: { hex: '#000' },
              $extensions: {
                'com.figma.aliasData': {
                  targetVariableName: 'Color/Primary/500'
                }
              }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].alias_reference).toBe('Color/Primary/500')
      })

      it('skips root-level $extensions', () => {
        const input = {
          Breakpoint: { $type: 'number', $value: 1440 },
          $extensions: { 'com.figma.modeName': 'Desktop' }
        }
        const result = parseTokenFile(input)
        expect(result.tokens).toHaveLength(1)
      })
    })

    describe('category detection', () => {
      it('detects color category', () => {
        const input = { Color: { x: { $type: 'color', $value: { hex: '#000' } } } }
        expect(parseTokenFile(input).tokens[0].category).toBe('color')
      })

      it('detects typography from Font', () => {
        const input = { Font: { x: { $type: 'string', $value: 'Arial' } } }
        expect(parseTokenFile(input).tokens[0].category).toBe('typography')
      })

      it('detects spacing category', () => {
        const input = { Spacing: { x: { $type: 'number', $value: 8 } } }
        expect(parseTokenFile(input).tokens[0].category).toBe('spacing')
      })

      it('detects shadow from Elevation', () => {
        const input = { Elevation: { x: { $type: 'string', $value: '0 1px 2px' } } }
        expect(parseTokenFile(input).tokens[0].category).toBe('shadow')
      })

      it('returns other for unknown', () => {
        const input = { Custom: { x: { $type: 'string', $value: 'test' } } }
        expect(parseTokenFile(input).tokens[0].category).toBe('other')
      })
    })

    describe('CSS variable generation', () => {
      it('generates correct variable name', () => {
        const input = {
          Color: {
            Button: {
              'primary-bg': { $type: 'color', $value: { hex: '#000' } }
            }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].css_variable).toBe('--color-button-primary-bg')
      })

      it('normalizes special characters', () => {
        const input = {
          Color: {
            'My Token!!': { $type: 'color', $value: { hex: '#000' } }
          }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].css_variable).toMatch(/^--color-my-token$/)
      })
    })

    describe('metadata', () => {
      it('counts total tokens', () => {
        const input = {
          Color: {
            a: { $type: 'color', $value: { hex: '#000' } },
            b: { $type: 'color', $value: { hex: '#000' } }
          }
        }
        const result = parseTokenFile(input)
        expect(result.metadata.totalTokens).toBe(2)
      })

      it('counts by category', () => {
        const input = {
          Color: { a: { $type: 'color', $value: { hex: '#000' } } },
          Spacing: { b: { $type: 'number', $value: 8 } }
        }
        const result = parseTokenFile(input)
        expect(result.metadata.categories.color).toBe(1)
        expect(result.metadata.categories.spacing).toBe(1)
      })
    })

    describe('edge cases', () => {
      it('handles token without $type', () => {
        const input = {
          Color: { test: { $value: { hex: '#000' } } }
        }
        const result = parseTokenFile(input)
        expect(result.tokens[0].type).toBe('unknown')
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
    })
  })

  describe('groupTokensByCategory', () => {
    it('groups tokens correctly', () => {
      const tokens = [
        { category: 'color', name: 'a' },
        { category: 'spacing', name: 'b' },
        { category: 'color', name: 'c' },
      ]
      const grouped = groupTokensByCategory(tokens)
      expect(grouped.color).toHaveLength(2)
      expect(grouped.spacing).toHaveLength(1)
    })

    it('sorts by sort_order then name', () => {
      const tokens = [
        { category: 'color', name: 'b', sort_order: 1 },
        { category: 'color', name: 'a', sort_order: 2 },
        { category: 'color', name: 'c', sort_order: 1 },
      ]
      const grouped = groupTokensByCategory(tokens)
      expect(grouped.color[0].name).toBe('b')
      expect(grouped.color[1].name).toBe('c')
      expect(grouped.color[2].name).toBe('a')
    })
  })
})
```

---

## Tests

### Unit Tests
- [ ] All test cases pass

### Integration Tests
- [ ] Tests run without timeout
- [ ] Coverage > 80%

### Verification
- [ ] `npm test` passes
- [ ] `npm run test:coverage` shows adequate coverage

---

## Time Estimate
2 hours

---

## Notes
- Consider adding tests with actual project files as fixtures
- Snapshot tests could be useful for complex parse results
- Performance test threshold (1s for 500 tokens) is conservative
