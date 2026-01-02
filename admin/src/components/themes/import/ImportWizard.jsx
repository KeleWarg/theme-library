import { useState, useCallback, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, Upload, Loader, AlertCircle } from 'lucide-react'
import FileUploadStep from './FileUploadStep'
import TokenMappingStep from './TokenMappingStep'
import ThemeDetailsStep from './ThemeDetailsStep'
import ImportReviewStep from './ImportReviewStep'
import { createTheme, bulkCreateTokens } from '../../../lib/themeService'

// Step definitions
const STEPS = [
  { id: 'upload', title: 'Upload File', description: 'Select your token file' },
  { id: 'mapping', title: 'Review Tokens', description: 'Verify category assignments' },
  { id: 'details', title: 'Theme Details', description: 'Name and configure your theme' },
  { id: 'review', title: 'Review & Import', description: 'Confirm and create' },
]

/**
 * ImportWizard - Complete import flow with navigation, state management, and database persistence
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the wizard is visible
 * @param {Function} props.onClose - Callback when wizard is closed
 * @param {Function} props.onComplete - Callback when import is successful
 * @param {Array} props.existingThemes - List of existing themes for slug validation
 */
export default function ImportWizard({ isOpen, onClose, onComplete, existingThemes = [] }) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [tokens, setTokens] = useState([])
  const [themeDetails, setThemeDetails] = useState({ name: '', slug: '', description: '', isValid: false })
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState(null)

  // Reset wizard state
  const resetWizard = useCallback(() => {
    setCurrentStep(0)
    setFileData(null)
    setTokens([])
    setThemeDetails({ name: '', slug: '', description: '', isValid: false })
    setIsImporting(false)
    setImportError(null)
  }, [])

  // Handle close with reset
  const handleClose = useCallback(() => {
    resetWizard()
    onClose()
  }, [resetWizard, onClose])

  // File upload handler
  const handleFileSelect = useCallback((data) => {
    setFileData(data)
    // Initialize tokens from parse result
    const parsedTokens = data.validation?.parseResult?.tokens || []
    setTokens(parsedTokens)
  }, [])

  // File clear handler
  const handleFileClear = useCallback(() => {
    setFileData(null)
    setTokens([])
  }, [])

  // Token mapping update handler
  const handleTokenUpdate = useCallback((updatedTokens) => {
    setTokens(updatedTokens)
  }, [])

  // Theme details update handler
  const handleDetailsUpdate = useCallback((details) => {
    setThemeDetails(details)
  }, [])

  // Check if current step is valid for navigation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0: // Upload
        return fileData !== null
      case 1: // Mapping
        return tokens.length > 0
      case 2: // Details
        return themeDetails.isValid
      case 3: // Review
        return true
      default:
        return false
    }
  }, [currentStep, fileData, tokens.length, themeDetails.isValid])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      setImportError(null)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setImportError(null)
    }
  }, [currentStep])

  // Import handler
  const handleImport = useCallback(async () => {
    setIsImporting(true)
    setImportError(null)

    try {
      // Create theme record
      const theme = await createTheme({
        name: themeDetails.name,
        slug: themeDetails.slug,
        description: themeDetails.description || null,
        source: 'figma',
        source_file_name: fileData?.name || null,
        status: 'draft',
      })

      // Prepare tokens for bulk insert
      const tokensToInsert = tokens.map((token, index) => ({
        theme_id: theme.id,
        category: token.category,
        subcategory: token.subcategory || null,
        group_name: token.group_name || null,
        name: token.name,
        value: token.value,
        css_variable: token.css_variable,
        figma_variable_id: token.figma_variable_id || null,
        sort_order: index,
      }))

      // Bulk create tokens
      await bulkCreateTokens(tokensToInsert)

      // Call completion callback with the new theme
      onComplete(theme)
      
      // Reset and close
      resetWizard()
    } catch (error) {
      console.error('Import error:', error)
      setImportError(error.message || 'Failed to import theme. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }, [themeDetails, tokens, fileData, onComplete, resetWizard])

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FileUploadStep
            onFileSelect={handleFileSelect}
            selectedFile={fileData}
            onClear={handleFileClear}
          />
        )
      case 1:
        return (
          <TokenMappingStep
            tokens={tokens}
            onUpdateMapping={handleTokenUpdate}
          />
        )
      case 2:
        return (
          <ThemeDetailsStep
            details={themeDetails}
            onUpdate={handleDetailsUpdate}
            existingThemes={existingThemes}
          />
        )
      case 3:
        return (
          <ImportReviewStep
            fileData={fileData}
            tokens={tokens}
            themeDetails={themeDetails}
          />
        )
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div
      data-testid="import-wizard"
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-wizard-title"
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
          maxWidth: '720px',
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
              id="import-wizard-title"
              style={{
                margin: 0,
                fontSize: 'var(--font-size-heading-sm, 24px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
              }}
            >
              Import Theme
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
          }}
        >
          {renderStepContent()}

          {/* Error Message */}
          {importError && (
            <div
              data-testid="import-error"
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
                {importError}
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
            disabled={currentStep === 0 || isImporting}
            data-testid="back-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: 'var(--font-size-body-md, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              background: 'transparent',
              color: currentStep === 0 || isImporting
                ? 'var(--color-fg-disabled, #A0A4A8)'
                : 'var(--color-fg-body, #383C43)',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: '8px',
              cursor: currentStep === 0 || isImporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: currentStep === 0 ? 0 : 1,
              visibility: currentStep === 0 ? 'hidden' : 'visible',
            }}
            onMouseEnter={(e) => {
              if (currentStep > 0 && !isImporting) {
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

          {/* Next/Import button */}
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
              onClick={handleImport}
              disabled={!isStepValid || isImporting}
              data-testid="import-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: 'var(--font-size-body-md, 16px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                background: isStepValid && !isImporting
                  ? 'var(--color-btn-primary-bg, #657E79)'
                  : 'var(--color-btn-disabled-bg, #D7DCE5)',
                color: isStepValid && !isImporting
                  ? 'var(--color-btn-primary-fg, #FFFFFF)'
                  : 'var(--color-fg-disabled, #A0A4A8)',
                border: 'none',
                borderRadius: '8px',
                cursor: isStepValid && !isImporting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                minWidth: '140px',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (isStepValid && !isImporting) {
                  e.currentTarget.style.background = 'var(--color-btn-primary-hover-bg, #526964)'
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid && !isImporting) {
                  e.currentTarget.style.background = 'var(--color-btn-primary-bg, #657E79)'
                }
              }}
            >
              {isImporting ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import Theme
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

        {/* Step title */}
        <span
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: isActive ? 'var(--font-weight-semibold, 600)' : 'var(--font-weight-medium, 500)',
            color: isActive
              ? 'var(--color-fg-heading, #1E2125)'
              : isComplete
                ? 'var(--color-fg-body, #383C43)'
                : 'var(--color-fg-caption, #616A76)',
            display: 'none',
            transition: 'all 0.2s ease',
          }}
          className="step-title"
        >
          {step.title}
        </span>
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

