/**
 * Tabs Component
 * Horizontal tab navigation with active state styling
 */
export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0',
        borderBottom: '2px solid var(--color-fg-divider, #D7DCE5)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: 'var(--font-size-body-md, 16px)',
              fontWeight: isActive
                ? 'var(--font-weight-semibold, 600)'
                : 'var(--font-weight-regular, 400)',
              color: isActive
                ? 'var(--color-btn-primary-bg, #657E79)'
                : 'var(--color-fg-body, #383C43)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isActive
                ? '2px solid var(--color-btn-primary-bg, #657E79)'
                : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              transition: 'color 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--color-btn-primary-bg, #657E79)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--color-fg-body, #383C43)'
              }
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}



