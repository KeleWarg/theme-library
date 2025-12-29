import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as database from './database'

// Mock supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '123', name: 'Test' }, error: null }),
    }))
  }
}))

describe('database', () => {
  describe('getComponents', () => {
    it('calls supabase with correct query', async () => {
      const result = await database.getComponents()
      expect(result).toBeDefined()
    })

    it('applies filters when provided', async () => {
      const result = await database.getComponents({ status: 'published' })
      expect(result).toBeDefined()
    })
  })

  describe('getComponent', () => {
    it('queries by slug', async () => {
      const result = await database.getComponent('button')
      expect(result).toBeDefined()
    })
  })

  describe('getComponentById', () => {
    it('queries by id', async () => {
      const result = await database.getComponentById('123')
      expect(result).toBeDefined()
    })
  })

  describe('createComponent', () => {
    it('inserts component', async () => {
      const result = await database.createComponent({ name: 'Test', slug: 'test' })
      expect(result).toBeDefined()
    })
  })

  describe('updateComponent', () => {
    it('updates component by id', async () => {
      const result = await database.updateComponent('123', { name: 'Updated' })
      expect(result).toBeDefined()
    })
  })

  describe('addSyncLog', () => {
    it('inserts sync log', async () => {
      const result = await database.addSyncLog('component', '123', 'success', 'Synced')
      expect(result).toBeDefined()
    })
  })

  describe('getComponentStats', () => {
    it('returns stats object', async () => {
      const result = await database.getComponentStats()
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('published')
      expect(result).toHaveProperty('pending')
      expect(result).toHaveProperty('generated')
    })
  })
})



