/**
 * FormatSelector Component
 * Tab-style selector for export formats
 * Chunk 4.03 - Export Modal
 */

import { FileCode, FileJson, Settings2, FileType } from 'lucide-react'

const FORMATS = [
  { id: 'css', label: 'CSS', icon: FileCode },
  { id: 'json', label: 'JSON', icon: FileJson },
  { id: 'tailwind', label: 'Tailwind', icon: Settings2 },
  { id: 'scss', label: 'SCSS', icon: FileType },
]

export default function FormatSelector({ selectedFormat, onFormatChange }) {
  return (
    <div
      data-testid="format-selector"
      style={{
        display: 'flex',
        gap: '0',
        borderBottom: '2px solid var(--color-fg-divider, #D7DCE5)',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
      }}
    >
      {FORMATS.map((format) => {
        const isSelected = format.id === selectedFormat
        const Icon = format.icon

        return (
          <button
            key={format.id}
            onClick={() => onFormatChange(format.id)}
            data-testid={`format-tab-${format.id}`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 16px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: isSelected
                ? 'var(--font-weight-semibold, 600)'
                : 'var(--font-weight-medium, 500)',
              color: isSelected
                ? 'var(--color-bg-white, #FFFFFF)'
                : 'var(--color-fg-body, #383C43)',
              backgroundColor: isSelected
                ? 'var(--color-btn-primary-bg, #657E79)'
                : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-light, #ECEFF3)'
                e.currentTarget.style.color = 'var(--color-fg-heading, #1E2125)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--color-fg-body, #383C43)'
              }
            }}
            aria-selected={isSelected}
            role="tab"
          >
            <Icon size={16} />
            {format.label}
          </button>
        )
      })}
    </div>
  )
}

export { FORMATS }

