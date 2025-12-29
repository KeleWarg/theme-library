import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('returns default theme when no localStorage', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('theme-health---sem')
  })

  it('reads theme from localStorage', () => {
    localStorage.setItem('design-system-theme', 'theme-llm')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('theme-llm')
  })

  it('updates document class when theme changes', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('theme-llm')
    })
    expect(document.documentElement.className).toBe('theme-llm')
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('theme-home---sem')
    })
    expect(localStorage.getItem('design-system-theme')).toBe('theme-home---sem')
  })
})



