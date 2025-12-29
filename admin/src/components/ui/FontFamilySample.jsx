import { useState } from 'react'
import { copyToClipboard, getCSSVariable } from '../../lib/tokenData'

/**
 * FontFamilySample Component
 * Displays a font family token with live sample showing the actual font
 * Click to copy the CSS variable to clipboard
 * 
 * @param {string} name - Token name (e.g., 'font-family-heading')
 * @param {string} variable - CSS variable name (e.g., '--font-family-heading')
 * @param {string} value - Font family name (e.g., 'Work Sans')
 * @param {string} fallback - Full fallback stack (e.g., 'Work Sans, system-ui, sans-serif')
 * @param {string} description - Description of what this font is used for
 */
export default function FontFamilySample({ 
  name, 
  variable, 
  value, 
  fallback,
  description 
}) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    copyToClipboard(getCSSVariable(variable))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      data-testid="font-family-sample"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '20px',
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

      {/* Font Family Name (Display) */}
      <div
        style={{
          fontSize: 'var(--font-size-heading-sm, 24px)',
          fontWeight: 'var(--font-weight-medium, 500)',
          fontFamily: `var(${variable})`,
          color: 'var(--color-fg-heading, #1E2125)',
          marginBottom: '8px',
        }}
      >
        {value}
      </div>

      {/* Sample text in the font */}
      <div
        style={{
          fontSize: 'var(--font-size-body-lg, 18px)',
          fontFamily: `var(${variable})`,
          color: 'var(--color-fg-body, #444B54)',
          marginBottom: '4px',
          lineHeight: '1.5',
        }}
      >
        The quick brown fox jumps over the lazy dog
      </div>

      {/* Sample alphabet */}
      <div
        style={{
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontFamily: `var(${variable})`,
          color: 'var(--color-fg-caption, #616A76)',
          marginBottom: '12px',
          letterSpacing: '0.5px',
        }}
      >
        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
            marginBottom: '12px',
            fontStyle: 'italic',
          }}
        >
          {description}
        </div>
      )}

      {/* Token Info Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '12px',
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

        {/* Fallback Stack */}
        <span
          style={{
            fontSize: 'var(--font-size-label-sm, 12px)',
            color: 'var(--color-fg-caption, #616A76)',
            backgroundColor: 'var(--color-bg-neutral-light, #ECEFF3)',
            padding: '4px 8px',
            borderRadius: '4px',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={fallback}
        >
          {fallback}
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

