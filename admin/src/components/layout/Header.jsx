import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { themes as staticThemes } from '../../lib/tokenData'
import { getThemes } from '../../lib/themeService'

export default function Header({ pageTitle }) {
  const { theme, setTheme } = useTheme()
  const [allThemes, setAllThemes] = useState(staticThemes)
  const [dbThemes, setDbThemes] = useState([])

  // Fetch database themes on mount
  useEffect(() => {
    async function loadDbThemes() {
      try {
        const themes = await getThemes()
        if (themes && themes.length > 0) {
          // Transform DB themes to match static theme format
          const transformedDbThemes = themes.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            isFromDatabase: true,
            status: t.status,
          }))
          setDbThemes(transformedDbThemes)
          
          // Merge: static themes + unique DB themes (no duplicates by slug)
          const staticSlugs = staticThemes.map(t => t.slug)
          const uniqueDbThemes = transformedDbThemes.filter(
            t => !staticSlugs.includes(t.slug)
          )
          setAllThemes([...staticThemes, ...uniqueDbThemes])
        }
      } catch (err) {
        console.warn('Failed to load database themes for selector:', err)
        // Fall back to static themes only
        setAllThemes(staticThemes)
      }
    }
    
    loadDbThemes()
  }, [])

  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }

  // Check if we have any database themes to show
  const hasDbThemes = dbThemes.length > 0

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--color-bg-white)',
        borderBottom: '1px solid var(--color-bg-neutral)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 var(--spacing-xl)`,
      }}
    >
      {/* Left side - Page title */}
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--font-size-heading-sm)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-fg-heading)',
          pointerEvents: 'none', // Prevent click interception
        }}
      >
        {pageTitle}
      </h1>

      {/* Right side - Theme dropdown and Export button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
        {/* Theme dropdown */}
        <select
          value={theme}
          onChange={handleThemeChange}
          data-testid="theme-selector"
          style={{
            padding: `var(--spacing-sm) var(--spacing-md)`,
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--color-fg-stroke-default)',
            backgroundColor: 'var(--color-bg-white)',
            color: 'var(--color-fg-body)',
            fontSize: 'var(--font-size-body-sm)',
            cursor: 'pointer',
            minWidth: '180px',
          }}
        >
          {/* Built-in themes group */}
          <optgroup label="Built-in Themes">
            {staticThemes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </optgroup>
          
          {/* Custom themes group (if any) */}
          {hasDbThemes && (
            <optgroup label="Custom Themes">
              {dbThemes
                .filter(t => !staticThemes.some(s => s.slug === t.slug))
                .map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} {t.status === 'draft' ? '(Draft)' : ''}
                  </option>
                ))}
            </optgroup>
          )}
        </select>

        {/* Export button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            padding: `var(--spacing-sm) var(--spacing-lg)`,
            backgroundColor: 'var(--color-btn-primary-bg)',
            color: 'var(--color-btn-primary-text)',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  )
}
