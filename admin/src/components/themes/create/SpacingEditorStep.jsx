import { useState, useCallback, useMemo } from 'react'
import { Plus, X, Ruler, AlertCircle, ChevronDown, ChevronUp, Wand2, Grid3X3 } from 'lucide-react'
import NumberInput from '../editor/NumberInput'
import ShadowEditor from '../editor/ShadowEditor'

/**
 * Spacing scale presets
 */
const SPACING_PRESETS = {
  '4px-base': {
    name: '4px Base Unit',
    description: '4px base with consistent multipliers',
    baseUnit: 4,
    scale: {
      'xs': 4,
      'sm': 8,
      'md': 16,
      'lg': 24,
      'xl': 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 96,
    },
  },
  '8px-base': {
    name: '8px Base Unit',
    description: '8px base for larger layouts',
    baseUnit: 8,
    scale: {
      'xs': 4,
      'sm': 8,
      'md': 16,
      'lg': 24,
      'xl': 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 96,
    },
  },
  'tailwind': {
    name: 'Tailwind Default',
    description: 'Tailwind CSS spacing scale',
    baseUnit: 4,
    scale: {
      '0': 0,
      'px': 1,
      '0.5': 2,
      '1': 4,
      '2': 8,
      '3': 12,
      '4': 16,
      '5': 20,
      '6': 24,
      '8': 32,
      '10': 40,
      '12': 48,
      '16': 64,
    },
  },
}

/**
 * Border radius presets
 */
const RADIUS_PRESETS = {
  'rounded': {
    name: 'Rounded',
    description: 'Soft, rounded corners',
    scale: {
      'none': 0,
      'sm': 4,
      'md': 8,
      'lg': 12,
      'xl': 16,
      '2xl': 24,
      'full': 9999,
    },
  },
  'sharp': {
    name: 'Sharp',
    description: 'Minimal rounding',
    scale: {
      'none': 0,
      'sm': 2,
      'md': 4,
      'lg': 6,
      'xl': 8,
      '2xl': 12,
      'full': 9999,
    },
  },
  'pill': {
    name: 'Pill Style',
    description: 'Larger radius for pill shapes',
    scale: {
      'none': 0,
      'sm': 8,
      'md': 16,
      'lg': 24,
      'xl': 32,
      '2xl': 48,
      'full': 9999,
    },
  },
}

/**
 * Spacing section definitions
 */
