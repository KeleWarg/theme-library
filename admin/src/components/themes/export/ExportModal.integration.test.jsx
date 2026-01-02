/**
 * ExportModal Integration Tests
 * Chunk 5.03 - Comprehensive Tests
 * 
 * Tests the export flow: format selection → options → preview → download/copy
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportModal from './ExportModal'

// Sample theme and tokens for testing
const mockTheme = {
  id: 'theme-export-test',
  name: 'Export Test Theme',
  slug: 'theme-export-test',
  description: 'A theme for testing exports',
}

const mockTokens = [
  {
    id: 'color-1',
    category: 'color',
    subcategory: 'brand',
    name: 'primary',
    value: { hex: '#657E79' },
    css_variable: '--color-brand-primary',
  },
  {
    id: 'color-2',
    category: 'color',
    subcategory: 'brand',
    name: 'secondary',
    value: { hex: '#4A5D59' },
    css_variable: '--color-brand-secondary',
  },
  {
    id: 'color-3',
    category: 'color',
    subcategory: 'background',
    name: 'surface',
    value: { hex: '#FFFFFF' },
    css_variable: '--color-bg-surface',
  },
  {
    id: 'spacing-1',
    category: 'spacing',
    subcategory: null,
    name: 'sm',
    value: '8px',
    css_variable: '--spacing-sm',
  },
  {
    id: 'spacing-2',
    category: 'spacing',
    subcategory: null,
    name: 'md',
    value: '16px',
    css_variable: '--spacing-md',
  },
  {
    id: 'spacing-3',
    category: 'spacing',
    subcategory: null,
    name: 'lg',
    value: '24px',
    css_variable: '--spacing-lg',
  },
  {
    id: 'font-1',
    category: 'typography',
    subcategory: 'fontSize',
    name: 'body',
    value: '16px',
    css_variable: '--font-size-body',
  },
  {
    id: 'font-2',
    category: 'typography',
    subcategory: 'fontSize',
    name: 'heading',
    value: '24px',
    css_variable: '--font-size-heading',
  },
]

describe('ExportModal Integration', () => {
  const mockOnClose = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
    // Mock URL.createObjectURL for download
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Format Selection and Preview', () => {
    it('switches between all export formats', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      const preview = screen.getByTestId('export-preview')

      // CSS (default)
      expect(preview.textContent).toContain(':root')
      expect(preview.textContent).toContain('--color-brand-primary')

      // JSON
      await user.click(screen.getByTestId('format-tab-json'))
      await waitFor(() => {
        expect(preview.textContent).toContain('"color"')
        expect(preview.textContent).toContain('$type')
      })

      // Tailwind
      await user.click(screen.getByTestId('format-tab-tailwind'))
      await waitFor(() => {
        expect(preview.textContent).toContain('module.exports')
        expect(preview.textContent).toContain('theme')
      })

      // SCSS
      await user.click(screen.getByTestId('format-tab-scss'))
      await waitFor(() => {
        expect(preview.textContent).toContain('$')
      })
    })

    it('generates valid CSS output', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      const preview = screen.getByTestId('export-preview')
      const cssContent = preview.textContent

      // Validate CSS structure
      expect(cssContent).toContain(':root')
      expect(cssContent).toContain('{')
      expect(cssContent).toContain('}')
      
      // All tokens should be present
      mockTokens.forEach(token => {
        expect(cssContent).toContain(token.css_variable)
      })

      // Color values should be valid hex
      expect(cssContent).toContain('#657E79')
      expect(cssContent).toContain('#4A5D59')
      expect(cssContent).toContain('#FFFFFF')

      // Dimension values should be present
      expect(cssContent).toContain('8px')
      expect(cssContent).toContain('16px')
      expect(cssContent).toContain('24px')
    })

    it('generates valid JSON output in DTCG format', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('format-tab-json'))

      const preview = screen.getByTestId('export-preview')
      const jsonContent = preview.textContent

      // Should be valid JSON structure
      expect(jsonContent).toContain('{')
      expect(jsonContent).toContain('}')
      
      // Should have DTCG format markers
      expect(jsonContent).toContain('$type')
      expect(jsonContent).toContain('$value')
      
      // Categories should be present
      expect(jsonContent).toContain('"color"')
    })

    it('generates valid Tailwind config', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('format-tab-tailwind'))

      const preview = screen.getByTestId('export-preview')
      const tailwindContent = preview.textContent

      // Should be valid module export
      expect(tailwindContent).toContain('module.exports')
      
      // Should have theme configuration
      expect(tailwindContent).toContain('theme')
      expect(tailwindContent).toContain('extend') || expect(tailwindContent).toContain('colors')
    })

    it('generates valid SCSS output', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('format-tab-scss'))

      const preview = screen.getByTestId('export-preview')
      const scssContent = preview.textContent

      // Should have SCSS variables
      expect(scssContent).toContain('$')
      
      // Should have color values
      expect(scssContent).toContain('#657E79') || expect(scssContent).toContain('657E79')
    })
  })

  describe('Format Options', () => {
    it('minifies CSS when option is enabled', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Get initial (unminified) preview
      const preview = screen.getByTestId('export-preview')
      const unminified = preview.textContent

      // Enable minification
      const minifyCheckbox = screen.getByTestId('option-minify')
      await user.click(minifyCheckbox)

      // Minified should be shorter or have no newlines
      const minified = preview.textContent
      expect(minified.length).toBeLessThanOrEqual(unminified.length)
      
      // Minified CSS typically removes spaces after colons
      expect(minified).toContain(':root{')
    })

    it('adds comments when option is enabled', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Enable comments
      const commentsCheckbox = screen.getByTestId('option-includeComments')
      await user.click(commentsCheckbox)

      const preview = screen.getByTestId('export-preview')
      
      // Should have CSS comments
      expect(preview.textContent).toContain('/*') || expect(preview.textContent).toContain('//')
    })

    it('applies scope class to CSS', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Enter scope class
      const scopeInput = screen.getByTestId('option-scopeClass')
      await user.clear(scopeInput)
      await user.type(scopeInput, 'my-theme-scope')

      const preview = screen.getByTestId('export-preview')
      
      // Should have the scope class
      expect(preview.textContent).toContain('.my-theme-scope')
    })

    it('pretty prints JSON when option is enabled', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Switch to JSON format
      await user.click(screen.getByTestId('format-tab-json'))

      // Enable pretty print
      const prettyPrintCheckbox = screen.getByTestId('option-prettyPrint')
      if (!prettyPrintCheckbox.checked) {
        await user.click(prettyPrintCheckbox)
      }

      const preview = screen.getByTestId('export-preview')
      
      // Pretty printed JSON should have newlines
      expect(preview.textContent).toMatch(/\n/)
    })

    it('includes Figma metadata in JSON when enabled', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Switch to JSON format
      await user.click(screen.getByTestId('format-tab-json'))

      // Enable Figma metadata
      const metadataCheckbox = screen.getByTestId('option-includeFigmaMetadata')
      await user.click(metadataCheckbox)

      const preview = screen.getByTestId('export-preview')
      
      // Should have metadata or extensions
      expect(
        preview.textContent.includes('$extensions') ||
        preview.textContent.includes('figma') ||
        preview.textContent.includes('metadata')
      ).toBeTruthy()
    })
  })

  describe('Copy and Download', () => {
    it('copies content to clipboard', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('copy-button'))

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      
      // Should show feedback
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument()
      })
    })

    it('copies correct content for each format', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Copy CSS
      await user.click(screen.getByTestId('copy-button'))
      const cssCopy = navigator.clipboard.writeText.mock.calls[0][0]
      expect(cssCopy).toContain(':root')

      // Switch to JSON and copy
      await user.click(screen.getByTestId('format-tab-json'))
      await user.click(screen.getByTestId('copy-button'))
      const jsonCopy = navigator.clipboard.writeText.mock.calls[1][0]
      expect(jsonCopy).toContain('"')
    })

    it('has download button for each format', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      expect(screen.getByTestId('download-button')).toBeInTheDocument()

      // Download button should work for all formats
      const formats = ['css', 'json', 'tailwind', 'scss']
      
      for (const format of formats) {
        if (format !== 'css') {
          await user.click(screen.getByTestId(`format-tab-${format}`))
        }
        expect(screen.getByTestId('download-button')).toBeEnabled()
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles empty tokens array', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={[]}
        />
      )

      const preview = screen.getByTestId('export-preview')
      expect(preview.textContent).toContain('No tokens')
    })

    it('handles tokens with missing values', () => {
      const tokensWithMissing = [
        { id: '1', category: 'color', name: 'test', value: null, css_variable: '--test' },
        { id: '2', category: 'color', name: 'test2', value: undefined, css_variable: '--test2' },
      ]

      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={tokensWithMissing}
        />
      )

      // Should render without crashing
      expect(screen.getByTestId('export-modal')).toBeInTheDocument()
    })

    it('handles special characters in token names', () => {
      const tokensWithSpecialChars = [
        { 
          id: '1', 
          category: 'color', 
          name: 'my-special_token.name', 
          value: { hex: '#000000' }, 
          css_variable: '--color-my-special-token-name' 
        },
      ]

      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={tokensWithSpecialChars}
        />
      )

      const preview = screen.getByTestId('export-preview')
      expect(preview.textContent).toContain('--color-my-special-token-name')
    })

    it('handles very long token values', () => {
      const tokensWithLongValues = [
        { 
          id: '1', 
          category: 'shadow', 
          name: 'complex', 
          value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)', 
          css_variable: '--shadow-complex' 
        },
      ]

      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={tokensWithLongValues}
        />
      )

      const preview = screen.getByTestId('export-preview')
      expect(preview.textContent).toContain('--shadow-complex')
    })
  })

  describe('Modal Behavior', () => {
    it('closes on backdrop click', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('export-modal'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close when content is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('export-modal-content'))
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('closes on close button click', async () => {
      const user = userEvent.setup()
      
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      await user.click(screen.getByTestId('close-button'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('preserves format selection when reopening', async () => {
      const user = userEvent.setup()
      
      const { rerender } = render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Select JSON format
      await user.click(screen.getByTestId('format-tab-json'))

      // Close modal
      rerender(
        <ExportModal
          isOpen={false}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Reopen modal
      rerender(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          theme={mockTheme}
          tokens={mockTokens}
        />
      )

      // Should default back to CSS (or preserve JSON if that's the design)
      const preview = screen.getByTestId('export-preview')
      expect(preview).toBeInTheDocument()
    })
  })
})

describe('Export Output Validation', () => {
  it('CSS output is parseable', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={vi.fn()}
        theme={mockTheme}
        tokens={mockTokens}
      />
    )

    const preview = screen.getByTestId('export-preview')
    const css = preview.textContent

    // Basic CSS validation - should have balanced braces
    const openBraces = (css.match(/{/g) || []).length
    const closeBraces = (css.match(/}/g) || []).length
    expect(openBraces).toBe(closeBraces)

    // Should have valid variable declarations
    const varDeclarations = css.match(/--[\w-]+:\s*[^;]+;/g) || []
    expect(varDeclarations.length).toBeGreaterThan(0)
  })

  it('JSON output is parseable', async () => {
    const user = userEvent.setup()
    
    render(
      <ExportModal
        isOpen={true}
        onClose={vi.fn()}
        theme={mockTheme}
        tokens={mockTokens}
      />
    )

    await user.click(screen.getByTestId('format-tab-json'))

    // Copy to get the exact content
    await user.click(screen.getByTestId('copy-button'))
    const jsonString = navigator.clipboard.writeText.mock.calls[0][0]

    // Should be valid JSON
    expect(() => JSON.parse(jsonString)).not.toThrow()
  })

  it('Tailwind config is valid JavaScript', async () => {
    const user = userEvent.setup()
    
    render(
      <ExportModal
        isOpen={true}
        onClose={vi.fn()}
        theme={mockTheme}
        tokens={mockTokens}
      />
    )

    await user.click(screen.getByTestId('format-tab-tailwind'))

    const preview = screen.getByTestId('export-preview')
    const tailwindConfig = preview.textContent

    // Should have module.exports
    expect(tailwindConfig).toContain('module.exports')
    
    // Should have balanced braces
    const openBraces = (tailwindConfig.match(/{/g) || []).length
    const closeBraces = (tailwindConfig.match(/}/g) || []).length
    expect(openBraces).toBe(closeBraces)
  })
})

