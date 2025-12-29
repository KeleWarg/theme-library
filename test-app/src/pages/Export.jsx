import { useState } from 'react'
import { useTheme } from '../App'
import { Download, Copy, Check, FileJson, FileCode, Palette } from 'lucide-react'
import tokensData from '../design-system/tokens.json'

function ExportCard({ title, description, icon: Icon, format, onExport, onCopy }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="export-card">
      <div className="export-icon">
        <Icon size={32} />
      </div>
      <div className="export-info">
        <h4>{title}</h4>
        <p>{description}</p>
        <span className="format-badge">{format}</span>
      </div>
      <div className="export-actions">
        <button className="btn-secondary btn-sm" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button className="btn-primary btn-sm" onClick={onExport}>
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  )
}

function CodePreview({ code, language }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-preview">
      <div className="code-header">
        <span>{language}</span>
        <button onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function Export() {
  const { currentTheme } = useTheme()
  const [selectedFormat, setSelectedFormat] = useState('css')
  const [exportScope, setExportScope] = useState('current') // 'current' or 'all'
  
  // Get current theme data
  const themeData = tokensData.themes.find(t => {
    const normalizedSlug = t.slug.replace(/\//g, '-').replace(/---/g, '-').toLowerCase()
    return normalizedSlug === currentTheme.slug.toLowerCase() ||
      t.name === currentTheme.name
  })

  // Generate CSS variables for a theme
  const generateCSS = (theme) => {
    let css = `.theme-${theme.slug.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase()} {\n`
    
    // Button colors
    if (theme.colors.button) {
      Object.entries(theme.colors.button).forEach(([variant, colors]) => {
        Object.entries(colors).forEach(([name, value]) => {
          css += `  --color-btn-${name}: ${value};\n`
        })
      })
    }
    
    // Background colors
    if (theme.colors.background) {
      Object.entries(theme.colors.background).forEach(([name, value]) => {
        css += `  --color-${name}: ${value};\n`
      })
    }
    
    // Foreground colors
    if (theme.colors.foreground) {
      Object.entries(theme.colors.foreground).forEach(([name, value]) => {
        css += `  --color-${name}: ${value};\n`
      })
    }
    
    // Superlative colors
    if (theme.colors.superlative) {
      Object.entries(theme.colors.superlative).forEach(([name, value]) => {
        css += `  --color-superlative-${name}: ${value};\n`
      })
    }
    
    css += '}\n'
    return css
  }

  // Generate SCSS variables
  const generateSCSS = (theme) => {
    let scss = `// Theme: ${theme.name}\n\n`
    
    if (theme.colors.button) {
      scss += '// Button Colors\n'
      Object.entries(theme.colors.button).forEach(([variant, colors]) => {
        Object.entries(colors).forEach(([name, value]) => {
          scss += `$btn-${name}: ${value};\n`
        })
      })
      scss += '\n'
    }
    
    if (theme.colors.background) {
      scss += '// Background Colors\n'
      Object.entries(theme.colors.background).forEach(([name, value]) => {
        scss += `$${name}: ${value};\n`
      })
      scss += '\n'
    }
    
    if (theme.colors.foreground) {
      scss += '// Foreground Colors\n'
      Object.entries(theme.colors.foreground).forEach(([name, value]) => {
        scss += `$${name}: ${value};\n`
      })
    }
    
    return scss
  }

  // Generate TypeScript types
  const generateTypeScript = () => {
    return `// Design System Token Types
export interface ButtonColors {
  'primary-bg': string;
  'primary-text': string;
  'primary-icon': string;
  'primary-hover-bg': string;
  'primary-pressed-bg': string;
  'primary-disabled-bg': string;
  'focused-border': string;
}

export interface ThemeColors {
  button: {
    primary: ButtonColors;
    secondary: Omit<ButtonColors, 'focused-border'> & { 'secondary-border': string };
    ghost: Omit<ButtonColors, 'focused-border'>;
  };
  background: Record<string, string>;
  foreground: Record<string, string>;
  superlative: {
    primary: string;
    secondary: string;
  };
}

export interface Theme {
  name: string;
  slug: string;
  colors: ThemeColors;
}

export interface DesignTokens {
  themes: Theme[];
  typography: Typography;
  breakpoints: Breakpoints;
}
`
  }

  // Generate Tailwind config
  const generateTailwind = (theme) => {
    return `// tailwind.config.js - ${theme.name} theme
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${theme.colors.button?.primary?.['primary-bg'] || '#000'}',
          hover: '${theme.colors.button?.primary?.['primary-hover-bg'] || '#000'}',
          pressed: '${theme.colors.button?.primary?.['primary-pressed-bg'] || '#000'}',
        },
        background: {
          white: '${theme.colors.background?.['bg-white'] || '#fff'}',
          subtle: '${theme.colors.background?.['bg-neutral-subtle'] || '#f5f5f5'}',
          brand: '${theme.colors.background?.['bg-brand'] || '#000'}',
        },
        foreground: {
          heading: '${theme.colors.foreground?.['fg-heading'] || '#000'}',
          body: '${theme.colors.foreground?.['fg-body'] || '#333'}',
          caption: '${theme.colors.foreground?.['fg-caption'] || '#666'}',
        },
      },
    },
  },
}
`
  }

  const getExportContent = () => {
    switch (selectedFormat) {
      case 'css':
        return exportScope === 'all' 
          ? tokensData.themes.map(t => generateCSS(t)).join('\n')
          : generateCSS(themeData)
      case 'scss':
        return exportScope === 'all'
          ? tokensData.themes.map(t => generateSCSS(t)).join('\n')
          : generateSCSS(themeData)
      case 'json':
        return exportScope === 'all'
          ? JSON.stringify(tokensData, null, 2)
          : JSON.stringify(themeData, null, 2)
      case 'typescript':
        return generateTypeScript()
      case 'tailwind':
        return generateTailwind(themeData)
      default:
        return ''
    }
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownload = () => {
    const content = getExportContent()
    const extensions = { css: 'css', scss: 'scss', json: 'json', typescript: 'ts', tailwind: 'js' }
    const mimeTypes = { 
      css: 'text/css', 
      scss: 'text/x-scss', 
      json: 'application/json', 
      typescript: 'text/typescript',
      tailwind: 'text/javascript'
    }
    const prefix = exportScope === 'all' ? 'all-themes' : currentTheme.slug.replace(/\//g, '-')
    downloadFile(content, `tokens-${prefix}.${extensions[selectedFormat]}`, mimeTypes[selectedFormat])
  }

  const handleCopy = async () => {
    const content = getExportContent()
    await navigator.clipboard.writeText(content)
  }

  return (
    <div className="page export-page">
      <header className="page-header">
        <h1>Export Tokens</h1>
        <p className="subtitle">Download or copy design tokens in various formats</p>
      </header>

      <div className="export-options">
        <div className="option-group">
          <label>Export Scope</label>
          <div className="toggle-buttons">
            <button 
              className={exportScope === 'current' ? 'active' : ''}
              onClick={() => setExportScope('current')}
            >
              Current Theme ({currentTheme.name})
            </button>
            <button 
              className={exportScope === 'all' ? 'active' : ''}
              onClick={() => setExportScope('all')}
            >
              All Themes
            </button>
          </div>
        </div>
      </div>

      <div className="export-formats">
        <h3>Choose Format</h3>
        <div className="format-cards">
          <ExportCard 
            title="CSS Variables"
            description="Ready-to-use CSS custom properties"
            icon={FileCode}
            format=".css"
            onExport={() => { setSelectedFormat('css'); handleDownload() }}
            onCopy={() => { setSelectedFormat('css'); return handleCopy() }}
          />
          <ExportCard 
            title="SCSS Variables"
            description="Sass variables for preprocessor workflows"
            icon={FileCode}
            format=".scss"
            onExport={() => { setSelectedFormat('scss'); handleDownload() }}
            onCopy={() => { setSelectedFormat('scss'); return handleCopy() }}
          />
          <ExportCard 
            title="JSON"
            description="Raw token data for any platform"
            icon={FileJson}
            format=".json"
            onExport={() => { setSelectedFormat('json'); handleDownload() }}
            onCopy={() => { setSelectedFormat('json'); return handleCopy() }}
          />
          <ExportCard 
            title="TypeScript"
            description="Type definitions for token structure"
            icon={FileCode}
            format=".ts"
            onExport={() => { setSelectedFormat('typescript'); handleDownload() }}
            onCopy={() => { setSelectedFormat('typescript'); return handleCopy() }}
          />
          <ExportCard 
            title="Tailwind Config"
            description="Theme extension for Tailwind CSS"
            icon={Palette}
            format=".js"
            onExport={() => { setSelectedFormat('tailwind'); handleDownload() }}
            onCopy={() => { setSelectedFormat('tailwind'); return handleCopy() }}
          />
        </div>
      </div>

      <section className="preview-section">
        <h3>Preview</h3>
        <div className="format-tabs">
          {['css', 'scss', 'json', 'typescript', 'tailwind'].map(format => (
            <button 
              key={format}
              className={selectedFormat === format ? 'active' : ''}
              onClick={() => setSelectedFormat(format)}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <CodePreview 
          code={getExportContent()}
          language={selectedFormat}
        />
      </section>
    </div>
  )
}
