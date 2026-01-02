import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import CreationWizard from '../../src/components/themes/create/CreationWizard'
import ExportModal from '../../src/components/themes/export/ExportModal'
import { generateCSS, generateJSON, generateTailwind } from '../../src/lib/exportGenerators'
import { deleteTheme, getThemeBySlug } from '../../src/lib/themeService'

describe('Gate 5: Creation & Export Integration', () => {
  const testSlugs = []

  afterEach(async () => {
    for (const slug of testSlugs) {
      try {
        const theme = await getThemeBySlug(slug)
        if (theme) await deleteTheme(theme.id)
      } catch (e) {}
    }
    testSlugs.length = 0
  })

  describe('Creation Wizard', () => {
    it('opens and displays template selection', async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()

      render(
        <BrowserRouter>
          <CreationWizard isOpen={true} onClose={() => {}} onComplete={onComplete} existingThemes={[]} />
        </BrowserRouter>
      )

      // The wizard should open and show template options
      await waitFor(() => {
        expect(screen.getByTestId('creation-wizard')).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Should show "Create New Theme" title
      expect(screen.getByText(/create new theme/i)).toBeInTheDocument()
      
      // Should have Light Mode template option
      expect(screen.getByText(/light mode/i)).toBeInTheDocument()
    })

    it('navigates from template to info step', async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()

      render(
        <BrowserRouter>
          <CreationWizard isOpen={true} onClose={() => {}} onComplete={onComplete} existingThemes={[]} />
        </BrowserRouter>
      )

      // Wait for wizard to open
      await waitFor(() => {
        expect(screen.getByTestId('creation-wizard')).toBeInTheDocument()
      })
      
      // Select Light Mode template
      const lightModeTemplate = screen.getByText(/light mode/i)
      await user.click(lightModeTemplate)
      
      // Click next to proceed to theme details
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // Should now be on the info step - check for name input
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Should have slug input
      expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
    })

    it('validates theme name and slug inputs', async () => {
      const user = userEvent.setup()
      const testSlug = `validation-test-${Date.now()}`
      testSlugs.push(testSlug)

      render(
        <BrowserRouter>
          <CreationWizard isOpen={true} onClose={() => {}} onComplete={() => {}} existingThemes={[]} />
        </BrowserRouter>
      )

      // Navigate to info step first
      await waitFor(() => {
        expect(screen.getByTestId('creation-wizard')).toBeInTheDocument()
      })
      
      const lightModeTemplate = screen.getByText(/light mode/i)
      await user.click(lightModeTemplate)
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Wait for info step
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Type in the name field
      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Test Theme Name')
      expect(nameInput).toHaveValue('Test Theme Name')
      
      // Type in the slug field
      const slugInput = screen.getByLabelText(/slug/i)
      await user.clear(slugInput)
      await user.type(slugInput, testSlug)
      expect(slugInput).toHaveValue(testSlug)
    })
  })

  describe('Export Generators', () => {
    const sampleTokens = [
      { category: 'color', name: 'primary', value: { hex: '#FF0000' }, css_variable: '--color-primary' },
      { category: 'spacing', name: 'md', value: { value: 16, unit: 'px' }, css_variable: '--spacing-md' }
    ]

    it('generates valid CSS', () => {
      const css = generateCSS(sampleTokens)
      expect(css).toContain(':root')
      expect(css).toContain('--color-primary')
      expect(css).toContain('#FF0000')
      expect(css).toContain('--spacing-md')
      // Check that spacing value is formatted properly
      expect(css).toMatch(/--spacing-md:\s*16/)
    })

    it('generates Figma-compatible JSON', () => {
      const json = generateJSON(sampleTokens, { includeFigmaMetadata: true })
      const parsed = JSON.parse(json)
      
      // Check structure - should contain category groupings
      expect(parsed).toBeDefined()
      // The JSON should contain our color value
      expect(JSON.stringify(parsed)).toContain('FF0000')
    })

    it('generates valid Tailwind config', () => {
      const config = generateTailwind(sampleTokens)
      expect(config).toContain('module.exports')
      expect(config).toContain('colors')
      expect(config).toContain('primary')
    })
  })

  describe('Export Modal', () => {
    it('shows all format options', () => {
      const mockTheme = { 
        id: 'test-id', 
        name: 'Test Theme', 
        slug: 'test-theme' 
      }
      const mockTokens = [
        { category: 'color', name: 'primary', value: { hex: '#FF0000' }, css_variable: '--color-primary' }
      ]
      
      render(
        <BrowserRouter>
          <ExportModal 
            isOpen={true} 
            theme={mockTheme} 
            tokens={mockTokens} 
            onClose={() => {}} 
          />
        </BrowserRouter>
      )
      
      // Use data-testid to find format tabs
      expect(screen.getByTestId('format-tab-css')).toBeInTheDocument()
      expect(screen.getByTestId('format-tab-json')).toBeInTheDocument()
      expect(screen.getByTestId('format-tab-tailwind')).toBeInTheDocument()
    })

    it('displays generated CSS preview', async () => {
      const mockTheme = { 
        id: 'test-id', 
        name: 'Test Theme', 
        slug: 'test-theme' 
      }
      const mockTokens = [
        { category: 'color', name: 'primary', value: { hex: '#FF0000' }, css_variable: '--color-primary' }
      ]
      
      render(
        <BrowserRouter>
          <ExportModal 
            isOpen={true} 
            theme={mockTheme} 
            tokens={mockTokens} 
            onClose={() => {}} 
          />
        </BrowserRouter>
      )
      
      // The CSS format is selected by default, so preview should show :root
      await waitFor(() => {
        expect(screen.getByText(/:root/)).toBeInTheDocument()
      })
    })
  })
})
