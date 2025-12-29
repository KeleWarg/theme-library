import { supabase } from './supabase'

// ============ Components ============

export async function getComponents(filters = {}) {
  if (!supabase) return []
  
  let query = supabase
    .from('components')
    .select('*')
    .order('name')
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.code_status) {
    query = query.eq('code_status', filters.code_status)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getComponent(slug) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

export async function getComponentById(id) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createComponent(component) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .insert(component)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateComponent(id, updates) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteComponent(id) {
  if (!supabase) return
  
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function upsertComponentByFigmaId(component) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('components')
    .upsert(component, { 
      onConflict: 'figma_id',
      returning: 'representation'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ Sync Logs ============

export async function addSyncLog(type, componentId, status, message, details = null) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('sync_logs')
    .insert({
      type,
      component_id: componentId,
      status,
      message,
      details
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getSyncLogs(limit = 20) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sync_logs')
    .select(`
      *,
      component:components(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// ============ Stats ============

export async function getComponentStats() {
  if (!supabase) return { total: 0, published: 0, pending: 0, generated: 0 }
  
  const { data, error } = await supabase
    .from('components')
    .select('status, code_status')
  
  if (error) throw error
  
  const total = data?.length || 0
  const published = data?.filter(c => c.status === 'published').length || 0
  const pending = data?.filter(c => c.code_status === 'pending').length || 0
  const generated = data?.filter(c => c.code_status === 'generated').length || 0
  
  return { total, published, pending, generated }
}



