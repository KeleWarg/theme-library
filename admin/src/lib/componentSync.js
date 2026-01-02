/**
 * Component Sync Handler
 * 
 * This module provides functions to handle component syncs from the Figma plugin.
 * 
 * For production, you would:
 * 1. Use Supabase Edge Functions to create an API endpoint
 * 2. Or use a backend server (Next.js API routes, Express, etc.)
 * 
 * For local development, the Figma plugin can sync directly to Supabase
 * by using the Supabase client credentials.
 */

import { supabase } from './supabase'

/**
 * Sync a component from Figma to the database
 * @param {Object} componentData - Component data from Figma plugin
 * @returns {Promise<{success: boolean, component?: Object, error?: string}>}
 */
export async function syncComponent(componentData) {
  try {
    // Validate required fields
    if (!componentData.figma_id || !componentData.name) {
      throw new Error('Missing required fields: figma_id and name')
    }

    // Prepare data for database
    const dbData = {
      figma_id: componentData.figma_id,
      name: componentData.name,
      slug: generateSlug(componentData.name),
      description: componentData.description || '',
      category: detectCategory(componentData.name),
      variants: componentData.variants || [],
      prop_types: componentData.prop_types || [],
      tokens_used: componentData.tokens_used || [],
      snapshot_url: componentData.snapshot_url || null,
      figma_url: componentData.figma_url || null,
      status: 'draft',
      code_status: componentData.status || 'pending',
      updated_at: new Date().toISOString()
    }

    // Upsert - update if figma_id exists, insert if not
    const { data, error } = await supabase
      .from('components')
      .upsert(dbData, {
        onConflict: 'figma_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Sync error:', error)
      throw new Error(error.message)
    }

    // Log the sync
    await logSync(componentData.figma_id, 'success')

    return {
      success: true,
      component: data
    }

  } catch (error) {
    // Log failed sync
    await logSync(componentData?.figma_id, 'error', error.message)
    
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sync multiple components from Figma
 * @param {Array} components - Array of component data
 * @returns {Promise<{success: number, failed: number, results: Array}>}
 */
export async function syncComponents(components) {
  const results = []
  let success = 0
  let failed = 0

  for (const component of components) {
    const result = await syncComponent(component)
    results.push({
      name: component.name,
      ...result
    })

    if (result.success) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed, results }
}

/**
 * Generate a URL-friendly slug from component name
 * @param {string} name - Component name
 * @returns {string} - URL slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Detect component category from name
 * @param {string} name - Component name
 * @returns {string} - Category
 */
function detectCategory(name) {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('button') || lowerName.includes('btn')) {
    return 'buttons'
  }
  if (lowerName.includes('input') || lowerName.includes('text') || lowerName.includes('field')) {
    return 'inputs'
  }
  if (lowerName.includes('card')) {
    return 'cards'
  }
  if (lowerName.includes('modal') || lowerName.includes('dialog')) {
    return 'modals'
  }
  if (lowerName.includes('nav') || lowerName.includes('menu') || lowerName.includes('tab')) {
    return 'navigation'
  }
  if (lowerName.includes('header') || lowerName.includes('footer') || lowerName.includes('sidebar')) {
    return 'layout'
  }
  if (lowerName.includes('icon')) {
    return 'icons'
  }
  if (lowerName.includes('badge') || lowerName.includes('tag') || lowerName.includes('chip')) {
    return 'badges'
  }
  
  return 'ui'
}

/**
 * Log a sync event
 * @param {string} figmaId - Figma component ID
 * @param {string} status - 'success' or 'error'
 * @param {string} message - Optional message
 */
async function logSync(figmaId, status, message = null) {
  try {
    await supabase.from('sync_logs').insert({
      component_id: figmaId,
      status,
      message,
      source: 'figma-plugin',
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log sync:', error)
  }
}

/**
 * Get recent sync logs
 * @param {number} limit - Number of logs to return
 * @returns {Promise<Array>}
 */
export async function getRecentSyncs(limit = 10) {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get sync logs:', error)
    return []
  }

  return data
}

/**
 * API endpoint handler for Express/Next.js
 * Use this as a reference for setting up a server endpoint
 * 
 * @example
 * // Next.js pages/api/components.js
 * import { handleComponentSync } from '../lib/componentSync'
 * export default handleComponentSync
 * 
 * // Express
 * app.post('/api/components', handleComponentSync)
 */
export async function handleComponentSync(req, res) {
  // Enable CORS for Figma plugin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const componentData = req.body

  const result = await syncComponent(componentData)

  if (result.success) {
    return res.status(200).json(result)
  } else {
    return res.status(400).json(result)
  }
}



