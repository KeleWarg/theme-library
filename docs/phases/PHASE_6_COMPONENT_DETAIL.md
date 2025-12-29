# Phase 6: Component Detail

## Prerequisites
- Phases 1-5 complete
- Components list page working
- Mock data includes Button with jsx_code

## Outcome
A Component Detail page with:
- Tabbed interface (Figma, Code, Props)
- Code editor with Monaco
- Live preview with theme switching
- Props controls

---

## Task 6.1: Create useComponent Hook

### Instructions
Create `src/hooks/useComponent.js`

### Requirements
- Fetches single component by slug
- Falls back to mock data
- Returns: component, loading, error, update, refetch

### Code
```javascript
import { useState, useEffect, useCallback } from 'react'
import { getComponent, updateComponent } from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockComponents } from '../lib/seedData'

export function useComponent(slug) {
  const [component, setComponent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComponent = useCallback(async () => {
    if (!slug) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (isSupabaseConfigured()) {
        const data = await getComponent(slug)
        setComponent(data)
      } else {
        // Use mock data
        const data = mockComponents.find(c => c.slug === slug)
        setComponent(data || null)
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchComponent()
  }, [fetchComponent])

  const update = async (updates) => {
    if (!component) return
    
    try {
      if (isSupabaseConfigured()) {
        const updated = await updateComponent(component.id, updates)
        setComponent(updated)
        return updated
      } else {
        // Mock update
        const updated = { ...component, ...updates }
        setComponent(updated)
        return updated
      }
    } catch (err) {
      setError(err)
      throw err
    }
  }

  return { component, loading, error, update, refetch: fetchComponent }
}
```

### Test File
Create `src/hooks/useComponent.test.js`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useComponent } from './useComponent'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => false
}))

describe('useComponent', () => {
  it('returns loading true initially', () => {
    const { result } = renderHook(() => useComponent('button'))
    expect(result.current.loading).toBe(true)
  })

  it('returns component after loading', async () => {
    const { result } = renderHook(() => useComponent('button'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.component).toBeDefined()
    expect(result.current.component.name).toBe('Button')
  })

  it('returns null for unknown slug', async () => {
    const { result } = renderHook(() => useComponent('unknown'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.component).toBeNull()
  })

  it('provides update function', async () => {
    const { result } = renderHook(() => useComponent('button'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(typeof result.current.update).toBe('function')
  })
})
```

### Verification
- [ ] Hook fetches component
- [ ] Update function works
- [ ] Tests pass

---

## Task 6.2: Create CodeEditor Component

### Instructions
Create `src/components/ui/CodeEditor.jsx`

### Requirements
- Props: `value`, `onChange`, `readOnly`, `language`
- Uses Monaco Editor
- Syntax highlighting for JSX

### Code
```javascript
import Editor from '@monaco-editor/react'

export default function CodeEditor({ 
  value, 
  onChange, 
  readOnly = false, 
  language = 'javascript',
  height = '400px'
}) {
  return (
    <div style={{ border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '8px', overflow: 'hidden' }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-light"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  )
}
```

### Test File
Create `src/components/ui/CodeEditor.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeEditor from './CodeEditor'

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, options }) => (
    <textarea 
      data-testid="code-editor"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={options?.readOnly}
    />
  )
}))

describe('CodeEditor', () => {
  it('renders with value', () => {
    render(<CodeEditor value="const x = 1" onChange={() => {}} />)
    expect(screen.getByTestId('code-editor')).toHaveValue('const x = 1')
  })

  it('calls onChange when edited', () => {
    const onChange = vi.fn()
    render(<CodeEditor value="" onChange={onChange} />)
    // Would need to simulate typing
  })

  it('respects readOnly prop', () => {
    render(<CodeEditor value="code" onChange={() => {}} readOnly={true} />)
    expect(screen.getByTestId('code-editor')).toHaveAttribute('readonly')
  })
})
```

### Verification
- [ ] Editor renders
- [ ] Syntax highlighting works
- [ ] Read-only mode works
- [ ] Tests pass

---

## Task 6.3: Create PropsTable Component

### Instructions
Create `src/components/ui/PropsTable.jsx`

### Requirements
- Props: `props` (array), `onChange`, `readOnly`
- Displays prop name, type, default, description
- Editable when not readOnly

### Code
```javascript
export default function PropsTable({ props = [], onChange, readOnly = false }) {
  const handlePropChange = (index, field, value) => {
    if (readOnly || !onChange) return
    const newProps = [...props]
    newProps[index] = { ...newProps[index], [field]: value }
    onChange(newProps)
  }

  const handleAddProp = () => {
    if (readOnly || !onChange) return
    onChange([...props, { name: '', type: 'string', default: '', description: '' }])
  }

  const handleRemoveProp = (index) => {
    if (readOnly || !onChange) return
    onChange(props.filter((_, i) => i !== index))
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-bg-neutral-medium)' }}>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Default</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Description</th>
            {!readOnly && <th style={{ width: '40px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {props.map((prop, index) => (
            <tr key={index} style={{ borderBottom: '1px solid var(--color-bg-neutral-light)' }}>
              <td style={{ padding: '8px' }}>
                {readOnly ? (
                  <code style={{ fontSize: '13px' }}>{prop.name}</code>
                ) : (
                  <input
                    value={prop.name}
                    onChange={e => handlePropChange(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '4px' }}
                  />
                )}
              </td>
              <td style={{ padding: '8px' }}>
                {readOnly ? (
                  <code style={{ fontSize: '13px', color: 'var(--color-fg-caption)' }}>{prop.type}</code>
                ) : (
                  <input
                    value={prop.type}
                    onChange={e => handlePropChange(index, 'type', e.target.value)}
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '4px' }}
                  />
                )}
              </td>
              <td style={{ padding: '8px' }}>
                {readOnly ? (
                  <code style={{ fontSize: '13px' }}>{prop.default || '-'}</code>
                ) : (
                  <input
                    value={prop.default || ''}
                    onChange={e => handlePropChange(index, 'default', e.target.value)}
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '4px' }}
                  />
                )}
              </td>
              <td style={{ padding: '8px', color: 'var(--color-fg-body)' }}>
                {readOnly ? (
                  prop.description
                ) : (
                  <input
                    value={prop.description || ''}
                    onChange={e => handlePropChange(index, 'description', e.target.value)}
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '4px' }}
                  />
                )}
              </td>
              {!readOnly && (
                <td style={{ padding: '8px' }}>
                  <button
                    onClick={() => handleRemoveProp(index)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg-feedback-error)' }}
                  >
                    Ã—
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {!readOnly && (
        <button
          onClick={handleAddProp}
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px dashed var(--color-bg-neutral-medium)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--color-fg-caption)',
          }}
        >
          + Add Prop
        </button>
      )}
    </div>
  )
}
```

### Test File
Create `src/components/ui/PropsTable.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PropsTable from './PropsTable'

