# Chunk 1.02 — Theme Service

## Purpose
Create the service layer with CRUD operations for themes and tokens, providing a clean API for UI components.

---

## Inputs
- Supabase client (existing)
- Database tables (from chunk 1.01)

## Outputs
- `src/lib/themeService.js` (consumed by chunks 2.04, 3.01, 4.01, 5.01)
- `src/lib/themeService.test.js` (verification)

---

## Dependencies
- Chunk 1.01 must be complete (tables must exist)

---

## Implementation Notes

### Key Considerations
- All functions should be async and return promises
- Consistent error handling — throw on failure, let callers handle
- Use Supabase `.select()` for returning created/updated records
- Helper functions for slug generation and CSS variable naming

### Gotchas
- Supabase returns `{ data, error }` — always check error
- `.single()` throws if no record found
- Bulk insert needs to handle partial failures gracefully

### Algorithm/Approach
Standard CRUD pattern with Supabase client. Group functions by entity (themes, tokens). Include helper utilities for common operations.

---

## Files Created
- `src/lib/themeService.js` — Service implementation
- `src/lib/themeService.test.js` — Unit tests for helpers

---

## Implementation

```javascript
// src/lib/themeService.js
import { supabase } from './supabase'

// ============ THEME CRUD ============

export async function getThemes() {
  const { data, error } = await supabase
    .from('themes')
    .select('*, theme_tokens(count)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getThemeById(id) {
  const { data, error } = await supabase
    .from('themes')
    .select('*, theme_tokens(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getThemeBySlug(slug) {
  const { data, error } = await supabase
    .from('themes')
    .select('*, theme_tokens(*)')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function createTheme(themeData) {
  const { data, error } = await supabase
    .from('themes')
    .insert(themeData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTheme(id, updates) {
  const { data, error } = await supabase
    .from('themes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTheme(id) {
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function publishTheme(id) {
  return updateTheme(id, { 
    status: 'published', 
    published_at: new Date().toISOString() 
  })
}

// ============ TOKEN CRUD ============

export async function getTokensByTheme(themeId) {
  const { data, error } = await supabase
    .from('theme_tokens')
    .select('*')
    .eq('theme_id', themeId)
    .order('category')
    .order('sort_order')
  
  if (error) throw error
  return data
}

export async function getTokensByCategory(themeId, category) {
  const { data, error } = await supabase
    .from('theme_tokens')
    .select('*')
    .eq('theme_id', themeId)
    .eq('category', category)
    .order('sort_order')
  
  if (error) throw error
  return data
}

export async function createToken(tokenData) {
  const { data, error } = await supabase
    .from('theme_tokens')
    .insert(tokenData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateToken(id, updates) {
  const { data, error } = await supabase
    .from('theme_tokens')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteToken(id) {
  const { error } = await supabase
    .from('theme_tokens')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function bulkCreateTokens(tokens) {
  const { data, error } = await supabase
    .from('theme_tokens')
    .insert(tokens)
    .select()
  
  if (error) throw error
  return data
}

export async function bulkUpdateTokens(updates) {
  // updates = [{ id, ...changes }, ...]
  const results = await Promise.all(
    updates.map(({ id, ...changes }) => updateToken(id, changes))
  )
  return results
}

// ============ HELPERS ============

export function generateSlug(name) {
  return 'theme-' + name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateCSSVariable(category, subcategory, name) {
  const parts = [category, subcategory, name].filter(Boolean)
  return '--' + parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function isSlugAvailable(slug, excludeId = null) {
  const query = supabase
    .from('themes')
    .select('id')
    .eq('slug', slug)
  
  if (excludeId) {
    query.neq('id', excludeId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data.length === 0
}
```

---

## Tests

### Unit Tests
- [ ] `generateSlug` produces correct format from various inputs
- [ ] `generateSlug` handles special characters
- [ ] `generateCSSVariable` produces correct format
- [ ] `generateCSSVariable` handles null subcategory

### Integration Tests
- [ ] `createTheme` + `getThemeById` roundtrip
- [ ] `updateTheme` changes values
- [ ] `deleteTheme` removes record
- [ ] `bulkCreateTokens` creates all tokens
- [ ] Cascade delete removes tokens when theme deleted

### Verification
- [ ] Import service in browser console, call functions
- [ ] Create theme via service, verify in Supabase dashboard
- [ ] Create tokens, verify foreign key relationship

---

## Time Estimate
2 hours

---

## Notes
- Error messages from Supabase are user-friendly; can display directly
- Consider adding caching layer if performance becomes an issue
- `bulkUpdateTokens` uses individual updates; could optimize with upsert if needed
