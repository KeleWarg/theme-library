import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMockableComponents, useMockableComponent } from './useMockData'
import { mockComponents } from '../lib/seedData'

// Mock supabase - not configured by default
vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  supabase: null
}))

describe('useMockableComponents', () => {
  it('returns mock data when Supabase not configured', async () => {
    const fetchFn = vi.fn()
    const { result } = renderHook(() => useMockableComponents(fetchFn))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toEqual(mockComponents)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('resolves loading state after fetch', async () => {
    const fetchFn = vi.fn()
    const { result } = renderHook(() => useMockableComponents(fetchFn))
    
    // Loading resolves quickly with mock data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data.length).toBeGreaterThan(0)
  })
})

describe('useMockableComponent', () => {
  it('returns mock component by slug', async () => {
    const { result } = renderHook(() => useMockableComponent('button'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toMatchObject({ name: 'Button', slug: 'button' })
  })

  it('returns null for unknown slug', async () => {
    const { result } = renderHook(() => useMockableComponent('nonexistent'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toBeNull()
  })
})

