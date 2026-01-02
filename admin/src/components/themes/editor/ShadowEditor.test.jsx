import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShadowEditor, { parseShadowValue, parseShadowCssString } from './ShadowEditor'

describe('ShadowEditor', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Rendering', () => {
    it('renders all shadow property inputs', () => {
      render(<ShadowEditor value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} onChange={mockOnChange} />)
      
      expect(screen.getByTestId('shadow-editor')).toBeInTheDocument()
      expect(screen.getByTestId('shadow-preview')).toBeInTheDocument()
      expect(screen.getByTestId('shadow-color-btn')).toBeInTheDocument()
      expect(screen.getByTestId('shadow-inset-toggle')).toBeInTheDocument()
      expect(screen.getByTestId('shadow-css-output')).toBeInTheDocument()
    })

    it('displays correct initial values', () => {
      render(
        <ShadowEditor 
          value={{ x: 2, y: 4, blur: 8, spread: 1, color: '#FF0000' }} 
          onChange={mockOnChange} 
        />
      )
      
      const cssOutput = screen.getByTestId('shadow-css-output')
      expect(cssOutput.textContent).toContain('2px')
      expect(cssOutput.textContent).toContain('4px')
      expect(cssOutput.textContent).toContain('8px')
      expect(cssOutput.textContent).toContain('1px')
      expect(cssOutput.textContent).toContain('#FF0000')
    })

    it('shows shadow preview with correct box-shadow', () => {
      render(
        <ShadowEditor 
          value={{ x: 2, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          onChange={mockOnChange} 
        />
      )
      
      const preview = screen.getByTestId('shadow-preview')
      expect(preview.style.boxShadow).toContain('2px')
    })
  })

  describe('Shadow Properties', () => {
    it('updates composite value when X offset changes', async () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          onChange={mockOnChange} 
        />
      )
      
      // Find the X offset input via the number-input component
      const inputs = screen.getAllByTestId('number-value')
      // First input should be X offset
      await userEvent.clear(inputs[0])
      await userEvent.type(inputs[0], '5')
      
      expect(mockOnChange).toHaveBeenCalled()
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
      expect(lastCall.x).toBe(5)
    })

    it('updates composite value when blur changes', async () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          onChange={mockOnChange} 
        />
      )
      
      // Blur is the 3rd input
      const inputs = screen.getAllByTestId('number-value')
      await userEvent.clear(inputs[2])
      await userEvent.type(inputs[2], '16')
      
      expect(mockOnChange).toHaveBeenCalled()
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
      expect(lastCall.blur).toBe(16)
    })
  })

  describe('Color Selection', () => {
    it('opens color picker on color button click', async () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          onChange={mockOnChange} 
        />
      )
      
      const colorBtn = screen.getByTestId('shadow-color-btn')
      fireEvent.click(colorBtn)
      
      // ColorPicker should now be visible
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('shows current color in swatch', () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#FF5500' }} 
          onChange={mockOnChange} 
        />
      )
      
      const swatch = screen.getByTestId('shadow-color-swatch')
      expect(swatch.style.background).toBe('rgb(255, 85, 0)')
    })
  })

  describe('Inset Toggle', () => {
    it('toggles inset state on click', async () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000', inset: false }} 
          onChange={mockOnChange} 
        />
      )
      
      const toggle = screen.getByTestId('shadow-inset-toggle')
      fireEvent.click(toggle)
      
      expect(mockOnChange).toHaveBeenCalled()
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
      expect(lastCall.inset).toBe(true)
    })

    it('shows "inset" in CSS output when enabled', async () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000', inset: true }} 
          onChange={mockOnChange} 
        />
      )
      
      const cssOutput = screen.getByTestId('shadow-css-output')
      expect(cssOutput.textContent).toContain('inset')
    })

    it('has correct ARIA attributes', () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000', inset: true }} 
          onChange={mockOnChange} 
        />
      )
      
      const toggle = screen.getByTestId('shadow-inset-toggle')
      expect(toggle).toHaveAttribute('role', 'switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('CSS Output', () => {
    it('generates correct CSS string', () => {
      render(
        <ShadowEditor 
          value={{ x: 2, y: 4, blur: 8, spread: 1, color: '#333333' }} 
          onChange={mockOnChange} 
        />
      )
      
      const cssOutput = screen.getByTestId('shadow-css-output')
      expect(cssOutput.textContent).toBe('box-shadow: 2px 4px 8px 1px #333333;')
    })

    it('includes inset keyword when enabled', () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 2, blur: 4, spread: 0, color: '#000000', inset: true }} 
          onChange={mockOnChange} 
        />
      )
      
      const cssOutput = screen.getByTestId('shadow-css-output')
      expect(cssOutput.textContent).toBe('box-shadow: inset 0px 2px 4px 0px #000000;')
    })
  })

  describe('Disabled State', () => {
    it('prevents interaction when disabled', () => {
      render(
        <ShadowEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          onChange={mockOnChange}
          disabled 
        />
      )
      
      const editor = screen.getByTestId('shadow-editor')
      expect(editor.style.opacity).toBe('0.6')
      expect(editor.style.pointerEvents).toBe('none')
    })
  })
})

