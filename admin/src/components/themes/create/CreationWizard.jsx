import { useState, useCallback, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, Plus, Loader, AlertCircle } from 'lucide-react'
import TemplateSelector from './TemplateSelector'
import ThemeDetailsStep from '../import/ThemeDetailsStep'
import ColorEditorStep from './ColorEditorStep'
import TypographyEditorStep from './TypographyEditorStep'
import SpacingEditorStep from './SpacingEditorStep'
import { createTheme, bulkCreateTokens, generateSlug } from '../../../lib/themeService'

// Step definitions - 6 steps for creation wizard
const STEPS = [
  { id: 'template', title: 'Template', description: 'Choose a starting point' },
  { id: 'info', title: 'Theme Info', description: 'Name and configure' },
  { id: 'colors', title: 'Colors', description: 'Customize color tokens' },
  { id: 'typography', title: 'Typography', description: 'Set typography values' },
  { id: 'spacing', title: 'Spacing', description: 'Layout and spacing' },
  { id: 'review', title: 'Review', description: 'Confirm and create' },
]

/**
 * CreationWizard - Complete theme creation flow with template selection and token editing
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the wizard is visible
 * @param {Function} props.onClose - Callback when wizard is closed
 * @param {Function} props.onComplete - Callback when creation is successful
 * @param {Array} props.existingThemes - List of existing themes for validation
 */
