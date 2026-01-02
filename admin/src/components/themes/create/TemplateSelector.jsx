import { useState, useEffect, useCallback } from 'react'
import { Loader, Copy, Sun, Moon, FileText } from 'lucide-react'
import { getThemes, getThemeById } from '../../../lib/themeService'

/**
 * Template presets with initial token values
 */
const TEMPLATE_PRESETS = {
  blank: {
    id: 'blank',
    name: 'Blank',
    description: 'Start with no pre-populated tokens',
    icon: FileText,
    tokens: [],
  },
  light: {
    id: 'light',
    name: 'Light Mode',
    description: 'Standard light theme with neutral backgrounds',
    icon: Sun,
    tokens: [
      // Colors - Background
      { category: 'color', subcategory: 'background', name: 'white', value: { hex: '#FFFFFF' }, css_variable: '--color-bg-white' },
      { category: 'color', subcategory: 'background', name: 'neutral-subtle', value: { hex: '#F4F5F8' }, css_variable: '--color-bg-neutral-subtle' },
      { category: 'color', subcategory: 'background', name: 'neutral-light', value: { hex: '#ECEFF3' }, css_variable: '--color-bg-neutral-light' },
      { category: 'color', subcategory: 'background', name: 'neutral', value: { hex: '#E3E7ED' }, css_variable: '--color-bg-neutral' },
      { category: 'color', subcategory: 'background', name: 'brand', value: { hex: '#657E79' }, css_variable: '--color-bg-brand' },
      // Colors - Foreground
      { category: 'color', subcategory: 'foreground', name: 'heading', value: { hex: '#1E2125' }, css_variable: '--color-fg-heading' },
      { category: 'color', subcategory: 'foreground', name: 'body', value: { hex: '#383C43' }, css_variable: '--color-fg-body' },
      { category: 'color', subcategory: 'foreground', name: 'caption', value: { hex: '#616A76' }, css_variable: '--color-fg-caption' },
      { category: 'color', subcategory: 'foreground', name: 'link', value: { hex: '#657E79' }, css_variable: '--color-fg-link' },
      { category: 'color', subcategory: 'foreground', name: 'divider', value: { hex: '#D7DCE5' }, css_variable: '--color-fg-divider' },
      // Colors - Button Primary
      { category: 'color', subcategory: 'button', name: 'primary-bg', value: { hex: '#657E79' }, css_variable: '--color-btn-primary-bg' },
      { category: 'color', subcategory: 'button', name: 'primary-text', value: { hex: '#FFFFFF' }, css_variable: '--color-btn-primary-text' },
      { category: 'color', subcategory: 'button', name: 'primary-hover-bg', value: { hex: '#46635D' }, css_variable: '--color-btn-primary-hover-bg' },
      // Colors - Feedback
      { category: 'color', subcategory: 'feedback', name: 'error', value: { hex: '#EB4015' }, css_variable: '--color-fg-feedback-error' },
      { category: 'color', subcategory: 'feedback', name: 'warning', value: { hex: '#FFB136' }, css_variable: '--color-fg-feedback-warning' },
      { category: 'color', subcategory: 'feedback', name: 'success', value: { hex: '#0C7663' }, css_variable: '--color-fg-feedback-success' },
      // Typography
      { category: 'typography', subcategory: 'font-size', name: 'display', value: { size: '56px' }, css_variable: '--font-size-display' },
      { category: 'typography', subcategory: 'font-size', name: 'heading-lg', value: { size: '48px' }, css_variable: '--font-size-heading-lg' },
      { category: 'typography', subcategory: 'font-size', name: 'heading-md', value: { size: '32px' }, css_variable: '--font-size-heading-md' },
      { category: 'typography', subcategory: 'font-size', name: 'heading-sm', value: { size: '24px' }, css_variable: '--font-size-heading-sm' },
      { category: 'typography', subcategory: 'font-size', name: 'body-lg', value: { size: '18px' }, css_variable: '--font-size-body-lg' },
      { category: 'typography', subcategory: 'font-size', name: 'body-md', value: { size: '16px' }, css_variable: '--font-size-body-md' },
      { category: 'typography', subcategory: 'font-size', name: 'body-sm', value: { size: '14px' }, css_variable: '--font-size-body-sm' },
      // Spacing
      { category: 'spacing', subcategory: 'scale', name: 'xs', value: { size: '4px' }, css_variable: '--spacing-xs' },
      { category: 'spacing', subcategory: 'scale', name: 'sm', value: { size: '8px' }, css_variable: '--spacing-sm' },
      { category: 'spacing', subcategory: 'scale', name: 'md', value: { size: '16px' }, css_variable: '--spacing-md' },
      { category: 'spacing', subcategory: 'scale', name: 'lg', value: { size: '24px' }, css_variable: '--spacing-lg' },
      { category: 'spacing', subcategory: 'scale', name: 'xl', value: { size: '32px' }, css_variable: '--spacing-xl' },
      { category: 'spacing', subcategory: 'scale', name: '2xl', value: { size: '48px' }, css_variable: '--spacing-2xl' },
    ],
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark backgrounds with light text',
    icon: Moon,
    tokens: [
      // Colors - Background (inverted)
      { category: 'color', subcategory: 'background', name: 'white', value: { hex: '#1E2125' }, css_variable: '--color-bg-white' },
      { category: 'color', subcategory: 'background', name: 'neutral-subtle', value: { hex: '#2B2E34' }, css_variable: '--color-bg-neutral-subtle' },
      { category: 'color', subcategory: 'background', name: 'neutral-light', value: { hex: '#383C43' }, css_variable: '--color-bg-neutral-light' },
      { category: 'color', subcategory: 'background', name: 'neutral', value: { hex: '#4A4F56' }, css_variable: '--color-bg-neutral' },
      { category: 'color', subcategory: 'background', name: 'brand', value: { hex: '#9CB8B2' }, css_variable: '--color-bg-brand' },
      // Colors - Foreground (inverted)
      { category: 'color', subcategory: 'foreground', name: 'heading', value: { hex: '#FFFFFF' }, css_variable: '--color-fg-heading' },
      { category: 'color', subcategory: 'foreground', name: 'body', value: { hex: '#F4F5F8' }, css_variable: '--color-fg-body' },
      { category: 'color', subcategory: 'foreground', name: 'caption', value: { hex: '#D7DCE5' }, css_variable: '--color-fg-caption' },
      { category: 'color', subcategory: 'foreground', name: 'link', value: { hex: '#9CB8B2' }, css_variable: '--color-fg-link' },
      { category: 'color', subcategory: 'foreground', name: 'divider', value: { hex: '#4A4F56' }, css_variable: '--color-fg-divider' },
      // Colors - Button Primary
      { category: 'color', subcategory: 'button', name: 'primary-bg', value: { hex: '#9CB8B2' }, css_variable: '--color-btn-primary-bg' },
      { category: 'color', subcategory: 'button', name: 'primary-text', value: { hex: '#1E2125' }, css_variable: '--color-btn-primary-text' },
      { category: 'color', subcategory: 'button', name: 'primary-hover-bg', value: { hex: '#D1E5E1' }, css_variable: '--color-btn-primary-hover-bg' },
      // Colors - Feedback (slightly adjusted for dark)
      { category: 'color', subcategory: 'feedback', name: 'error', value: { hex: '#FF6B4A' }, css_variable: '--color-fg-feedback-error' },
      { category: 'color', subcategory: 'feedback', name: 'warning', value: { hex: '#FFC85C' }, css_variable: '--color-fg-feedback-warning' },
      { category: 'color', subcategory: 'feedback', name: 'success', value: { hex: '#2EAE94' }, css_variable: '--color-fg-feedback-success' },
      // Typography (same as light)
      { category: 'typography', subcategory: 'font-size', name: 'display', value: { size: '56px' }, css_variable: '--font-size-display' },
      { category: 'typography', subcategory: 'font-size', name: 'heading-lg', value: { size: '48px' }, css_variable: '--font-size-heading-lg' },
      { category: 'typography', subcategory: 'font-size', name: 'heading-md', value: { size: '32px' }, css_variable: '--font-size-heading-md' },
      { category: 'typography', subcategory: 'font-size', name: 'heading-sm', value: { size: '24px' }, css_variable: '--font-size-heading-sm' },
      { category: 'typography', subcategory: 'font-size', name: 'body-lg', value: { size: '18px' }, css_variable: '--font-size-body-lg' },
      { category: 'typography', subcategory: 'font-size', name: 'body-md', value: { size: '16px' }, css_variable: '--font-size-body-md' },
      { category: 'typography', subcategory: 'font-size', name: 'body-sm', value: { size: '14px' }, css_variable: '--font-size-body-sm' },
      // Spacing (same as light)
      { category: 'spacing', subcategory: 'scale', name: 'xs', value: { size: '4px' }, css_variable: '--spacing-xs' },
      { category: 'spacing', subcategory: 'scale', name: 'sm', value: { size: '8px' }, css_variable: '--spacing-sm' },
      { category: 'spacing', subcategory: 'scale', name: 'md', value: { size: '16px' }, css_variable: '--spacing-md' },
      { category: 'spacing', subcategory: 'scale', name: 'lg', value: { size: '24px' }, css_variable: '--spacing-lg' },
      { category: 'spacing', subcategory: 'scale', name: 'xl', value: { size: '32px' }, css_variable: '--spacing-xl' },
      { category: 'spacing', subcategory: 'scale', name: '2xl', value: { size: '48px' }, css_variable: '--spacing-2xl' },
    ],
  },
  duplicate: {
    id: 'duplicate',
    name: 'Duplicate Existing',
    description: 'Copy tokens from an existing theme',
    icon: Copy,
    tokens: [], // Will be loaded from selected theme
  },
}

