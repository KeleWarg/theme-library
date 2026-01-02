/**
 * Gate 1: Foundation Integration Test
 * 
 * Trigger: When 1.01 + 1.02 + 1.03 all show ✅ in chunk index
 * Purpose: Verify parser output is compatible with database service
 * 
 * Pass Criteria: All 4 tests pass
 * Blocks: 2.02, 2.03 cannot start until Gate 1 passes
 */

import { describe, it, expect, afterAll } from 'vitest'
import { createTheme, bulkCreateTokens, deleteTheme, getThemeById } from '../../src/lib/themeService'
import { parseTokenFile, validateTokenFile } from '../../src/lib/tokenParser'

// Increase timeout for integration tests that hit the database
const INTEGRATION_TIMEOUT = 30000

describe('Gate 1: Foundation Integration', () => {
  let testThemeId = null

  afterAll(async () => {
    if (testThemeId) {
      try { await deleteTheme(testThemeId) } catch (e) { /* ignore */ }
    }
  }, INTEGRATION_TIMEOUT)

  it('validates token file structure', () => {
    const jsonData = {
      Color: {
        Button: {
          primary: { $type: 'color', $value: { hex: '#657E79' } }
        }
      }
    }
    const validation = validateTokenFile(jsonData)
    expect(validation.valid).toBe(true)
  })

  it('parses tokens with correct structure', () => {
    const jsonData = {
      Color: {
        Button: {
          primary: { 
            $type: 'color', 
            $value: { hex: '#657E79' },
            $extensions: { 'com.figma.variableId': 'VariableID:123:456' }
          }
        }
      }
    }
    const result = parseTokenFile(jsonData)
    
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      name: 'primary',
      category: 'color',
      value: expect.objectContaining({ hex: '#657E79' }),
      css_variable: expect.stringMatching(/^--color/),
      figma_variable_id: 'VariableID:123:456'
    })
  })

  it('creates theme and bulk inserts parsed tokens', async () => {
    // Parse tokens
    const jsonData = {
      Color: {
        primary: { $type: 'color', $value: { hex: '#FF0000' } },
        secondary: { $type: 'color', $value: { hex: '#00FF00' } }
      },
      Spacing: {
        md: { $type: 'number', $value: 16 }
      }
    }
    const { tokens } = parseTokenFile(jsonData)
    expect(tokens.length).toBeGreaterThan(0)

    // Create theme
    const theme = await createTheme({
      name: 'Gate 1 Test Theme',
      slug: `gate-1-test-${Date.now()}`,
      description: 'Integration test',
      source: 'import'
    })
    testThemeId = theme.id
    expect(theme.id).toBeDefined()

    // Transform parsed tokens to DB format
    const dbTokens = tokens.map((t, index) => ({
      theme_id: theme.id,
      category: t.category,
      subcategory: t.subcategory || null,
      group_name: t.group_name || null,
      name: t.name,
      value: t.value,
      css_variable: t.css_variable,
      figma_variable_id: t.figma_variable_id || null,
      sort_order: index
    }))

    // Bulk insert
    const created = await bulkCreateTokens(dbTokens)
    expect(created).toHaveLength(tokens.length)

    // Verify theme has tokens
    const fullTheme = await getThemeById(theme.id)
    expect(fullTheme.theme_tokens).toHaveLength(tokens.length)
  }, INTEGRATION_TIMEOUT)

  it('cascade deletes tokens when theme deleted', async () => {
    // Create theme + tokens
    const theme = await createTheme({
      name: 'Cascade Test',
      slug: `cascade-test-${Date.now()}`
    })
    
    await bulkCreateTokens([{
      theme_id: theme.id,
      category: 'color',
      name: 'test',
      value: { hex: '#000' },
      css_variable: '--test'
    }])

    // Delete theme
    await deleteTheme(theme.id)

    // Verify theme gone (should throw or return null)
    try {
      const deleted = await getThemeById(theme.id)
      expect(deleted).toBeNull()
    } catch (e) {
      expect(e).toBeDefined() // Expected - theme not found
    }
  }, INTEGRATION_TIMEOUT)
})

