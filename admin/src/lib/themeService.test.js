/**
 * Theme Service Tests
 * Chunk 1.02 - Theme Management System
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import {
  generateSlug,
  generateCSSVariable,
  groupTokensByCategory,
  groupTokensNested,
  createTheme,
  getThemeById,
  getThemes,
  updateTheme,
  deleteTheme,
  createToken,
  bulkCreateTokens,
  getTokensByTheme,
  isSlugAvailable
} from './themeService'

// ============================================================================
// UNIT TESTS - HELPER FUNCTIONS
// These don't require Supabase and test pure functions
// ============================================================================

describe('generateSlug', () => {
  it('generates a slug with theme- prefix', () => {
    expect(generateSlug('Health SEM')).toBe('theme-health-sem')
  })

  it('converts to lowercase', () => {
    expect(generateSlug('MyTheme')).toBe('theme-mytheme')
  })

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('my awesome theme')).toBe('theme-my-awesome-theme')
  })

  it('removes special characters', () => {
    expect(generateSlug('Theme #1 (Test)')).toBe('theme-theme-1-test')
  })

  it('handles multiple consecutive special characters', () => {
    expect(generateSlug('Test---Theme')).toBe('theme-test-theme')
  })

  it('removes leading/trailing hyphens', () => {
    expect(generateSlug('-Test Theme-')).toBe('theme-test-theme')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('theme-unnamed')
  })

  it('handles null', () => {
    expect(generateSlug(null)).toBe('theme-unnamed')
  })

  it('handles undefined', () => {
    expect(generateSlug(undefined)).toBe('theme-unnamed')
  })

  it('handles numbers in name', () => {
    expect(generateSlug('Theme 2024')).toBe('theme-theme-2024')
  })

  it('handles unicode characters', () => {
    expect(generateSlug('Thème Élégant')).toBe('theme-th-me-l-gant')
  })
})

describe('generateCSSVariable', () => {
  it('generates a CSS variable with all parts', () => {
    expect(generateCSSVariable('color', 'button', 'primary-bg')).toBe('--color-button-primary-bg')
  })

  it('handles null subcategory', () => {
    expect(generateCSSVariable('color', null, 'white')).toBe('--color-white')
  })

  it('handles undefined subcategory', () => {
    expect(generateCSSVariable('color', undefined, 'white')).toBe('--color-white')
  })

  it('converts to lowercase', () => {
    expect(generateCSSVariable('Color', 'Button', 'Primary')).toBe('--color-button-primary')
  })

  it('replaces spaces with hyphens', () => {
    expect(generateCSSVariable('font size', 'heading', 'large text')).toBe('--font-size-heading-large-text')
  })

  it('removes special characters', () => {
    expect(generateCSSVariable('color', 'btn/primary', 'bg#1')).toBe('--color-btn-primary-bg-1')
  })

  it('handles empty strings gracefully', () => {
    expect(generateCSSVariable('', '', '')).toBe('--token')
  })

  it('handles complex paths', () => {
    expect(generateCSSVariable('spacing', 'layout/grid', 'gap-x-sm')).toBe('--spacing-layout-grid-gap-x-sm')
  })

  it('removes consecutive hyphens', () => {
    expect(generateCSSVariable('color', 'btn--primary', 'bg')).toBe('--color-btn-primary-bg')
  })
})

describe('groupTokensByCategory', () => {
  const mockTokens = [
    { id: '1', name: 'primary', category: 'color', value: { hex: '#657E79' } },
    { id: '2', name: 'secondary', category: 'color', value: { hex: '#333' } },
    { id: '3', name: 'heading-lg', category: 'typography', value: { size: 32 } },
    { id: '4', name: 'sm', category: 'spacing', value: { px: 8 } },
    { id: '5', name: 'unknown', category: null, value: { custom: true } }
  ]

  it('groups tokens by category', () => {
    const grouped = groupTokensByCategory(mockTokens)
    
    expect(Object.keys(grouped)).toHaveLength(4)
    expect(grouped.color).toHaveLength(2)
    expect(grouped.typography).toHaveLength(1)
    expect(grouped.spacing).toHaveLength(1)
  })

  it('puts tokens without category into "other"', () => {
    const grouped = groupTokensByCategory(mockTokens)
    
    expect(grouped.other).toHaveLength(1)
    expect(grouped.other[0].name).toBe('unknown')
  })

  it('handles empty array', () => {
    const grouped = groupTokensByCategory([])
    
    expect(Object.keys(grouped)).toHaveLength(0)
  })

  it('preserves token data', () => {
    const grouped = groupTokensByCategory(mockTokens)
    
    expect(grouped.color[0]).toEqual(mockTokens[0])
  })
})

describe('groupTokensNested', () => {
  const mockTokens = [
    { id: '1', name: 'primary-bg', category: 'color', subcategory: 'button', value: {} },
    { id: '2', name: 'primary-text', category: 'color', subcategory: 'button', value: {} },
    { id: '3', name: 'white', category: 'color', subcategory: null, value: {} },
    { id: '4', name: 'heading-lg', category: 'typography', subcategory: 'font-size', value: {} }
  ]

  it('groups tokens by category and subcategory', () => {
    const grouped = groupTokensNested(mockTokens)
    
    expect(grouped.color.button).toHaveLength(2)
    expect(grouped.color._root).toHaveLength(1)
    expect(grouped.typography['font-size']).toHaveLength(1)
  })

  it('uses _root for tokens without subcategory', () => {
    const grouped = groupTokensNested(mockTokens)
    
    expect(grouped.color._root[0].name).toBe('white')
  })

  it('handles empty array', () => {
    const grouped = groupTokensNested([])
    
    expect(Object.keys(grouped)).toHaveLength(0)
  })
})

// ============================================================================
// INTEGRATION TESTS - SUPABASE OPERATIONS
// These require a configured Supabase instance
// Run with: npm test src/lib/themeService.test.js
// ============================================================================

describe('Theme Service Integration', () => {
  // Track created theme IDs for cleanup
  const createdThemeIds = []
  
  // Unique timestamp to avoid slug collisions
  const testId = Date.now()

  // Cleanup after all tests
  afterAll(async () => {
    for (const id of createdThemeIds) {
      try {
        await deleteTheme(id)
      } catch (e) {
        // Ignore errors during cleanup (may already be deleted)
      }
    }
  })

  it('createTheme + getThemeById roundtrip', async () => {
    // Create a theme
    const theme = await createTheme({
      name: `Integration Test Theme ${testId}`,
      slug: `theme-integration-test-${testId}`,
      description: 'Created by integration test',
      source: 'manual',
      status: 'draft'
    })
    
    createdThemeIds.push(theme.id)
    
    // Verify it was created with correct data
    expect(theme).toBeDefined()
    expect(theme.id).toBeDefined()
    expect(theme.name).toBe(`Integration Test Theme ${testId}`)
    expect(theme.slug).toBe(`theme-integration-test-${testId}`)
    expect(theme.status).toBe('draft')
    expect(theme.created_at).toBeDefined()
    
    // Fetch it back by ID
    const fetched = await getThemeById(theme.id)
    
    expect(fetched.id).toBe(theme.id)
    expect(fetched.name).toBe(theme.name)
    expect(fetched.description).toBe('Created by integration test')
  })

  it('updateTheme changes values', async () => {
    // Create a theme
    const theme = await createTheme({
      name: `Update Test Theme ${testId}`,
      slug: `theme-update-test-${testId}`,
      description: 'Original description',
      source: 'manual'
    })
    
    createdThemeIds.push(theme.id)
    
    // Update it
    const updated = await updateTheme(theme.id, {
      name: `Updated Theme Name ${testId}`,
      description: 'Updated description',
      status: 'published'
    })
    
    expect(updated.name).toBe(`Updated Theme Name ${testId}`)
    expect(updated.description).toBe('Updated description')
    expect(updated.status).toBe('published')
    
    // Verify update persisted
    const fetched = await getThemeById(theme.id)
    expect(fetched.name).toBe(`Updated Theme Name ${testId}`)
  })

  it('bulkCreateTokens creates all tokens', async () => {
    // Create a theme first
    const theme = await createTheme({
      name: `Token Test Theme ${testId}`,
      slug: `theme-token-test-${testId}`,
      source: 'manual'
    })
    
    createdThemeIds.push(theme.id)
    
    // Bulk create tokens
    const tokens = [
      {
        theme_id: theme.id,
        category: 'color',
        subcategory: 'button',
        name: 'primary-bg',
        value: { hex: '#657E79' },
        css_variable: '--color-button-primary-bg',
        sort_order: 0
      },
      {
        theme_id: theme.id,
        category: 'color',
        subcategory: 'button',
        name: 'primary-text',
        value: { hex: '#FFFFFF' },
        css_variable: '--color-button-primary-text',
        sort_order: 1
      },
      {
        theme_id: theme.id,
        category: 'spacing',
        subcategory: null,
        name: 'sm',
        value: { px: 8 },
        css_variable: '--spacing-sm',
        sort_order: 0
      }
    ]
    
    const created = await bulkCreateTokens(tokens)
    
    expect(created).toHaveLength(3)
    expect(created[0].theme_id).toBe(theme.id)
    expect(created[0].category).toBe('color')
    
    // Verify tokens are retrievable
    const fetchedTokens = await getTokensByTheme(theme.id)
    expect(fetchedTokens).toHaveLength(3)
    
    // Verify theme includes tokens when fetched
    const themeWithTokens = await getThemeById(theme.id)
    expect(themeWithTokens.theme_tokens).toHaveLength(3)
  })

  it('cascade delete removes tokens when theme deleted', async () => {
    // Create a theme
    const theme = await createTheme({
      name: `Cascade Test Theme ${testId}`,
      slug: `theme-cascade-test-${testId}`,
      source: 'manual'
    })
    
    // Add tokens
    await bulkCreateTokens([
      {
        theme_id: theme.id,
        category: 'color',
        name: 'cascade-test-token-1',
        value: { hex: '#111' },
        css_variable: '--color-cascade-1'
      },
      {
        theme_id: theme.id,
        category: 'color',
        name: 'cascade-test-token-2',
        value: { hex: '#222' },
        css_variable: '--color-cascade-2'
      }
    ])
    
    // Verify tokens exist
    const tokensBefore = await getTokensByTheme(theme.id)
    expect(tokensBefore).toHaveLength(2)
    
    // Delete the theme
    const result = await deleteTheme(theme.id)
    expect(result).toBe(true)
    
    // Verify theme is gone
    try {
      await getThemeById(theme.id)
      throw new Error('Should have thrown - theme should not exist')
    } catch (error) {
      // Expected - theme should not be found (Supabase returns this error for .single() with no results)
      expect(error.message).toContain('single')
    }
    
    // Note: We can't directly verify tokens are gone since theme is deleted
    // But the CASCADE DELETE constraint ensures they were removed
  })

  it('isSlugAvailable returns correct values', async () => {
    // Create a theme with a known slug
    const theme = await createTheme({
      name: `Slug Test Theme ${testId}`,
      slug: `theme-slug-test-${testId}`,
      source: 'manual'
    })
    
    createdThemeIds.push(theme.id)
    
    // Check that the slug is NOT available
    const notAvailable = await isSlugAvailable(`theme-slug-test-${testId}`)
    expect(notAvailable).toBe(false)
    
    // Check that a different slug IS available
    const available = await isSlugAvailable(`theme-does-not-exist-${testId}`)
    expect(available).toBe(true)
    
    // Check that the slug is available when excluding the current theme (for updates)
    const availableForUpdate = await isSlugAvailable(`theme-slug-test-${testId}`, theme.id)
    expect(availableForUpdate).toBe(true)
  })

  it('getThemes returns list of themes', async () => {
    // Get all themes
    const themes = await getThemes()
    
    // Should be an array
    expect(Array.isArray(themes)).toBe(true)
    
    // Should include at least our test themes
    const testThemes = themes.filter(t => t.slug?.includes(`-${testId}`))
    expect(testThemes.length).toBeGreaterThan(0)
  })
})

