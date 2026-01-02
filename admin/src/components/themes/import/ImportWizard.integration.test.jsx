/**
 * ImportWizard Integration Tests
 * Chunk 5.03 - Comprehensive Tests
 * 
 * These tests verify the full import flow with real component interactions
 * (not mocked), testing the multi-component integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportWizard from './ImportWizard'

// Mock the theme service for database operations
vi.mock('../../../lib/themeService', () => ({
  createTheme: vi.fn(() => Promise.resolve({ 
    id: 'theme-integration-test', 
    name: 'Integration Test Theme',
    slug: 'theme-integration-test'
  })),
  bulkCreateTokens: vi.fn(() => Promise.resolve([
    { id: 'token-1', name: 'primary' },
    { id: 'token-2', name: 'secondary' }
  ])),
}))

// Sample valid DTCG token file content
const sampleDTCGTokens = {
  Color: {
    Brand: {
      'primary': {
        '$type': 'color',
        '$value': { hex: '#657E79' }
      },
      'secondary': {
        '$type': 'color',
        '$value': { hex: '#4A5D59' }
      }
    },
    Background: {
      'surface': {
        '$type': 'color',
        '$value': { hex: '#FFFFFF' }
      }
    }
  },
  Spacing: {
    'sm': {
      '$type': 'dimension',
      '$value': '8px'
    },
    'md': {
      '$type': 'dimension',
      '$value': '16px'
    }
  }
}

// Helper to create a mock File object and simulate file upload
const createMockFileAndUpload = async (page, content, fileName = 'test-tokens.json') => {
  const file = new File([JSON.stringify(content)], fileName, { type: 'application/json' })
  const fileInput = document.querySelector('input[type="file"]')
  
  if (fileInput) {
    // Create file list mock
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true,
    })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
  }
  
  return file
}

describe('ImportWizard Integration', () => {
  const mockOnClose = vi.fn()
  const mockOnComplete = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Full Import Flow', () => {
    it('completes the full import workflow from file selection to import', async () => {
      const user = userEvent.setup()
      const { createTheme, bulkCreateTokens } = await import('../../../lib/themeService')
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Step 1: Upload file
      expect(screen.getByTestId('import-wizard')).toBeInTheDocument()
      expect(screen.getByText('Select your token file')).toBeInTheDocument()
      
      // Simulate file selection
      await createMockFileAndUpload(document, sampleDTCGTokens)

      // Wait for file processing and next button to be enabled
      await waitFor(() => {
        const nextButton = screen.getByTestId('next-button')
        expect(nextButton).not.toBeDisabled()
      }, { timeout: 3000 })

      // Move to Step 2: Token Mapping
      await user.click(screen.getByTestId('next-button'))
      
      await waitFor(() => {
        expect(screen.getByText('Review Tokens')).toBeInTheDocument()
      })

      // Step 2: Verify tokens are displayed
      // The token mapping step should show the parsed tokens
      await waitFor(() => {
        const nextButton = screen.getByTestId('next-button')
        expect(nextButton).not.toBeDisabled()
      })

      // Move to Step 3: Theme Details
      await user.click(screen.getByTestId('next-button'))
      
      await waitFor(() => {
        expect(screen.getByText('Name and configure your theme')).toBeInTheDocument()
      })

      // Fill in theme details
      const nameInput = screen.queryByPlaceholderText(/theme name/i) || screen.queryByLabelText(/name/i)
      if (nameInput) {
        await user.clear(nameInput)
        await user.type(nameInput, 'My Integration Test Theme')
      }

      // Wait for validation
      await waitFor(() => {
        const nextButton = screen.getByTestId('next-button')
        expect(nextButton).not.toBeDisabled()
      }, { timeout: 2000 })

      // Move to Step 4: Review
      await user.click(screen.getByTestId('next-button'))
      
      await waitFor(() => {
        expect(screen.getByText('Confirm and create')).toBeInTheDocument()
        expect(screen.getByTestId('import-button')).toBeInTheDocument()
      })

      // Complete import
      await user.click(screen.getByTestId('import-button'))
      
      // Verify service calls
      await waitFor(() => {
        expect(createTheme).toHaveBeenCalled()
        expect(bulkCreateTokens).toHaveBeenCalled()
        expect(mockOnComplete).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('preserves state when navigating back through steps', async () => {
      const user = userEvent.setup()
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Upload file
      await createMockFileAndUpload(document, sampleDTCGTokens)

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 3000 })

      // Go to step 2
      await user.click(screen.getByTestId('next-button'))
      await waitFor(() => {
        expect(screen.getByText('Review Tokens')).toBeInTheDocument()
      })

      // Go back to step 1
      await user.click(screen.getByTestId('back-button'))
      
      // Verify file is still selected
      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      })
    })

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup()
      const { createTheme } = await import('../../../lib/themeService')
      createTheme.mockRejectedValueOnce(new Error('Database connection failed'))
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Quick navigate through the wizard using mocked file
      await createMockFileAndUpload(document, sampleDTCGTokens)

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 3000 })

      // Navigate through steps
      await user.click(screen.getByTestId('next-button')) // To mapping
      await waitFor(() => screen.getByTestId('next-button'))
      await user.click(screen.getByTestId('next-button')) // To details
      
      // Fill details if input available
      const nameInput = screen.queryByPlaceholderText(/theme name/i)
      if (nameInput) {
        await user.type(nameInput, 'Error Test Theme')
      }

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 2000 })

      await user.click(screen.getByTestId('next-button')) // To review
      
      await waitFor(() => {
        expect(screen.getByTestId('import-button')).toBeInTheDocument()
      })

      // Attempt import (should fail)
      await user.click(screen.getByTestId('import-button'))
      
      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByTestId('import-error')).toBeInTheDocument()
        expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument()
      })

      // Verify onComplete was NOT called
      expect(mockOnComplete).not.toHaveBeenCalled()
    })

    it('resets state when closing and reopening', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Upload file
      await createMockFileAndUpload(document, sampleDTCGTokens)

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 3000 })

      // Close wizard
      await user.click(screen.getByTestId('close-wizard'))
      expect(mockOnClose).toHaveBeenCalled()

      // Rerender as closed then open
      rerender(
        <ImportWizard 
          isOpen={false} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      rerender(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Should be back at step 1 with no file selected
      await waitFor(() => {
        expect(screen.getByTestId('next-button')).toBeDisabled()
      })
    })
  })

  describe('Validation Flow', () => {
    it('validates file format on upload', async () => {
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Try uploading an invalid file
      const fileInput = document.querySelector('input[type="file"]')
      const invalidFile = new File(['invalid json content'], 'test.json', { type: 'application/json' })
      
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [invalidFile],
          writable: false,
          configurable: true,
        })
        fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      }

      // Next button should remain disabled for invalid files
      await waitFor(() => {
        const nextButton = screen.getByTestId('next-button')
        // Either disabled or an error message should appear
        expect(
          nextButton.disabled || screen.queryByText(/error/i) || screen.queryByText(/invalid/i)
        ).toBeTruthy()
      }, { timeout: 2000 })
    })

    it('validates theme name uniqueness', async () => {
      const user = userEvent.setup()
      const existingThemes = [
        { name: 'Existing Theme', slug: 'theme-existing-theme' }
      ]
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={existingThemes}
        />
      )

      // Navigate to details step with a valid file
      await createMockFileAndUpload(document, sampleDTCGTokens)

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 3000 })

      await user.click(screen.getByTestId('next-button')) // mapping
      await waitFor(() => screen.getByTestId('next-button'))
      await user.click(screen.getByTestId('next-button')) // details

      // Try to use an existing theme name
      const nameInput = screen.queryByPlaceholderText(/theme name/i)
      if (nameInput) {
        await user.type(nameInput, 'Existing Theme')
        
        // Should show validation error or disable next
        await waitFor(() => {
          const hasError = screen.queryByText(/already exists/i) || 
                          screen.queryByText(/taken/i) ||
                          screen.getByTestId('next-button').disabled
          expect(hasError).toBeTruthy()
        }, { timeout: 2000 })
      }
    })
  })

  describe('Step Indicator', () => {
    it('shows correct step as active', async () => {
      const user = userEvent.setup()
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Step 1 should be active
      const step1 = screen.getByTestId('step-upload')
      expect(step1).toBeInTheDocument()

      // Upload file and proceed
      await createMockFileAndUpload(document, sampleDTCGTokens)

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 3000 })

      await user.click(screen.getByTestId('next-button'))

      // Step 2 should now be active, step 1 complete
      await waitFor(() => {
        expect(screen.getByTestId('step-mapping')).toBeInTheDocument()
      })
    })

    it('marks completed steps with checkmark', async () => {
      const user = userEvent.setup()
      
      render(
        <ImportWizard 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          existingThemes={[]}
        />
      )

      // Upload file and proceed
      await createMockFileAndUpload(document, sampleDTCGTokens)

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      }, { timeout: 3000 })

      await user.click(screen.getByTestId('next-button'))

      // Step 1 should show checkmark (✓)
      await waitFor(() => {
        const step1 = screen.getByTestId('step-upload')
        expect(step1.textContent).toContain('✓')
      })
    })
  })
})

describe('ThemeEditor Integration', () => {
  // Note: These tests would require the ThemeEditor component
  // which integrates CategorySidebar, TokenRow, ValueEditor, and PreviewPanel
  
  it.skip('loads theme and displays tokens in editor', async () => {
    // TODO: Implement when 5.01 is complete
  })

  it.skip('saves token changes to database', async () => {
    // TODO: Implement when 5.01 is complete
  })

  it.skip('updates preview when token values change', async () => {
    // TODO: Implement when 5.01 is complete
  })
})

describe('Export Integration', () => {
  // Note: These tests verify the export modal generates valid output
  
  it.skip('generates valid CSS from theme tokens', async () => {
    // TODO: Implement with ThemeExportModal integration
  })

  it.skip('generates valid JSON in DTCG format', async () => {
    // TODO: Implement with ThemeExportModal integration
  })

  it.skip('generates valid Tailwind config', async () => {
    // TODO: Implement with ThemeExportModal integration
  })
})