export default function CreationWizard({ isOpen, onClose, onComplete, existingThemes = [] }) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [sourceThemeId, setSourceThemeId] = useState(null)
  const [tokens, setTokens] = useState([])
  const [themeDetails, setThemeDetails] = useState({ name: '', slug: '', description: '', isValid: false })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  // Group tokens by category for editing steps
  const tokensByCategory = useMemo(() => {
    const grouped = {
      color: [],
      typography: [],
      spacing: [],
      other: [],
    }
    
    tokens.forEach(token => {
      const category = token.category?.toLowerCase() || 'other'
      // Also check subcategory for better categorization
      const subcategory = token.subcategory?.toLowerCase() || ''
      const cssVar = token.css_variable?.toLowerCase() || ''
      
      if (category === 'color' || subcategory.includes('color') || cssVar.includes('color')) {
        grouped.color.push(token)
      } else if (category === 'typography' || subcategory.includes('font') || cssVar.includes('font')) {
        grouped.typography.push(token)
      } else if (category === 'spacing' || subcategory.includes('spacing') || 
                 subcategory.includes('radius') || subcategory.includes('shadow') ||
                 cssVar.includes('spacing') || cssVar.includes('radius') || cssVar.includes('shadow')) {
        grouped.spacing.push(token)
      } else if (grouped[category]) {
        grouped[category].push(token)
      } else {
        grouped.other.push(token)
      }
    })
    
    return grouped
  }, [tokens])

  // Reset wizard state
  const resetWizard = useCallback(() => {
    setCurrentStep(0)
    setSelectedTemplate(null)
    setSourceThemeId(null)
    setTokens([])
    setThemeDetails({ name: '', slug: '', description: '', isValid: false })
    setIsCreating(false)
    setCreateError(null)
  }, [])

  // Handle close with reset
  const handleClose = useCallback(() => {
    resetWizard()
    onClose()
  }, [resetWizard, onClose])

  // Handle token value updates
  const handleTokenUpdate = useCallback((tokenIndex, updates) => {
    setTokens(prev => prev.map((token, idx) => 
      idx === tokenIndex ? { ...token, ...updates } : token
    ))
  }, [])

  // Handle adding a new token
  const handleAddToken = useCallback((category, subcategory = null, initialToken = null) => {
    const newToken = initialToken || {
      category,
      subcategory,
      name: 'new-token',
      value: category === 'color' ? { hex: '#000000' } : { size: '16px' },
      css_variable: `--${category}-new-token`,
    }
    
    // Ensure category is set
    newToken.category = category
    if (subcategory) newToken.subcategory = subcategory
    
    setTokens(prev => [...prev, newToken])
  }, [])

  // Handle removing a token
  const handleRemoveToken = useCallback((tokenIndex) => {
    setTokens(prev => prev.filter((_, idx) => idx !== tokenIndex))
  }, [])

  // Check if current step is valid for navigation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0: // Template
        if (selectedTemplate === 'duplicate') {
          return sourceThemeId !== null && tokens.length > 0
        }
        return selectedTemplate !== null
      case 1: // Info
        return themeDetails.isValid
      case 2: // Colors
        return true // Can proceed without color tokens
      case 3: // Typography
        return true // Can proceed without typography tokens
      case 4: // Spacing
        return true // Can proceed without spacing tokens
      case 5: // Review
        return true
      default:
        return false
    }
  }, [currentStep, selectedTemplate, sourceThemeId, tokens.length, themeDetails.isValid])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      setCreateError(null)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setCreateError(null)
    }
  }, [currentStep])

  // Create handler
  const handleCreate = useCallback(async () => {
    setIsCreating(true)
    setCreateError(null)

    try {
      // Create theme record
      const theme = await createTheme({
        name: themeDetails.name,
        slug: themeDetails.slug,
        description: themeDetails.description || null,
        source: 'manual',
        status: 'draft',
      })

      // Prepare tokens for bulk insert
      if (tokens.length > 0) {
        const tokensToInsert = tokens.map((token, index) => ({
          theme_id: theme.id,
          category: token.category,
          subcategory: token.subcategory || null,
          group_name: token.group_name || null,
          name: token.name,
          value: token.value,
          css_variable: token.css_variable,
          figma_variable_id: null,
          sort_order: index,
        }))

        await bulkCreateTokens(tokensToInsert)
      }

      // Call completion callback with the new theme
      onComplete(theme)
      
      // Reset and close
      resetWizard()
    } catch (error) {
      console.error('Create error:', error)
      setCreateError(error.message || 'Failed to create theme. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }, [themeDetails, tokens, onComplete, resetWizard])

  // Helper to find global token index from local index in a category
  const findGlobalIndex = useCallback((categoryTokens, localIndex) => {
    const token = categoryTokens[localIndex]
    return tokens.indexOf(token)
  }, [tokens])

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
            sourceThemeId={sourceThemeId}
            onSourceThemeChange={setSourceThemeId}
            onTokensChange={setTokens}
          />
        )
      case 1:
        return (
          <ThemeDetailsStep
            details={themeDetails}
            onUpdate={setThemeDetails}
            existingThemes={existingThemes}
          />
        )
      case 2:
        return (
          <ColorEditorStep
            tokens={tokensByCategory.color}
            onChange={(localIndex, updates) => {
              const globalIndex = findGlobalIndex(tokensByCategory.color, localIndex)
              if (globalIndex !== -1) {
                handleTokenUpdate(globalIndex, updates)
              }
            }}
            onAddToken={handleAddToken}
            onRemoveToken={(localIndex) => {
              const globalIndex = findGlobalIndex(tokensByCategory.color, localIndex)
              if (globalIndex !== -1) {
                handleRemoveToken(globalIndex)
              }
            }}
          />
        )
      case 3:
        return (
          <TypographyEditorStep
            tokens={tokensByCategory.typography}
            onChange={(localIndex, updates) => {
              const globalIndex = findGlobalIndex(tokensByCategory.typography, localIndex)
              if (globalIndex !== -1) {
                handleTokenUpdate(globalIndex, updates)
              }
            }}
            onAddToken={handleAddToken}
            onRemoveToken={(localIndex) => {
              const globalIndex = findGlobalIndex(tokensByCategory.typography, localIndex)
              if (globalIndex !== -1) {
                handleRemoveToken(globalIndex)
              }
            }}
          />
        )
      case 4:
        return (
          <SpacingEditorStep
            tokens={tokensByCategory.spacing}
            onChange={(localIndex, updates) => {
              const globalIndex = findGlobalIndex(tokensByCategory.spacing, localIndex)
              if (globalIndex !== -1) {
                handleTokenUpdate(globalIndex, updates)
              }
            }}
            onAddToken={handleAddToken}
            onRemoveToken={(localIndex) => {
              const globalIndex = findGlobalIndex(tokensByCategory.spacing, localIndex)
              if (globalIndex !== -1) {
                handleRemoveToken(globalIndex)
              }
            }}
          />
        )
      case 5:
        return (
          <ReviewStep
            themeDetails={themeDetails}
            tokens={tokens}
            selectedTemplate={selectedTemplate}
          />
        )
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div
      data-testid="creation-wizard"
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="creation-wizard-title"
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-white, #FFFFFF)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          width: '100%',
          maxWidth: '800px',
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
            padding: '24px',
            borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
          }}
        >
          <div>
            <h2
              id="creation-wizard-title"
              style={{
                margin: 0,
                fontSize: 'var(--font-size-heading-sm, 24px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
              }}
            >
              Create New Theme
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-caption, #616A76)',
              }}
            >
              {STEPS[currentStep].description}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close wizard"
            data-testid="close-wizard"
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
              transition: 'background 0.2s ease',
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

        {/* Step Indicator */}
        <div
          data-testid="step-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px 24px',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
            gap: '8px',
          }}
        >
          {STEPS.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              currentStep={currentStep}
              isLast={index === STEPS.length - 1}
            />
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            minHeight: '300px',
          }}
        >
          {renderStepContent()}

          {/* Error Message */}
          {createError && (
            <div
              data-testid="create-error"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(235, 64, 21, 0.08)',
                border: '1px solid var(--color-fg-feedback-error, #EB4015)',
                borderRadius: '8px',
              }}
            >
              <AlertCircle
                size={20}
                style={{
                  color: 'var(--color-fg-feedback-error, #EB4015)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-feedback-error, #EB4015)',
                  lineHeight: 1.5,
                }}
              >
                {createError}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderTop: '1px solid var(--color-fg-divider, #D7DCE5)',
            background: 'var(--color-bg-white, #FFFFFF)',
          }}
        >
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isCreating}
            data-testid="back-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: 'var(--font-size-body-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              background: 'transparent',
              color: currentStep === 0 || isCreating
                ? 'var(--color-fg-disabled, #A0A4A8)'
                : 'var(--color-fg-body, #383C43)',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: '8px',
              cursor: currentStep === 0 || isCreating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: currentStep === 0 ? 0 : 1,
              visibility: currentStep === 0 ? 'hidden' : 'visible',
            }}
            onMouseEnter={(e) => {
              if (currentStep > 0 && !isCreating) {
                e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {/* Next/Create button */}
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid}
              data-testid="next-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: 'var(--font-size-body-md, 16px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                background: isStepValid
                  ? 'var(--color-btn-primary-bg, #657E79)'
                  : 'var(--color-btn-disabled-bg, #D7DCE5)',
                color: isStepValid
                  ? 'var(--color-btn-primary-fg, #FFFFFF)'
                  : 'var(--color-fg-disabled, #A0A4A8)',
                border: 'none',
                borderRadius: '8px',
                cursor: isStepValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (isStepValid) {
                  e.currentTarget.style.background = 'var(--color-btn-primary-hover-bg, #526964)'
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid) {
                  e.currentTarget.style.background = 'var(--color-btn-primary-bg, #657E79)'
                }
              }}
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!isStepValid || isCreating}
              data-testid="create-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: 'var(--font-size-body-md, 16px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                background: isStepValid && !isCreating
                  ? 'var(--color-btn-primary-bg, #657E79)'
                  : 'var(--color-btn-disabled-bg, #D7DCE5)',
                color: isStepValid && !isCreating
                  ? 'var(--color-btn-primary-fg, #FFFFFF)'
                  : 'var(--color-fg-disabled, #A0A4A8)',
                border: 'none',
                borderRadius: '8px',
                cursor: isStepValid && !isCreating ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                minWidth: '140px',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (isStepValid && !isCreating) {
                  e.currentTarget.style.background = 'var(--color-btn-primary-hover-bg, #526964)'
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid && !isCreating) {
                  e.currentTarget.style.background = 'var(--color-btn-primary-bg, #657E79)'
                }
              }}
            >
              {isCreating ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Theme
                </>
              )}
            </button>
          )}
        </div>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

