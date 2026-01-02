import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TypographyEditorStep, { 
  TYPOGRAPHY_SECTIONS, 
  TYPOGRAPHY_PRESETS, 
  FONT_WEIGHTS, 
  LINE_HEIGHTS 
} from './TypographyEditorStep'

describe('TypographyEditorStep', () => {
  const mockTokens = [
    { name: 'heading', subcategory: 'font-family', value: { fontFamily: 'system-ui' }, css_variable: '--font-family-heading' },
    { name: 'body-md', subcategory: 'font-size', value: { size: '16px' }, css_variable: '--font-size-body-md' },
    { name: 'heading-lg', subcategory: 'font-size', value: { size: '48px' }, css_variable: '--font-size-heading-lg' },
    { name: 'semibold', subcategory: 'font-weight', value: { weight: 600 }, css_variable: '--font-weight-semibold' },
    { name: 'normal', subcategory: 'line-height', value: { lineHeight: 1.5 }, css_variable: '--line-height-normal' },
  ]

  const mockOnChange = vi.fn()
  const mockOnAddToken = vi.fn()
  const mockOnRemoveToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct title and description', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByText('Typography Tokens')).toBeInTheDocument()
    expect(screen.getByText(/Configure typography tokens/)).toBeInTheDocument()
  })

  it('renders all typography sections', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    TYPOGRAPHY_SECTIONS.forEach(section => {
      expect(screen.getByText(section.title)).toBeInTheDocument()
    })
  })

  it('groups tokens by section correctly', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByTestId('typography-token-heading')).toBeInTheDocument()
    expect(screen.getByTestId('typography-token-body-md')).toBeInTheDocument()
    expect(screen.getByTestId('typography-token-semibold')).toBeInTheDocument()
    expect(screen.getByTestId('typography-token-normal')).toBeInTheDocument()
  })

  it('shows preset picker toggle button', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByTestId('preset-picker-toggle')).toBeInTheDocument()
  })

  it('opens preset dropdown when toggled', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const toggleButton = screen.getByTestId('preset-picker-toggle')
    fireEvent.click(toggleButton)

    expect(screen.getByTestId('preset-dropdown')).toBeInTheDocument()
    
    // Check all presets are shown
    Object.values(TYPOGRAPHY_PRESETS).forEach(preset => {
      expect(screen.getByText(preset.name)).toBeInTheDocument()
    })
  })

  it('applies preset when selected with confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    // Open preset dropdown
    fireEvent.click(screen.getByTestId('preset-picker-toggle'))
    
    // Click on a preset
    fireEvent.click(screen.getByTestId('preset-modular-major-third'))

    expect(confirmSpy).toHaveBeenCalled()
    // Should have called onAddToken for each scale value
    expect(mockOnAddToken).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('shows live preview of font sizes', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    expect(screen.getByTestId('typography-preview')).toBeInTheDocument()
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('renders font family input for font-family tokens', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const fontFamilyInput = screen.getByTestId('font-family-input-heading')
    expect(fontFamilyInput).toBeInTheDocument()
    expect(fontFamilyInput.value).toBe('system-ui')
  })

  it('renders font weight select for font-weight tokens', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const weightSelect = screen.getByTestId('font-weight-select-semibold')
    expect(weightSelect).toBeInTheDocument()
    expect(weightSelect.value).toBe('600')
  })

  it('updates token value when changed', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const fontFamilyInput = screen.getByTestId('font-family-input-heading')
    fireEvent.change(fontFamilyInput, { target: { value: 'Arial, sans-serif' } })

    expect(mockOnChange).toHaveBeenCalledWith(0, { value: { fontFamily: 'Arial, sans-serif' } })
  })

  it('shows add token form when Add Token is clicked', () => {
    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const addButton = screen.getByTestId('add-token-font-size')
    fireEvent.click(addButton)

    expect(screen.getByTestId('new-token-name-font-size')).toBeInTheDocument()
  })

  it('calls onRemoveToken when remove button is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <TypographyEditorStep
        tokens={mockTokens}
        onChange={mockOnChange}
        onAddToken={mockOnAddToken}
        onRemoveToken={mockOnRemoveToken}
      />
    )

    const removeButton = screen.getByTestId('remove-token-body-md')
    fireEvent.click(removeButton)

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockOnRemoveToken).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})

describe('Typography exports', () => {
  it('exports TYPOGRAPHY_SECTIONS array', () => {
    expect(Array.isArray(TYPOGRAPHY_SECTIONS)).toBe(true)
    expect(TYPOGRAPHY_SECTIONS.length).toBe(4) // font-family, font-size, font-weight, line-height
  })

  it('exports TYPOGRAPHY_PRESETS object', () => {
    expect(typeof TYPOGRAPHY_PRESETS).toBe('object')
    expect(Object.keys(TYPOGRAPHY_PRESETS).length).toBeGreaterThan(0)
    
    Object.values(TYPOGRAPHY_PRESETS).forEach(preset => {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('description')
      expect(preset).toHaveProperty('scale')
    })
  })

  it('exports FONT_WEIGHTS array', () => {
    expect(Array.isArray(FONT_WEIGHTS)).toBe(true)
    expect(FONT_WEIGHTS.length).toBe(9) // thin through black
    
    FONT_WEIGHTS.forEach(weight => {
      expect(weight).toHaveProperty('name')
      expect(weight).toHaveProperty('value')
      expect(typeof weight.value).toBe('number')
    })
  })

  it('exports LINE_HEIGHTS array', () => {
    expect(Array.isArray(LINE_HEIGHTS)).toBe(true)
    expect(LINE_HEIGHTS.length).toBeGreaterThan(0)
    
    LINE_HEIGHTS.forEach(lineHeight => {
      expect(lineHeight).toHaveProperty('name')
      expect(lineHeight).toHaveProperty('value')
    })
  })
})

