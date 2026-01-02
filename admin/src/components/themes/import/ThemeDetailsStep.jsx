import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { generateSlug, isSlugAvailable } from '../../../lib/themeService'

/**
 * ThemeDetailsStep - Form for entering theme name, slug, and description
 * 
 * @param {Object} props
 * @param {Object} props.details - Current theme details { name, slug, description }
 * @param {Function} props.onUpdate - Callback when details change
 * @param {Array} props.existingThemes - List of existing themes for slug validation
 */
export default function ThemeDetailsStep({ details = {}, onUpdate, existingThemes = [] }) {
  const [localName, setLocalName] = useState(details.name || '')
  const [localSlug, setLocalSlug] = useState(details.slug || '')
  const [localDescription, setLocalDescription] = useState(details.description || '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null, error: null })

  // Auto-generate slug from name when name changes (unless manually edited)
  useEffect(() => {
    if (localName && !slugManuallyEdited) {
      const generated = generateSlug(localName)
      setLocalSlug(generated)
    }
  }, [localName, slugManuallyEdited])

  // Check slug availability when slug changes
  useEffect(() => {
    if (!localSlug) {
      setSlugStatus({ checking: false, available: null, error: null })
      return
    }

    const checkSlug = async () => {
      setSlugStatus({ checking: true, available: null, error: null })
      
      try {
        const available = await isSlugAvailable(localSlug)
        setSlugStatus({ checking: false, available, error: null })
      } catch (error) {
        // If Supabase isn't configured, check against existing themes list
        const existingSlugs = existingThemes.map(t => t.slug)
        const available = !existingSlugs.includes(localSlug)
        setSlugStatus({ checking: false, available, error: null })
      }
    }

    // Debounce the check
    const timer = setTimeout(checkSlug, 300)
    return () => clearTimeout(timer)
  }, [localSlug, existingThemes])

  // Notify parent of changes
  useEffect(() => {
    onUpdate({
      name: localName,
      slug: localSlug,
      description: localDescription,
      isValid: localName.trim().length > 0 && localSlug.trim().length > 0 && slugStatus.available === true,
    })
  }, [localName, localSlug, localDescription, slugStatus.available, onUpdate])

  const handleNameChange = useCallback((e) => {
    setLocalName(e.target.value)
  }, [])

  const handleSlugChange = useCallback((e) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
    setLocalSlug(value)
    setSlugManuallyEdited(true)
  }, [])

  const handleDescriptionChange = useCallback((e) => {
    setLocalDescription(e.target.value)
  }, [])

  const renderSlugStatus = () => {
    if (slugStatus.checking) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--color-fg-caption, #616A76)' }}>Checking...</span>
        </span>
      )
    }

    if (slugStatus.available === true) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={14} style={{ color: 'var(--color-fg-feedback-success, #0C7663)' }} />
          <span style={{ color: 'var(--color-fg-feedback-success, #0C7663)' }}>Available</span>
        </span>
      )
    }

    if (slugStatus.available === false) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={14} style={{ color: 'var(--color-fg-feedback-error, #EB4015)' }} />
          <span style={{ color: 'var(--color-fg-feedback-error, #EB4015)' }}>Already taken</span>
        </span>
      )
    }

    return null
  }

  return (
    <div 
      data-testid="theme-details-step"
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
        Give your theme a name and description. The slug will be used as a unique identifier.
      </p>

      {/* Theme Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label 
          htmlFor="theme-name"
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          Theme Name <span style={{ color: 'var(--color-fg-feedback-error, #EB4015)' }}>*</span>
        </label>
        <input
          id="theme-name"
          type="text"
          value={localName}
          onChange={handleNameChange}
          placeholder="e.g., Dark Mode, Brand Refresh 2024"
          data-testid="theme-name-input"
          style={{
            padding: '12px 16px',
            fontSize: 'var(--font-size-body-md, 16px)',
            border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
            borderRadius: '8px',
            background: 'var(--color-bg-white, #FFFFFF)',
            color: 'var(--color-fg-heading, #1E2125)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-btn-primary-bg, #657E79)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101, 126, 121, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-fg-stroke-default, #BFC7D4)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {!localName.trim() && (
          <p style={{
            margin: 0,
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
          }}>
            Theme name is required
          </p>
        )}
      </div>

      {/* Theme Slug */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label 
            htmlFor="theme-slug"
            style={{
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}
          >
            Slug <span style={{ color: 'var(--color-fg-feedback-error, #EB4015)' }}>*</span>
          </label>
          {localSlug && (
            <span style={{ fontSize: 'var(--font-size-body-xs, 12px)' }}>
              {renderSlugStatus()}
            </span>
          )}
        </div>
        <input
          id="theme-slug"
          type="text"
          value={localSlug}
          onChange={handleSlugChange}
          placeholder="theme-unique-identifier"
          data-testid="theme-slug-input"
          style={{
            padding: '12px 16px',
            fontSize: 'var(--font-size-body-md, 16px)',
            fontFamily: 'monospace',
            border: `1px solid ${
              slugStatus.available === false 
                ? 'var(--color-fg-feedback-error, #EB4015)' 
                : 'var(--color-fg-stroke-default, #BFC7D4)'
            }`,
            borderRadius: '8px',
            background: 'var(--color-bg-white, #FFFFFF)',
            color: 'var(--color-fg-heading, #1E2125)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            if (slugStatus.available !== false) {
              e.currentTarget.style.borderColor = 'var(--color-btn-primary-bg, #657E79)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101, 126, 121, 0.1)'
            }
          }}
          onBlur={(e) => {
            if (slugStatus.available !== false) {
              e.currentTarget.style.borderColor = 'var(--color-fg-stroke-default, #BFC7D4)'
            }
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-body-xs, 12px)',
          color: 'var(--color-fg-caption, #616A76)',
        }}>
          URL-safe identifier. Automatically generated from name, but you can customize it.
        </p>
      </div>

      {/* Theme Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label 
          htmlFor="theme-description"
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          Description <span style={{ color: 'var(--color-fg-caption, #616A76)', fontWeight: 'normal' }}>(optional)</span>
        </label>
        <textarea
          id="theme-description"
          value={localDescription}
          onChange={handleDescriptionChange}
          placeholder="Describe the purpose and use case of this theme..."
          rows={3}
          data-testid="theme-description-input"
          style={{
            padding: '12px 16px',
            fontSize: 'var(--font-size-body-md, 16px)',
            border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
            borderRadius: '8px',
            background: 'var(--color-bg-white, #FFFFFF)',
            color: 'var(--color-fg-heading, #1E2125)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-btn-primary-bg, #657E79)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(101, 126, 121, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-fg-stroke-default, #BFC7D4)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

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

