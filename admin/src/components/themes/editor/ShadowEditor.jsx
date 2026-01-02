import { useState, useEffect, useCallback, useMemo } from 'react'
import { Layers } from 'lucide-react'
import ColorPicker from './ColorPicker'
import NumberInput from './NumberInput'

/**
 * ShadowEditor - Editor for box-shadow/drop-shadow composite values
 * 
 * Handles shadow properties: X offset, Y offset, blur, spread, color
 * Supports inset shadows and multiple shadow layers
 * 
 * Chunk 3.04 - Type-Specific Editors
 * 
 * @param {Object} props
 * @param {Object|string} props.value - Shadow value object or CSS string
 * @param {Function} props.onChange - Called with updated shadow object
 * @param {boolean} props.disabled - Whether the editor is disabled
 */
export default function ShadowEditor({
  value,
  onChange,
  disabled = false,
}) {
  // Parse incoming value to shadow properties
  const parsedShadow = useMemo(() => parseShadowValue(value), [value])
  
  const [shadow, setShadow] = useState(parsedShadow)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Sync with external value changes
  useEffect(() => {
    setShadow(parseShadowValue(value))
  }, [value])

  // Update a single shadow property
  const handlePropertyChange = useCallback((property, newValue) => {
    const updated = { ...shadow, [property]: newValue }
    setShadow(updated)
    onChange?.(updated)
  }, [shadow, onChange])

  // Handle number input changes (returns { value, unit } object)
  const handleDimensionChange = useCallback((property, dimValue) => {
    const updated = { 
      ...shadow, 
      [property]: dimValue.value,
      [`${property}Unit`]: dimValue.unit
    }
    setShadow(updated)
    onChange?.(updated)
  }, [shadow, onChange])

  // Toggle inset
  const handleToggleInset = useCallback(() => {
    const updated = { ...shadow, inset: !shadow.inset }
    setShadow(updated)
    onChange?.(updated)
  }, [shadow, onChange])

  // Generate CSS preview string
  const cssPreview = useMemo(() => {
    const parts = []
    if (shadow.inset) parts.push('inset')
    parts.push(`${shadow.x}${shadow.xUnit || 'px'}`)
    parts.push(`${shadow.y}${shadow.yUnit || 'px'}`)
    parts.push(`${shadow.blur}${shadow.blurUnit || 'px'}`)
    parts.push(`${shadow.spread}${shadow.spreadUnit || 'px'}`)
    parts.push(shadow.color)
    return parts.join(' ')
  }, [shadow])

  return (
    <div
      data-testid="shadow-editor"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        background: 'var(--color-bg-white, #FFFFFF)',
        borderRadius: '8px',
        border: '1px solid var(--color-fg-divider, #D7DCE5)',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Header with Preview */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          <Layers size={18} />
          <span
            style={{
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
            }}
          >
            Box Shadow
          </span>
        </div>
        
        {/* Preview Box */}
        <div
          data-testid="shadow-preview"
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--color-bg-white, #FFFFFF)',
            borderRadius: '6px',
            boxShadow: cssPreview,
            marginLeft: 'auto',
          }}
        />
      </div>

      {/* Property Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {/* X Offset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontSize: 'var(--font-size-body-xs, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-caption, #616A76)',
              textTransform: 'uppercase',
            }}
          >
            X Offset
          </label>
          <NumberInput
            value={{ value: shadow.x, unit: shadow.xUnit || 'px' }}
            onChange={(v) => handleDimensionChange('x', v)}
            disabled={disabled}
            step={1}
            data-testid="shadow-x"
          />
        </div>

        {/* Y Offset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontSize: 'var(--font-size-body-xs, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-caption, #616A76)',
              textTransform: 'uppercase',
            }}
          >
            Y Offset
          </label>
          <NumberInput
            value={{ value: shadow.y, unit: shadow.yUnit || 'px' }}
            onChange={(v) => handleDimensionChange('y', v)}
            disabled={disabled}
            step={1}
            data-testid="shadow-y"
          />
        </div>

        {/* Blur Radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontSize: 'var(--font-size-body-xs, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-caption, #616A76)',
              textTransform: 'uppercase',
            }}
          >
            Blur
          </label>
          <NumberInput
            value={{ value: shadow.blur, unit: shadow.blurUnit || 'px' }}
            onChange={(v) => handleDimensionChange('blur', v)}
            disabled={disabled}
            min={0}
            step={1}
            data-testid="shadow-blur"
          />
        </div>

        {/* Spread Radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontSize: 'var(--font-size-body-xs, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-caption, #616A76)',
              textTransform: 'uppercase',
            }}
          >
            Spread
          </label>
          <NumberInput
            value={{ value: shadow.spread, unit: shadow.spreadUnit || 'px' }}
            onChange={(v) => handleDimensionChange('spread', v)}
            disabled={disabled}
            step={1}
            data-testid="shadow-spread"
          />
        </div>
      </div>

      {/* Color Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          style={{
            fontSize: 'var(--font-size-body-xs, 12px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
          }}
        >
          Color
        </label>
        <div
          style={{
            position: 'relative',
          }}
        >
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            data-testid="shadow-color-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 12px',
              background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-fg-stroke-ui, #7F8B9A)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-fg-divider, #D7DCE5)'
            }}
          >
            <div
              data-testid="shadow-color-swatch"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: shadow.color,
                border: '1px solid var(--color-fg-divider, #D7DCE5)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-body, #383C43)',
              }}
            >
              {shadow.color}
            </span>
          </button>
          
          {/* Color Picker Popover */}
          {showColorPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                zIndex: 100,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ColorPicker
                value={shadow.color}
                onChange={(color) => handlePropertyChange('color', color)}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </div>

      {/* Inset Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <button
          onClick={handleToggleInset}
          data-testid="shadow-inset-toggle"
          role="switch"
          aria-checked={shadow.inset}
          style={{
            position: 'relative',
            width: '44px',
            height: '24px',
            padding: 0,
            background: shadow.inset 
              ? 'var(--color-btn-primary-bg, #657E79)' 
              : 'var(--color-bg-neutral-light, #ECEFF3)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: shadow.inset ? '22px' : '2px',
              width: '20px',
              height: '20px',
              background: 'var(--color-bg-white, #FFFFFF)',
              borderRadius: '50%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              transition: 'left 0.2s ease',
            }}
          />
        </button>
        <span
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-body, #383C43)',
          }}
        >
          Inset shadow
        </span>
      </div>

      {/* CSS Output Preview */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <label
          style={{
            fontSize: 'var(--font-size-body-xs, 12px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-caption, #616A76)',
            textTransform: 'uppercase',
          }}
        >
          CSS Output
        </label>
        <code
          data-testid="shadow-css-output"
          style={{
            padding: '10px 12px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            fontSize: 'var(--font-size-body-xs, 12px)',
            color: 'var(--color-fg-body, #383C43)',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
            borderRadius: '6px',
            wordBreak: 'break-all',
          }}
        >
          box-shadow: {cssPreview};
        </code>
      </div>
    </div>
  )
}

