import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader } from 'lucide-react'
import EditorHeader from '../components/themes/editor/EditorHeader'
import EditorLayout from '../components/themes/editor/EditorLayout'
import TokenRow from '../components/themes/editor/TokenRow'
import ThemeExportModal from '../components/themes/export/ThemeExportModal'
import { 
  getThemeById, 
  updateTheme, 
  updateToken,
  deleteToken,
  publishTheme,
  groupTokensByCategory 
} from '../lib/themeService'

// Config values from config-reference.md
const AUTO_SAVE_INTERVAL_MS = 60000 // 60 seconds
const UNDO_HISTORY_LIMIT = 50

/**
 * ThemeEditor - Main page for editing themes and their tokens
 * 
 * Features:
 * - Load theme and tokens by ID
 * - Three-panel layout (sidebar, editor, preview)
 * - Unsaved changes tracking
 * - Auto-save functionality
 * - Undo/Redo support
 */
export default function ThemeEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Data state
  const [theme, setTheme] = useState(null)
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Editor state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])

  // Refs for auto-save
  const autoSaveTimerRef = useRef(null)
  const pendingChangesRef = useRef({})

  // Load theme data
  useEffect(() => {
    async function loadTheme() {
      if (!id) {
        setError('No theme ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getThemeById(id)
        
        if (!data) {
          setError('Theme not found')
          setLoading(false)
          return
        }

        setTheme(data)
        setTokens(data.theme_tokens || [])
        
        // Select first category by default
        const grouped = groupTokensByCategory(data.theme_tokens || [])
        const categories = Object.keys(grouped)
        if (categories.length > 0) {
          setSelectedCategory(categories[0])
        }
      } catch (err) {
        console.error('Failed to load theme:', err)
        setError(err.message || 'Failed to load theme')
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [id])

  // Auto-save timer
  useEffect(() => {
    if (hasUnsavedChanges && AUTO_SAVE_INTERVAL_MS > 0) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave()
      }, AUTO_SAVE_INTERVAL_MS)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges])

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!theme || isSaving) return

    try {
      setIsSaving(true)
      
      // Save theme metadata changes if any
      if (pendingChangesRef.current.theme) {
        await updateTheme(theme.id, pendingChangesRef.current.theme)
        pendingChangesRef.current.theme = null
      }

      // Save token changes if any
      if (pendingChangesRef.current.tokens) {
        for (const [tokenId, changes] of Object.entries(pendingChangesRef.current.tokens)) {
          await updateToken(tokenId, changes)
        }
        pendingChangesRef.current.tokens = {}
      }

      // Reload theme to get fresh data
      const refreshedData = await getThemeById(theme.id)
      setTheme(refreshedData)
      setTokens(refreshedData.theme_tokens || [])
      
      setHasUnsavedChanges(false)
      
      // Clear auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    } catch (err) {
      console.error('Failed to save:', err)
      setError(err.message || 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [theme, isSaving])

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!theme || hasUnsavedChanges) return

    try {
      setIsSaving(true)
      const published = await publishTheme(theme.id)
      setTheme(published)
    } catch (err) {
      console.error('Failed to publish:', err)
      setError(err.message || 'Failed to publish theme')
    } finally {
      setIsSaving(false)
    }
  }, [theme, hasUnsavedChanges])

  // Theme name change handler
  const handleNameChange = useCallback((newName) => {
    if (!theme) return

    // Store for undo
    pushUndoState({ type: 'theme', field: 'name', oldValue: theme.name })

    // Update local state
    setTheme(prev => ({ ...prev, name: newName }))
    
    // Track pending changes
    pendingChangesRef.current.theme = {
      ...pendingChangesRef.current.theme,
      name: newName
    }
    
    setHasUnsavedChanges(true)
  }, [theme])

  // Token change handler
  const handleTokenChange = useCallback((tokenId, field, value) => {
    // Find current token for undo
    const token = tokens.find(t => t.id === tokenId)
    if (!token) return

    // Store for undo
    pushUndoState({ type: 'token', tokenId, field, oldValue: token[field] })

    // Update local state
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, [field]: value } : t
    ))

    // Track pending changes
    if (!pendingChangesRef.current.tokens) {
      pendingChangesRef.current.tokens = {}
    }
    pendingChangesRef.current.tokens[tokenId] = {
      ...pendingChangesRef.current.tokens[tokenId],
      [field]: value
    }

    setHasUnsavedChanges(true)
  }, [tokens])

  // Token delete handler
  const handleTokenDelete = useCallback(async (tokenId) => {
    const token = tokens.find(t => t.id === tokenId)
    if (!token) return

    try {
      // Delete from database
      await deleteToken(tokenId)
      
      // Remove from local state
      setTokens(prev => prev.filter(t => t.id !== tokenId))
    } catch (err) {
      console.error('Failed to delete token:', err)
      setError(err.message || 'Failed to delete token')
    }
  }, [tokens])

  // Push state to undo stack
  const pushUndoState = useCallback((state) => {
    setUndoStack(prev => {
      const newStack = [...prev, state]
      // Limit stack size
      if (newStack.length > UNDO_HISTORY_LIMIT) {
        return newStack.slice(-UNDO_HISTORY_LIMIT)
      }
      return newStack
    })
    // Clear redo stack on new change
    setRedoStack([])
  }, [])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return

    const lastState = undoStack[undoStack.length - 1]
    
    if (lastState.type === 'theme') {
      // Save current value for redo
      setRedoStack(prev => [...prev, { 
        type: 'theme', 
        field: lastState.field, 
        oldValue: theme[lastState.field] 
      }])
      
      // Restore old value
      setTheme(prev => ({ ...prev, [lastState.field]: lastState.oldValue }))
      pendingChangesRef.current.theme = {
        ...pendingChangesRef.current.theme,
        [lastState.field]: lastState.oldValue
      }
    } else if (lastState.type === 'token') {
      const token = tokens.find(t => t.id === lastState.tokenId)
      if (token) {
        // Save current value for redo
        setRedoStack(prev => [...prev, {
          type: 'token',
          tokenId: lastState.tokenId,
          field: lastState.field,
          oldValue: token[lastState.field]
        }])
        
        // Restore old value
        setTokens(prev => prev.map(t =>
          t.id === lastState.tokenId ? { ...t, [lastState.field]: lastState.oldValue } : t
        ))
        if (!pendingChangesRef.current.tokens) {
          pendingChangesRef.current.tokens = {}
        }
        pendingChangesRef.current.tokens[lastState.tokenId] = {
          ...pendingChangesRef.current.tokens[lastState.tokenId],
          [lastState.field]: lastState.oldValue
        }
      }
    }

    // Remove from undo stack
    setUndoStack(prev => prev.slice(0, -1))
  }, [undoStack, theme, tokens])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return

    const lastState = redoStack[redoStack.length - 1]
    
    if (lastState.type === 'theme') {
      // Save current for undo
      setUndoStack(prev => [...prev, {
        type: 'theme',
        field: lastState.field,
        oldValue: theme[lastState.field]
      }])
      
      // Apply redo value
      setTheme(prev => ({ ...prev, [lastState.field]: lastState.oldValue }))
      pendingChangesRef.current.theme = {
        ...pendingChangesRef.current.theme,
        [lastState.field]: lastState.oldValue
      }
    } else if (lastState.type === 'token') {
      const token = tokens.find(t => t.id === lastState.tokenId)
      if (token) {
        setUndoStack(prev => [...prev, {
          type: 'token',
          tokenId: lastState.tokenId,
          field: lastState.field,
          oldValue: token[lastState.field]
        }])
        
        setTokens(prev => prev.map(t =>
          t.id === lastState.tokenId ? { ...t, [lastState.field]: lastState.oldValue } : t
        ))
        if (!pendingChangesRef.current.tokens) {
          pendingChangesRef.current.tokens = {}
        }
        pendingChangesRef.current.tokens[lastState.tokenId] = {
          ...pendingChangesRef.current.tokens[lastState.tokenId],
          [lastState.field]: lastState.oldValue
        }
      }
    }

    // Remove from redo stack
    setRedoStack(prev => prev.slice(0, -1))
  }, [redoStack, theme, tokens])

  // Toggle preview panel
  const handleTogglePreview = useCallback(() => {
    setShowPreview(prev => !prev)
  }, [])

  // Category selection handler
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  // Group tokens by category for sidebar
  const groupedTokens = groupTokensByCategory(tokens)
  const categories = Object.keys(groupedTokens).sort((a, b) => {
    if (a === 'other') return 1
    if (b === 'other') return -1
    return a.localeCompare(b)
  })

  // Get tokens for selected category
  const selectedTokens = selectedCategory ? groupedTokens[selectedCategory] || [] : []

  // Loading state
  if (loading) {
    return (
      <div
        data-testid="theme-editor-loading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '16px',
          color: 'var(--color-fg-caption, #616A76)',
        }}
      >
        <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ margin: 0, fontSize: 'var(--font-size-body-md, 16px)' }}>
          Loading theme...
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        data-testid="theme-editor-error"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '16px',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(235, 64, 21, 0.1)',
            borderRadius: '16px',
            color: 'var(--color-fg-feedback-error, #EB4015)',
          }}
        >
          <AlertCircle size={32} />
        </div>
        <h2 style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-heading-sm, 24px)',
          color: 'var(--color-fg-heading, #1E2125)',
        }}>
          Unable to Load Theme
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-body-md, 16px)',
          color: 'var(--color-fg-caption, #616A76)',
          maxWidth: '400px',
        }}>
          {error}
        </p>
        <button
          onClick={() => navigate('/themes')}
          style={{
            marginTop: '8px',
            padding: '12px 24px',
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            background: 'var(--color-btn-primary-bg, #657E79)',
            color: 'var(--color-btn-primary-fg, #FFFFFF)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Themes
        </button>
      </div>
    )
  }

  return (
    <div
      data-testid="theme-editor"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <EditorHeader
        theme={theme}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onSave={handleSave}
        onPublish={handlePublish}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNameChange={handleNameChange}
        onExport={() => setShowExportModal(true)}
      />

      {/* Editor Layout */}
      <EditorLayout
        sidebar={
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            tokenCounts={Object.fromEntries(
              Object.entries(groupedTokens).map(([cat, tokens]) => [cat, tokens.length])
            )}
          />
        }
        editor={
          <TokenList
            tokens={selectedTokens}
            category={selectedCategory}
            onTokenChange={handleTokenChange}
            onTokenDelete={handleTokenDelete}
          />
        }
        preview={
          <PreviewPanel tokens={tokens} theme={theme} />
        }
        showPreview={showPreview}
        onTogglePreview={handleTogglePreview}
      />

      {/* Export Modal */}
      <ThemeExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        theme={theme}
        tokens={tokens}
      />
    </div>
  )
}

