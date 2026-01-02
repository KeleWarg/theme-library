import { useState, useRef, useEffect, useCallback, forwardRef } from 'react'
import { 
  GripVertical, 
  Copy, 
  Trash2, 
  Check, 
  X,
  AlertCircle 
} from 'lucide-react'

/**
 * TokenRow - Inline row component for viewing and editing individual tokens
 * 
 * UI Structure:
 * ┌────────────────────────────────────────────────────────────┐
 * │ ≡ │ primary-bg │ [████] #657E79 │ --color-btn-primary-bg │ 🗑 │
 * └────────────────────────────────────────────────────────────┘
 *   │       │             │                    │              │
 * Drag    Name          Value              CSS Var          Delete
 * 
 * Chunk 3.03 - Token Row Editor
 * 
 * @param {Object} props
 * @param {Object} props.token - Token data object
 * @param {Function} props.onUpdate - Called when token value is updated
 * @param {Function} props.onDelete - Called when token is deleted
 * @param {boolean} props.isReadOnly - Whether editing is disabled
 */
export default function TokenRow({ 
  token, 
  onUpdate, 
  onDelete,
  isReadOnly = false 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  // Determine the display value and token type
  const { displayValue, tokenType, rawValue } = parseTokenValue(token?.value)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Start editing
  const handleStartEdit = useCallback(() => {
    if (isReadOnly) return
    setEditValue(rawValue)
    setIsEditing(true)
  }, [rawValue, isReadOnly])

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditValue('')
  }, [])

  // Save edited value
  const handleSaveEdit = useCallback(() => {
    if (!editValue.trim()) {
      handleCancelEdit()
      return
    }

    // Build the new value object based on token type
    const newValue = buildTokenValue(editValue.trim(), tokenType, token?.value)
    
    if (newValue !== token?.value && JSON.stringify(newValue) !== JSON.stringify(token?.value)) {
      onUpdate?.(token.id, { value: newValue })
    }
    
    setIsEditing(false)
    setEditValue('')
  }, [editValue, tokenType, token?.id, token?.value, onUpdate, handleCancelEdit])

  // Handle keyboard events in edit mode
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }, [handleSaveEdit, handleCancelEdit])

  // Copy CSS variable to clipboard
  const handleCopy = useCallback(async () => {
    const cssVar = token?.css_variable
    if (!cssVar) return

    try {
      await navigator.clipboard.writeText(cssVar)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [token?.css_variable])

  // Handle delete with confirmation
  const handleDeleteClick = useCallback(() => {
    if (isReadOnly) return
    setShowDeleteConfirm(true)
  }, [isReadOnly])

  const handleConfirmDelete = useCallback(() => {
    onDelete?.(token.id)
    setShowDeleteConfirm(false)
  }, [token?.id, onDelete])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  if (!token) return null

  return (
    <div
      data-testid="token-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--color-bg-white, #FFFFFF)',
        borderRadius: '8px',
        border: '1px solid var(--color-fg-divider, #D7DCE5)',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-fg-stroke-ui, #7F8B9A)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-fg-divider, #D7DCE5)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Drag Handle (placeholder for future reordering) */}
      <div
        data-testid="drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          cursor: 'grab',
          color: 'var(--color-fg-stroke-ui, #7F8B9A)',
          opacity: 0.5,
          flexShrink: 0,
        }}
        title="Drag to reorder (coming soon)"
      >
        <GripVertical size={16} />
      </div>

      {/* Token Name */}
      <div
        data-testid="token-name"
        style={{
          width: '180px',
          minWidth: '140px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-medium, 500)',
          color: 'var(--color-fg-heading, #1E2125)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={token.name}
      >
        {token.name}
      </div>

      {/* Value Display/Editor */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '160px',
        }}
      >
        {isEditing ? (
          <EditableValue
            ref={inputRef}
            value={editValue}
            onChange={setEditValue}
            onKeyDown={handleKeyDown}
            tokenType={tokenType}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <ValueDisplay
            displayValue={displayValue}
            tokenType={tokenType}
            rawValue={rawValue}
            onClick={handleStartEdit}
            isReadOnly={isReadOnly}
          />
        )}
      </div>

      {/* CSS Variable */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '200px',
          maxWidth: '280px',
        }}
      >
        <code
          data-testid="css-variable"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            fontSize: 'var(--font-size-body-xs, 12px)',
            color: 'var(--color-fg-caption, #616A76)',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
            padding: '4px 8px',
            borderRadius: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
          title={token.css_variable}
        >
          {token.css_variable || '--undefined'}
        </code>
        <button
          onClick={handleCopy}
          data-testid="copy-button"
          title={copied ? 'Copied!' : 'Copy CSS variable'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            padding: 0,
            background: copied ? 'var(--color-fg-feedback-success, #0C7663)' : 'transparent',
            color: copied ? 'var(--color-bg-white, #FFFFFF)' : 'var(--color-fg-caption, #616A76)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
              e.currentTarget.style.color = 'var(--color-fg-body, #383C43)'
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-fg-caption, #616A76)'
            }
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Delete Button / Confirmation */}
      {showDeleteConfirm ? (
        <div
          data-testid="delete-confirm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleConfirmDelete}
            data-testid="confirm-delete"
            title="Confirm delete"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              padding: 0,
              background: 'var(--color-fg-feedback-error, #EB4015)',
              color: 'var(--color-bg-white, #FFFFFF)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancelDelete}
            data-testid="cancel-delete"
            title="Cancel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              padding: 0,
              background: 'var(--color-bg-neutral-light, #ECEFF3)',
              color: 'var(--color-fg-body, #383C43)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleDeleteClick}
          disabled={isReadOnly}
          data-testid="delete-button"
          title={isReadOnly ? 'Delete disabled' : 'Delete token'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            padding: 0,
            background: 'transparent',
            color: isReadOnly 
              ? 'var(--color-fg-disabled, #A0A4A8)' 
              : 'var(--color-fg-caption, #616A76)',
            border: 'none',
            borderRadius: '4px',
            cursor: isReadOnly ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isReadOnly) {
              e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
              e.currentTarget.style.color = 'var(--color-fg-feedback-error, #EB4015)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = isReadOnly 
              ? 'var(--color-fg-disabled, #A0A4A8)' 
              : 'var(--color-fg-caption, #616A76)'
          }}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

/**
 * Value display component with type-specific rendering
 */
function ValueDisplay({ displayValue, tokenType, rawValue, onClick, isReadOnly }) {
  const isColor = tokenType === 'color'
  
  return (
    <div
      data-testid="token-value"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        borderRadius: '6px',
        cursor: isReadOnly ? 'default' : 'pointer',
        transition: 'background 0.15s ease',
        flex: 1,
        minWidth: 0,
      }}
      title={isReadOnly ? displayValue : 'Click to edit'}
      onMouseEnter={(e) => {
        if (!isReadOnly) {
          e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
      }}
    >
      {/* Color Swatch (for color tokens) */}
      {isColor && (
        <div
          data-testid="color-swatch"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: rawValue,
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}
        />
      )}
      
      {/* Value Text */}
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          fontSize: 'var(--font-size-body-sm, 14px)',
          color: 'var(--color-fg-body, #383C43)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayValue}
      </span>
    </div>
  )
}

