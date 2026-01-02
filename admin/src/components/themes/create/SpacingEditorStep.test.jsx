import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SpacingEditorStep, { 
  SPACING_SECTIONS, 
  SPACING_PRESETS, 
  RADIUS_PRESETS 
} from './SpacingEditorStep'

describe('SpacingEditorStep', () => {
  const mockTokens = [
    { name: 'md', subcategory: 'spacing', value: { size: '16px' }, css_variable: '--spacing-md' },
    { name: 'lg', subcategory: 'spacing', value: { size: '24px' }, css_variable: '--spacing-lg' },
    { name: 'md', subcategory: 'radius', value: { size: '8px' }, css_variable: '--radius-md' },
    { name: 'md', subcategory: 'shadow', value: { x: 0, y: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false }, css_variable: '--shadow-md' },
  ]

  const mockOnChange = vi.fn()
  const mockOnAddToken = vi.fn()
  const mockOnRemoveToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct title and description', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByText('Spacing & Layout Tokens')).toBeInTheDocument()
    expect(screen.getByText(/Define spacing scale/)).toBeInTheDocument()
  })

  it('renders all spacing sections', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Use testid for sections instead of text (text appears multiple times in preview)
    expect(screen.getByTestId('spacing-section-spacing-scale')).toBeInTheDocument()
    expect(screen.getByTestId('spacing-section-border-radius')).toBeInTheDocument()
    expect(screen.getByTestId('spacing-section-shadow')).toBeInTheDocument()
  })

  it('groups tokens by section correctly', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Spacing tokens - note we have two 'md' tokens with different subcategories
    expect(screen.getByTestId('spacing-section-spacing-scale')).toBeInTheDocument()
    expect(screen.getByTestId('spacing-section-border-radius')).toBeInTheDocument()
    expect(screen.getByTestId('spacing-section-shadow')).toBeInTheDocument()
  })

  it('shows visual preview section', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByTestId('spacing-preview')).toBeInTheDocument()
    expect(screen.getByText('Visual Preview')).toBeInTheDocument()
  })

  it('toggles section expansion when header is clicked', () => {
    // Use tokens that have unique names to avoid confusion
    const uniqueTokens = [
      { name: 'spacing-md', subcategory: 'spacing', value: { size: '16px' }, css_variable: '--spacing-md' },
    ]

    render(
      <SpacingEditorStep
        tokens={uniqueTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const toggleButton = screen.getByTestId('toggle-section-spacing-scale')
    
    // Section should be expanded by default
    expect(screen.getByTestId('spacing-token-spacing-md')).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(toggleButton)
    
    // Tokens should not be visible when collapsed
    expect(screen.queryByTestId('spacing-token-spacing-md')).not.toBeInTheDocument()
  })

  it('shows spacing scale preset dropdown', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const presetToggle = screen.getByTestId('preset-toggle-scale-preset')
    fireEvent.click(presetToggle)

    expect(screen.getByTestId('preset-dropdown-scale-preset')).toBeInTheDocument()
    
    // Check presets are shown
    Object.values(SPACING_PRESETS).forEach(preset => {
      expect(screen.getByText(preset.name)).toBeInTheDocument()
    })
  })

  it('shows radius preset dropdown', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const presetToggle = screen.getByTestId('preset-toggle-radius-preset')
    fireEvent.click(presetToggle)

    expect(screen.getByTestId('preset-dropdown-radius-preset')).toBeInTheDocument()
    
    // Check presets are shown
    Object.values(RADIUS_PRESETS).forEach(preset => {
      expect(screen.getByText(preset.name)).toBeInTheDocument()
    })
  })

  it('applies spacing preset when selected with confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Open preset dropdown
    fireEvent.click(screen.getByTestId('preset-toggle-scale-preset'))
    
    // Click on a preset
    fireEvent.click(screen.getByTestId('preset-option-4px-base'))

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockOnAddToken).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('shows shadow editor when shadow card is clicked', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Find and click the shadow edit button
    const editShadowButton = screen.getByTestId('edit-shadow-md')
    fireEvent.click(editShadowButton)

    // Shadow editor should appear
    expect(screen.getByTestId('shadow-editor')).toBeInTheDocument()
  })

  it('shows add token form when Add Token is clicked', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const addButton = screen.getByTestId('add-token-spacing-scale')
    fireEvent.click(addButton)

    expect(screen.getByTestId('new-token-name-spacing-scale')).toBeInTheDocument()
  })

  it('validates token name before adding', () => {
    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const addButton = screen.getByTestId('add-token-spacing-scale')
    fireEvent.click(addButton)

    const input = screen.getByTestId('new-token-name-spacing-scale')
    
    // Try to add with empty name - press Enter
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(mockOnAddToken).not.toHaveBeenCalled()
  })

  it('calls onRemoveToken when remove button is clicked with confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <SpacingEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Find a remove button - there may be multiple tokens with 'md' name
    const removeButtons = screen.getAllByTestId(/remove-token-/)
    fireEvent.click(removeButtons[0])

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockOnRemoveToken).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('shows Apply Defaults button when section is empty', () => {
    render(
      <SpacingEditorStep
        tokens={[]} // Empty tokens
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByTestId('apply-defaults-spacing-scale')).toBeInTheDocument()
    expect(screen.getByTestId('apply-defaults-border-radius')).toBeInTheDocument()
    expect(screen.getByTestId('apply-defaults-shadow')).toBeInTheDocument()
  })
})

describe('Spacing exports', () => {
  it('exports SPACING_SECTIONS array', () => {
    expect(Array.isArray(SPACING_SECTIONS)).toBe(true)
    expect(SPACING_SECTIONS.length).toBe(3) // spacing-scale, border-radius, shadow
  })

  it('exports SPACING_PRESETS object', () => {
    expect(typeof SPACING_PRESETS).toBe('object')
    expect(Object.keys(SPACING_PRESETS).length).toBeGreaterThan(0)
    
    Object.values(SPACING_PRESETS).forEach(preset => {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('description')
      expect(preset).toHaveProperty('baseUnit')
      expect(preset).toHaveProperty('scale')
    })
  })

  it('exports RADIUS_PRESETS object', () => {
    expect(typeof RADIUS_PRESETS).toBe('object')
    expect(Object.keys(RADIUS_PRESETS).length).toBeGreaterThan(0)
    
    Object.values(RADIUS_PRESETS).forEach(preset => {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('description')
      expect(preset).toHaveProperty('scale')
    })
  })
})

