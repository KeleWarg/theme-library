import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'

export default function ThemePreviewModal({ isOpen, theme, onClose, onApply }) {
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)

  // Handle escape key to close modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return

    // Focus the close button when modal opens
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100)

    // Add escape key listener
    document.addEventListener('keydown', handleKeyDown)

    // Trap focus within modal
    const modal = modalRef.current
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements?.[0]
    const lastFocusable = focusableElements?.[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    modal?.addEventListener('keydown', handleTabKey)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      modal?.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !theme) return null

  return (
    <div
      data-testid="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRef}
        data-testid="modal-content"
        className={theme.slug}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-white, #FFFFFF)',
          borderRadius: 'var(--radius-md)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--spacing-xl) var(--spacing-xl)',
            borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
          }}
        >
          <h2
            id="preview-modal-title"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-heading-sm, 24px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}
          >
            {theme.name}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close preview"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--color-fg-caption, #616A76)',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Content */}
        <div style={{ padding: 'var(--spacing-xl)' }}>
          {/* Buttons Section */}
          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Buttons
            </h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-xl)',
                  backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
                  color: 'var(--color-btn-primary-text, #FFFFFF)',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  cursor: 'pointer',
                }}
              >
                Primary
              </button>
              <button
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-xl)',
                  backgroundColor: 'var(--color-btn-secondary-bg, #FFFFFF)',
                  color: 'var(--color-btn-secondary-text, #383C43)',
                  border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  cursor: 'pointer',
                }}
              >
                Secondary
              </button>
              <button
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-xl)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-btn-ghost-text, #657E79)',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  cursor: 'pointer',
                }}
              >
                Ghost
              </button>
            </div>
          </div>

          {/* Typography Section */}
          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Typography
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-heading-md, 32px)',
                  fontWeight: 'var(--font-weight-bold, 700)',
                  color: 'var(--color-fg-heading, #1E2125)',
                }}
              >
                Heading Example
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body-md, 16px)',
                  color: 'var(--color-fg-body, #383C43)',
                }}
              >
                Body text example. This is what regular paragraph text looks like in this theme.
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-caption, #616A76)',
                }}
              >
                Caption text example - smaller, muted text for secondary information.
              </p>
            </div>
          </div>

          {/* Sample Card */}
          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Sample Card
            </h3>
            <div
              style={{
                backgroundColor: 'var(--color-bg-neutral-light, #F4F5F8)',
                border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--spacing-lg)',
              }}
            >
              <h4
                style={{
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-title-lg, 20px)',
                  color: 'var(--color-fg-heading, #1E2125)',
                }}
              >
                Card Title
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  color: 'var(--color-fg-body, #383C43)',
                }}
              >
                This is a sample card showing how content cards will look with this theme applied.
              </p>
            </div>
          </div>

          {/* Form Input */}
          <div>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Form Input
            </h3>
            <input
              type="text"
              placeholder="Enter text..."
              style={{
                width: '100%',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                fontSize: 'var(--font-size-body-md, 16px)',
                border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-bg-white, #FFFFFF)',
                color: 'var(--color-fg-body, #383C43)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-lg) var(--spacing-xl)',
            borderTop: '1px solid var(--color-fg-divider, #D7DCE5)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-xl)',
              backgroundColor: 'transparent',
              color: 'var(--color-fg-body, #383C43)',
              border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
              borderRadius: 'var(--radius-xs)',
              fontWeight: 'var(--font-weight-medium, 500)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={onApply}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-xl)',
              backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
              color: 'var(--color-btn-primary-text, #FFFFFF)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontWeight: 'var(--font-weight-medium, 500)',
              cursor: 'pointer',
            }}
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  )
}





