import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ValueEditor, { inferTokenType, extractColorValue, buildColorValue } from './ValueEditor'

describe('ValueEditor', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Routing', () => {
    it('routes to ColorPicker for color tokens', () => {
      render(
        <ValueEditor 
          value="#FF0000" 
          tokenType="color" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('routes to NumberInput for dimension tokens', () => {
      render(
        <ValueEditor 
          value={{ value: 16, unit: 'px' }} 
          tokenType="dimension" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('number-input')).toBeInTheDocument()
    })

    it('routes to ShadowEditor for shadow tokens', () => {
      render(
        <ValueEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          tokenType="shadow" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('shadow-editor')).toBeInTheDocument()
    })

    it('routes to StringEditor for string tokens', () => {
      render(
        <ValueEditor 
          value="Some text value" 
          tokenType="string" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('string-editor')).toBeInTheDocument()
    })

    it('routes to StringEditor for unknown token types', () => {
      render(
        <ValueEditor 
          value="unknown value" 
          tokenType="unknown-type" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('string-editor')).toBeInTheDocument()
    })
  })

  describe('Type Inference from Category', () => {
    it('infers color type from color category', () => {
      render(
        <ValueEditor 
          value="#657E79" 
          category="color" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('infers shadow type from shadow category', () => {
      render(
        <ValueEditor 
          value={{ x: 0, y: 4, blur: 8, spread: 0, color: '#000000' }} 
          category="shadow" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('shadow-editor')).toBeInTheDocument()
    })

    it('infers dimension type from spacing category', () => {
      render(
        <ValueEditor 
          value={{ value: 16, unit: 'px' }} 
          category="spacing" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('number-input')).toBeInTheDocument()
    })
  })

  describe('Type Inference from Value', () => {
    it('infers color type from hex string value', () => {
      render(
        <ValueEditor 
          value="#FF5500" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('infers color type from object with hex property', () => {
      render(
        <ValueEditor 
          value={{ hex: '#FF5500' }} 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('infers dimension type from string with unit', () => {
      render(
        <ValueEditor 
          value="16px" 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('number-input')).toBeInTheDocument()
    })

    it('infers shadow type from object with blur property', () => {
      render(
        <ValueEditor 
          value={{ x: 0, y: 4, blur: 8 }} 
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('shadow-editor')).toBeInTheDocument()
    })
  })

  describe('Type Inference from Name', () => {
    it('infers color type from token name containing "color"', () => {
      render(
        <ValueEditor 
          value="#657E79" 
          name="primary-color"
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('infers shadow type from token name containing "shadow"', () => {
      render(
        <ValueEditor 
          value={{ x: 0, y: 4, blur: 8, color: '#000' }} 
          name="card-shadow"
          onChange={mockOnChange} 
        />
      )
      
      expect(screen.getByTestId('shadow-editor')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('passes disabled prop to ColorPicker', () => {
      render(
        <ValueEditor 
          value="#FF0000" 
          tokenType="color" 
          onChange={mockOnChange}
          disabled
        />
      )
      
      const picker = screen.getByTestId('color-picker')
      expect(picker.style.opacity).toBe('0.6')
    })

    it('passes disabled prop to NumberInput', () => {
      render(
        <ValueEditor 
          value={{ value: 16, unit: 'px' }} 
          tokenType="dimension" 
          onChange={mockOnChange}
          disabled
        />
      )
      
      const input = screen.getByTestId('number-value')
      expect(input).toBeDisabled()
    })

    it('passes disabled prop to ShadowEditor', () => {
      render(
        <ValueEditor 
          value={{ x: 0, y: 4, blur: 8, color: '#000' }} 
          tokenType="shadow" 
          onChange={mockOnChange}
          disabled
        />
      )
      
      const editor = screen.getByTestId('shadow-editor')
      expect(editor.style.opacity).toBe('0.6')
    })
  })

  describe('Change Propagation', () => {
    it('propagates color changes to parent', () => {
      render(
        <ValueEditor 
          value="#FF0000" 
          tokenType="color" 
          onChange={mockOnChange} 
        />
      )
      
      // Simulate hex input change
      const hexInput = screen.getByTestId('hex-input')
      fireEvent.change(hexInput, { target: { value: '#00FF00' } })
      
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('preserves color object structure when updating', () => {
      const originalValue = { hex: '#FF0000', alpha: 1 }
      
      render(
        <ValueEditor 
          value={originalValue} 
          tokenType="color" 
          onChange={mockOnChange} 
        />
      )
      
      const hexInput = screen.getByTestId('hex-input')
      fireEvent.change(hexInput, { target: { value: '#00FF00' } })
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ hex: '#00FF00' })
      )
    })
  })
})

// Unit tests for utility functions
describe('inferTokenType', () => {
  it('returns color for hex string value', () => {
    expect(inferTokenType('#FF0000', '', '')).toBe('color')
    expect(inferTokenType('#fff', '', '')).toBe('color')
  })

  it('returns color for rgb/rgba value', () => {
    expect(inferTokenType('rgb(255,0,0)', '', '')).toBe('color')
    expect(inferTokenType('rgba(255,0,0,0.5)', '', '')).toBe('color')
  })

  it('returns color for object with hex property', () => {
    expect(inferTokenType({ hex: '#FF0000' }, '', '')).toBe('color')
  })

  it('returns color for color category', () => {
    expect(inferTokenType('any', 'color', '')).toBe('color')
    expect(inferTokenType('any', 'Color.Primary', '')).toBe('color')
  })

  it('returns shadow for shadow category', () => {
    expect(inferTokenType('any', 'shadow', '')).toBe('shadow')
    expect(inferTokenType('any', 'elevation', '')).toBe('shadow')
  })

  it('returns shadow for object with shadow properties', () => {
    expect(inferTokenType({ blur: 8 }, '', '')).toBe('shadow')
    expect(inferTokenType({ offsetX: 2, offsetY: 4 }, '', '')).toBe('shadow')
  })

  it('returns dimension for spacing/size categories', () => {
    expect(inferTokenType('any', 'spacing', '')).toBe('dimension')
    expect(inferTokenType('any', 'padding', '')).toBe('dimension')
    expect(inferTokenType('any', 'margin', '')).toBe('dimension')
    expect(inferTokenType('any', 'size', '')).toBe('dimension')
  })

  it('returns dimension for string with unit', () => {
    expect(inferTokenType('16px', '', '')).toBe('dimension')
    expect(inferTokenType('1.5rem', '', '')).toBe('dimension')
    expect(inferTokenType('50%', '', '')).toBe('dimension')
  })

  it('returns dimension for object with value and unit', () => {
    expect(inferTokenType({ value: 16, unit: 'px' }, '', '')).toBe('dimension')
  })

  it('returns number for plain number', () => {
    expect(inferTokenType(42, '', '')).toBe('number')
    expect(inferTokenType(1.5, '', '')).toBe('number')
  })

  it('returns string for unrecognized values', () => {
    expect(inferTokenType('some text', '', '')).toBe('string')
    expect(inferTokenType({ foo: 'bar' }, '', '')).toBe('string')
  })
})

describe('extractColorValue', () => {
  it('returns string value as-is', () => {
    expect(extractColorValue('#FF0000')).toBe('#FF0000')
    expect(extractColorValue('rgb(255,0,0)')).toBe('rgb(255,0,0)')
  })

  it('extracts hex from object', () => {
    expect(extractColorValue({ hex: '#FF0000' })).toBe('#FF0000')
  })

  it('extracts nested $value', () => {
    expect(extractColorValue({ $value: '#FF0000' })).toBe('#FF0000')
    expect(extractColorValue({ $value: { hex: '#FF0000' } })).toBe('#FF0000')
  })

  it('returns default for null/undefined', () => {
    expect(extractColorValue(null)).toBe('#000000')
    expect(extractColorValue(undefined)).toBe('#000000')
  })
})

describe('buildColorValue', () => {
  it('returns string for string original', () => {
    expect(buildColorValue('#00FF00', '#FF0000')).toBe('#00FF00')
  })

  it('preserves object structure', () => {
    const original = { hex: '#FF0000', alpha: 1, extra: 'data' }
    const result = buildColorValue('#00FF00', original)
    
    expect(result).toEqual({ hex: '#00FF00', alpha: 1, extra: 'data' })
  })

  it('returns string for non-object original', () => {
    expect(buildColorValue('#00FF00', null)).toBe('#00FF00')
  })
})

