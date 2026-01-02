import { useMemo } from 'react'
import { File, Tag, Palette, Type, Grid3X3, Layers, Circle, Box, AlertTriangle, CheckCircle } from 'lucide-react'

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
 * ImportReviewStep - Final review of all data before import
 * 
 * @param {Object} props
 * @param {Object} props.fileData - Selected file data from upload step
 * @param {Array} props.tokens - Processed tokens (with any mapping changes)
 * @param {Object} props.themeDetails - Theme name, slug, description
 */
export default function ImportReviewStep({ fileData, tokens = [], themeDetails = {} }) {
  // Calculate token statistics by category
  const tokenStats = useMemo(() => {
    const stats = {}
    tokens.forEach(token => {
      stats[token.category] = (stats[token.category] || 0) + 1
    })
    return stats
  }, [tokens])

  // Sort categories (other last)
  const sortedCategories = useMemo(() => {
    return Object.entries(tokenStats).sort(([a], [b]) => {
      if (a === 'other') return 1
      if (b === 'other') return -1
      return a.localeCompare(b)
    })
  }, [tokenStats])

  // Check for any warnings
  const hasOtherCategory = tokenStats.other > 0

  return (
    <div 
      data-testid="import-review-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Success Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'var(--color-bg-brand-subtle, #F2F5F4)',
          borderRadius: '8px',
          border: '1px solid var(--color-btn-primary-bg, #657E79)',
        }}
      >
        <CheckCircle 
          size={24} 
          style={{ color: 'var(--color-btn-primary-bg, #657E79)', flexShrink: 0 }} 
        />
        <div>
          <p style={{
            margin: 0,
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
          }}>
            Ready to Import
          </p>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
          }}>
            Review the details below and click "Import Theme" to complete.
          </p>
        </div>
      </div>

      {/* Theme Details Card */}
      <div
        data-testid="theme-details-card"
        style={{
          padding: '20px',
          background: 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '12px',
        }}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-title-sm, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Tag size={18} style={{ color: 'var(--color-btn-primary-bg, #657E79)' }} />
          Theme Details
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DetailRow label="Name" value={themeDetails.name} testId="review-name" />
          <DetailRow label="Slug" value={themeDetails.slug} monospace testId="review-slug" />
          {themeDetails.description && (
            <DetailRow label="Description" value={themeDetails.description} testId="review-description" />
          )}
        </div>
      </div>

      {/* Source File Card */}
      {fileData && (
        <div
          data-testid="source-file-card"
          style={{
            padding: '20px',
            background: 'var(--color-bg-white, #FFFFFF)',
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            borderRadius: '12px',
          }}
        >
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--font-size-title-sm, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            color: 'var(--color-fg-heading, #1E2125)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <File size={18} style={{ color: 'var(--color-btn-primary-bg, #657E79)' }} />
            Source File
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DetailRow label="File Name" value={fileData.name} testId="review-filename" />
            <DetailRow label="File Size" value={formatFileSize(fileData.size)} testId="review-filesize" />
          </div>
        </div>
      )}

      {/* Token Summary Card */}
      <div
        data-testid="token-summary-card"
        style={{
          padding: '20px',
          background: 'var(--color-bg-white, #FFFFFF)',
          border: '1px solid var(--color-fg-divider, #D7DCE5)',
          borderRadius: '12px',
        }}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-title-sm, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={18} style={{ color: 'var(--color-btn-primary-bg, #657E79)' }} />
            Tokens
          </span>
          <span 
            data-testid="total-token-count"
            style={{
              padding: '4px 12px',
              background: 'var(--color-bg-brand-subtle, #F2F5F4)',
              borderRadius: '16px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-btn-primary-bg, #657E79)',
            }}
          >
            {tokens.length} total
          </span>
        </h3>

        {/* Category breakdown */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {sortedCategories.map(([category, count]) => {
            const IconComponent = CATEGORY_ICONS[category] || Circle
            const isOther = category === 'other'
            
            return (
              <div
                key={category}
                data-testid={`category-count-${category}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: isOther 
                    ? 'rgba(255, 177, 54, 0.1)' 
                    : 'var(--color-bg-neutral-subtle, #F4F5F8)',
                  borderRadius: '8px',
                  border: isOther 
                    ? '1px solid var(--color-fg-feedback-warning, #FFB136)' 
                    : '1px solid var(--color-fg-divider, #D7DCE5)',
                }}
              >
                <IconComponent 
                  size={18} 
                  style={{ 
                    color: isOther 
                      ? 'var(--color-fg-feedback-warning, #FFB136)' 
                      : 'var(--color-btn-primary-bg, #657E79)',
                    flexShrink: 0,
                  }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: 'var(--font-size-body-sm, 14px)',
                    fontWeight: 'var(--font-weight-medium, 500)',
                    color: 'var(--color-fg-heading, #1E2125)',
                    textTransform: 'capitalize',
                  }}>
                    {CATEGORY_LABELS[category] || category}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: 'var(--font-size-body-xs, 12px)',
                    color: 'var(--color-fg-caption, #616A76)',
                  }}>
                    {count} token{count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warning for uncategorized tokens */}
      {hasOtherCategory && (
        <div
          data-testid="uncategorized-warning"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            background: 'rgba(255, 177, 54, 0.1)',
            border: '1px solid var(--color-fg-feedback-warning, #FFB136)',
            borderRadius: '8px',
          }}
        >
          <AlertTriangle 
            size={20} 
            style={{ 
              color: 'var(--color-fg-feedback-warning, #FFB136)',
              flexShrink: 0,
              marginTop: '2px',
            }} 
          />
          <div>
            <p style={{
              margin: 0,
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-heading, #1E2125)',
            }}>
              {tokenStats.other} uncategorized token{tokenStats.other !== 1 ? 's' : ''}
            </p>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-caption, #616A76)',
            }}>
              You can go back to the mapping step to assign categories, or import now and edit later.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Helper component for displaying label/value pairs
 */
function DetailRow({ label, value, monospace = false, testId }) {
  return (
    <div 
      data-testid={testId}
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <span style={{
        fontSize: 'var(--font-size-body-sm, 14px)',
        color: 'var(--color-fg-caption, #616A76)',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 'var(--font-size-body-sm, 14px)',
        fontWeight: 'var(--font-weight-medium, 500)',
        color: 'var(--color-fg-heading, #1E2125)',
        fontFamily: monospace ? 'monospace' : 'inherit',
        textAlign: 'right',
        wordBreak: 'break-word',
      }}>
        {value || '—'}
      </span>
    </div>
  )
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

