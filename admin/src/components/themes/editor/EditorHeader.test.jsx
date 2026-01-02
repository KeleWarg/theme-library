import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import EditorHeader from './EditorHeader'

// Wrapper component to provide router context
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  )
}

describe('EditorHeader', () => {
  const mockTheme = {
    id: 'theme-123',
    name: 'Test Theme',
    status: 'draft',
  }

  const defaultProps = {
    theme: mockTheme,
    hasUnsavedChanges: false,
    isSaving: false,
    canUndo: false,
    canRedo: false,
    onSave: vi.fn(),
    onPublish: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onNameChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the header', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('editor-header')).toBeInTheDocument()
    })

    it('displays theme name', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('theme-name')).toHaveTextContent('Test Theme')
    })

    it('displays status badge', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Draft')
    })

    it('renders back button', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('back-button')).toBeInTheDocument()
    })

    it('renders save button', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('save-button')).toBeInTheDocument()
    })

    it('renders publish button', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('publish-button')).toBeInTheDocument()
    })

    it('renders undo/redo buttons', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('undo-button')).toBeInTheDocument()
      expect(screen.getByTestId('redo-button')).toBeInTheDocument()
    })
  })

  describe('Status Badge', () => {
    it('shows Draft for draft status', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Draft')
    })

    it('shows Published for published status', () => {
      const props = {
        ...defaultProps,
        theme: { ...mockTheme, status: 'published' },
      }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Published')
    })

    it('shows Archived for archived status', () => {
      const props = {
        ...defaultProps,
        theme: { ...mockTheme, status: 'archived' },
      }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Archived')
    })
  })

  describe('Unsaved Changes', () => {
    it('shows unsaved indicator when hasUnsavedChanges is true', () => {
      const props = { ...defaultProps, hasUnsavedChanges: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('unsaved-indicator')).toBeInTheDocument()
    })

    it('hides unsaved indicator when hasUnsavedChanges is false', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.queryByTestId('unsaved-indicator')).not.toBeInTheDocument()
    })
  })

  describe('Save Button', () => {
    it('is disabled when no unsaved changes', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('is enabled when there are unsaved changes', () => {
      const props = { ...defaultProps, hasUnsavedChanges: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('save-button')).not.toBeDisabled()
    })

    it('is disabled when saving', () => {
      const props = { ...defaultProps, hasUnsavedChanges: true, isSaving: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('shows "Saving..." when saving', () => {
      const props = { ...defaultProps, hasUnsavedChanges: true, isSaving: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('save-button')).toHaveTextContent('Saving...')
    })

    it('calls onSave when clicked', async () => {
      const user = userEvent.setup()
      const props = { ...defaultProps, hasUnsavedChanges: true }
      renderWithRouter(<EditorHeader {...props} />)
      
      await user.click(screen.getByTestId('save-button'))
      expect(props.onSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Publish Button', () => {
    it('is enabled when draft and no unsaved changes', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('publish-button')).not.toBeDisabled()
    })

    it('is disabled when already published', () => {
      const props = {
        ...defaultProps,
        theme: { ...mockTheme, status: 'published' },
      }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('publish-button')).toBeDisabled()
    })

    it('is disabled when there are unsaved changes', () => {
      const props = { ...defaultProps, hasUnsavedChanges: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('publish-button')).toBeDisabled()
    })

    it('calls onPublish when clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditorHeader {...defaultProps} />)
      
      await user.click(screen.getByTestId('publish-button'))
      expect(defaultProps.onPublish).toHaveBeenCalledTimes(1)
    })
  })

  describe('Undo/Redo', () => {
    it('undo button is disabled when canUndo is false', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('undo-button')).toBeDisabled()
    })

    it('undo button is enabled when canUndo is true', () => {
      const props = { ...defaultProps, canUndo: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('undo-button')).not.toBeDisabled()
    })

    it('redo button is disabled when canRedo is false', () => {
      renderWithRouter(<EditorHeader {...defaultProps} />)
      expect(screen.getByTestId('redo-button')).toBeDisabled()
    })

    it('redo button is enabled when canRedo is true', () => {
      const props = { ...defaultProps, canRedo: true }
      renderWithRouter(<EditorHeader {...props} />)
      expect(screen.getByTestId('redo-button')).not.toBeDisabled()
    })

    it('calls onUndo when undo clicked', async () => {
      const user = userEvent.setup()
      const props = { ...defaultProps, canUndo: true }
      renderWithRouter(<EditorHeader {...props} />)
      
      await user.click(screen.getByTestId('undo-button'))
      expect(props.onUndo).toHaveBeenCalledTimes(1)
    })

    it('calls onRedo when redo clicked', async () => {
      const user = userEvent.setup()
      const props = { ...defaultProps, canRedo: true }
      renderWithRouter(<EditorHeader {...props} />)
      
      await user.click(screen.getByTestId('redo-button'))
      expect(props.onRedo).toHaveBeenCalledTimes(1)
    })
  })

  describe('Theme Name Editing', () => {
    it('shows input when name is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditorHeader {...defaultProps} />)
      
      await user.click(screen.getByTestId('theme-name'))
      expect(screen.getByTestId('theme-name-input')).toBeInTheDocument()
    })

    it('calls onNameChange on blur with new name', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditorHeader {...defaultProps} />)
      
      await user.click(screen.getByTestId('theme-name'))
      const input = screen.getByTestId('theme-name-input')
      await user.clear(input)
      await user.type(input, 'New Name')
      fireEvent.blur(input)
      
      expect(defaultProps.onNameChange).toHaveBeenCalledWith('New Name')
    })

    it('calls onNameChange on Enter key', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditorHeader {...defaultProps} />)
      
      await user.click(screen.getByTestId('theme-name'))
      const input = screen.getByTestId('theme-name-input')
      await user.clear(input)
      await user.type(input, 'Enter Name{Enter}')
      
      expect(defaultProps.onNameChange).toHaveBeenCalled()
    })

    it('cancels edit on Escape key', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditorHeader {...defaultProps} />)
      
      await user.click(screen.getByTestId('theme-name'))
      const input = screen.getByTestId('theme-name-input')
      await user.clear(input)
      await user.type(input, 'Should Cancel{Escape}')
      
      expect(defaultProps.onNameChange).not.toHaveBeenCalled()
      expect(screen.getByTestId('theme-name')).toHaveTextContent('Test Theme')
    })
  })
})

