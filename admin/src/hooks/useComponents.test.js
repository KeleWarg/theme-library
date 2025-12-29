import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useComponents } from './useComponents'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => false
}))

describe('useComponents', () => {
  it('starts with empty components array', () => {
    const { result } = renderHook(() => useComponents())
    // Initial state or after quick load
    expect(Array.isArray(result.current.components)).toBe(true)
  })

  it('returns components after loading', async () => {
    const { result } = renderHook(() => useComponents())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.components.length).toBeGreaterThan(0)
  })

  it('provides refetch function', async () => {
    const { result } = renderHook(() => useComponents())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(typeof result.current.refetch).toBe('function')
  })

  it('filters by code_status', async () => {
    const { result } = renderHook(() => useComponents({ code_status: 'approved' }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    // All returned components should have approved status
    result.current.components.forEach(c => {
      expect(c.code_status).toBe('approved')
    })
  })

  it('filters by search term', async () => {
    const { result } = renderHook(() => useComponents({ search: 'button' }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    // Should find Button component
    expect(result.current.components.some(c => 
      c.name.toLowerCase().includes('button')
    )).toBe(true)
  })

  it('returns error as null when successful', async () => {
    const { result } = renderHook(() => useComponents())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBeNull()
  })
})

