import { useState, useRef, useEffect } from 'react'
import { Check, MoreVertical, Edit2, Copy, Trash2 } from 'lucide-react'

/**
 * ThemeCard - Displays theme info with preview and actions
 * Chunk 5.02 - Theme Management System
 */
export default function ThemeCard({ 
  theme, 
  isActive, 
  onPreview, 
  onApply,
  onEdit,
  onDelete,
  onDuplicate 
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef(null)

  // Define preview colors for each theme
  const themeColors = {
    'theme-health---sem': ['#657E79', '#FFFFFF', '#F5F5F5', '#2D3748', '#1A202C'],
    'theme-home---sem': ['#1E3A8A', '#FFFFFF', '#F0F4FF', '#1E293B', '#0F172A'],
    'theme-llm': ['#007AC8', '#FFFFFF', '#ECF1FF', '#1E2125', '#0B5F95'],
    'theme-forbes-media---seo': ['#000000', '#FFFFFF', '#F4F5F8', '#1E2125', '#333333'],
    'theme-advisor-sem-compare-coverage': ['#00695C', '#FFFFFF', '#E0F2F1', '#1E2125', '#004D40'],
  }

  const colors = themeColors[theme.slug] || themeColors['theme-health---sem']

  // Determine if this theme can be managed (edit/delete/duplicate)
  // Only themes from database can be managed, static themes cannot
  const isManageable = theme.isFromDatabase === true

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Handle delete with confirmation
  const handleDeleteClick = () => {
    setMenuOpen(false)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onDelete?.(theme)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  // Handle edit action
  const handleEditClick = () => {
    setMenuOpen(false)
    onEdit?.(theme)
  }

  // Handle duplicate action
  const handleDuplicateClick = () => {
    setMenuOpen(false)
    onDuplicate?.(theme)
  }

  return (
    <>
      <div
        data-testid="theme-card"
        style={{
          border: isActive
            ? '2px solid var(--color-btn-primary-bg, #657E79)'
            : '1px solid var(--color-fg-stroke-default, #BFC7D4)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-bg-white, #FFFFFF)',
          padding: 'var(--spacing-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          position: 'relative',
        }}
      >
        {/* Header row with name, badges, and menu */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Theme name and badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            <span
              style={{
                fontWeight: 'var(--font-weight-semibold, 600)',
                fontSize: 'var(--font-size-title-md, 18px)',
                color: 'var(--color-fg-heading, #1E2125)',
              }}
            >
              {theme.name}
            </span>
            {isActive && (
              <span
                data-testid="active-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  backgroundColor: 'var(--color-bg-brand-subtle, #E8F5F3)',
                  color: 'var(--color-btn-primary-bg, #657E79)',
                  fontSize: 'var(--font-size-label-sm, 12px)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <Check size={12} />
                Active
              </span>
            )}
          </div>

          {/* Actions menu button - only show for manageable themes */}
          {isManageable && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                data-testid="menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: menuOpen 
                    ? 'var(--color-bg-neutral-subtle, #F4F5F8)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  color: 'var(--color-fg-caption, #616A76)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!menuOpen) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-subtle, #F4F5F8)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!menuOpen) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
                aria-label="Theme actions"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <MoreVertical size={18} />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div
                  data-testid="actions-menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--spacing-xs)',
                    minWidth: '140px',
                    backgroundColor: 'var(--color-bg-white, #FFFFFF)',
                    border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  {/* Edit */}
                  <button
                    data-testid="edit-action"
                    onClick={handleEditClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: 'var(--font-size-body-sm, 14px)',
                      color: 'var(--color-fg-body, #383C43)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-subtle, #F4F5F8)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>

                  {/* Duplicate */}
                  <button
                    data-testid="duplicate-action"
                    onClick={handleDuplicateClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: 'var(--font-size-body-sm, 14px)',
                      color: 'var(--color-fg-body, #383C43)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-subtle, #F4F5F8)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Copy size={16} />
                    Duplicate
                  </button>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'var(--color-fg-divider, #D7DCE5)',
                      margin: '4px 0',
                    }}
                  />

                  {/* Delete */}
                  <button
                    data-testid="delete-action"
                    onClick={handleDeleteClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: 'var(--font-size-body-sm, 14px)',
                      color: 'var(--color-fg-feedback-error, #EB4015)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(235, 64, 21, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Color swatches */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {colors.map((color, index) => (
            <div
              key={index}
              data-testid="color-swatch"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: color,
                border: '1px solid var(--color-fg-divider, #D7DCE5)',
              }}
            />
          ))}
        </div>

        {/* Status badge for database themes */}
        {isManageable && theme.status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span
              data-testid="status-badge"
              style={{
                fontSize: 'var(--font-size-label-sm, 12px)',
                color: 'var(--color-fg-caption, #616A76)',
              }}
            >
              Status:{' '}
              <span
                style={{
                  fontWeight: 'var(--font-weight-medium, 500)',
                  color: theme.status === 'published'
                    ? 'var(--color-fg-feedback-success, #2E7D32)'
                    : theme.status === 'draft'
                    ? 'var(--color-fg-caption, #616A76)'
                    : 'var(--color-fg-body, #383C43)',
                }}
              >
                {theme.status.charAt(0).toUpperCase() + theme.status.slice(1)}
              </span>
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            data-testid="preview-button"
            onClick={onPreview}
            style={{
              flex: 1,
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-fg-body, #383C43)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-subtle, #F4F5F8)'
              e.currentTarget.style.borderColor = 'var(--color-fg-caption, #616A76)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--color-btn-secondary-border, #BFC7D4)'
            }}
          >
            Preview
          </button>
          <button
            data-testid="apply-button"
            onClick={onApply}
            disabled={isActive}
            style={{
              flex: 1,
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: isActive
                ? 'var(--color-btn-primary-disabled-bg, #BFC7D4)'
                : 'var(--color-btn-primary-bg, #657E79)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-btn-primary-text, #FFFFFF)',
              cursor: isActive ? 'not-allowed' : 'pointer',
              opacity: isActive ? 0.6 : 1,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--color-btn-primary-hover-bg, #526964)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--color-btn-primary-bg, #657E79)'
              }
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          data-testid="delete-confirm-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={handleCancelDelete}
        >
          <div
            data-testid="delete-confirm-dialog"
            style={{
              backgroundColor: 'var(--color-bg-white, #FFFFFF)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-xl)',
              maxWidth: '400px',
              width: '90%',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: `0 0 var(--spacing-md)`,
                fontSize: 'var(--font-size-title-md, 18px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
              }}
            >
              Delete Theme
            </h3>
            <p
              style={{
                margin: `0 0 var(--spacing-xl)`,
                fontSize: 'var(--font-size-body-md, 16px)',
                color: 'var(--color-fg-body, #383C43)',
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete &quot;{theme.name}&quot;? This will also delete all tokens associated with this theme. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
              <button
                data-testid="cancel-delete-button"
                onClick={handleCancelDelete}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-xl)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-btn-secondary-border, #BFC7D4)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  color: 'var(--color-fg-body, #383C43)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                data-testid="confirm-delete-button"
                onClick={handleConfirmDelete}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-xl)',
                  backgroundColor: 'var(--color-fg-feedback-error, #EB4015)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
