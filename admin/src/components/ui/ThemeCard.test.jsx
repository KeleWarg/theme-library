import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeCard from './ThemeCard'

describe('ThemeCard', () => {
  const staticTheme = { name: 'Health SEM', slug: 'theme-health---sem' }
  const databaseTheme = { 
    id: '123-456', 
    name: 'Custom Theme', 
    slug: 'theme-custom',
    status: 'draft',
    isFromDatabase: true 
  }
  
  const defaultProps = {
    theme: staticTheme,
    isActive: false,
    onPreview: vi.fn(),
    onApply: vi.fn()
  }

  // ============================================================================
  // BASIC RENDERING TESTS
  // ============================================================================

  it('renders theme name', () => {
    render(<ThemeCard {...defaultProps} />)
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
  })

  it('renders color swatches', () => {
    render(<ThemeCard {...defaultProps} />)
    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('shows active badge when isActive', () => {
    render(<ThemeCard {...defaultProps} isActive={true} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('does not show active badge when not active', () => {
    render(<ThemeCard {...defaultProps} isActive={false} />)
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
  })

  // ============================================================================
  // PREVIEW AND APPLY TESTS
  // ============================================================================

  it('calls onPreview when Preview clicked', () => {
    const onPreview = vi.fn()
    render(<ThemeCard {...defaultProps} onPreview={onPreview} />)
    fireEvent.click(screen.getByTestId('preview-button'))
    expect(onPreview).toHaveBeenCalled()
  })

  it('calls onApply when Apply clicked', () => {
    const onApply = vi.fn()
    render(<ThemeCard {...defaultProps} onApply={onApply} />)
    fireEvent.click(screen.getByTestId('apply-button'))
    expect(onApply).toHaveBeenCalled()
  })

  it('disables Apply button when isActive', () => {
    render(<ThemeCard {...defaultProps} isActive={true} />)
    expect(screen.getByTestId('apply-button')).toBeDisabled()
  })

  // ============================================================================
  // MENU BUTTON TESTS (Chunk 5.02)
  // ============================================================================

  describe('Actions Menu', () => {
    it('renders menu button for database themes', () => {
      render(<ThemeCard {...defaultProps} theme={databaseTheme} />)
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })

    it('does not render menu button for static themes', () => {
      render(<ThemeCard {...defaultProps} theme={staticTheme} />)
      expect(screen.queryByTestId('menu-button')).not.toBeInTheDocument()
    })

    it('menu opens on click', () => {
      render(<ThemeCard {...defaultProps} theme={databaseTheme} />)
      
      expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('menu-button'))
      
      expect(screen.getByTestId('actions-menu')).toBeInTheDocument()
    })

    it('menu closes when clicking menu button again', () => {
      render(<ThemeCard {...defaultProps} theme={databaseTheme} />)
      
      const menuButton = screen.getByTestId('menu-button')
      
      fireEvent.click(menuButton)
      expect(screen.getByTestId('actions-menu')).toBeInTheDocument()
      
      fireEvent.click(menuButton)
      expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument()
    })

    it('shows Edit, Duplicate, and Delete actions in menu', () => {
      render(<ThemeCard {...defaultProps} theme={databaseTheme} />)
      
      fireEvent.click(screen.getByTestId('menu-button'))
      
      expect(screen.getByTestId('edit-action')).toBeInTheDocument()
      expect(screen.getByTestId('duplicate-action')).toBeInTheDocument()
      expect(screen.getByTestId('delete-action')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // EDIT ACTION TESTS (Chunk 5.02)
  // ============================================================================

  describe('Edit Action', () => {
    it('calls onEdit when Edit clicked', () => {
      const onEdit = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onEdit={onEdit}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('edit-action'))
      
      expect(onEdit).toHaveBeenCalled()
    })

    it('closes menu after Edit clicked', () => {
      const onEdit = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onEdit={onEdit}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('edit-action'))
      
      expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // DUPLICATE ACTION TESTS (Chunk 5.02)
  // ============================================================================

  describe('Duplicate Action', () => {
    it('calls onDuplicate when Duplicate clicked', () => {
      const onDuplicate = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDuplicate={onDuplicate}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('duplicate-action'))
      
      expect(onDuplicate).toHaveBeenCalled()
    })

    it('closes menu after Duplicate clicked', () => {
      const onDuplicate = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDuplicate={onDuplicate}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('duplicate-action'))
      
      expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // DELETE ACTION TESTS (Chunk 5.02)
  // ============================================================================

  describe('Delete Action', () => {
    it('shows confirmation dialog when Delete clicked', () => {
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={vi.fn()}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
    })

    it('shows theme name in confirmation dialog', () => {
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={vi.fn()}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      
      // Theme name appears both in card title and confirmation - verify there are 2 occurrences
      const themeNameElements = screen.getAllByText(/Custom Theme/)
      expect(themeNameElements.length).toBe(2) // Card title + confirmation message
    })

    it('closes confirmation when Cancel clicked', () => {
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={vi.fn()}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('cancel-delete-button'))
      
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument()
    })

    it('calls onDelete after confirmation', () => {
      const onDelete = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={onDelete}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      fireEvent.click(screen.getByTestId('confirm-delete-button'))
      
      expect(onDelete).toHaveBeenCalled()
    })

    it('does not call onDelete if Cancel clicked', () => {
      const onDelete = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={onDelete}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      fireEvent.click(screen.getByTestId('cancel-delete-button'))
      
      expect(onDelete).not.toHaveBeenCalled()
    })

    it('closes confirmation dialog after delete confirmed', () => {
      const onDelete = vi.fn()
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={onDelete}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      fireEvent.click(screen.getByTestId('confirm-delete-button'))
      
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument()
    })

    it('closes confirmation when clicking overlay', () => {
      render(
        <ThemeCard 
          {...defaultProps} 
          theme={databaseTheme}
          onDelete={vi.fn()}
        />
      )
      
      fireEvent.click(screen.getByTestId('menu-button'))
      fireEvent.click(screen.getByTestId('delete-action'))
      
      fireEvent.click(screen.getByTestId('delete-confirm-overlay'))
      
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // STATUS BADGE TESTS (Chunk 5.02)
  // ============================================================================

  describe('Status Badge', () => {
    it('shows status badge for database themes', () => {
      render(<ThemeCard {...defaultProps} theme={databaseTheme} />)
      expect(screen.getByTestId('status-badge')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('shows Published status correctly', () => {
      const publishedTheme = { ...databaseTheme, status: 'published' }
      render(<ThemeCard {...defaultProps} theme={publishedTheme} />)
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    it('does not show status badge for static themes', () => {
      render(<ThemeCard {...defaultProps} theme={staticTheme} />)
      expect(screen.queryByTestId('status-badge')).not.toBeInTheDocument()
    })
  })
})