/**
 * Editable value component with save/cancel controls
 */
const EditableValue = forwardRef(function EditableValue(
  { value, onChange, onKeyDown, tokenType, onSave, onCancel },
  inputRef
) {
  const isColor = tokenType === 'color'

  return (
    <div
      data-testid="edit-mode"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
      }}
    >
      {/* Color picker for color tokens */}
      {isColor && (
        <input
          type="color"
          value={value.startsWith('#') ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          data-testid="color-picker"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            borderRadius: '4px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
      )}
      
      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        data-testid="value-input"
        style={{
          flex: 1,
          padding: '8px 12px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          fontSize: 'var(--font-size-body-sm, 14px)',
          color: 'var(--color-fg-body, #383C43)',
          background: 'var(--color-bg-white, #FFFFFF)',
          border: '2px solid var(--color-btn-primary-bg, #657E79)',
          borderRadius: '6px',
          outline: 'none',
        }}
        placeholder="Enter value..."
      />
      
      {/* Save/Cancel buttons */}
      <button
        onClick={onSave}
        data-testid="save-edit"
        title="Save (Enter)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          padding: 0,
          background: 'var(--color-btn-primary-bg, #657E79)',
          color: 'var(--color-bg-white, #FFFFFF)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Check size={14} />
      </button>
      <button
        onClick={onCancel}
        data-testid="cancel-edit"
        title="Cancel (Escape)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          padding: 0,
          background: 'var(--color-bg-neutral-light, #ECEFF3)',
          color: 'var(--color-fg-body, #383C43)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
})

