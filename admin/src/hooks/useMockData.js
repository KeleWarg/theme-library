import { useState, useEffect, useCallback } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockComponents } from '../lib/seedData'

// Use this hook when you need components but Supabase might not be configured
export function useMockableComponents(fetchFn) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const stableFetchFn = useCallback(fetchFn, [])

  useEffect(() => {
    async function load() {
      try {
        if (isSupabaseConfigured()) {
          const result = await stableFetchFn()
          setData(result)
        } else {
          // Use mock data in development without Supabase
          setData(mockComponents)
        }
      } catch (err) {
        setError(err)
        // Fall back to mock data on error
        setData(mockComponents)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [stableFetchFn])

  return { data, loading, error }
}

// Hook to get a single component by slug
export function useMockableComponent(slug) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        if (isSupabaseConfigured()) {
          const { getComponent } = await import('../lib/database')
          const result = await getComponent(slug)
          setData(result)
        } else {
          // Use mock data in development without Supabase
          const component = mockComponents.find(c => c.slug === slug)
          setData(component || null)
        }
      } catch (err) {
        setError(err)
        // Fall back to mock data on error
        const component = mockComponents.find(c => c.slug === slug)
        setData(component || null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  return { data, loading, error }
}





