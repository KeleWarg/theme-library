/**
 * ThemeExportModal Tests
 * Chunk 4.03 - Export Modal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ThemeExportModal from './ThemeExportModal'

// Sample test data
const mockTheme = {
  id: '123',
  name: 'Test Theme',
  slug: 'test-theme',
}

const mockTokens = [
  {
    id: '1',
    category: 'color',
    name: 'primary',
    value: { hex: '#657E79' },
    css_variable: '--color-primary',
  },
  {
    id: '2',
    category: 'spacing',
    name: 'sm',
    value: '8px',
    css_variable: '--spacing-sm',
  },
]

describe('ThemeExportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    theme: mockTheme,
    tokens: mockTokens,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders nothing when isOpen is false', () => {
    render(<ThemeExportModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument()
  })

  it('renders modal when isOpen is true', () => {
    render(<ThemeExportModal {...defaultProps} />)
    expect(screen.getByTestId('export-modal')).toBeInTheDocument()
    expect(screen.getByText('Export Theme')).toBeInTheDocument()
  })

  it('displays theme name and token count', () => {
    render(<ThemeExportModal {...defaultProps} />)
    expect(screen.getByText(/Test Theme/)).toBeInTheDocument()
    expect(screen.getByText(/2 tokens/)).toBeInTheDocument()
  })

  it('shows format selector tabs', () => {
    render(<ThemeExportModal {...defaultProps} />)
    expect(screen.getByTestId('format-tab-css')).toBeInTheDocument()
    expect(screen.getByTestId('format-tab-json')).toBeInTheDocument()
    expect(screen.getByTestId('format-tab-tailwind')).toBeInTheDocument()
    expect(screen.getByTestId('format-tab-scss')).toBeInTheDocument()
  })

  it('shows CSS format by default', () => {
    render(<ThemeExportModal {...defaultProps} />)
    const preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain(':root')
    expect(preview.textContent).toContain('--color-primary')
  })

  it('switches format when tabs are clicked', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    // Click JSON tab
    fireEvent.click(screen.getByTestId('format-tab-json'))
    const preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain('"color"')
    expect(preview.textContent).toContain('$type')
  })

  it('shows format-specific options for CSS', () => {
    render(<ThemeExportModal {...defaultProps} />)
    expect(screen.getByTestId('option-minify')).toBeInTheDocument()
    expect(screen.getByTestId('option-includeComments')).toBeInTheDocument()
    expect(screen.getByTestId('option-scopeClass')).toBeInTheDocument()
  })

  it('shows format-specific options for JSON', () => {
    render(<ThemeExportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('format-tab-json'))
    
    expect(screen.getByTestId('option-prettyPrint')).toBeInTheDocument()
    expect(screen.getByTestId('option-includeFigmaMetadata')).toBeInTheDocument()
  })

  it('shows format-specific options for Tailwind', () => {
    render(<ThemeExportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('format-tab-tailwind'))
    
    expect(screen.getByTestId('option-version')).toBeInTheDocument()
  })

  it('shows format-specific options for SCSS', () => {
    render(<ThemeExportModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('format-tab-scss'))
    
    expect(screen.getByTestId('option-useMap')).toBeInTheDocument()
    expect(screen.getByTestId('option-includeComments')).toBeInTheDocument()
  })

  it('updates preview when options change', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    // Check the minify checkbox
    const minifyCheckbox = screen.getByTestId('option-minify')
    fireEvent.click(minifyCheckbox)
    
    const preview = screen.getByTestId('export-preview')
    // Minified output should not have newlines in the CSS block
    expect(preview.textContent).toContain(':root{')
  })

  it('updates preview when scope class is entered', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    const scopeInput = screen.getByTestId('option-scopeClass')
    fireEvent.change(scopeInput, { target: { value: 'my-theme' } })
    
    const preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain('.my-theme')
  })

  it('calls onClose when close button is clicked', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('close-button'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('export-modal'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when modal content is clicked', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('export-modal-content'))
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('copies content to clipboard when copy button is clicked', async () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('copy-button'))
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('shows copied feedback after copying', async () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('copy-button'))
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('has download button', () => {
    render(<ThemeExportModal {...defaultProps} />)
    expect(screen.getByTestId('download-button')).toBeInTheDocument()
  })

  it('handles empty tokens array', () => {
    render(<ThemeExportModal {...defaultProps} tokens={[]} />)
    
    const preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain('No tokens')
  })

  it('handles missing theme gracefully', () => {
    render(<ThemeExportModal {...defaultProps} theme={null} />)
    expect(screen.getByText('Export Theme')).toBeInTheDocument()
  })
})

describe('ThemeExportModal format switching', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    theme: mockTheme,
    tokens: mockTokens,
  }

  it('resets options when format changes', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    // Modify CSS options
    const minifyCheckbox = screen.getByTestId('option-minify')
    fireEvent.click(minifyCheckbox)
    expect(minifyCheckbox).toBeChecked()
    
    // Switch to JSON
    fireEvent.click(screen.getByTestId('format-tab-json'))
    
    // Switch back to CSS - options should be reset
    fireEvent.click(screen.getByTestId('format-tab-css'))
    const newMinifyCheckbox = screen.getByTestId('option-minify')
    expect(newMinifyCheckbox).not.toBeChecked()
  })

  it('generates different output for each format', () => {
    render(<ThemeExportModal {...defaultProps} />)
    
    // CSS
    let preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain(':root')
    
    // JSON
    fireEvent.click(screen.getByTestId('format-tab-json'))
    preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain('"color"')
    
    // Tailwind
    fireEvent.click(screen.getByTestId('format-tab-tailwind'))
    preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain('module.exports')
    
    // SCSS
    fireEvent.click(screen.getByTestId('format-tab-scss'))
    preview = screen.getByTestId('export-preview')
    expect(preview.textContent).toContain('$color-primary')
  })
})

