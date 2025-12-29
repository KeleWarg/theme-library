# Phase 5: Components List

## Prerequisites
- Phases 1-4 complete
- Database helpers working
- Mock data available

## Outcome
A Components page showing:
- Grid of component cards
- Filter by status
- Click to navigate to detail page

---

## Task 5.1: Create Badge Component

### Instructions
Create `src/components/ui/Badge.jsx` for status indicators.

### Requirements
- Props: `variant`, `children`
- Variants: `pending`, `generated`, `approved`, `published`, `draft`, `manual`, `default`
- Small pill-shaped badge with appropriate colors

### Code
```javascript
const variantStyles = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  generated: { bg: '#DBEAFE', color: '#1E40AF' },
  approved: { bg: '#D1FAE5', color: '#065F46' },
  published: { bg: '#065F46', color: '#FFFFFF' },
  draft: { bg: '#F3F4F6', color: '#6B7280' },
  manual: { bg: '#EDE9FE', color: '#6D28D9' },
  default: { bg: '#F3F4F6', color: '#374151' },
}

export default function Badge({ variant = 'default', children }) {
  const styles = variantStyles[variant] || variantStyles.default
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 500,
      backgroundColor: styles.bg,
      color: styles.color,
    }}>
      {children}
    </span>
  )
}
```

### Test File
Create `src/components/ui/Badge.test.jsx`:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Badge variant="published">Published</Badge>)
    const badge = screen.getByText('Published')
    expect(badge).toHaveStyle({ backgroundColor: '#065F46' })
  })

  it('uses default variant when invalid variant provided', () => {
    render(<Badge variant="invalid">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge).toHaveStyle({ backgroundColor: '#F3F4F6' })
  })
})
```

### Verification
- [ ] All variants render correctly
- [ ] Colors match design
- [ ] Tests pass

---

## Task 5.2: Create ComponentCard Component

### Instructions
Create `src/components/ui/ComponentCard.jsx`

### Requirements
- Props: `component`, `onClick`
- Display: preview image (or placeholder), name, category, status badges
- Clickable card
- Hover effect

### Code
```javascript
import { Boxes } from 'lucide-react'
import Badge from './Badge'

export default function ComponentCard({ component, onClick }) {
  const { name, category, preview_image, code_status, status } = component

  return (
    <button
      onClick={() => onClick(component.slug)}
      data-testid="component-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-white)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'box-shadow 0.2s',
        width: '100%',
      }}
    >
      {/* Preview area */}
      <div style={{
        height: '160px',
        background: 'var(--color-bg-neutral-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {preview_image ? (
          <img src={preview_image} alt={name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
        ) : (
          <Boxes size={48} color="var(--color-fg-caption)" />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-body-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-fg-heading)',
        }}>
          {name}
        </h3>
        
        <p style={{ 
          margin: '4px 0 12px', 
          fontSize: 'var(--font-size-body-sm)',
          color: 'var(--color-fg-caption)',
        }}>
          {category}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant={code_status}>{code_status}</Badge>
          <Badge variant={status}>{status}</Badge>
        </div>
      </div>
    </button>
  )
}
```

### Test File
Create `src/components/ui/ComponentCard.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComponentCard from './ComponentCard'

describe('ComponentCard', () => {
  const component = {
    name: 'Button',
    slug: 'button',
    category: 'actions',
    preview_image: null,
    code_status: 'approved',
    status: 'published'
  }

  it('renders component name', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('renders category', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByText('actions')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<ComponentCard component={component} onClick={() => {}} />)
    expect(screen.getByText('approved')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('calls onClick with slug when clicked', () => {
    const onClick = vi.fn()
    render(<ComponentCard component={component} onClick={onClick} />)
    fireEvent.click(screen.getByTestId('component-card'))
    expect(onClick).toHaveBeenCalledWith('button')
  })
})
```

### Verification
- [ ] Card displays all info
- [ ] Badges show correct status
- [ ] Click works
- [ ] Tests pass

---

## Task 5.3: Create FilterBar Component

### Instructions
Create `src/components/ui/FilterBar.jsx`

### Requirements
- Props: `activeFilter`, `onChange`
- Filter options: All, Pending, Generated, Approved, Published
- Styled as button group

### Code
```javascript
const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'generated', label: 'Generated' },
  { id: 'approved', label: 'Approved' },
  { id: 'published', label: 'Published' },
]

