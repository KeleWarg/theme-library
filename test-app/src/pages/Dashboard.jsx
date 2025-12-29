import { useTheme } from '../App'
import { Palette, Type, Grid3X3, Layers } from 'lucide-react'
import tokensData from '../design-system/tokens.json'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}

function ThemePreviewCard({ theme }) {
  const themeData = tokensData.themes.find(t => {
    const normalizedSlug = t.slug.replace(/\//g, '-').replace(/---/g, '-').toLowerCase()
    return normalizedSlug === theme.slug.toLowerCase() ||
      t.name === theme.name
  })
  
  if (!themeData) return null
  
  const colors = themeData.colors

  return (
    <div className="theme-preview-card">
      <h4>{theme.name}</h4>
      <div className="color-preview-grid">
        <div 
          className="color-preview-swatch large" 
          style={{ backgroundColor: colors.button.primary['primary-bg'] }}
          title="Primary Button"
        />
        <div 
          className="color-preview-swatch" 
          style={{ backgroundColor: colors.background['bg-brand'] }}
          title="Brand Background"
        />
        <div 
          className="color-preview-swatch" 
          style={{ backgroundColor: colors.foreground['fg-heading'] }}
          title="Heading"
        />
        <div 
          className="color-preview-swatch" 
          style={{ backgroundColor: colors.background['bg-accent'] }}
          title="Accent"
        />
      </div>
    </div>
  )
}

function LivePreview() {
  return (
    <div className="live-preview-section">
      <h3>Live Component Preview</h3>
      <div className="preview-container">
        <div className="preview-card">
          <h4 style={{ 
            color: 'var(--color-fg-heading)',
            fontSize: 'var(--font-size-heading-sm)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: '12px'
          }}>
            Sample Card Title
          </h4>
          <p style={{
            color: 'var(--color-fg-body)',
            fontSize: 'var(--font-size-body-md)',
            lineHeight: 'var(--line-height-lg)',
            marginBottom: '16px'
          }}>
            This card demonstrates how your design tokens look in a real component. Switch themes to see the colors update live.
          </p>
          <div className="preview-buttons">
            <button className="btn-primary">
              Primary Action
            </button>
            <button className="btn-secondary">
              Secondary
            </button>
            <button className="btn-ghost">
              Ghost
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentTheme, themes } = useTheme()
  
  // Calculate stats
  const currentThemeData = tokensData.themes.find(t => {
    const normalizedSlug = t.slug.replace(/\//g, '-').replace(/---/g, '-').toLowerCase()
    return normalizedSlug === currentTheme.slug.toLowerCase() ||
      t.name === currentTheme.name
  })
  
  const colorCount = currentThemeData ? 
    Object.values(currentThemeData.colors).reduce((acc, category) => {
      if (typeof category === 'object') {
        return acc + Object.keys(category).reduce((subAcc, key) => {
          const val = category[key]
          return subAcc + (typeof val === 'object' ? Object.keys(val).length : 1)
        }, 0)
      }
      return acc + 1
    }, 0) : 0

  const typographyCount = Object.keys(tokensData.typography.fontSize).length + 
    Object.keys(tokensData.typography.fontWeight).length +
    Object.keys(tokensData.typography.lineHeight).length

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <h1>Design System Dashboard</h1>
        <p className="subtitle">
          Currently viewing: <strong>{currentTheme.name}</strong>
        </p>
      </header>

      <section className="stats-grid">
        <StatCard 
          icon={Palette} 
          label="Color Tokens" 
          value={colorCount}
          color="var(--color-btn-primary-bg)"
        />
        <StatCard 
          icon={Type} 
          label="Typography Styles" 
          value={typographyCount}
          color="var(--color-bg-brand)"
        />
        <StatCard 
          icon={Grid3X3} 
          label="Breakpoints" 
          value={Object.keys(tokensData.breakpoints).length}
          color="var(--color-fg-feedback-success)"
        />
        <StatCard 
          icon={Layers} 
          label="Themes" 
          value={themes.length}
          color="var(--color-bg-superlative)"
        />
      </section>

      <LivePreview />

      <section className="themes-overview">
        <h3>All Themes</h3>
        <div className="themes-grid">
          {themes.map(theme => (
            <ThemePreviewCard key={theme.slug} theme={theme} />
          ))}
        </div>
      </section>
    </div>
  )
}
