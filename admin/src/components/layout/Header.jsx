import { Download } from 'lucide-react'

const themes = [
  { name: 'Health SEM', value: 'theme-health---sem' },
  { name: 'Home SEM', value: 'theme-home---sem' },
  { name: 'LLM', value: 'theme-llm' },
  { name: 'ForbesMedia SEO', value: 'theme-forbes-media---seo' },
  { name: 'Compare Coverage', value: 'theme-advisor-sem-compare-coverage' },
]

export default function Header({ pageTitle }) {
  const handleThemeChange = (e) => {
    document.documentElement.className = e.target.value
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
          defaultValue="theme-health---sem"
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
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.name}
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

