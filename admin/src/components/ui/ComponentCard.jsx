import { Boxes } from 'lucide-react'
import Badge from './Badge'

export default function ComponentCard({ component, onClick }) {
  const { name, category, preview_image, code_status, status } = component

  return (
    <button
      onClick={() => onClick(component.slug)}
      data-testid="component-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'box-shadow 0.2s, transform 0.2s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Preview area */}
      <div style={{
        height: '160px',
        background: 'var(--color-bg-neutral-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {preview_image ? (
          <img src={preview_image} alt={name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
        ) : (
          <Boxes size={48} color="var(--color-fg-caption)" />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-body-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-fg-heading)',
        }}>
          {name}
        </h3>
        
        <p style={{ 
          margin: 'var(--spacing-xs) 0 var(--spacing-md)', 
          fontSize: 'var(--font-size-body-sm)',
          color: 'var(--color-fg-caption)',
        }}>
          {category}
        </p>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <Badge variant={code_status}>{code_status}</Badge>
          <Badge variant={status}>{status}</Badge>
        </div>
      </div>
    </button>
  )
}



