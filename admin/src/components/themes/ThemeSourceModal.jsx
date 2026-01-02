import { X, Upload, Plus } from 'lucide-react'

export default function ThemeSourceModal({ 
  isOpen, 
  onClose, 
  onSelectImport, 
  onSelectCreate 
}) {
  if (!isOpen) return null

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div 
      data-testid="theme-source-modal"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-source-title"
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
        data-testid="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-white, #FFFFFF)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          overflow: 'auto',
          maxWidth: '600px',
          width: '100%',
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
          <h2 
            id="theme-source-title"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-heading-sm, 24px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}
          >
            Create New Theme
          </h2>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            data-testid="close-button"
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

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <p 
            style={{
              color: 'var(--color-fg-caption, #616A76)',
              margin: '0 0 24px 0',
              fontSize: 'var(--font-size-body-md, 16px)',
              lineHeight: 1.5,
            }}
          >
            Choose how you'd like to create your design system theme.
          </p>

          {/* Options Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            {/* Import Option */}
            <SourceCard 
              icon={<Upload size={32} />}
              title="Import from JSON"
              description="Upload a Figma Variables export or existing token file"
              onClick={onSelectImport}
              testId="import-option"
            />

            {/* Create Option */}
            <SourceCard 
              icon={<Plus size={32} />}
              title="Create from Scratch"
              description="Build a new design system with guided setup"
              onClick={onSelectCreate}
              testId="create-option"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SourceCard({ icon, title, description, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px',
        background: 'var(--color-bg-white, #FFFFFF)',
        border: '2px solid var(--color-fg-divider, #D7DCE5)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-btn-primary-bg, #657E79)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-fg-divider, #D7DCE5)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--color-btn-primary-bg, #657E79)'
        e.currentTarget.style.outlineOffset = '2px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none'
      }}
    >
      {/* Icon Container */}
      <div 
        style={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-neutral-light, #ECEFF3)',
          borderRadius: '12px',
          marginBottom: '16px',
          color: 'var(--color-btn-primary-bg, #657E79)',
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 
        style={{
          fontSize: 'var(--font-size-body-lg, 18px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p 
        style={{
          fontSize: 'var(--font-size-body-sm, 14px)',
          color: 'var(--color-fg-caption, #616A76)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {description}
      </p>
    </button>
  )
}

