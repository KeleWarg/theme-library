import { Check } from 'lucide-react'

export default function ThemeCard({ theme, isActive, onPreview, onApply }) {
  // Define preview colors for each theme
  const themeColors = {
    'theme-health---sem': ['#657E79', '#FFFFFF', '#F5F5F5', '#2D3748', '#1A202C'],
    'theme-home---sem': ['#1E3A8A', '#FFFFFF', '#F0F4FF', '#1E293B', '#0F172A'],
    'theme-llm': ['#007AC8', '#FFFFFF', '#ECF1FF', '#1E2125', '#0B5F95'],
    'theme-forbes-media---seo': ['#000000', '#FFFFFF', '#F4F5F8', '#1E2125', '#333333'],
    'theme-advisor-sem-compare-coverage': ['#00695C', '#FFFFFF', '#E0F2F1', '#1E2125', '#004D40'],
  }

  const colors = themeColors[theme.slug] || themeColors['theme-health---sem']

  return (
    <div
      data-testid="theme-card"
      style={{
        border: isActive
          ? '2px solid var(--color-btn-primary-bg, #657E79)'
          : '1px solid var(--color-fg-stroke-default, #BFC7D4)',
        borderRadius: 'var(--radius-sm, 8px)',
        backgroundColor: 'var(--color-bg-white, #FFFFFF)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Color swatches */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {colors.map((color, index) => (
          <div
            key={index}
            data-testid="color-swatch"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: color,
              border: '1px solid var(--color-fg-divider, #D7DCE5)',
            }}
          />
        ))}
      </div>

      {/* Theme name and active badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontSize: 'var(--font-size-title-md, 18px)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          {theme.name}
        </span>
        {isActive && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--color-bg-brand-subtle, #E8F5F3)',
              color: 'var(--color-btn-primary-bg, #657E79)',
              fontSize: 'var(--font-size-label-sm, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            <Check size={12} />
            Active
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onPreview}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
            borderRadius: '6px',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-body, #383C43)',
            cursor: 'pointer',
          }}
        >
          Preview
        </button>
        <button
          onClick={onApply}
          disabled={isActive}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: isActive
              ? 'var(--color-btn-primary-disabled-bg, #BFC7D4)'
              : 'var(--color-btn-primary-bg, #657E79)',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-btn-primary-text, #FFFFFF)',
            cursor: isActive ? 'not-allowed' : 'pointer',
            opacity: isActive ? 0.6 : 1,
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}





