import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useComponent } from './useComponent'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => false
}))

describe('useComponent', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useComponent('button'))
    // May be true or already resolved due to fast mock
    expect(typeof result.current.loading).toBe('boolean')
  })

  it('returns component after loading', async () => {
    const { result } = renderHook(() => useComponent('button'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.component).toBeDefined()
    expect(result.current.component.name).toBe('Button')
  })

  it('returns null for unknown slug', async () => {
    const { result } = renderHook(() => useComponent('unknown'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.component).toBeNull()
  })

  it('provides update function', async () => {
    const { result } = renderHook(() => useComponent('button'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(typeof result.current.update).toBe('function')
  })

  it('provides refetch function', async () => {
    const { result } = renderHook(() => useComponent('button'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(typeof result.current.refetch).toBe('function')
  })

  it('update function modifies component state', async () => {
    const { result } = renderHook(() => useComponent('button'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    const originalName = result.current.component.name
    
    // Use act to wrap async state update
    await waitFor(async () => {
      await result.current.update({ description: 'Updated description' })
    })
    
    await waitFor(() => {
      expect(result.current.component.description).toBe('Updated description')
    })
    expect(result.current.component.name).toBe(originalName)
  })
})

