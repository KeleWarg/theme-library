# Phase 8: Export System

## Prerequisites
- Phases 1-7 complete
- Components with generated code

## Outcome
- Export npm package as zip
- Auto-generated LLMS.txt
- Settings page with export UI

---

## Task 8.1: Create Package Generator

### Instructions
Create `src/lib/packageGenerator.js`

### Code
```javascript
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function generateComponentsIndex(components) {
  return components
    .map(c => `export { ${c.name} } from './${c.name}';`)
    .join('\n')
}

export function generateLLMSTxt(components, packageName = '@yourorg/design-system') {
  const published = components.filter(c => c.status === 'published' && c.jsx_code)
  
  return `# ${packageName} - AI Assistant Guide

## Quick Start

\`\`\`bash
npm install ${packageName}
\`\`\`

\`\`\`jsx
import '${packageName}/dist/tokens.css';
import { ${published.map(c => c.name).join(', ')} } from '${packageName}';
\`\`\`

## Available Components

${published.map(c => `
### ${c.name}

${c.description || 'No description'}

**Import:** \`import { ${c.name} } from '${packageName}';\`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
${(c.props || []).map(p => `| ${p.name} | \`${p.type}\` | \`${p.default || '-'}\` | ${p.description || '-'} |`).join('\n')}

**Variants:** ${c.variants?.map(v => v.name).join(', ') || 'None'}

**Example:**
\`\`\`jsx
<${c.name} variant="primary">${c.name === 'Button' ? 'Click me' : 'Content'}</${c.name}>
\`\`\`
`).join('\n')}

## Design Tokens

### Colors
- Backgrounds: \`var(--color-bg-white)\`, \`var(--color-bg-neutral-light)\`
- Text: \`var(--color-fg-heading)\`, \`var(--color-fg-body)\`
- Buttons: \`var(--color-btn-primary-bg)\`, \`var(--color-btn-primary-text)\`

### Typography
- Sizes: \`var(--font-size-heading-lg)\`, \`var(--font-size-body-md)\`
- Weights: \`var(--font-weight-bold)\`, \`var(--font-weight-regular)\`

## Themes

Available:
- \`theme-health-sem\`
- \`theme-home-sem\`
- \`theme-llm\`
- \`theme-forbes-media-seo\`
- \`theme-advisor-sem-compare-coverage\`

Apply: \`<html class="theme-health-sem">\`

## Rules for AI

âœ… DO:
- Use components from this package
- Use CSS variables for styling
- Apply theme class to root element

âŒ DON'T:
- Recreate existing components
- Hardcode colors
- Mix tokens from different themes

## Component Checklist

${published.map(c => `- [x] ${c.name}`).join('\n')}
`
}

export function generatePackageJson(packageName, version) {
  return JSON.stringify({
    name: packageName,
    version,
    main: 'dist/components/index.js',
    peerDependencies: { react: '>=17.0.0' }
  }, null, 2)
}

