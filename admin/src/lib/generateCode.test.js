import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildPrompt, parseResponse, isAIConfigured } from './generateCode'

describe('generateCode', () => {
  describe('buildPrompt', () => {
    it('includes component name', () => {
      const component = { name: 'Button', description: 'A button' }
      const prompt = buildPrompt(component, '')
      expect(prompt).toContain('COMPONENT NAME: Button')
    })

    it('includes component description', () => {
      const component = { name: 'Button', description: 'A clickable button' }
      const prompt = buildPrompt(component, '')
      expect(prompt).toContain('DESCRIPTION: A clickable button')
    })

    it('includes variants', () => {
      const component = { name: 'Button', variants: ['primary', 'secondary'] }
      const prompt = buildPrompt(component, '')
      expect(prompt).toContain('primary, secondary')
    })

    it('includes feedback when provided', () => {
      const component = { name: 'Button' }
      const prompt = buildPrompt(component, 'Make it more accessible')
      expect(prompt).toContain('Make it more accessible')
    })

    it('includes linked tokens', () => {
      const component = { name: 'Button', linked_tokens: ['color-btn-primary-bg'] }
      const prompt = buildPrompt(component, '')
      expect(prompt).toContain('color-btn-primary-bg')
    })
  })

  describe('parseResponse', () => {
    it('extracts jsx code from response', () => {
      const response = `Here's the code:

\`\`\`jsx
function Button({ children }) {
  return <button>{children}</button>
}
\`\`\`

\`\`\`json
[{"name": "children", "type": "ReactNode"}]
\`\`\`
`
      const result = parseResponse(response)
      expect(result.jsx_code).toContain('function Button')
      expect(result.jsx_code).toContain('<button>')
    })

    it('extracts props from response', () => {
      const response = `
\`\`\`jsx
function Button() {}
\`\`\`

\`\`\`json
[{"name": "variant", "type": "string", "default": "primary"}]
\`\`\`
`
      const result = parseResponse(response)
      expect(result.props).toHaveLength(1)
      expect(result.props[0].name).toBe('variant')
    })

    it('handles response without props json', () => {
      const response = `
\`\`\`jsx
function Button() { return <button>Click</button> }
\`\`\`
`
      const result = parseResponse(response)
      expect(result.jsx_code).toContain('function Button')
      expect(result.props).toEqual([])
    })

    it('throws error when no code block found', () => {
      const response = 'No code here'
      expect(() => parseResponse(response)).toThrow('Could not parse code from AI response')
    })
  })

  describe('isAIConfigured', () => {
    it('returns boolean', () => {
      const result = isAIConfigured()
      expect(typeof result).toBe('boolean')
    })
  })
})

