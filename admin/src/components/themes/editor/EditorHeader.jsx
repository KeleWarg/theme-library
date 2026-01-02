import { useState, useCallback } from 'react'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Undo2, 
  Redo2, 
  Circle, 
  CheckCircle,
  Loader,
  MoreHorizontal
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Status badge colors
const STATUS_STYLES = {
  draft: {
    bg: 'var(--color-bg-accent-mid, #FEC864)',
    color: 'var(--color-fg-heading, #1E2125)',
    label: 'Draft'
  },
  published: {
    bg: 'var(--color-fg-feedback-success, #0C7663)',
    color: 'var(--color-bg-white, #FFFFFF)',
    label: 'Published'
  },
  archived: {
    bg: 'var(--color-fg-caption, #616A76)',
    color: 'var(--color-bg-white, #FFFFFF)',
    label: 'Archived'
  }
}

/**
 * EditorHeader - Header component for theme editor with actions
 * 
 * @param {Object} props
 * @param {Object} props.theme - Theme object with name and status
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @param {boolean} props.isSaving - Whether save is in progress
 * @param {boolean} props.canUndo - Whether undo is available
 * @param {boolean} props.canRedo - Whether redo is available
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onPublish - Publish handler
 * @param {Function} props.onUndo - Undo handler
 * @param {Function} props.onRedo - Redo handler
 * @param {Function} props.onNameChange - Theme name change handler
 */
export default function EditorHeader({
  theme,
  hasUnsavedChanges = false,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  onSave,
  onPublish,
  onUndo,
  onRedo,
  onNameChange,
}) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(theme?.name || '')

  const status = theme?.status || 'draft'
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.draft

  const handleNameClick = useCallback(() => {
    setEditedName(theme?.name || '')
    setIsEditingName(true)
  }, [theme?.name])

  const handleNameBlur = useCallback(() => {
    setIsEditingName(false)
    if (editedName.trim() && editedName !== theme?.name) {
      onNameChange?.(editedName.trim())
    }
  }, [editedName, theme?.name, onNameChange])

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setEditedName(theme?.name || '')
      setIsEditingName(false)
    }
  }, [theme?.name])

  return (
    <header
      data-testid="editor-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--color-bg-white, #FFFFFF)',
        borderBottom: '1px solid var(--color-fg-divider, #D7DCE5)',
        gap: '16px',
      }}
    >
      {/* Left Section: Back, Name, Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        {/* Back Button */}
        <Link
          to="/themes"
          data-testid="back-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'transparent',
            color: 'var(--color-fg-body, #383C43)',
            textDecoration: 'none',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Theme Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              data-testid="theme-name-input"
              style={{
                fontSize: 'var(--font-size-heading-sm, 24px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
                border: 'none',
                borderBottom: '2px solid var(--color-btn-primary-bg, #657E79)',
                background: 'transparent',
                outline: 'none',
                padding: '0 4px',
                margin: 0,
                minWidth: '200px',
              }}
            />
          ) : (
            <h1
              onClick={handleNameClick}
              data-testid="theme-name"
              style={{
                margin: 0,
                fontSize: 'var(--font-size-heading-sm, 24px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-fg-heading, #1E2125)',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title="Click to edit"
            >
              {theme?.name || 'Untitled Theme'}
            </h1>
          )}

          {/* Status Badge */}
          <span
            data-testid="status-badge"
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              background: statusStyle.bg,
              color: statusStyle.color,
              flexShrink: 0,
            }}
          >
            {statusStyle.label}
          </span>

          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <span
              data-testid="unsaved-indicator"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-feedback-warning, #FFB136)',
                flexShrink: 0,
              }}
            >
              <Circle size={8} fill="currentColor" />
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Undo/Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
          <IconButton
            icon={<Undo2 size={18} />}
            onClick={onUndo}
            disabled={!canUndo}
            tooltip="Undo"
            testId="undo-button"
          />
          <IconButton
            icon={<Redo2 size={18} />}
            onClick={onRedo}
            disabled={!canRedo}
            tooltip="Redo"
            testId="redo-button"
          />
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'var(--color-fg-divider, #D7DCE5)',
            marginRight: '8px',
          }}
        />

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          data-testid="save-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            background: 'transparent',
            color: hasUnsavedChanges && !isSaving
              ? 'var(--color-fg-body, #383C43)'
              : 'var(--color-fg-disabled, #A0A4A8)',
            border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
            borderRadius: '8px',
            cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (hasUnsavedChanges && !isSaving) {
              e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {isSaving ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save
            </>
          )}
        </button>

        {/* Publish Button */}
        <button
          onClick={onPublish}
          disabled={status === 'published' || hasUnsavedChanges}
          data-testid="publish-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            background: status !== 'published' && !hasUnsavedChanges
              ? 'var(--color-btn-primary-bg, #657E79)'
              : 'var(--color-btn-disabled-bg, #D7DCE5)',
            color: status !== 'published' && !hasUnsavedChanges
              ? 'var(--color-btn-primary-fg, #FFFFFF)'
              : 'var(--color-fg-disabled, #A0A4A8)',
            border: 'none',
            borderRadius: '8px',
            cursor: status !== 'published' && !hasUnsavedChanges ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (status !== 'published' && !hasUnsavedChanges) {
              e.currentTarget.style.background = 'var(--color-btn-primary-hover-bg, #526964)'
            }
          }}
          onMouseLeave={(e) => {
            if (status !== 'published' && !hasUnsavedChanges) {
              e.currentTarget.style.background = 'var(--color-btn-primary-bg, #657E79)'
            }
          }}
        >
          {status === 'published' ? (
            <>
              <CheckCircle size={18} />
              Published
            </>
          ) : (
            <>
              <Upload size={18} />
              Publish
            </>
          )}
        </button>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  )
}

/**
 * Icon button helper component
 */
function IconButton({ icon, onClick, disabled, tooltip, testId }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      data-testid={testId}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        padding: 0,
        background: 'transparent',
        color: disabled
          ? 'var(--color-fg-disabled, #A0A4A8)'
          : 'var(--color-fg-body, #383C43)',
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {icon}
    </button>
  )
}

