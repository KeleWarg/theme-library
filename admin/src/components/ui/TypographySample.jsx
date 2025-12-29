import { useState } from 'react'
import { copyToClipboard, getCSSVariable } from '../../lib/tokenData'

/**
 * TypographySample Component
 * Displays a typography token with live sample text, name, variable, and value
 * Click to copy the CSS variable to clipboard
 * 
 * @param {string} name - Token name (e.g., 'heading-lg')
 * @param {string} variable - CSS variable name (e.g., '--font-size-heading-lg')
 * @param {string} value - Human-readable value (e.g., '48px')
 * @param {string} sampleText - Text to display as sample
 * @param {string} fontFamily - Optional font-family to apply (for theme-specific rendering)
 */
export default function TypographySample({ 
  name, 
  variable, 
  value, 
  sampleText = 'The quick brown fox',
  fontFamily = null
}) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    copyToClipboard(getCSSVariable(variable))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Determine if this is a font-size, font-weight, line-height, or letter-spacing token
  const isFontSize = variable.includes('font-size')
  const isFontWeight = variable.includes('font-weight')
  const isLineHeight = variable.includes('line-height')
  const isLetterSpacing = variable.includes('letter-spacing')
  const isFontFamily = variable.includes('font-family')

  // Build the sample text style
  const sampleStyle = {
    fontSize: isFontSize ? `var(${variable})` : 'var(--font-size-body-lg, 18px)',
    fontWeight: isFontWeight ? `var(${variable})` : 'var(--font-weight-regular, 400)',
    lineHeight: isLineHeight ? `var(${variable})` : '1.5',
    letterSpacing: isLetterSpacing ? `var(${variable})` : 'normal',
    fontFamily: isFontFamily ? `var(${variable})` : (fontFamily || 'inherit'),
    color: 'var(--color-fg-heading, #1E2125)',
    marginBottom: '8px',
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '16px',
        border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
        borderRadius: 'var(--radius-sm, 8px)',
        backgroundColor: 'var(--color-bg-white, #FFFFFF)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'box-shadow 0.2s ease, transform 0.1s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Copied feedback */}
      {copied && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            backgroundColor: 'var(--color-fg-feedback-success, #0C7663)',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-label-sm, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            borderRadius: '4px',
          }}
        >
          Copied!
        </div>
      )}

      {/* Sample Text */}
      <div style={sampleStyle}>
        {sampleText}
      </div>

      {/* Token Info Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--color-fg-divider, #D7DCE5)',
        }}
      >
        {/* Token Name */}
        <span
          style={{
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          {name}
        </span>

        {/* Value */}
        <span
          style={{
            fontSize: 'var(--font-size-label-sm, 12px)',
            color: 'var(--color-fg-caption, #616A76)',
            backgroundColor: 'var(--color-bg-neutral-light, #ECEFF3)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {value}
        </span>

        {/* CSS Variable */}
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--font-size-label-sm, 12px)',
            color: 'var(--color-fg-caption, #616A76)',
            marginLeft: 'auto',
          }}
        >
          {variable}
        </code>
      </div>
    </button>
  )
}

