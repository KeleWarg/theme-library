import { useState } from 'react'
import { Copy, Check, Monitor, Tablet, Smartphone } from 'lucide-react'
import tokensData from '../design-system/tokens.json'

function BreakpointCard({ name, data, icon: Icon }) {
  const [copied, setCopied] = useState(null)
  
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="breakpoint-card">
      <div className="breakpoint-header">
        <Icon size={24} />
        <h3>{name}</h3>
        <span className="breakpoint-value">{data.breakpoint}px</span>
      </div>
      
      <div className="breakpoint-grid-preview">
        <div className="grid-visual" style={{
          gridTemplateColumns: `repeat(${data.columns}, 1fr)`,
          gap: `${data.gutter}px`,
          padding: `0 ${data.margin}px`
        }}>
          {Array.from({ length: data.columns }).map((_, i) => (
            <div key={i} className="grid-column" />
          ))}
        </div>
      </div>
      
      <div className="breakpoint-specs">
        <div className="spec-row" onClick={() => copyToClipboard(`var(--grid-columns-${name})`, 'columns')}>
          <span>Columns</span>
          <span>{data.columns}</span>
          {copied === 'columns' ? <Check size={14} /> : <Copy size={14} />}
        </div>
        <div className="spec-row" onClick={() => copyToClipboard(`var(--grid-margin-${name})`, 'margin')}>
          <span>Margin</span>
          <span>{data.margin}px</span>
          {copied === 'margin' ? <Check size={14} /> : <Copy size={14} />}
        </div>
        <div className="spec-row" onClick={() => copyToClipboard(`var(--grid-gutter-${name})`, 'gutter')}>
          <span>Gutter</span>
          <span>{data.gutter}px</span>
          {copied === 'gutter' ? <Check size={14} /> : <Copy size={14} />}
        </div>
      </div>
    </div>
  )
}

function SpacingScale() {
  // Common spacing scale (derived from grid values)
  const spacingTokens = [
    { name: 'spacing-2xs', value: 4 },
    { name: 'spacing-xs', value: 8 },
    { name: 'spacing-sm', value: 12 },
    { name: 'spacing-md', value: 16 },
    { name: 'spacing-lg', value: 24 },
    { name: 'spacing-xl', value: 32 },
    { name: 'spacing-2xl', value: 48 },
    { name: 'spacing-3xl', value: 64 },
    { name: 'spacing-4xl', value: 80 },
  ]

  return (
    <div className="spacing-scale">
      <h3>Spacing Scale</h3>
      <p className="section-desc">Consistent spacing values for margins, padding, and gaps</p>
      
      <div className="spacing-items">
        {spacingTokens.map(({ name, value }) => (
          <div key={name} className="spacing-item">
            <div className="spacing-visual">
              <div className="spacing-bar" style={{ width: `${value}px` }} />
            </div>
            <div className="spacing-info">
              <span className="spacing-name">{name}</span>
              <span className="spacing-value">{value}px</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GridDemo() {
  const [columns, setColumns] = useState(12)
  const [gutter, setGutter] = useState(24)
  const [margin, setMargin] = useState(80)

  return (
    <div className="grid-demo">
      <h3>Interactive Grid</h3>
      <p className="section-desc">Adjust values to see how the grid responds</p>
      
      <div className="grid-controls">
        <div className="control-group">
          <label>Columns: {columns}</label>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={columns}
            onChange={(e) => setColumns(parseInt(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Gutter: {gutter}px</label>
          <input 
            type="range" 
            min="8" 
            max="48" 
            value={gutter}
            onChange={(e) => setGutter(parseInt(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Margin: {margin}px</label>
          <input 
            type="range" 
            min="16" 
            max="120" 
            value={margin}
            onChange={(e) => setMargin(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="grid-preview-container">
        <div 
          className="grid-preview"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gutter}px`,
            padding: `24px ${margin}px`
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="grid-column-demo">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Spacing() {
  const { breakpoints } = tokensData
  
  const breakpointIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor
  }

  return (
    <div className="page spacing-page">
      <header className="page-header">
        <h1>Spacing & Grid</h1>
        <p className="subtitle">Breakpoints, columns, gutters, and spacing scale</p>
      </header>

      <section className="breakpoints-section">
        <h2>Breakpoints</h2>
        <div className="breakpoints-grid">
          {Object.entries(breakpoints).map(([name, data]) => (
            <BreakpointCard 
              key={name}
              name={name}
              data={data}
              icon={breakpointIcons[name] || Monitor}
            />
          ))}
        </div>
      </section>

      <section className="css-vars-section">
        <h3>CSS Variables Reference</h3>
        <div className="vars-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Mobile</th>
                <th>Tablet</th>
                <th>Desktop</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Breakpoint</td>
                <td>{breakpoints.mobile.breakpoint}px</td>
                <td>{breakpoints.tablet.breakpoint}px</td>
                <td>{breakpoints.desktop.breakpoint}px</td>
              </tr>
              <tr>
                <td>Columns</td>
                <td><code>--grid-columns-mobile</code> ({breakpoints.mobile.columns})</td>
                <td><code>--grid-columns-tablet</code> ({breakpoints.tablet.columns})</td>
                <td><code>--grid-columns-desktop</code> ({breakpoints.desktop.columns})</td>
              </tr>
              <tr>
                <td>Margin</td>
                <td><code>--grid-margin-mobile</code> ({breakpoints.mobile.margin}px)</td>
                <td><code>--grid-margin-tablet</code> ({breakpoints.tablet.margin}px)</td>
                <td><code>--grid-margin-desktop</code> ({breakpoints.desktop.margin}px)</td>
              </tr>
              <tr>
                <td>Gutter</td>
                <td><code>--grid-gutter-mobile</code> ({breakpoints.mobile.gutter}px)</td>
                <td><code>--grid-gutter-tablet</code> ({breakpoints.tablet.gutter}px)</td>
                <td><code>--grid-gutter-desktop</code> ({breakpoints.desktop.gutter}px)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <SpacingScale />
      <GridDemo />
    </div>
  )
}