/**
 * Step indicator item component
 */
function StepItem({ step, index, currentStep, isLast }) {
  const isActive = index === currentStep
  const isComplete = index < currentStep

  return (
    <>
      <div
        data-testid={`step-${step.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Step number/checkmark */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            background: isActive
              ? 'var(--color-btn-primary-bg, #657E79)'
              : isComplete
                ? 'var(--color-fg-feedback-success, #0C7663)'
                : 'var(--color-bg-white, #FFFFFF)',
            color: isActive || isComplete
              ? 'var(--color-bg-white, #FFFFFF)'
              : 'var(--color-fg-caption, #616A76)',
            border: !isActive && !isComplete
              ? '2px solid var(--color-fg-stroke-default, #BFC7D4)'
              : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {isComplete ? '✓' : index + 1}
        </div>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div
          style={{
            flex: 1,
            height: '2px',
            background: isComplete
              ? 'var(--color-fg-feedback-success, #0C7663)'
              : 'var(--color-fg-stroke-default, #BFC7D4)',
            borderRadius: '1px',
            transition: 'background 0.2s ease',
          }}
        />
      )}
    </>
  )
}


/**
 * Review step - Summary before creation
 */
function ReviewStep({ themeDetails, tokens, selectedTemplate }) {
  const tokenCounts = useMemo(() => {
    const counts = {}
    tokens.forEach(token => {
      const category = token.category || 'other'
      counts[category] = (counts[category] || 0) + 1
    })
    return counts
  }, [tokens])

  const templateName = selectedTemplate ? 
    (selectedTemplate === 'duplicate' ? 'Duplicated from existing' :
     selectedTemplate === 'light' ? 'Light Mode' :
     selectedTemplate === 'dark' ? 'Dark Mode' : 'Blank') : 'None'

  return (
    <div
      data-testid="review-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <p style={{
        margin: 0,
        fontSize: 'var(--font-size-body-md, 16px)',
        color: 'var(--color-fg-caption, #616A76)',
        lineHeight: 1.5,
      }}>
        Review your theme configuration before creating.
      </p>

      {/* Theme Details Card */}
      <div
        style={{
          padding: '20px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          borderRadius: '12px',
        }}
      >
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-body-md, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          Theme Details
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DetailRow label="Name" value={themeDetails.name || '—'} />
          <DetailRow label="Slug" value={themeDetails.slug || '—'} mono />
          <DetailRow label="Description" value={themeDetails.description || 'No description'} />
          <DetailRow label="Template" value={templateName} />
        </div>
      </div>

      {/* Token Summary Card */}
      <div
        style={{
          padding: '20px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          borderRadius: '12px',
        }}
      >
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-body-md, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          Token Summary
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DetailRow label="Total Tokens" value={String(tokens.length)} />
          {Object.entries(tokenCounts).map(([category, count]) => (
            <DetailRow 
              key={category} 
              label={category.charAt(0).toUpperCase() + category.slice(1)} 
              value={String(count)} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Detail row for review step
 */
function DetailRow({ label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{
        fontSize: 'var(--font-size-body-sm, 14px)',
        color: 'var(--color-fg-caption, #616A76)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 'var(--font-size-body-sm, 14px)',
        fontWeight: 'var(--font-weight-medium, 500)',
        color: 'var(--color-fg-heading, #1E2125)',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  )
}

