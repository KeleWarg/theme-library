import { useState, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Palette, Type, Grid3X3, Layers, Circle, Box } from 'lucide-react'
import { groupTokensByCategory } from '../../../lib/tokenParser'

// Available categories for override dropdown
const CATEGORIES = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other']

// Icons for each category
const CATEGORY_ICONS = {
  color: Palette,
  typography: Type,
  spacing: Grid3X3,
  shadow: Layers,
  radius: Circle,
  grid: Box,
  other: AlertTriangle,
}

// Display labels for categories
const CATEGORY_LABELS = {
  color: 'Color',
  typography: 'Typography',
  spacing: 'Spacing',
  shadow: 'Shadow',
  radius: 'Radius',
  grid: 'Grid',
  other: 'Other',
}

/**
 * TokenMappingStep - Review and adjust category assignments for parsed tokens
 * 
 * @param {Object} props
 * @param {Array} props.tokens - Array of ParsedToken objects from parser
 * @param {Function} props.onUpdateMapping - Callback when tokens are modified
 */
export default function TokenMappingStep({ tokens = [], onUpdateMapping }) {
  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Start with all categories expanded
    const grouped = groupTokensByCategory(tokens)
    return Object.keys(grouped).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  })

  // Track category overrides per token (keyed by token path)
  const [categoryOverrides, setCategoryOverrides] = useState({})

  // Apply overrides to tokens and regroup
  const tokensWithOverrides = useMemo(() => {
    return tokens.map(token => ({
      ...token,
      category: categoryOverrides[token.path] ?? token.category,
      originalCategory: token.category,
    }))
  }, [tokens, categoryOverrides])

  // Group tokens by their (possibly overridden) category
  const groupedTokens = useMemo(() => {
    return groupTokensByCategory(tokensWithOverrides)
  }, [tokensWithOverrides])

  // Calculate summary counts
  const categorySummary = useMemo(() => {
    const summary = {}
    tokensWithOverrides.forEach(token => {
      summary[token.category] = (summary[token.category] || 0) + 1
    })
    return summary
  }, [tokensWithOverrides])

  // Count tokens in "other" category
  const otherCount = categorySummary.other || 0

  // Toggle category expansion
  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }, [])

  // Handle category override for a token
  const handleCategoryChange = useCallback((tokenPath, newCategory) => {
    setCategoryOverrides(prev => {
      const updated = { ...prev, [tokenPath]: newCategory }
      
      // Find the token and update its category
      const updatedTokens = tokens.map(token => ({
        ...token,
        category: updated[token.path] ?? token.category,
      }))
      
      // Notify parent of changes
      if (onUpdateMapping) {
        onUpdateMapping(updatedTokens)
      }
      
      return updated
    })
  }, [tokens, onUpdateMapping])

  // Get sorted category keys (putting "other" last)
  const sortedCategories = useMemo(() => {
    const categories = Object.keys(groupedTokens)
    return categories.sort((a, b) => {
      if (a === 'other') return 1
      if (b === 'other') return -1
      return a.localeCompare(b)
    })
  }, [groupedTokens])

  return (
    <div 
      data-testid="token-mapping-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Warning Banner for "other" category */}
      {otherCount > 0 && (
        <div 
          data-testid="other-warning"
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'var(--color-bg-accent-mid, #FEC864)',
            borderRadius: '8px',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          <AlertTriangle size={20} />
          <span style={{ 
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
          }}>
            {otherCount} token{otherCount !== 1 ? 's' : ''} couldn't be categorized automatically. 
            Please review and assign categories below.
          </span>
        </div>
      )}

      {/* Category Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedCategories.map(category => {
          const categoryTokens = groupedTokens[category] || []
          const isExpanded = expandedCategories[category] ?? false
          const IconComponent = CATEGORY_ICONS[category] || Circle
          
          return (
            <CategorySection
              key={category}
              category={category}
              label={CATEGORY_LABELS[category] || category}
              tokens={categoryTokens}
              isExpanded={isExpanded}
              onToggle={() => toggleCategory(category)}
              onCategoryChange={handleCategoryChange}
              Icon={IconComponent}
            />
          )
        })}
      </div>

      {/* Summary */}
      <div 
        data-testid="token-summary"
        style={{
          padding: '20px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          borderRadius: '12px',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
        }}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-title-sm, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          Summary
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {Object.entries(categorySummary)
            .sort(([a], [b]) => {
              if (a === 'other') return 1
              if (b === 'other') return -1
              return a.localeCompare(b)
            })
            .map(([category, count]) => (
              <div 
                key={category}
                data-testid={`summary-${category}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: category === 'other' 
                    ? 'var(--color-bg-accent-mid, #FEC864)' 
                    : 'var(--color-bg-white, #FFFFFF)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-fg-divider, #D7DCE5)',
                }}
              >
                <span style={{
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  color: 'var(--color-fg-heading, #1E2125)',
                  textTransform: 'capitalize',
                }}>
                  {CATEGORY_LABELS[category] || category}:
                </span>
                <span style={{
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  fontWeight: 'var(--font-weight-bold, 700)',
                  color: 'var(--color-fg-body, #383C43)',
                }}>
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Expandable category section with token list
 */
function CategorySection({ 
  category, 
  label, 
  tokens, 
  isExpanded, 
  onToggle, 
  onCategoryChange,
  Icon 
}) {
  return (
    <div 
      data-testid={`category-${category}`}
      style={{
        border: '1px solid var(--color-fg-divider, #D7DCE5)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--color-bg-white, #FFFFFF)',
      }}
    >
      {/* Category Header */}
      <button
        onClick={onToggle}
        data-testid={`category-toggle-${category}`}
        aria-expanded={isExpanded}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
        }}
      >
        {/* Expand/Collapse Icon */}
        <span style={{ 
          color: 'var(--color-fg-caption, #616A76)',
          display: 'flex',
          alignItems: 'center',
        }}>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>

        {/* Category Icon */}
        <span style={{ 
          color: category === 'other' 
            ? 'var(--color-fg-feedback-warning, #FFB136)' 
            : 'var(--color-btn-primary-bg, #657E79)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Icon size={18} />
        </span>

        {/* Category Label */}
        <span style={{
          flex: 1,
          fontSize: 'var(--font-size-body-md, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          {label}
        </span>

        {/* Token Count */}
        <span style={{
          padding: '4px 12px',
          background: category === 'other'
            ? 'var(--color-bg-accent-mid, #FEC864)'
            : 'var(--color-bg-brand-subtle, #F5F7FF)',
          borderRadius: '16px',
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-medium, 500)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          {tokens.length} token{tokens.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Token List */}
      {isExpanded && tokens.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--color-fg-divider, #D7DCE5)',
        }}>
          {tokens.map((token, index) => (
            <TokenRow
              key={token.path}
              token={token}
              onCategoryChange={onCategoryChange}
              isLast={index === tokens.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Individual token row with category dropdown
 */
function TokenRow({ token, onCategoryChange, isLast }) {
  const hasOverride = token.originalCategory && token.originalCategory !== token.category

  return (
    <div
      data-testid={`token-row-${token.path}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-fg-divider, #D7DCE5)',
        background: hasOverride ? 'var(--color-bg-brand-subtle, #F5F7FF)' : 'transparent',
      }}
    >
      {/* Token Info */}
      <div style={{ 
        flex: 1, 
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {/* Token Path */}
        <span 
          data-testid="token-path"
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={token.path}
        >
          {token.path}
        </span>
        
        {/* Token Name */}
        <span 
          data-testid="token-name"
          style={{
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}
        >
          {token.name}
        </span>
      </div>

      {/* Category Dropdown */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        flexShrink: 0,
      }}>
        {hasOverride && (
          <span style={{
            fontSize: 'var(--font-size-label-xs, 10px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-fg-link, #4759B2)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Changed
          </span>
        )}
        <select
          value={token.category}
          onChange={(e) => onCategoryChange(token.path, e.target.value)}
          data-testid={`category-select-${token.path}`}
          aria-label={`Category for ${token.name}`}
          style={{
            padding: '8px 32px 8px 12px',
            fontSize: 'var(--font-size-body-sm, 14px)',
            border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
            borderRadius: '8px',
            background: 'var(--color-bg-white, #FFFFFF)',
            color: 'var(--color-fg-heading, #1E2125)',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23616A76' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            minWidth: '120px',
          }}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