/**
 * TemplateSelector - Select template for new theme creation
 * 
 * @param {Object} props
 * @param {string} props.selectedTemplate - Currently selected template ID
 * @param {Function} props.onSelect - Callback when template is selected
 * @param {string} props.sourceThemeId - ID of theme to duplicate (for duplicate template)
 * @param {Function} props.onSourceThemeChange - Callback when source theme changes
 * @param {Array} props.tokens - Current tokens (output from template)
 * @param {Function} props.onTokensChange - Callback when tokens change
 */
export default function TemplateSelector({ 
  selectedTemplate, 
  onSelect, 
  sourceThemeId,
  onSourceThemeChange,
  onTokensChange,
}) {
  const [existingThemes, setExistingThemes] = useState([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const [loadingSourceTheme, setLoadingSourceTheme] = useState(false)
  const [error, setError] = useState(null)

  // Load existing themes for duplicate option
  useEffect(() => {
    const loadThemes = async () => {
      setLoadingThemes(true)
      try {
        const themes = await getThemes()
        setExistingThemes(themes)
      } catch (err) {
        console.error('Failed to load themes:', err)
        // Non-critical error, continue without themes
      } finally {
        setLoadingThemes(false)
      }
    }
    loadThemes()
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId) => {
    onSelect(templateId)
    
    // Clear source theme if not duplicate
    if (templateId !== 'duplicate' && onSourceThemeChange) {
      onSourceThemeChange(null)
    }
    
    // Set initial tokens based on template
    if (templateId !== 'duplicate') {
      const template = TEMPLATE_PRESETS[templateId]
      if (template && onTokensChange) {
        onTokensChange([...template.tokens])
      }
    }
  }, [onSelect, onSourceThemeChange, onTokensChange])

  // Load source theme tokens when duplicate is selected
  useEffect(() => {
    const loadSourceTheme = async () => {
      if (selectedTemplate !== 'duplicate' || !sourceThemeId) {
        return
      }

      setLoadingSourceTheme(true)
      setError(null)
      
      try {
        const theme = await getThemeById(sourceThemeId)
        if (theme && theme.theme_tokens && onTokensChange) {
          // Map tokens to the expected format
          const duplicatedTokens = theme.theme_tokens.map(token => ({
            category: token.category,
            subcategory: token.subcategory,
            group_name: token.group_name,
            name: token.name,
            value: token.value,
            css_variable: token.css_variable,
            sort_order: token.sort_order,
          }))
          onTokensChange(duplicatedTokens)
        }
      } catch (err) {
        setError('Failed to load source theme')
        console.error('Failed to load source theme:', err)
      } finally {
        setLoadingSourceTheme(false)
      }
    }

    loadSourceTheme()
  }, [selectedTemplate, sourceThemeId, onTokensChange])

  const handleSourceThemeChange = useCallback((e) => {
    if (onSourceThemeChange) {
      onSourceThemeChange(e.target.value || null)
    }
  }, [onSourceThemeChange])

  return (
    <div 
      data-testid="template-selector"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Intro Text */}
      <p style={{
        margin: 0,
        fontSize: 'var(--font-size-body-md, 16px)',
        color: 'var(--color-fg-caption, #616A76)',
        lineHeight: 1.5,
      }}>
        Choose a starting point for your new theme. You can customize all tokens in the next steps.
      </p>

      {/* Template Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {Object.values(TEMPLATE_PRESETS).map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.id
          
          return (
            <button
              key={template.id}
              data-testid={`template-${template.id}`}
              onClick={() => handleTemplateSelect(template.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 16px',
                background: isSelected 
                  ? 'var(--color-bg-brand-subtle, #F2F5F4)'
                  : 'var(--color-bg-white, #FFFFFF)',
                border: isSelected
                  ? '2px solid var(--color-btn-primary-bg, #657E79)'
                  : '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
                  e.currentTarget.style.borderColor = 'var(--color-fg-caption, #616A76)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--color-bg-white, #FFFFFF)'
                  e.currentTarget.style.borderColor = 'var(--color-fg-stroke-default, #BFC7D4)'
                }
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected
                    ? 'var(--color-btn-primary-bg, #657E79)'
                    : 'var(--color-bg-neutral-light, #ECEFF3)',
                  color: isSelected
                    ? 'var(--color-bg-white, #FFFFFF)'
                    : 'var(--color-fg-caption, #616A76)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={24} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{
                  margin: '0 0 4px 0',
                  fontSize: 'var(--font-size-body-md, 16px)',
                  fontWeight: 'var(--font-weight-semibold, 600)',
                  color: 'var(--color-fg-heading, #1E2125)',
                }}>
                  {template.name}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-caption, #616A76)',
                }}>
                  {template.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Duplicate Theme Selector */}
      {selectedTemplate === 'duplicate' && (
        <div 
          data-testid="duplicate-theme-selector"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
            borderRadius: '8px',
          }}
        >
          <label
            htmlFor="source-theme"
            style={{
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}
          >
            Select theme to duplicate <span style={{ color: 'var(--color-fg-feedback-error, #EB4015)' }}>*</span>
          </label>
          
          {loadingThemes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--color-fg-caption, #616A76)' }}>Loading themes...</span>
            </div>
          ) : existingThemes.length === 0 ? (
            <p style={{
              margin: 0,
              padding: '12px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-caption, #616A76)',
              fontStyle: 'italic',
            }}>
              No existing themes available. Choose a different template.
            </p>
          ) : (
            <select
              id="source-theme"
              data-testid="source-theme-select"
              value={sourceThemeId || ''}
              onChange={handleSourceThemeChange}
              style={{
                padding: '12px 16px',
                fontSize: 'var(--font-size-body-md, 16px)',
                border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: '8px',
                background: 'var(--color-bg-white, #FFFFFF)',
                color: 'var(--color-fg-heading, #1E2125)',
                cursor: 'pointer',
              }}
            >
              <option value="">Select a theme...</option>
              {existingThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          )}

          {loadingSourceTheme && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ 
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-caption, #616A76)' 
              }}>
                Loading theme tokens...
              </span>
            </div>
          )}

          {error && (
            <p style={{
              margin: 0,
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-feedback-error, #EB4015)',
            }}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Export presets for testing
export { TEMPLATE_PRESETS }

