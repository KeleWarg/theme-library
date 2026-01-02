import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader, AlertCircle, RefreshCw } from 'lucide-react'
import { themes as staticThemes } from '../lib/tokenData'
import { getThemes, deleteTheme, duplicateTheme } from '../lib/themeService'
import { useTheme } from '../hooks/useTheme'
import ThemeCard from '../components/ui/ThemeCard'
import ThemePreviewModal from '../components/ui/ThemePreviewModal'
import ThemeSourceModal from '../components/themes/ThemeSourceModal'
import ImportWizard from '../components/themes/import/ImportWizard'
import CreationWizard from '../components/themes/create/CreationWizard'

/**
 * Themes Page - Lists all themes with database integration
 * Chunk 5.01 - Theme Management System
 */
export default function Themes() {
  const navigate = useNavigate()
  const { theme: activeTheme, setTheme } = useTheme()
  
  // Theme data state
  const [themes, setThemes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [previewTheme, setPreviewTheme] = useState(null)
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showImportWizard, setShowImportWizard] = useState(false)
  const [showCreateWizard, setShowCreateWizard] = useState(false)

  // Load themes from database with static fallback
  const loadThemes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try to load from database
      const dbThemes = await getThemes()
      
      if (dbThemes && dbThemes.length > 0) {
        // Transform DB themes to match static theme format
        const transformedDbThemes = dbThemes.map(theme => ({
          id: theme.id,
          name: theme.name,
          slug: theme.slug,
          description: theme.description,
          status: theme.status,
          source: theme.source,
          tokenCount: theme.theme_tokens?.[0]?.count || 0,
          isFromDatabase: true,
          createdAt: theme.created_at,
          updatedAt: theme.updated_at,
        }))
        
        // Merge with static themes (static themes first, then DB themes)
        // Filter out duplicates based on slug
        const staticSlugs = staticThemes.map(t => t.slug)
        const uniqueDbThemes = transformedDbThemes.filter(
          t => !staticSlugs.includes(t.slug)
        )
        
        setThemes([...staticThemes, ...uniqueDbThemes])
      } else {
        // Fallback to static themes only
        setThemes(staticThemes)
      }
    } catch (err) {
      console.warn('Failed to load themes from database, using static themes:', err)
      // On error, still show static themes
      setThemes(staticThemes)
      setError('Could not load themes from database. Showing built-in themes only.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadThemes()
  }, [loadThemes])

  // Handle theme apply
  const handleApply = (theme) => {
    setTheme(theme.slug)
    setPreviewTheme(null)
  }

  // Handle theme edit (navigate to editor for DB themes)
  const handleEdit = (theme) => {
    if (theme.isFromDatabase && theme.id) {
      navigate(`/themes/${theme.id}`)
    }
  }

  // Handle theme delete
  const handleDelete = async (theme) => {
    if (!theme.isFromDatabase || !theme.id) return
    
    try {
      await deleteTheme(theme.id)
      // Refresh the list after deletion
      loadThemes()
    } catch (err) {
      console.error('Failed to delete theme:', err)
      setError('Failed to delete theme. Please try again.')
    }
  }

  // Handle theme duplicate
  const handleDuplicate = async (theme) => {
    if (!theme.isFromDatabase || !theme.id) return
    
    try {
      const newName = `${theme.name} (Copy)`
      const newTheme = await duplicateTheme(theme.id, newName)
      // Refresh the list to show the duplicated theme
      loadThemes()
      // Navigate to the new theme editor
      if (newTheme?.id) {
        navigate(`/themes/${newTheme.id}`)
      }
    } catch (err) {
      console.error('Failed to duplicate theme:', err)
      setError('Failed to duplicate theme. Please try again.')
    }
  }

  // Source modal handlers
  const handleCreateClick = () => {
    setShowSourceModal(true)
  }

  const handleSourceSelect = (source) => {
    setShowSourceModal(false)
    if (source === 'import') {
      setShowImportWizard(true)
    } else if (source === 'create') {
      setShowCreateWizard(true)
    }
  }

  // Wizard completion handlers
  const handleImportComplete = (newTheme) => {
    setShowImportWizard(false)
    // Refresh the list to show the new theme
    loadThemes()
    // Optionally navigate to editor
    if (newTheme?.id) {
      navigate(`/themes/${newTheme.id}`)
    }
  }

  const handleCreateComplete = (newTheme) => {
    setShowCreateWizard(false)
    // Refresh the list to show the new theme
    loadThemes()
    // Optionally navigate to editor
    if (newTheme?.id) {
      navigate(`/themes/${newTheme.id}`)
    }
  }

  return (
    <div>
      {/* Header with Create button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div style={{ pointerEvents: 'none' }}>
          <h2
            style={{
              color: 'var(--color-fg-heading)',
              fontSize: 'var(--font-size-heading-md)',
              marginBottom: '8px',
            }}
          >
            Themes
          </h2>
          <p
            style={{
              color: 'var(--color-fg-caption)',
              fontSize: 'var(--font-size-body-md)',
              margin: 0,
            }}
          >
            Preview and apply different color themes to the design system.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          data-testid="create-theme-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontSize: 'var(--font-size-body-md, 16px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            background: 'var(--color-btn-primary-bg, #657E79)',
            color: 'var(--color-btn-primary-fg, #FFFFFF)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-btn-primary-hover-bg, #526964)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-btn-primary-bg, #657E79)'
          }}
        >
          <Plus size={18} />
          Create Theme
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          data-testid="error-message"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            background: 'rgba(235, 64, 21, 0.08)',
            border: '1px solid var(--color-fg-feedback-warning, #EDA215)',
            borderRadius: '8px',
          }}
        >
          <AlertCircle
            size={20}
            style={{
              color: 'var(--color-fg-feedback-warning, #EDA215)',
              flexShrink: 0,
            }}
          />
          <p
            style={{
              flex: 1,
              margin: 0,
              fontSize: 'var(--font-size-body-sm, 14px)',
              color: 'var(--color-fg-body, #383C43)',
            }}
          >
            {error}
          </p>
          <button
            onClick={loadThemes}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              background: 'transparent',
              color: 'var(--color-fg-link, #657E79)',
              border: '1px solid var(--color-fg-stroke-default, #BFC7D4)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div
          data-testid="loading-state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px',
            gap: '16px',
          }}
        >
          <Loader
            size={32}
            style={{
              animation: 'spin 1s linear infinite',
              color: 'var(--color-btn-primary-bg, #657E79)',
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-body-md, 16px)',
              color: 'var(--color-fg-caption, #616A76)',
            }}
          >
            Loading themes...
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        /* Theme cards grid - 3 columns */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {themes.map((theme) => (
            <ThemeCard
              key={theme.slug || theme.id}
              theme={theme}
              isActive={activeTheme === theme.slug}
              onPreview={() => setPreviewTheme(theme)}
              onApply={() => handleApply(theme)}
              onEdit={theme.isFromDatabase ? () => handleEdit(theme) : undefined}
              onDelete={theme.isFromDatabase ? () => handleDelete(theme) : undefined}
              onDuplicate={theme.isFromDatabase ? () => handleDuplicate(theme) : undefined}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && themes.length === 0 && (
        <div
          data-testid="empty-state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px',
            background: 'var(--color-bg-neutral-subtle, #F4F5F8)',
            borderRadius: '12px',
            gap: '16px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-body-lg, 18px)',
              color: 'var(--color-fg-heading, #1E2125)',
              fontWeight: 'var(--font-weight-medium, 500)',
            }}
          >
            No themes yet
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-body-md, 16px)',
              color: 'var(--color-fg-caption, #616A76)',
            }}
          >
            Create your first theme to get started.
          </p>
          <button
            onClick={handleCreateClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px',
              padding: '12px 20px',
              fontSize: 'var(--font-size-body-md, 16px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              background: 'var(--color-btn-primary-bg, #657E79)',
              color: 'var(--color-btn-primary-fg, #FFFFFF)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Create Theme
          </button>
        </div>
      )}

      {/* Preview Modal */}
      <ThemePreviewModal
        isOpen={previewTheme !== null}
        theme={previewTheme}
        onClose={() => setPreviewTheme(null)}
        onApply={() => handleApply(previewTheme)}
      />

      {/* Source Selection Modal */}
      <ThemeSourceModal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        onSelectImport={() => handleSourceSelect('import')}
        onSelectCreate={() => handleSourceSelect('create')}
      />

      {/* Import Wizard */}
      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onComplete={handleImportComplete}
        existingThemes={themes}
      />

      {/* Creation Wizard */}
      <CreationWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onComplete={handleCreateComplete}
        existingThemes={themes}
      />
    </div>
  )
}
