import { useState, useEffect, useMemo } from 'react'
import { Download, FileText, Package, Check, AlertCircle, Figma, RefreshCw } from 'lucide-react'
import { useComponents } from '../hooks/useComponents'
import { downloadPackage, generateLLMSTxt } from '../lib/packageGenerator'
import { isAIConfigured } from '../lib/ai/generateCode'
import { getRecentSyncs } from '../lib/componentSync'
import { getThemes } from '../lib/themeService'
import AIExportPanel from '../components/AIExportPanel'
import { getAllColorTokens, getAllTypographyTokens, spacingTokens } from '../lib/tokenData'

export default function Settings() {
  const { components, loading } = useComponents()
  const [packageName, setPackageName] = useState('@yourorg/design-system')
  const [version, setVersion] = useState('1.0.0')
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)
  const [availableThemes, setAvailableThemes] = useState([])

  // Fetch themes for AI export
  useEffect(() => {
    async function fetchThemes() {
      try {
        const themes = await getThemes()
        setAvailableThemes(themes.map(t => t.slug || t.name))
      } catch (err) {
        console.error('Failed to fetch themes:', err)
        setAvailableThemes(['theme-system-default'])
      }
    }
    fetchThemes()
  }, [])

  // Build tokens array for AI export (transform to DesignToken format)
  const allTokens = useMemo(() => {
    const tokens = []
    
    // Add color tokens
    getAllColorTokens().forEach(t => {
      tokens.push({
        path: t.variable.replace('--', '').replace(/-/g, '.'),
        name: t.name,
        category: 'color',
        type: 'color',
        value: t.variable, // CSS variable reference
        cssVar: t.variable,
      })
    })
    
    // Add typography tokens
    getAllTypographyTokens().forEach(t => {
      tokens.push({
        path: t.variable.replace('--', '').replace(/-/g, '.'),
        name: t.name,
        category: 'typography',
        type: 'string',
        value: t.value,
        cssVar: t.variable,
      })
    })
    
    // Add spacing tokens
    spacingTokens.forEach(t => {
      tokens.push({
        path: t.variable.replace('--', '').replace(/-/g, '.'),
        name: t.name,
        category: 'spacing',
        type: 'string',
        value: t.value,
        cssVar: t.variable,
      })
    })
    
    return tokens
  }, [])

  // Build AI export bundle
  const aiBundle = useMemo(() => ({
    tokens: allTokens,
    components: components.map(c => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      props: c.prop_types,
      variants: c.variants,
      jsx_code: c.jsx_code,
      status: c.status,
    })),
    themes: availableThemes,
    metadata: {
      packageName,
      version,
      exportedAt: new Date().toISOString(),
    },
  }), [allTokens, components, availableThemes, packageName, version])

  const publishedComponents = components.filter(c => c.status === 'published' && c.jsx_code)
  const publishedCount = publishedComponents.length

  const handleExport = async () => {
    setExporting(true)
    setExportResult(null)
    try {
      const result = await downloadPackage(components, { packageName, version })
      setExportResult({ success: true, ...result })
    } catch (err) {
      setExportResult({ success: false, error: err.message })
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
    URL.revokeObjectURL(a.href)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ 
        color: 'var(--color-fg-heading)', 
        fontSize: 'var(--font-size-heading-md)',
        marginBottom: '24px' 
      }}>
        Settings
      </h2>

      {/* Export Package Section */}
      <section style={{ 
        background: 'var(--color-bg-white)', 
        padding: '24px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Package size={24} color="var(--color-fg-heading)" />
          <h3 style={{ margin: 0, color: 'var(--color-fg-heading)' }}>Export Package</h3>
        </div>

        <p style={{ color: 'var(--color-fg-body)', marginBottom: '24px' }}>
          Generate a downloadable npm package with your published components, design tokens, and AI-friendly documentation.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-fg-caption)'
            }}>
              Package Name
            </label>
            <input
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              placeholder="@yourorg/design-system"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid var(--color-bg-neutral-medium)', 
                borderRadius: '6px',
                fontSize: 'var(--font-size-body-md)',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: 'var(--font-size-body-sm)',
              color: 'var(--color-fg-caption)'
            }}>
              Version
            </label>
            <input
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="1.0.0"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid var(--color-bg-neutral-medium)', 
                borderRadius: '6px',
                fontSize: 'var(--font-size-body-md)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Published Components Preview */}
        <div style={{ 
          background: 'var(--color-bg-neutral-light)', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: publishedCount > 0 ? '12px' : '0'
          }}>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-fg-heading)' }}>
              Components to Export
            </span>
            <span style={{ 
              padding: '4px 12px', 
              background: publishedCount > 0 ? 'var(--color-fg-feedback-success)' : 'var(--color-fg-caption)',
              color: 'white',
              borderRadius: '12px',
              fontSize: 'var(--font-size-body-sm)'
            }}>
              {loading ? '...' : `${publishedCount} published`}
            </span>
          </div>
          
          {publishedCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {publishedComponents.map(c => (
                <span 
                  key={c.slug}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--color-bg-white)',
                    borderRadius: '4px',
                    fontSize: 'var(--font-size-body-sm)',
                    color: 'var(--color-fg-body)',
                    border: '1px solid var(--color-bg-neutral-medium)'
                  }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
          
          {publishedCount === 0 && !loading && (
            <p style={{ margin: '8px 0 0', color: 'var(--color-fg-caption)', fontSize: 'var(--font-size-body-sm)' }}>
              No published components yet. Approve and publish components to include them in the export.
            </p>
          )}
        </div>

        {/* Export Result */}
        {exportResult && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '6px',
            marginBottom: '16px',
            background: exportResult.success ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {exportResult.success ? (
              <>
                <Check size={16} color="var(--color-fg-feedback-success)" />
                <span style={{ color: 'var(--color-fg-feedback-success)' }}>
                  Successfully exported {exportResult.componentCount} components!
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={16} color="var(--color-fg-feedback-error)" />
                <span style={{ color: 'var(--color-fg-feedback-error)' }}>
                  Export failed: {exportResult.error}
                </span>
              </>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            disabled={exporting || publishedCount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: publishedCount > 0 ? 'var(--color-btn-primary-bg)' : 'var(--color-bg-neutral-medium)',
              color: publishedCount > 0 ? 'var(--color-btn-primary-text)' : 'var(--color-fg-caption)',
              border: 'none',
              borderRadius: '6px',
              cursor: exporting || publishedCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-body-md)',
              fontWeight: 'var(--font-weight-semibold)',
              opacity: exporting ? 0.7 : 1
            }}
          >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export Package (.zip)'}
          </button>

          <button
            onClick={handleDownloadLLMS}
            disabled={publishedCount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid var(--color-bg-neutral-medium)',
              borderRadius: '6px',
              cursor: publishedCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-body-md)',
              color: 'var(--color-fg-body)',
              opacity: publishedCount === 0 ? 0.5 : 1
            }}
          >
            <FileText size={18} />
            Download LLMS.txt Only
          </button>
        </div>

        {/* Package Contents Preview */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-bg-neutral-medium)' }}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--color-fg-heading)', fontSize: 'var(--font-size-body-md)' }}>
            Package Contents
          </h4>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '13px', 
            background: '#1E1E1E',
            color: '#D4D4D4',
            padding: '16px',
            borderRadius: '6px',
            lineHeight: '1.6'
          }}>
            <div style={{ color: '#569CD6' }}>{packageName.replace('@', '').replace('/', '-')}-{version}.zip</div>
            <div style={{ paddingLeft: '16px' }}>
              <div>├── <span style={{ color: '#DCDCAA' }}>package.json</span></div>
              <div>├── <span style={{ color: '#DCDCAA' }}>README.md</span></div>
              <div>├── <span style={{ color: '#CE9178' }}>LLMS.txt</span> <span style={{ color: '#6A9955' }}>← AI documentation</span></div>
              <div>└── dist/</div>
              <div style={{ paddingLeft: '24px' }}>
                <div>├── tokens/</div>
                <div style={{ paddingLeft: '24px' }}>
                  <div>├── <span style={{ color: '#9CDCFE' }}>tokens.css</span></div>
                  <div>├── <span style={{ color: '#9CDCFE' }}>tokens.json</span></div>
                  <div>└── <span style={{ color: '#9CDCFE' }}>tokens.ts</span></div>
                </div>
                <div>└── components/</div>
                <div style={{ paddingLeft: '24px' }}>
                  <div>├── <span style={{ color: '#DCDCAA' }}>index.js</span></div>
                  {publishedComponents.slice(0, 3).map(c => (
                    <div key={c.slug}>├── {c.name}/</div>
                  ))}
                  {publishedComponents.length > 3 && (
                    <div style={{ color: '#6A9955' }}>└── ... {publishedComponents.length - 3} more</div>
                  )}
                  {publishedComponents.length === 0 && (
                    <div style={{ color: '#6A9955' }}>└── (no components yet)</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Figma Plugin Section */}
      <section style={{ 
        background: 'var(--color-bg-white)', 
        padding: '24px', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Figma size={24} color="var(--color-fg-heading)" />
          <h3 style={{ margin: 0, color: 'var(--color-fg-heading)' }}>Figma Plugin</h3>
        </div>

        <p style={{ color: 'var(--color-fg-body)', marginBottom: '20px' }}>
          Sync components directly from Figma to this dashboard using our plugin.
        </p>

        <div style={{ 
          background: 'var(--color-bg-neutral-light)', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 'var(--font-size-body-md)', color: 'var(--color-fg-heading)' }}>
            Installation
          </h4>
          <ol style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            color: 'var(--color-fg-body)',
            fontSize: 'var(--font-size-body-sm)',
            lineHeight: '1.8'
          }}>
            <li>Open the <code style={{ background: '#1E1E1E', padding: '2px 6px', borderRadius: '3px', color: '#D4D4D4' }}>figma-plugin/</code> folder in terminal</li>
            <li>Run <code style={{ background: '#1E1E1E', padding: '2px 6px', borderRadius: '3px', color: '#D4D4D4' }}>npm install && npm run build</code></li>
            <li>In Figma: <strong>Plugins → Development → Import plugin from manifest</strong></li>
            <li>Select the <code style={{ background: '#1E1E1E', padding: '2px 6px', borderRadius: '3px', color: '#D4D4D4' }}>manifest.json</code> file</li>
          </ol>
        </div>

        <div style={{ 
          background: 'var(--color-bg-neutral-light)', 
          padding: '16px', 
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 'var(--font-size-body-md)', color: 'var(--color-fg-heading)' }}>
            Usage
          </h4>
          <ol style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            color: 'var(--color-fg-body)',
            fontSize: 'var(--font-size-body-sm)',
            lineHeight: '1.8'
          }}>
            <li>Select a <strong>Component</strong> or <strong>Component Set</strong> in Figma</li>
            <li>Run: <strong>Plugins → Development → Design System Component Syncer</strong></li>
            <li>Review extracted metadata (variants, props, tokens)</li>
            <li>Click <strong>Sync to Dashboard</strong></li>
          </ol>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <div style={{
            flex: 1,
            padding: '12px 16px',
            background: '#2D2D2D',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#D4D4D4'
          }}>
            <span style={{ color: '#6A9955' }}>API Endpoint:</span>{' '}
            <span style={{ color: '#CE9178' }}>http://localhost:3001/api/components</span>
          </div>
        </div>
      </section>

      {/* AI Configuration Section */}
      <section style={{ 
        background: 'var(--color-bg-white)', 
        padding: '24px', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-fg-heading)' }}>AI Configuration</h3>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '16px',
          background: isAIConfigured() ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          borderRadius: '8px'
        }}>
          {isAIConfigured() ? (
            <>
              <Check size={20} color="var(--color-fg-feedback-success)" />
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-fg-heading)' }}>
                  AI Generation Enabled
                </div>
                <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-fg-caption)' }}>
                  Claude API is configured and ready to generate component code
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} color="var(--color-fg-feedback-warning)" />
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-fg-heading)' }}>
                  AI Generation Not Configured
                </div>
                <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-fg-caption)' }}>
                  Add VITE_ANTHROPIC_API_KEY to your .env.local file to enable AI code generation
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* AI Export Panel */}
      <AIExportPanel bundle={aiBundle} />
    </div>
  )
}
