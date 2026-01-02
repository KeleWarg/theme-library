import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * ColorPicker - Advanced color picker component for design token editing
 * 
 * UI Structure:
 * ┌────────────────────────────┐
 * │  ████████████████████████  │ ← Gradient area (saturation/brightness)
 * ├────────────────────────────┤
 * │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Hue slider
 * ├────────────────────────────┤
 * │  HEX  │ #657E79            │
 * │  RGB  │ 101, 126, 121      │
 * │  HSL  │ 168°, 11%, 45%     │
 * └────────────────────────────┘
 * 
 * Chunk 3.04 - Type-Specific Editors
 * 
 * @param {Object} props
 * @param {string} props.value - Current color value (hex format)
 * @param {Function} props.onChange - Called when color changes
 * @param {boolean} props.disabled - Whether the picker is disabled
 * @param {string} props.format - Initial format to display ('hex' | 'rgb' | 'hsl')
 */
export default function ColorPicker({ 
  value = '#000000', 
  onChange, 
  disabled = false,
  format: initialFormat = 'hex'
}) {
  const [activeFormat, setActiveFormat] = useState(initialFormat)
  const [hexInput, setHexInput] = useState(normalizeHex(value))
  const [rgbInput, setRgbInput] = useState(() => hexToRgb(value))
  const [hslInput, setHslInput] = useState(() => hexToHsl(value))
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [hue, setHue] = useState(() => hexToHsl(value).h)
  
  const gradientRef = useRef(null)
  const hueRef = useRef(null)
  const isDraggingGradient = useRef(false)
  const isDraggingHue = useRef(false)

  // Normalize incoming value
  const normalizedValue = useMemo(() => normalizeHex(value), [value])

  // Sync internal state when external value changes
  useEffect(() => {
    const hex = normalizeHex(value)
    setHexInput(hex)
    setRgbInput(hexToRgb(hex))
    const hslValue = hexToHsl(hex)
    setHslInput(hslValue)
    setHue(hslValue.h)
    setIsValid(true)
  }, [value])

  // Calculate saturation and lightness position from current color
  const gradientPosition = useMemo(() => {
    const hsl = hexToHsl(normalizedValue)
    // Convert HSL to position in saturation-brightness gradient
    // x = saturation, y = 1 - lightness (inverted because top is brighter)
    return {
      x: hsl.s / 100,
      y: 1 - (hsl.l / 100)
    }
  }, [normalizedValue])

  // Handle hex input change
  const handleHexChange = useCallback((e) => {
    const input = e.target.value
    setHexInput(input)
    
    // Validate and update
    if (isValidHex(input)) {
      const normalized = normalizeHex(input)
      setIsValid(true)
      setRgbInput(hexToRgb(normalized))
      const hslValue = hexToHsl(normalized)
      setHslInput(hslValue)
      setHue(hslValue.h)
      onChange?.(normalized)
    } else {
      setIsValid(false)
    }
  }, [onChange])

  // Handle RGB input changes
  const handleRgbChange = useCallback((channel, inputValue) => {
    const num = parseInt(inputValue, 10)
    const clampedValue = isNaN(num) ? 0 : Math.max(0, Math.min(255, num))
    
    const newRgb = { ...rgbInput, [channel]: clampedValue }
    setRgbInput(newRgb)
    
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHexInput(hex)
    const hslValue = hexToHsl(hex)
    setHslInput(hslValue)
    setHue(hslValue.h)
    setIsValid(true)
    onChange?.(hex)
  }, [rgbInput, onChange])

  // Handle HSL input changes
  const handleHslChange = useCallback((channel, inputValue) => {
    const num = parseInt(inputValue, 10)
    let clampedValue
    if (channel === 'h') {
      clampedValue = isNaN(num) ? 0 : Math.max(0, Math.min(360, num))
    } else {
      clampedValue = isNaN(num) ? 0 : Math.max(0, Math.min(100, num))
    }
    
    const newHsl = { ...hslInput, [channel]: clampedValue }
    setHslInput(newHsl)
    
    if (channel === 'h') setHue(clampedValue)
    
    const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l)
    setHexInput(hex)
    setRgbInput(hexToRgb(hex))
    setIsValid(true)
    onChange?.(hex)
  }, [hslInput, onChange])

  // Handle gradient area interaction
  const handleGradientInteraction = useCallback((e) => {
    if (disabled || !gradientRef.current) return
    
    const rect = gradientRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    // Convert position to saturation and lightness
    const saturation = Math.round(x * 100)
    const lightness = Math.round((1 - y) * 100)
    
    const hex = hslToHex(hue, saturation, lightness)
    setHexInput(hex)
    setRgbInput(hexToRgb(hex))
    setHslInput({ h: hue, s: saturation, l: lightness })
    setIsValid(true)
    onChange?.(hex)
  }, [disabled, hue, onChange])

  // Handle hue slider interaction
  const handleHueInteraction = useCallback((e) => {
    if (disabled || !hueRef.current) return
    
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newHue = Math.round(x * 360)
    
    setHue(newHue)
    const hex = hslToHex(newHue, hslInput.s, hslInput.l)
    setHexInput(hex)
    setRgbInput(hexToRgb(hex))
    setHslInput({ ...hslInput, h: newHue })
    setIsValid(true)
    onChange?.(hex)
  }, [disabled, hslInput, onChange])

  // Mouse event handlers for gradient
  const handleGradientMouseDown = useCallback((e) => {
    isDraggingGradient.current = true
    handleGradientInteraction(e)
  }, [handleGradientInteraction])

  // Mouse event handlers for hue
  const handleHueMouseDown = useCallback((e) => {
    isDraggingHue.current = true
    handleHueInteraction(e)
  }, [handleHueInteraction])

  // Global mouse handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingGradient.current) {
        handleGradientInteraction(e)
      } else if (isDraggingHue.current) {
        handleHueInteraction(e)
      }
    }
    
    const handleMouseUp = () => {
      isDraggingGradient.current = false
      isDraggingHue.current = false
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleGradientInteraction, handleHueInteraction])

  // Copy current value to clipboard
  const handleCopy = useCallback(async () => {
    try {
      let textToCopy = hexInput
      if (activeFormat === 'rgb') {
        textToCopy = `rgb(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b})`
      } else if (activeFormat === 'hsl') {
        textToCopy = `hsl(${hslInput.h}, ${hslInput.s}%, ${hslInput.l}%)`
      }
      
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [activeFormat, hexInput, rgbInput, hslInput])

  return (
    <div
      data-testid="color-picker"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: 'var(--color-bg-white, #FFFFFF)',
        borderRadius: '8px',
        border: '1px solid var(--color-fg-divider, #D7DCE5)',
        width: '280px',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Saturation/Lightness Gradient Area */}
      <div
        ref={gradientRef}
        data-testid="gradient-area"
        onMouseDown={handleGradientMouseDown}
        style={{
          position: 'relative',
          width: '100%',
          height: '150px',
          borderRadius: '6px',
          cursor: 'crosshair',
          background: `
            linear-gradient(to top, #000000, transparent),
            linear-gradient(to right, #ffffff, hsl(${hue}, 100%, 50%))
          `,
          overflow: 'hidden',
        }}
      >
        {/* Color Picker Indicator */}
        <div
          data-testid="gradient-indicator"
          style={{
            position: 'absolute',
            left: `calc(${gradientPosition.x * 100}% - 8px)`,
            top: `calc(${gradientPosition.y * 100}% - 8px)`,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Hue Slider */}
      <div
        ref={hueRef}
        data-testid="hue-slider"
        onMouseDown={handleHueMouseDown}
        style={{
          position: 'relative',
          width: '100%',
          height: '16px',
          borderRadius: '8px',
          cursor: 'pointer',
          background: `linear-gradient(to right,
            hsl(0, 100%, 50%),
            hsl(60, 100%, 50%),
            hsl(120, 100%, 50%),
            hsl(180, 100%, 50%),
            hsl(240, 100%, 50%),
            hsl(300, 100%, 50%),
            hsl(360, 100%, 50%)
          )`,
        }}
      >
        {/* Hue Indicator */}
        <div
          data-testid="hue-indicator"
          style={{
            position: 'absolute',
            left: `calc(${(hue / 360) * 100}% - 6px)`,
            top: '-2px',
            width: '12px',
            height: '20px',
            borderRadius: '3px',
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.2)',
            background: `hsl(${hue}, 100%, 50%)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Color Preview and Copy */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          data-testid="color-preview"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            background: normalizedValue,
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}
        />
        <button
          onClick={handleCopy}
          data-testid="copy-color"
          title={copied ? 'Copied!' : 'Copy color value'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            padding: 0,
            background: copied ? 'var(--color-fg-feedback-success, #0C7663)' : 'var(--color-bg-neutral-subtle, #F4F5F8)',
            color: copied ? 'var(--color-bg-white, #FFFFFF)' : 'var(--color-fg-caption, #616A76)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginLeft: 'auto',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {/* Format Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          padding: '4px',
          borderRadius: '6px',
        }}
      >
        {['hex', 'rgb', 'hsl'].map((fmt) => (
          <button
            key={fmt}
            onClick={() => setActiveFormat(fmt)}
            data-testid={`format-${fmt}`}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: 'var(--font-size-body-xs, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              textTransform: 'uppercase',
              background: activeFormat === fmt 
                ? 'var(--color-bg-white, #FFFFFF)' 
                : 'transparent',
              color: activeFormat === fmt 
                ? 'var(--color-fg-heading, #1E2125)' 
                : 'var(--color-fg-caption, #616A76)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeFormat === fmt 
                ? '0 1px 2px rgba(0,0,0,0.05)' 
                : 'none',
            }}
          >
            {fmt}
          </button>
        ))}
      </div>

      {/* Value Inputs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {activeFormat === 'hex' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              style={{
                width: '40px',
                fontSize: 'var(--font-size-body-xs, 12px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-caption, #616A76)',
                textTransform: 'uppercase',
              }}
            >
              HEX
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              data-testid="hex-input"
              style={{
                flex: 1,
                padding: '8px 10px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-body, #383C43)',
                background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                border: `1px solid ${isValid ? 'var(--color-fg-divider, #D7DCE5)' : 'var(--color-fg-feedback-error, #EB4015)'}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              placeholder="#000000"
            />
          </div>
        )}

        {activeFormat === 'rgb' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              style={{
                width: '40px',
                fontSize: 'var(--font-size-body-xs, 12px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-caption, #616A76)',
                textTransform: 'uppercase',
              }}
            >
              RGB
            </label>
            {['r', 'g', 'b'].map((channel) => (
              <input
                key={channel}
                type="number"
                min="0"
                max="255"
                value={rgbInput[channel]}
                onChange={(e) => handleRgbChange(channel, e.target.value)}
                data-testid={`rgb-${channel}`}
                style={{
                  width: '60px',
                  padding: '8px 6px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-body, #383C43)',
                  background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                  border: '1px solid var(--color-fg-divider, #D7DCE5)',
                  borderRadius: '6px',
                  outline: 'none',
                  textAlign: 'center',
                }}
                placeholder={channel.toUpperCase()}
              />
            ))}
          </div>
        )}

        {activeFormat === 'hsl' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              style={{
                width: '40px',
                fontSize: 'var(--font-size-body-xs, 12px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-caption, #616A76)',
                textTransform: 'uppercase',
              }}
            >
              HSL
            </label>
            <input
              type="number"
              min="0"
              max="360"
              value={hslInput.h}
              onChange={(e) => handleHslChange('h', e.target.value)}
              data-testid="hsl-h"
              style={{
                width: '50px',
                padding: '8px 6px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-body, #383C43)',
                background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                border: '1px solid var(--color-fg-divider, #D7DCE5)',
                borderRadius: '6px',
                outline: 'none',
                textAlign: 'center',
              }}
              placeholder="H"
            />
            <span style={{ color: 'var(--color-fg-caption, #616A76)', fontSize: '12px' }}>°</span>
            <input
              type="number"
              min="0"
              max="100"
              value={hslInput.s}
              onChange={(e) => handleHslChange('s', e.target.value)}
              data-testid="hsl-s"
              style={{
                width: '50px',
                padding: '8px 6px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-body, #383C43)',
                background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                border: '1px solid var(--color-fg-divider, #D7DCE5)',
                borderRadius: '6px',
                outline: 'none',
                textAlign: 'center',
              }}
              placeholder="S"
            />
            <span style={{ color: 'var(--color-fg-caption, #616A76)', fontSize: '12px' }}>%</span>
            <input
              type="number"
              min="0"
              max="100"
              value={hslInput.l}
              onChange={(e) => handleHslChange('l', e.target.value)}
              data-testid="hsl-l"
              style={{
                width: '50px',
                padding: '8px 6px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-body, #383C43)',
                background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                border: '1px solid var(--color-fg-divider, #D7DCE5)',
                borderRadius: '6px',
                outline: 'none',
                textAlign: 'center',
              }}
              placeholder="L"
            />
            <span style={{ color: 'var(--color-fg-caption, #616A76)', fontSize: '12px' }}>%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Color Utility Functions
// ============================================================

/**
 * Normalize hex color to 6-digit uppercase format
 */
function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '#000000'
  
  let cleaned = hex.replace(/^#/, '').toUpperCase()
  
  // Handle 3-digit hex
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('')
  }
  
  // Validate
  if (!/^[0-9A-F]{6}$/.test(cleaned)) {
    return '#000000'
  }
  
  return '#' + cleaned
}

/**
 * Check if string is a valid hex color
 */
function isValidHex(hex) {
  if (!hex || typeof hex !== 'string') return false
  const cleaned = hex.replace(/^#/, '')
  return /^[0-9A-Fa-f]{3}$/.test(cleaned) || /^[0-9A-Fa-f]{6}$/.test(cleaned)
}

/**
 * Convert hex to RGB object
 */
function hexToRgb(hex) {
  const normalized = normalizeHex(hex)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

/**
 * Convert RGB to hex string
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

/**
 * Convert hex to HSL object
 */
function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex)
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const l = (max + min) / 2
  
  let h = 0
  let s = 0
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6
        break
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6
        break
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6
        break
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Convert HSL to hex string
 */
function hslToHex(h, s, l) {
  const sNorm = s / 100
  const lNorm = l / 100
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  
  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  )
}

// Export utilities for testing
export { normalizeHex, isValidHex, hexToRgb, rgbToHex, hexToHsl, hslToHex }