// Unit tests for shadow parsing utilities
describe('parseShadowValue', () => {
  it('parses object value', () => {
    const result = parseShadowValue({
      x: 2, y: 4, blur: 8, spread: 1, color: '#FF0000'
    })
    
    expect(result.x).toBe(2)
    expect(result.y).toBe(4)
    expect(result.blur).toBe(8)
    expect(result.spread).toBe(1)
    expect(result.color).toBe('#FF0000')
  })

  it('handles alternative property names', () => {
    const result = parseShadowValue({
      offsetX: 2, offsetY: 4, blurRadius: 8, spreadRadius: 1
    })
    
    expect(result.x).toBe(2)
    expect(result.y).toBe(4)
    expect(result.blur).toBe(8)
    expect(result.spread).toBe(1)
  })

  it('returns defaults for null/undefined', () => {
    const result = parseShadowValue(null)
    
    expect(result.x).toBe(0)
    expect(result.y).toBe(4)
    expect(result.blur).toBe(8)
    expect(result.spread).toBe(0)
    expect(result.color).toBe('#00000040')
    expect(result.inset).toBe(false)
  })
})

describe('parseShadowCssString', () => {
  const defaults = {
    x: 0, y: 0, blur: 0, spread: 0, color: '#000000', inset: false,
    xUnit: 'px', yUnit: 'px', blurUnit: 'px', spreadUnit: 'px'
  }

  it('parses basic shadow string', () => {
    const result = parseShadowCssString('2px 4px 8px #333333', defaults)
    
    expect(result.x).toBe(2)
    expect(result.y).toBe(4)
    expect(result.blur).toBe(8)
    expect(result.color).toBe('#333333')
  })

  it('parses shadow with spread', () => {
    const result = parseShadowCssString('0 2px 4px 1px rgba(0,0,0,0.1)', defaults)
    
    expect(result.x).toBe(0)
    expect(result.y).toBe(2)
    expect(result.blur).toBe(4)
    expect(result.spread).toBe(1)
    expect(result.color).toBe('rgba(0,0,0,0.1)')
  })

  it('parses inset shadow', () => {
    const result = parseShadowCssString('inset 0 2px 4px #000', defaults)
    
    expect(result.inset).toBe(true)
    expect(result.y).toBe(2)
    expect(result.blur).toBe(4)
  })

  it('handles hex colors with alpha', () => {
    const result = parseShadowCssString('0 4px 8px #00000040', defaults)
    
    expect(result.color).toBe('#00000040')
  })

  it('handles hsl colors', () => {
    const result = parseShadowCssString('2px 2px 5px hsl(0, 0%, 0%)', defaults)
    
    expect(result.color).toBe('hsl(0, 0%, 0%)')
  })

  it('handles negative offsets', () => {
    const result = parseShadowCssString('-2px -4px 8px #000', defaults)
    
    expect(result.x).toBe(-2)
    expect(result.y).toBe(-4)
  })
})

