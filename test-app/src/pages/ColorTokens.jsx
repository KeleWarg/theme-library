import { useState, useMemo } from 'react'
import { useTheme } from '../App'
import { Copy, Check, Search } from 'lucide-react'
import tokensData from '../design-system/tokens.json'

function ColorSwatch({ name, value, cssVar, category }) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate if text should be light or dark based on background
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }
  
  const textColor = getLuminance(value) > 0.5 ? '#1E2125' : '#FFFFFF'

  return (
    <div className="color-swatch">
      <div 
        className="swatch-preview" 
        style={{ backgroundColor: value, color: textColor }}
        onClick={() => copyToClipboard(value)}
      >
        <span className="swatch-value">{value}</span>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </div>
      <div className="swatch-info">
        <span className="swatch-name">{name}</span>
        <code className="swatch-var" onClick={() => copyToClipboard(cssVar)}>
          {cssVar}
        </code>
      </div>
    </div>
  )
}

function ColorCategory({ title, colors, prefix }) {
  if (!colors || typeof colors !== 'object') return null
  
  // Handle nested color objects (like button states)
  const isNested = Object.values(colors).some(v => typeof v === 'object')
  
  if (isNested) {
    return (
      <div className="color-category">
        <h3>{title}</h3>
        {Object.entries(colors).map(([subCategory, subColors]) => (
          <div key={subCategory} className="color-subcategory">
            <h4>{subCategory}</h4>
            <div className="swatches-grid">
              {Object.entries(subColors).map(([name, value]) => (
                <ColorSwatch 
                  key={name}
                  name={name}
                  value={value}
                  cssVar={`var(--color-${prefix}-${name})`}
                  category={subCategory}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="color-category">
      <h3>{title}</h3>
      <div className="swatches-grid">
        {Object.entries(colors).map(([name, value]) => (
          <ColorSwatch 
            key={name}
            name={name}
            value={value}
            cssVar={`var(--color-${name})`}
            category={title}
          />
        ))}
      </div>
    </div>
  )
}

export default function ColorTokens() {
  const { currentTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  
  // Find current theme data
  const themeData = useMemo(() => {
    return tokensData.themes.find(t => {
      const normalizedSlug = t.slug.replace(/\//g, '-').replace(/---/g, '-').toLowerCase()
      return normalizedSlug === currentTheme.slug.toLowerCase() ||
        t.name === currentTheme.name
    })
  }, [currentTheme])

  if (!themeData) {
    return <div className="page">Theme not found</div>
  }

  const categories = Object.keys(themeData.colors)
  
  // Filter colors based on search
  const filterColors = (colors) => {
    if (!searchQuery) return colors
    
    const filtered = {}
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const subFiltered = {}
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'object') {
            const deepFiltered = {}
            Object.entries(subValue).forEach(([deepKey, deepValue]) => {
              if (deepKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  deepValue.toLowerCase().includes(searchQuery.toLowerCase())) {
                deepFiltered[deepKey] = deepValue
              }
            })
            if (Object.keys(deepFiltered).length) subFiltered[subKey] = deepFiltered
          } else if (subKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     subValue.toLowerCase().includes(searchQuery.toLowerCase())) {
            subFiltered[subKey] = subValue
          }
        })
        if (Object.keys(subFiltered).length) filtered[key] = subFiltered
      } else if (key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 value.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered[key] = value
      }
    })
    return filtered
  }

  const filteredColors = activeCategory === 'all' 
    ? Object.fromEntries(
        Object.entries(themeData.colors).map(([k, v]) => [k, filterColors(v)])
      )
    : { [activeCategory]: filterColors(themeData.colors[activeCategory]) }

  return (
    <div className="page color-tokens-page">
      <header className="page-header">
        <h1>Color Tokens</h1>
        <p className="subtitle">
          {currentTheme.name} • Click any swatch to copy
        </p>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="category-tabs">
          <button 
            className={`tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="colors-container">
        {Object.entries(filteredColors).map(([category, colors]) => (
          <ColorCategory 
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            colors={colors}
            prefix={category === 'button' ? 'btn' : category.slice(0, 2)}
          />
        ))}
      </div>
    </div>
  )
}