/**
 * Category sidebar component
 */
function CategorySidebar({ categories, selectedCategory, onSelect, tokenCounts }) {
  const categoryLabels = {
    color: 'Colors',
    typography: 'Typography',
    spacing: 'Spacing',
    shadow: 'Shadows',
    radius: 'Border Radius',
    grid: 'Grid & Layout',
    other: 'Other',
  }

  return (
    <div
      data-testid="category-sidebar"
      style={{ padding: '16px 0' }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          padding: '0 16px',
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-caption, #616A76)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Categories
      </h3>
      <nav>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            data-testid={`category-${category}`}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: selectedCategory === category
                ? 'var(--color-bg-brand-subtle, #F2F5F4)'
                : 'transparent',
              border: 'none',
              borderLeft: selectedCategory === category
                ? '3px solid var(--color-btn-primary-bg, #657E79)'
                : '3px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.background = 'var(--color-bg-neutral-subtle, #F4F5F8)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-body-md, 16px)',
                fontWeight: selectedCategory === category
                  ? 'var(--font-weight-semibold, 600)'
                  : 'var(--font-weight-medium, 500)',
                color: selectedCategory === category
                  ? 'var(--color-fg-heading, #1E2125)'
                  : 'var(--color-fg-body, #383C43)',
                textTransform: 'capitalize',
              }}
            >
              {categoryLabels[category] || category}
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-fg-caption, #616A76)',
              }}
            >
              {tokenCounts[category] || 0}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/**
 * Token list component - Uses TokenRow for inline editing
 */
