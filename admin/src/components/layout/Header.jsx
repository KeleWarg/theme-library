import { Download } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { themes } from '../../lib/tokenData'

export default function Header({ pageTitle }) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--color-bg-white)',
        borderBottom: '1px solid var(--color-bg-neutral)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left side - Page title */}
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--font-size-heading-sm)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-fg-heading)',
        }}
      >
        {pageTitle}
      </h1>

      {/* Right side - Theme dropdown and Export button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme dropdown */}
        <select
          value={theme}
          onChange={handleThemeChange}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-fg-stroke-default)',
            backgroundColor: 'var(--color-bg-white)',
            color: 'var(--color-fg-body)',
            fontSize: 'var(--font-size-body-sm)',
            cursor: 'pointer',
          }}
        >
          {themes.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Export button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-btn-primary-bg)',
            color: 'var(--color-btn-primary-text)',
            border: 'none',
            borderRadius: '6px',
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
