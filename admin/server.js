/**
 * Simple API server for testing Figma plugin sync
 * 
 * Run with: node server.js
 * The server runs on port 3001 and proxies to Vite dev server
 */

import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Large limit for base64 images

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found in .env.local')
  console.warn('   Components will be logged but not saved to database')
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * Generate a URL-friendly slug from component name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Detect component category from name
 */
function detectCategory(name) {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('button') || lowerName.includes('btn')) return 'buttons'
  if (lowerName.includes('input') || lowerName.includes('field')) return 'inputs'
  if (lowerName.includes('card')) return 'cards'
  if (lowerName.includes('modal') || lowerName.includes('dialog')) return 'modals'
  if (lowerName.includes('nav') || lowerName.includes('menu')) return 'navigation'
  if (lowerName.includes('header') || lowerName.includes('footer')) return 'layout'
  if (lowerName.includes('badge') || lowerName.includes('tag')) return 'badges'
  
  return 'ui'
}

/**
 * POST /api/components - Receive component from Figma plugin
 */
app.post('/api/components', async (req, res) => {
  try {
    const componentData = req.body
    
    console.log('\n📦 Received component from Figma:')
    console.log('   Name:', componentData.name)
    console.log('   Figma ID:', componentData.figma_id)
    console.log('   Variants:', componentData.variants?.length || 0)
    console.log('   Props:', componentData.prop_types?.length || 0)
    console.log('   Tokens:', componentData.tokens_used?.length || 0)
    console.log('   Has snapshot:', !!componentData.snapshot_url)
    
    // Validate required fields
    if (!componentData.figma_id || !componentData.name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: figma_id and name' 
      })
    }

    // Prepare data for database using only core columns that exist in schema
    // Additional columns (figma_url, snapshot_url, tokens_used, prop_types) 
    // require running schema-update.sql first
    const dbData = {
      figma_id: componentData.figma_id,
      name: componentData.name,
      slug: generateSlug(componentData.name),
      description: componentData.description || '',
      category: detectCategory(componentData.name),
      variants: componentData.variants || [],
      props: componentData.prop_types || [], // Use 'props' column name
      status: 'draft',
      code_status: 'pending',
      updated_at: new Date().toISOString()
    }
    
    // Store extra data in console for debugging
    console.log('   Extra data (not saved without schema update):')
    console.log('   - figma_url:', componentData.figma_url || 'none')
    console.log('   - snapshot:', componentData.snapshot_url ? 'yes' : 'no')
    console.log('   - tokens:', componentData.tokens_used?.join(', ') || 'none')

    // Save to Supabase if configured
    if (supabase) {
      const { data, error } = await supabase
        .from('components')
        .upsert(dbData, {
          onConflict: 'figma_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Database error:', error.message)
        return res.status(500).json({ success: false, error: error.message })
      }

      console.log('✅ Saved to database:', data.id)
      
      // Log sync
      await supabase.from('sync_logs').insert({
        component_id: componentData.figma_id,
        status: 'success',
        source: 'figma-plugin',
        created_at: new Date().toISOString()
      })

      return res.json({ success: true, component: data })
    }

    // No database - just acknowledge receipt
    console.log('✅ Component received (not saved - no database)')
    return res.json({ 
      success: true, 
      message: 'Component received (database not configured)',
      component: dbData 
    })

  } catch (error) {
    console.error('❌ Server error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/components - List all components
 */
app.get('/api/components', async (req, res) => {
  if (!supabase) {
    return res.json({ success: true, components: [] })
  }

  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    return res.status(500).json({ success: false, error: error.message })
  }

  res.json({ success: true, components: data })
})

/**
 * GET /api/sync-logs - Get recent sync logs
 */
app.get('/api/sync-logs', async (req, res) => {
  if (!supabase) {
    return res.json({ success: true, logs: [] })
  }

  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return res.status(500).json({ success: false, error: error.message })
  }

  res.json({ success: true, logs: data })
})

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: supabase ? 'connected' : 'not configured',
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log('')
  console.log('🚀 Design System API Server')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`   API:      http://localhost:${PORT}/api/components`)
  console.log(`   Health:   http://localhost:${PORT}/api/health`)
  console.log(`   Database: ${supabase ? '✅ Connected' : '⚠️  Not configured'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📋 In Figma plugin, set API URL to:')
  console.log(`   http://localhost:${PORT}/api/components`)
  console.log('')
})

