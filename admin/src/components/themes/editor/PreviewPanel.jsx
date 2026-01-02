import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Monitor, Tablet, Smartphone, Sun, Moon, RefreshCw } from 'lucide-react'
import { ComponentShowcase } from './PreviewComponents'

// Config values from 04-config-reference.md
const PREVIEW_VIEWPORTS = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
}

// Debounce delay for CSS updates (performance optimization)
const CSS_UPDATE_DEBOUNCE_MS = 150

/**
 * PreviewPanel - Live preview panel showing sample components with theme tokens applied
 * 
 * Features:
 * - Real-time CSS variable updates from tokens
 * - Viewport toggle (Desktop, Tablet, Mobile)
 * - Light/Dark mode toggle (if theme supports it)
 * - Debounced CSS regeneration for performance
 * 
 * @param {Object} props
 * @param {Array} props.tokens - Current theme tokens array
 * @param {string} props.themeName - Name of the current theme
 * @param {Function} props.onRefresh - Optional callback to refresh preview
 */
export default function PreviewPanel({
  tokens = [],
  themeName = 'Theme Preview',
  onRefresh,
}) {
  const [viewport, setViewport] = useState('desktop')
  const [colorMode, setColorMode] = useState('light')
  const previewRef = useRef(null)
  const styleRef = useRef(null)
  const debounceTimerRef = useRef(null)

  /**
   * Generate CSS custom properties from tokens
   * Only include tokens that have a css_variable defined
   */
  const generateCssFromTokens = useCallback((tokenList) => {
    if (!tokenList || tokenList.length === 0) return ''

    const cssVariables = tokenList
      .filter((token) => token.css_variable && token.value)
      .map((token) => {
        const value = extractCssValue(token.value)
        return `  ${token.css_variable}: ${value};`
      })
      .join('\n')

    return `:host {\n${cssVariables}\n}\n\n.preview-container {\n${cssVariables}\n}`
  }, [])

  /**
   * Extract CSS value from token value object
   * Handles different value formats (color objects, numbers with units, strings)
   */
  const extractCssValue = (value) => {
    if (value === null || value === undefined) return 'inherit'

    // If it's already a string, return it
    if (typeof value === 'string') return value

    // If it's a number, return it as-is
    if (typeof value === 'number') return String(value)

    // If it's an object, try to extract the value
    if (typeof value === 'object') {
      // Color object with hex
      if (value.hex) return value.hex
      
      // Color object with r, g, b
      if (value.r !== undefined && value.g !== undefined && value.b !== undefined) {
        const a = value.a !== undefined ? value.a : 1
        if (a < 1) {
          return `rgba(${Math.round(value.r)}, ${Math.round(value.g)}, ${Math.round(value.b)}, ${a})`
        }
        return `rgb(${Math.round(value.r)}, ${Math.round(value.g)}, ${Math.round(value.b)})`
      }

      // Number with unit
      if (value.value !== undefined && value.unit !== undefined) {
        return `${value.value}${value.unit}`
      }

      // Just a value property
      if (value.value !== undefined) return String(value.value)

      // Shadow object
      if (value.x !== undefined && value.y !== undefined) {
        const { x = 0, y = 0, blur = 0, spread = 0, color = '#000000' } = value
        return `${x}px ${y}px ${blur}px ${spread}px ${color}`
      }

      // Font family array
      if (Array.isArray(value)) {
        return value.map(v => v.includes(' ') ? `"${v}"` : v).join(', ')
      }

      // Try JSON stringification as fallback
      return JSON.stringify(value)
    }

    return String(value)
  }

  /**
   * Debounced CSS update to prevent performance issues on rapid token changes
   */
  useEffect(() => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      const css = generateCssFromTokens(tokens)
      
      // Update or create style element
      if (!styleRef.current) {
        styleRef.current = document.createElement('style')
        styleRef.current.setAttribute('data-preview-styles', 'true')
      }
      
      styleRef.current.textContent = css
      
      // Append to preview container if not already there
      if (previewRef.current && !previewRef.current.contains(styleRef.current)) {
        previewRef.current.appendChild(styleRef.current)
      }
    }, CSS_UPDATE_DEBOUNCE_MS)

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [tokens, generateCssFromTokens])

  /**
   * Generate inline CSS string for the preview container
   * This provides immediate feedback while the debounced style update processes
   */
  const inlineStyles = useMemo(() => {
    if (!tokens || tokens.length === 0) return {}
    
    const styles = {}
    tokens.forEach((token) => {
      if (token.css_variable && token.value) {
        // Convert CSS variable name to camelCase property
        // e.g., --color-btn-primary-bg -> won't work inline, so we use custom properties
        const value = extractCssValue(token.value)
        const varName = token.css_variable
        styles[varName] = value
      }
    })
    return styles
  }, [tokens])

  /**
   * Build CSS text from inline styles for the preview container
   */
  const cssText = useMemo(() => {
    return Object.entries(inlineStyles)
      .map(([varName, value]) => `${varName}: ${value}`)
      .join('; ')
  }, [inlineStyles])

  const viewportWidth = PREVIEW_VIEWPORTS[viewport]

  return (
    <div
      data-testid="preview-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '16px',
      }}
    >
      {/* Header with controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-size-title-sm, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          Preview
        </h3>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Viewport Toggle */}
          <div
            data-testid="viewport-toggle"
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg-neutral-subtle, #F4F5F8)',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <ViewportButton
              icon={<Monitor size={14} />}
              isActive={viewport === 'desktop'}
              onClick={() => setViewport('desktop')}
              title="Desktop (1440px)"
            />
            <ViewportButton
              icon={<Tablet size={14} />}
              isActive={viewport === 'tablet'}
              onClick={() => setViewport('tablet')}
              title="Tablet (768px)"
            />
            <ViewportButton
              icon={<Smartphone size={14} />}
              isActive={viewport === 'mobile'}
              onClick={() => setViewport('mobile')}
              title="Mobile (375px)"
            />
          </div>

          {/* Color Mode Toggle */}
          <button
            data-testid="color-mode-toggle"
            onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
            title={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              padding: 0,
              backgroundColor: 'var(--color-bg-neutral-subtle, #F4F5F8)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--color-fg-body, #383C43)',
              transition: 'background-color 0.2s ease',
            }}
          >
            {colorMode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              data-testid="refresh-preview"
              onClick={onRefresh}
              title="Refresh preview"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                padding: 0,
                backgroundColor: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--color-fg-body, #383C43)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Viewport Size Indicator */}
      <div
        style={{
          fontSize: 'var(--font-size-label-sm, 12px)',
          color: 'var(--color-fg-caption, #616A76)',
          textAlign: 'center',
        }}
      >
        {viewport.charAt(0).toUpperCase() + viewport.slice(1)} — {viewportWidth}px
      </div>

      {/* Preview Container */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: colorMode === 'light' 
            ? 'var(--color-bg-neutral-subtle, #F4F5F8)'
            : '#1E2125',
          borderRadius: '8px',
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* Scaled Preview with Viewport Width */}
        <div
          ref={previewRef}
          data-testid="preview-container"
          className="preview-container"
          style={{
            width: viewport === 'desktop' ? '100%' : `${viewportWidth}px`,
            maxWidth: '100%',
            minHeight: '400px',
            backgroundColor: colorMode === 'light'
              ? 'var(--color-bg-white, #FFFFFF)'
              : 'var(--color-bg-neutral-strong, #2B2E34)',
            borderRadius: '8px',
            border: `1px solid ${colorMode === 'light' 
              ? 'var(--color-fg-divider, #D7DCE5)' 
              : 'var(--color-fg-stroke-dark-inverse, #383C43)'}`,
            padding: '24px',
            overflow: 'auto',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            transition: 'width 0.3s ease, background-color 0.3s ease',
            // Apply CSS custom properties inline
            ...(cssText ? { cssText } : {}),
          }}
          // Use data attribute to apply CSS text since inline style objects don't support custom properties well
          ref={(el) => {
            if (el) {
              previewRef.current = el
              // Apply custom properties via setAttribute
              Object.entries(inlineStyles).forEach(([varName, value]) => {
                el.style.setProperty(varName, value)
              })
            }
          }}
        >
          {tokens.length > 0 ? (
            <ComponentShowcase />
          ) : (
            <EmptyPreview />
          )}
        </div>
      </div>

      {/* Token Count */}
      <div
        style={{
          fontSize: 'var(--font-size-label-sm, 12px)',
          color: 'var(--color-fg-caption, #616A76)',
          textAlign: 'center',
        }}
      >
        {tokens.length} tokens applied
      </div>
    </div>
  )
}

/**
 * Viewport toggle button component
 */
function ViewportButton({ icon, isActive, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        padding: 0,
        backgroundColor: isActive
          ? 'var(--color-bg-white, #FFFFFF)'
          : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: isActive
          ? 'var(--color-btn-primary-bg, #657E79)'
          : 'var(--color-fg-caption, #616A76)',
        boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {icon}
    </button>
  )
}

/**
 * Empty state when no tokens are available
 */
function EmptyPreview() {
  return (
    <div
      data-testid="empty-preview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '300px',
        color: 'var(--color-fg-caption, #616A76)',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <Monitor
        size={48}
        style={{
          marginBottom: '16px',
          opacity: 0.4,
          color: 'var(--color-fg-stroke-ui, #7F8B9A)',
        }}
      />
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: 'var(--font-size-body-md, 16px)',
          fontWeight: 'var(--font-weight-medium, 500)',
        }}
      >
        No tokens to preview
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-body-sm, 14px)',
        }}
      >
        Add or import tokens to see a live preview of your theme
      </p>
    </div>
  )
}