export default function FilterBar({ activeFilter, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {filterOptions.map(option => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: activeFilter === option.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
            backgroundColor: activeFilter === option.id 
              ? 'var(--color-btn-primary-bg)' 
              : 'transparent',
            color: activeFilter === option.id 
              ? 'var(--color-btn-primary-text)' 
              : 'var(--color-fg-body)',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
```

### Test File
Create `src/components/ui/FilterBar.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  it('renders all filter options', () => {
    render(<FilterBar activeFilter="all" onChange={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Generated')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('calls onChange when filter clicked', () => {
    const onChange = vi.fn()
    render(<FilterBar activeFilter="all" onChange={onChange} />)
    fireEvent.click(screen.getByText('Pending'))
    expect(onChange).toHaveBeenCalledWith('pending')
  })
})
```

### Verification
- [ ] All filters display
- [ ] Active filter highlighted
- [ ] Click triggers onChange
- [ ] Tests pass

---

## Task 5.4: Create useComponents Hook

### Instructions
Create `src/hooks/useComponents.js`

### Requirements
- Fetches components from database
- Falls back to mock data
- Returns: components, loading, error, refetch

### Code
```javascript
import { useState, useEffect, useCallback } from 'react'
import { getComponents } from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockComponents } from '../lib/seedData'

export function useComponents(filters = {}) {
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComponents = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (isSupabaseConfigured()) {
        const data = await getComponents(filters)
        setComponents(data)
      } else {
        // Use mock data when Supabase not configured
        let data = [...mockComponents]
        
        // Apply filters to mock data
        if (filters.status) {
          data = data.filter(c => c.status === filters.status)
        }
        if (filters.code_status) {
          data = data.filter(c => c.code_status === filters.code_status)
        }
        
        setComponents(data)
      }
    } catch (err) {
      setError(err)
      setComponents(mockComponents) // Fallback
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.code_status])

  useEffect(() => {
    fetchComponents()
  }, [fetchComponents])

  return { components, loading, error, refetch: fetchComponents }
}
```

### Test File
Create `src/hooks/useComponents.test.js`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useComponents } from './useComponents'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => false
}))

describe('useComponents', () => {
  it('returns loading true initially', () => {
    const { result } = renderHook(() => useComponents())
    expect(result.current.loading).toBe(true)
  })

  it('returns components after loading', async () => {
    const { result } = renderHook(() => useComponents())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.components.length).toBeGreaterThan(0)
  })

  it('provides refetch function', async () => {
    const { result } = renderHook(() => useComponents())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(typeof result.current.refetch).toBe('function')
  })
})
```

### Verification
- [ ] Hook fetches data
- [ ] Loading state works
- [ ] Filters work
- [ ] Tests pass

---

## Task 5.5: Create Components Page

### Instructions
Update `src/pages/Components.jsx`

### Requirements
- Header with title and filter bar
- Grid of ComponentCard components (3 columns)
- Loading state
- Empty state
- Click navigates to /components/:slug

### Code
```javascript
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponents } from '../hooks/useComponents'
import ComponentCard from '../components/ui/ComponentCard'
import FilterBar from '../components/ui/FilterBar'

export default function Components() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  
  // Convert filter to query params
  const filters = useMemo(() => {
    if (filter === 'all') return {}
    if (filter === 'published') return { status: 'published' }
    return { code_status: filter }
  }, [filter])
  
  const { components, loading, error } = useComponents(filters)

  const handleCardClick = (slug) => {
    navigate(`/components/${slug}`)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h2 style={{ 
          margin: 0,
          fontSize: 'var(--font-size-heading-md)',
          color: 'var(--color-fg-heading)'
        }}>
          Components
        </h2>
        <FilterBar activeFilter={filter} onChange={setFilter} />
      </div>

      {/* Loading state */}
      {loading && (
        <p style={{ color: 'var(--color-fg-caption)' }}>Loading components...</p>
      )}

      {/* Error state */}
      {error && (
        <p style={{ color: 'var(--color-fg-feedback-error)' }}>
          Error loading components: {error.message}
        </p>
      )}

      {/* Empty state */}
      {!loading && components.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px',
          background: 'var(--color-bg-white)',
          borderRadius: '8px'
        }}>
          <p style={{ color: 'var(--color-fg-caption)', margin: 0 }}>
            No components found. Use the Figma plugin to sync your first component.
          </p>
        </div>
      )}

      {/* Components grid */}
      {!loading && components.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {components.map(component => (
            <ComponentCard 
              key={component.slug || component.name}
              component={component}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Test File
Create `src/pages/Components.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Components from './Components'

// Mock the hooks
vi.mock('../hooks/useComponents', () => ({
  useComponents: () => ({
    components: [
      { name: 'Button', slug: 'button', category: 'actions', code_status: 'approved', status: 'published' },
      { name: 'Card', slug: 'card', category: 'layout', code_status: 'pending', status: 'draft' },
    ],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Components', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <Components />
      </BrowserRouter>
    )
  }

  it('renders page title', () => {
    renderPage()
    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders filter bar', () => {
    renderPage()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders component cards', () => {
    renderPage()
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
  })

  it('navigates to component detail on card click', () => {
    renderPage()
    fireEvent.click(screen.getByText('Button').closest('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/components/button')
  })
})
```

### Verification
- [ ] Page renders with all components
- [ ] Filters work
- [ ] Cards are clickable
- [ ] Navigation works
- [ ] Tests pass

---

## Phase 5 Complete Checklist

- [ ] Task 5.1: Badge component with tests
- [ ] Task 5.2: ComponentCard component with tests
- [ ] Task 5.3: FilterBar component with tests
- [ ] Task 5.4: useComponents hook with tests
- [ ] Task 5.5: Components page with tests
- [ ] All tests passing: `npm test`
- [ ] Components display correctly
- [ ] Filters work
- [ ] Navigation to detail works

## Next Phase
Proceed to `PHASE_6_COMPONENT_DETAIL.md`
