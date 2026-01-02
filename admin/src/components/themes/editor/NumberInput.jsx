import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, Plus, Minus } from 'lucide-react'

/**
 * NumberInput - Number input with unit selector for dimension tokens
 * 
 * Supports common CSS units: px, rem, em, %, pt, vw, vh
 * Includes increment/decrement buttons and direct input
 * 
 * Chunk 3.04 - Type-Specific Editors
 * 
 * @param {Object} props
 * @param {number|string|Object} props.value - Current value (number, string, or {value, unit})
 * @param {Function} props.onChange - Called with new value object {value, unit}
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.defaultUnit - Default unit if not specified (default: 'px')
 * @param {number} props.min - Minimum value (default: undefined - no min)
 * @param {number} props.max - Maximum value (default: undefined - no max)
 * @param {number} props.step - Step increment (default: 1)
 * @param {string[]} props.allowedUnits - Array of allowed units
 */
export default function NumberInput({
  value,
  onChange,
  disabled = false,
  defaultUnit = 'px',
  min,
  max,
  step = 1,
  allowedUnits = ['px', 'rem', 'em', '%', 'pt', 'vw', 'vh'],
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  // Parse incoming value to extract number and unit
  const parsedValue = useMemo(() => parseValue(value, defaultUnit), [value, defaultUnit])
  
  const [inputValue, setInputValue] = useState(String(parsedValue.value))
  const [unit, setUnit] = useState(parsedValue.unit)

  // Sync with external value changes
  useEffect(() => {
    const parsed = parseValue(value, defaultUnit)
    setInputValue(String(parsed.value))
    setUnit(parsed.unit)
  }, [value, defaultUnit])

  // Clamp value within min/max bounds
  const clampValue = useCallback((val) => {
    let num = parseFloat(val)
    if (isNaN(num)) num = 0
    if (min !== undefined) num = Math.max(min, num)
    if (max !== undefined) num = Math.min(max, num)
    return num
  }, [min, max])

  // Handle direct input change
  const handleInputChange = useCallback((e) => {
    const rawValue = e.target.value
    setInputValue(rawValue)
    
    // Only update parent if valid number
    const num = parseFloat(rawValue)
    if (!isNaN(num)) {
      const clamped = clampValue(num)
      onChange?.({ value: clamped, unit })
    }
  }, [unit, clampValue, onChange])

  // Handle input blur (clean up value)
  const handleBlur = useCallback(() => {
    const num = parseFloat(inputValue)
    if (isNaN(num)) {
      setInputValue('0')
      onChange?.({ value: 0, unit })
    } else {
      const clamped = clampValue(num)
      setInputValue(String(clamped))
      onChange?.({ value: clamped, unit })
    }
  }, [inputValue, unit, clampValue, onChange])

  // Increment value
  const handleIncrement = useCallback(() => {
    if (disabled) return
    const current = parseFloat(inputValue) || 0
    const newValue = clampValue(current + step)
    setInputValue(String(newValue))
    onChange?.({ value: newValue, unit })
  }, [disabled, inputValue, step, unit, clampValue, onChange])

  // Decrement value
  const handleDecrement = useCallback(() => {
    if (disabled) return
    const current = parseFloat(inputValue) || 0
    const newValue = clampValue(current - step)
    setInputValue(String(newValue))
    onChange?.({ value: newValue, unit })
  }, [disabled, inputValue, step, unit, clampValue, onChange])

  // Handle unit change
  const handleUnitChange = useCallback((newUnit) => {
    setUnit(newUnit)
    setShowDropdown(false)
    const num = parseFloat(inputValue) || 0
    onChange?.({ value: clampValue(num), unit: newUnit })
  }, [inputValue, clampValue, onChange])

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
  }, [handleIncrement, handleDecrement])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return
    
    const handleClickOutside = () => setShowDropdown(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  return (
    <div
      data-testid="number-input"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--color-bg-white, #FFFFFF)',
        borderRadius: '8px',
        border: '1px solid var(--color-fg-divider, #D7DCE5)',
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--color-fg-stroke-ui, #7F8B9A)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-fg-divider, #D7DCE5)'
      }}
    >
      {/* Decrement Button */}
      <button
        onClick={handleDecrement}
        disabled={disabled || (min !== undefined && parseFloat(inputValue) <= min)}
        data-testid="decrement-btn"
        title="Decrease value"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          padding: 0,
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          color: 'var(--color-fg-caption, #616A76)',
          border: 'none',
          borderRight: '1px solid var(--color-fg-divider, #D7DCE5)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
        }}
      >
        <Minus size={14} />
      </button>

      {/* Number Input */}
      <input
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        data-testid="number-value"
        style={{
          flex: 1,
          minWidth: '60px',
          padding: '8px 12px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          fontSize: 'var(--font-size-body-sm, 14px)',
          color: 'var(--color-fg-body, #383C43)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          textAlign: 'center',
        }}
        placeholder="0"
      />

      {/* Unit Selector */}
      <div
        style={{
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
          disabled={disabled}
          data-testid="unit-selector"
          title="Select unit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 10px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-body, #383C43)',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
            border: 'none',
            borderLeft: '1px solid var(--color-fg-divider, #D7DCE5)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            minWidth: '60px',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
          }}
        >
          <span>{unit}</span>
          <ChevronDown size={14} style={{ opacity: 0.6 }} />
        </button>

        {/* Unit Dropdown */}
        {showDropdown && (
          <div
            data-testid="unit-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              minWidth: '80px',
              background: 'var(--color-bg-white, #FFFFFF)',
              borderRadius: '8px',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            {allowedUnits.map((u) => (
              <button
                key={u}
                onClick={() => handleUnitChange(u)}
                data-testid={`unit-option-${u}`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: unit === u 
                    ? 'var(--color-btn-primary-bg, #657E79)' 
                    : 'var(--color-fg-body, #383C43)',
                  background: unit === u 
                    ? 'var(--color-bg-neutral-subtle, #F4F5F8)' 
                    : 'transparent',
                  fontWeight: unit === u ? 'var(--font-weight-medium, 500)' : 'normal',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (unit !== u) {
                    e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (unit !== u) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {u}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Increment Button */}
      <button
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && parseFloat(inputValue) >= max)}
        data-testid="increment-btn"
        title="Increase value"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          padding: 0,
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          color: 'var(--color-fg-caption, #616A76)',
          border: 'none',
          borderLeft: '1px solid var(--color-fg-divider, #D7DCE5)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

/**
 * Parse various value formats into { value, unit } object
 */
function parseValue(input, defaultUnit = 'px') {
  // Handle null/undefined
  if (input === null || input === undefined) {
    return { value: 0, unit: defaultUnit }
  }
  
  // Already an object with value and unit
  if (typeof input === 'object' && 'value' in input) {
    return {
      value: parseFloat(input.value) || 0,
      unit: input.unit || defaultUnit
    }
  }
  
  // Number only
  if (typeof input === 'number') {
    return { value: input, unit: defaultUnit }
  }
  
  // String value - try to extract number and unit
  if (typeof input === 'string') {
    const match = input.match(/^(-?\d+\.?\d*)\s*(px|rem|em|%|pt|vw|vh)?$/i)
    if (match) {
      return {
        value: parseFloat(match[1]) || 0,
        unit: match[2]?.toLowerCase() || defaultUnit
      }
    }
    // Try to parse as just a number
    const num = parseFloat(input)
    if (!isNaN(num)) {
      return { value: num, unit: defaultUnit }
    }
  }
  
  return { value: 0, unit: defaultUnit }
}

// Export for testing
export { parseValue }