export async function downloadPackage(components, options = {}) {
  const { packageName = '@yourorg/design-system', version = '1.0.0' } = options
  const published = components.filter(c => c.status === 'published' && c.jsx_code)

  const zip = new JSZip()
  
  zip.file('package.json', generatePackageJson(packageName, version))
  zip.file('LLMS.txt', generateLLMSTxt(components, packageName))
  zip.file('dist/tokens.css', '/* Your tokens CSS */')
  
  for (const c of published) {
    zip.file(`dist/components/${c.name}/${c.name}.jsx`, c.jsx_code)
    zip.file(`dist/components/${c.name}/index.js`, `export { ${c.name} } from './${c.name}';`)
  }
  
  zip.file('dist/components/index.js', generateComponentsIndex(published))

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${packageName.replace('@', '').replace('/', '-')}-${version}.zip`)
  
  return { componentCount: published.length }
}
```

### Test File
Create `src/lib/packageGenerator.test.js`:
```javascript
import { describe, it, expect } from 'vitest'
import { generateComponentsIndex, generateLLMSTxt, generatePackageJson } from './packageGenerator'

describe('packageGenerator', () => {
  const components = [
    { name: 'Button', status: 'published', jsx_code: 'code', props: [], variants: [] }
  ]

  it('generates component index', () => {
    const result = generateComponentsIndex(components)
    expect(result).toContain("export { Button }")
  })

  it('generates LLMS.txt', () => {
    const result = generateLLMSTxt(components, '@test/pkg')
    expect(result).toContain('@test/pkg')
    expect(result).toContain('Button')
  })

  it('generates package.json', () => {
    const result = JSON.parse(generatePackageJson('@test/pkg', '1.0.0'))
    expect(result.name).toBe('@test/pkg')
  })
})
```

---

## Task 8.2: Update Settings Page

### Instructions
Update `src/pages/Settings.jsx`

### Code
```javascript
import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { useComponents } from '../hooks/useComponents'
import { downloadPackage, generateLLMSTxt } from '../lib/packageGenerator'
import { isAIConfigured } from '../lib/generateCode'

export default function Settings() {
  const { components } = useComponents()
  const [packageName, setPackageName] = useState('@yourorg/design-system')
  const [version, setVersion] = useState('1.0.0')
  const [exporting, setExporting] = useState(false)

  const publishedCount = components.filter(c => c.status === 'published' && c.jsx_code).length

  const handleExport = async () => {
    setExporting(true)
    try {
      await downloadPackage(components, { packageName, version })
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadLLMS = () => {
    const content = generateLLMSTxt(components, packageName)
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'LLMS.txt'
    a.click()
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ color: 'var(--color-fg-heading)', marginBottom: '24px' }}>Settings</h2>

      <section style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px' }}>Export Package</h3>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Package Name</label>
            <input
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Version</label>
            <input
              value={version}
              onChange={e => setVersion(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
        </div>

        <p style={{ color: 'var(--color-fg-caption)', marginBottom: '16px' }}>
          {publishedCount} published components
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExport}
            disabled={exporting || publishedCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              background: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
              border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export Package'}
          </button>

          <button
            onClick={handleDownloadLLMS}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer'
            }}
          >
            <FileText size={16} />
            Download LLMS.txt
          </button>
        </div>
      </section>

      <section style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 16px' }}>AI Configuration</h3>
        <p>Status: {isAIConfigured() ? 'âœ“ Configured' : 'âœ— Not configured'}</p>
      </section>
    </div>
  )
}
```

---

# Phase 9: Dashboard

## Task 9.1: Create Dashboard Page

### Code
```javascript
import { Link } from 'react-router-dom'
import { Package, AlertCircle, ArrowRight } from 'lucide-react'
import { useComponents } from '../hooks/useComponents'
import Badge from '../components/ui/Badge'

export default function Dashboard() {
  const { components, loading } = useComponents()
  
  const stats = {
    total: components.length,
    published: components.filter(c => c.status === 'published').length,
    needsReview: components.filter(c => ['pending', 'generated'].includes(c.code_status)).length,
  }

  const needsAttention = components.filter(c => ['pending', 'generated'].includes(c.code_status)).slice(0, 5)

  if (loading) return <p>Loading...</p>

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} color="green" />
        <StatCard label="Needs Review" value={stats.needsReview} color="orange" />
      </div>

      {/* Needs Attention */}
      <section style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px' }}>Needs Attention</h3>
        {needsAttention.length === 0 ? (
          <p style={{ color: '#666' }}>All components up to date!</p>
        ) : (
          needsAttention.map(c => (
            <Link key={c.slug} to={`/components/${c.slug}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f5f5f5', borderRadius: '6px', marginBottom: '8px', textDecoration: 'none', color: 'inherit' }}>
              <span>{c.name}</span>
              <Badge variant={c.code_status}>{c.code_status}</Badge>
            </Link>
          ))
        )}
      </section>

      {/* Quick Actions */}
      <section style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/components" style={{ padding: '12px 24px', background: 'var(--color-btn-primary-bg)', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>View Components</Link>
          <Link to="/settings" style={{ padding: '12px 24px', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>Export Package</Link>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
      <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || 'inherit' }}>{value}</div>
    </div>
  )
}
```

---

# Phase 10: Figma Plugin

The Figma plugin is a separate project. See `PHASE_10_FIGMA_PLUGIN.md` for detailed instructions.

For now, use mock data or create components manually in the admin dashboard.

---

## Final Checklist

- [ ] Phase 1: Setup complete
- [ ] Phase 2: Foundations page works
- [ ] Phase 3: Themes page works
- [ ] Phase 4: Database connected
- [ ] Phase 5: Components list works
- [ ] Phase 6: Component detail works
- [ ] Phase 7: AI generation works
- [ ] Phase 8: Export works
- [ ] Phase 9: Dashboard works
- [ ] All tests pass: `npm test`

## ðŸŽ‰ Done!

You have a working design system admin dashboard.