const SPACING_SECTIONS = [
  {
    id: 'spacing-scale',
    title: 'Spacing Scale',
    description: 'Margin and padding values',
    subcategories: ['spacing', 'space', 'gap', 'scale'],
    defaultTokens: [
      { name: 'xs', value: { size: '4px' }, css_variable: '--spacing-xs' },
      { name: 'sm', value: { size: '8px' }, css_variable: '--spacing-sm' },
      { name: 'md', value: { size: '16px' }, css_variable: '--spacing-md' },
      { name: 'lg', value: { size: '24px' }, css_variable: '--spacing-lg' },
      { name: 'xl', value: { size: '32px' }, css_variable: '--spacing-xl' },
      { name: '2xl', value: { size: '48px' }, css_variable: '--spacing-2xl' },
    ],
  },
  {
    id: 'border-radius',
    title: 'Border Radius',
    description: 'Corner rounding values',
    subcategories: ['radius', 'corner', 'border-radius', 'rounded'],
    defaultTokens: [
      { name: 'none', value: { size: '0px' }, css_variable: '--radius-none' },
      { name: 'sm', value: { size: '4px' }, css_variable: '--radius-sm' },
      { name: 'md', value: { size: '8px' }, css_variable: '--radius-md' },
      { name: 'lg', value: { size: '12px' }, css_variable: '--radius-lg' },
      { name: 'xl', value: { size: '16px' }, css_variable: '--radius-xl' },
      { name: 'full', value: { size: '9999px' }, css_variable: '--radius-full' },
    ],
  },
  {
    id: 'shadow',
    title: 'Shadow Definitions',
    description: 'Elevation and depth effects',
    subcategories: ['shadow', 'elevation', 'drop-shadow'],
    defaultTokens: [
      { name: 'sm', value: { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)', inset: false }, css_variable: '--shadow-sm' },
      { name: 'md', value: { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', inset: false }, css_variable: '--shadow-md' },
      { name: 'lg', value: { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)', inset: false }, css_variable: '--shadow-lg' },
      { name: 'xl', value: { x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)', inset: false }, css_variable: '--shadow-xl' },
    ],
  },
]

/**
 * SpacingEditorStep - Step component for editing spacing tokens during theme creation
 * 
 * @param {Object} props
 * @param {Array} props.tokens - Current spacing tokens
 * @param {Function} props.onChange - Callback when tokens change
 * @param {Function} props.onAddToken - Callback to add a new token
 * @param {Function} props.onRemoveToken - Callback to remove a token
 */
export default function SpacingEditorStep({ 
  tokens = [], 
  onChange,
  onAddToken,
  onRemoveToken,
}) {
  const [expandedSections, setExpandedSections] = useState(
    SPACING_SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  )
  const [newTokenName, setNewTokenName] = useState('')
  const [addingToSection, setAddingToSection] = useState(null)
  const [nameError, setNameError] = useState(null)
  const [showSpacingPresets, setShowSpacingPresets] = useState(false)
  const [showRadiusPresets, setShowRadiusPresets] = useState(false)
  const [editingShadow, setEditingShadow] = useState(null)

  // Group tokens by section based on subcategory
  const tokensBySection = useMemo(() => {
    const grouped = {}
    
    SPACING_SECTIONS.forEach(section => {
      grouped[section.id] = tokens.filter(token => {
        const subcategory = (token.subcategory || '').toLowerCase()
        const name = (token.name || '').toLowerCase()
        const cssVar = (token.css_variable || '').toLowerCase()
        return section.subcategories.some(sub => 
          subcategory.includes(sub) || 
          cssVar.includes(sub)
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
    
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]*$/.test(name)) {
      setNameError('Invalid name format')
      return
    }
    
    // Check for duplicates
    if (tokens.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setNameError('Token already exists')
      return
    }
    
    // Find section info
    const section = SPACING_SECTIONS.find(s => s.id === sectionId)
    const subcategory = section?.subcategories[0] || 'spacing'
    
    // Create default value based on section
    let defaultValue = { size: '16px' }
    if (sectionId === 'shadow') {
      defaultValue = { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false }
    }
    
    onAddToken?.('spacing', subcategory, {
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

  // Apply spacing preset
  const handleApplySpacingPreset = useCallback((presetId) => {
    const preset = SPACING_PRESETS[presetId]
    if (!preset) return
    
    if (window.confirm(`Apply ${preset.name}? This will replace spacing scale tokens.`)) {
      // Remove existing spacing tokens
      const existingIndices = tokens
        .map((t, i) => ({ token: t, index: i }))
        .filter(({ token }) => 
          (token.subcategory || '').toLowerCase().includes('spacing') ||
          (token.subcategory || '').toLowerCase().includes('scale') ||
          (token.css_variable || '').toLowerCase().includes('spacing')
        )
        .map(({ index }) => index)
        .reverse()
      
      existingIndices.forEach(i => onRemoveToken?.(i))
      
      // Add preset tokens
      Object.entries(preset.scale).forEach(([name, size]) => {
        onAddToken?.('spacing', 'spacing', {
          name,
          value: { size: `${size}px` },
          css_variable: `--spacing-${name}`,
        })
      })
    }
    setShowSpacingPresets(false)
  }, [tokens, onAddToken, onRemoveToken])

  // Apply radius preset
  const handleApplyRadiusPreset = useCallback((presetId) => {
    const preset = RADIUS_PRESETS[presetId]
    if (!preset) return
    
    if (window.confirm(`Apply ${preset.name}? This will replace border radius tokens.`)) {
      // Remove existing radius tokens
      const existingIndices = tokens
        .map((t, i) => ({ token: t, index: i }))
        .filter(({ token }) => 
          (token.subcategory || '').toLowerCase().includes('radius') ||
          (token.css_variable || '').toLowerCase().includes('radius')
        )
        .map(({ index }) => index)
        .reverse()
      
      existingIndices.forEach(i => onRemoveToken?.(i))
      
      // Add preset tokens
      Object.entries(preset.scale).forEach(([name, size]) => {
        onAddToken?.('spacing', 'radius', {
          name,
          value: { size: `${size}px` },
          css_variable: `--radius-${name}`,
        })
      })
    }
    setShowRadiusPresets(false)
  }, [tokens, onAddToken, onRemoveToken])

  // Apply section defaults
  const handleApplyDefaults = useCallback((section) => {
    if (window.confirm(`Apply default ${section.title.toLowerCase()}?`)) {
      // Remove existing tokens in this section
      const existingIndices = tokens
        .map((t, i) => ({ token: t, index: i }))
        .filter(({ token }) => 
          section.subcategories.some(sub => 
            (token.subcategory || '').toLowerCase().includes(sub) ||
            (token.css_variable || '').toLowerCase().includes(sub)
          )
        )
        .map(({ index }) => index)
        .reverse()
      
      existingIndices.forEach(i => onRemoveToken?.(i))
      
      // Add default tokens
      section.defaultTokens.forEach(defaultToken => {
        onAddToken?.('spacing', section.subcategories[0], defaultToken)
      })
    }
  }, [tokens, onAddToken, onRemoveToken])

  return (
    <div
      data-testid="spacing-editor-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Ruler size={20} style={{ color: 'var(--color-btn-primary-bg, #657E79)' }} />
          <h3 style={{
            margin: 0,
            fontSize: 'var(--font-size-title-lg, 20px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}>
            Spacing & Layout Tokens
          </h3>
        </div>
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-body-md, 16px)',
          color: 'var(--color-fg-caption, #616A76)',
          lineHeight: 1.5,
        }}>
          Define spacing scale, border radius, and shadow values for consistent layouts.
        </p>
      </div>

      {/* Spacing Scale Section */}
      <SpacingSection
        section={SPACING_SECTIONS[0]}
        sectionTokens={tokensBySection['spacing-scale'] || []}
        isExpanded={expandedSections['spacing-scale']}
        onToggle={() => toggleSection('spacing-scale')}
        onTokenValueChange={handleTokenValueChange}
        onRemoveToken={handleRemoveToken}
        onApplyDefaults={handleApplyDefaults}
        addingToSection={addingToSection}
        setAddingToSection={setAddingToSection}
        newTokenName={newTokenName}
        setNewTokenName={setNewTokenName}
        nameError={nameError}
        setNameError={setNameError}
        onAddNewToken={handleAddNewToken}
        presetButton={
          <PresetDropdown
            label="Scale Preset"
            presets={SPACING_PRESETS}
            isOpen={showSpacingPresets}
            onToggle={() => setShowSpacingPresets(!showSpacingPresets)}
            onSelect={handleApplySpacingPreset}
            onClose={() => setShowSpacingPresets(false)}
          />
        }
      />

      {/* Border Radius Section */}
      <SpacingSection
        section={SPACING_SECTIONS[1]}
        sectionTokens={tokensBySection['border-radius'] || []}
        isExpanded={expandedSections['border-radius']}
        onToggle={() => toggleSection('border-radius')}
        onTokenValueChange={handleTokenValueChange}
        onRemoveToken={handleRemoveToken}
        onApplyDefaults={handleApplyDefaults}
        addingToSection={addingToSection}
        setAddingToSection={setAddingToSection}
        newTokenName={newTokenName}
        setNewTokenName={setNewTokenName}
        nameError={nameError}
        setNameError={setNameError}
        onAddNewToken={handleAddNewToken}
        presetButton={
          <PresetDropdown
            label="Radius Preset"
            presets={RADIUS_PRESETS}
            isOpen={showRadiusPresets}
            onToggle={() => setShowRadiusPresets(!showRadiusPresets)}
            onSelect={handleApplyRadiusPreset}
            onClose={() => setShowRadiusPresets(false)}
          />
        }
      />

      {/* Shadow Section */}
      <div
        data-testid="spacing-section-shadow"
        style={{
          background: 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Section Header */}
        <button
          onClick={() => toggleSection('shadow')}
          data-testid="toggle-section-shadow"
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
              Shadow Definitions
              <span style={{
                marginLeft: '8px',
                fontSize: 'var(--font-size-body-sm, 14px)',
                fontWeight: 'var(--font-weight-regular, 400)',
                color: 'var(--color-fg-caption, #616A76)',
              }}>
                ({(tokensBySection['shadow'] || []).length})
              </span>
            </h4>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-caption, #616A76)',
            }}>
              Elevation and depth effects
            </p>
          </div>
          {expandedSections['shadow'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* Section Content */}
        {expandedSections['shadow'] && (
          <div style={{ padding: '16px 20px' }}>
            {(tokensBySection['shadow'] || []).length === 0 ? (
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
                  No shadows defined yet.
                </p>
                <button
                  onClick={() => handleApplyDefaults(SPACING_SECTIONS[2])}
                  data-testid="apply-defaults-shadow"
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
                {/* Shadow Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {(tokensBySection['shadow'] || []).map((token, idx) => (
                    <ShadowTokenCard
                      key={`${token.subcategory}-${token.name}-${idx}`}
                      token={token}
                      isEditing={editingShadow === token}
                      onEdit={() => setEditingShadow(token)}
                      onValueChange={(value) => handleTokenValueChange(token, value)}
                      onRemove={() => handleRemoveToken(token)}
                      onClose={() => setEditingShadow(null)}
                    />
                  ))}
                </div>

                {/* Add Shadow Button */}
                {addingToSection === 'shadow' ? (
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
                        placeholder="Shadow name (e.g., 2xl)"
                        data-testid="new-token-name-shadow"
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: 'var(--font-size-body-sm, 14px)',
                          border: `1px solid ${nameError ? 'var(--color-fg-feedback-error, #EB4015)' : 'var(--color-fg-stroke-default, #BFC7D4)'}`,
                          borderRadius: '6px',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNewToken('shadow')
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
                      onClick={() => handleAddNewToken('shadow')}
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
                    onClick={() => setAddingToSection('shadow')}
                    data-testid="add-token-shadow"
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
                    Add Shadow
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Preview */}
      <div
        data-testid="spacing-preview"
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
          Visual Preview
        </h4>
        
        {/* Spacing Scale Preview */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-caption, #616A76)',
          }}>
            Spacing Scale
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
            {(tokensBySection['spacing-scale'] || []).slice(0, 8).map((token, idx) => {
              const size = parseInt(token.value?.size) || 16
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: `${Math.max(size, 4)}px`,
                      height: '32px',
                      background: 'var(--color-btn-primary-bg, #657E79)',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: 'var(--font-size-body-xs, 12px)',
                    color: 'var(--color-fg-caption, #616A76)',
                  }}>
                    {token.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Border Radius Preview */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-caption, #616A76)',
          }}>
            Border Radius
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {(tokensBySection['border-radius'] || []).slice(0, 6).map((token, idx) => {
              const radius = token.value?.size || '0px'
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--color-bg-neutral-light, #ECEFF3)',
                      border: '2px solid var(--color-btn-primary-bg, #657E79)',
                      borderRadius: radius,
                    }}
                  />
                  <span style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: 'var(--font-size-body-xs, 12px)',
                    color: 'var(--color-fg-caption, #616A76)',
                  }}>
                    {token.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shadow Preview */}
        <div>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-caption, #616A76)',
          }}>
            Shadows
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {(tokensBySection['shadow'] || []).slice(0, 4).map((token, idx) => {
              const shadow = token.value || {}
              const shadowCss = `${shadow.x || 0}px ${shadow.y || 4}px ${shadow.blur || 8}px ${shadow.spread || 0}px ${shadow.color || 'rgba(0,0,0,0.1)'}`
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--color-bg-white, #FFFFFF)',
                      borderRadius: '8px',
                      boxShadow: shadowCss,
                    }}
                  />
                  <span style={{
                    display: 'block',
                    marginTop: '8px',
                    fontSize: 'var(--font-size-body-xs, 12px)',
                    color: 'var(--color-fg-caption, #616A76)',
                  }}>
                    {token.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Reusable spacing section component
 */
function SpacingSection({
  section,
  sectionTokens,
  isExpanded,
  onToggle,
  onTokenValueChange,
  onRemoveToken,
  onApplyDefaults,
  addingToSection,
  setAddingToSection,
  newTokenName,
  setNewTokenName,
  nameError,
  setNameError,
  onAddNewToken,
  presetButton,
}) {
  return (
    <div
      data-testid={`spacing-section-${section.id}`}
      style={{
        background: 'var(--color-bg-white, #FFFFFF)',
        border: '1px solid var(--color-fg-divider, #D7DCE5)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        }}
      >
        <button
          onClick={onToggle}
          data-testid={`toggle-section-${section.id}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
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
        {isExpanded && presetButton && (
          <div style={{ marginLeft: '16px' }}>
            {presetButton}
          </div>
        )}
      </div>

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
                onClick={() => onApplyDefaults(section)}
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
                <SpacingTokenRow
                  key={`${token.subcategory}-${token.name}-${idx}`}
                  token={token}
                  onValueChange={(value) => onTokenValueChange(token, value)}
                  onRemove={() => onRemoveToken(token)}
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
                        if (e.key === 'Enter') onAddNewToken(section.id)
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
                    onClick={() => onAddNewToken(section.id)}
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
}

/**
 * Individual spacing token row component
 */
function SpacingTokenRow({ token, onValueChange, onRemove }) {
  return (
    <div
      data-testid={`spacing-token-${token.name}`}
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
      <div style={{ minWidth: '100px' }}>
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
        <NumberInput
          value={parseSizeValue(token.value?.size)}
          onChange={(v) => onValueChange({ size: `${v.value}${v.unit}` })}
          allowedUnits={['px', 'rem', 'em', '%']}
          min={0}
          step={1}
        />
      </div>

      {/* Preview */}
      <div
        style={{
          width: '32px',
          height: '32px',
          background: 'var(--color-btn-primary-bg, #657E79)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid3X3 size={16} style={{ color: 'white' }} />
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
 * Shadow token card component
 */
function ShadowTokenCard({ token, isEditing, onEdit, onValueChange, onRemove, onClose }) {
  const shadow = token.value || {}
  const shadowCss = `${shadow.x || 0}px ${shadow.y || 4}px ${shadow.blur || 8}px ${shadow.spread || 0}px ${shadow.color || 'rgba(0,0,0,0.1)'}`

  return (
    <div
      data-testid={`shadow-token-${token.name}`}
      style={{
        position: 'relative',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        borderRadius: '8px',
        overflow: 'visible',
      }}
    >
      {/* Shadow Preview */}
      <button
        onClick={onEdit}
        data-testid={`edit-shadow-${token.name}`}
        style={{
          width: '100%',
          padding: '20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'var(--color-bg-white, #FFFFFF)',
            borderRadius: '8px',
            boxShadow: shadowCss,
          }}
        />
      </button>

      {/* Token Info */}
      <div style={{ padding: '0 12px 12px' }}>
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

      {/* Remove Button */}
      <button
        onClick={onRemove}
        data-testid={`remove-token-${token.name}`}
        title="Remove shadow"
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
      >
        <X size={14} />
      </button>

      {/* Shadow Editor Popover */}
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
            <ShadowEditor
              value={shadow}
              onChange={onValueChange}
            />
          </div>
        </>
      )}

      {/* Hover style */}
      <style>{`
        [data-testid="shadow-token-${token.name}"]:hover [data-testid="remove-token-${token.name}"] {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}

/**
 * Preset dropdown component
 */
function PresetDropdown({ label, presets, isOpen, onToggle, onSelect, onClose }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        data-testid={`preset-toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          fontSize: 'var(--font-size-body-xs, 12px)',
          fontWeight: 'var(--font-weight-medium, 500)',
          background: 'var(--color-bg-white, #FFFFFF)',
          color: 'var(--color-fg-body, #383C43)',
          border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        <Wand2 size={14} />
        {label}
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <>
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div
            data-testid={`preset-dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              width: '240px',
              background: 'var(--color-bg-white, #FFFFFF)',
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            {Object.entries(presets).map(([id, preset]) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                data-testid={`preset-option-${id}`}
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
  )
}

/**
 * Parse size value string to { value, unit } object
 */
function parseSizeValue(size) {
  if (!size) return { value: 0, unit: 'px' }
  
  const match = String(size).match(/^(-?\d+\.?\d*)(px|rem|em|%)?$/)
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] || 'px'
    }
  }
  
  return { value: 0, unit: 'px' }
}

export { SPACING_SECTIONS, SPACING_PRESETS, RADIUS_PRESETS }

