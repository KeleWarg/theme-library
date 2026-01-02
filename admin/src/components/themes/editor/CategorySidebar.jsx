import { Palette, Type, Space, Layers, Circle, Grid3X3, MoreHorizontal } from 'lucide-react'

/**
 * CategorySidebar - Navigation sidebar for token categories
 * 
 * UI Structure:
 * ┌─────────────────┐
 * │ Categories      │
 * ├─────────────────┤
 * │ ● Colors    24  │  ← Active
 * │   Typography 12 │
 * │   Spacing    8  │
 * │   Shadows    4  │
 * │   Radius     6  │
 * │   Grid       4  │
 * │   Other      2  │
 * └─────────────────┘
 * 
 * @param {Object} props
 * @param {Object} props.tokenCounts - Object with category names as keys and counts as values
 * @param {string} props.activeCategory - Currently selected category
 * @param {Function} props.onSelectCategory - Callback when category is clicked
 * @param {Set|Array} props.categoriesWithChanges - Categories that have unsaved changes
 */

// Category configuration with consistent ordering (color first, other last)
const CATEGORY_CONFIG = [
  { id: 'color', label: 'Colors', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'spacing', label: 'Spacing', icon: Space },
  { id: 'shadow', label: 'Shadows', icon: Layers },
  { id: 'radius', label: 'Radius', icon: Circle },
  { id: 'grid', label: 'Grid', icon: Grid3X3 },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

export default function CategorySidebar({
  tokenCounts = {},
  activeCategory = '',
  onSelectCategory,
  categoriesWithChanges = [],
}) {
  // Convert to Set for easier lookup
  const changesSet = new Set(
    Array.isArray(categoriesWithChanges) ? categoriesWithChanges : categoriesWithChanges
  )

  // Filter categories to only show those with tokens, keeping order
  const visibleCategories = CATEGORY_CONFIG.filter(
    (cat) => (tokenCounts[cat.id] ?? 0) > 0
  )

  // If no categories have tokens, show empty state
  if (visibleCategories.length === 0) {
    return (
      <div
        data-testid="category-sidebar"
        style={{
          padding: '20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-title-xs, 14px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wide, 0.5px)',
          }}
        >
          Categories
        </h2>
        <p
          data-testid="empty-categories"
          style={{
            margin: 0,
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
          }}
        >
          No tokens available
        </p>
      </div>
    )
  }

  return (
    <div
      data-testid="category-sidebar"
      style={{
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <h2
        style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-title-xs, 14px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-wide, 0.5px)',
        }}
      >
        Categories
      </h2>

      {/* Category List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.id
          const hasChanges = changesSet.has(category.id)
          const count = tokenCounts[category.id] || 0
          const Icon = category.icon

          return (
            <CategoryItem
              key={category.id}
              id={category.id}
              label={category.label}
              icon={Icon}
              count={count}
              isActive={isActive}
              hasChanges={hasChanges}
              onClick={() => onSelectCategory?.(category.id)}
            />
          )
        })}
      </nav>
    </div>
  )
}

/**
 * Individual category item in the sidebar
 */
function CategoryItem({ id, label, icon: Icon, count, isActive, hasChanges, onClick }) {
  return (
    <button
      data-testid={`category-${id}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontSize: 'var(--font-size-body-md, 16px)',
        fontWeight: isActive 
          ? 'var(--font-weight-semibold, 600)' 
          : 'var(--font-weight-regular, 400)',
        color: isActive
          ? 'var(--color-btn-primary-bg, #657E79)'
          : 'var(--color-fg-body, #383C43)',
        backgroundColor: isActive
          ? 'var(--color-bg-brand-subtle, #F2F5F4)'
          : 'transparent',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-subtle, #F4F5F8)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      {/* Active Indicator */}
      {isActive && (
        <span
          data-testid="active-indicator"
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '20px',
            backgroundColor: 'var(--color-btn-primary-bg, #657E79)',
            borderRadius: '0 4px 4px 0',
          }}
        />
      )}

      {/* Icon */}
      <Icon
        size={18}
        style={{
          flexShrink: 0,
          opacity: isActive ? 1 : 0.7,
        }}
      />

      {/* Label */}
      <span style={{ flex: 1 }}>{label}</span>

      {/* Count Badge */}
      <span
        data-testid={`count-${id}`}
        style={{
          fontSize: 'var(--font-size-body-xs, 12px)',
          fontWeight: 'var(--font-weight-medium, 500)',
          color: isActive
            ? 'var(--color-btn-primary-bg, #657E79)'
            : 'var(--color-fg-caption, #616A76)',
          backgroundColor: isActive
            ? 'var(--color-bg-secondary, #D1E5E1)'
            : 'var(--color-bg-neutral-light, #ECEFF3)',
          padding: '2px 8px',
          borderRadius: '10px',
          minWidth: '28px',
          textAlign: 'center',
        }}
      >
        {count}
      </span>

      {/* Unsaved Changes Indicator */}
      {hasChanges && (
        <span
          data-testid={`changes-${id}`}
          title="Unsaved changes"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-fg-feedback-warning, #FFB136)',
            flexShrink: 0,
            boxShadow: '0 0 0 2px var(--color-bg-white, #FFFFFF)',
          }}
        />
      )}
    </button>
  )
}

// Export category config for external use
export { CATEGORY_CONFIG }

