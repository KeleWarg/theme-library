import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeSourceModal from './ThemeSourceModal'

describe('ThemeSourceModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectImport: vi.fn(),
    onSelectCreate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    render(<ThemeSourceModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('theme-source-modal')).not.toBeInTheDocument()
  })

  it('renders modal when isOpen is true', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    expect(screen.getByTestId('theme-source-modal')).toBeInTheDocument()
  })

  it('shows correct title', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    expect(screen.getByText('Create New Theme')).toBeInTheDocument()
  })

  it('shows description text', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    expect(screen.getByText("Choose how you'd like to create your design system theme.")).toBeInTheDocument()
  })

  it('shows both option cards', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    expect(screen.getByTestId('import-option')).toBeInTheDocument()
    expect(screen.getByTestId('create-option')).toBeInTheDocument()
  })

  it('shows import option with correct content', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    expect(screen.getByText('Import from JSON')).toBeInTheDocument()
    expect(screen.getByText('Upload a Figma Variables export or existing token file')).toBeInTheDocument()
  })

  it('shows create option with correct content', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    expect(screen.getByText('Create from Scratch')).toBeInTheDocument()
    expect(screen.getByText('Build a new design system with guided setup')).toBeInTheDocument()
  })

  it('calls onSelectImport when import card is clicked', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('import-option'))
    expect(defaultProps.onSelectImport).toHaveBeenCalledTimes(1)
  })

  it('calls onSelectCreate when create card is clicked', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('create-option'))
    expect(defaultProps.onSelectCreate).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('theme-source-modal'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when modal content is clicked', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('modal-content'))
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when X button is clicked', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('close-button'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key press', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.keyDown(screen.getByTestId('theme-source-modal'), { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on other key press', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    fireEvent.keyDown(screen.getByTestId('theme-source-modal'), { key: 'Enter' })
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    const modal = screen.getByTestId('theme-source-modal')
    expect(modal).toHaveAttribute('role', 'dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'theme-source-title')
  })

  it('has accessible close button', () => {
    render(<ThemeSourceModal {...defaultProps} />)
    const closeButton = screen.getByTestId('close-button')
    expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
  })
})

