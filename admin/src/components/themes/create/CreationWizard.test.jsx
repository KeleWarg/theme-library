import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreationWizard from './CreationWizard'

// Mock the themeService
vi.mock('../../../lib/themeService', () => ({
  getThemes: vi.fn(() => Promise.resolve([
    { id: 'theme-1', name: 'Theme One', slug: 'theme-one' },
  ])),
  getThemeById: vi.fn((id) => Promise.resolve({
    id,
    name: 'Theme One',
    slug: 'theme-one',
    theme_tokens: [
      { category: 'color', subcategory: 'background', name: 'white', value: { hex: '#FFFFFF' }, css_variable: '--color-bg-white' },
    ],
  })),
  createTheme: vi.fn(() => Promise.resolve({
    id: 'new-theme-id',
    name: 'New Theme',
    slug: 'theme-new-theme',
  })),
  bulkCreateTokens: vi.fn(() => Promise.resolve([])),
  generateSlug: vi.fn((name) => `theme-${name.toLowerCase().replace(/\s+/g, '-')}`),
  isSlugAvailable: vi.fn(() => Promise.resolve(true)),
}))

describe('CreationWizard', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onComplete: vi.fn(),
    existingThemes: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<CreationWizard {...defaultProps} />)
    
    expect(screen.getByTestId('creation-wizard')).toBeInTheDocument()
    expect(screen.getByText('Create New Theme')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<CreationWizard {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByTestId('creation-wizard')).not.toBeInTheDocument()
  })

  it('shows step indicator with all 5 steps', () => {
    render(<CreationWizard {...defaultProps} />)
    
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('step-template')).toBeInTheDocument()
    expect(screen.getByTestId('step-info')).toBeInTheDocument()
    expect(screen.getByTestId('step-colors')).toBeInTheDocument()
    expect(screen.getByTestId('step-typography')).toBeInTheDocument()
    expect(screen.getByTestId('step-review')).toBeInTheDocument()
  })

  it('starts on template selection step', () => {
    render(<CreationWizard {...defaultProps} />)
    
    expect(screen.getByTestId('template-selector')).toBeInTheDocument()
    expect(screen.getByText('Choose a starting point')).toBeInTheDocument()
  })

  it('shows all template options on first step', () => {
    render(<CreationWizard {...defaultProps} />)
    
    expect(screen.getByTestId('template-blank')).toBeInTheDocument()
    expect(screen.getByTestId('template-light')).toBeInTheDocument()
    expect(screen.getByTestId('template-dark')).toBeInTheDocument()
    expect(screen.getByTestId('template-duplicate')).toBeInTheDocument()
  })

  it('next button is disabled until template is selected', () => {
    render(<CreationWizard {...defaultProps} />)
    
    const nextButton = screen.getByTestId('next-button')
    expect(nextButton).toBeDisabled()
  })

  it('next button is enabled after selecting template', () => {
    render(<CreationWizard {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('template-light'))
    
    const nextButton = screen.getByTestId('next-button')
    expect(nextButton).not.toBeDisabled()
  })

  it('navigates to info step after selecting template and clicking next', () => {
    render(<CreationWizard {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('template-light'))
    fireEvent.click(screen.getByTestId('next-button'))
    
    // Should be on info step
    expect(screen.getByTestId('theme-details-step')).toBeInTheDocument()
    expect(screen.getByText('Name and configure')).toBeInTheDocument()
  })

  it('back button navigates to previous step', () => {
    render(<CreationWizard {...defaultProps} />)
    
    // Go to step 2
    fireEvent.click(screen.getByTestId('template-light'))
    fireEvent.click(screen.getByTestId('next-button'))
    
    // Go back
    fireEvent.click(screen.getByTestId('back-button'))
    
    // Should be back on template step
    expect(screen.getByTestId('template-selector')).toBeInTheDocument()
  })

  it('back button is hidden on first step', () => {
    render(<CreationWizard {...defaultProps} />)
    
    const backButton = screen.getByTestId('back-button')
    expect(backButton).toHaveStyle({ visibility: 'hidden' })
  })

  it('closes wizard on backdrop click', () => {
    const onClose = vi.fn()
    render(<CreationWizard {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByTestId('creation-wizard'))
    
    expect(onClose).toHaveBeenCalled()
  })

  it('closes wizard on close button click', () => {
    const onClose = vi.fn()
    render(<CreationWizard {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByTestId('close-wizard'))
    
    expect(onClose).toHaveBeenCalled()
  })

  it('closes wizard on escape key', () => {
    const onClose = vi.fn()
    render(<CreationWizard {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(screen.getByTestId('creation-wizard'), { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalled()
  })

  describe('Full wizard flow', () => {
    it('completes full creation flow', async () => {
      const { createTheme, bulkCreateTokens } = await import('../../../lib/themeService')
      const onComplete = vi.fn()
      
      render(<CreationWizard {...defaultProps} onComplete={onComplete} />)
      
      // Step 1: Select template
      fireEvent.click(screen.getByTestId('template-light'))
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 2: Enter theme details
      const nameInput = screen.getByTestId('theme-name-input')
      fireEvent.change(nameInput, { target: { value: 'My New Theme' } })
      
      // Wait for slug to be generated and validated
      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      })
      
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 3: Colors (skip for now)
      await waitFor(() => {
        expect(screen.getByTestId('color-editor-step')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 4: Typography (skip for now)
      await waitFor(() => {
        expect(screen.getByTestId('typography-editor-step')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 5: Review
      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument()
      })
      
      expect(screen.getByText('My New Theme')).toBeInTheDocument()
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
      
      // Create theme
      fireEvent.click(screen.getByTestId('create-button'))
      
      await waitFor(() => {
        expect(createTheme).toHaveBeenCalled()
        expect(bulkCreateTokens).toHaveBeenCalled()
        expect(onComplete).toHaveBeenCalled()
      })
    })

    it('creates blank theme with no tokens', async () => {
      const { createTheme, bulkCreateTokens } = await import('../../../lib/themeService')
      const onComplete = vi.fn()
      
      render(<CreationWizard {...defaultProps} onComplete={onComplete} />)
      
      // Step 1: Select blank template
      fireEvent.click(screen.getByTestId('template-blank'))
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 2: Enter theme details
      const nameInput = screen.getByTestId('theme-name-input')
      fireEvent.change(nameInput, { target: { value: 'Blank Theme' } })
      
      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      })
      
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 3: Colors - should show empty state
      await waitFor(() => {
        expect(screen.getByTestId('color-editor-step')).toBeInTheDocument()
      })
      expect(screen.getByText(/No color tokens defined/i)).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 4: Typography - should show empty state
      await waitFor(() => {
        expect(screen.getByTestId('typography-editor-step')).toBeInTheDocument()
      })
      expect(screen.getByText(/No typography tokens defined/i)).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Step 5: Review - should show 0 tokens
      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument()
      })
      expect(screen.getByText('0')).toBeInTheDocument() // Total tokens
      
      // Create theme
      fireEvent.click(screen.getByTestId('create-button'))
      
      await waitFor(() => {
        expect(createTheme).toHaveBeenCalled()
        // bulkCreateTokens should not be called with empty array
        expect(onComplete).toHaveBeenCalled()
      })
    })
  })

  describe('Token editing', () => {
    it('allows adding tokens on color step', async () => {
      render(<CreationWizard {...defaultProps} />)
      
      // Select blank template and navigate to colors
      fireEvent.click(screen.getByTestId('template-blank'))
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Enter name
      const nameInput = screen.getByTestId('theme-name-input')
      fireEvent.change(nameInput, { target: { value: 'Test' } })
      
      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      })
      
      fireEvent.click(screen.getByTestId('next-button'))
      
      // Should be on colors step
      await waitFor(() => {
        expect(screen.getByTestId('color-editor-step')).toBeInTheDocument()
      })
      
      // Add a token
      fireEvent.click(screen.getByTestId('add-color-token'))
      
      // Token row should appear
      expect(screen.queryByText(/No color tokens/i)).not.toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('shows error message when creation fails', async () => {
      const { createTheme } = await import('../../../lib/themeService')
      createTheme.mockRejectedValueOnce(new Error('Database error'))
      
      render(<CreationWizard {...defaultProps} />)
      
      // Navigate through wizard
      fireEvent.click(screen.getByTestId('template-blank'))
      fireEvent.click(screen.getByTestId('next-button'))
      
      const nameInput = screen.getByTestId('theme-name-input')
      fireEvent.change(nameInput, { target: { value: 'Test' } })
      
      await waitFor(() => {
        expect(screen.getByTestId('next-button')).not.toBeDisabled()
      })
      
      fireEvent.click(screen.getByTestId('next-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('color-editor-step')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('next-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('typography-editor-step')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('next-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument()
      })
      
      // Try to create
      fireEvent.click(screen.getByTestId('create-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('create-error')).toBeInTheDocument()
        expect(screen.getByText(/Database error/i)).toBeInTheDocument()
      })
    })
  })
})

