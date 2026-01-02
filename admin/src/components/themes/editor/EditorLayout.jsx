import { useState, useCallback } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

/**
 * EditorLayout - Three-panel layout for theme editor
 * 
 * Layout structure:
 * ┌────────────┬─────────────────────────────┬───────────────────┐
 * │  Sidebar   │     Editor Panel            │   Preview Panel   │
 * │  (fixed)   │     (flexible)              │   (toggleable)    │
 * └────────────┴─────────────────────────────┴───────────────────┘
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.sidebar - Sidebar content (category navigation)
 * @param {React.ReactNode} props.editor - Main editor content (token rows)
 * @param {React.ReactNode} props.preview - Preview panel content
 * @param {boolean} props.showPreview - Whether preview panel is visible
 * @param {Function} props.onTogglePreview - Handler to toggle preview panel
 */
export default function EditorLayout({
  sidebar,
  editor,
  preview,
  showPreview = true,
  onTogglePreview,
}) {
  return (
    <div
      data-testid="editor-layout"
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
      }}
    >
      {/* Sidebar */}
      <aside
        data-testid="editor-sidebar"
        style={{
          width: '240px',
          minWidth: '240px',
          background: 'var(--color-bg-white, #FFFFFF)',
          borderRight: '1px solid var(--color-fg-divider, #D7DCE5)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {sidebar || <SidebarPlaceholder />}
      </aside>

      {/* Main Editor Panel */}
      <main
        data-testid="editor-main"
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Editor Content */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflow: 'auto',
          }}
        >
          {editor || <EditorPlaceholder />}
        </div>
      </main>

      {/* Preview Panel */}
      <aside
        data-testid="editor-preview"
        style={{
          width: showPreview ? '360px' : '0px',
          minWidth: showPreview ? '360px' : '0px',
          background: 'var(--color-bg-white, #FFFFFF)',
          borderLeft: showPreview ? '1px solid var(--color-fg-divider, #D7DCE5)' : 'none',
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Preview Toggle Button */}
        <button
          onClick={onTogglePreview}
          data-testid="preview-toggle"
          title={showPreview ? 'Hide preview' : 'Show preview'}
          style={{
            position: 'absolute',
            top: '16px',
            left: showPreview ? '16px' : '-44px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-white, #FFFFFF)',
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--color-fg-body, #383C43)',
            transition: 'all 0.2s ease',
            zIndex: 10,
            boxShadow: showPreview ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-neutral-light, #ECEFF3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-white, #FFFFFF)'
          }}
        >
          {showPreview ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>

        {/* Preview Content */}
        {showPreview && (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              paddingTop: '64px',
            }}
          >
            {preview || <PreviewPlaceholder />}
          </div>
        )}
      </aside>

      {/* Floating toggle when preview is hidden */}
      {!showPreview && (
        <button
          onClick={onTogglePreview}
          data-testid="preview-toggle-floating"
          title="Show preview"
          style={{
            position: 'fixed',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-btn-primary-bg, #657E79)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--color-btn-primary-fg, #FFFFFF)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
            zIndex: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-btn-primary-hover-bg, #526964)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-btn-primary-bg, #657E79)'
            e.currentTarget.style.transform = 'translateY(-50%)'
          }}
        >
          <PanelRightOpen size={20} />
        </button>
      )}
    </div>
  )
}

/**
 * Placeholder for sidebar when no content provided
 */
function SidebarPlaceholder() {
  return (
    <div
      data-testid="sidebar-placeholder"
      style={{
        padding: '20px',
        color: 'var(--color-fg-caption, #616A76)',
        fontSize: 'var(--font-size-body-sm, 14px)',
      }}
    >
      <p style={{ margin: '0 0 16px 0', fontWeight: 'var(--font-weight-semibold, 600)' }}>
        Categories
      </p>
      <p style={{ margin: 0 }}>
        No categories loaded
      </p>
    </div>
  )
}

/**
 * Placeholder for editor when no content provided
 */
function EditorPlaceholder() {
  return (
    <div
      data-testid="editor-placeholder"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-fg-caption, #616A76)',
        fontSize: 'var(--font-size-body-md, 16px)',
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontWeight: 'var(--font-weight-semibold, 600)' }}>
        No tokens to display
      </p>
      <p style={{ margin: 0 }}>
        Select a category from the sidebar to view and edit tokens
      </p>
    </div>
  )
}

/**
 * Placeholder for preview when no content provided
 */
function PreviewPlaceholder() {
  return (
    <div
      data-testid="preview-placeholder"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: 'var(--font-size-title-sm, 16px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}
      >
        Preview
      </h3>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          borderRadius: '8px',
          color: 'var(--color-fg-caption, #616A76)',
          fontSize: 'var(--font-size-body-sm, 14px)',
        }}
      >
        Live preview will appear here
      </div>
    </div>
  )
}

