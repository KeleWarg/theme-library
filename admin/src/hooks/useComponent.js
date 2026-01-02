import { useState, useEffect, useCallback } from 'react'
import { getComponent, updateComponent } from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockComponents } from '../lib/seedData'

export function useComponent(slug) {
  const [component, setComponent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComponent = useCallback(async () => {
    if (!slug) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (isSupabaseConfigured()) {
        const data = await getComponent(slug)
        setComponent(data)
      } else {
        // Use mock data
        const data = mockComponents.find(c => c.slug === slug)
        setComponent(data || null)
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchComponent()
  }, [fetchComponent])

  const update = async (updates) => {
    if (!component) return
    
    try {
      if (isSupabaseConfigured()) {
        const updated = await updateComponent(component.id, updates)
        setComponent(updated)
        return updated
      } else {
        // Mock update
        const updated = { ...component, ...updates }
        setComponent(updated)
        return updated
      }
    } catch (err) {
      setError(err)
      throw err
    }
  }

  return { component, loading, error, update, refetch: fetchComponent }
}



