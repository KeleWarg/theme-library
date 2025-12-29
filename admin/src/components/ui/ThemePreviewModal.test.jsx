import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemePreviewModal from './ThemePreviewModal'

describe('ThemePreviewModal', () => {
  const theme = { name: 'Health SEM', slug: 'theme-health---sem' }
  const defaultProps = {
    isOpen: true,
    theme,
    onClose: vi.fn(),
    onApply: vi.fn()
  }

  it('renders nothing when isOpen is false', () => {
    render(<ThemePreviewModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Health SEM')).not.toBeInTheDocument()
  })

  it('renders nothing when theme is null', () => {
    render(<ThemePreviewModal {...defaultProps} theme={null} />)
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument()
  })

  it('renders theme name when open', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Health SEM')).toBeInTheDocument()
  })

  it('renders button previews', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })

  it('renders typography previews', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Heading Example')).toBeInTheDocument()
  })

  it('renders sample card', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Sample Card')).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders form input', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    expect(screen.getByText('Form Input')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
  })

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn()
    render(<ThemePreviewModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not close when modal content clicked', () => {
    const onClose = vi.fn()
    render(<ThemePreviewModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('modal-content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onApply when Apply button clicked', () => {
    const onApply = vi.fn()
    render(<ThemePreviewModal {...defaultProps} onApply={onApply} />)
    fireEvent.click(screen.getByText('Apply Theme'))
    expect(onApply).toHaveBeenCalled()
  })

  it('applies theme class to modal content', () => {
    render(<ThemePreviewModal {...defaultProps} />)
    const content = screen.getByTestId('modal-content')
    expect(content).toHaveClass('theme-health---sem')
  })
})



