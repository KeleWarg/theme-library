import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NumberInput, { parseValue } from './NumberInput'

describe('NumberInput', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Rendering', () => {
    it('renders with default value', () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} />)
      
      expect(screen.getByTestId('number-input')).toBeInTheDocument()
      expect(screen.getByTestId('number-value')).toBeInTheDocument()
      expect(screen.getByTestId('unit-selector')).toBeInTheDocument()
      expect(screen.getByTestId('increment-btn')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-btn')).toBeInTheDocument()
    })

    it('displays correct initial value', () => {
      render(<NumberInput value={{ value: 24, unit: 'rem' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      expect(input.value).toBe('24')
      expect(screen.getByTestId('unit-selector')).toHaveTextContent('rem')
    })

    it('handles string value with unit', () => {
      render(<NumberInput value="16px" onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      expect(input.value).toBe('16')
    })

    it('handles plain number value', () => {
      render(<NumberInput value={32} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      expect(input.value).toBe('32')
    })
  })

  describe('Direct Input', () => {
    it('updates value on input change', async () => {
      const user = userEvent.setup()
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      await user.clear(input)
      await user.type(input, '20')
      
      expect(mockOnChange).toHaveBeenLastCalledWith({ value: 20, unit: 'px' })
    })

    it('handles decimal values', async () => {
      const user = userEvent.setup()
      render(<NumberInput value={{ value: 1, unit: 'rem' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      await user.clear(input)
      await user.type(input, '1.5')
      
      expect(mockOnChange).toHaveBeenLastCalledWith({ value: 1.5, unit: 'rem' })
    })

    it('handles negative values', async () => {
      const user = userEvent.setup()
      render(<NumberInput value={{ value: 0, unit: 'px' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      await user.clear(input)
      await user.type(input, '-10')
      
      expect(mockOnChange).toHaveBeenLastCalledWith({ value: -10, unit: 'px' })
    })

    it('clamps value on blur when invalid', async () => {
      const user = userEvent.setup()
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      await user.clear(input)
      await user.type(input, 'abc')
      await user.tab() // Trigger blur
      
      // Should reset to 0 for invalid input
      expect(input.value).toBe('0')
    })
  })

  describe('Increment/Decrement', () => {
    it('increments value when clicking + button', async () => {
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} />)
      
      const incrementBtn = screen.getByTestId('increment-btn')
      fireEvent.click(incrementBtn)
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 11, unit: 'px' })
    })

    it('decrements value when clicking - button', async () => {
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} />)
      
      const decrementBtn = screen.getByTestId('decrement-btn')
      fireEvent.click(decrementBtn)
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 9, unit: 'px' })
    })

    it('respects custom step value', async () => {
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} step={5} />)
      
      const incrementBtn = screen.getByTestId('increment-btn')
      fireEvent.click(incrementBtn)
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 15, unit: 'px' })
    })

    it('respects min boundary', async () => {
      render(
        <NumberInput 
          value={{ value: 1, unit: 'px' }} 
          onChange={mockOnChange} 
          min={0}
        />
      )
      
      const decrementBtn = screen.getByTestId('decrement-btn')
      fireEvent.click(decrementBtn)
      
      // Should decrement to 0 (which is the min)
      expect(mockOnChange).toHaveBeenCalledWith({ value: 0, unit: 'px' })
    })

    it('respects max boundary', async () => {
      render(
        <NumberInput 
          value={{ value: 99, unit: 'px' }} 
          onChange={mockOnChange} 
          max={100}
        />
      )
      
      const incrementBtn = screen.getByTestId('increment-btn')
      fireEvent.click(incrementBtn)
      
      // Should increment to 100 (which is the max)
      expect(mockOnChange).toHaveBeenCalledWith({ value: 100, unit: 'px' })
    })

    it('disables decrement at min boundary', () => {
      render(
        <NumberInput 
          value={{ value: 0, unit: 'px' }} 
          onChange={mockOnChange} 
          min={0}
        />
      )
      
      const decrementBtn = screen.getByTestId('decrement-btn')
      expect(decrementBtn).toBeDisabled()
    })

    it('disables increment at max boundary', () => {
      render(
        <NumberInput 
          value={{ value: 100, unit: 'px' }} 
          onChange={mockOnChange} 
          max={100}
        />
      )
      
      const incrementBtn = screen.getByTestId('increment-btn')
      expect(incrementBtn).toBeDisabled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('increments on ArrowUp', async () => {
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 11, unit: 'px' })
    })

    it('decrements on ArrowDown', async () => {
      render(<NumberInput value={{ value: 10, unit: 'px' }} onChange={mockOnChange} />)
      
      const input = screen.getByTestId('number-value')
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 9, unit: 'px' })
    })
  })

  describe('Unit Selection', () => {
    it('opens dropdown on click', async () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} />)
      
      const unitSelector = screen.getByTestId('unit-selector')
      fireEvent.click(unitSelector)
      
      expect(screen.getByTestId('unit-dropdown')).toBeInTheDocument()
    })

    it('shows all allowed units', async () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('unit-selector'))
      
      expect(screen.getByTestId('unit-option-px')).toBeInTheDocument()
      expect(screen.getByTestId('unit-option-rem')).toBeInTheDocument()
      expect(screen.getByTestId('unit-option-em')).toBeInTheDocument()
      expect(screen.getByTestId('unit-option-%')).toBeInTheDocument()
    })

    it('changes unit on selection', async () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('unit-selector'))
      fireEvent.click(screen.getByTestId('unit-option-rem'))
      
      expect(mockOnChange).toHaveBeenCalledWith({ value: 16, unit: 'rem' })
    })

    it('closes dropdown after selection', async () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} />)
      
      fireEvent.click(screen.getByTestId('unit-selector'))
      fireEvent.click(screen.getByTestId('unit-option-rem'))
      
      expect(screen.queryByTestId('unit-dropdown')).not.toBeInTheDocument()
    })

    it('respects custom allowed units', async () => {
      render(
        <NumberInput 
          value={{ value: 16, unit: 'px' }} 
          onChange={mockOnChange}
          allowedUnits={['px', 'rem']}
        />
      )
      
      fireEvent.click(screen.getByTestId('unit-selector'))
      
      expect(screen.getByTestId('unit-option-px')).toBeInTheDocument()
      expect(screen.getByTestId('unit-option-rem')).toBeInTheDocument()
      expect(screen.queryByTestId('unit-option-em')).not.toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('disables all interactions when disabled', () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} disabled />)
      
      const input = screen.getByTestId('number-value')
      const incrementBtn = screen.getByTestId('increment-btn')
      const decrementBtn = screen.getByTestId('decrement-btn')
      
      expect(input).toBeDisabled()
      expect(incrementBtn).toBeDisabled()
      expect(decrementBtn).toBeDisabled()
    })

    it('does not call onChange when disabled', () => {
      render(<NumberInput value={{ value: 16, unit: 'px' }} onChange={mockOnChange} disabled />)
      
      const incrementBtn = screen.getByTestId('increment-btn')
      fireEvent.click(incrementBtn)
      
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })
})

