import { useState } from 'react'
import { themes } from '../lib/tokenData'
import { useTheme } from '../hooks/useTheme'
import ThemeCard from '../components/ui/ThemeCard'
import ThemePreviewModal from '../components/ui/ThemePreviewModal'

export default function Themes() {
  const { theme: activeTheme, setTheme } = useTheme()
  const [previewTheme, setPreviewTheme] = useState(null)

  const handleApply = (theme) => {
    setTheme(theme.slug)
    setPreviewTheme(null)
  }

  return (
    <div>
      <h2
        style={{
          color: 'var(--color-fg-heading)',
          fontSize: 'var(--font-size-heading-md)',
          marginBottom: '8px',
        }}
      >
        Themes
      </h2>
      <p
        style={{
          color: 'var(--color-fg-caption)',
          fontSize: 'var(--font-size-body-md)',
          marginBottom: '24px',
        }}
      >
        Preview and apply different color themes to the design system.
      </p>

      {/* Theme cards grid - 3 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}
      >
        {themes.map((theme) => (
          <ThemeCard
            key={theme.slug}
            theme={theme}
            isActive={activeTheme === theme.slug}
            onPreview={() => setPreviewTheme(theme)}
            onApply={() => handleApply(theme)}
          />
        ))}
      </div>

      {/* Preview Modal */}
      <ThemePreviewModal
        isOpen={previewTheme !== null}
        theme={previewTheme}
        onClose={() => setPreviewTheme(null)}
        onApply={() => handleApply(previewTheme)}
      />
    </div>
  )
}