/**
 * Parse token value to extract display value, type, and raw value
 * @param {any} value - Token value (can be string, object with hex, or other formats)
 * @returns {{ displayValue: string, tokenType: string, rawValue: string }}
 */
function parseTokenValue(value) {
  if (!value) {
    return { displayValue: '(empty)', tokenType: 'unknown', rawValue: '' }
  }

  // String value (likely raw hex color or direct value)
  if (typeof value === 'string') {
    const isColor = /^#[0-9A-Fa-f]{3,8}$/.test(value) || 
                    /^rgb/i.test(value) || 
                    /^hsl/i.test(value)
    return {
      displayValue: value,
      tokenType: isColor ? 'color' : 'string',
      rawValue: value,
    }
  }

  // Object with hex property (Figma DTCG format)
  if (typeof value === 'object') {
    // Color object { hex: "#...", alpha?: number }
    if (value.hex) {
      const hexValue = value.hex.toUpperCase()
      return {
        displayValue: hexValue,
        tokenType: 'color',
        rawValue: hexValue,
      }
    }

    // Object with $value (DTCG format)
    if (value.$value !== undefined) {
      return parseTokenValue(value.$value)
    }

    // Dimension/size value { value: number, unit: string }
    if (value.value !== undefined && value.unit) {
      const displayValue = `${value.value}${value.unit}`
      return {
        displayValue,
        tokenType: 'dimension',
        rawValue: displayValue,
      }
    }

    // Font weight or other numeric
    if (typeof value.value === 'number') {
      return {
        displayValue: String(value.value),
        tokenType: 'number',
        rawValue: String(value.value),
      }
    }

    // Complex object - stringify for display
    return {
      displayValue: JSON.stringify(value),
      tokenType: 'object',
      rawValue: JSON.stringify(value),
    }
  }

  // Number value
  if (typeof value === 'number') {
    return {
      displayValue: String(value),
      tokenType: 'number',
      rawValue: String(value),
    }
  }

  return { displayValue: String(value), tokenType: 'unknown', rawValue: String(value) }
}

/**
 * Build token value object from edited string value
 * @param {string} editedValue - The new value string
 * @param {string} tokenType - The detected token type
 * @param {any} originalValue - The original value to preserve structure
 * @returns {any} - New token value in appropriate format
 */
function buildTokenValue(editedValue, tokenType, originalValue) {
  // For color tokens, keep hex format
  if (tokenType === 'color') {
    // If original was object with hex, maintain structure
    if (typeof originalValue === 'object' && originalValue?.hex) {
      return { ...originalValue, hex: editedValue.toUpperCase() }
    }
    // Otherwise return as string
    return editedValue.toUpperCase()
  }

  // For dimension tokens
  if (tokenType === 'dimension') {
    const match = editedValue.match(/^(-?\d+\.?\d*)(px|rem|em|%|pt|vw|vh)?$/)
    if (match && typeof originalValue === 'object') {
      return { 
        ...originalValue, 
        value: parseFloat(match[1]), 
        unit: match[2] || originalValue.unit || 'px' 
      }
    }
    return editedValue
  }

  // For number tokens
  if (tokenType === 'number') {
    const num = parseFloat(editedValue)
    if (!isNaN(num)) {
      if (typeof originalValue === 'object' && 'value' in originalValue) {
        return { ...originalValue, value: num }
      }
      return num
    }
  }

  // For object tokens, try to parse JSON
  if (tokenType === 'object') {
    try {
      return JSON.parse(editedValue)
    } catch {
      return editedValue
    }
  }

  // Default: return as string
  return editedValue
}

