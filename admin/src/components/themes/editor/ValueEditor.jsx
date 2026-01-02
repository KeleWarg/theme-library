import { useMemo } from 'react'
import ColorPicker from './ColorPicker'
import NumberInput from './NumberInput'
import ShadowEditor from './ShadowEditor'

/**
 * ValueEditor - Router component that selects the correct editor based on token type
 * 
 * Routes to:
 * - ColorPicker for color tokens
 * - NumberInput for dimension/number tokens  
 * - ShadowEditor for shadow tokens
 * - Basic text input for string/unknown tokens
 * 
 * Chunk 3.04 - Type-Specific Editors
 * 
 * @param {Object} props
 * @param {any} props.value - Token value (any format)
 * @param {string} props.tokenType - Token type hint ('color' | 'dimension' | 'number' | 'shadow' | 'string')
 * @param {string} props.category - Token category (used to infer type if not provided)
 * @param {Function} props.onChange - Called when value changes
 * @param {boolean} props.disabled - Whether editing is disabled
 * @param {string} props.name - Token name (used to infer type)
 */
export default function ValueEditor({
  value,
  tokenType,
  category,
  onChange,
  disabled = false,
  name = '',
}) {
  // Determine the effective token type
  const effectiveType = useMemo(() => {
    // Use provided tokenType if valid
    if (tokenType && ['color', 'dimension', 'number', 'shadow', 'string'].includes(tokenType)) {
      return tokenType
    }
    
    // Infer from category
    return inferTokenType(value, category, name)
  }, [tokenType, value, category, name])

  // Render the appropriate editor
  switch (effectiveType) {
    case 'color':
      return (
        <ColorPicker
          value={extractColorValue(value)}
          onChange={(newColor) => onChange?.(buildColorValue(newColor, value))}
          disabled={disabled}
        />
      )

    case 'shadow':
      return (
        <ShadowEditor
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'dimension':
      return (
        <NumberInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          allowedUnits={['px', 'rem', 'em', '%', 'pt', 'vw', 'vh']}
        />
      )

    case 'number':
      return (
        <NumberInput
          value={value}
          onChange={(v) => onChange?.(v.value)}
          disabled={disabled}
          allowedUnits={[]}
        />
      )

    case 'string':
    default:
      return (
        <StringEditor
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )
  }
}

/**
 * Basic string editor for text/unknown values
 */
function StringEditor({ value, onChange, disabled }) {
  const stringValue = typeof value === 'object' 
    ? JSON.stringify(value) 
    : String(value ?? '')

  const handleChange = (e) => {
    const newValue = e.target.value
    // Try to parse as JSON if it looks like an object
    if (newValue.startsWith('{') || newValue.startsWith('[')) {
      try {
        onChange?.(JSON.parse(newValue))
        return
      } catch {
        // Not valid JSON, treat as string
      }
    }
    onChange?.(newValue)
  }

  return (
    <div
      data-testid="string-editor"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <textarea
        value={stringValue}
        onChange={handleChange}
        disabled={disabled}
        data-testid="string-input"
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          fontSize: 'var(--font-size-body-sm, 14px)',
          color: 'var(--color-fg-body, #383C43)',
          background: disabled 
            ? 'var(--color-bg-neutral-light, #ECEFF3)' 
            : 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '8px',
          outline: 'none',
          resize: 'vertical',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-btn-primary-bg, #657E79)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-fg-divider, #D7DCE5)'
        }}
        placeholder="Enter value..."
      />
    </div>
  )
}

/**
 * Infer token type from value, category, and name
 */
function inferTokenType(value, category, name) {
  const categoryLower = (category || '').toLowerCase()
  const nameLower = (name || '').toLowerCase()

  // Check category patterns
  if (/^color/i.test(categoryLower) || /color/i.test(nameLower)) {
    return 'color'
  }

  if (/^(shadow|elevation)/i.test(categoryLower) || /shadow/i.test(nameLower)) {
    return 'shadow'
  }

  if (/^(spacing|space|gap|margin|padding|size|width|height|radius)/i.test(categoryLower)) {
    return 'dimension'
  }

  if (/^(font-size|font-weight|line-height|letter-spacing)/i.test(nameLower)) {
    return 'dimension'
  }

  // Check value type
  if (value !== null && value !== undefined) {
    // Color detection
    if (typeof value === 'string') {
      if (/^#[0-9A-Fa-f]{3,8}$/.test(value) || 
          /^rgba?\(/i.test(value) || 
          /^hsla?\(/i.test(value)) {
        return 'color'
      }
      // Dimension detection (number with unit)
      if (/^-?\d+\.?\d*(px|rem|em|%|pt|vw|vh)$/i.test(value)) {
        return 'dimension'
      }
    }

    if (typeof value === 'object') {
      // Object with hex property = color
      if ('hex' in value) {
        return 'color'
      }
      // Object with shadow properties
      if ('blur' in value || 'offsetX' in value || 'offsetY' in value) {
        return 'shadow'
      }
      // Object with value and unit = dimension
      if ('value' in value && 'unit' in value) {
        return 'dimension'
      }
    }

    if (typeof value === 'number') {
      return 'number'
    }
  }

  return 'string'
}

/**
 * Extract color value from various formats
 */
function extractColorValue(value) {
  if (!value) return '#000000'
  
  if (typeof value === 'string') {
    return value
  }
  
  if (typeof value === 'object') {
    if (value.hex) return value.hex
    if (value.$value) return extractColorValue(value.$value)
  }
  
  return '#000000'
}

/**
 * Build color value preserving original structure
 */
function buildColorValue(newColor, originalValue) {
  if (typeof originalValue === 'object' && originalValue?.hex) {
    return { ...originalValue, hex: newColor }
  }
  return newColor
}

// Export utilities for testing
export { inferTokenType, extractColorValue, buildColorValue }

