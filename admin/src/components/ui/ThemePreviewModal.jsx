import { X } from 'lucide-react'

export default function ThemePreviewModal({ isOpen, theme, onClose, onApply }) {
  if (!isOpen || !theme) return null

  return (
    <div
      data-testid="modal-overlay"
      onClick={onClose}
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
        data-testid="modal-content"
        className={theme.slug}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-white, #FFFFFF)',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
          }}
        >
          <h2
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
            onClick={onClose}
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
        <div style={{ padding: '24px' }}>
          {/* Buttons Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: '16px',
              }}
            >
              Buttons
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
                  color: 'var(--color-btn-primary-text, #FFFFFF)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  cursor: 'pointer',
                }}
              >
                Primary
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-btn-secondary-bg, #FFFFFF)',
                  color: 'var(--color-btn-secondary-text, #383C43)',
                  border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
                  borderRadius: '6px',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  cursor: 'pointer',
                }}
              >
                Secondary
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-btn-ghost-text, #657E79)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  cursor: 'pointer',
                }}
              >
                Ghost
              </button>
            </div>
          </div>

          {/* Typography Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: '16px',
              }}
            >
              Typography
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-fg-heading, #1E2125)',
                marginBottom: '16px',
              }}
            >
              Sample Card
            </h3>
            <div
              style={{
                backgroundColor: 'var(--color-bg-neutral-light, #F4F5F8)',
                border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 8px 0',
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
                marginBottom: '16px',
              }}
            >
              Form Input
            </h3>
            <input
              type="text"
              placeholder="Enter text..."
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 'var(--font-size-body-md, 16px)',
                border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                borderRadius: '6px',
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
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--color-fg-divider, #D7DCE5)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'var(--color-fg-body, #383C43)',
              border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
              borderRadius: '6px',
              fontWeight: 'var(--font-weight-medium, 500)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={onApply}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
              color: 'var(--color-btn-primary-text, #FFFFFF)',
              border: 'none',
              borderRadius: '6px',
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





