/**
 * Theme Service
 * CRUD operations for themes and tokens
 * Chunk 1.02 - Theme Management System
 */

import { supabase } from './supabase'

// ============================================================================
// THEME CRUD OPERATIONS
// ============================================================================

/**
 * Get all themes with token count
 * @returns {Promise<Array>} Array of theme objects
 */
export async function getThemes() {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('themes')
    .select('*, theme_tokens(count)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Get a single theme by ID with all its tokens
 * @param {string} id - Theme UUID
 * @returns {Promise<Object>} Theme object with tokens
 */
export async function getThemeById(id) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('themes')
    .select('*, theme_tokens(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get a single theme by slug with all its tokens
 * @param {string} slug - Theme slug
 * @returns {Promise<Object>} Theme object with tokens
 */
export async function getThemeBySlug(slug) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('themes')
    .select('*, theme_tokens(*)')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Create a new theme
 * @param {Object} themeData - Theme data { name, slug, description, source, source_file_name }
 * @returns {Promise<Object>} Created theme object
 */
export async function createTheme(themeData) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('themes')
    .insert(themeData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update an existing theme
 * @param {string} id - Theme UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated theme object
 */
export async function updateTheme(id, updates) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('themes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a theme (cascades to tokens)
 * @param {string} id - Theme UUID
 * @returns {Promise<boolean>} True if successful
 */
export async function deleteTheme(id) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

/**
 * Publish a theme (sets status to 'published' and records timestamp)
 * @param {string} id - Theme UUID
 * @returns {Promise<Object>} Updated theme object
 */
export async function publishTheme(id) {
  return updateTheme(id, { 
    status: 'published', 
    published_at: new Date().toISOString() 
  })
}

/**
 * Archive a theme
 * @param {string} id - Theme UUID
 * @returns {Promise<Object>} Updated theme object
 */
export async function archiveTheme(id) {
  return updateTheme(id, { status: 'archived' })
}

/**
 * Duplicate a theme with all its tokens
 * @param {string} id - Theme UUID to duplicate
 * @param {string} newName - Name for the duplicated theme
 * @returns {Promise<Object>} New theme object
 */
export async function duplicateTheme(id, newName) {
  // Get the original theme with tokens
  const original = await getThemeById(id)
  
  // Generate new slug
  const newSlug = generateSlug(newName)
  
  // Create new theme
  const newTheme = await createTheme({
    name: newName,
    slug: newSlug,
    description: original.description ? `Copy of: ${original.description}` : `Copy of ${original.name}`,
    source: 'manual',
    status: 'draft'
  })
  
  // Duplicate tokens if any exist
  if (original.theme_tokens && original.theme_tokens.length > 0) {
    const newTokens = original.theme_tokens.map(token => ({
      theme_id: newTheme.id,
      category: token.category,
      subcategory: token.subcategory,
      group_name: token.group_name,
      name: token.name,
      value: token.value,
      css_variable: token.css_variable,
      figma_variable_id: null, // Don't copy Figma ID
      sort_order: token.sort_order
    }))
    
    await bulkCreateTokens(newTokens)
  }
  
  // Return the new theme with tokens
  return getThemeById(newTheme.id)
}

// ============================================================================
// TOKEN CRUD OPERATIONS
// ============================================================================

/**
 * Get all tokens for a theme
 * @param {string} themeId - Theme UUID
 * @returns {Promise<Array>} Array of token objects
 */
export async function getTokensByTheme(themeId) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('theme_tokens')
    .select('*')
    .eq('theme_id', themeId)
    .order('category')
    .order('sort_order')
  
  if (error) throw error
  return data
}

/**
 * Get tokens for a theme filtered by category
 * @param {string} themeId - Theme UUID
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of token objects
 */
export async function getTokensByCategory(themeId, category) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('theme_tokens')
    .select('*')
    .eq('theme_id', themeId)
    .eq('category', category)
    .order('sort_order')
  
  if (error) throw error
  return data
}

/**
 * Create a single token
 * @param {Object} tokenData - Token data
 * @returns {Promise<Object>} Created token object
 */
export async function createToken(tokenData) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('theme_tokens')
    .insert(tokenData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update a token
 * @param {string} id - Token UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated token object
 */
export async function updateToken(id, updates) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('theme_tokens')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a token
 * @param {string} id - Token UUID
 * @returns {Promise<boolean>} True if successful
 */
export async function deleteToken(id) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabase
    .from('theme_tokens')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

/**
 * Bulk create tokens (for import)
 * @param {Array} tokens - Array of token objects
 * @returns {Promise<Array>} Array of created token objects
 */
export async function bulkCreateTokens(tokens) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  if (!tokens || tokens.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('theme_tokens')
    .insert(tokens)
    .select()
  
  if (error) throw error
  return data
}

/**
 * Bulk update tokens
 * @param {Array} updates - Array of { id, ...changes }
 * @returns {Promise<Array>} Array of updated token objects
 */
export async function bulkUpdateTokens(updates) {
  if (!updates || updates.length === 0) {
    return []
  }

  const results = await Promise.all(
    updates.map(({ id, ...changes }) => updateToken(id, changes))
  )
  return results
}

/**
 * Delete all tokens for a theme (useful before re-import)
 * @param {string} themeId - Theme UUID
 * @returns {Promise<boolean>} True if successful
 */
export async function deleteTokensByTheme(themeId) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabase
    .from('theme_tokens')
    .delete()
    .eq('theme_id', themeId)
  
  if (error) throw error
  return true
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a URL-safe slug from a theme name
 * @param {string} name - Theme name
 * @returns {string} Generated slug
 */
export function generateSlug(name) {
  if (!name) return 'theme-unnamed'
  
  return 'theme-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a CSS variable name from token path
 * @param {string} category - Token category
 * @param {string} subcategory - Token subcategory (can be null)
 * @param {string} name - Token name
 * @returns {string} CSS variable name (e.g., --color-btn-primary-bg)
 */
export function generateCSSVariable(category, subcategory, name) {
  const parts = [category, subcategory, name].filter(Boolean)
  
  if (parts.length === 0) return '--token'
  
  return '--' + parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Check if a slug is available (not already in use)
 * @param {string} slug - Slug to check
 * @param {string} excludeId - Theme ID to exclude (for updates)
 * @returns {Promise<boolean>} True if available
 */
export async function isSlugAvailable(slug, excludeId = null) {
  if (!supabase) {
    return true // Assume available if Supabase not configured
  }

  let query = supabase
    .from('themes')
    .select('id')
    .eq('slug', slug)
  
  if (excludeId) {
    query = query.neq('id', excludeId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data.length === 0
}

/**
 * Get token statistics for a theme
 * @param {string} themeId - Theme UUID
 * @returns {Promise<Object>} Token counts by category
 */
export async function getTokenStats(themeId) {
  const tokens = await getTokensByTheme(themeId)
  
  const stats = {
    total: tokens.length,
    byCategory: {}
  }
  
  tokens.forEach(token => {
    stats.byCategory[token.category] = (stats.byCategory[token.category] || 0) + 1
  })
  
  return stats
}

/**
 * Group tokens by category for display
 * @param {Array} tokens - Array of token objects
 * @returns {Object} Tokens grouped by category
 */
export function groupTokensByCategory(tokens) {
  return tokens.reduce((acc, token) => {
    const category = token.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(token)
    return acc
  }, {})
}

/**
 * Group tokens by category and subcategory for nested display
 * @param {Array} tokens - Array of token objects
 * @returns {Object} Nested structure { category: { subcategory: [tokens] } }
 */
export function groupTokensNested(tokens) {
  return tokens.reduce((acc, token) => {
    const category = token.category || 'other'
    const subcategory = token.subcategory || '_root'
    
    if (!acc[category]) {
      acc[category] = {}
    }
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = []
    }
    
    acc[category][subcategory].push(token)
    return acc
  }, {})
}

