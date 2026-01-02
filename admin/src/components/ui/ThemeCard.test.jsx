import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeCard from './ThemeCard'

describe('ThemeCard', () => {
  const theme = { name: 'Health SEM', slug: 'theme-health---sem' }
  const defaultProps = {
    theme,
    isActive: false,
    onPreview: vi.fn(),
    onApply: vi.fn()
  }

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

  it('calls onPreview when Preview clicked', () => {
    const onPreview = vi.fn()
    render(<ThemeCard {...defaultProps} onPreview={onPreview} />)
    fireEvent.click(screen.getByText('Preview'))
    expect(onPreview).toHaveBeenCalled()
  })

  it('calls onApply when Apply clicked', () => {
    const onApply = vi.fn()
    render(<ThemeCard {...defaultProps} onApply={onApply} />)
    fireEvent.click(screen.getByText('Apply'))
    expect(onApply).toHaveBeenCalled()
  })

  it('disables Apply button when isActive', () => {
    render(<ThemeCard {...defaultProps} isActive={true} />)
    expect(screen.getByText('Apply')).toBeDisabled()
  })
})





