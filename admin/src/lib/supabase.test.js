import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('supabase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exports supabase client when env vars set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')
    
    const { isSupabaseConfigured } = await import('./supabase')
    expect(isSupabaseConfigured()).toBe(true)
  })

  it('exports null when env vars missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    
    const { isSupabaseConfigured } = await import('./supabase')
    expect(isSupabaseConfigured()).toBe(false)
  })
})



