import { describe, it, expect } from 'vitest'
import { 
  generateComponentsIndex, 
  generateLLMSTxt, 
  generatePackageJson,
  generateTokensCSS,
  generateTokensJSON,
  generateTokensTS
} from './packageGenerator'

describe('packageGenerator', () => {
  const mockComponents = [
    { 
      name: 'Button', 
      slug: 'button',
      status: 'published', 
      jsx_code: 'function Button() { return <button /> }', 
      description: 'A clickable button',
      props: [
        { name: 'variant', type: 'string', default: 'primary', description: 'Button variant' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state' }
      ], 
      variants: [{ name: 'primary' }, { name: 'secondary' }]
    },
    {
      name: 'Card',
      slug: 'card',
      status: 'published',
      jsx_code: 'function Card() { return <div /> }',
      description: 'Content container',
      props: [],
      variants: []
    },
    {
      name: 'Input',
      slug: 'input',
      status: 'draft', // Not published - should be excluded
      jsx_code: 'function Input() { return <input /> }',
      props: [],
      variants: []
    }
  ]

  describe('generateComponentsIndex', () => {
    it('generates exports for all components', () => {
      const result = generateComponentsIndex(mockComponents)
      expect(result).toContain("export { Button } from './Button';")
      expect(result).toContain("export { Card } from './Card';")
      expect(result).toContain("export { Input } from './Input';")
    })

    it('generates one export per line', () => {
      const result = generateComponentsIndex(mockComponents)
      const lines = result.split('\n')
      expect(lines).toHaveLength(3)
    })

    it('handles empty array', () => {
      const result = generateComponentsIndex([])
      expect(result).toBe('')
    })
  })

  describe('generateLLMSTxt', () => {
    it('includes package name', () => {
      const result = generateLLMSTxt(mockComponents, '@test/design-system')
      expect(result).toContain('@test/design-system')
      expect(result).toContain('npm install @test/design-system')
    })

    it('only includes published components with code', () => {
      const result = generateLLMSTxt(mockComponents, '@test/pkg')
      expect(result).toContain('### Button')
      expect(result).toContain('### Card')
      expect(result).not.toContain('### Input') // Not published
    })

    it('includes component descriptions', () => {
      const result = generateLLMSTxt(mockComponents, '@test/pkg')
      expect(result).toContain('A clickable button')
      expect(result).toContain('Content container')
    })

    it('includes props table', () => {
      const result = generateLLMSTxt(mockComponents, '@test/pkg')
      expect(result).toContain('| variant |')
      expect(result).toContain('| disabled |')
    })

    it('includes variants', () => {
      const result = generateLLMSTxt(mockComponents, '@test/pkg')
      expect(result).toContain('primary, secondary')
    })

    it('includes theme list', () => {
      const result = generateLLMSTxt(mockComponents, '@test/pkg')
      expect(result).toContain('theme-health-sem')
      expect(result).toContain('theme-llm')
    })

    it('includes AI rules', () => {
      const result = generateLLMSTxt(mockComponents, '@test/pkg')
      expect(result).toContain('Rules for AI')
      expect(result).toContain('Use CSS variables')
    })
  })

  describe('generatePackageJson', () => {
    it('generates valid JSON', () => {
      const result = generatePackageJson('@test/pkg', '1.0.0')
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes package name and version', () => {
      const result = JSON.parse(generatePackageJson('@myorg/design-system', '2.5.0'))
      expect(result.name).toBe('@myorg/design-system')
      expect(result.version).toBe('2.5.0')
    })

    it('includes peer dependencies', () => {
      const result = JSON.parse(generatePackageJson('@test/pkg', '1.0.0'))
      expect(result.peerDependencies.react).toBeDefined()
    })

    it('includes exports config', () => {
      const result = JSON.parse(generatePackageJson('@test/pkg', '1.0.0'))
      expect(result.exports['.']).toBeDefined()
      expect(result.exports['./tokens.css']).toBeDefined()
    })
  })

  describe('generateTokensCSS', () => {
    it('includes root variables', () => {
      const result = generateTokensCSS()
      expect(result).toContain(':root {')
      expect(result).toContain('--color-bg-white')
      expect(result).toContain('--font-size-body-md')
    })

    it('includes all themes', () => {
      const result = generateTokensCSS()
      expect(result).toContain('.theme-health-sem')
      expect(result).toContain('.theme-home-sem')
      expect(result).toContain('.theme-llm')
      expect(result).toContain('.theme-forbes-media-seo')
      expect(result).toContain('.theme-advisor-sem-compare-coverage')
    })

    it('includes button tokens per theme', () => {
      const result = generateTokensCSS()
      expect(result).toContain('--color-btn-primary-bg')
      expect(result).toContain('--color-btn-primary-text')
    })
  })

  describe('generateTokensJSON', () => {
    it('generates valid JSON', () => {
      const result = generateTokensJSON()
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes color tokens', () => {
      const result = JSON.parse(generateTokensJSON())
      expect(result.colors.bg.white).toBe('#FFFFFF')
      expect(result.colors.fg.heading).toBe('#1A1A1A')
    })

    it('includes typography tokens', () => {
      const result = JSON.parse(generateTokensJSON())
      expect(result.typography.fontSize['body-md']).toBe('16px')
      expect(result.typography.fontWeight.bold).toBe(700)
    })

    it('includes spacing tokens', () => {
      const result = JSON.parse(generateTokensJSON())
      expect(result.spacing.md).toBe('16px')
    })
  })

  describe('generateTokensTS', () => {
    it('includes interface definitions', () => {
      const result = generateTokensTS()
      expect(result).toContain('export interface ColorTokens')
      expect(result).toContain('export interface TypographyTokens')
      expect(result).toContain('export interface SpacingTokens')
    })

    it('includes Theme type', () => {
      const result = generateTokensTS()
      expect(result).toContain('export type Theme')
      expect(result).toContain("'theme-health-sem'")
    })
  })
})