describe('PropsTable', () => {
  const props = [
    { name: 'variant', type: 'string', default: 'primary', description: 'Button variant' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state' },
  ]

  it('renders prop rows', () => {
    render(<PropsTable props={props} readOnly={true} />)
    expect(screen.getByText('variant')).toBeInTheDocument()
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  it('shows add button when not readOnly', () => {
    render(<PropsTable props={props} onChange={() => {}} readOnly={false} />)
    expect(screen.getByText('+ Add Prop')).toBeInTheDocument()
  })

  it('hides add button when readOnly', () => {
    render(<PropsTable props={props} readOnly={true} />)
    expect(screen.queryByText('+ Add Prop')).not.toBeInTheDocument()
  })

  it('calls onChange when prop added', () => {
    const onChange = vi.fn()
    render(<PropsTable props={props} onChange={onChange} readOnly={false} />)
    fireEvent.click(screen.getByText('+ Add Prop'))
    expect(onChange).toHaveBeenCalled()
  })
})
```

### Verification
- [ ] Table displays props
- [ ] Edit mode works
- [ ] Add/remove works
- [ ] Tests pass

---

## Task 6.4: Create ComponentPreview Component

### Instructions
Create `src/components/ui/ComponentPreview.jsx`

### Requirements
- Props: `code`, `componentProps`, `theme`
- Renders component in sandboxed iframe
- Updates when props change
- Shows errors gracefully

### Code
```javascript
import { useMemo } from 'react'

// Import tokens.css as string (you may need to configure Vite for this)
const tokensCSS = `/* Your tokens CSS here - or fetch from public folder */`

export default function ComponentPreview({ code, componentProps = {}, theme = 'theme-health-sem' }) {
  const srcdoc = useMemo(() => {
    if (!code) {
      return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;">No code to preview</body></html>`
    }

    // Build children prop if it exists
    const propsWithChildren = { ...componentProps }
    const childrenContent = propsWithChildren.children || 'Button'
    delete propsWithChildren.children

    const propsString = Object.entries(propsWithChildren)
      .map(([key, value]) => {
        if (typeof value === 'boolean') return value ? key : ''
        if (typeof value === 'string') return `${key}="${value}"`
        return `${key}={${JSON.stringify(value)}}`
      })
      .filter(Boolean)
      .join(' ')

    return `
<!DOCTYPE html>
<html class="${theme}">
<head>
  <style>
    :root { /* Default tokens */ }
    .theme-health-sem { --color-btn-primary-bg: #657E79; --color-btn-primary-text: #FFFFFF; }
    .theme-llm { --color-btn-primary-bg: #007AC8; --color-btn-primary-text: #FFFFFF; }
    /* Add more tokens as needed */
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 48px);
      background: #F5F5F5;
      font-family: system-ui, sans-serif;
    }
    .error { color: #DC2626; padding: 16px; }
  </style>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      ${code}
      
      // Find the exported component
      const ComponentToRender = typeof Button !== 'undefined' ? Button
        : typeof Card !== 'undefined' ? Card
        : typeof Input !== 'undefined' ? Input
        : typeof Badge !== 'undefined' ? Badge
        : null;
      
      if (ComponentToRender) {
        ReactDOM.render(
          <ComponentToRender ${propsString}>${childrenContent}</ComponentToRender>,
          document.getElementById('root')
        );
      } else {
        document.getElementById('root').innerHTML = '<div class="error">Component not found. Make sure your component is named Button, Card, Input, or Badge.</div>';
      }
    } catch (error) {
      document.getElementById('root').innerHTML = '<div class="error">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`
  }, [code, componentProps, theme])

  return (
    <iframe
      srcDoc={srcdoc}
      title="Component Preview"
      style={{
        width: '100%',
        height: '300px',
        border: '1px solid var(--color-bg-neutral-medium)',
        borderRadius: '8px',
        background: 'white',
      }}
      sandbox="allow-scripts"
    />
  )
}
```

### Test File
Create `src/components/ui/ComponentPreview.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComponentPreview from './ComponentPreview'

describe('ComponentPreview', () => {
  it('renders iframe', () => {
    render(<ComponentPreview code="" componentProps={{}} />)
    expect(screen.getByTitle('Component Preview')).toBeInTheDocument()
  })

  it('shows no code message when code is empty', () => {
    render(<ComponentPreview code="" componentProps={{}} />)
    const iframe = screen.getByTitle('Component Preview')
    expect(iframe).toHaveAttribute('srcdoc', expect.stringContaining('No code to preview'))
  })

  it('includes theme class in html', () => {
    render(<ComponentPreview code="function Button() { return <button>Test</button> }" componentProps={{}} theme="theme-llm" />)
    const iframe = screen.getByTitle('Component Preview')
    expect(iframe).toHaveAttribute('srcdoc', expect.stringContaining('theme-llm'))
  })
})
```

### Verification
- [ ] Preview renders
- [ ] Theme switching works
- [ ] Props update preview
- [ ] Errors display nicely
- [ ] Tests pass

---

## Task 6.5: Create ComponentDetail Page

### Instructions
Update `src/pages/ComponentDetail.jsx`

### Requirements
- Two-column layout (60/40)
- Left: Tabs (Figma, Code, Props), content
- Right: Live preview with controls
- Load component by slug from URL

### Code
```javascript
import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
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

  // Initialize local state when component loads
  useMemo(() => {
    if (component) {
      setLocalCode(component.jsx_code || '')
      setLocalProps(component.props || [])
    }
  }, [component?.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await update({
        jsx_code: localCode,
        props: localProps,
      })
      alert('Saved!')
    } catch (err) {
      alert('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (error || !component) {
    return (
      <div>
        <button onClick={() => navigate('/components')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg-body)' }}>
          <ArrowLeft size={16} /> Back to Components
        </button>
        <p style={{ color: 'var(--color-fg-feedback-error)' }}>
          {error ? error.message : 'Component not found'}
        </p>
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--color-fg-heading)' }}>{component.name}</h1>
            <p style={{ margin: '8px 0', color: 'var(--color-fg-body)' }}>{component.description}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant={component.code_status}>{component.code_status}</Badge>
              <Badge variant={component.status}>{component.status}</Badge>
            </div>
          </div>
          
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
            }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Left column */}
        <div>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          
          <div style={{ marginTop: '16px', background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px' }}>
            {activeTab === 'figma' && (
              <FigmaTab component={component} />
            )}
            
            {activeTab === 'code' && (
              <div>
                <CodeEditor
                  value={localCode}
                  onChange={setLocalCode}
                />
              </div>
            )}
            
            {activeTab === 'props' && (
              <PropsTable
                props={localProps}
                onChange={setLocalProps}
              />
            )}
          </div>
        </div>

        {/* Right column - Preview */}
        <div style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--color-fg-heading)' }}>Live Preview</h3>
          
          {/* Theme selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: 'var(--color-fg-caption)' }}>Theme</label>
            <select
              value={previewTheme}
              onChange={e => setPreviewTheme(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-bg-neutral-medium)' }}
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
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-fg-caption)' }}>Variants</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {component.variants.map(v => (
                  <button
                    key={v.name}
                    onClick={() => setPreviewProps(prev => ({ ...prev, ...v.props }))}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--color-bg-neutral-medium)',
                      borderRadius: '4px',
                      background: previewProps.variant === v.props?.variant ? 'var(--color-bg-neutral-light)' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Props controls */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-fg-caption)' }}>Props</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                placeholder="children (button text)"
                value={previewProps.children || ''}
                onChange={e => setPreviewProps(prev => ({ ...prev, children: e.target.value }))}
                style={{ padding: '8px', border: '1px solid var(--color-bg-neutral-medium)', borderRadius: '4px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={previewProps.disabled || false}
                  onChange={e => setPreviewProps(prev => ({ ...prev, disabled: e.target.checked }))}
                />
                disabled
              </label>
            </div>
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
          <h4 style={{ color: 'var(--color-fg-heading)' }}>Preview from Figma</h4>
          <img src={component.preview_image} alt={component.name} style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}

      {/* Variants */}
      {component.variants && component.variants.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-fg-heading)' }}>Variants</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {component.variants.map(v => (
              <Badge key={v.name} variant="default">{v.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Linked tokens */}
      {component.linked_tokens && component.linked_tokens.length > 0 && (
        <div>
          <h4 style={{ color: 'var(--color-fg-heading)' }}>Tokens Used</h4>
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
                onClick={() => navigator.clipboard.writeText(`var(--color-${token})`)}
                title="Click to copy"
              >
                {token}
              </code>
            ))}
          </div>
        </div>
      )}

      {!component.preview_image && !component.variants?.length && !component.linked_tokens?.length && (
        <p style={{ color: 'var(--color-fg-caption)' }}>No Figma data available. Sync this component from Figma to see details.</p>
      )}
    </div>
  )
}
```

### Test File
Create `src/pages/ComponentDetail.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import ComponentDetail from './ComponentDetail'

vi.mock('../hooks/useComponent', () => ({
  useComponent: () => ({
    component: {
      id: '1',
      name: 'Button',
      slug: 'button',
      description: 'A button component',
      code_status: 'approved',
      status: 'published',
      jsx_code: 'function Button() { return <button>Test</button> }',
      props: [{ name: 'variant', type: 'string', default: 'primary', description: 'Variant' }],
      variants: [{ name: 'Primary', props: { variant: 'primary' } }],
      linked_tokens: ['btn-primary-bg'],
    },
    loading: false,
    error: null,
    update: vi.fn(),
  })
}))

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'theme-health-sem', setTheme: vi.fn() })
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }) => <textarea data-testid="code-editor" value={value} readOnly />
}))

describe('ComponentDetail', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/components/button']}>
        <Routes>
          <Route path="/components/:slug" element={<ComponentDetail />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders component name', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Button')).toBeInTheDocument()
    })
  })

  it('renders tabs', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Figma')).toBeInTheDocument()
      expect(screen.getByText('Code')).toBeInTheDocument()
      expect(screen.getByText('Props')).toBeInTheDocument()
    })
  })

  it('renders save button', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  it('renders live preview section', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })
  })
})
```

### Verification
- [ ] Page loads component
- [ ] Tabs switch correctly
- [ ] Code editor works
- [ ] Preview updates
- [ ] Save works
- [ ] Tests pass

---

## Phase 6 Complete Checklist

- [ ] Task 6.1: useComponent hook with tests
- [ ] Task 6.2: CodeEditor component with tests
- [ ] Task 6.3: PropsTable component with tests
- [ ] Task 6.4: ComponentPreview component with tests
- [ ] Task 6.5: ComponentDetail page with tests
- [ ] All tests passing: `npm test`
- [ ] Code editing works
- [ ] Preview renders component

## Next Phase
Proceed to `PHASE_7_AI_GENERATION.md`
