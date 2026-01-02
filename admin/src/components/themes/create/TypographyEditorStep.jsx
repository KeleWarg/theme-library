import { useState, useCallback, useMemo } from 'react'
import { Plus, X, Type, AlertCircle, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
import NumberInput from '../editor/NumberInput'

/**
 * Typography preset scales
 */
const TYPOGRAPHY_PRESETS = {
  'modular-major-third': {
    name: 'Modular (Major Third)',
    description: 'Scale factor 1.25 - classic typographic ratio',
    scale: [12, 14, 16, 20, 25, 31, 39, 49],
  },
  'modular-perfect-fourth': {
    name: 'Modular (Perfect Fourth)',
    description: 'Scale factor 1.333 - balanced hierarchy',
    scale: [12, 14, 16, 21, 28, 38, 50, 67],
  },
  'linear': {
    name: 'Linear',
    description: 'Even 4px increments - predictable sizing',
    scale: [12, 14, 16, 20, 24, 32, 40, 48],
  },
  'tailwind': {
    name: 'Tailwind Default',
    description: 'Tailwind CSS default scale',
    scale: [12, 14, 16, 18, 20, 24, 30, 36],
  },
}

/**
 * Font weight options
 */
const FONT_WEIGHTS = [
  { name: 'thin', value: 100 },
  { name: 'extralight', value: 200 },
  { name: 'light', value: 300 },
  { name: 'regular', value: 400 },
  { name: 'medium', value: 500 },
  { name: 'semibold', value: 600 },
  { name: 'bold', value: 700 },
  { name: 'extrabold', value: 800 },
  { name: 'black', value: 900 },
]

/**
 * Line height options
 */
const LINE_HEIGHTS = [
  { name: 'none', value: 1 },
  { name: 'tight', value: 1.25 },
  { name: 'snug', value: 1.375 },
  { name: 'normal', value: 1.5 },
  { name: 'relaxed', value: 1.625 },
  { name: 'loose', value: 2 },
]

/**
 * Typography section definitions
 */
const TYPOGRAPHY_SECTIONS = [
  {
    id: 'font-family',
    title: 'Font Families',
    description: 'Define heading, body, and monospace fonts',
    subcategories: ['font-family', 'family'],
    defaultTokens: [
      { name: 'heading', value: { fontFamily: 'system-ui, -apple-system, sans-serif' }, css_variable: '--font-family-heading' },
      { name: 'body', value: { fontFamily: 'system-ui, -apple-system, sans-serif' }, css_variable: '--font-family-body' },
      { name: 'mono', value: { fontFamily: 'ui-monospace, SFMono-Regular, monospace' }, css_variable: '--font-family-mono' },
    ],
  },
  {
    id: 'font-size',
    title: 'Font Sizes',
    description: 'Type scale from body to display sizes',
    subcategories: ['font-size', 'size', 'text-size'],
    defaultTokens: [
      { name: 'body-xs', value: { size: '12px' }, css_variable: '--font-size-body-xs' },
      { name: 'body-sm', value: { size: '14px' }, css_variable: '--font-size-body-sm' },
      { name: 'body-md', value: { size: '16px' }, css_variable: '--font-size-body-md' },
      { name: 'body-lg', value: { size: '18px' }, css_variable: '--font-size-body-lg' },
      { name: 'title-sm', value: { size: '20px' }, css_variable: '--font-size-title-sm' },
      { name: 'title-md', value: { size: '24px' }, css_variable: '--font-size-title-md' },
      { name: 'title-lg', value: { size: '32px' }, css_variable: '--font-size-title-lg' },
      { name: 'heading-sm', value: { size: '24px' }, css_variable: '--font-size-heading-sm' },
      { name: 'heading-md', value: { size: '32px' }, css_variable: '--font-size-heading-md' },
      { name: 'heading-lg', value: { size: '48px' }, css_variable: '--font-size-heading-lg' },
      { name: 'display', value: { size: '56px' }, css_variable: '--font-size-display' },
    ],
  },
  {
    id: 'font-weight',
    title: 'Font Weights',
    description: 'Weight variants for different emphasis levels',
    subcategories: ['font-weight', 'weight'],
    defaultTokens: [
      { name: 'regular', value: { weight: 400 }, css_variable: '--font-weight-regular' },
      { name: 'medium', value: { weight: 500 }, css_variable: '--font-weight-medium' },
      { name: 'semibold', value: { weight: 600 }, css_variable: '--font-weight-semibold' },
      { name: 'bold', value: { weight: 700 }, css_variable: '--font-weight-bold' },
    ],
  },
  {
    id: 'line-height',
    title: 'Line Heights',
    description: 'Vertical rhythm and readability',
    subcategories: ['line-height', 'leading'],
    defaultTokens: [
      { name: 'tight', value: { lineHeight: 1.25 }, css_variable: '--line-height-tight' },
      { name: 'normal', value: { lineHeight: 1.5 }, css_variable: '--line-height-normal' },
      { name: 'relaxed', value: { lineHeight: 1.75 }, css_variable: '--line-height-relaxed' },
    ],
  },
]

/**
 * TypographyEditorStep - Step component for editing typography tokens during theme creation
 * 
 * @param {Object} props
 * @param {Array} props.tokens - Current typography tokens
 * @param {Function} props.onChange - Callback when tokens change
 * @param {Function} props.onAddToken - Callback to add a new token
 * @param {Function} props.onRemoveToken - Callback to remove a token
 */
export default function TypographyEditorStep({ 
  tokens = [], 
  onChange,
  onAddToken,
  onRemoveToken,
}) {
  const [expandedSections, setExpandedSections] = useState(
    TYPOGRAPHY_SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  )
  const [newTokenName, setNewTokenName] = useState('')
  const [addingToSection, setAddingToSection] = useState(null)
  const [nameError, setNameError] = useState(null)
  const [showPresetPicker, setShowPresetPicker] = useState(false)

  // Group tokens by section based on subcategory
  const tokensBySection = useMemo(() => {
    const grouped = {}
    
    TYPOGRAPHY_SECTIONS.forEach(section => {
      grouped[section.id] = tokens.filter(token => {
        const subcategory = (token.subcategory || '').toLowerCase()
        const name = (token.name || '').toLowerCase()
        return section.subcategories.some(sub => 
          subcategory.includes(sub) || name.includes(sub.replace('-', ''))
        )
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
      onChange(tokenIndex, { value: newValue })
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
      setNameError('Invalid name format')
      return
    }
    
    // Check for duplicates
    if (tokens.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setNameError('Token already exists')
      return
    }
    
    // Find section info
    const section = TYPOGRAPHY_SECTIONS.find(s => s.id === sectionId)
    const subcategory = section?.subcategories[0] || 'typography'
    
    // Create default value based on section
    let defaultValue = { size: '16px' }
    if (sectionId === 'font-family') defaultValue = { fontFamily: 'system-ui, sans-serif' }
    if (sectionId === 'font-weight') defaultValue = { weight: 400 }
    if (sectionId === 'line-height') defaultValue = { lineHeight: 1.5 }
    
    onAddToken?.('typography', subcategory, {
      name,
      value: defaultValue,
      css_variable: `--${subcategory}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    })
    
    setNewTokenName('')
    setAddingToSection(null)
    setNameError(null)
  }, [newTokenName, tokens, onAddToken])

  // Handle token removal with confirmation
  const handleRemoveToken = useCallback((token) => {
    if (window.confirm(`Remove "${token.name}"?`)) {
      const tokenIndex = tokens.findIndex(t => 
        t.name === token.name && t.subcategory === token.subcategory
      )
      if (tokenIndex !== -1) {
        onRemoveToken?.(tokenIndex)
      }
    }
  }, [tokens, onRemoveToken])

  // Apply typography preset
  const handleApplyPreset = useCallback((presetId) => {
    const preset = TYPOGRAPHY_PRESETS[presetId]
    if (!preset) return
    
    if (window.confirm(`Apply ${preset.name} scale? This will update font size tokens.`)) {
      const sizeNames = ['body-xs', 'body-sm', 'body-md', 'body-lg', 'title-sm', 'title-md', 'title-lg', 'display']
      
      // Remove existing font-size tokens
      const existingIndices = tokens
        .map((t, i) => ({ token: t, index: i }))
        .filter(({ token }) => 
          (token.subcategory || '').toLowerCase().includes('font-size') ||
          (token.subcategory || '').toLowerCase().includes('size')
        )
        .map(({ index }) => index)
        .reverse()
      
      existingIndices.forEach(i => onRemoveToken?.(i))
      
      // Add preset scale tokens
      preset.scale.forEach((size, idx) => {
        if (sizeNames[idx]) {
          onAddToken?.('typography', 'font-size', {
            name: sizeNames[idx],
            value: { size: `${size}px` },
            css_variable: `--font-size-${sizeNames[idx]}`,
          })
        }
      })
    }
    setShowPresetPicker(false)
  }, [tokens, onAddToken, onRemoveToken])

  // Apply section defaults
  const handleApplyDefaults = useCallback((section) => {
    if (window.confirm(`Apply default ${section.title.toLowerCase()}?`)) {
      // Remove existing tokens in this section
      const existingIndices = tokens
        .map((t, i) => ({ token: t, index: i }))
        .filter(({ token }) => 
          section.subcategories.some(sub => 
            (token.subcategory || '').toLowerCase().includes(sub)
          )
        )
        .map(({ index }) => index)
        .reverse()
      
      existingIndices.forEach(i => onRemoveToken?.(i))
      
      // Add default tokens
      section.defaultTokens.forEach(defaultToken => {
        onAddToken?.('typography', section.subcategories[0], defaultToken)
      })
    }
  }, [tokens, onAddToken, onRemoveToken])

  return (
    <div
      data-testid="typography-editor-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Type size={20} style={{ color: 'var(--color-btn-primary-bg, #657E79)' }} />
            <h3 style={{
              margin: 0,
              fontSize: 'var(--font-size-title-lg, 20px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}>
              Typography Tokens
            </h3>
          </div>
          
          {/* Preset Picker Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPresetPicker(!showPresetPicker)}
              data-testid="preset-picker-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: 'var(--font-size-body-sm, 14px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                color: 'var(--color-fg-body, #383C43)',
                border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <Wand2 size={16} />
              Apply Scale Preset
              <ChevronDown size={14} />
            </button>
            
            {/* Preset Dropdown */}
            {showPresetPicker && (
              <>
                <div
                  onClick={() => setShowPresetPicker(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                />
                <div
                  data-testid="preset-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    width: '280px',
                    background: 'var(--color-bg-white, #FFFFFF)',
                    border: '1px solid var(--color-fg-divider, #D7DCE5)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {Object.entries(TYPOGRAPHY_PRESETS).map(([id, preset]) => (
                    <button
                      key={id}
                      onClick={() => handleApplyPreset(id)}
                      data-testid={`preset-${id}`}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div style={{
                        fontSize: 'var(--font-size-body-sm, 14px)',
                        fontWeight: 'var(--font-weight-medium, 500)',
                        color: 'var(--color-fg-heading, #1E2125)',
                        marginBottom: '2px',
                      }}>
                        {preset.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-body-xs, 12px)',
                        color: 'var(--color-fg-caption, #616A76)',
                      }}>
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-body-md, 16px)',
          color: 'var(--color-fg-caption, #616A76)',
          lineHeight: 1.5,
        }}>
          Configure typography tokens for fonts, sizes, weights, and line heights.
        </p>
      </div>

      {/* Typography Sections */}
      {TYPOGRAPHY_SECTIONS.map((section) => {
        const sectionTokens = tokensBySection[section.id] || []
        const isExpanded = expandedSections[section.id]

        return (
          <div
            key={section.id}
            data-testid={`typography-section-${section.id}`}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Token List */}
                    {sectionTokens.map((token, idx) => (
                      <TypographyTokenRow
                        key={`${token.subcategory}-${token.name}-${idx}`}
                        token={token}
                        sectionId={section.id}
                        onValueChange={(value) => handleTokenValueChange(token, value)}
                        onRemove={() => handleRemoveToken(token)}
                      />
                    ))}

                    {/* Add Token */}
                    {addingToSection === section.id ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '12px',
                          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
                          borderRadius: '8px',
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
                            placeholder="Token name"
                            data-testid={`new-token-name-${section.id}`}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: 'var(--font-size-body-sm, 14px)',
                              border: `1px solid ${nameError ? 'var(--color-fg-feedback-error, #EB4015)' : 'var(--color-fg-stroke-default, #BFC7D4)'}`,
                              borderRadius: '6px',
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
                        Add Token
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Live Preview */}
      <div
        data-testid="typography-preview"
        style={{
          padding: '20px',
          background: 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '12px',
        }}
      >
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-body-md, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          Live Preview
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tokensBySection['font-size']?.slice(0, 6).map((token, idx) => {
            const size = token.value?.size || '16px'
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <span style={{
                  width: '80px',
                  fontSize: 'var(--font-size-body-xs, 12px)',
                  color: 'var(--color-fg-caption, #616A76)',
                  fontFamily: 'monospace',
                }}>
                  {token.name}
                </span>
                <span style={{
                  fontSize: size,
                  color: 'var(--color-fg-heading, #1E2125)',
                  lineHeight: 1.2,
                }}>
                  The quick brown fox
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Individual typography token row component
 */
function TypographyTokenRow({ token, sectionId, onValueChange, onRemove }) {
  const renderValueEditor = () => {
    switch (sectionId) {
      case 'font-family':
        return (
          <input
            type="text"
            value={token.value?.fontFamily || ''}
            onChange={(e) => onValueChange({ fontFamily: e.target.value })}
            data-testid={`font-family-input-${token.name}`}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontFamily: 'monospace',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: '6px',
              background: 'var(--color-bg-white, #FFFFFF)',
            }}
          />
        )
      
      case 'font-size':
        return (
          <NumberInput
            value={parseSizeValue(token.value?.size)}
            onChange={(v) => onValueChange({ size: `${v.value}${v.unit}` })}
            allowedUnits={['px', 'rem', 'em']}
            min={0}
            step={1}
          />
        )
      
      case 'font-weight':
        return (
          <select
            value={token.value?.weight || 400}
            onChange={(e) => onValueChange({ weight: parseInt(e.target.value) })}
            data-testid={`font-weight-select-${token.name}`}
            style={{
              padding: '8px 12px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: '6px',
              background: 'var(--color-bg-white, #FFFFFF)',
              minWidth: '140px',
            }}
          >
            {FONT_WEIGHTS.map(w => (
              <option key={w.value} value={w.value}>
                {w.name} ({w.value})
              </option>
            ))}
          </select>
        )
      
      case 'line-height':
        return (
          <NumberInput
            value={{ value: token.value?.lineHeight || 1.5, unit: '' }}
            onChange={(v) => onValueChange({ lineHeight: v.value })}
            allowedUnits={[]}
            min={0.5}
            max={3}
            step={0.125}
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={JSON.stringify(token.value)}
            onChange={(e) => {
              try {
                onValueChange(JSON.parse(e.target.value))
              } catch {
                // Invalid JSON, ignore
              }
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: '6px',
            }}
          />
        )
    }
  }

  return (
    <div
      data-testid={`typography-token-${token.name}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        borderRadius: '8px',
      }}
    >
      {/* Token Name */}
      <div style={{ minWidth: '120px' }}>
        <span style={{
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-medium, 500)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          {token.name}
        </span>
        <span style={{
          display: 'block',
          fontSize: 'var(--font-size-body-xs, 12px)',
          fontFamily: 'monospace',
          color: 'var(--color-fg-caption, #616A76)',
          marginTop: '2px',
        }}>
          {token.css_variable}
        </span>
      </div>

      {/* Value Editor */}
      <div style={{ flex: 1 }}>
        {renderValueEditor()}
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        data-testid={`remove-token-${token.name}`}
        title="Remove token"
        style={{
          padding: '6px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-fg-caption, #616A76)',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-fg-feedback-error, #EB4015)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-fg-caption, #616A76)'
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

/**
 * Parse size value string to { value, unit } object
 */
function parseSizeValue(size) {
  if (!size) return { value: 16, unit: 'px' }
  
  const match = String(size).match(/^(-?\d+\.?\d*)(px|rem|em|%)?$/)
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] || 'px'
    }
  }
  
  return { value: 16, unit: 'px' }
}

export { TYPOGRAPHY_SECTIONS, TYPOGRAPHY_PRESETS, FONT_WEIGHTS, LINE_HEIGHTS }

