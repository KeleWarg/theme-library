import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportWizard from './ImportWizard'

// Mock child components to simplify testing
vi.mock('./FileUploadStep', () => ({
  default: ({ onFileSelect, selectedFile, onClear }) => (
    <div data-testid="file-upload-step-mock">
      <button 
        data-testid="mock-select-file"
        onClick={() => onFileSelect({
          name: 'test.json',
          size: 1234,
          validation: {
            parseResult: {
              tokens: [
                { category: 'color', name: 'primary', path: 'Color/primary', value: '#000' }
              ]
            }
          }
        })}
      >
        Select File
      </button>
      {selectedFile && <span data-testid="file-selected">File selected</span>}
      {selectedFile && <button data-testid="mock-clear" onClick={onClear}>Clear</button>}
    </div>
  )
}))

vi.mock('./TokenMappingStep', () => ({
  default: ({ tokens, onUpdateMapping }) => (
    <div data-testid="token-mapping-step-mock">
      <span>{tokens.length} tokens</span>
      <button 
        data-testid="mock-update-tokens"
        onClick={() => onUpdateMapping(tokens.map(t => ({ ...t, category: 'updated' })))}
      >
        Update Mapping
      </button>
    </div>
  )
}))

vi.mock('./ThemeDetailsStep', () => ({
  default: ({ details, onUpdate }) => (
    <div data-testid="theme-details-step-mock">
      <button 
        data-testid="mock-fill-details"
        onClick={() => onUpdate({
          name: 'Test Theme',
          slug: 'theme-test',
          description: 'Test description',
          isValid: true
        })}
      >
        Fill Details
      </button>
    </div>
  )
}))

vi.mock('./ImportReviewStep', () => ({
  default: ({ fileData, tokens, themeDetails }) => (
    <div data-testid="import-review-step-mock">
      <span>Review: {themeDetails.name}</span>
    </div>
  )
}))

// Mock theme service
vi.mock('../../../lib/themeService', () => ({
  createTheme: vi.fn(() => Promise.resolve({ id: 'theme-123', name: 'Test Theme' })),
  bulkCreateTokens: vi.fn(() => Promise.resolve([])),
}))

describe('ImportWizard', () => {
  const mockOnClose = vi.fn()
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(
      <ImportWizard 
        isOpen={false} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    expect(screen.queryByTestId('import-wizard')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    expect(screen.getByTestId('import-wizard')).toBeInTheDocument()
  })

  it('renders the first step (upload) initially', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    expect(screen.getByTestId('file-upload-step-mock')).toBeInTheDocument()
  })

  it('shows step indicator', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('step-upload')).toBeInTheDocument()
    expect(screen.getByTestId('step-mapping')).toBeInTheDocument()
    expect(screen.getByTestId('step-details')).toBeInTheDocument()
    expect(screen.getByTestId('step-review')).toBeInTheDocument()
  })

  it('disables next button when step is invalid', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    const nextButton = screen.getByTestId('next-button')
    expect(nextButton).toBeDisabled()
  })

  it('enables next button after file selection', async () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Select a file
    fireEvent.click(screen.getByTestId('mock-select-file'))
    
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button')
      expect(nextButton).not.toBeDisabled()
    })
  })

  it('navigates to next step on Next click', async () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Select file and go next
    fireEvent.click(screen.getByTestId('mock-select-file'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('token-mapping-step-mock')).toBeInTheDocument()
    })
  })

  it('hides back button on first step', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    const backButton = screen.getByTestId('back-button')
    expect(backButton).toHaveStyle({ visibility: 'hidden' })
  })

  it('shows back button on subsequent steps', async () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Navigate to step 2
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    await waitFor(() => {
      const backButton = screen.getByTestId('back-button')
      expect(backButton).toHaveStyle({ visibility: 'visible' })
    })
  })

  it('navigates back on Back click', async () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Navigate to step 2
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    // Go back
    await waitFor(() => fireEvent.click(screen.getByTestId('back-button')))
    
    await waitFor(() => {
      expect(screen.getByTestId('file-upload-step-mock')).toBeInTheDocument()
    })
  })

  it('preserves file data when navigating back', async () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Select file and navigate forward
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    // Navigate back
    await waitFor(() => fireEvent.click(screen.getByTestId('back-button')))
    
    await waitFor(() => {
      expect(screen.getByTestId('file-selected')).toBeInTheDocument()
    })
  })

  it('shows import button on final step', async () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Navigate through all steps
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    fireEvent.click(screen.getByTestId('mock-fill-details'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    await waitFor(() => {
      expect(screen.getByTestId('import-button')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button clicked', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    fireEvent.click(screen.getByTestId('close-wizard'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop clicked', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    fireEvent.click(screen.getByTestId('import-wizard'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key', () => {
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    fireEvent.keyDown(screen.getByTestId('import-wizard'), { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state during import', async () => {
    const { createTheme } = await import('../../../lib/themeService')
    createTheme.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Navigate to final step
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    fireEvent.click(screen.getByTestId('mock-fill-details'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    // Click import
    await waitFor(() => fireEvent.click(screen.getByTestId('import-button')))
    
    expect(screen.getByText('Importing...')).toBeInTheDocument()
  })

  it('calls onComplete on successful import', async () => {
    const { createTheme, bulkCreateTokens } = await import('../../../lib/themeService')
    createTheme.mockResolvedValue({ id: 'theme-123', name: 'Test Theme' })
    bulkCreateTokens.mockResolvedValue([])
    
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Navigate to final step
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    fireEvent.click(screen.getByTestId('mock-fill-details'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    // Click import
    await waitFor(() => fireEvent.click(screen.getByTestId('import-button')))
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({ id: 'theme-123', name: 'Test Theme' })
    })
  })

  it('shows error on API failure', async () => {
    const { createTheme } = await import('../../../lib/themeService')
    createTheme.mockRejectedValue(new Error('Database error'))
    
    render(
      <ImportWizard 
        isOpen={true} 
        onClose={mockOnClose} 
        onComplete={mockOnComplete}
      />
    )
    
    // Navigate to final step
    fireEvent.click(screen.getByTestId('mock-select-file'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    fireEvent.click(screen.getByTestId('mock-fill-details'))
    await waitFor(() => fireEvent.click(screen.getByTestId('next-button')))
    
    // Click import
    await waitFor(() => fireEvent.click(screen.getByTestId('import-button')))
    
    await waitFor(() => {
      expect(screen.getByTestId('import-error')).toBeInTheDocument()
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })
})