/**
 * Parse various shadow value formats into a normalized object
 */
function parseShadowValue(value) {
  const defaults = {
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: '#00000040',
    inset: false,
    xUnit: 'px',
    yUnit: 'px',
    blurUnit: 'px',
    spreadUnit: 'px',
  }

  if (!value) return defaults

  // Already an object
  if (typeof value === 'object') {
    return {
      x: value.x ?? value.offsetX ?? defaults.x,
      y: value.y ?? value.offsetY ?? defaults.y,
      blur: value.blur ?? value.blurRadius ?? defaults.blur,
      spread: value.spread ?? value.spreadRadius ?? defaults.spread,
      color: value.color ?? defaults.color,
      inset: value.inset ?? defaults.inset,
      xUnit: value.xUnit ?? 'px',
      yUnit: value.yUnit ?? 'px',
      blurUnit: value.blurUnit ?? 'px',
      spreadUnit: value.spreadUnit ?? 'px',
    }
  }

  // Try to parse CSS string
  if (typeof value === 'string') {
    return parseShadowCssString(value, defaults)
  }

  return defaults
}

/**
 * Parse CSS box-shadow string format
 * Examples:
 * - "0 4px 8px rgba(0,0,0,0.1)"
 * - "inset 0 2px 4px 0 #000000"
 * - "2px 2px 5px 1px #333"
 */
function parseShadowCssString(cssString, defaults) {
  const result = { ...defaults }
  let str = cssString.trim()

  // Check for inset
  if (str.toLowerCase().startsWith('inset')) {
    result.inset = true
    str = str.substring(5).trim()
  }

  // Try to extract color (hex, rgb, rgba, hsl)
  const colorPatterns = [
    /#[0-9A-Fa-f]{3,8}/,
    /rgba?\([^)]+\)/,
    /hsla?\([^)]+\)/,
  ]

  for (const pattern of colorPatterns) {
    const match = str.match(pattern)
    if (match) {
      result.color = match[0]
      str = str.replace(match[0], '').trim()
      break
    }
  }

  // Parse remaining dimension values
  const dimPattern = /(-?\d+\.?\d*)(px|rem|em|%)?/g
  const dims = []
  let match
  while ((match = dimPattern.exec(str)) !== null) {
    dims.push({
      value: parseFloat(match[1]),
      unit: match[2] || 'px'
    })
  }

  // Assign dimensions: x, y, blur, spread
  if (dims[0]) {
    result.x = dims[0].value
    result.xUnit = dims[0].unit
  }
  if (dims[1]) {
    result.y = dims[1].value
    result.yUnit = dims[1].unit
  }
  if (dims[2]) {
    result.blur = dims[2].value
    result.blurUnit = dims[2].unit
  }
  if (dims[3]) {
    result.spread = dims[3].value
    result.spreadUnit = dims[3].unit
  }

  return result
}

// Export for testing
export { parseShadowValue, parseShadowCssString }

