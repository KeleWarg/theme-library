import { useState, useCallback, useMemo } from 'react'
import { Plus, X, Palette, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import ColorPicker from '../editor/ColorPicker'

/**
 * Color section definitions for organized editing
 */
const COLOR_SECTIONS = [
  {
    id: 'brand',
    title: 'Brand Colors',
    description: 'Primary and secondary brand identity colors',
    subcategories: ['brand', 'primary', 'secondary'],
    defaultTokens: [
      { name: 'primary', value: { hex: '#657E79' }, css_variable: '--color-brand-primary' },
      { name: 'secondary', value: { hex: '#9CB8B2' }, css_variable: '--color-brand-secondary' },
    ],
  },
  {
    id: 'background',
    title: 'Background Colors',
    description: 'Surface and background fills',
    subcategories: ['background', 'bg', 'surface'],
    defaultTokens: [
      { name: 'white', value: { hex: '#FFFFFF' }, css_variable: '--color-bg-white' },
      { name: 'neutral-subtle', value: { hex: '#F4F5F8' }, css_variable: '--color-bg-neutral-subtle' },
      { name: 'neutral-light', value: { hex: '#ECEFF3' }, css_variable: '--color-bg-neutral-light' },
      { name: 'neutral', value: { hex: '#E3E7ED' }, css_variable: '--color-bg-neutral' },
    ],
  },
  {
    id: 'foreground',
    title: 'Foreground / Text Colors',
    description: 'Text and icon colors',
    subcategories: ['foreground', 'fg', 'text'],
    defaultTokens: [
      { name: 'heading', value: { hex: '#1E2125' }, css_variable: '--color-fg-heading' },
      { name: 'body', value: { hex: '#383C43' }, css_variable: '--color-fg-body' },
      { name: 'caption', value: { hex: '#616A76' }, css_variable: '--color-fg-caption' },
      { name: 'link', value: { hex: '#657E79' }, css_variable: '--color-fg-link' },
      { name: 'divider', value: { hex: '#D7DCE5' }, css_variable: '--color-fg-divider' },
    ],
  },
  {
    id: 'button',
    title: 'Button Colors',
    description: 'Interactive button states',
    subcategories: ['button', 'btn', 'cta'],
    defaultTokens: [
      { name: 'primary-bg', value: { hex: '#657E79' }, css_variable: '--color-btn-primary-bg' },
      { name: 'primary-text', value: { hex: '#FFFFFF' }, css_variable: '--color-btn-primary-text' },
      { name: 'primary-hover-bg', value: { hex: '#526964' }, css_variable: '--color-btn-primary-hover-bg' },
      { name: 'secondary-bg', value: { hex: '#FFFFFF' }, css_variable: '--color-btn-secondary-bg' },
      { name: 'secondary-text', value: { hex: '#657E79' }, css_variable: '--color-btn-secondary-text' },
    ],
  },
  {
    id: 'status',
    title: 'Status Colors',
    description: 'Feedback and status indicators',
    subcategories: ['feedback', 'status', 'alert'],
    defaultTokens: [
      { name: 'success', value: { hex: '#0C7663' }, css_variable: '--color-status-success' },
      { name: 'warning', value: { hex: '#FFB136' }, css_variable: '--color-status-warning' },
      { name: 'error', value: { hex: '#EB4015' }, css_variable: '--color-status-error' },
      { name: 'info', value: { hex: '#3B82F6' }, css_variable: '--color-status-info' },
    ],
  },
]

/**
 * ColorEditorStep - Step component for editing color tokens during theme creation
 * 
 * @param {Object} props
 * @param {Array} props.tokens - Current color tokens
 * @param {Function} props.onChange - Callback when tokens change
 * @param {Function} props.onAddToken - Callback to add a new token
 * @param {Function} props.onRemoveToken - Callback to remove a token
 */
export default function ColorEditorStep({ 
  tokens = [], 
  onChange,
  onAddToken,
  onRemoveToken,
}) {
  const [expandedSections, setExpandedSections] = useState(
    COLOR_SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  )
  const [editingToken, setEditingToken] = useState(null)
  const [newTokenName, setNewTokenName] = useState('')
  const [addingToSection, setAddingToSection] = useState(null)
  const [nameError, setNameError] = useState(null)

  // Group tokens by section based on subcategory
  const tokensBySection = useMemo(() => {
    const grouped = {}
    
    COLOR_SECTIONS.forEach(section => {
      grouped[section.id] = tokens.filter(token => {
        const subcategory = (token.subcategory || '').toLowerCase()
        return section.subcategories.some(sub => subcategory.includes(sub))
      })
    })
    
    // Collect ungrouped tokens
    const groupedIds = Object.values(grouped).flat().map(t => t.name)
    grouped.other = tokens.filter(t => !groupedIds.includes(t.name))
    
    return grouped
  }, [tokens])

  // Toggle section expansion
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }, [])

  // Handle token value update
  const handleTokenValueChange = useCallback((token, newValue) => {
    const tokenIndex = tokens.findIndex(t => 
      t.name === token.name && t.subcategory === token.subcategory
    )
    if (tokenIndex !== -1) {
      onChange(tokenIndex, { value: { hex: newValue } })
    }
    setEditingToken(null)
  }, [tokens, onChange])

  // Handle token name update
  const handleTokenNameChange = useCallback((token, newName) => {
    // Validate name
    if (!newName.trim()) {
      return
    }
    
    // Check for duplicates
    const isDuplicate = tokens.some(t => 
      t.name === newName && t !== token
    )
    if (isDuplicate) {
      return
    }
    
    const tokenIndex = tokens.findIndex(t => 
      t.name === token.name && t.subcategory === token.subcategory
    )
    if (tokenIndex !== -1) {
      const newCssVar = `--color-${token.subcategory || 'custom'}-${newName.toLowerCase().replace(/\s+/g, '-')}`
      onChange(tokenIndex, { name: newName, css_variable: newCssVar })
    }
  }, [tokens, onChange])

  // Validate and add new token
  const handleAddNewToken = useCallback((sectionId) => {
    const name = newTokenName.trim()
    
    // Validate name
    if (!name) {
      setNameError('Name is required')
      return
    }
    
    if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(name)) {
      setNameError('Name must start with a letter and contain only letters, numbers, hyphens, and underscores')
      return
    }
    
    // Check for duplicates
    if (tokens.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setNameError('A token with this name already exists')
      return
    }
    
    // Find section info
    const section = COLOR_SECTIONS.find(s => s.id === sectionId)
    const subcategory = section?.subcategories[0] || 'custom'
    
    onAddToken?.('color', subcategory, {
      name,
      value: { hex: '#000000' },
      css_variable: `--color-${subcategory}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    })
    
    setNewTokenName('')
    setAddingToSection(null)
    setNameError(null)
  }, [newTokenName, tokens, onAddToken])

  // Handle token removal with confirmation
  const handleRemoveToken = useCallback((token) => {
    if (window.confirm(`Remove "${token.name}"? This action cannot be undone.`)) {
      const tokenIndex = tokens.findIndex(t => 
        t.name === token.name && t.subcategory === token.subcategory
      )
      if (tokenIndex !== -1) {
        onRemoveToken?.(tokenIndex)
      }
    }
  }, [tokens, onRemoveToken])

  // Apply section defaults
  const handleApplyDefaults = useCallback((section) => {
    if (window.confirm(`Apply default ${section.title.toLowerCase()}? This will replace existing tokens in this section.`)) {
      // Remove existing tokens in this section
      const existingIndices = tokens
        .map((t, i) => ({ token: t, index: i }))
        .filter(({ token }) => 
          section.subcategories.some(sub => 
            (token.subcategory || '').toLowerCase().includes(sub)
          )
        )
        .map(({ index }) => index)
        .reverse() // Remove from end to start to keep indices valid
      
      existingIndices.forEach(i => onRemoveToken?.(i))
      
      // Add default tokens
      section.defaultTokens.forEach(defaultToken => {
        onAddToken?.('color', section.subcategories[0], defaultToken)
      })
    }
  }, [tokens, onAddToken, onRemoveToken])

  return (
    <div
      data-testid="color-editor-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Palette size={20} style={{ color: 'var(--color-btn-primary-bg, #657E79)' }} />
          <h3 style={{
            margin: 0,
            fontSize: 'var(--font-size-title-lg, 20px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}>
            Color Tokens
          </h3>
        </div>
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-body-md, 16px)',
          color: 'var(--color-fg-caption, #616A76)',
          lineHeight: 1.5,
        }}>
          Define your theme's color palette. Click on a color swatch to edit, or add custom tokens.
        </p>
      </div>

      {/* Color Sections */}
      {COLOR_SECTIONS.map((section) => {
        const sectionTokens = tokensBySection[section.id] || []
        const isExpanded = expandedSections[section.id]

        return (
          <div
            key={section.id}
            data-testid={`color-section-${section.id}`}
            style={{
              background: 'var(--color-bg-white, #FFFFFF)',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              data-testid={`toggle-section-${section.id}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <h4 style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body-md, 16px)',
                  fontWeight: 'var(--font-weight-semibold, 600)',
                  color: 'var(--color-fg-heading, #1E2125)',
                }}>
                  {section.title}
                  <span style={{
                    marginLeft: '8px',
                    fontSize: 'var(--font-size-body-sm, 14px)',
                    fontWeight: 'var(--font-weight-regular, 400)',
                    color: 'var(--color-fg-caption, #616A76)',
                  }}>
                    ({sectionTokens.length})
                  </span>
                </h4>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-caption, #616A76)',
                }}>
                  {section.description}
                </p>
              </div>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div style={{ padding: '16px 20px' }}>
                {sectionTokens.length === 0 ? (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                      borderRadius: '8px',
                    }}
                  >
                    <p style={{
                      margin: '0 0 12px 0',
                      color: 'var(--color-fg-caption, #616A76)',
                      fontSize: 'var(--font-size-body-sm, 14px)',
                    }}>
                      No {section.title.toLowerCase()} defined yet.
                    </p>
                    <button
                      onClick={() => handleApplyDefaults(section)}
                      data-testid={`apply-defaults-${section.id}`}
                      style={{
                        padding: '8px 16px',
                        fontSize: 'var(--font-size-body-sm, 14px)',
                        fontWeight: 'var(--font-weight-medium, 500)',
                        background: 'var(--color-btn-primary-bg, #657E79)',
                        color: 'var(--color-btn-primary-fg, #FFFFFF)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Apply Defaults
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Color Token Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {sectionTokens.map((token, idx) => (
                        <ColorTokenCard
                          key={`${token.subcategory}-${token.name}-${idx}`}
                          token={token}
                          isEditing={editingToken === token}
                          onEdit={() => setEditingToken(token)}
                          onValueChange={(value) => handleTokenValueChange(token, value)}
                          onNameChange={(name) => handleTokenNameChange(token, name)}
                          onRemove={() => handleRemoveToken(token)}
                          onClose={() => setEditingToken(null)}
                        />
                      ))}
                    </div>

                    {/* Add Token Button or Form */}
                    {addingToSection === section.id ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '12px',
                          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                          borderRadius: '8px',
                          marginTop: '8px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={newTokenName}
                            onChange={(e) => {
                              setNewTokenName(e.target.value)
                              setNameError(null)
                            }}
                            placeholder="Token name (e.g., accent)"
                            data-testid={`new-token-name-${section.id}`}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: 'var(--font-size-body-sm, 14px)',
                              border: `1px solid ${nameError ? 'var(--color-fg-feedback-error, #EB4015)' : 'var(--color-fg-stroke-default, #BFC7D4)'}`,
                              borderRadius: '6px',
                              background: 'var(--color-bg-white, #FFFFFF)',
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddNewToken(section.id)
                              if (e.key === 'Escape') {
                                setAddingToSection(null)
                                setNewTokenName('')
                                setNameError(null)
                              }
                            }}
                          />
                          {nameError && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '4px',
                              color: 'var(--color-fg-feedback-error, #EB4015)',
                              fontSize: 'var(--font-size-body-xs, 12px)',
                            }}>
                              <AlertCircle size={12} />
                              {nameError}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddNewToken(section.id)}
                          data-testid={`confirm-add-token-${section.id}`}
                          style={{
                            padding: '8px 16px',
                            fontSize: 'var(--font-size-body-sm, 14px)',
                            fontWeight: 'var(--font-weight-medium, 500)',
                            background: 'var(--color-btn-primary-bg, #657E79)',
                            color: 'var(--color-btn-primary-fg, #FFFFFF)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingToSection(null)
                            setNewTokenName('')
                            setNameError(null)
                          }}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-fg-caption, #616A76)',
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingToSection(section.id)}
                        data-testid={`add-token-${section.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          alignSelf: 'flex-start',
                          padding: '8px 12px',
                          marginTop: '8px',
                          fontSize: 'var(--font-size-body-sm, 14px)',
                          fontWeight: 'var(--font-weight-medium, 500)',
                          background: 'transparent',
                          color: 'var(--color-btn-primary-bg, #657E79)',
                          border: '1px dashed var(--color-btn-primary-bg, #657E79)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={16} />
                        Add Color
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Other/Ungrouped Tokens */}
      {tokensBySection.other?.length > 0 && (
        <div
          data-testid="color-section-other"
          style={{
            background: 'var(--color-bg-white, #FFFFFF)',
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            borderRadius: '12px',
            padding: '16px 20px',
          }}
        >
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}>
            Other Colors ({tokensBySection.other.length})
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {tokensBySection.other.map((token, idx) => (
              <ColorTokenCard
                key={`other-${token.name}-${idx}`}
                token={token}
                isEditing={editingToken === token}
                onEdit={() => setEditingToken(token)}
                onValueChange={(value) => handleTokenValueChange(token, value)}
                onNameChange={(name) => handleTokenNameChange(token, name)}
                onRemove={() => handleRemoveToken(token)}
                onClose={() => setEditingToken(null)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Individual color token card component
 */
function ColorTokenCard({ 
  token, 
  isEditing, 
  onEdit, 
  onValueChange, 
  onNameChange, 
  onRemove, 
  onClose 
}) {
  const colorValue = token.value?.hex || '#000000'
  
  return (
    <div
      data-testid={`color-token-${token.name}`}
      style={{
        position: 'relative',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Color Swatch */}
      <button
        onClick={onEdit}
        data-testid={`edit-color-${token.name}`}
        style={{
          width: '100%',
          height: '60px',
          background: colorValue,
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        title={`Click to edit ${token.name}`}
      />
      
      {/* Token Info */}
      <div style={{ padding: '10px 12px' }}>
        <input
          type="text"
          value={token.name}
          onChange={(e) => onNameChange(e.target.value)}
          data-testid={`token-name-${token.name}`}
          style={{
            width: '100%',
            padding: '4px 0',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-heading, #1E2125)',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid transparent',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderBottomColor = 'var(--color-btn-primary-bg, #657E79)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderBottomColor = 'transparent'
          }}
        />
        <span
          style={{
            display: 'block',
            fontSize: 'var(--font-size-body-xs, 12px)',
            fontFamily: 'ui-monospace, monospace',
            color: 'var(--color-fg-caption, #616A76)',
            marginTop: '2px',
          }}
        >
          {colorValue}
        </span>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={onRemove}
        data-testid={`remove-token-${token.name}`}
        title="Remove token"
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'var(--color-fg-caption, #616A76)',
          opacity: 0,
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = 1
          e.currentTarget.style.color = 'var(--color-fg-feedback-error, #EB4015)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = 0
          e.currentTarget.style.color = 'var(--color-fg-caption, #616A76)'
        }}
        onFocus={(e) => e.currentTarget.style.opacity = 1}
        onBlur={(e) => e.currentTarget.style.opacity = 0}
      >
        <X size={14} />
      </button>

      {/* Color Picker Popover */}
      {isEditing && (
        <>
          <div
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 100,
              marginTop: '4px',
            }}
          >
            <ColorPicker
              value={colorValue}
              onChange={onValueChange}
            />
          </div>
        </>
      )}

      {/* Hover style for remove button */}
      <style>{`
        [data-testid="color-token-${token.name}"]:hover [data-testid="remove-token-${token.name}"] {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}

export { COLOR_SECTIONS }

