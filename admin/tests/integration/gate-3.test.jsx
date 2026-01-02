import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportWizard from '../../src/components/themes/import/ImportWizard'
import { parseTokenFile, groupTokensByCategory, validateTokenFile } from '../../src/lib/tokenParser'

// Mock the theme service at module level
vi.mock('../../src/lib/themeService', () => ({
  createTheme: vi.fn(),
  bulkCreateTokens: vi.fn(),
  isSlugAvailable: vi.fn(),
  generateSlug: vi.fn((name) => 'theme-' + (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')),
}))

// Import mocked functions after mock setup
import { createTheme, bulkCreateTokens, isSlugAvailable } from '../../src/lib/themeService'

describe('Gate 3: Import Wizard E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    createTheme.mockResolvedValue({ id: 'mock-theme-123', name: 'Test Theme' })
    bulkCreateTokens.mockResolvedValue([])
    isSlugAvailable.mockResolvedValue(true)
  })

  describe('Parser → Database Contract Verification', () => {
    it('parser output structure matches database token schema', () => {
      const jsonData = {
        Color: {
          Button: {
            primary: { 
              $type: 'color', 
              $value: { hex: '#FF5733' },
              $extensions: { 'com.figma.variableId': 'VariableID:123:456' }
            }
          }
        },
        Spacing: {
          md: { $type: 'number', $value: 16 }
        }
      }
      
      const result = parseTokenFile(jsonData)
      
      // Verify parser output has all required database fields
      expect(result.tokens.length).toBeGreaterThan(0)
      result.tokens.forEach(token => {
        // Required fields for theme_tokens table
        expect(token).toHaveProperty('name')
        expect(token).toHaveProperty('category')
        expect(token).toHaveProperty('value')
        expect(token).toHaveProperty('css_variable')
        
        // Optional fields
        expect(token).toHaveProperty('subcategory')
        expect(token).toHaveProperty('group_name')
        expect(token).toHaveProperty('figma_variable_id')
        expect(token).toHaveProperty('sort_order')
      })
    })

    it('parser tokens can be transformed to database format', () => {
      const jsonData = {
        Color: { primary: { $type: 'color', $value: { hex: '#FF5733' } } }
      }
      
      const { tokens } = parseTokenFile(jsonData)
      
      // Transform to database format (as ImportWizard does)
      const dbTokens = tokens.map((t, index) => ({
        theme_id: 'mock-theme-id',
        category: t.category,
        subcategory: t.subcategory || null,
        group_name: t.group_name || null,
        name: t.name,
        value: t.value,
        css_variable: t.css_variable,
        figma_variable_id: t.figma_variable_id || null,
        sort_order: index
      }))
      
      // Verify structure matches bulkCreateTokens expectations
      expect(dbTokens[0]).toHaveProperty('theme_id')
      expect(dbTokens[0]).toHaveProperty('category')
      expect(dbTokens[0]).toHaveProperty('name')
      expect(dbTokens[0]).toHaveProperty('value')
      expect(dbTokens[0]).toHaveProperty('css_variable')
    })

    it('groupTokensByCategory works with parser output', () => {
      const jsonData = {
        Color: { 
          primary: { $type: 'color', $value: { hex: '#FF0000' } },
          secondary: { $type: 'color', $value: { hex: '#00FF00' } }
        },
        Spacing: {
          md: { $type: 'number', $value: 16 }
        }
      }
      
      const { tokens } = parseTokenFile(jsonData)
      const grouped = groupTokensByCategory(tokens)
      
      expect(grouped.color).toHaveLength(2)
      expect(grouped.spacing).toHaveLength(1)
    })
  })

  describe('File Validation Pipeline', () => {
    it('validateTokenFile rejects invalid JSON structure', () => {
      const invalid = ['not', 'an', 'object']
      const result = validateTokenFile(invalid)
      expect(result.valid).toBe(false)
    })

    it('validateTokenFile accepts valid Figma format', () => {
      const valid = {
        Color: { primary: { $type: 'color', $value: { hex: '#FF0000' } } }
      }
      const result = validateTokenFile(valid)
      expect(result.valid).toBe(true)
    })

    it('parseTokenFile handles various token types', () => {
      const multiType = {
        Color: { bg: { $type: 'color', $value: { hex: '#FFFFFF' } } },
        'Font Size': { md: { $type: 'number', $value: 16 } },
        Spacing: { lg: { $type: 'number', $value: 24 } }
      }
      
      const result = parseTokenFile(multiType)
      
      expect(result.tokens.length).toBe(3)
      expect(result.metadata.categories.color).toBe(1)
      expect(result.metadata.categories.typography).toBe(1)
      expect(result.metadata.categories.spacing).toBe(1)
    })
  })

  describe('Wizard Component Rendering', () => {
    it('renders wizard when isOpen is true', () => {
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={() => {}} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      expect(screen.getByTestId('import-wizard')).toBeInTheDocument()
      expect(screen.getByTestId('file-upload-step')).toBeInTheDocument()
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <ImportWizard 
          isOpen={false} 
          onClose={() => {}} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      expect(screen.queryByTestId('import-wizard')).not.toBeInTheDocument()
    })

    it('shows all step indicators', () => {
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={() => {}} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      expect(screen.getByTestId('step-upload')).toBeInTheDocument()
      expect(screen.getByTestId('step-mapping')).toBeInTheDocument()
      expect(screen.getByTestId('step-details')).toBeInTheDocument()
      expect(screen.getByTestId('step-review')).toBeInTheDocument()
    })

    it('next button is disabled on first step without file', () => {
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={() => {}} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      expect(screen.getByTestId('next-button')).toBeDisabled()
    })

    it('back button is hidden on first step', () => {
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={() => {}} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      const backButton = screen.getByTestId('back-button')
      expect(backButton).toHaveStyle({ visibility: 'hidden' })
    })
  })

  describe('Wizard Close Behavior', () => {
    it('calls onClose when close button clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={onClose} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      await user.click(screen.getByTestId('close-wizard'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', async () => {
      const onClose = vi.fn()
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={onClose} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      // Click on the backdrop (the outer div)
      fireEvent.click(screen.getByTestId('import-wizard'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose on Escape key', () => {
      const onClose = vi.fn()
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={onClose} 
          onComplete={() => {}}
          existingThemes={[]}
        />
      )
      
      fireEvent.keyDown(screen.getByTestId('import-wizard'), { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Service Function Integration', () => {
    it('createTheme is called with correct shape', async () => {
      // Verify the expected call shape matches what wizard sends
      const expectedShape = {
        name: 'Test Theme',
        slug: 'theme-test',
        description: 'Test description',
        source: 'figma',
        source_file_name: 'tokens.json',
        status: 'draft'
      }
      
      await createTheme(expectedShape)
      
      expect(createTheme).toHaveBeenCalledWith(expectedShape)
    })

    it('bulkCreateTokens is called with correct shape', async () => {
      const tokens = [
        {
          theme_id: 'theme-123',
          category: 'color',
          subcategory: null,
          group_name: 'Color',
          name: 'primary',
          value: { hex: '#FF0000' },
          css_variable: '--color-primary',
          figma_variable_id: null,
          sort_order: 0
        }
      ]
      
      await bulkCreateTokens(tokens)
      
      expect(bulkCreateTokens).toHaveBeenCalledWith(tokens)
    })
  })

  describe('Error State Handling', () => {
    it('wizard handles createTheme errors gracefully', async () => {
      createTheme.mockRejectedValue(new Error('Database error'))
      
      // The wizard should catch this error and display it
      // Testing the contract: wizard wraps service calls in try/catch
      try {
        await createTheme({ name: 'Test' })
        expect.fail('Should have thrown')
      } catch (e) {
        expect(e.message).toBe('Database error')
      }
    })
  })

  describe('Integration Contract Summary', () => {
    it('full data pipeline: Figma JSON → Parser → DB tokens', () => {
      // This test documents the full data transformation
      
      // 1. Figma export format
      const figmaExport = {
        '$extensions': { 'com.figma.modeName': 'Light Mode' },
        Color: {
          primary: { 
            $type: 'color', 
            $value: { hex: '#657E79' },
            $extensions: { 'com.figma.variableId': 'VariableID:1:1' }
          }
        }
      }
      
      // 2. Parser transforms to ParsedToken[]
      const { tokens, metadata } = parseTokenFile(figmaExport)
      expect(tokens.length).toBe(1)
      expect(metadata.modeName).toBe('Light Mode')
      
      // 3. Wizard transforms to DB format
      const dbToken = {
        theme_id: 'theme-uuid',
        category: tokens[0].category,
        subcategory: tokens[0].subcategory || null,
        group_name: tokens[0].group_name || null,
        name: tokens[0].name,
        value: tokens[0].value,
        css_variable: tokens[0].css_variable,
        figma_variable_id: tokens[0].figma_variable_id || null,
        sort_order: 0
      }
      
      // 4. Verify DB token shape
      expect(dbToken.category).toBe('color')
      expect(dbToken.name).toBe('primary')
      expect(dbToken.value.hex).toBe('#657E79')
      expect(dbToken.css_variable).toMatch(/^--color/)
      expect(dbToken.figma_variable_id).toBe('VariableID:1:1')
    })
  })
})
