/**
 * ThemeExportModal Component
 * Modal for exporting theme tokens in various formats
 * Chunk 4.03 - Export Modal
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Copy, Download, Check } from 'lucide-react'
import FormatSelector from './FormatSelector'
import ExportOptions, { DEFAULT_OPTIONS } from './ExportOptions'
import { generateExport, getFileExtension, getMimeType } from '../../../lib/exportGenerators'

// Max characters to show in preview before truncating
const PREVIEW_MAX_CHARS = 3000
const PREVIEW_MAX_LINES = 80

export default function ThemeExportModal({ 
  isOpen, 
  onClose, 
  theme,
  tokens = []
}) {
  const [format, setFormat] = useState('css')
  const [options, setOptions] = useState(DEFAULT_OPTIONS.css)
  const [copied, setCopied] = useState(false)
  
  // Reset options when format changes
  useEffect(() => {
    setOptions(DEFAULT_OPTIONS[format] || {})
  }, [format])
  
  // Generate export output
  const output = useMemo(() => {
    try {
      return generateExport(format, tokens, options)
    } catch (error) {
      console.error('Export generation error:', error)
      return `/* Error generating export: ${error.message} */`
    }
  }, [format, tokens, options])
  
  // Truncated preview for large outputs
  const { preview, isTruncated, lineCount } = useMemo(() => {
    const lines = output.split('\n')
    const totalLines = lines.length
    
    if (output.length <= PREVIEW_MAX_CHARS && totalLines <= PREVIEW_MAX_LINES) {
      return { preview: output, isTruncated: false, lineCount: totalLines }
    }
    
    // Truncate by lines first
    let truncatedLines = lines.slice(0, PREVIEW_MAX_LINES)
    let truncated = truncatedLines.join('\n')
    
    // Further truncate by characters if needed
    if (truncated.length > PREVIEW_MAX_CHARS) {
      truncated = truncated.slice(0, PREVIEW_MAX_CHARS)
    }
    
    return { 
      preview: truncated + '\n\n/* ... truncated preview ... */', 
      isTruncated: true,
      lineCount: totalLines
    }
  }, [output])
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])
  
  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }, [output])
  
  // Download file
  const handleDownload = useCallback(() => {
    const filename = `${theme?.slug || 'theme'}-tokens${getFileExtension(format)}`
    const blob = new Blob([output], { type: getMimeType(format) })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output, format, theme])
  
  if (!isOpen) return null
  
  return (
    <div
      data-testid="export-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        data-testid="export-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-white, #FFFFFF)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          width: '100%',
          maxWidth: '700px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
          }}
        >
          <div>
            <h2
              id="export-modal-title"
              style={{
                margin: 0,
                fontSize: 'var(--font-size-title-lg, 20px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
              }}
            >
              Export Theme
            </h2>
            {theme && (
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-caption, #616A76)',
                }}
              >
                {theme.name} • {tokens.length} tokens
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-testid="close-button"
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-fg-caption, #616A76)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
              e.currentTarget.style.color = 'var(--color-fg-body, #383C43)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = 'var(--color-fg-caption, #616A76)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Format Selector */}
        <FormatSelector
          selectedFormat={format}
          onFormatChange={setFormat}
        />

        {/* Options */}
        <ExportOptions
          format={format}
          options={options}
          onOptionsChange={setOptions}
        />

        {/* Preview */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '200px',
            maxHeight: '400px',
          }}
        >
          <div
            style={{
              padding: '12px 24px 8px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-label-md, 14px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-caption, #616A76)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Preview
            </span>
            {isTruncated && (
              <span
                style={{
                  fontSize: 'var(--font-size-body-xs, 12px)',
                  color: 'var(--color-fg-caption, #616A76)',
                }}
              >
                Showing {PREVIEW_MAX_LINES} of {lineCount} lines
              </span>
            )}
          </div>
          <div
            data-testid="export-preview"
            style={{
              flex: 1,
              margin: '0 24px 16px 24px',
              padding: '16px',
              background: 'var(--color-bg-neutral-strong, #2B2E34)',
              borderRadius: '8px',
              overflow: 'auto',
              fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#E8E8E8',
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {preview}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--color-fg-divider, #D7DCE5)',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          }}
        >
          <button
            onClick={handleCopy}
            data-testid="copy-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: copied 
                ? 'var(--color-fg-feedback-success, #0C7663)'
                : 'var(--color-btn-secondary-text, #3453A7)',
              backgroundColor: 'var(--color-bg-white, #FFFFFF)',
              border: `1px solid ${copied 
                ? 'var(--color-fg-feedback-success, #0C7663)' 
                : 'var(--color-btn-secondary-border, #7A8EC7)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '100px',
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.backgroundColor = 'var(--color-btn-secondary-hover-bg, #F0F3FF)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-white, #FFFFFF)'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleDownload}
            data-testid="download-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-btn-primary-text, #FFFFFF)',
              backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-btn-primary-hover-bg, #46635D)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-btn-primary-bg, #657E79)'
            }}
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