// Unit tests for parseValue utility
describe('parseValue', () => {
  it('parses object with value and unit', () => {
    expect(parseValue({ value: 16, unit: 'px' })).toEqual({ value: 16, unit: 'px' })
  })

  it('parses string with unit', () => {
    expect(parseValue('16px')).toEqual({ value: 16, unit: 'px' })
    expect(parseValue('1.5rem')).toEqual({ value: 1.5, unit: 'rem' })
    expect(parseValue('50%')).toEqual({ value: 50, unit: '%' })
  })

  it('parses plain number', () => {
    expect(parseValue(32, 'rem')).toEqual({ value: 32, unit: 'rem' })
  })

  it('uses default unit for number without unit', () => {
    expect(parseValue('16', 'px')).toEqual({ value: 16, unit: 'px' })
  })

  it('handles null/undefined', () => {
    expect(parseValue(null, 'px')).toEqual({ value: 0, unit: 'px' })
    expect(parseValue(undefined, 'rem')).toEqual({ value: 0, unit: 'rem' })
  })

  it('handles negative values', () => {
    expect(parseValue('-10px')).toEqual({ value: -10, unit: 'px' })
  })

  it('handles decimal values', () => {
    expect(parseValue('0.875rem')).toEqual({ value: 0.875, unit: 'rem' })
  })
})

