import { useState, useEffect, useCallback } from 'react'
import { getComponents } from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockComponents } from '../lib/seedData'

export function useComponents(filters = {}) {
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComponents = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (isSupabaseConfigured()) {
        const data = await getComponents(filters)
        setComponents(data)
      } else {
        // Use mock data when Supabase not configured
        let data = [...mockComponents]
        
        // Apply filters to mock data
        if (filters.status) {
          data = data.filter(c => c.status === filters.status)
        }
        if (filters.code_status) {
          data = data.filter(c => c.code_status === filters.code_status)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          data = data.filter(c => 
            c.name.toLowerCase().includes(searchLower) ||
            c.category?.toLowerCase().includes(searchLower)
          )
        }
        
        setComponents(data)
      }
    } catch (err) {
      setError(err)
      setComponents(mockComponents) // Fallback
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.code_status, filters.search])

  useEffect(() => {
    fetchComponents()
  }, [fetchComponents])

  return { components, loading, error, refetch: fetchComponents }
}



