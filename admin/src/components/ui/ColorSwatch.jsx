import { useState } from 'react'
import { copyToClipboard, getCSSVariable } from '../../lib/tokenData'

/**
 * ColorSwatch Component
 * Displays a color token with preview, name, variable, and optional description
 * Click to copy the CSS variable to clipboard
 */
export default function ColorSwatch({ name, variable, description }) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    copyToClipboard(getCSSVariable(variable))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 0,
        border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
        borderRadius: 'var(--radius-sm, 8px)',
        backgroundColor: 'var(--color-bg-white, #FFFFFF)',
        cursor: 'pointer',
        overflow: 'hidden',
        textAlign: 'left',
        transition: 'box-shadow 0.2s ease, transform 0.1s ease',
        width: '100%',
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
      {/* Color Preview */}
      <div
        style={{
          height: '48px',
          backgroundColor: `var(${variable})`,
          borderBottom: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
          position: 'relative',
        }}
      >
        {/* Copied feedback overlay */}
        {copied && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#FFFFFF',
              fontSize: 'var(--font-size-label-md, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
            }}
          >
            Copied!
          </div>
        )}
      </div>

      {/* Token Info */}
      <div
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
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

        {/* CSS Variable */}
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--font-size-label-sm, 12px)',
            color: 'var(--color-fg-caption, #616A76)',
            wordBreak: 'break-all',
          }}
        >
          {variable}
        </code>

        {/* Description (optional) */}
        {description && (
          <span
            style={{
              fontSize: 'var(--font-size-label-sm, 12px)',
              color: 'var(--color-fg-caption, #616A76)',
              marginTop: '4px',
            }}
          >
            {description}
          </span>
        )}
      </div>
    </button>
  )
}



