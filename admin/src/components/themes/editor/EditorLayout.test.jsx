import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditorLayout from './EditorLayout'

describe('EditorLayout', () => {
  const defaultProps = {
    sidebar: <div data-testid="sidebar-content">Sidebar Content</div>,
    editor: <div data-testid="editor-content">Editor Content</div>,
    preview: <div data-testid="preview-content">Preview Content</div>,
    showPreview: true,
    onTogglePreview: vi.fn(),
  }

  describe('Rendering', () => {
    it('renders the layout container', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('editor-layout')).toBeInTheDocument()
    })

    it('renders sidebar section', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument()
    })

    it('renders main editor section', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('editor-main')).toBeInTheDocument()
    })

    it('renders preview section', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('editor-preview')).toBeInTheDocument()
    })

    it('renders sidebar content', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    })

    it('renders editor content', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('renders preview content when showPreview is true', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('preview-content')).toBeInTheDocument()
    })
  })

  describe('Placeholders', () => {
    it('renders sidebar placeholder when no sidebar content', () => {
      render(<EditorLayout {...defaultProps} sidebar={null} />)
      expect(screen.getByTestId('sidebar-placeholder')).toBeInTheDocument()
    })

    it('renders editor placeholder when no editor content', () => {
      render(<EditorLayout {...defaultProps} editor={null} />)
      expect(screen.getByTestId('editor-placeholder')).toBeInTheDocument()
    })

    it('renders preview placeholder when no preview content', () => {
      render(<EditorLayout {...defaultProps} preview={null} />)
      expect(screen.getByTestId('preview-placeholder')).toBeInTheDocument()
    })
  })

  describe('Preview Toggle', () => {
    it('renders preview toggle button', () => {
      render(<EditorLayout {...defaultProps} />)
      expect(screen.getByTestId('preview-toggle')).toBeInTheDocument()
    })

    it('calls onTogglePreview when toggle clicked', async () => {
      const user = userEvent.setup()
      render(<EditorLayout {...defaultProps} />)
      
      await user.click(screen.getByTestId('preview-toggle'))
      expect(defaultProps.onTogglePreview).toHaveBeenCalledTimes(1)
    })

    it('hides preview content when showPreview is false', () => {
      render(<EditorLayout {...defaultProps} showPreview={false} />)
      expect(screen.queryByTestId('preview-content')).not.toBeInTheDocument()
    })

    it('shows floating toggle when preview is hidden', () => {
      render(<EditorLayout {...defaultProps} showPreview={false} />)
      expect(screen.getByTestId('preview-toggle-floating')).toBeInTheDocument()
    })

    it('hides floating toggle when preview is visible', () => {
      render(<EditorLayout {...defaultProps} showPreview={true} />)
      expect(screen.queryByTestId('preview-toggle-floating')).not.toBeInTheDocument()
    })

    it('calls onTogglePreview from floating button', async () => {
      const user = userEvent.setup()
      const onToggle = vi.fn()
      render(<EditorLayout {...defaultProps} showPreview={false} onTogglePreview={onToggle} />)
      
      await user.click(screen.getByTestId('preview-toggle-floating'))
      expect(onToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('Layout Dimensions', () => {
    it('sidebar has fixed width', () => {
      render(<EditorLayout {...defaultProps} />)
      const sidebar = screen.getByTestId('editor-sidebar')
      expect(sidebar).toHaveStyle({ width: '240px' })
    })

    it('preview panel has width when visible', () => {
      render(<EditorLayout {...defaultProps} showPreview={true} />)
      const preview = screen.getByTestId('editor-preview')
      expect(preview).toHaveStyle({ width: '360px' })
    })

    it('preview panel has zero width when hidden', () => {
      render(<EditorLayout {...defaultProps} showPreview={false} />)
      const preview = screen.getByTestId('editor-preview')
      expect(preview).toHaveStyle({ width: '0px' })
    })
  })
})

