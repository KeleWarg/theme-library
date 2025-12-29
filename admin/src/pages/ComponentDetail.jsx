import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Sparkles, CheckCircle, Upload, ExternalLink, Copy, Check } from 'lucide-react'
import { useComponent } from '../hooks/useComponent'
import { useTheme } from '../hooks/useTheme'
import Tabs from '../components/ui/Tabs'
import Badge from '../components/ui/Badge'
import CodeEditor from '../components/ui/CodeEditor'
import PropsTable from '../components/ui/PropsTable'
import ComponentPreview from '../components/ui/ComponentPreview'
import { themes } from '../lib/tokenData'

const tabs = [
  { id: 'figma', label: 'Figma' },
  { id: 'code', label: 'Code' },
  { id: 'props', label: 'Props' },
]

export default function ComponentDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { component, loading, error, update } = useComponent(slug)
  const { theme: globalTheme } = useTheme()
  
  const [activeTab, setActiveTab] = useState('code')
  const [localCode, setLocalCode] = useState('')
  const [localProps, setLocalProps] = useState([])
  const [previewTheme, setPreviewTheme] = useState(globalTheme)
  const [previewProps, setPreviewProps] = useState({ children: 'Click me' })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Initialize local state when component loads
  useEffect(() => {
    if (component) {
      setLocalCode(component.jsx_code || '')
      setLocalProps(component.props || [])
    }
  }, [component])

  const handleSave = async () => {
    setSaving(true)
    try {
      await update({
        jsx_code: localCode,
        props: localProps,
      })
    } catch (err) {
      console.error('Error saving:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newCodeStatus, newStatus) => {
    try {
      const updates = {}
      if (newCodeStatus) updates.code_status = newCodeStatus
      if (newStatus) updates.status = newStatus
      await update(updates)
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(localCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <p style={{ color: 'var(--color-fg-caption)' }}>Loading component...</p>
      </div>
    )
  }

  if (error || !component) {
    return (
      <div>
        <button 
          onClick={() => navigate('/components')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg-body)', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Components
        </button>
        <div style={{ background: 'var(--color-bg-white)', padding: '48px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-fg-feedback-error)', margin: 0 }}>
            {error ? error.message : 'Component not found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/components')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg-caption)', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Components
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--color-fg-heading)', fontSize: 'var(--font-size-heading-lg)' }}>{component.name}</h1>
            <p style={{ margin: '8px 0', color: 'var(--color-fg-body)' }}>{component.description}</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge variant={component.code_status}>{component.code_status}</Badge>
              <Badge variant={component.status}>{component.status}</Badge>
              {component.category && (
                <span style={{ fontSize: '14px', color: 'var(--color-fg-caption)' }}>• {component.category}</span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Generate Code button */}
            {component.code_status === 'pending' && (
              <button
                onClick={() => handleStatusChange('generated')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <Sparkles size={16} />
                Generate Code
              </button>
            )}
            
            {/* Approve button */}
            {component.code_status === 'generated' && (
              <button
                onClick={() => handleStatusChange('approved')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <CheckCircle size={16} />
                Approve
              </button>
            )}
            
            {/* Publish button */}
            {component.code_status === 'approved' && component.status !== 'published' && (
              <button
                onClick={() => handleStatusChange(null, 'published')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#065F46',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <Upload size={16} />
                Publish
              </button>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'var(--color-btn-primary-bg)',
                color: 'var(--color-btn-primary-text)',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                fontWeight: 500,
              }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
        {/* Left column - Figma/Code/Props */}
        <div>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          
          <div style={{ marginTop: '16px', background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px' }}>
            {activeTab === 'figma' && (
              <FigmaTab component={component} />
            )}
            
            {activeTab === 'code' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: 'var(--color-fg-heading)', fontSize: '16px' }}>JSX Code</h3>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: 'var(--color-bg-neutral-light)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: 'var(--color-fg-body)',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <CodeEditor
                  value={localCode}
                  onChange={setLocalCode}
                  language="javascript"
                  height="500px"
                />
              </div>
            )}
            
            {activeTab === 'props' && (
              <div>
                <h3 style={{ margin: '0 0 16px', color: 'var(--color-fg-heading)', fontSize: '16px' }}>Component Props</h3>
                <PropsTable
                  props={localProps}
                  onChange={setLocalProps}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right column - Preview */}
        <div>
          <div style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', position: 'sticky', top: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--color-fg-heading)' }}>Live Preview</h3>
            
            {/* Theme selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--color-fg-caption)' }}>Preview Theme</label>
              <select
                value={previewTheme}
                onChange={e => setPreviewTheme(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--color-border-default)',
                  fontSize: '14px',
                  background: 'white',
                }}
              >
                {themes.map(t => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <ComponentPreview
              code={localCode}
              componentProps={previewProps}
              theme={previewTheme}
            />

            {/* Variant buttons */}
            {component.variants && component.variants.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--color-fg-caption)' }}>Variants</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {component.variants.map((v, i) => {
                    const variantName = typeof v === 'string' ? v : v.name
                    const variantProps = typeof v === 'string' ? { variant: v } : v.props
                    return (
                      <button
                        key={i}
                        onClick={() => setPreviewProps(prev => ({ ...prev, ...variantProps }))}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: '4px',
                          background: previewProps.variant === (variantProps?.variant || variantName) ? 'var(--color-bg-neutral-light)' : 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {variantName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Props controls */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--color-fg-caption)' }}>Preview Props</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  placeholder="children (button text)"
                  value={previewProps.children || ''}
                  onChange={e => setPreviewProps(prev => ({ ...prev, children: e.target.value }))}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid var(--color-border-default)', 
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={previewProps.disabled || false}
                    onChange={e => setPreviewProps(prev => ({ ...prev, disabled: e.target.checked }))}
                  />
                  disabled
                </label>
              </div>
            </div>

            {/* Figma link */}
            {component.figma_url && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-default)' }}>
                <a
                  href={component.figma_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--color-fg-body)',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  Open in Figma
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Figma tab sub-component
function FigmaTab({ component }) {
  return (
    <div>
      {/* Preview image */}
      {component.preview_image && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-fg-heading)', margin: '0 0 12px' }}>Preview from Figma</h4>
          <img 
            src={component.preview_image} 
            alt={component.name} 
            style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--color-border-default)' }} 
          />
        </div>
      )}

      {/* Variants */}
      {component.variants && component.variants.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-fg-heading)', margin: '0 0 12px' }}>Variants</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {component.variants.map((v, i) => {
              const variantName = typeof v === 'string' ? v : v.name
              return <Badge key={i} variant="default">{variantName}</Badge>
            })}
          </div>
        </div>
      )}

      {/* Linked tokens */}
      {component.linked_tokens && component.linked_tokens.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-fg-heading)', margin: '0 0 12px' }}>Tokens Used</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {component.linked_tokens.map(token => (
              <code
                key={token}
                style={{
                  padding: '4px 8px',
                  background: 'var(--color-bg-neutral-light)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => navigator.clipboard.writeText(`var(--${token})`)}
                title="Click to copy"
              >
                {token}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Figma properties */}
      {component.figma_properties && component.figma_properties.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-fg-heading)', margin: '0 0 12px' }}>Figma Properties</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {component.figma_properties.map((prop, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ fontSize: '13px', fontWeight: 500 }}>{prop.name}</code>
                <span style={{ color: 'var(--color-fg-caption)', fontSize: '13px' }}>{prop.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!component.preview_image && !component.variants?.length && !component.linked_tokens?.length && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--color-fg-caption)', margin: 0 }}>
            No Figma data available. Sync this component from Figma to see details.
          </p>
        </div>
      )}
    </div>
  )
}
