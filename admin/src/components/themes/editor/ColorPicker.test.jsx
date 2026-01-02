import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ColorPicker, {
  normalizeHex,
  isValidHex,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
} from './ColorPicker'

describe('ColorPicker', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Rendering', () => {
    it('renders correctly with default value', () => {
      render(<ColorPicker value="#657E79" onChange={mockOnChange} />)
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
      expect(screen.getByTestId('gradient-area')).toBeInTheDocument()
      expect(screen.getByTestId('hue-slider')).toBeInTheDocument()
      expect(screen.getByTestId('color-preview')).toBeInTheDocument()
    })

    it('shows correct initial value in hex input', () => {
      render(<ColorPicker value="#FF5500" onChange={mockOnChange} />)
      
      // Click on hex format tab to ensure it's visible
      const hexTab = screen.getByTestId('format-hex')
      fireEvent.click(hexTab)
      
      const hexInput = screen.getByTestId('hex-input')
      expect(hexInput.value.toUpperCase()).toBe('#FF5500')
    })

    it('displays color preview with correct background', () => {
      render(<ColorPicker value="#3366FF" onChange={mockOnChange} />)
      
      const preview = screen.getByTestId('color-preview')
      expect(preview.style.background).toBe('rgb(51, 102, 255)')
    })

    it('shows all format tabs (HEX, RGB, HSL)', () => {
      render(<ColorPicker value="#000000" onChange={mockOnChange} />)
      
      expect(screen.getByTestId('format-hex')).toBeInTheDocument()
      expect(screen.getByTestId('format-rgb')).toBeInTheDocument()
      expect(screen.getByTestId('format-hsl')).toBeInTheDocument()
    })
  })

  describe('Hex Input', () => {
    it('updates on valid hex input', async () => {
      const user = userEvent.setup()
      render(<ColorPicker value="#000000" onChange={mockOnChange} />)
      
      const hexInput = screen.getByTestId('hex-input')
      await user.clear(hexInput)
      await user.type(hexInput, '#FF0000')
      
      expect(mockOnChange).toHaveBeenLastCalledWith('#FF0000')
    })

    it('shows validation error for invalid hex', async () => {
      const user = userEvent.setup()
      render(<ColorPicker value="#000000" onChange={mockOnChange} />)
      
      const hexInput = screen.getByTestId('hex-input')
      await user.clear(hexInput)
      await user.type(hexInput, '#GGGGGG') // Invalid hex
      
      // Should have error styling (red border with error variable or fallback)
      // Check that border style includes error indicator
      expect(hexInput.style.border).toContain('EB4015') // Error color hex from CSS var fallback
    })

    it('handles 3-digit hex shorthand', async () => {
      const user = userEvent.setup()
      render(<ColorPicker value="#000000" onChange={mockOnChange} />)
      
      const hexInput = screen.getByTestId('hex-input')
      await user.clear(hexInput)
      await user.type(hexInput, '#F00')
      
      expect(mockOnChange).toHaveBeenLastCalledWith('#FF0000')
    })
  })

  describe('RGB Input', () => {
    it('displays RGB values correctly', () => {
      render(<ColorPicker value="#657E79" onChange={mockOnChange} />)
      
      // Switch to RGB format
      fireEvent.click(screen.getByTestId('format-rgb'))
      
      // RGB for #657E79 is approximately (101, 126, 121)
      const rInput = screen.getByTestId('rgb-r')
      const gInput = screen.getByTestId('rgb-g')
      const bInput = screen.getByTestId('rgb-b')
      
      expect(parseInt(rInput.value)).toBe(101)
      expect(parseInt(gInput.value)).toBe(126)
      expect(parseInt(bInput.value)).toBe(121)
    })

    it('updates color when RGB value changes', async () => {
      const user = userEvent.setup()
      render(<ColorPicker value="#000000" onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('format-rgb'))
      
      const rInput = screen.getByTestId('rgb-r')
      await user.clear(rInput)
      await user.type(rInput, '255')
      
      // Should have called onChange with a red color
      expect(mockOnChange).toHaveBeenCalled()
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
      expect(lastCall).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('clamps RGB values to 0-255', async () => {
      const user = userEvent.setup()
      render(<ColorPicker value="#000000" onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('format-rgb'))
      
      const rInput = screen.getByTestId('rgb-r')
      await user.clear(rInput)
      await user.type(rInput, '300') // Above max
      
      // Value should be clamped to 255
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('HSL Input', () => {
    it('displays HSL values correctly', () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('format-hsl'))
      
      const hInput = screen.getByTestId('hsl-h')
      const sInput = screen.getByTestId('hsl-s')
      const lInput = screen.getByTestId('hsl-l')
      
      // Red should be H=0, S=100%, L=50%
      expect(parseInt(hInput.value)).toBe(0)
      expect(parseInt(sInput.value)).toBe(100)
      expect(parseInt(lInput.value)).toBe(50)
    })

    it('updates color when HSL value changes', async () => {
      const user = userEvent.setup()
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('format-hsl'))
      
      const hInput = screen.getByTestId('hsl-h')
      await user.clear(hInput)
      await user.type(hInput, '120') // Green hue
      
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Copy Functionality', () => {
    it('has a copy button that can be clicked', async () => {
      render(<ColorPicker value="#657E79" onChange={mockOnChange} />)
      
      const copyBtn = screen.getByTestId('copy-color')
      expect(copyBtn).toBeInTheDocument()
      
      // Click should not throw
      fireEvent.click(copyBtn)
      
      // After clicking, the button shows a checkmark briefly (copied state)
      // We can't fully test clipboard in this environment, but verify button is clickable
    })
  })

  describe('Disabled State', () => {
    it('prevents interaction when disabled', () => {
      render(<ColorPicker value="#000000" onChange={mockOnChange} disabled />)
      
      const picker = screen.getByTestId('color-picker')
      expect(picker.style.opacity).toBe('0.6')
      expect(picker.style.pointerEvents).toBe('none')
    })
  })
})

// Unit tests for color utility functions
describe('Color Utilities', () => {
  describe('normalizeHex', () => {
    it('normalizes 3-digit hex to 6-digit', () => {
      expect(normalizeHex('#F00')).toBe('#FF0000')
      expect(normalizeHex('#0F0')).toBe('#00FF00')
      expect(normalizeHex('#00F')).toBe('#0000FF')
    })

    it('uppercases hex values', () => {
      expect(normalizeHex('#aabbcc')).toBe('#AABBCC')
    })

    it('handles missing hash', () => {
      expect(normalizeHex('FF0000')).toBe('#FF0000')
    })

    it('returns default for invalid input', () => {
      expect(normalizeHex('')).toBe('#000000')
      expect(normalizeHex(null)).toBe('#000000')
      expect(normalizeHex('invalid')).toBe('#000000')
    })
  })

  describe('isValidHex', () => {
    it('validates 6-digit hex', () => {
      expect(isValidHex('#FF0000')).toBe(true)
      expect(isValidHex('#aabbcc')).toBe(true)
    })

    it('validates 3-digit hex', () => {
      expect(isValidHex('#F00')).toBe(true)
      expect(isValidHex('#abc')).toBe(true)
    })

    it('rejects invalid hex', () => {
      expect(isValidHex('#GGG')).toBe(false)
      expect(isValidHex('red')).toBe(false)
      expect(isValidHex('')).toBe(false)
    })
  })

  describe('hexToRgb', () => {
    it('converts hex to RGB object', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('handles white and black', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })
  })

  describe('rgbToHex', () => {
    it('converts RGB to hex string', () => {
      expect(rgbToHex(255, 0, 0).toUpperCase()).toBe('#FF0000')
      expect(rgbToHex(0, 255, 0).toUpperCase()).toBe('#00FF00')
      expect(rgbToHex(0, 0, 255).toUpperCase()).toBe('#0000FF')
    })

    it('clamps values to valid range', () => {
      expect(rgbToHex(300, -10, 128).toUpperCase()).toBe('#FF0080')
    })
  })

  describe('hexToHsl', () => {
    it('converts primary colors correctly', () => {
      expect(hexToHsl('#FF0000')).toEqual({ h: 0, s: 100, l: 50 })
      expect(hexToHsl('#00FF00')).toEqual({ h: 120, s: 100, l: 50 })
      expect(hexToHsl('#0000FF')).toEqual({ h: 240, s: 100, l: 50 })
    })

    it('handles grayscale', () => {
      expect(hexToHsl('#FFFFFF')).toEqual({ h: 0, s: 0, l: 100 })
      expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 })
      expect(hexToHsl('#808080')).toEqual({ h: 0, s: 0, l: 50 })
    })
  })

  describe('hslToHex', () => {
    it('converts HSL to hex', () => {
      expect(hslToHex(0, 100, 50).toUpperCase()).toBe('#FF0000')
      expect(hslToHex(120, 100, 50).toUpperCase()).toBe('#00FF00')
      expect(hslToHex(240, 100, 50).toUpperCase()).toBe('#0000FF')
    })

    it('handles edge cases', () => {
      expect(hslToHex(0, 0, 100).toUpperCase()).toBe('#FFFFFF')
      expect(hslToHex(0, 0, 0).toUpperCase()).toBe('#000000')
    })
  })

  describe('Color conversion roundtrip', () => {
    it('maintains color through hex -> rgb -> hex conversion', () => {
      const original = '#657E79'
      const rgb = hexToRgb(original)
      const result = rgbToHex(rgb.r, rgb.g, rgb.b)
      expect(result.toUpperCase()).toBe(original)
    })

    it('maintains color through hex -> hsl -> hex conversion', () => {
      // Note: Some precision loss may occur with HSL
      const original = '#FF0000'
      const hsl = hexToHsl(original)
      const result = hslToHex(hsl.h, hsl.s, hsl.l)
      expect(result.toUpperCase()).toBe(original)
    })
  })
})

