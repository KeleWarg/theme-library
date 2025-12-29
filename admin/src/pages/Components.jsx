import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useComponents } from '../hooks/useComponents'
import ComponentCard from '../components/ui/ComponentCard'
import FilterBar from '../components/ui/FilterBar'

export default function Components() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Convert filter to query params
  const filters = useMemo(() => {
    const f = {}
    if (filter !== 'all') {
      if (filter === 'published') {
        f.status = 'published'
      } else {
        f.code_status = filter
      }
    }
    if (searchTerm.trim()) {
      f.search = searchTerm.trim()
    }
    return f
  }, [filter, searchTerm])
  
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

      {/* Search bar */}
      <div style={{ 
        marginBottom: '24px',
        position: 'relative',
        maxWidth: '400px'
      }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--color-fg-caption)'
          }} 
        />
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 40px',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-body-md)',
            backgroundColor: 'var(--color-bg-white)',
            color: 'var(--color-fg-body)',
            outline: 'none',
          }}
        />
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
            {searchTerm 
              ? `No components found matching "${searchTerm}"`
              : 'No components found. Use the Figma plugin to sync your first component.'
            }
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
