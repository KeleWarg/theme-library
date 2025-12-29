import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import tokensData from '../design-system/tokens.json'

function TypographyRow({ name, size, cssVar, previewText = "The quick brown fox" }) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <tr className="typography-row">
      <td className="type-name">{name}</td>
      <td className="type-value">{size}px</td>
      <td className="type-var">
        <code onClick={() => copyToClipboard(cssVar)}>
          {cssVar}
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </code>
      </td>
      <td className="type-preview" style={{ fontSize: `${size}px` }}>
        {previewText}
      </td>
    </tr>
  )
}

function WeightSwatch({ name, weight, cssVar }) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="weight-swatch">
      <div className="weight-preview" style={{ fontWeight: weight }}>
        Aa
      </div>
      <div className="weight-info">
        <span className="weight-name">{name}</span>
        <span className="weight-value">{weight}</span>
        <code onClick={() => copyToClipboard(cssVar)}>
          {cssVar}
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </code>
      </div>
    </div>
  )
}

function LineHeightRow({ name, value, cssVar }) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="line-height-item">
      <div className="lh-demo" style={{ lineHeight: `${value}px` }}>
        <span>Line height: {value}px</span>
        <br />
        <span>Second line for reference</span>
      </div>
      <div className="lh-info">
        <span className="lh-name">{name}</span>
        <code onClick={() => copyToClipboard(cssVar)}>
          {cssVar}
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </code>
      </div>
    </div>
  )
}

export default function Typography() {
  const [activeTab, setActiveTab] = useState('sizes')
  const { fontSize, fontWeight, lineHeight, fontFamily, letterSpacing } = tokensData.typography

  return (
    <div className="page typography-page">
      <header className="page-header">
        <h1>Typography</h1>
        <p className="subtitle">Font sizes, weights, line heights, and font families</p>
      </header>

      <div className="toolbar">
        <div className="category-tabs">
          <button 
            className={`tab ${activeTab === 'sizes' ? 'active' : ''}`}
            onClick={() => setActiveTab('sizes')}
          >
            Font Sizes
          </button>
          <button 
            className={`tab ${activeTab === 'weights' ? 'active' : ''}`}
            onClick={() => setActiveTab('weights')}
          >
            Weights
          </button>
          <button 
            className={`tab ${activeTab === 'lineheight' ? 'active' : ''}`}
            onClick={() => setActiveTab('lineheight')}
          >
            Line Heights
          </button>
          <button 
            className={`tab ${activeTab === 'families' ? 'active' : ''}`}
            onClick={() => setActiveTab('families')}
          >
            Font Families
          </button>
        </div>
      </div>

      {activeTab === 'sizes' && (
        <section className="typography-section">
          <h3>Font Sizes</h3>
          <table className="typography-table">
            <thead>
              <tr>
                <th>Token Name</th>
                <th>Size</th>
                <th>CSS Variable</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fontSize)
                .sort((a, b) => b[1] - a[1])
                .map(([name, size]) => (
                  <TypographyRow 
                    key={name}
                    name={name}
                    size={size}
                    cssVar={`var(--font-size-${name})`}
                  />
                ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'weights' && (
        <section className="typography-section">
          <h3>Font Weights</h3>
          <div className="weights-grid">
            {Object.entries(fontWeight)
              .sort((a, b) => b[1] - a[1])
              .map(([name, weight]) => (
                <WeightSwatch 
                  key={name}
                  name={name.replace('font-weight-', '')}
                  weight={weight}
                  cssVar={`var(--${name})`}
                />
              ))}
          </div>
        </section>
      )}

      {activeTab === 'lineheight' && (
        <section className="typography-section">
          <h3>Line Heights</h3>
          <div className="line-heights-grid">
            {Object.entries(lineHeight)
              .sort((a, b) => b[1] - a[1])
              .map(([name, value]) => (
                <LineHeightRow 
                  key={name}
                  name={name}
                  value={value}
                  cssVar={`var(--${name})`}
                />
              ))}
          </div>
        </section>
      )}

      {activeTab === 'families' && (
        <section className="typography-section">
          <h3>Font Families</h3>
          <div className="font-families-list">
            {Object.entries(fontFamily).map(([name, family]) => (
              <div key={name} className="font-family-item">
                <div className="ff-preview" style={{ fontFamily: family }}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789
                </div>
                <div className="ff-info">
                  <span className="ff-name">{name}</span>
                  <span className="ff-value">{family}</span>
                  <code>var(--{name})</code>
                </div>
              </div>
            ))}
          </div>
          
          <h3 style={{ marginTop: '32px' }}>Letter Spacing</h3>
          <div className="letter-spacing-list">
            {Object.entries(letterSpacing).map(([name, value]) => (
              <div key={name} className="ls-item">
                <div className="ls-preview" style={{ letterSpacing: `${value}px` }}>
                  LETTER SPACING EXAMPLE
                </div>
                <div className="ls-info">
                  <span>{name}</span>
                  <span>{value}px</span>
                  <code>var(--{name})</code>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
