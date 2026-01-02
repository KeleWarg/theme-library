import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ColorEditorStep, { COLOR_SECTIONS } from './ColorEditorStep'

describe('ColorEditorStep', () => {
  const mockTokens = [
    { name: 'primary', subcategory: 'brand', value: { hex: '#657E79' }, css_variable: '--color-brand-primary' },
    { name: 'white', subcategory: 'background', value: { hex: '#FFFFFF' }, css_variable: '--color-bg-white' },
    { name: 'heading', subcategory: 'foreground', value: { hex: '#1E2125' }, css_variable: '--color-fg-heading' },
    { name: 'primary-bg', subcategory: 'button', value: { hex: '#657E79' }, css_variable: '--color-btn-primary-bg' },
    { name: 'success', subcategory: 'feedback', value: { hex: '#0C7663' }, css_variable: '--color-status-success' },
  ]

  const mockOnChange = vi.fn()
  const mockOnAddToken = vi.fn()
  const mockOnRemoveToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct title and description', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByText('Color Tokens')).toBeInTheDocument()
    expect(screen.getByText(/Define your theme's color palette/)).toBeInTheDocument()
  })

  it('renders all color sections', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    COLOR_SECTIONS.forEach(section => {
      expect(screen.getByText(section.title)).toBeInTheDocument()
    })
  })

  it('groups tokens by section correctly', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Check that tokens appear in their sections
    expect(screen.getByTestId('color-token-primary')).toBeInTheDocument()
    expect(screen.getByTestId('color-token-white')).toBeInTheDocument()
    expect(screen.getByTestId('color-token-heading')).toBeInTheDocument()
    expect(screen.getByTestId('color-token-primary-bg')).toBeInTheDocument()
    expect(screen.getByTestId('color-token-success')).toBeInTheDocument()
  })

  it('toggles section expansion when header is clicked', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const toggleButton = screen.getByTestId('toggle-section-brand')
    
    // Section should be expanded by default
    expect(screen.getByTestId('color-token-primary')).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(toggleButton)
    
    // Token should not be visible when collapsed
    expect(screen.queryByTestId('color-token-primary')).not.toBeInTheDocument()
  })

  it('shows add token form when Add Color is clicked', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const addButton = screen.getByTestId('add-token-brand')
    fireEvent.click(addButton)

    expect(screen.getByTestId('new-token-name-brand')).toBeInTheDocument()
  })

  it('validates token name before adding', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const addButton = screen.getByTestId('add-token-brand')
    fireEvent.click(addButton)

    const input = screen.getByTestId('new-token-name-brand')
    const confirmButton = screen.getByTestId('confirm-add-token-brand')

    // Try to add with empty name
    fireEvent.click(confirmButton)
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(mockOnAddToken).not.toHaveBeenCalled()

    // Try with valid name
    fireEvent.change(input, { target: { value: 'accent' } })
    fireEvent.click(confirmButton)
    expect(mockOnAddToken).toHaveBeenCalledWith('color', 'brand', expect.objectContaining({
      name: 'accent',
    }))
  })

  it('prevents duplicate token names', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const addButton = screen.getByTestId('add-token-brand')
    fireEvent.click(addButton)

    const input = screen.getByTestId('new-token-name-brand')
    fireEvent.change(input, { target: { value: 'primary' } }) // Already exists

    const confirmButton = screen.getByTestId('confirm-add-token-brand')
    fireEvent.click(confirmButton)

    expect(screen.getByText(/already exists/)).toBeInTheDocument()
    expect(mockOnAddToken).not.toHaveBeenCalled()
  })

  it('shows Apply Defaults button when section is empty', () => {
    render(
      <ColorEditorStep
        tokens={[]} // Empty tokens
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByTestId('apply-defaults-brand')).toBeInTheDocument()
  })

  it('shows confirmation when removing a token', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const removeButton = screen.getByTestId('remove-token-primary')
    fireEvent.click(removeButton)

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockOnRemoveToken).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('opens color picker when token swatch is clicked', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const editButton = screen.getByTestId('edit-color-primary')
    fireEvent.click(editButton)

    // Color picker should appear
    expect(screen.getByTestId('color-picker')).toBeInTheDocument()
  })

  it('allows editing token name inline', () => {
    render(
      <ColorEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const nameInput = screen.getByTestId('token-name-primary')
    fireEvent.change(nameInput, { target: { value: 'main' } })

    expect(mockOnChange).toHaveBeenCalledWith(0, expect.objectContaining({
      name: 'main',
    }))
  })
})

describe('COLOR_SECTIONS', () => {
  it('exports color sections array', () => {
    expect(Array.isArray(COLOR_SECTIONS)).toBe(true)
    expect(COLOR_SECTIONS.length).toBeGreaterThan(0)
  })

  it('each section has required properties', () => {
    COLOR_SECTIONS.forEach(section => {
      expect(section).toHaveProperty('id')
      expect(section).toHaveProperty('title')
      expect(section).toHaveProperty('description')
      expect(section).toHaveProperty('subcategories')
      expect(section).toHaveProperty('defaultTokens')
      expect(Array.isArray(section.subcategories)).toBe(true)
      expect(Array.isArray(section.defaultTokens)).toBe(true)
    })
  })
})

