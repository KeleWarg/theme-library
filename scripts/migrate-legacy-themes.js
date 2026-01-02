#!/usr/bin/env node
/**
 * Legacy Theme Migration Script
 * 
 * Imports all themes from figma_tokens/raw/*.json into the database
 * so they become editable through the admin interface.
 * 
 * Usage:
 *   node scripts/migrate-legacy-themes.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   Preview what would be imported without making changes
 *   --verbose   Show detailed token information
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const RAW_TOKENS_DIR = path.join(__dirname, '../figma_tokens/raw')
const THEME_FILES = [
  { file: 'Health_-_SEM_tokens.json', name: 'Health - SEM' },
  { file: 'Home_-_SEM_tokens.json', name: 'Home - SEM' },
  { file: 'LLM_tokens.json', name: 'LLM' },
  { file: 'ForbesMedia_-_SEO_tokens.json', name: 'ForbesMedia - SEO' },
  { file: 'Compare_Coverage_tokens.json', name: 'Advisor SEM/Compare Coverage' },
]

// CLI flags
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const VERBOSE = args.includes('--verbose')

// Category detection patterns (matches tokenParser.js)
const CATEGORY_PATTERNS = {
  color: /^color/i,
  typography: /^(font|typography|type|text|line[\s-]?height|letter[\s-]?spacing)/i,
  spacing: /^(spacing|space|gap|margin|padding)/i,
  shadow: /^(shadow|elevation)/i,
  radius: /^(radius|corner|border-radius)/i,
  grid: /^(grid|column|gutter|breakpoint)/i,
}

/**
 * Initialize Supabase client
 */
function initSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables')
    console.log('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Generate a URL-safe slug from theme name
 */
function generateSlug(name) {
  return 'theme-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
 * Generate CSS variable name
 */
function generateCSSVariableName(category, subcategory, name) {
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
function rgbComponentsToHex(components) {
  if (!components || components.length < 3) return '#000000'
  
  const toHex = (val) => {
    const hex = Math.round(val * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return '#' + components.slice(0, 3).map(toHex).join('').toUpperCase()
}

/**
 * Parse tokens from JSON file
 */
function parseTokenFile(jsonData) {
  const tokens = []
  
  function traverseTokens(obj, path) {
    if (!obj || typeof obj !== 'object') return
    
    // Check if this is a token (has $type or $value)
    if (obj.$type !== undefined || obj.$value !== undefined) {
      const token = extractToken(obj, path)
      if (token) {
        tokens.push(token)
      }
      return
    }
    
    // Recurse into children
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue
      if (value && typeof value === 'object') {
        traverseTokens(value, [...path, key])
      }
    }
  }
  
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
      }
    } else if (tokenType === 'number') {
      processedValue = { value: processedValue }
    } else if (tokenType === 'string') {
      processedValue = { value: processedValue }
    }
    
    // Extract Figma metadata
    const extensions = tokenObj.$extensions || {}
    const figmaId = extensions['com.figma.variableId'] || null
    
    return {
      name,
      category,
      subcategory,
      group_name: groupName,
      value: processedValue,
      css_variable: generateCSSVariableName(category, subcategory, name),
      figma_variable_id: figmaId,
      sort_order: 0,
    }
  }
  
  traverseTokens(jsonData, [])
  return tokens
}

/**
 * Check if theme already exists in database
 */
async function themeExists(supabase, slug) {
  const { data, error } = await supabase
    .from('themes')
    .select('id, name')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error
  }
  
  return data
}

/**
 * Create theme and tokens in database
 */
async function createThemeWithTokens(supabase, themeName, tokens, sourceFileName) {
  const slug = generateSlug(themeName)
  
  // Create theme
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .insert({
      name: themeName,
      slug,
      description: `Imported from ${sourceFileName}`,
      status: 'published',
      source: 'figma',
      source_file_name: sourceFileName,
    })
    .select()
    .single()
  
  if (themeError) throw themeError
  
  // Prepare tokens with theme_id
  const tokensWithThemeId = tokens.map(t => ({
    ...t,
    theme_id: theme.id,
  }))
  
  // Bulk insert tokens
  if (tokensWithThemeId.length > 0) {
    const { error: tokensError } = await supabase
      .from('theme_tokens')
      .insert(tokensWithThemeId)
    
    if (tokensError) throw tokensError
  }
  
  return theme
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🎨 Legacy Theme Migration')
  console.log('========================\n')
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }
  
  // Initialize Supabase (skip in dry run if no env vars)
  let supabase = null
  if (!DRY_RUN) {
    supabase = initSupabase()
  }
  
  let successCount = 0
  let skipCount = 0
  let errorCount = 0
  
  for (const { file, name } of THEME_FILES) {
    const filePath = path.join(RAW_TOKENS_DIR, file)
    
    console.log(`📦 Processing: ${name}`)
    console.log(`   File: ${file}`)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found, skipping\n`)
      skipCount++
      continue
    }
    
    try {
      // Read and parse JSON
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const tokens = parseTokenFile(jsonData)
      const slug = generateSlug(name)
      
      console.log(`   Slug: ${slug}`)
      console.log(`   Tokens: ${tokens.length}`)
      
      if (VERBOSE) {
        const categories = {}
        tokens.forEach(t => {
          categories[t.category] = (categories[t.category] || 0) + 1
        })
        console.log(`   Categories:`)
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`     - ${cat}: ${count}`)
        })
      }
      
      if (DRY_RUN) {
        console.log(`   ✅ Would import ${tokens.length} tokens\n`)
        successCount++
        continue
      }
      
      // Check if theme already exists
      const existing = await themeExists(supabase, slug)
      if (existing) {
        console.log(`   ⏭️  Theme already exists (ID: ${existing.id}), skipping\n`)
        skipCount++
        continue
      }
      
      // Create theme and tokens
      const theme = await createThemeWithTokens(supabase, name, tokens, file)
      console.log(`   ✅ Imported successfully (ID: ${theme.id})\n`)
      successCount++
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
      errorCount++
    }
  }
  
  // Summary
  console.log('========================')
  console.log('📊 Migration Summary')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ⏭️  Skipped: ${skipCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to perform actual migration')
  }
}

// Run migration
migrate().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

