import { describe, it, expect } from 'vitest'
import { mockComponents } from './seedData'

describe('seedData', () => {
  describe('mockComponents', () => {
    it('has required components', () => {
      const names = mockComponents.map(c => c.name)
      expect(names).toContain('Button')
      expect(names).toContain('Card')
      expect(names).toContain('Input')
      expect(names).toContain('Badge')
    })

    it('has 4 mock components', () => {
      expect(mockComponents).toHaveLength(4)
    })

    it('each component has required fields', () => {
      mockComponents.forEach(component => {
        expect(component).toHaveProperty('name')
        expect(component).toHaveProperty('slug')
        expect(component).toHaveProperty('category')
        expect(component).toHaveProperty('props')
        expect(component).toHaveProperty('variants')
      })
    })

    it('Button has jsx_code', () => {
      const button = mockComponents.find(c => c.name === 'Button')
      expect(button.jsx_code).toBeTruthy()
      expect(button.code_status).toBe('approved')
    })

    it('Button has correct status', () => {
      const button = mockComponents.find(c => c.name === 'Button')
      expect(button.status).toBe('published')
    })

    it('Input has pending code_status', () => {
      const input = mockComponents.find(c => c.name === 'Input')
      expect(input.code_status).toBe('pending')
      expect(input.jsx_code).toBeNull()
    })

    it('each component has linked_tokens', () => {
      mockComponents.forEach(component => {
        expect(component).toHaveProperty('linked_tokens')
        expect(Array.isArray(component.linked_tokens)).toBe(true)
      })
    })
  })
})





