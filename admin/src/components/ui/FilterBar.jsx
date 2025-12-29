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
          data-active={activeFilter === option.id}
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
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

