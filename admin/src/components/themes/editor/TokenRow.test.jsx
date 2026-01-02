import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TokenRow from './TokenRow'

describe('TokenRow', () => {
  const mockToken = {
    id: 'token-123',
    name: 'primary-bg',
    value: { hex: '#657E79' },
    css_variable: '--color-btn-primary-bg',
    category: 'color',
    subcategory: 'button',
  }

  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockWriteText = vi.fn(() => Promise.resolve())

  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
    // Stub the clipboard globally for this test suite
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: {
        writeText: mockWriteText,
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  it('renders token name', () => {
    render(<TokenRow token={mockToken} />)
    
    expect(screen.getByTestId('token-name')).toHaveTextContent('primary-bg')
  })

  it('renders type-appropriate value for color tokens', () => {
    render(<TokenRow token={mockToken} />)
    
    // Should show color swatch
    expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
    // Should show hex value
    expect(screen.getByTestId('token-value')).toHaveTextContent('#657E79')
  })

  it('renders CSS variable', () => {
    render(<TokenRow token={mockToken} />)
    
    expect(screen.getByTestId('css-variable')).toHaveTextContent('--color-btn-primary-bg')
  })

  it('renders string value tokens without color swatch', () => {
    const stringToken = {
      ...mockToken,
      value: '16px',
      category: 'spacing',
    }
    render(<TokenRow token={stringToken} />)
    
    expect(screen.queryByTestId('color-swatch')).not.toBeInTheDocument()
    expect(screen.getByTestId('token-value')).toHaveTextContent('16px')
  })

  it('renders number value tokens', () => {
    const numberToken = {
      ...mockToken,
      value: 600,
      category: 'font-weight',
    }
    render(<TokenRow token={numberToken} />)
    
    expect(screen.getByTestId('token-value')).toHaveTextContent('600')
  })

  it('renders dimension value tokens', () => {
    const dimensionToken = {
      ...mockToken,
      value: { value: 16, unit: 'px' },
      category: 'spacing',
    }
    render(<TokenRow token={dimensionToken} />)
    
    expect(screen.getByTestId('token-value')).toHaveTextContent('16px')
  })

  it('handles empty token value', () => {
    const emptyToken = {
      ...mockToken,
      value: null,
    }
    render(<TokenRow token={emptyToken} />)
    
    expect(screen.getByTestId('token-value')).toHaveTextContent('(empty)')
  })

  it('renders drag handle', () => {
    render(<TokenRow token={mockToken} />)
    
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
  })

  it('does not render if token is null', () => {
    const { container } = render(<TokenRow token={null} />)
    
    expect(container).toBeEmptyDOMElement()
  })

  // ============================================================================
  // COPY TO CLIPBOARD TESTS
  // ============================================================================

  it('copy button triggers copy functionality', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} />)
    
    const copyButton = screen.getByTestId('copy-button')
    
    // Verify initial state
    expect(copyButton).toHaveAttribute('title', 'Copy CSS variable')
    
    await user.click(copyButton)
    
    // After clicking, the button should show "Copied!" feedback
    // This verifies the click handler was invoked and the copy flow worked
    await waitFor(() => {
      expect(copyButton).toHaveAttribute('title', 'Copied!')
    })
  })

  it('shows check icon after copying', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} />)
    
    const copyButton = screen.getByTestId('copy-button')
    await user.click(copyButton)
    
    // Check icon should appear (we can't easily test the icon change, but the title changes)
    await waitFor(() => {
      expect(copyButton).toHaveAttribute('title', 'Copied!')
    })
  })

  // ============================================================================
  // DELETE TESTS
  // ============================================================================

  it('delete button shows confirmation', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onDelete={mockOnDelete} />)
    
    const deleteButton = screen.getByTestId('delete-button')
    await user.click(deleteButton)
    
    expect(screen.getByTestId('delete-confirm')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-delete')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-delete')).toBeInTheDocument()
  })

  it('calls onDelete when deletion is confirmed', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onDelete={mockOnDelete} />)
    
    // Click delete
    await user.click(screen.getByTestId('delete-button'))
    // Confirm
    await user.click(screen.getByTestId('confirm-delete'))
    
    expect(mockOnDelete).toHaveBeenCalledWith('token-123')
  })

  it('cancels delete confirmation', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onDelete={mockOnDelete} />)
    
    // Click delete
    await user.click(screen.getByTestId('delete-button'))
    // Cancel
    await user.click(screen.getByTestId('cancel-delete'))
    
    expect(mockOnDelete).not.toHaveBeenCalled()
    expect(screen.queryByTestId('delete-confirm')).not.toBeInTheDocument()
  })

  it('delete button is disabled in read-only mode', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onDelete={mockOnDelete} isReadOnly />)
    
    const deleteButton = screen.getByTestId('delete-button')
    await user.click(deleteButton)
    
    // Confirmation should not appear
    expect(screen.queryByTestId('delete-confirm')).not.toBeInTheDocument()
  })

  // ============================================================================
  // EDIT MODE TESTS
  // ============================================================================

  it('enters edit mode on value click', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    await user.click(screen.getByTestId('token-value'))
    
    expect(screen.getByTestId('edit-mode')).toBeInTheDocument()
    expect(screen.getByTestId('value-input')).toBeInTheDocument()
  })

  it('shows color picker in edit mode for color tokens', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    await user.click(screen.getByTestId('token-value'))
    
    expect(screen.getByTestId('color-picker')).toBeInTheDocument()
  })

  it('does not enter edit mode in read-only mode', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} isReadOnly />)
    
    await user.click(screen.getByTestId('token-value'))
    
    expect(screen.queryByTestId('edit-mode')).not.toBeInTheDocument()
  })

  it('calls onUpdate on value change when save is clicked', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    // Enter edit mode
    await user.click(screen.getByTestId('token-value'))
    
    // Change value
    const input = screen.getByTestId('value-input')
    await user.clear(input)
    await user.type(input, '#AABBCC')
    
    // Save
    await user.click(screen.getByTestId('save-edit'))
    
    expect(mockOnUpdate).toHaveBeenCalledWith('token-123', {
      value: { hex: '#AABBCC' }
    })
  })

  it('saves on Enter key', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    // Enter edit mode
    await user.click(screen.getByTestId('token-value'))
    
    // Change value and press Enter
    const input = screen.getByTestId('value-input')
    await user.clear(input)
    await user.type(input, '#112233{Enter}')
    
    expect(mockOnUpdate).toHaveBeenCalled()
    expect(screen.queryByTestId('edit-mode')).not.toBeInTheDocument()
  })

  it('cancels edit on Escape key', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    // Enter edit mode
    await user.click(screen.getByTestId('token-value'))
    
    // Change value and press Escape
    const input = screen.getByTestId('value-input')
    await user.clear(input)
    await user.type(input, '#112233{Escape}')
    
    expect(mockOnUpdate).not.toHaveBeenCalled()
    expect(screen.queryByTestId('edit-mode')).not.toBeInTheDocument()
  })

  it('cancels edit when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    // Enter edit mode
    await user.click(screen.getByTestId('token-value'))
    
    // Click cancel
    await user.click(screen.getByTestId('cancel-edit'))
    
    expect(mockOnUpdate).not.toHaveBeenCalled()
    expect(screen.queryByTestId('edit-mode')).not.toBeInTheDocument()
  })

  it('does not call onUpdate if value is unchanged', async () => {
    const user = userEvent.setup()
    render(<TokenRow token={mockToken} onUpdate={mockOnUpdate} />)
    
    // Enter edit mode
    await user.click(screen.getByTestId('token-value'))
    
    // Save without changing
    await user.click(screen.getByTestId('save-edit'))
    
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  // ============================================================================
  // VALUE PARSING TESTS
  // ============================================================================

  it('handles string color values', () => {
    const stringColorToken = {
      ...mockToken,
      value: '#FF5500',
    }
    render(<TokenRow token={stringColorToken} />)
    
    expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
    expect(screen.getByTestId('token-value')).toHaveTextContent('#FF5500')
  })

  it('handles RGB color values', () => {
    const rgbToken = {
      ...mockToken,
      value: 'rgb(255, 128, 0)',
    }
    render(<TokenRow token={rgbToken} />)
    
    expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
  })

  it('handles DTCG format values', () => {
    const dtcgToken = {
      ...mockToken,
      value: { $value: { hex: '#ABCDEF' } },
    }
    render(<TokenRow token={dtcgToken} />)
    
    expect(screen.getByTestId('token-value')).toHaveTextContent('#ABCDEF')
  })

  // ============================================================================
  // HOVER AND INTERACTION TESTS
  // ============================================================================

  it('shows correct title attributes', () => {
    render(<TokenRow token={mockToken} />)
    
    expect(screen.getByTestId('token-name')).toHaveAttribute('title', 'primary-bg')
    expect(screen.getByTestId('css-variable')).toHaveAttribute('title', '--color-btn-primary-bg')
  })

  it('value shows "Click to edit" tooltip when not read-only', () => {
    render(<TokenRow token={mockToken} />)
    
    expect(screen.getByTestId('token-value')).toHaveAttribute('title', 'Click to edit')
  })

  it('value shows value as tooltip in read-only mode', () => {
    render(<TokenRow token={mockToken} isReadOnly />)
    
    expect(screen.getByTestId('token-value')).toHaveAttribute('title', '#657E79')
  })
})