function TokenList({ tokens, category, onTokenChange, onTokenDelete }) {
  if (!category) {
    return (
      <div
        data-testid="token-list-empty"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--color-fg-caption, #616A76)',
        }}
      >
        Select a category to view tokens
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div
        data-testid="token-list-empty"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--color-fg-caption, #616A76)',
        }}
      >
        No tokens in this category
      </div>
    )
  }

  // Handle token update from TokenRow
  const handleTokenUpdate = (tokenId, changes) => {
    if (changes.value !== undefined) {
      onTokenChange?.(tokenId, 'value', changes.value)
    }
  }

  // Handle token delete from TokenRow
  const handleTokenDelete = (tokenId) => {
    onTokenDelete?.(tokenId)
  }

  return (
    <div data-testid="token-list">
      <h2
        style={{
          margin: '0 0 20px 0',
          fontSize: 'var(--font-size-heading-sm, 24px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-fg-heading, #1E2125)',
          textTransform: 'capitalize',
        }}
      >
        {category} Tokens
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {tokens.map(token => (
          <TokenRow 
            key={token.id} 
            token={token}
            onUpdate={handleTokenUpdate}
            onDelete={handleTokenDelete}
            isReadOnly={false}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Preview panel component (placeholder for chunk 3.05)
 */
function PreviewPanel({ tokens, theme }) {
  // Generate CSS variables from tokens
  const cssVariables = tokens.reduce((acc, token) => {
    if (token.css_variable && token.value) {
      let value
      if (token.value.hex) {
        value = token.value.hex
      } else if (token.value.value !== undefined) {
        value = `${token.value.value}${token.value.unit || ''}`
      }
      if (value) {
        acc[token.css_variable] = value
      }
    }
    return acc
  }, {})

  return (
    <div
      data-testid="preview-panel"
      style={cssVariables}
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
          padding: '20px',
          background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
          }}
        >
          Theme: {theme?.name}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-fg-caption, #616A76)',
          }}
        >
          {tokens.length} tokens defined
        </p>
      </div>

      {/* Sample preview elements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-btn-primary-bg, #657E79)',
            color: 'var(--color-btn-primary-fg, #FFFFFF)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-body-md, 16px)',
            textAlign: 'center',
          }}
        >
          Primary Button
        </div>
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-bg-white, #FFFFFF)',
            border: '1px solid var(--color-fg-divider, #D7DCE5)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-body-md, 16px)',
          }}
        >
          Card Element
        </div>
      </div>
    </div>
  )
}

